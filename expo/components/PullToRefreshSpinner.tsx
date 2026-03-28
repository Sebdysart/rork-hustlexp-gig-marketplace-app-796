import { View, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { premiumColors } from '@/constants/designTokens';
import { LinearGradient } from 'expo-linear-gradient';

interface PullToRefreshSpinnerProps {
  size?: number;
}

export function PullToRefreshSpinner({ size = 40 }: PullToRefreshSpinnerProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotateAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ rotate }, { scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[premiumColors.neonCyan, premiumColors.neonViolet, premiumColors.neonMagenta]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
        />
        <View style={[styles.innerCircle, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    backgroundColor: premiumColors.deepBlack,
  },
});
