import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getTierForLevel,
  getNextTier,
  getProgressToNextTier,
  getLevelsUntilNextTier,
  isNearNextTier,
} from '@/constants/ascensionTiers';
import { Zap } from 'lucide-react-native';

interface TierProgressIndicatorProps {
  currentLevel: number;
  currentXP: number;
  compact?: boolean;
}

export default function TierProgressIndicator({
  currentLevel,
  currentXP,
  compact = false,
}: TierProgressIndicatorProps) {
  const currentTier = getTierForLevel(currentLevel);
  const nextTier = getNextTier(currentLevel);
  const progress = getProgressToNextTier(currentLevel);
  const levelsRemaining = getLevelsUntilNextTier(currentLevel);
  const isNear = isNearNextTier(currentLevel, 0.8);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isNear && nextTier) {
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
    }
  }, [isNear, nextTier, glowAnim, pulseAnim]);

  if (!nextTier) {
    return (
      <View style={styles.maxTierContainer}>
        <LinearGradient
          colors={[currentTier.theme.gradientStart, currentTier.theme.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.maxTierGradient}
        >
          <Text style={styles.maxTierText}>🏆 MAX TIER ACHIEVED</Text>
          <Text style={styles.maxTierSubtext}>{currentTier.name}</Text>
        </LinearGradient>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTierName}>{currentTier.name}</Text>
          {isNear && (
            <Animated.View
              style={[
                styles.nearBadge,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ]}
            >
              <Zap size={12} color="#FCD34D" fill="#FCD34D" />
              <Text style={styles.nearBadgeText}>SO CLOSE!</Text>
            </Animated.View>
          )}
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: currentTier.theme.glowColor }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: currentTier.theme.accentColor,
                },
              ]}
            />
          </View>
        </View>
        <Text style={styles.compactProgressText}>
          {levelsRemaining} level{levelsRemaining !== 1 ? 's' : ''} to {nextTier.name}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isNear && {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[
          currentTier.theme.gradientStart,
          currentTier.theme.secondaryColor || currentTier.theme.gradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {isNear && (
          <Animated.View
            style={[
              styles.glowOverlay,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.4],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', nextTier.theme.accentColor, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        <View style={styles.tierInfo}>
          <View style={styles.currentTierSection}>
            <Text style={styles.currentTierLabel}>Current Tier</Text>
            <Text style={styles.currentTierName}>{currentTier.name}</Text>
            <Text style={styles.currentTierLevel}>Level {currentLevel}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.nextTierSection}>
            <Text style={styles.nextTierLabel}>Next Tier</Text>
            <Text style={styles.nextTierName}>{nextTier.name}</Text>
            <Text style={styles.nextTierLevel}>Level {nextTier.minLevel}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: isNear
                      ? nextTier.theme.accentColor
                      : currentTier.theme.accentColor,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.progressStats}>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            <Text style={styles.levelsText}>
              {levelsRemaining} level{levelsRemaining !== 1 ? 's' : ''} remaining
            </Text>
          </View>
        </View>

        {isNear && (
          <Animated.View
            style={[
              styles.nearContainer,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ]}
          >
            <Zap size={20} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.nearText}>
              You&apos;re SO close to {nextTier.name} tier!
            </Text>
          </Animated.View>
        )}

        <View style={styles.benefitsPreview}>
          <Text style={styles.benefitsTitle}>Unlock at {nextTier.name}:</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>
              ⚡ {nextTier.xpMultiplier}x XP Multiplier (+
              {((nextTier.xpMultiplier - currentTier.xpMultiplier) * 100).toFixed(0)}%)
            </Text>
            <Text style={styles.benefitItem}>
              💰 {nextTier.platformFee}% Platform Fee (save{' '}
              {currentTier.platformFee - nextTier.platformFee}%)
            </Text>
            <Text style={styles.benefitItem}>🎯 {nextTier.priorityMatching} Matching</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 16,
  },
  gradient: {
    padding: 20,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentTierSection: {
    flex: 1,
  },
  currentTierLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  currentTierName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  currentTierLevel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  divider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  nextTierSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  nextTierLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  nextTierName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  nextTierLevel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressTrack: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  levelsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  nearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  nearText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FCD34D',
  },
  benefitsPreview: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  compactContainer: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactTierName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  nearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nearBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    marginBottom: 6,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  compactProgressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  maxTierContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
  },
  maxTierGradient: {
    padding: 24,
    alignItems: 'center',
  },
  maxTierText: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  maxTierSubtext: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.9)',
  },
});
