import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Zap,
  Trophy,
  TrendingUp,
  Flame,
  Target,
  Star,
  Award,
  ArrowRight,
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  Users,
} from 'lucide-react-native';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import { maxPotentialService, MaxPotentialDashboardResponse } from '@/services/backend/maxPotential';
import { useSensory } from '@/hooks/useSensory';
import CircularProgress from '@/components/CircularProgress';
import GlassCard from '@/components/GlassCard';
import React from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sensory = useSensory();

  const [dashboardData, setDashboardData] = useState<MaxPotentialDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadDashboard();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadDashboard = async () => {
    try {
      setError(null);
      const data = await maxPotentialService.getDashboard(true);
      setDashboardData(data);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading && !dashboardData) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#000814', '#001845', '#000814']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Zap size={80} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
          </Animated.View>
          <Text style={styles.loadingText}>Loading Your Dashboard...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#000814', '#001845', '#000814']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={loadDashboard}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { user, matches, progression, todayStats, recentActivity, suggestions } = dashboardData;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#000814', '#001845', '#000814']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={premiumColors.neonCyan}
            colors={[premiumColors.neonCyan]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              sensory.tap();
              router.push('/profile');
            }}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonMagenta]}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{user.name[0]}</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.mainStatsRow}>
          <GlassCard style={styles.statCardLarge}>
            <View style={styles.statCardContent}>
              <CircularProgress
                progress={(user.currentXP / user.xpToNextLevel) * 100}
                size={80}
                strokeWidth={8}
                color={premiumColors.neonCyan}
              />
              <View style={styles.statCardInfo}>
                <Text style={styles.statLabel}>Level {user.currentLevel}</Text>
                <Text style={styles.statValue}>{user.currentXP} XP</Text>
                <Text style={styles.statSubtext}>
                  {user.xpToNextLevel - user.currentXP} to next level
                </Text>
              </View>
            </View>
          </GlassCard>

          <View style={styles.statCardColumn}>
            <GlassCard style={styles.statCardSmall}>
              <View style={styles.iconBadge}>
                <DollarSign size={20} color={premiumColors.neonAmber} />
              </View>
              <Text style={styles.statValue}>{user.gritCoins.toLocaleString()}</Text>
              <Text style={styles.statLabel}>GritCoins</Text>
            </GlassCard>

            <GlassCard style={styles.statCardSmall}>
              <View style={styles.iconBadge}>
                <Flame size={20} color="#FF6B35" />
              </View>
              <Text style={styles.statValue}>{user.dailyStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </GlassCard>
          </View>
        </View>

        <GlassCard style={styles.tierCard}>
          <LinearGradient
            colors={[
              premiumColors.neonCyan + '20',
              premiumColors.neonMagenta + '20',
            ]}
            style={styles.tierGradient}
          >
            <View style={styles.tierHeader}>
              <View style={styles.tierInfo}>
                <Text style={styles.tierLabel}>Current Tier</Text>
                <Text style={styles.tierName}>{user.tier}</Text>
              </View>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Trophy size={32} color={premiumColors.neonAmber} />
              </Animated.View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[premiumColors.neonCyan, premiumColors.neonMagenta]}
                  style={[styles.progressFill, { width: `${user.tierProgress}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressText}>{user.tierProgress}% to next tier</Text>
            </View>
          </LinearGradient>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Instant Matches</Text>
          <Text style={styles.sectionSubtitle}>Perfect for your skills</Text>
        </View>

        {matches.instant.length > 0 ? (
          matches.instant.slice(0, 3).map((task) => (
            <TouchableOpacity
              key={task.taskId}
              onPress={() => {
                sensory.tap();
                router.push(`/task/${task.taskId}`);
              }}
            >
              <GlassCard style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.matchScoreBadge}>
                    <Star size={14} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                    <Text style={styles.matchScoreText}>{Math.round(task.matchScore * 100)}%</Text>
                  </View>
                  <View style={[styles.urgencyBadge, styles[`urgency${task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)}` as keyof typeof styles]]}>
                    <Text style={styles.urgencyText}>{task.urgency.toUpperCase()}</Text>
                  </View>
                </View>
                
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>

                <View style={styles.taskMeta}>
                  <View style={styles.metaItem}>
                    <DollarSign size={16} color={premiumColors.neonGreen} />
                    <Text style={styles.metaText}>${task.earnings}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Zap size={16} color={premiumColors.neonCyan} />
                    <Text style={styles.metaText}>{task.xpReward} XP</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MapPin size={16} color={premiumColors.neonMagenta} />
                    <Text style={styles.metaText}>{task.distance.toFixed(1)} mi</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={16} color={premiumColors.glassWhite} />
                    <Text style={styles.metaText}>{task.estimatedDuration}h</Text>
                  </View>
                </View>

                <View style={styles.posterInfo}>
                  <View style={styles.posterAvatar}>
                    <Text style={styles.posterAvatarText}>{task.poster.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.posterName}>{task.poster.name}</Text>
                    <View style={styles.posterStats}>
                      <Star size={12} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                      <Text style={styles.posterStatsText}>
                        {task.poster.trustScore} · {task.poster.completedTasks} tasks
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Sparkles size={40} color={premiumColors.glassWhite} />
            <Text style={styles.emptyText}>No instant matches yet</Text>
            <Text style={styles.emptySubtext}>Check back soon for perfect opportunities</Text>
          </GlassCard>
        )}

        <TouchableOpacity
          onPress={() => {
            sensory.tap();
            router.push('/dashboard' as any);
          }}
        >
          <GlassCard style={styles.viewAllCard}>
            <Text style={styles.viewAllText}>View All Tasks</Text>
            <ArrowRight size={24} color={premiumColors.neonCyan} />
          </GlassCard>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚀 Today's Performance</Text>
        </View>

        <View style={styles.todayStatsGrid}>
          <GlassCard style={styles.todayStatCard}>
            <Target size={24} color={premiumColors.neonCyan} />
            <Text style={styles.todayStatValue}>{todayStats.tasksCompleted}</Text>
            <Text style={styles.todayStatLabel}>Tasks Done</Text>
          </GlassCard>

          <GlassCard style={styles.todayStatCard}>
            <Zap size={24} color={premiumColors.neonAmber} />
            <Text style={styles.todayStatValue}>{todayStats.xpEarned}</Text>
            <Text style={styles.todayStatLabel}>XP Earned</Text>
          </GlassCard>

          <GlassCard style={styles.todayStatCard}>
            <DollarSign size={24} color={premiumColors.neonGreen} />
            <Text style={styles.todayStatValue}>${todayStats.coinsEarned}</Text>
            <Text style={styles.todayStatLabel}>Earned</Text>
          </GlassCard>

          <GlassCard style={styles.todayStatCard}>
            <Flame size={24} color="#FF6B35" />
            <Text style={styles.todayStatValue}>{todayStats.activeStreak}</Text>
            <Text style={styles.todayStatLabel}>Streak</Text>
          </GlassCard>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💡 AI Suggestions</Text>
        </View>

        {suggestions.nextBestActions.slice(0, 2).map((action, index) => (
          <GlassCard key={index} style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <View style={[styles.suggestionPriority, styles[`priority${action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}` as keyof typeof styles]]}>
                <Text style={styles.priorityText}>{action.priority.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.suggestionTitle}>{action.title}</Text>
            <Text style={styles.suggestionDescription}>{action.description}</Text>
            <View style={styles.suggestionMeta}>
              <View style={styles.metaItem}>
                <Zap size={14} color={premiumColors.neonCyan} />
                <Text style={styles.metaTextSmall}>+{action.xpPotential} XP</Text>
              </View>
              <View style={styles.metaItem}>
                <DollarSign size={14} color={premiumColors.neonGreen} />
                <Text style={styles.metaTextSmall}>+{action.coinsPotential}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={14} color={premiumColors.glassWhite} />
                <Text style={styles.metaTextSmall}>{action.estimatedTime}m</Text>
              </View>
            </View>
          </GlassCard>
        ))}

        <View style={{ height: spacing.xxl * 2 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: premiumColors.neonCyan,
    borderRadius: borderRadius.lg,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 16,
    color: premiumColors.glassWhite,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  mainStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCardLarge: {
    flex: 1,
    padding: spacing.lg,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statCardInfo: {
    flex: 1,
  },
  statCardColumn: {
    gap: spacing.md,
  },
  statCardSmall: {
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 100,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: premiumColors.glassWhite,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginBottom: spacing.xs / 2,
  },
  statSubtext: {
    fontSize: 11,
    color: premiumColors.glassWhite,
  },
  tierCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  tierGradient: {
    padding: spacing.lg,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tierInfo: {
    flex: 1,
  },
  tierLabel: {
    fontSize: 12,
    color: premiumColors.glassWhite,
    marginBottom: spacing.xs,
  },
  tierName: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  progressBarContainer: {
    gap: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: premiumColors.glassWhite,
    textAlign: 'right',
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: premiumColors.glassWhite,
  },
  taskCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: premiumColors.neonAmber + '20',
    borderRadius: borderRadius.full,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  urgencyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  urgencyHigh: {
    backgroundColor: '#FF6B6B',
  },
  urgencyMedium: {
    backgroundColor: premiumColors.neonAmber,
  },
  urgencyLow: {
    backgroundColor: premiumColors.neonGreen,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#000000',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  taskDescription: {
    fontSize: 14,
    color: premiumColors.glassWhite,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  metaTextSmall: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  posterAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: premiumColors.neonCyan + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterAvatarText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  posterName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  posterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  posterStatsText: {
    fontSize: 12,
    color: premiumColors.glassWhite,
  },
  emptyCard: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 14,
    color: premiumColors.glassWhite,
    textAlign: 'center',
  },
  viewAllCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  todayStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  todayStatCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  todayStatValue: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  todayStatLabel: {
    fontSize: 12,
    color: premiumColors.glassWhite,
  },
  suggestionCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  suggestionHeader: {
    marginBottom: spacing.sm,
  },
  suggestionPriority: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  priorityHigh: {
    backgroundColor: '#FF6B6B',
  },
  priorityMedium: {
    backgroundColor: premiumColors.neonAmber,
  },
  priorityLow: {
    backgroundColor: premiumColors.neonGreen,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#000000',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  suggestionDescription: {
    fontSize: 14,
    color: premiumColors.glassWhite,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  suggestionMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
