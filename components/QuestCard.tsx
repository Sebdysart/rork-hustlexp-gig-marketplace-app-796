import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import * as Icons from 'lucide-react-native';

import { Quest, RARITY_COLORS, DIFFICULTY_COLORS } from '@/constants/quests';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';

interface QuestCardProps {
  quest: Quest;
  index: number;
  streakMultiplier: number;
  onComplete?: (questId: string) => void;
}

export default function QuestCard({
  quest,
  index,
  streakMultiplier,
  onComplete,
}: QuestCardProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: quest.progress / quest.target,
      duration: 800,
      delay: index * 50 + 200,
      useNativeDriver: false,
    }).start();

    if (quest.completed) {
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
  }, [index, quest.progress, quest.target, quest.completed]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      triggerHaptic('light');
    }
    if (onComplete && !quest.completed) {
      onComplete(quest.id);
    }
  };

  const IconComponent = (Icons as any)[quest.icon] || Icons.Zap;
  const rarityStyle = RARITY_COLORS[quest.rarity];
  const difficultyColor = DIFFICULTY_COLORS[quest.difficulty];

  const progressPercentage = Math.round((quest.progress / quest.target) * 100);
  const isComplete = quest.completed || quest.progress >= quest.target;

  const adjustedGrit = quest.rewards.grit
    ? Math.round(quest.rewards.grit * streakMultiplier)
    : 0;

  const timeRemaining = getTimeRemaining(quest.expiresAt);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={isComplete}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Quest: ${quest.title}. ${quest.description}. Progress: ${quest.progress} of ${quest.target}. Rewards: ${adjustedGrit} Grit${quest.rewards.xp ? `, ${quest.rewards.xp} XP` : ''}${quest.rewards.taskCredits ? `, ${quest.rewards.taskCredits}` : ''}. ${isComplete ? 'Completed' : timeRemaining}.`}
        accessibilityHint={isComplete ? 'Quest already completed' : 'Double tap to view quest details'}
        accessibilityState={{ disabled: isComplete }}
      >
        <View
          style={[
            styles.card,
            {
              borderColor: rarityStyle.border,
              backgroundColor: rarityStyle.bg,
            },
          ]}
        >
          <LinearGradient
            colors={[rarityStyle.glow, 'transparent']}
            style={styles.cardGradient}
          />

          {isComplete && (
            <Animated.View
              style={[
                styles.completedOverlay,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.6],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan + '40', premiumColors.neonPurple + '40']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}

          <View style={styles.cardContent}>
            <View style={styles.header}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: rarityStyle.border + '20',
                    borderColor: rarityStyle.border,
                  },
                ]}
              >
                <IconComponent color={rarityStyle.border} size={24} />
              </View>

              <View style={styles.headerInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {quest.title}
                  </Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: difficultyColor + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.difficultyText, { color: difficultyColor }]}
                    >
                      {quest.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                  {quest.description}
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {quest.progress} / {quest.target}
                </Text>
                <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[rarityStyle.border, rarityStyle.border + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.rewards}>
                {adjustedGrit > 0 && (
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>⚡</Text>
                    <Text style={styles.rewardText}>
                      {adjustedGrit}
                      {streakMultiplier > 1 && (
                        <Text style={styles.multiplierTag}>
                          {' '}
                          (x{streakMultiplier})
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
                {quest.rewards.taskCredits && quest.rewards.taskCredits > 0 && (
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>💵</Text>
                    <Text style={styles.rewardText}>
                      ${quest.rewards.taskCredits}
                    </Text>
                  </View>
                )}
                {quest.rewards.xp && quest.rewards.xp > 0 && (
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>✨</Text>
                    <Text style={styles.rewardText}>{quest.rewards.xp} XP</Text>
                  </View>
                )}
                {quest.rewards.badge && (
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>🏆</Text>
                    <Text style={styles.rewardText}>Badge</Text>
                  </View>
                )}
              </View>

              <View style={styles.meta}>
                <Text style={styles.timeRemaining}>{timeRemaining}</Text>
                {isComplete && (
                  <View style={styles.completedBadge}>
                    <Icons.CheckCircle2
                      color={premiumColors.neonGreen}
                      size={16}
                    />
                    <Text style={styles.completedText}>COMPLETE</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d remaining`;
  if (hours > 0) return `${hours}h remaining`;

  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m remaining`;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  cardContent: {
    padding: 16,
    gap: 16,
    position: 'relative',
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    gap: 12,
  },
  rewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: premiumColors.glassWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rewardIcon: {
    fontSize: 14,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  multiplierTag: {
    fontSize: 11,
    color: premiumColors.neonPurple,
    fontWeight: '700' as const,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRemaining: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: premiumColors.neonGreen + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
});
