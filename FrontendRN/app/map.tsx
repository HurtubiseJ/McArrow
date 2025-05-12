import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function MapScreen() {
  const { path: raw, color, name, startLocation, endLocation } = useLocalSearchParams<{
    path: string;
    color: string;
    name: string;
    startLocation: string;
    endLocation: string; 
  }>();

  type Coord = {latitude: number; longitude: number}

  const coords = JSON.parse(raw) as { latitude: number; longitude: number }[];
  const destination = JSON.parse(endLocation) as { latitude: number; longitude: number };
  const startLoc = JSON.parse(startLocation) as { latitude: number; longitude: number};

  // Takes in start and end location and calculates line formula
  // From line formula calculates R^2 dist from line to point
  function calcResid(
    start: Coord,
    end:   Coord,
    pt:    Coord
  ): number {
    const x1 = start.longitude;
    const y1 = start.latitude;
    const x2 = end.longitude;
    const y2 = end.latitude;
  
    const A =  y2 - y1;       // Δy
    const B =  x1 - x2;       // –Δx
    const C =  x2*y1 - y2*x1; // x2*y1 − y2*x1
  
    // perpendicular distance = |A x0 + B y0 + C| / sqrt(A² + B²)
    const num   = Math.abs(A * pt.longitude + B * pt.latitude + C);
    const denom = Math.sqrt(A*A + B*B);
    const dist  = num / denom;
  
    return dist * dist; 
  }

  function calcSumDistances(startLoc: Coord, destination: Coord, coords: Coord[]) {
    const start: Coord = startLoc;
    const end: Coord = destination;
    var sum = 0
    coords.forEach(element => {
        const res = calcResid(start, end, element);
        sum = sum + res
    });
    
    return sum;
  }

  // Calc resid for path. Display score.
  useEffect(() => {
    const residuals = calcSumDistances(startLoc, destination, coords);
    console.log(residuals);
  }, []);

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
