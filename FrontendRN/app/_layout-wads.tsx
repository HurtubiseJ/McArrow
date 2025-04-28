import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import InlineAd from './inLineAd';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      // Request tracking permission (necessary for personalized ads)
      const { status: trackingStatus } = await requestTrackingPermissionsAsync();
      if (trackingStatus !== 'granted') {
        console.log("Tracking permission not granted. Ads may be non-personalized.");
      }

      // Configure AdMob settings (optional)
      await mobileAds().setRequestConfiguration({
        // Update all future requests suitable for parental guidance
        maxAdContentRating: MaxAdContentRating.PG,
        // Indicates that you want your content treated as child-directed for purposes of COPPA.
        tagForChildDirectedTreatment: false,
        // Indicates that you want the ad request to be handled in a
        // manner suitable for users under the age of consent.
        tagForUnderAgeOfConsent: false,
      });

      // Initialize the ads SDK
      try {
        await mobileAds().initialize();
        console.log("Mobile Ads SDK Initialized");
      } catch (error) {
        console.error("Failed to initialize Mobile Ads SDK:", error);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
            <Slot />
      </GestureHandlerRootView>
      <View style={styles.adContainer}>
        <InlineAd />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue', // TEMP: To see SafeAreaView bounds
  },
  contentContainer: {
    flex: 1, // Allows this view to grow and fill available space ABOVE the ad
    backgroundColor: 'lightcoral', // TEMP: To see content bounds
    overflow: 'hidden', // Prevent content from spilling if layout is wrong
  },
  adContainer: {
    // This container will naturally sit below the flex: 1 content
    // Its height will be determined by the InlineAd component's content
    width: '100%', // Ensure it spans the width
    alignItems: 'center', // Center the ad horizontally
    backgroundColor: 'lightgreen', // TEMP: To see ad container bounds
  },
});