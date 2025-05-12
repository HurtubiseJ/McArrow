import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getDistance } from '@/lib/locationUtil';

export default function MapScreen() {
  // (we ignore the incoming params for now, since we're using dummy data)
  const { seconds } = useLocalSearchParams<{ seconds: string }>();

  type Coord = { latitude: number; longitude: number };

  // ── Dummy test data ─────────────────────────────────────────────────────
  const startLoc: Coord = { latitude: 37.7749, longitude: -122.4194 }; // SF
  const destination: Coord = { latitude: 37.8049, longitude: -122.2711 }; // Oakland
  const userPath: Coord[] = [
    { latitude: 37.7780, longitude: -122.4090 },
    { latitude: 37.7810, longitude: -122.3950 },
    { latitude: 37.7850, longitude: -122.3800 },
    { latitude: 37.7880, longitude: -122.3650 },
    { latitude: 37.7900, longitude: -122.3500 },
    { latitude: 37.7930, longitude: -122.3350 },
    { latitude: 37.7960, longitude: -122.3200 },
  ];
  const lineColor = "#4287f5";  // or pull from params

  // ── helper (squared perpendicular residual) ─────────────────────────────
  function calcResid(start: Coord, end: Coord, pt: Coord): number {
    const x1 = start.longitude, y1 = start.latitude;
    const x2 = end.longitude,   y2 = end.latitude;

    const A =  y2 - y1;    // Δy
    const B =  x1 - x2;    // –Δx
    const C =  x2*y1 - y2*x1;

    const num   = Math.abs(A * pt.longitude + B * pt.latitude + C);
    const denom = Math.sqrt(A*A + B*B);
    const dist  = num / denom;
    return dist * dist;
  }

  function calcSumDistances(
    start: Coord,
    end:   Coord,
    path:  Coord[]
  ): number {
    return path.reduce((sum, pt) => sum + calcResid(start, end, pt), 0);
  }

  // ── state to hold our computed metrics ─────────────────────────────────
  const [distance,   setDistance]   = useState(0);
  const [residuals,  setResiduals]  = useState(0);

  useEffect(() => {
    // compute straight‐line distance (in meters)
    const d = getDistance(
      startLoc.latitude,  startLoc.longitude,
      destination.latitude, destination.longitude
    );
    setDistance(d);

    // compute sum of squared residuals
    setResiduals(calcSumDistances(startLoc, destination, userPath));
  }, []);

  // ── center map on the first point of the user path ───────────────────────
  const initialPoint = userPath[0] || startLoc;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.mapSection}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude:  initialPoint.latitude,
            longitude: initialPoint.longitude,
            latitudeDelta:  0.03,
            longitudeDelta: 0.03,
          }}
        >
          {/* optimal straight path (dotted) */}
          <Polyline
            coordinates={[startLoc, destination]}
            strokeColor="gray"
            strokeWidth={2}
            lineDashPattern={[6, 4]}
          />

          {/* actual user path (solid) */}
          <Polyline
            coordinates={userPath}
            strokeColor={lineColor}
            strokeWidth={4}
          />

          {/* start / end markers */}
          <Marker
            coordinate={startLoc}
            title="Start"
            pinColor="green"
          />
          <Marker
            coordinate={destination}
            title="End"
            pinColor="red"
          />
        </MapView>
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.summaryText}>
          Straight-line distance: {distance.toLocaleString()} m
        </Text>
        <Text style={styles.summaryText}>
          Sum of squared residuals: {residuals.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>
          Time to complete: {seconds ?? "––"} s
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mapSection:    { flex: 0.6 },
  summarySection:{ flex: 0.4, backgroundColor: "#fff", padding: 16 },
  summaryText:   { fontSize: 16, marginBottom: 8 }
});
