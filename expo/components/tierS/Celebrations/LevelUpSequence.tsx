import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { typography, spacing, premiumColors } from '@/constants/designTokens';

interface LevelUpSequenceProps {
  level: number;
  active: boolean;
  onComplete?: () => void;
}

export default function LevelUpSequence({
  level,
  active,
  onComplete,
}: LevelUpSequenceProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      glowAnim.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        ),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [active, scaleAnim, opacityAnim, glowAnim, onComplete]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
            },
          ]}
        />
        <Text style={styles.title}>LEVEL UP!</Text>
        <Text style={styles.level}>{level}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: premiumColors.neonCyan,
    borderRadius: 9999,
    transform: [{ scale: 1.5 }],
  },
  title: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.heavy as any,
    color: premiumColors.neonCyan,
    textShadowColor: premiumColors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: spacing.md,
  },
  level: {
    fontSize: 72,
    fontWeight: typography.weights.heavy as any,
    color: '#FFFFFF',
    textShadowColor: premiumColors.neonViolet,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
