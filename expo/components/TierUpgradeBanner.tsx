import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getNextTier,
  getLevelsUntilNextTier,
  isNearNextTier,
} from '@/constants/ascensionTiers';
import { Zap, X } from 'lucide-react-native';

interface TierUpgradeBannerProps {
  currentLevel: number;
  onDismiss?: () => void;
  onViewDetails?: () => void;
}

export default function TierUpgradeBanner({
  currentLevel,
  onDismiss,
  onViewDetails,
}: TierUpgradeBannerProps) {
  const nextTier = getNextTier(currentLevel);
  const levelsRemaining = getLevelsUntilNextTier(currentLevel);
  const isNear = isNearNextTier(currentLevel, 0.8);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isNear && nextTier) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isNear, nextTier, slideAnim, pulseAnim, glowAnim]);

  if (!isNear || !nextTier) {
    return null;
  }

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.95} onPress={onViewDetails}>
        <LinearGradient
          colors={['#FCD34D', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Animated.View
            style={[
              styles.glowOverlay,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', '#FFFFFF', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Zap size={24} color="#000000" fill="#000000" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {levelsRemaining === 1
                  ? `One level to ${nextTier.name}!`
                  : `${levelsRemaining} levels to ${nextTier.name}!`}
              </Text>
              <Text style={styles.subtitle}>
                {levelsRemaining === 1 ? 'Complete 1 more task' : 'You\'re so close!'}
              </Text>
            </View>

            {onDismiss && (
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <X size={20} color="#000000" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.benefitsPreview}>
            <Text style={styles.benefitText}>
              ⚡ {nextTier.xpMultiplier}x XP
            </Text>
            <Text style={styles.benefitText}>
              💰 {nextTier.platformFee}% Fee
            </Text>
            <Text style={styles.benefitText}>
              🎯 {nextTier.priorityMatching}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    padding: 16,
    position: 'relative',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#000000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(0,0,0,0.7)',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  benefitsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#000000',
  },
});
