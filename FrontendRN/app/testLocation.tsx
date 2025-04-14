import { getNearestLocation } from "../lib/mcdonalds";
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
    
    const [lat, setLat] = useState<number | null>(null);
    const [long, setLong] = useState<number | null>(null); 
    const [locationLat, setLocationLat] = useState<number | null>(null);
    const [locationLong, setLocationLong] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        async function getCurrentLocation() {
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
    
          let location = await Location.getCurrentPositionAsync({});
          if (location){
            setLocationLat(location.coords.latitude);
            setLocationLong(location.coords.longitude);
          } else {
            console.log("No Location data");
          }
          
        }
    
        getCurrentLocation();
      }, []);
    
      useEffect(() => {
        let isMounted = true;
    
        const fetchUntilSuccess = async () => {
            while (isMounted) {
                try {
                    console.log("Trying fetch with:", lat, long);
                    const result = await getNearestLocation(lat, long, "McDonalds");
    
                    if (result) {
                        console.log("Found:", result);
                        setLat(result.lat);
                        setLong(result.lng);
                        break;
                    } else {
                        console.log("No location found, retrying...");
                    }
                } catch (err) {
                    console.error("Fetch failed, retrying...", err);
                }
    
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        };
    
        fetchUntilSuccess();
    
        return () => {
            isMounted = false; 
        };
    }, []);
    

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