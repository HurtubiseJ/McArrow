import { getNearestMDLocation } from "../lib/mcdonalds";
import { useRouter } from "expo-router";
import { runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View, Text, StyleSheet } from 'react-native';

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
        })

    return(
        <View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    
});