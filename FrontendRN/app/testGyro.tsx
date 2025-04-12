import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gyroscope, Magnetometer } from 'expo-sensors';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

export default function GyroScreen() {
  const router = useRouter();

  const handleLeftSwipe = () => {
    console.log('Navigating to /index');
    router.push('/');
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (Math.abs(event.translationX) < 50) return;

      if (event.translationX < -50) {
        runOnJS(handleLeftSwipe)(); 
      }
    });

  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  // Calc rotation data
  const [subscription, setSubscription] = useState(null);

  const _slow = () => Gyroscope.setUpdateInterval(1000);
  const _fast = () => Gyroscope.setUpdateInterval(16);

  const _subscribe = () => {
    const listener = Gyroscope.addListener(({ x = 0, y = 0, z = 0 } = {}) => {
      setData({ x, y, z });
    });
    setSubscription(listener);
  };

  const _unsubscribe = () => {
    if (subscription?.remove) {
      subscription.remove();
      setSubscription(null);
    }
  };

  // North pointing header calculations
  const [heading, setHeading] = useState(0);
  useEffect(() => {
    const magSubscription = Magnetometer.addListener((data) => {
        let angle = calcAngle(data);
        setHeading(angle);
    });
    
    Magnetometer.setUpdateInterval(100);

    return () => magSubscription.remove();
  }, []);

  const calcAngle = (magnetometer) => {
    let {x, y} = magnetometer; 

    // Swiped from stack overflow
    let angle = Math.atan2(y, x);
    angle = angle * (180 / Math.PI); 
    angle = angle + 90;
    if (angle < 0) {
      angle = 360 + angle;
    }
    return Math.round(angle);
  }

  useEffect(() => {
    if (Platform.OS !== 'web') {
      _subscribe();
      return () => _unsubscribe();
    }
  }, []);

  return (
    <GestureDetector gesture={panGesture}>
    <View style={styles.container}>
      <Text style={styles.text}>Gyroscope:</Text>
      <Text style={styles.text}>x: {x}</Text>
      <Text style={styles.text}>y: {y}</Text>
      <Text style={styles.text}>z: {z}</Text>
      <Text style={styles.text}>Angle: {heading}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});
