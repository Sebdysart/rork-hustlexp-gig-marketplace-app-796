import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Lock, CheckCircle, Target } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';
import GlassCard from '@/components/GlassCard';

interface BadgeProgressItem {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  currentProgress: number;
  requiredProgress: number;
  category: string;
  unlocked: boolean;
}

interface BadgeProgressTrackerProps {
  badges: BadgeProgressItem[];
  onBadgePress?: (badgeId: string) => void;
}

const rarityColors = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

export default function BadgeProgressTracker({
  badges,
  onBadgePress,
}: BadgeProgressTrackerProps) {
  const progressAnims = useRef(
    badges.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    badges.forEach((badge, index) => {
      if (progressAnims[index]) {
        Animated.spring(progressAnims[index], {
          toValue: (badge.currentProgress / badge.requiredProgress) * 100,
          tension: 50,
          friction: 7,
          useNativeDriver: false,
        }).start();
      }
    });
  }, [badges]);

  const nearlyComplete = badges
    .filter((b) => !b.unlocked && b.currentProgress / b.requiredProgress >= 0.5)
    .sort((a, b) => 
      (b.currentProgress / b.requiredProgress) - (a.currentProgress / a.requiredProgress)
    )
    .slice(0, 5);

  if (nearlyComplete.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Target size={24} color={premiumColors.neonCyan} />
        <Text style={styles.title}>Badge Progress</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {nearlyComplete.map((badge, index) => {
          const percentage = (badge.currentProgress / badge.requiredProgress) * 100;
          const animatedWidth = progressAnims[badges.indexOf(badge)];

          return (
            <TouchableOpacity
              key={badge.id}
              style={styles.badgeCard}
              onPress={() => {
                triggerHaptic('medium');
                onBadgePress?.(badge.id);
              }}
              activeOpacity={0.8}
            >
              <GlassCard
                variant="darkStrong"
                neonBorder
                glowColor="neonCyan"
                style={styles.card}
              >
                <LinearGradient
                  colors={[
                    rarityColors[badge.rarity] + '20',
                    Colors.surface,
                  ]}
                  style={styles.cardGradient}
                >
                  <View style={styles.badgeHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        { borderColor: rarityColors[badge.rarity] },
                      ]}
                    >
                      <Text style={styles.icon}>{badge.icon}</Text>
                    </View>
                    {badge.unlocked ? (
                      <View style={styles.statusBadge}>
                        <CheckCircle size={16} color="#10B981" />
                      </View>
                    ) : (
                      <View style={styles.statusBadge}>
                        <Lock size={16} color={Colors.textSecondary} />
                      </View>
                    )}
                  </View>

                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName} numberOfLines={2}>
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeCategory}>{badge.category}</Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            width: animatedWidth.interpolate({
                              inputRange: [0, 100],
                              outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: rarityColors[badge.rarity],
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressTextContainer}>
                      <Text style={styles.progressText}>
                        {badge.currentProgress} / {badge.requiredProgress}
                      </Text>
                      <Text style={styles.percentageText}>
                        {percentage.toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.trendingBadge}>
                    <TrendingUp size={14} color={premiumColors.neonCyan} />
                    <Text style={styles.trendingText}>Almost there!</Text>
                  </View>
                </LinearGradient>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollContent: {
    gap: 12,
    paddingHorizontal: 16,
  },
  badgeCard: {
    width: 180,
  },
  card: {
    padding: 0,
  },
  cardGradient: {
    padding: 16,
    gap: 12,
    borderRadius: 16,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  statusBadge: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 6,
  },
  badgeInfo: {
    gap: 4,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 18,
  },
  badgeCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: premiumColors.neonCyan + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
});
