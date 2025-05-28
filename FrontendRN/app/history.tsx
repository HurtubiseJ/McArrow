import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type StoredPath = {
  id:          string;                 // ISO timestamp
  name:        string;
  color:       string;
  path:        { latitude: number; longitude: number }[];
  startLoc:    { latitude: number; longitude: number };
  endLoc:      { latitude: number; longitude: number };
  seconds:     number;
  distanceM:   number;
};

const test_path: StoredPath = {
    id: "2342", 
    name: "McDonalds", 
    color: "#0f0f0f",
    path: [
        {"latitude": 44.461384, "longitude": -93.155704},
        {"latitude": 44.461160, "longitude": -93.158469},
        {"latitude": 44.460957, "longitude": -93.161222},
        {"latitude": 44.460732, "longitude": -93.163986},
        {"latitude": 44.460528, "longitude": -93.166748},
        {"latitude": 44.460310, "longitude": -93.169510},
        {"latitude": 44.460070, "longitude": -93.172271},
        {"latitude": 44.459879, "longitude": -93.175038},
        {"latitude": 44.459670, "longitude": -93.177794},
        {"latitude": 44.459445, "longitude": -93.180563}
      ], 
    startLoc: {"latitude": 44.461384, "longitude": -93.155704},
    endLoc:  {"latitude": 44.459440, "longitude": -93.180560},
    seconds: 1023, 
    distanceM: 4362,
}

export default function HistoryScreen() {
  const [paths, setPaths] = useState<StoredPath[]>([]);
  const router = useRouter();

  function addTestpath () {
      setPaths(prev => [...prev, test_path]);
  }

  useEffect(() => {
    AsyncStorage.getItem('paths')
      .then(str => {
        if (!str) return;
        setPaths(JSON.parse(str) as StoredPath[]);
      })
      .catch(console.warn);
  }, []);

  async function save(updated: StoredPath[]) {
    setPaths(updated);
    await AsyncStorage.setItem('paths', JSON.stringify(updated));
  }

  function confirmDelete(id: string) {                   
    Alert.alert(
      'Delete path?', 'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => save(paths.filter(p => p.id !== id)),
        },
      ]
    );
  }

  if (!paths.length) {
    // addTestpath()
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No saved paths yet :\</Text>
        <Pressable onPress={() => router.back()}>
            <Text style={styles.goBack}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <FlatList
        data={paths.sort((a, b) => b.id.localeCompare(a.id))}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
            <Pressable
            style={styles.row}
            onPress={() => router.push({
                pathname: '/map',
                params: {
                path:          JSON.stringify(item.path),
                color:         item.color,
                name:          item.name,
                startLocation: JSON.stringify(item.startLoc),
                endLocation:   JSON.stringify(item.endLoc),
                seconds:       item.seconds.toString(),
                },
            })}
            onLongPress={() => confirmDelete(item.id)}      
            >
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.info}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.meta}>
                {(item.distanceM / 1000).toFixed(2)} km -
                {Math.round(item.seconds)} s -
                {new Date(item.id).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.delHint}>⌫</Text>           
            </Pressable>
        )}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  empty:  { fontSize:16, opacity:0.6 },

  row:    { flexDirection:'row', padding:16, alignItems:'center' },
  colorDot: { width:14, height:14, borderRadius:7, marginRight:12 },
  info:   { flex:1 },
  title:  { fontSize:16, fontWeight:'600' },
  meta:   { fontSize:12, color:'#666', marginTop:2 },
  delHint:{fontSize:18,color:'#aaa',paddingHorizontal:4},

  sep:    { height:1, backgroundColor:'#eee', marginLeft:42 },
  goBack: { color: 'mediumblue' },
  back: {
    alignSelf: 'flex-start',
    backgroundColor: 'mediumblue',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 12,
  },
  backLabel: { color: '#fff', fontWeight: '600' },
});
