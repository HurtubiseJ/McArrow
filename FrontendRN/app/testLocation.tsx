import { getNearestMDLocation } from "../lib/mcdonalds";
import { useRouter } from "expo-router";
import { runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from "react";

export default function TestLocationScreen() {
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
    
    // Hard coded. Will need to use actual location data
    const [lat, setLat] = useState(44.4583);
    const [long, setLong] = useState(93.1616); 
    const [test, setTest] = useState();
    
    useEffect(() => {
        const interval = setInterval(() => {
          const fetchData = async () => {
            try {
              const result = await getNearestMDLocation(lat, long);
              setTest(result);
              console.log(result);
            } catch (err) {
              console.error('Failed to fetch nearest location:', err);
            }
          };
          fetchData();
        }, 1000);
      
        return () => clearInterval(interval); 
      }, [lat, long]);

    return(
        <GestureDetector gesture={panGuesture}>
            <View style={styles.container}>
                <Text>Latitude:  {lat}</Text>
                <Text>Longitude: {long}</Text>
                <Text>{test}</Text>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
    }
});