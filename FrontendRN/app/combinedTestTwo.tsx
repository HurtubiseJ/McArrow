// combinedTest.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Platform, Text, View, StyleSheet, Animated, Easing } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { Magnetometer, MagnetometerMeasurement } from 'expo-sensors';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// --- Placeholder Location Utilities ---
// Replace these with your actual imports and functions from ../lib/locationUtil
const placeholderLocationUtil = {
    // Placeholder: Simulates fetching the nearest McDonald's
    // In reality, this would use an API (like Google Places)
    getNearestLocation: async (userLat: number, userLng: number, placeName: string): Promise<{ lat: number; lng: number } | null> => {
        console.log(`Simulating search for nearest ${placeName} near ${userLat}, ${userLng}`);
        // Return a fixed nearby location for demonstration
        // Replace with your actual API call logic
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        // Example: Coordinates roughly for a McDonald's near Googleplex
        return { lat: 37.421934, lng: -122.084643 };
    },

    // Placeholder: Calculates bearing between two points
    // Replace with your actual bearing calculation logic
    calcBearing: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const dLon = (lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let brng = Math.atan2(y, x);
        brng = brng * (180 / Math.PI); // Convert radians to degrees
        brng = (brng + 360) % 360; // Normalize to 0-360
        // brng = 360 - brng; // Counter-clockwise anlge needed? Depends on calcAngle/CSS
        return brng;
    }
};
// --- End Placeholder Location Utilities ---


// Use your actual utility functions:
// import { getNearestLocation, calcBearing } from "../lib/locationUtil";
// Use the placeholders for now:
const { getNearestLocation, calcBearing } = placeholderLocationUtil;


