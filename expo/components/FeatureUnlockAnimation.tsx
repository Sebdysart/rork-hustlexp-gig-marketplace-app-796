import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Lock, Unlock } from 'lucide-react-native';
import { COLORS } from '@/constants/designTokens';
import React from "react";

const { width, height } = Dimensions.get('window');

interface FeatureUnlockAnimationProps {
  featureName: string;
  featureIcon: React.ComponentType<any>;
  featureColor: string;
  level: number;
  onComplete: () => void;
}

export default function FeatureUnlockAnimation({
  featureName,
  featureIcon: Icon,
  featureColor,
  level,
  onComplete,
}: FeatureUnlockAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const lockRotateAnim = useRef(new Animated.Value(0)).current;
  const unlockScaleAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(lockRotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(unlockScaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(100),
      Animated.parallel([
        ...particleAnims.map((anim, index) => {
          const angle = (index / particleAnims.length) * Math.PI * 2;
          const distance = 100;
          return Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: 800,
              useNativeDriver: true,
            }),
          ]);
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
          ])
        ),
      ]),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    sequence.start(() => {
      onComplete();
    });
  }, []);

  const lockRotate = lockRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.background.secondary, COLORS.background.primary] as [string, string, ...string[]]}
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.glowCircle,
                {
                  backgroundColor: featureColor + '40',
                  opacity: glowOpacity,
                },
              ]}
            />

            {particleAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    opacity: anim.opacity,
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: anim.translateY },
                    ],
                  },
                ]}
              >
                <Sparkles size={12} color={featureColor} />
              </Animated.View>
            ))}

            <View style={[styles.iconCircle, { backgroundColor: featureColor + '20' }]}>
              <Icon size={64} color={featureColor} />
            </View>

            <Animated.View
              style={[
                styles.lockIcon,
                {
                  transform: [{ rotate: lockRotate }],
                  opacity: lockRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
            >
              <Lock size={32} color="#EF4444" />
            </Animated.View>

            <Animated.View
              style={[
                styles.unlockIcon,
                {
                  transform: [{ scale: unlockScaleAnim }],
                  opacity: unlockScaleAnim,
                },
              ]}
            >
              <Unlock size={32} color="#10B981" />
            </Animated.View>
          </View>

          <Text style={styles.title}>Feature Unlocked!</Text>
          <Text style={styles.featureName}>{featureName}</Text>
          <Text style={styles.level}>Level {level} Reward</Text>
          <Text style={styles.description}>
            Tap to explore this new feature
          </Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 9999,
  },
  content: {
    width: width * 0.85,
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    position: 'relative' as const,
    width: 140,
    height: 140,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  glowCircle: {
    position: 'absolute' as const,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  particle: {
    position: 'absolute' as const,
  },
  lockIcon: {
    position: 'absolute' as const,
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  unlockIcon: {
    position: 'absolute' as const,
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  featureName: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: '#06B6D4',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  level: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFD700',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  description: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
