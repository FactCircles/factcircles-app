// src/components/FactCirclesIcon.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { Colors } from '../utils/theme';

interface Props {
  size?: number;
  rotating?: boolean;
  color?: string;
}

export default function FactCirclesIcon({ size = 48, rotating = false, color = Colors.primary }: Props) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rotating) {
      const animation = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    } else {
      spin.setValue(0);
    }
  }, [rotating, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const iconSvg = (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Outer ring */}
      <Circle cx="50" cy="50" r="48" stroke={color} strokeWidth="3" fill="none" />
      {/* Inner circle — center */}
      <Circle cx="50" cy="50" r="8" fill={color} />
      {/* 6 participant circles arranged in a ring */}
      <G>
        <Circle cx="50" cy="14" r="7" fill={color} opacity="0.9" />
        <Circle cx="79" cy="26" r="7" fill={color} opacity="0.75" />
        <Circle cx="79" cy="74" r="7" fill={color} opacity="0.6" />
        <Circle cx="50" cy="86" r="7" fill={color} opacity="0.75" />
        <Circle cx="21" cy="74" r="7" fill={color} opacity="0.9" />
        <Circle cx="21" cy="26" r="7" fill={color} opacity="0.6" />
      </G>
      {/* Connecting lines */}
      <Path
        d="M50 22 L79 34 M79 66 L79 34 M79 66 L50 78 M50 78 L21 66 M21 34 L21 66 M21 34 L50 22"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.4"
        fill="none"
      />
      {/* Center spokes */}
      <Path
        d="M50 42 L50 22 M50 42 L67 33 M50 42 L67 58 M50 58 L50 78 M50 58 L33 67 M50 58 L33 33"
        stroke={color}
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      />
    </Svg>
  );

  return rotating ? (
    <Animated.View style={[styles.container, { transform: [{ rotate }] }]}>
      {iconSvg}
    </Animated.View>
  ) : (
    <View style={styles.container}>{iconSvg}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
