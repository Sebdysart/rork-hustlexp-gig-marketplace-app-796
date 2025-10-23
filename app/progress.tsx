import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, Target, Zap, Award } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getRankForLevel, getNextRank, getProgressToNextRank } from '@/constants/ranks';
import { getXPForNextLevel, getXPProgress } from '@/utils/gamification';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13] = useTranslatedTexts([
    'Progress Dashboard',
    'Next:',
    'XP Progress',
    'to Level',
    'Current Level',
    'Next Level',
    'XP needed',
    'Current Streak',
    'Best:',
    'Tasks Done',
    'earned',
    '📈 30-Day Forecast',
    '🎁 Current Rank Perks'
  ]);

  const currentRank = useMemo(() => {
    return getRankForLevel(currentUser?.level || 1);
  }, [currentUser?.level]);

  const nextRank = useMemo(() => {
    return getNextRank(currentUser?.level || 1);
  }, [currentUser?.level]);

  const rankProgress = useMemo(() => {
    return getProgressToNextRank(currentUser?.level || 1);
  }, [currentUser?.level]);

  const xpProgress = useMemo(() => {
    return getXPProgress(currentUser?.xp || 0);
  }, [currentUser?.xp]);

  const nextLevelXP = useMemo(() => {
    return getXPForNextLevel(currentUser?.xp || 0);
  }, [currentUser?.xp]);

  const daysToNextLevel = useMemo(() => {
    if (!currentUser) return 0;
    const xpNeeded = nextLevelXP - currentUser.xp;
    const avgXPPerDay = currentUser.tasksCompleted > 0 
      ? currentUser.xp / Math.max(1, Math.ceil((new Date().getTime() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
      : 50;
    return Math.ceil(xpNeeded / avgXPPerDay);
  }, [currentUser, nextLevelXP]);

  const projectedLevel = useMemo(() => {
    if (!currentUser) return 1;
    const daysActive = Math.ceil((new Date().getTime() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const xpPerDay = currentUser.xp / Math.max(1, daysActive);
    const xpIn30Days = currentUser.xp + (xpPerDay * 30);
    return Math.floor(Math.sqrt(xpIn30Days / 100)) + 1;
  }, [currentUser]);

  const stats = useMemo(() => {
    if (!currentUser) return [];
    
    return [
      {
        icon: <TrendingUp size={24} color="#8B5CF6" />,
        label: t5,
        value: currentUser.level.toString(),
        subtext: `${currentUser.xp} XP`,
      },
      {
        icon: <Target size={24} color="#10B981" />,
        label: t6,
        value: `${daysToNextLevel}d`,
        subtext: `${nextLevelXP - currentUser.xp} ${t7}`,
      },
      {
        icon: <Zap size={24} color="#F59E0B" />,
        label: t8,
        value: `${currentUser.streaks.current}d`,
        subtext: `${t9} ${currentUser.streaks.longest}d`,
      },
      {
        icon: <Award size={24} color="#EC4899" />,
        label: t10,
        value: currentUser.tasksCompleted.toString(),
        subtext: `${currentUser.earnings.toFixed(0)} ${t11}`,
      },
    ];
  }, [currentUser, daysToNextLevel, nextLevelXP]);

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No user data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t1,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[currentRank.gradient[0], currentRank.gradient[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rankCard}
        >
          <Text style={styles.rankIcon}>{currentRank.icon}</Text>
          <Text style={styles.rankName}>{currentRank.name}</Text>
          <Text style={styles.rankLevel}>Level {currentUser.level}</Text>

          {nextRank && (
            <View style={styles.nextRankContainer}>
              <Text style={styles.nextRankText}>
                {t2} {nextRank.name} (Lv. {nextRank.minLevel})
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${rankProgress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(rankProgress * 100)}%
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>{t3}</Text>
            <Text style={styles.xpValue}>
              {currentUser.xp} / {nextLevelXP}
            </Text>
          </View>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarBg}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]}
              />
            </View>
          </View>
          <Text style={styles.xpSubtext}>
            {Math.round(xpProgress * 100)}% {t4} {currentUser.level + 1}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIcon}>{stat.icon}</View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statSubtext}>{stat.subtext}</Text>
            </View>
          ))}
        </View>

        <View style={styles.forecastCard}>
          <Text style={styles.forecastTitle}>{t12}</Text>
          <Text style={styles.forecastText}>
            At your current pace, you&apos;ll reach{' '}
            <Text style={styles.forecastHighlight}>Level {projectedLevel}</Text> in 30
            days!
          </Text>
          <Text style={styles.forecastSubtext}>
            Keep completing tasks and maintaining your streak to level up faster.
          </Text>
        </View>

        <View style={styles.perksCard}>
          <Text style={styles.perksTitle}>{t13}</Text>
          {currentRank.perks.map((perk, index) => (
            <View key={index} style={styles.perkRow}>
              <Text style={styles.perkBullet}>•</Text>
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        {nextRank && (
          <View style={styles.nextPerksCard}>
            <Text style={styles.nextPerksTitle}>
              ✨ Unlock at {nextRank.name}
            </Text>
            {nextRank.perks.map((perk, index) => (
              <View key={index} style={styles.perkRow}>
                <Text style={styles.perkBullet}>•</Text>
                <Text style={styles.nextPerkText}>{perk}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
  rankCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  rankIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  rankName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rankLevel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  nextRankContainer: {
    width: '100%',
  },
  nextRankText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'right',
  },
  xpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8B5CF6',
  },
  xpBarContainer: {
    marginBottom: 8,
  },
  xpBarBg: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  xpSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  forecastText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 8,
  },
  forecastHighlight: {
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  forecastSubtext: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  perksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  perksTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  perkBullet: {
    fontSize: 16,
    color: '#8B5CF6',
    marginRight: 8,
    marginTop: 2,
  },
  perkText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  nextPerksCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  nextPerksTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginBottom: 12,
  },
  nextPerkText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
