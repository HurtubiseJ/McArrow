import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Button } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import Arrow3D from '@/components/arrow';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import calcBearing, { getNearestLocation } from '@/lib/locationUtil';
import { runOnJS } from 'react-native-reanimated';


export default function HomeScreen() {
    // locations 
    const [screenIndex, setScreenIndex] = useState<number>(0);
    const Locations = [
        ['McDonalds', '#ed2828'],
        ['Taco Bell',  '#af22d6'],
        ['Jersey Mikes', '#4287f5'],
        ['Culvers',     '#00aaff'],
    ];

    //Swipe navigation (switches arrow doesnt use router)
    const router = useRouter();

    const onSwipeLeft = useCallback(() => {
        setScreenIndex(i => Math.min(i + 1, Locations.length - 1));
    }, []);
    const onSwipeRight = useCallback(() => {
        setScreenIndex(i => Math.max(i - 1, 0));
    }, []);

    const panGesture = Gesture.Pan().onEnd(event => {
        'worklet';
        const { translationX } = event;
        if (Math.abs(translationX) < 50) return;

        if (translationX < -50) {
            runOnJS(onSwipeLeft)();
        } else if (translationX > 50) {
            runOnJS(onSwipeRight)();
        }
    });

    //State for all our coords/headings 
    const [locationLat, setLocationLat] = useState<number | null>(null);
    const [locationLong, setLocationLong] = useState<number | null>(null);
    const [lat, setLat]   = useState<number | null>(null);
    const [long, setLong] = useState<number | null>(null);
    const [bearing, setBearing] = useState<number | null>(null);
    const [heading, setHeading] = useState<number>(0);

    //Poll user GPS every 5s
    useEffect(() => {
        async function getCurrentLocation() {
            console.log('In Get location');
            if (Platform.OS === 'android' && !Device.isDevice) {
                console.warn('Android emulator—GPS may be unreliable');
            }
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Location permission denied');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            console.log('Got user coords:', loc.coords);
            setLocationLat(loc.coords.latitude);
            setLocationLong(loc.coords.longitude);
        }
        getCurrentLocation();
        const interval = setInterval(getCurrentLocation, 5000);
        return () => clearInterval(interval);
    }, []);

    //Fetch nearest store when user loc/page changes
    useEffect(() => {
        if (locationLat == null || locationLong == null) return;
        (async () => {
            try {
                const [name] = Locations[screenIndex];
                const res = await getNearestLocation(
                    locationLat,
                    locationLong,
                    name
                );
                if (res) {
                    console.log(`Found nearest ${name} at`, res);
                    setLat(res.lat);
                    setLong(res.lng);
                } else {
                    console.warn(`No ${name} found nearby`);
                }
            } catch (e) {
                console.error('API fetch failed:', e);
            }
        })();
    }, [locationLat, locationLong, screenIndex]);

    //Compute bearing once both coords are set
    useEffect(() => {
        if (
            locationLat == null ||
            locationLong == null ||
            lat == null ||
            long == null
        ) return;
        const b = calcBearing(locationLat, locationLong, lat, long);
        console.log('Computed bearing:', b);
        setBearing(b);
    }, [locationLat, locationLong, lat, long]);

    //Watch device heading (tilt‑compensated)
    useEffect(() => {
        let sub: Location.LocationSubscription;
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            sub = await Location.watchHeadingAsync(h => {
                setHeading(h.trueHeading ?? h.magHeading);
            });
        })();
        return () => sub && sub.remove();
    }, []);

    if (locationLat == null || locationLong == null) {
        return <Loading text="Fetching GPS…" />;
    }
    if (lat == null || long == null) {
        const name = Locations[screenIndex][0];
        return <Loading text={`Finding nearest ${name}…`} />;
    }
    if (bearing == null) {
        return <Loading text="Calculating bearing…" />;
    }

    const arrowAngle = ((bearing - heading) + 360) % 360;
    const [, color] = Locations[screenIndex];

    return (
        <GestureDetector gesture={panGesture}>
            <View style={styles.container}>
                <Arrow3D
                    bearing={arrowAngle}
                    color={color}
                />                    
            </View>
        </GestureDetector>
    );
}

function Loading({ text }: { text: string }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'stretch',    
    },
    text: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});
