import calcBearing, { getNearestLocation } from "../lib/locationUtil";
import { useRouter } from "expo-router";
import { runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useEffect, useState } from "react";
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import Arrow3D from '../components/arrow';
import TestCube3D from '../components/testCube3D';
import { Magnetometer } from "expo-sensors";


export default function TestLocationScreen() {
    // Page handleing
    const router = useRouter();

    const handleRightSwipe = () => {
        router.push('/');
    }

    const panGuesture = Gesture.Pan() 
        .onEnd((event) => {
            if (Math.abs(event.translationX) < 50) return;

            if (event.translationX > 50) {
                runOnJS(handleRightSwipe)();
            }
        });
    
    const [lat, setLat] = useState<number | null>(null); // store location
    const [long, setLong] = useState<number | null>(null); 
    const [locationLat, setLocationLat] = useState<number | null>(null); //user location
    const [locationLong, setLocationLong] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [bearing, setBearing] = useState<number | null>(null);

    const [heading, setHeading] = useState<number>(0);

    useEffect(() => {
        async function getCurrentLocation() {
            console.log("In Get location");
          if (Platform.OS === 'android' && !Device.isDevice) {
            setErrorMsg(
              'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
            );
            return;
          }
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }
          console.log("Got status");
    
          let location = await Location.getCurrentPositionAsync({});
          console.log("Got location");
          console.log(location);
          if (location){
            setLocationLat(location.coords.latitude);
            setLocationLong(location.coords.longitude);
            console.log(locationLat, locationLong);
          } else {
            console.log("No Location data");
          }
          
        }
    
        getCurrentLocation();
      }, []);
    
      useEffect(() => {
        let isMounted = true;
    
        const fetchNearest = async () => {
            if (locationLat !== null && locationLong !== null) {
                try {
                    const result = await getNearestLocation(locationLat, locationLong, "McDonalds");
                    if (result) {
                        setLat(result.lat);
                        setLong(result.lng);
                    } else {
                        console.log("Failed to find nearest location");
                    }
                } catch {
                    console.log("API fetch failed");
                }
            } else {
                console.log("Null values");
            }
        };
    
        fetchNearest();
    }, [locationLat, locationLong]);
    
    //Calculate bearing
    useEffect(() => {
        const getBearing = () => {
            const bearing = calcBearing(locationLat, locationLong, lat, long);
            console.log("Bearing:");
            console.log(bearing);
            setBearing(bearing);
        }
        getBearing();
    }, [lat, long]);

    // Calc heading based on device orientation
    useEffect(() => {
        let subscriber: Location.LocationSubscription;
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Heading permission denied');
                return;
            }
            subscriber = await Location.watchHeadingAsync(headingObj => {
            const h = headingObj.trueHeading ?? headingObj.magHeading;
                setHeading(h);
            });
        })();
        return () => subscriber && subscriber.remove();
    }, []);

    if (lat == null || long == null) {
        return (
            <View style={styles.container}>
                <Text>Finding nearest McDonalds…</Text>
            </View>
        );
    }
    
    if (bearing == null) {
        return (
            <View style={styles.container}>
                <Text>Calculating bearing…</Text>
            </View>
        );
    }

    const arrowAngle = ((bearing - heading) + 360) % 360;

    return (
        <GestureDetector gesture={panGuesture}>
          <View style={styles.container}>
            <View style={{ flex: 1, alignSelf: 'stretch' }}>
              <Arrow3D bearing={arrowAngle} color="#ff4500" />
              {/* <TestCube3D /> */}
            </View>
          </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',     
      justifyContent: 'center',
    },
  });