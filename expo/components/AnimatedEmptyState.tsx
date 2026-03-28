import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, type ReactNode } from 'react';
import { premiumColors, spacing, typography, borderRadius } from '@/constants/designTokens';
import GlassCard from './GlassCard';
import React from "react";

interface AnimatedEmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionButton?: ReactNode;
}

export function AnimatedEmptyState({ icon, title, description, actionButton }: AnimatedEmptyStateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [fadeAnim, scaleAnim, bounceAnim]);

  return (
    <GlassCard variant="dark" style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </Animated.View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {actionButton && <View style={styles.actionContainer}>{actionButton}</View>}
      </Animated.View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.neonCyan + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '30',
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: premiumColors.softWhite,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.base,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  actionContainer: {
    marginTop: spacing.md,
    width: '100%',
  },
});
