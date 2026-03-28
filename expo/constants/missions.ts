import { DailyQuest } from '@/types';

export interface Mission {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  xpReward: number;
  coinReward?: number;
  target: number;
  icon: string;
  category: 'tasks' | 'earnings' | 'social' | 'streak';
}

export const DAILY_MISSIONS: Mission[] = [
  {
    id: 'daily-apply-3',
    type: 'daily',
    title: 'Job Hunter',
    description: 'Apply to 3 tasks today',
    xpReward: 25,
    target: 3,
    icon: '🎯',
    category: 'tasks',
  },
  {
    id: 'daily-complete-1',
    type: 'daily',
    title: 'First Win',
    description: 'Complete 1 task today',
    xpReward: 50,
    coinReward: 5,
    target: 1,
    icon: '✅',
    category: 'tasks',
  },
  {
    id: 'daily-earn-50',
    type: 'daily',
    title: 'Money Maker',
    description: 'Earn $50 today',
    xpReward: 30,
    target: 50,
    icon: '💰',
    category: 'earnings',
  },
  {
    id: 'daily-respond-fast',
    type: 'daily',
    title: 'Quick Responder',
    description: 'Respond to 5 messages within 5 minutes',
    xpReward: 20,
    target: 5,
    icon: '⚡',
    category: 'social',
  },
  {
    id: 'daily-login',
    type: 'daily',
    title: 'Daily Grind',
    description: 'Log in and check your dashboard',
    xpReward: 10,
    target: 1,
    icon: '🔥',
    category: 'streak',
  },
];

export const WEEKLY_MISSIONS: Mission[] = [
  {
    id: 'weekly-complete-10',
    type: 'weekly',
    title: 'Hustle Hard',
    description: 'Complete 10 tasks this week',
    xpReward: 200,
    coinReward: 25,
    target: 10,
    icon: '🏆',
    category: 'tasks',
  },
  {
    id: 'weekly-earn-500',
    type: 'weekly',
    title: 'Big Earner',
    description: 'Earn $500 this week',
    xpReward: 150,
    coinReward: 50,
    target: 500,
    icon: '💵',
    category: 'earnings',
  },
  {
    id: 'weekly-streak-7',
    type: 'weekly',
    title: 'Streak Master',
    description: 'Maintain a 7-day streak',
    xpReward: 300,
    coinReward: 100,
    target: 7,
    icon: '🔥',
    category: 'streak',
  },
  {
    id: 'weekly-variety-5',
    type: 'weekly',
    title: 'Jack of All Trades',
    description: 'Complete tasks in 5 different categories',
    xpReward: 250,
    target: 5,
    icon: '🎨',
    category: 'tasks',
  },
  {
    id: 'weekly-perfect-rating',
    type: 'weekly',
    title: 'Five Star Pro',
    description: 'Get 5 perfect ratings this week',
    xpReward: 180,
    coinReward: 30,
    target: 5,
    icon: '⭐',
    category: 'social',
  },
];

export function generateDailyQuests(userId: string, date: string): DailyQuest[] {
  const selectedMissions = DAILY_MISSIONS.slice(0, 3);
  
  return selectedMissions.map(mission => ({
    id: `${mission.id}-${userId}-${date}`,
    title: mission.title,
    description: mission.description,
    xpReward: mission.xpReward,
    progress: 0,
    target: mission.target,
    completed: false,
    expiresAt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
  }));
}

export function checkMissionProgress(
  mission: Mission,
  userStats: {
    tasksAppliedToday?: number;
    tasksCompletedToday?: number;
    earningsToday?: number;
    fastResponsesToday?: number;
    hasLoggedInToday?: boolean;
    tasksCompletedThisWeek?: number;
    earningsThisWeek?: number;
    currentStreak?: number;
    categoriesThisWeek?: number;
    perfectRatingsThisWeek?: number;
  }
): number {
  switch (mission.id) {
    case 'daily-apply-3':
      return userStats.tasksAppliedToday || 0;
    case 'daily-complete-1':
      return userStats.tasksCompletedToday || 0;
    case 'daily-earn-50':
      return userStats.earningsToday || 0;
    case 'daily-respond-fast':
      return userStats.fastResponsesToday || 0;
    case 'daily-login':
      return userStats.hasLoggedInToday ? 1 : 0;
    case 'weekly-complete-10':
      return userStats.tasksCompletedThisWeek || 0;
    case 'weekly-earn-500':
      return userStats.earningsThisWeek || 0;
    case 'weekly-streak-7':
      return userStats.currentStreak || 0;
    case 'weekly-variety-5':
      return userStats.categoriesThisWeek || 0;
    case 'weekly-perfect-rating':
      return userStats.perfectRatingsThisWeek || 0;
    default:
      return 0;
  }
}
