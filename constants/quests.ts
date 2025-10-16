export type QuestType = 'daily' | 'weekly' | 'seasonal' | 'ai';
export type QuestCategory = 'engagement' | 'completion' | 'social' | 'streak' | 'skill';

export interface Quest {
  id: string;
  type: QuestType;
  category: QuestCategory;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  rewards: {
    grit?: number;
    taskCredits?: number;
    xp?: number;
    badge?: string;
  };
  expiresAt: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface QuestStreak {
  count: number;
  multiplier: number;
  lastCompletedDate: string;
}

export const DAILY_QUESTS_TEMPLATES = [
  {
    id: 'daily_login',
    category: 'engagement' as const,
    title: 'Quick Hit',
    description: 'Log in and check your dashboard',
    icon: 'Zap',
    target: 1,
    rewards: { grit: 20, xp: 10 },
    difficulty: 'easy' as const,
    rarity: 'common' as const,
  },
  {
    id: 'daily_training',
    category: 'engagement' as const,
    title: 'Stay Sharp',
    description: 'Watch one Hustle Tip or training clip',
    icon: 'Brain',
    target: 1,
    rewards: { grit: 25, xp: 15 },
    difficulty: 'easy' as const,
    rarity: 'common' as const,
  },
  {
    id: 'daily_apply',
    category: 'engagement' as const,
    title: 'Apply Pressure',
    description: 'Apply to 2 open gigs',
    icon: 'Target',
    target: 2,
    rewards: { grit: 40, xp: 20 },
    difficulty: 'easy' as const,
    rarity: 'common' as const,
  },
  {
    id: 'daily_complete',
    category: 'completion' as const,
    title: 'Closer Energy',
    description: 'Complete 1 gig today',
    icon: 'CheckCircle2',
    target: 1,
    rewards: { grit: 100, xp: 50 },
    difficulty: 'medium' as const,
    rarity: 'rare' as const,
  },
  {
    id: 'daily_feedback',
    category: 'social' as const,
    title: 'Social Proof',
    description: 'Leave feedback on another worker',
    icon: 'Star',
    target: 1,
    rewards: { grit: 30, xp: 15 },
    difficulty: 'easy' as const,
    rarity: 'common' as const,
  },
  {
    id: 'daily_streak',
    category: 'streak' as const,
    title: 'Streak Builder',
    description: 'Log in 3 days in a row',
    icon: 'Flame',
    target: 3,
    rewards: { grit: 150, xp: 75 },
    difficulty: 'medium' as const,
    rarity: 'rare' as const,
  },
];

export const WEEKLY_QUESTS_TEMPLATES = [
  {
    id: 'weekly_volume',
    category: 'completion' as const,
    title: 'Volume Hustle',
    description: 'Complete 5 gigs this week',
    icon: 'TrendingUp',
    target: 5,
    rewards: { grit: 500, taskCredits: 5, xp: 200 },
    difficulty: 'medium' as const,
    rarity: 'rare' as const,
  },
  {
    id: 'weekly_category',
    category: 'skill' as const,
    title: 'Category Expert',
    description: 'Finish 3 gigs in same category',
    icon: 'Award',
    target: 3,
    rewards: { grit: 300, xp: 150, badge: 'category_specialist' },
    difficulty: 'medium' as const,
    rarity: 'rare' as const,
  },
  {
    id: 'weekly_perfect',
    category: 'completion' as const,
    title: 'Perfect Rep',
    description: 'Get 3 five-star reviews',
    icon: 'Crown',
    target: 3,
    rewards: { grit: 500, xp: 250 },
    difficulty: 'hard' as const,
    rarity: 'epic' as const,
  },
  {
    id: 'weekly_network',
    category: 'social' as const,
    title: 'Power Networker',
    description: 'Message 5 new posters',
    icon: 'Users',
    target: 5,
    rewards: { grit: 200, xp: 100 },
    difficulty: 'medium' as const,
    rarity: 'rare' as const,
  },
  {
    id: 'weekly_referral',
    category: 'social' as const,
    title: 'Team Builder',
    description: 'Refer 1 new worker',
    icon: 'UserPlus',
    target: 1,
    rewards: { grit: 1000, xp: 500 },
    difficulty: 'hard' as const,
    rarity: 'epic' as const,
  },
  {
    id: 'weekly_consistency',
    category: 'streak' as const,
    title: 'Consistency King',
    description: 'Complete all Daily Quests for 7 days',
    icon: 'Trophy',
    target: 7,
    rewards: { grit: 1500, xp: 750 },
    difficulty: 'hard' as const,
    rarity: 'epic' as const,
  },
];

export const SEASONAL_QUESTS_TEMPLATES = [
  {
    id: 'season_rise_grind',
    category: 'completion' as const,
    title: 'Rise & Grind',
    description: 'Complete 25 gigs in 30 days',
    icon: 'Sunrise',
    target: 25,
    rewards: { grit: 5000, taskCredits: 25, xp: 2500, badge: 'relentless' },
    difficulty: 'epic' as const,
    rarity: 'legendary' as const,
  },
  {
    id: 'season_empire',
    category: 'completion' as const,
    title: 'Build Your Empire',
    description: 'Hit Level 50',
    icon: 'Building2',
    target: 50,
    rewards: { grit: 10000, xp: 5000, badge: 'empire_builder' },
    difficulty: 'epic' as const,
    rarity: 'legendary' as const,
  },
  {
    id: 'season_grit_luck',
    category: 'streak' as const,
    title: 'Grit Over Luck',
    description: '15-day login streak',
    icon: 'Sparkles',
    target: 15,
    rewards: { grit: 2000, xp: 1000, badge: 'unstoppable' },
    difficulty: 'hard' as const,
    rarity: 'epic' as const,
  },
  {
    id: 'season_connector',
    category: 'social' as const,
    title: 'The Connector',
    description: 'Refer 10 users who complete 1 gig each',
    icon: 'Network',
    target: 10,
    rewards: { grit: 15000, crowns: 1, xp: 7500 },
    difficulty: 'epic' as const,
    rarity: 'legendary' as const,
  },
  {
    id: 'season_winter_hustle',
    category: 'completion' as const,
    title: 'Winter Hustle',
    description: 'Earn 1,000 Grit in one week',
    icon: 'Snowflake',
    target: 1000,
    rewards: { grit: 3000, taskCredits: 15, xp: 1500, badge: 'winter_warrior' },
    difficulty: 'epic' as const,
    rarity: 'legendary' as const,
  },
];

export const QUEST_STREAK_MULTIPLIERS = [
  { days: 3, multiplier: 1.25, label: '3-Day Streak' },
  { days: 7, multiplier: 1.5, label: '7-Day Streak' },
  { days: 14, multiplier: 2.0, label: '14-Day Streak' },
  { days: 30, multiplier: 2.5, label: '30-Day Streak' },
];

export const RARITY_COLORS = {
  common: {
    bg: 'rgba(156, 163, 175, 0.1)',
    border: '#9CA3AF',
    glow: 'rgba(156, 163, 175, 0.3)',
  },
  rare: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  epic: {
    bg: 'rgba(168, 85, 247, 0.1)',
    border: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.3)',
  },
  legendary: {
    bg: 'rgba(251, 191, 36, 0.1)',
    border: '#FBBF24',
    glow: 'rgba(251, 191, 36, 0.3)',
  },
};

export const DIFFICULTY_COLORS = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
  epic: '#A855F7',
};
