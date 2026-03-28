import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { User } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { getTierForLevel } from '@/constants/ascensionTiers';
import { getAllCategoryBadges } from '@/constants/categoryBadges';
import { getUnlockedAchievements } from '@/constants/achievements';
import { Shield, Flame, Star, Trophy } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';

interface HustlerProfileCardProps {
  user: User;
  isPublic?: boolean;
}

export default function HustlerProfileCard({ user, isPublic = false }: HustlerProfileCardProps) {
  const tier = getTierForLevel(user.level);
  const categoryBadges = getAllCategoryBadges(user.genreTasksCompleted || {});
  const topBadges = categoryBadges.slice(0, 3);
  const achievements = getUnlockedAchievements(user);
  const topAchievements = achievements.slice(0, 3);
  
  const displayName = isPublic && user.gamertag ? user.gamertag : user.name;
  const trustScore = user.trustScore?.overall || 0;
  const completionRate = user.tasksCompleted > 0 
    ? ((user.tasksCompleted / (user.tasksCompleted + (user.strikes?.length || 0))) * 100).toFixed(1)
    : '100';

  const progressToNextTier = ((user.level - tier.minLevel) / (tier.maxLevel - tier.minLevel)) * 100;
  
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[tier.theme.gradientStart, tier.theme.gradientEnd]}
        style={styles.gradient}
      >
        <Animated.View style={[styles.glowEffect, { opacity: glowOpacity }]}>
          <LinearGradient
            colors={[tier.theme.glowColor, 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        <View style={styles.header}>
          <Text style={styles.gamertag}>{displayName}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>⭐ {tier.name.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressToNextTier}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progressToNextTier)}% to {tier.id === 'prestige' ? 'MAX' : 'next tier'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Level {user.level}</Text>
            <Text style={styles.statLabel}>{user.xp.toLocaleString()} XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.trustRow}>
              <Shield size={16} color="#10B981" />
              <Text style={styles.statValue}>{trustScore}</Text>
            </View>
            <Text style={styles.statLabel}>Trust Score</Text>
          </View>
        </View>

        {user.streaks && user.streaks.current > 0 && (
          <View style={styles.streakBanner}>
            <Flame size={16} color="#F59E0B" />
            <Text style={styles.streakText}>{user.streaks.current}-Day Streak</Text>
            <View style={styles.fireContainer}>
              <Text style={styles.fireEmoji}>🔥</Text>
              {user.streaks.current >= 7 && <Text style={styles.fireEmoji}>🔥</Text>}
              {user.streaks.current >= 30 && <Text style={styles.fireEmoji}>🔥</Text>}
            </View>
          </View>
        )}
      </LinearGradient>

      {topBadges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SPECIALTIES</Text>
            <TouchableOpacity onPress={() => router.push('/badge-library')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgesGrid}>
            {topBadges.map((badge, index) => {
              if (!badge || !badge.currentTier) return null;
              return (
                <View key={index} style={styles.badgeCard}>
                  <Text style={[styles.badgeIcon, { color: badge.currentTier.color }]}>
                    {badge.currentTier.icon}
                  </Text>
                  <Text style={styles.badgeCategory}>{badge.category.toUpperCase()}</Text>
                  <Text style={styles.badgeTier}>{badge.currentTier.name}</Text>
                  <Text style={styles.badgeCount}>({badge.completedTasks})</Text>
                  {badge.currentTier.animation !== 'none' && (
                    <View style={[styles.badgeGlow, { backgroundColor: badge.currentTier.glowColor }]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {topAchievements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FEATURED ACHIEVEMENTS</Text>
            <TouchableOpacity onPress={() => router.push('/trophy-room')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsContainer}>
            {topAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementRarity}>
                    Rarity: {achievement.rarityPercent}% of hustlers
                  </Text>
                </View>
                <Text style={styles.achievementXP}>+{achievement.xpBonus} XP</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Star size={20} color="#F59E0B" />
            <Text style={styles.statCardValue}>{completionRate}%</Text>
            <Text style={styles.statCardLabel}>Completion Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={20} color="#10B981" />
            <Text style={styles.statCardValue}>{achievements.length}</Text>
            <Text style={styles.statCardLabel}>Achievements</Text>
          </View>
        </View>
      </View>

      {isPublic && (
        <View style={styles.privacyNote}>
          <Shield size={14} color="#64748B" />
          <Text style={styles.privacyText}>
            Real identity revealed after task acceptance
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    marginBottom: 16,
  },
  gamertag: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tierText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600' as const,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  fireContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  fireEmoji: {
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#0F172A',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#7C3AED',
  },
  badgesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeCategory: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#64748B',
    marginBottom: 4,
  },
  badgeTier: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#0F172A',
    textAlign: 'center',
  },
  badgeCount: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badgeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 4,
  },
  achievementRarity: {
    fontSize: 11,
    color: '#64748B',
  },
  achievementXP: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#0F172A',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic' as const,
  },
});
