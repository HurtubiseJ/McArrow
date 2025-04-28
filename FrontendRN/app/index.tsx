import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Button } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import Arrow3D from '@/components/arrow';
import Arrow from '@/components/arrow2d';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import calcBearing, { getNearestLocation } from '@/lib/locationUtil';
import { runOnJS } from 'react-native-reanimated';
import MapView, { Marker, Polyline } from 'react-native-maps';


export default function HomeScreen() {
  // locations 
  const [screenIndex, setScreenIndex] = useState<number>(0);
  const Locations = [
    ['McDonalds', '#ed2828'],
    ['Taco Bell', '#af22d6'],
    ['Jersey Mikes', '#4287f5'],
    ['Culvers', '#00aaff'],
  ];

  const router = useRouter();

  const onSwipeLeft = useCallback(() => {
    setScreenIndex(i => Math.min(i + 1, Locations.length - 1));
  }, []);
  const onSwipeRight = useCallback(() => {
    setScreenIndex(i => Math.max(i - 1, 0));
  }, []);

  const panGesture = Gesture.Pan().onEnd(event => {
    'worklet';
    const { translationX } = event;
    if (Math.abs(translationX) < 50) return;

    if (translationX < -50) {
      runOnJS(onSwipeLeft)();
    } else if (translationX > 50) {
      runOnJS(onSwipeRight)();
    }
  });

  //State for all our coords/headings 
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLong, setLocationLong] = useState<number | null>(null);
  const [lat, setLat] = useState<number>(0);
  const [long, setLong] = useState<number>(0);
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [distance, setDistance] = useState<number>(100);
  const [arrived, setArrived] = useState(false);

  //Path tracking
  type cords = {
    lat: number,
    lng: number,
  }
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);

  //Poll user GPS every 5s
  useEffect(() => {
    async function getCurrentLocation() {
      console.log('In Get location');
      if (Platform.OS === 'android' && !Device.isDevice) {
        console.warn('Android emulator—GPS may be unreliable');
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      console.log('Got user coords:', loc.coords);
      const locLat = loc.coords.latitude;
      const locLng = loc.coords.longitude;
      setLocationLat(locLat);
      setLocationLong(locLng);

      console.log("Inside get user location distance:");
      const latRad = locLat * (Math.PI / 180);
      const lngRad = locLng * (Math.PI / 180);
      console.log(latRad);
      console.log(lngRad);

      const latLocRad = lat * (Math.PI / 180);
      const lngLocRad = long * (Math.PI / 180);
      console.log(latLocRad);
      console.log(lngLocRad);

      const dist = 2 * 6371 * Math.asin((Math.sqrt(Math.sin(latLocRad - latRad) ** 2 / 2 + Math.cos(latRad) * Math.cos(latLocRad) * (Math.sin(lngLocRad - lngRad) ** 2) / 2)));

      console.log(dist);
      console.log("Finish");

      // Add location to path 
      setPath(p =>
        p.concat({ latitude: locLat, longitude: locLng })
      );

      setDistance(dist);
    }
    getCurrentLocation();
    const interval = setInterval(getCurrentLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  //Set next screen if dist close
  useEffect(() => {
    console.log("Distance");
    console.log(distance);
    if (distance < 1.5) {
      setArrived(true);
    }
  }, [distance]);

  //Fetch nearest store when user loc/page changes
  useEffect(() => {
    if (locationLat == null || locationLong == null) return;
    (async () => {
      try {
        const [name] = Locations[screenIndex];
        const res = await getNearestLocation(
          locationLat,
          locationLong,
          name
        );
        if (res) {
          console.log(`Found nearest ${name} at`, res);
          setLat(res.lat);
          setLong(res.lng);
        } else {
          console.warn(`No ${name} found nearby`);
        }
      } catch (e) {
        console.error('API fetch failed:', e);
      }
    })();
  }, [locationLat, locationLong, screenIndex]);

  //Compute bearing once both coords are set
  useEffect(() => {
    if (
      locationLat == null ||
      locationLong == null ||
      lat == null ||
      long == null
    ) return;
    const b = calcBearing(locationLat, locationLong, lat, long);
    console.log('Computed bearing:', b);
    setBearing(b);
  }, [locationLat, locationLong, lat, long]);

  //Watch device heading (tilt‑compensated)
  useEffect(() => {
    let sub: Location.LocationSubscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchHeadingAsync(h => {
        setHeading(h.trueHeading ?? h.magHeading);
      });
    })();
    return () => sub && sub.remove();
  }, []);

  if (locationLat == null || locationLong == null) {
    return <Loading text="Fetching GPS…" />;
  }
  if (lat == null || long == null) {
    const name = Locations[screenIndex][0];
    return <Loading text={`Finding nearest ${name}…`} />;
  }
  if (bearing == null) {
    return <Loading text="Calculating bearing…" />;
  }

  const arrowAngle = ((bearing - heading) + 360) % 360;
  const [, color] = Locations[screenIndex];
  const name = Locations[screenIndex][0];

  if (!arrived) {
    return (
        <GestureDetector gesture={panGesture}>
            <View style={styles.arrowOverlay}>
            <Arrow
                color={Locations[screenIndex][1]}
                bearing={arrowAngle}
                size={80}
                label={name}
            />
            </View>
        </GestureDetector>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        showsUserLocation
        initialRegion={{
          latitude: path[path.length - 1].latitude,
          longitude: path[path.length - 1].longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        region={{
          latitude: path[path.length - 1].latitude,
          longitude: path[path.length - 1].longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Polyline
          coordinates={path}
          strokeWidth={4}
          strokeColor={color}
        />
        <Marker
          coordinate={{ latitude: locationLat, longitude: locationLong }}
          title={name}
        />
      </MapView>
    </View>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    arrowOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    text: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});
