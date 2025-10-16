import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumColors } from '@/constants/designTokens';
import { router } from 'expo-router';
import { triggerHaptic } from '@/utils/haptics';

interface FloatingChatIconProps {
  isAvailable: boolean;
  hasNewMessage?: boolean;
  onPress?: () => void;
}

export default function FloatingChatIcon({ 
  isAvailable, 
  hasNewMessage = false,
  onPress 
}: FloatingChatIconProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(isAvailable ? 1 : 0.3)).current;

  useEffect(() => {
    if (isAvailable) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ),
      ]).start();

      if (hasNewMessage) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(particleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(particleAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAvailable, hasNewMessage, pulseAnim, glowAnim, particleAnim, opacityAnim]);

  const handlePress = () => {
    triggerHaptic('medium');
    if (onPress) {
      onPress();
    } else {
      router.push('/hustle-coach');
    }
  };

  const glowIntensity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const particleScale = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const particleOpacity = particleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {isAvailable && (
            <Animated.View
              style={[
                styles.glowRing,
                {
                  opacity: glowIntensity,
                  borderColor: premiumColors.neonCyan,
                },
              ]}
            />
          )}

          {hasNewMessage && isAvailable && (
            <Animated.View
              style={[
                styles.particleRing,
                {
                  transform: [{ scale: particleScale }],
                  opacity: particleOpacity,
                  borderColor: premiumColors.neonViolet,
                },
              ]}
            />
          )}

          <LinearGradient
            colors={
              isAvailable
                ? [premiumColors.neonCyan, premiumColors.neonViolet]
                : [premiumColors.charcoal, premiumColors.richBlack]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <MessageCircle
              size={28}
              color={isAvailable ? premiumColors.deepBlack : premiumColors.neonCyan}
              strokeWidth={2.5}
            />
          </LinearGradient>

          {hasNewMessage && (
            <View style={styles.badge}>
              <View style={styles.badgeInner} />
            </View>
          )}

          {!isAvailable && (
            <View style={styles.offlineOverlay}>
              <View style={styles.offlineLine} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.select({ ios: 100, android: 90, default: 90 }),
    right: 20,
    zIndex: 1000,
  },
  touchable: {
    width: 64,
    height: 64,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: premiumColors.neonCyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  glowRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
  },
  particleRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  gradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: premiumColors.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
  },
  badgeInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: premiumColors.neonViolet,
  },
  offlineOverlay: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineLine: {
    width: 40,
    height: 2,
    backgroundColor: premiumColors.neonCyan,
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
});
