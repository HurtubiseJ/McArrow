// filepath: /Users/cullenbaker/code/McArrow/FrontendRN/app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import InlineAd from './inLineAd'; // Import the ad component

export default function RootLayout() {
  // Initialize Google Mobile Ads SDK
  useEffect(() => {
    (async () => {
      // Request tracking permission (necessary for personalized ads)
      const { status: trackingStatus } = await requestTrackingPermissionsAsync();
      if (trackingStatus !== 'granted') {
        console.log("Tracking permission not granted. Ads may be non-personalized.");
        // Consider setting requestNonPersonalizedAdsOnly based on this status
        // or using a state management solution to pass this preference to InlineAd
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
      <Stack screenOptions={{ headerShown: false }} />
      {/* Place the InlineAd component at the bottom */}
      <View style={styles.adContainer}>
        <InlineAd />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adContainer: {
    // Position the ad container at the bottom
    // The InlineAd component itself controls its height based on load status
  },
});