export interface RankTier {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  gradient: string[];
  icon: string;
  perks: string[];
  xpMultiplier: number;
  unlocks: string[];
  featureUnlocks: string[];
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Hustler',
    minLevel: 1,
    maxLevel: 9,
    color: '#CD7F32',
    gradient: ['#CD7F32', '#B87333'],
    icon: '🥉',
    perks: ['Basic task access', 'Standard XP rates'],
    xpMultiplier: 1.0,
    unlocks: ['Daily Quests', 'Basic Badges'],
    featureUnlocks: ['badge-library', 'daily-quests'],
  },
  {
    id: 'silver',
    name: 'Silver Hustler',
    minLevel: 10,
    maxLevel: 24,
    color: '#C0C0C0',
    gradient: ['#E8E8E8', '#C0C0C0'],
    icon: '🥈',
    perks: ['+5% XP boost', 'Priority support', 'Silver badge'],
    xpMultiplier: 1.05,
    unlocks: ['Weekly Leaderboards', 'Streak Missions', 'Custom Themes'],
    featureUnlocks: ['shop', 'progressive-badges', 'seasons'],
  },
  {
    id: 'gold',
    name: 'Gold Hustler',
    minLevel: 25,
    maxLevel: 49,
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
    icon: '🥇',
    perks: ['+10% XP boost', '+5% earnings', 'Gold badge', 'Featured profile'],
    xpMultiplier: 1.1,
    unlocks: ['Exclusive Power-Ups', 'Squad Creation', 'Advanced Analytics'],
    featureUnlocks: ['squads', 'squad-quests', 'trophy-room'],
  },
  {
    id: 'platinum',
    name: 'Platinum Hustler',
    minLevel: 50,
    maxLevel: 99,
    color: '#E5E4E2',
    gradient: ['#E5E4E2', '#B4B4B4'],
    icon: '💎',
    perks: ['+15% XP boost', '+10% earnings', 'Platinum badge', 'VIP support'],
    xpMultiplier: 1.15,
    unlocks: ['Legendary Power-Ups', 'Skill Tree', 'Premium Themes'],
    featureUnlocks: ['skill-tree', 'adventure-map'],
  },
  {
    id: 'diamond',
    name: 'Diamond Hustler',
    minLevel: 100,
    maxLevel: 999,
    color: '#B9F2FF',
    gradient: ['#B9F2FF', '#00CED1'],
    icon: '💠',
    perks: ['+25% XP boost', '+15% earnings', 'Diamond badge', 'Elite status'],
    xpMultiplier: 1.25,
    unlocks: ['All Features', 'Custom Animations', 'Exclusive Events'],
    featureUnlocks: [],
  },
];

export function getRankForLevel(level: number): RankTier {
  return RANK_TIERS.find(
    rank => level >= rank.minLevel && level <= rank.maxLevel
  ) || RANK_TIERS[0];
}

export function getNextRank(currentLevel: number): RankTier | null {
  const currentRank = getRankForLevel(currentLevel);
  const currentIndex = RANK_TIERS.findIndex(r => r.id === currentRank.id);
  return currentIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentIndex + 1] : null;
}

export function getProgressToNextRank(currentLevel: number): number {
  const currentRank = getRankForLevel(currentLevel);
  const progress = (currentLevel - currentRank.minLevel) / (currentRank.maxLevel - currentRank.minLevel + 1);
  return Math.max(0, Math.min(1, progress));
}
