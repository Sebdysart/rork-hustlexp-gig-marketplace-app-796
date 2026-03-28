import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { premiumColors, typography, spacing } from '@/constants/designTokens';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color?: string;
  gradientColors?: string[];
  label?: string;
  value?: string;
  animated?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularProgress({
  size,
  strokeWidth,
  progress,
  color = premiumColors.neonCyan,
  gradientColors,
  label,
  value,
  animated = true,
}: CircularProgressProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedProgress, {
        toValue: progress,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      animatedProgress.setValue(progress);
    }
  }, [progress, animated, animatedProgress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          {gradientColors && (
            <SvgGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </SvgGradient>
          )}
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={premiumColors.glassWhite}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientColors ? 'url(#gradient)' : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        {value && (
          <Text style={[styles.value, { color }]} numberOfLines={1}>
            {value}
          </Text>
        )}
        {label && (
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
  },
});
