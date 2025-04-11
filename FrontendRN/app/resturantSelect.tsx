import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from "expo-router";
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

export default function ResturantSelectScreen() {
  const router = useRouter();

  const swipeRight = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX > -50) {
        router.push('/');
      }
    });

  return (
    <GestureDetector gesture={swipeRight}>
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