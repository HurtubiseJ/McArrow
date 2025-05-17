import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack } from 'expo-router';
import { haversineDistance } from '@/lib/locationUtil';

type Coord = { latitude: number; longitude: number };

export default function MapScreen() {
  const { path: rawPath, color, name, startLocation, endLocation, seconds } =
    useLocalSearchParams<{
      path: string;
      color: string;
      name: string;
      startLocation: string;
      endLocation: string;
      seconds: string;
    }>();

  const userPath: Coord[] = JSON.parse(rawPath);
  const startLoc:   Coord = JSON.parse(startLocation);
  const destination:Coord = JSON.parse(endLocation);
  const lineColor = color.startsWith('#') ? color : `#${color}`;

  // Calculates residual between line (optimal path) and point
  function calcResid(start: Coord, end: Coord, pt: Coord): number {
    const x1 = start.longitude, y1 = start.latitude;
    const x2 = end.longitude,   y2 = end.latitude;

    const A =  y2 - y1;
    const B =  x1 - x2;
    const C =  x2*y1 - y2*x1;

    const num   = Math.abs(A * pt.longitude + B * pt.latitude + C);
    const denom = Math.hypot(A, B);
    const dist  = num / denom;
    return dist * dist;
  }

  // Summation of residuals for whole path
  function calcSumDistances(path: Coord[]): number {
    return path.reduce((sum, pt) => sum + calcResid(startLoc, destination, pt), 0);
  }

  const [distance,  setDistance]  = useState(0);
  const [residuals, setResiduals] = useState(0);

  useEffect(() => {
    async function computeMetrics() {
      const d = await haversineDistance(
        startLoc.latitude,
        startLoc.longitude,
        destination.latitude,
        destination.longitude
      );
      setDistance(d);

      setResiduals(calcSumDistances(userPath));
    }

    computeMetrics();
  }, []);

  if (!userPath.length) return null;

  const initialRegion = {
    latitude:  startLoc.latitude,
    longitude: startLoc.longitude,
    latitudeDelta:  0.02,
    longitudeDelta: 0.02,
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.mapSection}>
        <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
          {/* optimal straight path (dotted gray) */}
          <Polyline
            coordinates={[startLoc, destination]}
            strokeColor="gray"
            strokeWidth={2}
            lineDashPattern={[6, 4]}
          />

          {/* user’s actual path (solid) */}
          <Polyline
            coordinates={userPath}
            strokeColor={lineColor}
            strokeWidth={4}
          />

          {/* start / end markers */}
          <Marker coordinate={startLoc}   title="Start" pinColor="green" />
          <Marker coordinate={destination} title={name}  pinColor="red"   />
        </MapView>
      </View>

      {/* summary section */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryText}>Location: {name}</Text>
        <Text style={styles.summaryText}>
          Distance (straight): {distance.toLocaleString()} m
        </Text>
        <Text style={styles.summaryText}>
          Path residuals: {residuals.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>
          Time to complete: {seconds ?? '–'} s
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mapSection: { flex: 0.6 },
  summarySection: { 
    flex: 0.4, 
    backgroundColor: '#fff', 
    padding: 16 
  },
  summaryText: { 
    fontSize: 16, 
    marginBottom: 8 
  },
});
