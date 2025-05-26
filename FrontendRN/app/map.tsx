import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack } from 'expo-router';
import { haversineDistance } from '@/lib/locationUtil';
import { useRouter } from 'expo-router';

type Coord = { latitude: number; longitude: number };

export default function MapScreen() {
  const router = useRouter()
  const { path: rawPath, color, name, startLocation, endLocation, seconds } =
    useLocalSearchParams<{
      path: string;
      color: string;
      name: string;
      startLocation: string;
      endLocation: string;
      seconds: string;
    }>();

  const rawPathParam = Array.isArray(rawPath) ? rawPath[0] : rawPath; 
  const userPath: Coord[] = JSON.parse(decodeURIComponent(rawPathParam));
  const startLoc:   Coord = JSON.parse(startLocation);
  const destination:Coord = JSON.parse(endLocation);
  const lineColor = color.startsWith('#') ? color : `#${color}`;

  const R = 6378137;
  function toMercator({ latitude, longitude }: Coord) {
    const lmda = longitude * Math.PI / 180;        
    const theta = Math.min(Math.max(latitude, -85.05112878), 85.05112878) * Math.PI / 180;
    return {
      x: R * lmda,
      y: R * Math.log(Math.tan(Math.PI / 4 + theta / 2)),
    };
  }

  function calcResid(start: Coord, end: Coord, pt: Coord): number {
    const { x: x1, y: y1 } = toMercator(start);
    const { x: x2, y: y2 } = toMercator(end);
    const { x: px, y: py }    = toMercator(pt);
  
    const dx = x2 - x1;
    const dy = y2 - y1;
  
    const num   = Math.abs(dy * (px - x1) - dx * (py - y1));
    const denom = Math.hypot(dx, dy);
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
        <Pressable onPress={() => {router.back()}}>
            <Text style={styles.goBack}>Go Back</Text>
        </Pressable>
        <Text style={styles.summaryText}>Location: {name}</Text>
        <Text style={styles.summaryText}>
          Distance (straight): {distance.toLocaleString()} m
        </Text>
        <Text style={styles.summaryText}>
          Path residuals: {residuals.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>
          Time to complete: {seconds.toString() ?? '–'} s
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
  goBack: {
    color: "lightblue",
  }
});
