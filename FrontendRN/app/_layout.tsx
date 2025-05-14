// app/_layout.js
import { Slot } from 'expo-router';
import React, { createContext, useState, useEffect, useCallback } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'

export type LocationItem = [name: string, colour: string]

const PRESETS: LocationItem[] = [
  ['McDonalds',                    '#ed2828'],
  ['Taco Bell',                    '#af22d6'],
  ['Jersey Mikes',                 '#4287f5'],
  ['Culvers',                      '#00aaff'],
  ['Laird Stadium',                '#000'],
  ['Dairy Queen',                  '#000'],
  ['Carleton College Baseball Field', '#000'],
  ['Gould Library Carleton College',  '#000'],
  ['Evans hall carleton',          '#000'],
]

type Ctx = {
  locations: LocationItem[]
  setLocations: (l: LocationItem[]) => void
}

export const LocationsCtx = createContext<Ctx>({
  locations: PRESETS,
  setLocations: () => {},
})

export default function RootLayout() {
    const [locations, setLocations] = useState<LocationItem[] | null>(null)

    // Init locations for user
    useEffect(() => {
        ;(async () => {
          try {
            const raw = await AsyncStorage.getItem('locations')
            setLocations(raw ? JSON.parse(raw) : PRESETS)
          } catch {
            setLocations(PRESETS) 
          }
        })()
    }, [])

    useEffect(() => {
        if (locations) AsyncStorage.setItem('locations', JSON.stringify(locations))
    }, [locations])

    return (
        <GestureHandlerRootView style={styles.container}>
          <LocationsCtx.Provider
            value={{ locations: locations ?? PRESETS, setLocations }}
          >
            {locations === null ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
              </View>
            ) : (
              <Slot />
            )}
          </LocationsCtx.Provider>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "stretch",
      backgroundColor: 'white',
    }
  });
