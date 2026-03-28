import { User } from '@/types';
import { GRIT_REWARDS } from '@/constants/economy';

export interface StreakCheckResult {
  isNewDay: boolean;
  streakBroken: boolean;
  newStreakCount: number;
  gritReward: number;
  message: string;
}

export function checkDailyStreak(user: User): StreakCheckResult {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const lastLoginDate = user.dailyStreak?.lastLoginDate || '';
  const lastLogin = lastLoginDate.split('T')[0];
  
  const currentStreak = user.dailyStreak?.count || 0;

  if (lastLogin === today) {
    return {
      isNewDay: false,
      streakBroken: false,
      newStreakCount: currentStreak,
      gritReward: 0,
      message: 'Already logged in today',
    };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastLogin === yesterdayStr) {
    const newStreak = currentStreak + 1;
    const baseReward = GRIT_REWARDS.DAILY_STREAK;
    const bonusReward = Math.floor(newStreak / 7) * 10;
    const totalReward = baseReward + bonusReward;

    return {
      isNewDay: true,
      streakBroken: false,
      newStreakCount: newStreak,
      gritReward: totalReward,
      message: `${newStreak} day streak! +${totalReward}⚡`,
    };
  }

  if (currentStreak > 0) {
    return {
      isNewDay: true,
      streakBroken: true,
      newStreakCount: 1,
      gritReward: GRIT_REWARDS.DAILY_STREAK,
      message: `Streak broken. Starting fresh! +${GRIT_REWARDS.DAILY_STREAK}⚡`,
    };
  }

  return {
    isNewDay: true,
    streakBroken: false,
    newStreakCount: 1,
    gritReward: GRIT_REWARDS.DAILY_STREAK,
    message: `First login! +${GRIT_REWARDS.DAILY_STREAK}⚡`,
  };
}

export function updateUserStreak(user: User, streakResult: StreakCheckResult): User {
  if (!streakResult.isNewDay) {
    return user;
  }

  return {
    ...user,
    dailyStreak: {
      count: streakResult.newStreakCount,
      lastLoginDate: new Date().toISOString(),
      freezesUsed: user.dailyStreak?.freezesUsed || 0,
    },
    wallet: {
      grit: (user.wallet?.grit || 0) + streakResult.gritReward,
      taskCredits: user.wallet?.taskCredits || 0,
      crowns: user.wallet?.crowns || 0,
    },
  };
}

export function getStreakMilestones(): { days: number; reward: string }[] {
  return [
    { days: 7, reward: '+10⚡ bonus' },
    { days: 14, reward: '+20⚡ bonus' },
    { days: 30, reward: '+50⚡ bonus + Badge' },
    { days: 60, reward: '+100⚡ bonus + Exclusive Theme' },
    { days: 100, reward: '+200⚡ bonus + Legendary Badge' },
  ];
}

export function getNextStreakMilestone(currentStreak: number): { days: number; reward: string } | null {
  const milestones = getStreakMilestones();
  return milestones.find(m => m.days > currentStreak) || null;
}
