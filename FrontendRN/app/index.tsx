import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { runOnJS } from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();

  const handleLeftSwipe = () => {
    console.log('Navigating to /testLocation');
    router.push('/testLocation');
  };

  const handleRightSwipe = () => {
    console.log('Navigating to /testGyro');
    router.push('/testGyro');
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (Math.abs(event.translationX) < 50) return;

      if (event.translationX < -50) {
        runOnJS(handleLeftSwipe)(); 
      } else if (event.translationX > 50) {
        runOnJS(handleRightSwipe)();
      }
    });
  

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Text style={styles.text}>Swipe left or right</Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});