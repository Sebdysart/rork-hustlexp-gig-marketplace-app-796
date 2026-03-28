import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, ViewStyle, Platform } from 'react-native';

import { glassmorphism, borderRadius, elevation, premiumColors } from '@/constants/designTokens';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'dark' | 'darkStrong';
  glowColor?: keyof typeof premiumColors;
  animated?: boolean;
  style?: ViewStyle;
  neonBorder?: boolean;
}

export default function GlassCard({
  children,
  variant = 'light',
  glowColor,
  animated = false,
  style,
  neonBorder = false,
}: GlassCardProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, floatAnim, pulseAnim]);

  const glassStyle = glassmorphism[variant];
  const animatedStyle = animated
    ? {
        transform: [{ translateY: floatAnim }, { scale: pulseAnim }],
      }
    : {};

  if (neonBorder && glowColor) {
    const borderColor = premiumColors[glowColor];
    return (
      <Animated.View style={[styles.container, animatedStyle, style]}>
        <View style={[styles.neonBorder, { borderColor, shadowColor: borderColor }]}>
          <View
            style={[
              styles.glassCard,
              {
                backgroundColor: glassStyle.backgroundColor,
                borderColor: glassStyle.borderColor,
                borderWidth: glassStyle.borderWidth,
              },
            ]}
          >
            {children}
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.glassCard,
        {
          backgroundColor: glassStyle.backgroundColor,
          borderColor: glassStyle.borderColor,
          borderWidth: glassStyle.borderWidth,
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
  glassCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(20px)',
      },
      android: {
        ...elevation.medium,
      },
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  neonBorder: {
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    padding: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
});
