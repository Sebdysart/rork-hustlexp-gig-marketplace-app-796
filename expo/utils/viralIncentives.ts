import AsyncStorage from '@react-native-async-storage/async-storage';
import { Analytics } from './analytics';

const VIRAL_STORAGE_KEY = 'hustlexp_viral_tracking';

export interface ViralAction {
  id: string;
  type: 'share' | 'referral_signup' | 'referral_task_complete' | 'achievement_share';
  timestamp: number;
  platform?: string;
  contentId?: string;
  referralCode?: string;
}

export interface ViralReward {
  id: string;
  type: 'xp' | 'grit' | 'badge' | 'powerup';
  amount: number;
  reason: string;
  timestamp: number;
  claimed: boolean;
}

export interface ViralStats {
  totalShares: number;
  successfulReferrals: number;
  viralScore: number;
  streak: number;
  rewards: ViralReward[];
}

export async function trackViralAction(action: Omit<ViralAction, 'id' | 'timestamp'>): Promise<void> {
  try {
    const fullAction: ViralAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const stored = await AsyncStorage.getItem(VIRAL_STORAGE_KEY);
    const data: ViralAction[] = stored ? JSON.parse(stored) : [];
    
    data.push(fullAction);

    if (data.length > 500) {
      data.splice(0, data.length - 500);
    }

    await AsyncStorage.setItem(VIRAL_STORAGE_KEY, JSON.stringify(data));

    await Analytics.trackEvent({
      type: 'share',
      data: {
        viralAction: action.type,
        platform: action.platform,
        contentId: action.contentId,
      },
    });

    console.log('[Viral] Action tracked:', action.type);
  } catch (error) {
    console.error('[Viral] Track action error:', error);
  }
}

export async function calculateViralRewards(userId: string): Promise<ViralReward[]> {
  try {
    const stored = await AsyncStorage.getItem(VIRAL_STORAGE_KEY);
    const actions: ViralAction[] = stored ? JSON.parse(stored) : [];

    const rewards: ViralReward[] = [];
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const last7Days = now - 7 * 24 * 60 * 60 * 1000;

    const recentShares = actions.filter(
      a => a.type === 'share' && a.timestamp >= last24Hours
    ).length;

    const weeklyReferrals = actions.filter(
      a => a.type === 'referral_signup' && a.timestamp >= last7Days
    ).length;

    if (recentShares >= 5) {
      rewards.push({
        id: `share_bonus_${now}`,
        type: 'xp',
        amount: 50,
        reason: 'Shared 5+ achievements today',
        timestamp: now,
        claimed: false,
      });
    }

    if (weeklyReferrals >= 3) {
      rewards.push({
        id: `referral_bonus_${now}`,
        type: 'grit',
        amount: 500,
        reason: '3+ referrals this week',
        timestamp: now,
        claimed: false,
      });
    }

    const shareStreak = calculateShareStreak(actions);
    if (shareStreak >= 7) {
      rewards.push({
        id: `streak_bonus_${now}`,
        type: 'badge',
        amount: 1,
        reason: `${shareStreak} day share streak`,
        timestamp: now,
        claimed: false,
      });
    }

    return rewards;
  } catch (error) {
    console.error('[Viral] Calculate rewards error:', error);
    return [];
  }
}

function calculateShareStreak(actions: ViralAction[]): number {
  const sharesByDay = new Map<string, boolean>();
  
  actions
    .filter(a => a.type === 'share')
    .forEach(action => {
      const date = new Date(action.timestamp).toDateString();
      sharesByDay.set(date, true);
    });

  let streak = 0;
  let currentDate = new Date();
  
  while (sharesByDay.has(currentDate.toDateString())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export async function getViralStats(userId: string): Promise<ViralStats> {
  try {
    const stored = await AsyncStorage.getItem(VIRAL_STORAGE_KEY);
    const actions: ViralAction[] = stored ? JSON.parse(stored) : [];

    const totalShares = actions.filter(a => a.type === 'share').length;
    const successfulReferrals = actions.filter(a => a.type === 'referral_signup').length;
    const streak = calculateShareStreak(actions);
    const rewards = await calculateViralRewards(userId);

    const viralScore = calculateViralScore(actions);

    return {
      totalShares,
      successfulReferrals,
      viralScore,
      streak,
      rewards,
    };
  } catch (error) {
    console.error('[Viral] Get stats error:', error);
    return {
      totalShares: 0,
      successfulReferrals: 0,
      viralScore: 0,
      streak: 0,
      rewards: [],
    };
  }
}

function calculateViralScore(actions: ViralAction[]): number {
  const now = Date.now();
  const last30Days = now - 30 * 24 * 60 * 60 * 1000;

  const recentActions = actions.filter(a => a.timestamp >= last30Days);

  let score = 0;

  recentActions.forEach(action => {
    switch (action.type) {
      case 'share':
        score += 10;
        break;
      case 'referral_signup':
        score += 50;
        break;
      case 'referral_task_complete':
        score += 100;
        break;
      case 'achievement_share':
        score += 25;
        break;
    }
  });

  const streak = calculateShareStreak(actions);
  score += streak * 5;

  return Math.min(score, 10000);
}

export async function claimViralReward(rewardId: string): Promise<boolean> {
  try {
    const userId = 'current_user';
    const rewards = await calculateViralRewards(userId);
    const reward = rewards.find(r => r.id === rewardId);

    if (!reward || reward.claimed) {
      return false;
    }

    reward.claimed = true;

    console.log('[Viral] Reward claimed:', reward);
    return true;
  } catch (error) {
    console.error('[Viral] Claim reward error:', error);
    return false;
  }
}

export const VIRAL_MILESTONES = [
  {
    id: 'first_share',
    title: 'First Share',
    description: 'Share your first achievement',
    requirement: 1,
    type: 'share' as const,
    reward: { type: 'xp', amount: 25 },
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Share 10 achievements',
    requirement: 10,
    type: 'share' as const,
    reward: { type: 'grit', amount: 100 },
  },
  {
    id: 'influencer',
    title: 'Influencer',
    description: 'Get 5 successful referrals',
    requirement: 5,
    type: 'referral_signup' as const,
    reward: { type: 'badge', amount: 1 },
  },
  {
    id: 'viral_legend',
    title: 'Viral Legend',
    description: 'Get 25 successful referrals',
    requirement: 25,
    type: 'referral_signup' as const,
    reward: { type: 'powerup', amount: 1 },
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Share for 7 consecutive days',
    requirement: 7,
    type: 'share' as const,
    reward: { type: 'xp', amount: 200 },
  },
];

export async function checkMilestones(userId: string): Promise<typeof VIRAL_MILESTONES[0][]> {
  try {
    const stats = await getViralStats(userId);
    const stored = await AsyncStorage.getItem(VIRAL_STORAGE_KEY);
    const actions: ViralAction[] = stored ? JSON.parse(stored) : [];

    return VIRAL_MILESTONES.filter(milestone => {
      const count = actions.filter(a => a.type === milestone.type).length;
      
      if (milestone.id === 'streak_master') {
        return stats.streak >= milestone.requirement;
      }
      
      return count >= milestone.requirement;
    });
  } catch (error) {
    console.error('[Viral] Check milestones error:', error);
    return [];
  }
}
