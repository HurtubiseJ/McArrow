import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { View, Text, StyleSheet, Platform, Pressable, Alert } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useRouter, useFocusEffect } from 'expo-router'
import * as Location from 'expo-location'
import Arrow from '@/components/arrow2d'
import { calcBearing, getNearestLocation, haversineDistance } from '@/lib/locationUtil'
import { runOnJS } from 'react-native-reanimated';
import { LocationsCtx } from './_layout'

export default function HomeScreen() {
  const router = useRouter()

  // Paging
  const [screenIndex, setScreenIndex] = useState(0)
  const swipeEnabled = useRef(true)
  const goLeft  = useCallback(() => setScreenIndex(i => Math.max(i - 1, 0)), [])
  const goRight = useCallback(() => setScreenIndex(i => Math.min(i + 1, locations.length - 1)), [])

  // Tracking + timer
  const [tracking, setTracking] = useState(false)
  const [seconds, setSeconds]   = useState(0)
  const timerId = useRef<number|null>(null)
  const [arrived, setArrived]   = useState(false)
  const [path, setPath]         = useState<{latitude:number,longitude:number}[]>([])

  // Raw and derived location state
  const [userLat,  setUserLat]  = useState<number|null>(null)
  const [userLng,  setUserLng]  = useState<number|null>(null)
  const [destLat,  setDestLat]  = useState<number|null>(null)
  const [destLng,  setDestLng]  = useState<number|null>(null)
  const [bearing,  setBearing]  = useState<number|null>(null)
  const [heading,  setHeading]  = useState(0)
  const [distance, setDistance] = useState<number|null>(null)

  // See _layout.tsx
  const { locations } = React.useContext(LocationsCtx);

  // Ask permission & grab user location, start 5s polling
  useEffect(() => {
    let interval: number
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Location permission required')
        return
      }

      const loc = await Location.getCurrentPositionAsync({})
      setUserLat(loc.coords.latitude)
      setUserLng(loc.coords.longitude)

      //TODO: Change from interval to subscription (Location.startLocationUpdatesAsync(taskName, options)
      interval = setInterval(async () => {
        const { coords } = await Location.getCurrentPositionAsync({})
        setUserLat(coords.latitude)
        setUserLng(coords.longitude)

        if (tracking) {
          setPath(p => p.concat({ latitude: coords.latitude, longitude: coords.longitude }))
        }
      }, 5000)
    })()
    return () => clearInterval(interval)
  }, [tracking])

  // Once we have user coords, geocode the current target
  useEffect(() => {
    if (userLat == null || userLng == null) return
    let cancelled = false
    ;(async () => {
      const [name] = locations[screenIndex]
      const res = await getNearestLocation(userLat, userLng, name)
      if (!cancelled && res) {
        setDestLat(res.lat)
        setDestLng(res.lng)
      }
    })()
    return () => { cancelled = true }
  }, [userLat, userLng, screenIndex])

  // Compute bearing + distance as soon as all four coords are non-null
  useEffect(() => {
    if (userLat  == null || userLng  == null || destLat  == null || destLng  == null) {
      setBearing(null)
      setDistance(null)
      return
    }
    setBearing(calcBearing(userLat, userLng, destLat, destLng))

    const distance = haversineDistance(userLat, userLng, destLat, destLng)

    setDistance(distance)
  }, [userLat, userLng, destLat, destLng])

  // Arrival trigger
  useEffect(() => {
    if (tracking && distance != null && distance < 0.08) {
      setArrived(true)
    }
  }, [distance, tracking])

  // Heading sensor
  useEffect(() => {
    let sub: Location.LocationSubscription
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return
      sub = await Location.watchHeadingAsync(h => setHeading(h.trueHeading ?? h.magHeading))
    })()
    return () => sub?.remove()
  }, [])

  // Navigate to map on arrival
  useEffect(() => {
    if (!arrived || destLat == null || destLng == null || path.length === 0) return
    stopTimer()
    swipeEnabled.current = true
    router.push({
      pathname: '/map',
      params: {
        path: JSON.stringify(path),
        color: locations[screenIndex][1],
        name: locations[screenIndex][0],
        startLocation: JSON.stringify(path[0]), // Devote var to start location? 
        endLocation: JSON.stringify({ latitude: destLat, longitude: destLng }),
        seconds: JSON.stringify(seconds),
      },
    })
  }, [arrived, destLat, destLng, path])

  // Reset if user comes back
  useFocusEffect(useCallback(() => {
    return () => {
      stopTimer()
      setTracking(false)
      swipeEnabled.current = true
      setSeconds(0)
      setArrived(false)
      setPath([])
    }
  }, []))

  function goToAddLocation () {
    router.push("/addLocation");
  }

  // Gesture to swipe between targets
  const panGesture = useMemo(() => Gesture.Pan().onEnd(({ translationX, translationY }) => {
    'worklet'
    console.log("translation X")
    console.log(translationX)
    console.log(translationY)
    if (tracking) return
    if (translationX < -50) runOnJS(goRight)()
    else if (translationX > 50) runOnJS(goLeft)()
    else if (translationY > 50) runOnJS(goToAddLocation)()
  }), [tracking])

  // Timer control helpers
  const startTimer = () => {
    setSeconds(0);
    timerId.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }
  const stopTimer = () => {
    if (timerId.current) {
      clearInterval(timerId.current)
      timerId.current = null
    }
  }

  // Show loading until all coords + bearing are ready
  if (bearing == null) {
    return <Loading text="Loading… :)" />
  }

  // render arrow UI
  const arrowAngle = ((bearing - heading) + 360) % 360
  const [, destColor] = locations[screenIndex]
  const name = locations[screenIndex][0]

  return (
    <GestureDetector gesture={panGesture}>
      <Pressable
        style={styles.arrowOverlay}
        onPress={() => {
          if (!tracking) {
            setTracking(true)
            swipeEnabled.current = false
            startTimer()
          }
        }}
      >
        <View style={styles.arrowStack}>
          <Arrow color={destColor} bearing={arrowAngle} size={80} label={name} />
        </View>
        {tracking && (
          <>
            <Text style={styles.timer}>
              {String(Math.floor(seconds/60)).padStart(2,'0')}:
              {String(seconds%60).padStart(2,'0')}
            </Text>
            <Pressable
              style={styles.stopButton}
              onPress={() => {
                stopTimer()
                setSeconds(0)
                setTracking(false)
                swipeEnabled.current = true
                setArrived(false)
                setPath([])
              }}
            >
              <Text style={styles.stopButtonText}>STOP</Text>
            </Pressable>
          </>
        )}
      </Pressable>
    </GestureDetector>
  )
}

function Loading({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.loadText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  arrowOverlay: { 
    flex:1, 
    justifyContent:'center', 
    alignItems:'center' 
  },
  arrowStack:   { 
    alignItems:'center', 
    justifyContent:'center'
  },
  timer: { 
    position:'absolute', 
    top:80, 
    right:34, 
    fontSize:18 
  },
  stopButton: {
    position:'absolute', 
    top:40, 
    right:30,
    backgroundColor:'#ff3b30', 
    padding:8, 
    borderRadius:20,
    shadowColor:'#000', 
    shadowOffset:{width:0,height:1},
    shadowOpacity:.3, 
    shadowRadius:2
  },
  stopButtonText:{ 
    color:'white', 
    fontWeight:'bold', 
    fontSize:14 
  },
  container: { flex:1, justifyContent:'center', alignItems:'center' },
  loadText: { fontSize:16 },
})
