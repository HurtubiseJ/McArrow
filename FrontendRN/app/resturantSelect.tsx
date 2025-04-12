import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from "expo-router";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export default function ResturantSelectScreen() {
  const router = useRouter();

  const handleRightSwipe = () => {
    console.log('Navigating to /index');
    router.push('/');
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (Math.abs(event.translationX) < 50) return;

      if (event.translationX > 50) {
        runOnJS(handleRightSwipe)();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Text style={styles.text}>Resturant Select</Text>
        <Text style={styles.text}>Swipe right to go back</Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});