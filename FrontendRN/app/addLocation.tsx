import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, FlatList,
  Pressable, StyleSheet, Modal,Platform
} from 'react-native'
import { LocationsCtx, LocationItem } from './_layout'
import { useRouter, Stack } from 'expo-router'
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoLocation from 'expo-location';
import * as Device        from 'expo-device';
import { getNearestLocation, haversineDistance } from '@/lib/locationUtil';

const PALETTE = [
    '#ed2828', // red
    '#af22d6', // purple
    '#4287f5', // blue
    '#00aaff', // cyan
    '#ff9800', // orange
    '#4caf50', // green
    '#000000', // black
];

const MAX_KM = 25;               

export default function LocationsScreen() {
  const { locations, setLocations } = React.useContext(LocationsCtx)
  const [pickerFor, setPickerFor] = useState<number | null>(null) 
  const router = useRouter()

  const [userLat,setUserLat] = useState<number|null>(null);
  const [userLng,setUserLng] = useState<number|null>(null);

  // Get location for validation 
  // TODO: Can prolly pass in latest location instead of recalc
  useEffect(() => {
    (async () => {
      if (Platform.OS==='android' && !Device.isDevice) return;

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const { coords } = await ExpoLocation.getCurrentPositionAsync({});
      setUserLat(coords.latitude);
      setUserLng(coords.longitude);
    })();
  }, []);

  // Ensure valid user location input
  const validateRow = async (idx:number, name:string) => {
    console.log("Validating")

    if (!name.trim() || userLat==null || userLng==null) return;
    console.log("Checking...")

    const geo = await getNearestLocation(userLat, userLng, name);
    if (!geo) {
      alert('“${name}” could not be found.`');
      removeItem(idx);
      return;
    }

    const km = haversineDistance(userLat,userLng,geo.lat,geo.lng);
    if (km > MAX_KM) {
      alert(`“${name}” is more than ${MAX_KM} km away.`);
      removeItem(idx);
    }

    console.log("Passed")
  };
  
  const updateItem = (idx: number, field: 'name' | 'colour', v: string) => {
    const copy = [...locations]
    if (field === 'name') copy[idx][0] = v
    else copy[idx][1] = v
    setLocations(copy)
  }

  const removeItem = (i:number) =>
    setLocations(locations.filter((_, idx) => idx !== i))

  const addItem = () => setLocations([...locations, ['', '#000000']])

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Destinations' }} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.container}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>

          <FlatList
            data={locations}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item, index }) => (
                <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={item[0]}
                    onChangeText={text => updateItem(index,'name',text)}
                    onEndEditing={end => validateRow(index, end.nativeEvent.text)}
                />
              
                <Pressable
                  style={[styles.swatch, { backgroundColor: item[1] }]}
                  onPress={() => setPickerFor(index)}
                />
              
                <Pressable onPress={() => removeItem(index)} style={styles.remove}>
                  <Text>✕</Text>
                </Pressable>
              </View>
            )}
          />

          <Pressable style={styles.addButton} onPress={addItem}>
            <Text style={styles.addLabel}>＋ Add Destination</Text>
          </Pressable>

            
          <Modal visible={pickerFor !== null} transparent animationType="fade">
            {pickerFor !== null && (
                <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Choose a colour</Text>

                    <Picker
                    selectedValue={locations[pickerFor][1]}
                    onValueChange={c => updateItem(pickerFor, 'colour', c)}
                    style={styles.modalPicker}        
                    >
                    {PALETTE.map(c => (
                        <Picker.Item key={c} label="■" color={c} value={c} />
                    ))}
                    </Picker>

                    <Pressable style={styles.modalClose} onPress={() => setPickerFor(null)}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
                    </Pressable>
                </View>
                </View>
            )}
            </Modal>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    back: {
      alignSelf: 'flex-start',
      backgroundColor: '#007AFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginBottom: 12,
    },
    backLabel: { color: '#fff', fontWeight: '600' },
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    row:   { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    input: { 
        flex: 1, 
        borderWidth: 1, 
        borderColor: '#ccc',
        padding: 8, 
        borderRadius: 6 
    },
    swatch: {
      width: 34, 
      height: 34, 
      marginHorizontal: 10,
      borderRadius: 6, 
      borderWidth: 1, 
      borderColor: '#888',
    },
    remove: { padding: 8 },
    addButton: { 
        marginTop: 16, 
        alignItems: 'center',     
        backgroundColor: '#007AFF', 
        padding: 12, 
        borderRadius: 6 
    },
    addLabel: { color: '#fff', fontWeight: '600' },

    modalBackdrop: {
      flex: 1, backgroundColor: '#0008',
      justifyContent: 'center', alignItems: 'center',
      paddingHorizontal: 24,
    },
    modalCard: {
      width: '100%', maxWidth: 320,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      alignItems: 'stretch',
    },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  
    modalPicker: { height: 216, width: '100%' },
  
    modalClose: {
      marginTop: 16, alignSelf: 'center',
      backgroundColor: '#007AFF',
      paddingHorizontal: 20, paddingVertical: 10,
      borderRadius: 8,
    },
  });
  