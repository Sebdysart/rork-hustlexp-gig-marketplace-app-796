import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumColors, spacing, typography, borderRadius, neonGlow } from '@/constants/designTokens';

interface HustleAIAssistantProps {
  message: string;
  visible: boolean;
  onComplete?: () => void;
  variant?: 'default' | 'success' | 'info' | 'warning';
}

export default function HustleAIAssistant({ 
  message, 
  visible, 
  onComplete,
  variant = 'default' 
}: HustleAIAssistantProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, pulseAnim]);

  useEffect(() => {
    if (visible && currentIndex < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(message.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= message.length && onComplete) {
      const timeout = setTimeout(onComplete, 2000);
      return () => clearTimeout(timeout);
    }
  }, [visible, currentIndex, message, onComplete]);

  useEffect(() => {
    if (visible) {
      setDisplayedText('');
      setCurrentIndex(0);
    }
  }, [message, visible]);

  if (!visible) return null;

  const gradientColors = {
    default: [premiumColors.neonCyan, premiumColors.neonViolet] as const,
    success: [premiumColors.neonGreen, premiumColors.neonCyan] as const,
    info: [premiumColors.neonBlue, premiumColors.neonCyan] as const,
    warning: [premiumColors.neonAmber, premiumColors.neonOrange] as const,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Sparkles size={20} color={premiumColors.deepBlack} strokeWidth={2.5} />
          </Animated.View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>HustleAI</Text>
            <Text style={styles.message}>{displayedText}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...neonGlow.cyan,
  },
  gradient: {
    padding: 2,
    borderRadius: borderRadius.lg,
  },
  content: {
    backgroundColor: premiumColors.deepBlack,
    borderRadius: borderRadius.lg - 2,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonCyan,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
});
