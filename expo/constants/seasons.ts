export interface SeasonChallenge {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  badgeReward?: string;
  type: 'daily' | 'weekly' | 'seasonal';
  icon: string;
}

export interface Season {
  id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  tier: number;
  challenges: SeasonChallenge[];
  limitedBadges: string[];
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const CURRENT_SEASON: Season = {
  id: 'season-1',
  name: 'Hustle Genesis',
  theme: 'The Beginning',
  startDate: '2025-10-01',
  endDate: '2025-10-31',
  tier: 1,
  limitedBadges: ['genesis-founder', 'first-blood', 'pioneer'],
  themeColors: {
    primary: '#00F0FF',
    secondary: '#9D4EDD',
    accent: '#FFD60A',
  },
  challenges: [
    {
      id: 'genesis-1',
      title: 'First Steps',
      description: 'Complete your first 5 tasks this season',
      requirement: 5,
      progress: 0,
      xpReward: 100,
      coinReward: 50,
      badgeReward: 'genesis-founder',
      type: 'seasonal',
      icon: '🎯',
    },
    {
      id: 'genesis-2',
      title: 'Speed Demon',
      description: 'Complete 3 tasks in under 2 hours each',
      requirement: 3,
      progress: 0,
      xpReward: 150,
      coinReward: 75,
      type: 'seasonal',
      icon: '⚡',
    },
    {
      id: 'genesis-3',
      title: 'Social Butterfly',
      description: 'Join or create a squad',
      requirement: 1,
      progress: 0,
      xpReward: 80,
      coinReward: 40,
      type: 'seasonal',
      icon: '🦋',
    },
    {
      id: 'genesis-4',
      title: 'Proof Master',
      description: 'Upload 10 ProofLinks with photos',
      requirement: 10,
      progress: 0,
      xpReward: 200,
      coinReward: 100,
      badgeReward: 'first-blood',
      type: 'seasonal',
      icon: '📸',
    },
    {
      id: 'genesis-5',
      title: 'Weekly Warrior',
      description: 'Complete at least 1 task every day for 7 days',
      requirement: 7,
      progress: 0,
      xpReward: 250,
      coinReward: 125,
      badgeReward: 'pioneer',
      type: 'weekly',
      icon: '🔥',
    },
    {
      id: 'genesis-6',
      title: 'Trust Builder',
      description: 'Reach TrustScore of 85+',
      requirement: 85,
      progress: 0,
      xpReward: 180,
      coinReward: 90,
      type: 'seasonal',
      icon: '🛡️',
    },
  ],
};

export const SEASON_TIERS = [
  { tier: 1, name: 'Bronze', minXP: 0, color: '#CD7F32' },
  { tier: 2, name: 'Silver', minXP: 1000, color: '#C0C0C0' },
  { tier: 3, name: 'Gold', minXP: 2500, color: '#FFD700' },
  { tier: 4, name: 'Platinum', minXP: 5000, color: '#E5E4E2' },
  { tier: 5, name: 'Diamond', minXP: 10000, color: '#B9F2FF' },
  { tier: 6, name: 'Legend', minXP: 20000, color: '#FF00FF' },
];

export function getSeasonProgress(userXP: number): {
  currentTier: typeof SEASON_TIERS[0];
  nextTier: typeof SEASON_TIERS[0] | null;
  progress: number;
} {
  let currentTier = SEASON_TIERS[0];
  let nextTier = SEASON_TIERS[1] || null;

  for (let i = 0; i < SEASON_TIERS.length; i++) {
    if (userXP >= SEASON_TIERS[i].minXP) {
      currentTier = SEASON_TIERS[i];
      nextTier = SEASON_TIERS[i + 1] || null;
    }
  }

  const progress = nextTier
    ? ((userXP - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100
    : 100;

  return { currentTier, nextTier, progress };
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