export default function CombinedTestScreen() {
      // Navigation handling

    // State for User Location
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

    // State for Target (McDonalds) Location
    const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number } | null>(null);

    // State for Bearing to Target
    const [targetBearing, setTargetBearing] = useState<number | null>(null);

    // State for Device Heading
    const [deviceHeading, setDeviceHeading] = useState<number>(0);
    const [magnetometerSubscription, setMagnetometerSubscription] = useState<any>(null); // Using 'any' for simplicity, refine if needed

    // State for Errors and Loading
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Animated value for the dot's rotation
    const rotationAnim = useRef(new Animated.Value(0)).current;

    // 1. Get Location Permissions and User's Initial Location
    useEffect(() => {
        let isMounted = true; // Prevent state updates on unmounted component
        setIsLoading(true);
        setErrorMsg(null);

        async function setupLocation() {
            if (Platform.OS === 'android' && !Device.isDevice) {
                if (isMounted) setErrorMsg('Location does not work accurately on Android emulators.');
                // Don't return, try anyway, might work sometimes
            }

            console.log("Requesting location permissions...");
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                if (isMounted) {
                    setErrorMsg('Permission to access location was denied');
                    setIsLoading(false);
                }
                return;
            }
            console.log("Location permission granted.");

            console.log("Getting current position...");
            try {
                let location = await Location.getCurrentPositionAsync({});
                if (isMounted) {
                    console.log("User location obtained:", location.coords);
                    setUserLocation(location);
                    // Don't stop loading here, wait for target location
                }
            } catch (error) {
                console.error("Error getting location:", error);
                if (isMounted) {
                    setErrorMsg(`Failed to get location: ${error.message}`);
                    setIsLoading(false);
                }
            }
        }

        setupLocation();

        // Cleanup function
        return () => {
            isMounted = false;
            console.log("Location effect cleanup");
        };
    }, []); // Runs once on mount

    // 2. Fetch Nearest McDonald's Location once User Location is available
    useEffect(() => {
        let isMounted = true;
        if (userLocation?.coords) {
            console.log("User location available, fetching nearest McDonald's...");
            const { latitude, longitude } = userLocation.coords;

            getNearestLocation(latitude, longitude, "McDonalds")
                .then(result => {
                    if (isMounted) {
                        if (result) {
                            console.log("Nearest McDonald's found:", result);
                            setTargetCoords(result);
                        } else {
                            console.log("Failed to find nearest McDonald's.");
                            setErrorMsg("Could not find the nearest McDonald's.");
                            setIsLoading(false); // Stop loading if target not found
                        }
                    }
                })
                .catch(err => {
                    console.error("Error fetching nearest location:", err);
                    if (isMounted) {
                        setErrorMsg(`API error fetching location: ${err.message}`);
                        setIsLoading(false);
                    }
                });
        } else {
             console.log("Waiting for user location to fetch target...");
        }
         // Cleanup function
        return () => {
            isMounted = false;
            console.log("Fetch nearest location effect cleanup");
        };
    }, [userLocation]); // Runs when userLocation changes

    // 3. Calculate Bearing once User and Target Locations are available
    useEffect(() => {
         let isMounted = true;
        if (userLocation?.coords && targetCoords) {
            console.log("Calculating bearing...");
            const bearing = calcBearing(
                userLocation.coords.latitude,
                userLocation.coords.longitude,
                targetCoords.lat,
                targetCoords.lng
            );
             if (isMounted){
                console.log("Bearing calculated:", bearing);
                setTargetBearing(bearing);
                setIsLoading(false); // Now we have all data, stop loading
             }
        } else {
             console.log("Waiting for user and target locations to calculate bearing...");
        }
        // Cleanup function
        return () => {
            isMounted = false;
            console.log("Calculate bearing effect cleanup");
        };
    }, [userLocation, targetCoords]); // Runs when userLocation or targetCoords change

    // 4. Setup Magnetometer for Device Heading
    useEffect(() => {
        let isMounted = true;
        console.log("Setting up Magnetometer listener...");

        // Function to calculate heading from magnetometer data
        // (Adapted from your GyroScreen)
        const calculateDeviceHeading = (magnetometer: MagnetometerMeasurement): number => {
            let { x, y } = magnetometer;
            let angleRad = Math.atan2(y, x); // Angle in radians
            let angleDeg = angleRad * (180 / Math.PI); // Angle in degrees

            // Adjustments to match typical compass heading (0 North, 90 East)
            angleDeg = angleDeg; // Adjust based on device orientation and sensor placement if needed. Common adjustments: +90, +180, etc. Check sensor docs or experiment. StackOverflow often suggests +90 for Android.

            angleDeg = (angleDeg + 360) % 360; // Normalize to 0-360

            // This part might need adjustment based on how your screen is oriented relative to the sensor
            // Example: If atan2(y,x) gives 0 East, you might need angleDeg = (angleDeg + 90) % 360;

            //Let's try the SO version:
            let angle = Math.atan2(y, x);
            angle = angle * (180 / Math.PI);
            angle = angle + 90; // Stack overflow adjustment
            if (angle < 0) {
                angle = 360 + angle;
            }

            return Math.round(angle); // Use the SO version for now
        };

        const subscribe = () => {
            Magnetometer.setUpdateInterval(200); // Update ~5 times/sec
            const listener = Magnetometer.addListener((data) => {
                 if (isMounted) {
                    const heading = calculateDeviceHeading(data);
                    // console.log("Device Heading Updated:", heading); // Log frequently, maybe too much
                    setDeviceHeading(heading);
                }
            });
            setMagnetometerSubscription(listener);
             console.log("Magnetometer subscribed.");
        };

        const unsubscribe = () => {
            if (magnetometerSubscription?.remove) {
                magnetometerSubscription.remove();
                setMagnetometerSubscription(null);
                console.log("Magnetometer unsubscribed.");
            }
        };

        subscribe();

        // Cleanup: Unsubscribe when component unmounts
        return () => {
             isMounted = false;
             unsubscribe();
             console.log("Magnetometer effect cleanup");
        };
    }, []); // Runs once on mount to set up listener

    // 5. Calculate and Animate Dot Rotation
    useEffect(() => {
        if (targetBearing !== null) {
            // The final rotation needed for the dot on the screen.
            // We want the dot's "forward" direction (e.g., its top) to align
            // with the direction of the target RELATIVE to the phone's current heading.
            // rotation = Target Bearing (relative to North) - Device Heading (relative to North)
            const rotationDegrees = targetBearing - deviceHeading;

            // Normalize rotation to avoid large numbers if needed, though transform often handles it
            // const normalizedRotation = (rotationDegrees % 360 + 360) % 360;

            // Use Animated.timing for smoother rotation
            Animated.timing(rotationAnim, {
                toValue: rotationDegrees, // Animate to the calculated rotation
                duration: 150, // Short duration for responsiveness
                easing: Easing.linear, // Use linear easing for compass-like movement
                useNativeDriver: true, // Use native driver for performance
            }).start();
        }
    }, [targetBearing, deviceHeading, rotationAnim]); // Re-calculate when bearing or heading changes

    // --- Render Logic ---

    const renderContent = () => {
        // const handleLeftSwipe = () => {
        //     router.push('/combinedTest');
        // };
        //
        // const handleRightSwipe = () => {
        //     router.push('/combinedTestTwo');
        // };
        //
        // const panGesture = Gesture.Pan()
        //     .onEnd((event) => {
        //         if (Math.abs(event.translationX) < 50) return;
        //
        //         if (event.translationX < -50) {
        //             runOnJS(handleLeftSwipe)();
        //         } else if (event.translationX > 50) {
        //             runOnJS(handleRightSwipe)();
        //         }
        //     });

        if (isLoading) {
            return <Text style={styles.infoText}>Loading location and heading...</Text>;
        }
        if (errorMsg) {
            return <Text style={[styles.infoText, styles.errorText]}>Error: {errorMsg}</Text>;
        }
        if (targetBearing === null) {
             return <Text style={styles.infoText}>Calculating bearing...</Text>;
        }

        // Convert animated value to rotation style string
        const rotateStyle = {
             transform: [{
                 rotate: rotationAnim.interpolate({
                     inputRange: [-360, 0, 360], // Handle full circle rotations
                     outputRange: ['-360deg', '0deg', '360deg'] // Output as degrees string
                 })
             }]
        };

        return (
            <>
                {/* Informational Text (Optional) */}
                <Text style={styles.infoText}>User Loc: {userLocation?.coords.latitude.toFixed(4)}, {userLocation?.coords.longitude.toFixed(4)}</Text>
                <Text style={styles.infoText}>Target Loc: {targetCoords?.lat.toFixed(4)}, {targetCoords?.lng.toFixed(4)}</Text>
                <Text style={styles.infoText}>Device Heading: {deviceHeading?.toFixed(1)}°</Text>
                <Text style={styles.infoText}>Target Bearing: {targetBearing?.toFixed(1)}°</Text>
                <Text style={styles.infoText}>Dot Rotation: {(targetBearing - deviceHeading).toFixed(1)}°</Text>

                {/* The Pointer Dot */}
                 <View style={styles.pointerContainer}>
                    <Animated.View style={[styles.pointerDot, rotateStyle]}>
                        {/* You can put an arrow or triangle inside the dot if you want directionality */}
                         <View style={styles.dotIndicator} />
                    </Animated.View>
                 </View>

            </>
        );
    };

    return (
        <View style={styles.container}>
            {renderContent()}
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0', // Light background
    },
    infoText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
        color: '#333',
    },
     errorText: {
        color: 'red',
        fontWeight: 'bold',
    },
    pointerContainer: {
        // A larger container to help visualize the rotation center if needed
        width: 150,
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'rgba(0,0,255,0.1)', // Optional: visualize container
        marginTop: 40,
    },
    pointerDot: {
        width: 50, // Size of the rotating element
        height: 50,
        borderRadius: 25, // Make it a circle
        backgroundColor: 'red', // Bright color for visibility
        alignItems: 'center', // Center the indicator if used
        justifyContent: 'flex-start', // Position indicator at the 'top'
        paddingTop: 5, // Padding to position indicator
    },
    dotIndicator: {
        // A small triangle or line inside the dot to show its 'forward' direction
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white', // Color of the indicator
    },
});
