import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const swipeLeft = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX < -50) {
        router.push('/resturantSelect');
      }
    });

  return (
    <GestureDetector gesture={swipeLeft}>
      <View style={styles.container}>
        <Text style={styles.text}>Swipe left to go to Screen Two →</Text>
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