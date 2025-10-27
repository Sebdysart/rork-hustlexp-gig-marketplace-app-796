import { View, StyleSheet } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';
import UnifiedProfile from '@/components/UnifiedProfile';
import Confetti from '@/components/Confetti';
import LevelUpAnimation from '@/components/LevelUpAnimation';
import RoleStatsCard from '@/components/RoleStatsCard';
import AIPerformanceInsights from '@/components/AIPerformanceInsights';
import { useState, useEffect } from 'react';
import { Analytics } from '@/utils/analytics';
import { RoleStats } from '@/types';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { currentUser, updateUser, myAcceptedTasks, fetchRoleStats } = useApp();
  const aiCoach = useUltimateAICoach();
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [previousLevel, setPreviousLevel] = useState<number>(currentUser?.level || 1);
  const [roleStats, setRoleStats] = useState<RoleStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  useEffect(() => {
    Analytics.trackEvent({ type: 'page_view', data: { page: 'profile' } });
    loadRoleStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser) {
      aiCoach.updateContext({
        screen: 'profile',
        userLevel: currentUser.level,
        userXP: currentUser.xp,

        badges: currentUser.badges.length,
        totalEarnings: currentUser.earnings,
        tasksCompleted: currentUser.tasksCompleted,
        currentRating: currentUser.reputationScore,
        currentStreak: currentUser.streaks.current,
        bestStreak: currentUser.streaks.longest,
        userRole: currentUser.role,
        activeMode: currentUser.activeMode,
      });
    }
  }, [currentUser, aiCoach]);

  const loadRoleStats = async () => {
    setIsLoadingStats(true);
    const stats = await fetchRoleStats();
    setRoleStats(stats);
    setIsLoadingStats(false);
  };

  const handleInsightAction = (insight: any) => {
    if (insight.type === 'opportunity' && insight.title.includes('Expand')) {
      router.push('/(tabs)/tasks');
    } else if (insight.type === 'weakness' && insight.title.includes('Response')) {
      router.push('/settings');
    } else {
      router.push('/ai-coach');
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.level > previousLevel) {
      setShowConfetti(true);
      setShowLevelUp(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setPreviousLevel(currentUser.level);
      
      Analytics.trackEvent({
        type: 'level_up',
        data: { level: currentUser.level, xp: currentUser.xp },
      });
    }
  }, [currentUser?.level, previousLevel, currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <UnifiedProfile
        user={currentUser}
        isOwnProfile={true}
        onUpdateUser={updateUser}
        myAcceptedTasks={myAcceptedTasks}
        roleStatsCard={
          <>
            <RoleStatsCard roleStats={roleStats} isLoading={isLoadingStats} />
            {currentUser.tasksCompleted > 0 && (
              <AIPerformanceInsights
                user={currentUser}
                completedTasks={myAcceptedTasks.filter(t => t.status === 'completed')}
                onActionPress={handleInsightAction}
              />
            )}
          </>
        }
      />
      {showConfetti && <Confetti />}
      {showLevelUp && (
        <LevelUpAnimation
          newLevel={currentUser.level}
          onComplete={() => setShowLevelUp(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
