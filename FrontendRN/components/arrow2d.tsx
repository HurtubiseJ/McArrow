import React from 'react';
import { View, StyleSheet, ViewStyle, Text, TextStyle } from 'react-native';

interface ArrowProps {
  /**
   * Color of the arrow (hex, rgb, or named color)
   */
  color: string;
  /**
   * Bearing in degrees (0 = pointing up)
   */
  bearing: number;
  /**
   * Size of the arrow head (defaults to 50)
   */
  size?: number;
  /**
   * Optional label text to display below the arrow
   */
  label?: string;
}

/**
 * Arrow component
 */
const Arrow: React.FC<ArrowProps> = ({ color, bearing, size = 70, label }) => {
  const headSize = size;
  const stemWidth = headSize * 0.35;
  const stemLength = headSize * 0.75;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.arrowContainer, { transform: [{ rotate: `${bearing-45}deg` }] }]}>      
        <View
          style={[
            styles.head,
            {
              borderLeftWidth: headSize / 2,
              borderRightWidth: headSize / 2,
              borderBottomWidth: headSize,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: color,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 4,
            },
          ]}
        />

        <View
          style={[
            styles.stem,
            {
              backgroundColor: color,
              width: stemWidth,
              height: stemLength,
              marginTop: -1, // slight overlap with head base
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 1.5,
              elevation: 3,
            },
          ]}
        />
      </View>

      {/* Optional label below arrow */}
      {label ? (
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  } as ViewStyle,
  head: {
    width: 0,
    height: 0,
  } as ViewStyle,
  stem: {} as ViewStyle,
  label: {
    marginTop: 15,
    fontSize: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 0.5,
    elevation: 1,
  } as TextStyle,
});

export default Arrow;

// Usage Example:
// <Arrow color="#FF0000" bearing={135} size={60} label="Store A" />
