import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function MapScreen() {
  const { path: raw, color, name } = useLocalSearchParams<{
    path: string;
    color: string;
    name: string;
  }>();

  const coords = JSON.parse(raw) as { latitude: number; longitude: number }[];

  if (!coords.length) return null;

  const last = coords[coords.length - 1];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.mapSection}>
        <MapView
          style={StyleSheet.absoluteFill}
          showsUserLocation
          initialRegion={{
            latitude: last.latitude,
            longitude: last.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}>
          <Polyline coordinates={coords} strokeWidth={4} strokeColor={String(color)} />
          <Marker coordinate={last} title={String(name)} />
        </MapView>
      </View>

      <View style={styles.summarySection} />
    </>
  );
}

const styles = StyleSheet.create({
  mapSection: { flex: 0.6 },
  summarySection: { flex: 0.4, backgroundColor: '#fff' },
});
