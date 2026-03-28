import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getXPProgress, getXPForNextLevel } from '@/utils/gamification';
import { premiumColors, neonGlow } from '@/constants/designTokens';
import GlassCard from './GlassCard';
import { useSettings } from '@/contexts/SettingsContext';

interface FloatingHUDProps {
  currentXP: number;
  level: number;
  streakCount: number;
  onStreakPress?: () => void;
}

export default function FloatingHUD({ currentXP, level, streakCount, onStreakPress }: FloatingHUDProps) {
  const { settings } = useSettings();
  const progress = getXPProgress(currentXP);
  const nextLevelXP = getXPForNextLevel(currentXP);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (settings.reducedMotion) {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.4);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

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
    ).start();
  }, [settings.reducedMotion, pulseAnim, glowAnim]);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(246, 158, 11, 0.2)', 'rgba(246, 158, 11, 0.6)'],
  });

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={`Level ${level}. ${currentXP} out of ${nextLevelXP} experience points. ${streakCount > 0 ? `${streakCount} day streak` : 'No active streak'}.`}
      accessibilityRole="text"
    >
      <GlassCard variant="darkStrong" style={styles.hudContainer}>
        <View style={styles.leftSection}>
          <View style={styles.levelBadge}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.levelGradient}
            >
              <Zap size={16} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.levelText}>{level}</Text>
            </LinearGradient>
          </View>

          <View style={styles.xpContainer}>
            <View style={styles.xpBarBackground}>
              <Animated.View style={[styles.xpBarGlow, { backgroundColor: glowColor }]} />
              <LinearGradient
                colors={[Colors.primary, Colors.secondary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.xpText}>
              {currentXP} / {nextLevelXP}
            </Text>
          </View>
        </View>

        {streakCount > 0 && (
          <TouchableOpacity 
            style={styles.streakBadge} 
            onPress={onStreakPress}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`${streakCount} day streak. Tap for details.`}
            accessibilityRole="button"
            accessibilityHint="View streak details and bonuses"
          >
            <Animated.View style={{ transform: settings.reducedMotion ? [] : [{ scale: pulseAnim }] }}>
              <Sparkles size={14} color={Colors.accent} />
            </Animated.View>
            <Text style={styles.streakText}>{streakCount} 🔥</Text>
          </TouchableOpacity>
        )}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 10, default: 10 }),
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  hudContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    ...neonGlow.cyan,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  levelGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  xpContainer: {
    flex: 1,
    gap: 4,
  },
  xpBarBackground: {
    height: 12,
    backgroundColor: premiumColors.glassDark,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  xpBarGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1.5,
    borderColor: premiumColors.neonAmber,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
