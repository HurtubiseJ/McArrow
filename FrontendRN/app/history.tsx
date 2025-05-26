import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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

export default function HistoryScreen() {
  const [paths, setPaths] = useState<StoredPath[]>([]);
  const router = useRouter();

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
              {(item.distanceM / 1000).toFixed(2)} km • 
              {Math.round(item.seconds)} s • 
              {new Date(item.id).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.delHint}>⌫</Text>           
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  empty:  { fontSize:16, opacity:0.6 },

  row:    { flexDirection:'row', padding:16, alignItems:'center' },
  colorDot: { width:14, height:14, borderRadius:7, marginRight:12 },
  info:   { flex:1 },
  title:  { fontSize:16, fontWeight:'600' },
  meta:   { fontSize:12, color:'#666', marginTop:2 },
  delHint:{fontSize:18,color:'#aaa',paddingHorizontal:4},

  sep:    { height:1, backgroundColor:'#eee', marginLeft:42 },
  goBack: { color: 'lightblue' }
});
