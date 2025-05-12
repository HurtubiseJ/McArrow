import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import Arrow from '@/components/arrow2d';
import calcBearing, { getNearestLocation } from '@/lib/locationUtil';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { runOnJS } from 'react-native-reanimated';
import { useMemo } from 'react';


/* constants */

const LOCATIONS = [
  ['McDonalds', '#ed2828'],
  ['Taco Bell', '#af22d6'],
  ['Jersey Mikes', '#4287f5'],
  ['Culvers', '#00aaff'],
  ['Laird Stadium', '#000000'],
  ['Dairy Queen', '#000000'],
  ['Carleton College Baseball Field', '#000000'],
  ['Gould Library Carleton College', '#000000'],
] as const;

/* component */

export default function HomeScreen() {
  const router = useRouter();

  /* paging  */
  const [screenIndex, setScreenIndex] = useState(0);
  const swipeEnabledRef = useRef(true); 

  const goLeft  = useCallback(() => setScreenIndex(i => Math.max(i - 1, 0)), []);
  const goRight = useCallback(() => setScreenIndex(i => Math.min(i + 1, LOCATIONS.length - 1)), []);

  
  /* tracking + timer  */
  const [tracking,   setTracking]   = useState(false);
  const [seconds,    setSeconds]    = useState(0);
  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const [arrived,    setArrived]    = useState(false);
  const [path,       setPath]       = useState<{ latitude: number; longitude: number }[]>([]);
  
  /* user + destination coords  */
  const [userLat,  setUserLat]  = useState<number | null>(null);
  const [userLng,  setUserLng]  = useState<number | null>(null);
  const [destLat,  setDestLat]  = useState<number>();
  const [destLng,  setDestLng]  = useState<number>();
  const [bearing,  setBearing]  = useState<number>();
  const [heading,  setHeading]  = useState(0);
  const [distance, setDistance] = useState(999);
  
  const panGesture = useMemo(
      () =>
        Gesture.Pan().onEnd(({ translationX }) => {
          'worklet';
          if (tracking || Math.abs(translationX) < 50) return;
    
          if (translationX < -50) {
            runOnJS(goRight)();
          } else if (translationX > 50) {
            runOnJS(goLeft)();
          }
        }),
      [tracking],           
  );
  /*  helpers  */

  const startTimer = () => {
    timerId.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stopTimer = () => {
    if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;         
    }
  };

  const resetState = () => {
    stopTimer();
    setTracking(false);
    swipeEnabledRef.current = true;
    setSeconds(0);
    setArrived(false);
    setPath([]);
  };

  /* GPS poll every 5 s */

  useEffect(() => {
    const poll = async () => {
      if (Platform.OS === 'android' && !Device.isDevice) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setUserLat(latitude);
      setUserLng(longitude);

      /* save to path only while tracking */
      setPath(p => (tracking ? p.concat({ latitude, longitude }) : p));
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [tracking]);

  /* destination lookup when page changes */

  useEffect(() => {
    if (!userLat || !userLng) return;
    (async () => {
      const [name] = LOCATIONS[screenIndex];
      const res = await getNearestLocation(userLat, userLng, name);
      if (!res) return;
      setDestLat(res.lat);
      setDestLng(res.lng);
    })();
  }, [screenIndex, userLat, userLng]);

  /* bearing + distance */

  useEffect(() => {
    if (userLat == null || userLng == null || destLat == null || destLng == null)
      return;

    setBearing(calcBearing(userLat, userLng, destLat, destLng));

    const toRad = (d: number) => (d * Math.PI) / 180;
    const d =
      2 *
      6371 *
      Math.asin(
        Math.sqrt(
          Math.sin((toRad(destLat) - toRad(userLat)) / 2) ** 2 +
            Math.cos(toRad(userLat)) *
              Math.cos(toRad(destLat)) *
              Math.sin((toRad(destLng) - toRad(userLng)) / 2) ** 2,
        ),
      );

    setDistance(d);
  }, [userLat, userLng, destLat, destLng]);

  /* arrival trigger */

  useEffect(() => {
    if (!tracking) return;
    if (distance < 0.22) setArrived(true);
  }, [distance, tracking]);

  /* stop button while tracking */
  useEffect(() => {
    if (!tracking) return;
    const onPress = () => {
      stopTimer();
      setTracking(false);
      setArrived(false);
      setPath([]);
      swipeEnabledRef.current = true;
    };
  }, [tracking]);

  /* heading sensor */

  useEffect(() => {
    let sub: Location.LocationSubscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchHeadingAsync(h =>
        setHeading(h.trueHeading ?? h.magHeading),
      );
    })();
    return () => sub?.remove();
  }, []);

  /* navigate to map on arrival */

  useEffect(() => {
    if (!arrived) return;
    stopTimer();
    swipeEnabledRef.current = true;

    router.push({
      pathname: '/map',
      params: {
        path: JSON.stringify(path),
        color: LOCATIONS[screenIndex][1],
        name: LOCATIONS[screenIndex][0],
      },
    });
  }, [arrived]);

  /* reset when user comes back */

  useFocusEffect(
    useCallback(() => {
      return () => resetState(); 
    }, []),
  );

  /* render  */

  if (
    userLat == null ||
    userLng == null ||
    destLat == null ||
    destLng == null ||
    bearing == null
  )
    return <Loading text="Bootstrapping…" />;

  const arrowAngle = ((bearing - heading) + 360) % 360;
  const [, destColor] = LOCATIONS[screenIndex];
  const name = LOCATIONS[screenIndex][0];

  /* arrow screen */
  return (
    // <GestureDetector gesture={panGesture}>
    //   <Pressable
    //     style={styles.arrowOverlay}
    //     onPress={() => {
    //       if (!tracking) {
    //         setTracking(true);
    //         swipeEnabledRef.current = false;
    //         startTimer();
    //       } else {
    //         stopTimer();
    //         setTracking(false);
    //         swipeEnabledRef.current = true;
    //       }
    //     }}>
    //     {tracking && (
    //       <Text style={styles.timer}>
    //         {String(Math.floor(seconds / 60)).padStart(2, '0')}:
    //         {String(seconds % 60).padStart(2, '0')}
    //       </Text>
    //     )}
    //     <Arrow color={destColor} bearing={arrowAngle} size={80} label={name} />
    //   </Pressable>
    // </GestureDetector>

    <GestureDetector gesture={panGesture}>
    <Pressable
    style={styles.arrowOverlay}
    onPress={() => {
        if (!tracking) {
        setTracking(true);
        swipeEnabledRef.current = false;
        startTimer();
        } 
        // OLD CODE USED TO STOP TRACKING ON PRESS 
        // else {
        // stopTimer();
        // setTracking(false);
        // swipeEnabledRef.current = true;
        // }
    }}
    >
    <View style={styles.arrowStack}>
        <Arrow color={destColor} bearing={arrowAngle} size={80} label={name} />
        {/* {tracking && (
        <Text style={styles.timer}>
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:
            {String(seconds % 60).padStart(2, '0')}
        </Text>
        )} */}
    </View>

    <View style={styles.timer}>
      {tracking && (
        <Text style={styles.timer}>
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:
            {String(seconds % 60).padStart(2, '0')}
        </Text>
        )}
    </View>

    {/* Add Stop Button */}
    {tracking && (
        <Pressable
          style={styles.stopButton}
          onPress={() => {
            stopTimer();
            setTracking(false);
            setArrived(false);
            setPath([]);
            swipeEnabledRef.current = true;
            resetState();
          }}
        >
          <Text style={styles.stopButtonText}>STOP</Text>
        </Pressable>
      )}

    </Pressable>
    </GestureDetector>
  );
}

/* map page loading placeholder */
function Loading({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.loadText}>{text}</Text>
    </View>
  );
}

/* styles */
// const styles = StyleSheet.create({
//   arrowOverlay: {
//     // ...StyleSheet.xabsoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   timer: {
//     // position: 'absolute',
//     top: 20,
//     textAlign: 'center',
//     color: '#000000',
//     fontSize: 18,
//   },
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadText: { fontSize: 16 },
// });

const styles = StyleSheet.create({
    arrowOverlay: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    arrowStack: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    timer: {
      position: 'absolute',
      top: 40,
      right: 20,
      color: '#000000',
      fontSize: 18,
    },
    stopButton: {
      position: 'absolute',
      top: 40,
      right: 30,
      backgroundColor: '#ff3b30',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    stopButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
  });
