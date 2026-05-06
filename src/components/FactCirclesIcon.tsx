import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

interface Props {
  size?: number;
  rotating?: boolean;
  color?: string;
}

const logo = require('../../assets/images/splash.png');

export default function FactCirclesIcon({ size = 48, rotating = false }: Props) {
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

  const img = <Image source={logo} style={{ width: size, height: size, resizeMode: 'contain' }} />;

  return rotating ? (
    <Animated.View style={[styles.container, { transform: [{ rotate }] }]}>
      {img}
    </Animated.View>
  ) : (
    <View style={styles.container}>{img}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
