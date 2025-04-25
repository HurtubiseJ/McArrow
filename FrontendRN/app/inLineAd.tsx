// InlineAd.tsx

import { View } from 'react-native';
import * as Device from 'expo-device';
import React, { useState } from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const iosAdmobBanner = "ca-app-pub-8480296628203141/1816777413";
const androidAdmobBanner = "ca-app-pub-12345678910/12345678910";
const productionID = Device.osName === 'Android' ? androidAdmobBanner : iosAdmobBanner;
// const productionID = iosAdmobBanner;

const InlineAd = () => {
  const [isAdLoaded, setIsAdLoaded] = useState<boolean>(false);
  return (
    <View style={{ height: isAdLoaded ? 'auto' : 0 }}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : productionID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner Ad loaded successfully');
          setIsAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner Ad failed to load: ', error);
          setIsAdLoaded(false); // Ensure container stays hidden if ad fails
        }}
        // Optional: Add more event listeners for debugging if needed
        // onAdOpened={() => console.log('Ad opened')}
        // onAdClosed={() => console.log('Ad closed')}
      />
    </View >
  );
};

export default InlineAd;
