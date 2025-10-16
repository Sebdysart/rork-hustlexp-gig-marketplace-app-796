import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Calendar,
  Trophy,
  Sparkles,
  Flame,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { useApp } from '@/contexts/AppContext';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import {
  DAILY_QUESTS_TEMPLATES,
  WEEKLY_QUESTS_TEMPLATES,
  SEASONAL_QUESTS_TEMPLATES,
  Quest,
  QUEST_STREAK_MULTIPLIERS,
} from '@/constants/quests';
import QuestCard from '@/components/QuestCard';



type TabType = 'daily' | 'weekly' | 'seasonal' | 'ai';

export default function QuestsScreen() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('daily');


  const questStreak = currentUser?.dailyStreak?.count || 0;
  const streakMultiplier = useMemo(() => {
    const multiplierData = [...QUEST_STREAK_MULTIPLIERS]
      .reverse()
      .find((m) => questStreak >= m.days);
    return multiplierData?.multiplier || 1;
  }, [questStreak]);

  const dailyQuests: Quest[] = useMemo(() => {
    return DAILY_QUESTS_TEMPLATES.map((template) => ({
      ...template,
      id: `${template.id}-${new Date().toDateString()}`,
      type: 'daily' as const,
      progress: 0,
      expiresAt: new Date(
        new Date().setHours(23, 59, 59, 999)
      ).toISOString(),
      completed: false,
    }));
  }, []);

  const weeklyQuests: Quest[] = useMemo(() => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return WEEKLY_QUESTS_TEMPLATES.map((template) => ({
      ...template,
      id: `${template.id}-${startOfWeek.toISOString()}`,
      type: 'weekly' as const,
      progress: 0,
      expiresAt: endOfWeek.toISOString(),
      completed: false,
    }));
  }, []);

  const seasonalQuests: Quest[] = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return SEASONAL_QUESTS_TEMPLATES.map((template) => ({
      ...template,
      id: `${template.id}-${startOfMonth.toISOString()}`,
      type: 'seasonal' as const,
      progress: 0,
      expiresAt: endOfMonth.toISOString(),
      completed: false,
    }));
  }, []);

  const aiQuests: Quest[] = useMemo(() => {
    if (!currentUser) return [];

    const personalizedQuests: Quest[] = [];

    if (currentUser.tasksCompleted < 5) {
      personalizedQuests.push({
        id: 'ai_first_milestone',
        type: 'ai',
        category: 'completion',
        title: 'First Milestone',
        description: `Complete ${5 - currentUser.tasksCompleted} more gigs to unlock new features`,
        icon: 'Target',
        target: 5,
        progress: currentUser.tasksCompleted,
        rewards: { grit: 200, xp: 100 },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        difficulty: 'medium',
        rarity: 'rare',
      });
    }

    const nextLevel = currentUser.level + 1;
    const xpNeeded = nextLevel * 100;
    const xpToGo = xpNeeded - currentUser.xp;

    if (xpToGo > 0 && xpToGo < 500) {
      personalizedQuests.push({
        id: 'ai_level_up',
        type: 'ai',
        category: 'completion',
        title: 'Level Up Soon!',
        description: `You're ${xpToGo} XP away from Level ${nextLevel}`,
        icon: 'TrendingUp',
        target: xpNeeded,
        progress: currentUser.xp,
        rewards: { grit: 150, xp: 50 },
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        difficulty: 'easy',
        rarity: 'common',
      });
    }

    const grit = currentUser.wallet?.grit || 0;
    if (grit < 1000) {
      personalizedQuests.push({
        id: 'ai_grit_grind',
        type: 'ai',
        category: 'completion',
        title: 'Grit Grind',
        description: `Earn ${1000 - grit} more Grit to unlock premium features`,
        icon: 'Zap',
        target: 1000,
        progress: grit,
        rewards: { taskCredits: 5, xp: 100 },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        difficulty: 'medium',
        rarity: 'rare',
      });
    }

    return personalizedQuests;
  }, [currentUser]);

  const currentQuests = useMemo(() => {
    switch (activeTab) {
      case 'daily':
        return dailyQuests;
      case 'weekly':
        return weeklyQuests;
      case 'seasonal':
        return seasonalQuests;
      case 'ai':
        return aiQuests;
      default:
        return dailyQuests;
    }
  }, [activeTab, dailyQuests, weeklyQuests, seasonalQuests, aiQuests]);

  const completedCount = currentQuests.filter((q) => q.completed).length;
  const totalCount = currentQuests.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'daily', label: 'Daily', icon: Zap },
    { id: 'weekly', label: 'Weekly', icon: Calendar },
    { id: 'seasonal', label: 'Seasonal', icon: Trophy },
    { id: 'ai', label: 'AI Quests', icon: Sparkles },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Quests',
          headerStyle: {
            backgroundColor: premiumColors.richBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[premiumColors.neonCyan + '20', 'transparent']}
          style={styles.headerGradient}
        />

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Your Daily Grind Map</Text>
              <Text style={styles.headerSubtitle}>
                Small wins. Big momentum.
              </Text>
            </View>
            <View style={styles.streakContainer}>
              <Flame color={premiumColors.neonOrange} size={24} />
              <Text style={styles.streakText}>{questStreak}</Text>
            </View>
          </View>

          {streakMultiplier > 1 && (
            <View style={styles.multiplierBanner}>
              <BlurView intensity={20} style={styles.multiplierBlur}>
                <Sparkles color={premiumColors.neonPurple} size={16} />
                <Text style={styles.multiplierText}>
                  {streakMultiplier}x Grit Multiplier Active!
                </Text>
              </BlurView>
            </View>
          )}

          <View style={styles.progressCard}>
            <BlurView intensity={30} style={styles.progressBlur}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Progress
                </Text>
                <Text style={styles.progressCount}>
                  {completedCount}/{totalCount}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      { width: `${completionPercentage}%` },
                    ]}
                  >
                    <LinearGradient
                      colors={[premiumColors.neonCyan, premiumColors.neonPurple]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </View>
                <Text style={styles.progressPercentage}>
                  {Math.round(completionPercentage)}%
                </Text>
              </View>
            </BlurView>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.7}
                >
                  {isActive && (
                    <LinearGradient
                      colors={[
                        premiumColors.neonCyan + '30',
                        premiumColors.neonPurple + '30',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Icon
                    color={isActive ? premiumColors.neonCyan : Colors.textSecondary}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {isActive && (
                    <View style={styles.tabIndicator}>
                      <LinearGradient
                        colors={[premiumColors.neonCyan, premiumColors.neonPurple]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.questsContainer}>
          {currentQuests.length === 0 ? (
            <View style={styles.emptyState}>
              <Sparkles color={Colors.textSecondary} size={48} />
              <Text style={styles.emptyTitle}>No Quests Available</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for new challenges!
              </Text>
            </View>
          ) : (
            currentQuests.map((quest, index) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                index={index}
                streakMultiplier={streakMultiplier}
              />
            ))
          )}
        </View>

        {activeTab === 'ai' && aiQuests.length > 0 && (
          <View style={styles.aiFooter}>
            <BlurView intensity={20} style={styles.aiFooterBlur}>
              <Sparkles color={premiumColors.neonPurple} size={20} />
              <Text style={styles.aiFooterText}>
                Powered by HustleBot AI — personalized just for you
              </Text>
            </BlurView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.richBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  header: {
    padding: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: premiumColors.neonOrange + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: premiumColors.neonOrange + '40',
  },
  streakText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: premiumColors.neonOrange,
  },
  multiplierBanner: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.neonPurple + '40',
  },
  multiplierBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  multiplierText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonPurple,
  },
  progressCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  progressBlur: {
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  tabsContainer: {
    marginBottom: 8,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: premiumColors.glassWhite,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  tabActive: {
    borderColor: premiumColors.neonCyan + '40',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: premiumColors.neonCyan,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  questsContainer: {
    padding: 20,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  aiFooter: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.neonPurple + '40',
  },
  aiFooterBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  aiFooterText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
