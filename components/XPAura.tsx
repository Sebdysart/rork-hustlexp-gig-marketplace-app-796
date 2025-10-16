import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumColors } from '@/constants/designTokens';

interface XPAuraProps {
  level: number;
  size: number;
}

export default function XPAura({ level, size }: XPAuraProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
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

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim, rotateAnim, glowAnim]);

  const getAuraColors = (): [string, string, string, string] => {
    if (level >= 100) return [premiumColors.neonAmber, premiumColors.neonMagenta, premiumColors.neonViolet, premiumColors.neonAmber];
    if (level >= 50) return [premiumColors.neonViolet, premiumColors.neonMagenta, premiumColors.neonCyan, premiumColors.neonViolet];
    if (level >= 25) return [premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonViolet, premiumColors.neonCyan];
    if (level >= 10) return [premiumColors.neonBlue, premiumColors.neonCyan, premiumColors.neonGreen, premiumColors.neonBlue];
    return [premiumColors.neonGreen, premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonGreen];
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateReverse = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const glowOpacity = glowAnim;

  const auraColors = getAuraColors();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {Platform.OS !== 'web' && (
        <>
          <Animated.View
            style={[
              styles.auraRing,
              {
                width: size * 1.3,
                height: size * 1.3,
                transform: [{ scale: pulseAnim }, { rotate }],
              },
            ]}
          >
            <Animated.View style={[styles.gradientWrapper, { opacity: glowOpacity }]}>
              <LinearGradient
                colors={auraColors}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={[
              styles.auraRing,
              {
                width: size * 1.15,
                height: size * 1.15,
                transform: [{ scale: pulseAnim }, { rotate: rotateReverse }],
              },
            ]}
          >
            <Animated.View style={[styles.gradientWrapper, { opacity: glowOpacity }]}>
              <LinearGradient
                colors={[auraColors[1], auraColors[2], auraColors[0]]}
                style={styles.gradient}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </Animated.View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  auraRing: {
    position: 'absolute',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 1000,
  },
  gradientWrapper: {
    flex: 1,
  },
});
