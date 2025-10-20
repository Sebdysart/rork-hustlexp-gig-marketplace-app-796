import { View, StyleSheet } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import UnifiedProfile from '@/components/UnifiedProfile';
import Confetti from '@/components/Confetti';
import LevelUpAnimation from '@/components/LevelUpAnimation';
import RoleStatsCard from '@/components/RoleStatsCard';
import { useState, useEffect } from 'react';
import { Analytics } from '@/utils/analytics';
import { RoleStats } from '@/types';

export default function ProfileScreen() {
  const { currentUser, updateUser, myAcceptedTasks, fetchRoleStats } = useApp();
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [previousLevel, setPreviousLevel] = useState<number>(currentUser?.level || 1);
  const [roleStats, setRoleStats] = useState<RoleStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  useEffect(() => {
    Analytics.trackEvent({ type: 'page_view', data: { page: 'profile' } });
    loadRoleStats();
  }, []);

  const loadRoleStats = async () => {
    setIsLoadingStats(true);
    const stats = await fetchRoleStats();
    setRoleStats(stats);
    setIsLoadingStats(false);
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
        roleStatsCard={<RoleStatsCard roleStats={roleStats} isLoading={isLoadingStats} />}
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
