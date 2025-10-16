import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { DailyQuest } from '@/types';

export default function DailyQuestsScreen() {
  const { currentUser, myAcceptedTasks, availableTasks } = useApp();

  const dailyQuests = useMemo((): DailyQuest[] => {
    if (!currentUser) return [];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const todayApplications = myAcceptedTasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate.toDateString() === new Date().toDateString();
    }).length;

    const todayCompletions = myAcceptedTasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate.toDateString() === new Date().toDateString();
    }).length;

    return [
      {
        id: 'quest-1',
        title: 'Early Bird',
        description: 'Apply to 2 tasks before noon',
        xpReward: 25,
        progress: Math.min(todayApplications, 2),
        target: 2,
        completed: todayApplications >= 2,
        expiresAt: today.toISOString(),
      },
      {
        id: 'quest-2',
        title: 'Hustle Hard',
        description: 'Complete 1 task today',
        xpReward: 50,
        progress: Math.min(todayCompletions, 1),
        target: 1,
        completed: todayCompletions >= 1,
        expiresAt: today.toISOString(),
      },
      {
        id: 'quest-3',
        title: 'Explorer',
        description: 'Browse 10 available tasks',
        xpReward: 15,
        progress: Math.min(availableTasks.length, 10),
        target: 10,
        completed: availableTasks.length >= 10,
        expiresAt: today.toISOString(),
      },
      {
        id: 'quest-4',
        title: 'Streak Master',
        description: 'Maintain your daily streak',
        xpReward: 30,
        progress: currentUser.streaks.current >= 1 ? 1 : 0,
        target: 1,
        completed: currentUser.streaks.current >= 1,
        expiresAt: today.toISOString(),
      },
    ];
  }, [currentUser, myAcceptedTasks, availableTasks]);

  if (!currentUser) {
    return null;
  }

  const completedCount = dailyQuests.filter(q => q.completed).length;
  const totalXP = dailyQuests.reduce((sum, q) => sum + (q.completed ? q.xpReward : 0), 0);
  const potentialXP = dailyQuests.reduce((sum, q) => sum + q.xpReward, 0);

  const getTimeRemaining = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Daily Quests',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Target size={32} color={Colors.accent} />
            <Text style={styles.headerTitle}>Daily Quests</Text>
            <Text style={styles.headerSubtitle}>
              Complete quests to earn bonus XP
            </Text>
          </View>

          <View style={styles.statsCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedCount}/{dailyQuests.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalXP} XP</Text>
                <Text style={styles.statLabel}>Earned Today</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Clock size={20} color={Colors.text} />
                <Text style={styles.statLabel}>{getTimeRemaining()}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Daily Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round((totalXP / potentialXP) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(totalXP / potentialXP) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              {potentialXP - totalXP} XP remaining
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Today&apos;s Quests</Text>

          {dailyQuests.map((quest) => (
            <TouchableOpacity
              key={quest.id}
              style={[
                styles.questCard,
                quest.completed && styles.questCardCompleted,
              ]}
              onPress={() => triggerHaptic('light')}
            >
              <View style={styles.questIcon}>
                {quest.completed ? (
                  <CheckCircle size={24} color={Colors.success} />
                ) : (
                  <Target size={24} color={Colors.accent} />
                )}
              </View>
              <View style={styles.questContent}>
                <View style={styles.questHeader}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <View style={styles.questReward}>
                    <Zap size={14} color={Colors.accent} />
                    <Text style={styles.questRewardText}>+{quest.xpReward} XP</Text>
                  </View>
                </View>
                <Text style={styles.questDescription}>{quest.description}</Text>
                <View style={styles.questProgress}>
                  <View style={styles.questProgressBar}>
                    <View
                      style={[
                        styles.questProgressFill,
                        { width: `${(quest.progress / quest.target) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.questProgressText}>
                    {quest.progress}/{quest.target}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.infoCard}>
            <TrendingUp size={20} color={Colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>💡 Quest Tips</Text>
              <Text style={styles.infoText}>
                • Quests reset daily at midnight{'\n'}
                • Complete all quests for maximum XP{'\n'}
                • Streaks multiply your rewards{'\n'}
                • Check back tomorrow for new quests
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.text,
    opacity: 0.2,
    marginHorizontal: 12,
  },
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.accent,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  progressSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  questCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  questCardCompleted: {
    borderColor: Colors.success,
    opacity: 0.7,
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questContent: {
    flex: 1,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questRewardText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  questDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  questProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  questProgressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
