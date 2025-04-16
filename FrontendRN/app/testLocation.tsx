import calcBearing, { getNearestLocation } from "../lib/locationUtil";
import { useRouter } from "expo-router";
import { runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useEffect, useState } from "react";
import * as Location from 'expo-location';
import * as Device from 'expo-device';


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

    if (lat === null || long === null) {
        return (
            <View style={styles.container}>
                <Text>Loading location...</Text>
            </View>
        );
    }

    return(
        <GestureDetector gesture={panGuesture}>
            <View style={styles.container}>
                <Text>USER</Text>
                <Text>Latitude:  {lat}</Text>
                <Text>Longitude: {long}</Text>
                <Text>LOCATION</Text>
                <Text>Latitude:  {locationLat}</Text>
                <Text>Longitude: {locationLong}</Text>
                <Text>Bearing: {bearing}</Text>

            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: 'white',
    }
});