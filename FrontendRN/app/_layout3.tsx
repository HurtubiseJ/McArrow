// app/_layout.js
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <Slot />
        </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "stretch",
      backgroundColor: 'white',
    }
  });
