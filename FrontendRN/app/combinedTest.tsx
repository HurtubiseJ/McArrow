import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gyroscope, Magnetometer, MagnetometerMeasurement } from 'expo-sensors';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import calcBearing, { getNearestLocation } from "../lib/locationUtil";

export default function CombinedLocationGyroScreen() {
    const router = useRouter();
    const DOT_SIZE = 20;

    // Navigation handling
    const handleLeftSwipe = () => {
        router.push('/userLocation');
    };

    const handleRightSwipe = () => {
        router.push('/combinedTestTwo');
    };

    const panGesture = Gesture.Pan()
        .onEnd((event) => {
            if (Math.abs(event.translationX) < 50) return;

            if (event.translationX < -50) {
                runOnJS(handleLeftSwipe)();
            } else if (event.translationX > 50) {
                runOnJS(handleRightSwipe)();
            }
        });

    // Gyroscope data
    const [gyroData, setGyroData] = useState({
        x: 0,
        y: 0,
        z: 0,
    });
    const [gyroSubscription, setGyroSubscription] = useState(null);

    // Compass heading data
    const [compassHeading, setCompassHeading] = useState(0);
    const [magSubscription, setMagSubscription] = useState(null);

    // Location data
    const [userLocation, setUserLocation] = useState({
        lat: null,
        long: null,
    });
    const [restaurantLocation, setRestaurantLocation] = useState({
        lat: null,
        long: null,
    });
    const [bearingToRestaurant, setBearingToRestaurant] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // Relative bearing (compass heading adjusted)
    const [relativeBearing, setRelativeBearing] = useState(0);

    // Gyroscope functions
    const _slow = () => Gyroscope.setUpdateInterval(1000);
    const _fast = () => Gyroscope.setUpdateInterval(10);

    const _subscribeGyro = () => {
        const listener = Gyroscope.addListener(({ x = 0, y = 0, z = 0 } = {}) => {
            setGyroData({ x, y, z });
        });
        setGyroSubscription(listener);
    };

    const _unsubscribeGyro = () => {
        if (gyroSubscription?.remove) {
            gyroSubscription.remove();
            setGyroSubscription(null);
        }
    };

    // Calculate compass angle from magnetometer data
    const calcAngle = (magnetometer: MagnetometerMeasurement) => {
        let { x, y } = magnetometer;

        let angle = Math.atan2(y, x);
        angle = angle * (180 / Math.PI);
        angle = angle + 90;
        if (angle < 0) {
            angle = 360 + angle;
        }
        return Math.round(angle);
    };

    // Subscribe to gyroscope
    useEffect(() => {
        if (Platform.OS !== 'web') {
            _subscribeGyro();
            return () => _unsubscribeGyro();
        }
    }, []);

    // Subscribe to magnetometer (compass)
    useEffect(() => {
        const subscription = Magnetometer.addListener((data) => {
            let angle = calcAngle(data);
            setCompassHeading(angle);
        });
        
        setMagSubscription(subscription);
        Magnetometer.setUpdateInterval(100);

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    // Get user location
    useEffect(() => {
        async function getCurrentLocation() {
            if (Platform.OS === 'android' && !Device.isDevice) {
                setErrorMsg('Oops, this will not work on Snack in an Android Emulator. Try it on your device!');
                return;
            }
            
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                lat: location.coords.latitude,
                long: location.coords.longitude,
            });
        }
        
        getCurrentLocation();
    }, []);

    // Get nearest McDonald's location
    useEffect(() => {
        const fetchNearest = async () => {
            if (userLocation.lat !== null && userLocation.long !== null) {
                try {
                    const result = await getNearestLocation(userLocation.lat, userLocation.long, "McDonalds");
                    if (result) {
                        setRestaurantLocation({
                            lat: result.lat,
                            long: result.lng,
                        });
                    } else {
                        console.log("Failed to find nearest location");
                    }
                } catch (error) {
                    console.log("API fetch failed", error);
                }
            }
        };

        fetchNearest();
    }, [userLocation.lat, userLocation.long]);

    // Calculate bearing to restaurant
    useEffect(() => {
        if (userLocation.lat !== null && userLocation.long !== null && 
            restaurantLocation.lat !== null && restaurantLocation.long !== null) {
            const bearing = calcBearing(
                userLocation.lat, 
                userLocation.long, 
                restaurantLocation.lat, 
                restaurantLocation.long
            );
            setBearingToRestaurant(bearing);
        }
    }, [userLocation, restaurantLocation]);

    // Calculate relative bearing (accounting for phone orientation)
    useEffect(() => {
        if (bearingToRestaurant !== null && compassHeading !== null) {
            // Calculate the relative bearing by subtracting compass heading from absolute bearing
            let relative = bearingToRestaurant - compassHeading;
            
            // Normalize to 0-360 range
            if (relative < 0) {
                relative += 360;
            }
            if (relative >= 360) {
                relative -= 360;
            }
            
            setRelativeBearing(relative);
        }
    }, [bearingToRestaurant, compassHeading]);

    // Calculate dot position based on relative bearing
    const calculateDotPosition = () => {
        if (relativeBearing === null) return { top: '50%', left: '50%' };
        
        // Convert bearing to radians for calculation
        const bearingRadians = (relativeBearing * Math.PI) / 180;
        
        // Calculate position on circle (radius = 100)
        const radius = 100;
        const centerX = 50; // Percentage from left
        const centerY = 50; // Percentage from top
        
        // In compass bearings, 0° is North (up), and degrees go clockwise
        // For calculation: 0° is to the right, and degrees go counter-clockwise
        // So we need to adjust by 90° and invert the direction
        const calculationAngle = (90 - relativeBearing) * Math.PI / 180;
        
        const x = centerX + (radius * Math.cos(calculationAngle) / 2);
        const y = centerY - (radius * Math.sin(calculationAngle) / 2);
        
        return {
            left: `${x}%`,
            top: `${y}%`
        };
    };

    const dotPosition = calculateDotPosition();

    return (
        <GestureDetector gesture={panGesture}>
            <View style={styles.container}>
                <View style={styles.compassContainer}>
                    <View style={styles.compass}>
                        <View style={[styles.compassNorth, { transform: [{ rotate: `${-compassHeading}deg` }] }]}>
                            <Text style={styles.compassText}>N</Text>
                        </View>
                        <View 
                            style={[
                                styles.dot, 
                                { 
                                    left: dotPosition.left, 
                                    top: dotPosition.top,
                                    backgroundColor: '#ff4500' 
                                }
                            ]} 
                        />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.text}>Compass Heading: {compassHeading}°</Text>
                    <Text style={styles.text}>Bearing to McDonald's: {bearingToRestaurant !== null ? `${bearingToRestaurant}°` : 'Calculating...'}</Text>
                    <Text style={styles.text}>Relative Bearing: {relativeBearing !== null ? `${relativeBearing}°` : 'Calculating...'}</Text>
                    
                    {userLocation.lat && userLocation.long ? (
                        <Text style={styles.text}>Your Location: {userLocation.lat.toFixed(6)}, {userLocation.long.toFixed(6)}</Text>
                    ) : (
                        <Text style={styles.text}>Getting your location...</Text>
                    )}
                    
                    {restaurantLocation.lat && restaurantLocation.long ? (
                        <Text style={styles.text}>McDonald's: {restaurantLocation.lat.toFixed(6)}, {restaurantLocation.long.toFixed(6)}</Text>
                    ) : (
                        <Text style={styles.text}>Finding nearest McDonald's...</Text>
                    )}
                    
                    {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={gyroSubscription ? _unsubscribeGyro : _subscribeGyro} style={styles.button}>
                        <Text>{gyroSubscription ? 'Gyro On' : 'Gyro Off'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
                        <Text>Slow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={_fast} style={styles.button}>
                        <Text>Fast</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#fff",
        padding: 20,
    },
    compassContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    compass: {
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    compassNorth: {
        position: 'absolute',
        top: 10,
        left: '50%',
        marginLeft: -10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compassText: {
        color: 'red',
        fontWeight: 'bold',
    },
    dot: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ff4500',
    },
    infoContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    text: {
        textAlign: 'center',
        marginVertical: 5,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 15,
        width: '100%',
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        padding: 10,
    },
    middleButton: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
});
