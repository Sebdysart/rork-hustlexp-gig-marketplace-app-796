export interface BadgeTier {
  tier: number;
  name: string;
  icon: string;
  requirement: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  glow: string;
}

export interface ProgressiveBadge {
  id: string;
  category: string;
  baseName: string;
  description: string;
  tiers: BadgeTier[];
  trackingKey: 'tasksCompleted' | 'xp' | 'earnings' | 'streakDays' | 'level';
}

export const PROGRESSIVE_BADGES: ProgressiveBadge[] = [
  {
    id: 'hustler',
    category: 'completion',
    baseName: 'Hustler',
    description: 'Complete tasks to unlock higher tiers',
    trackingKey: 'tasksCompleted',
    tiers: [
      {
        tier: 1,
        name: 'Bronze Hustler',
        icon: '🥉',
        requirement: 1,
        rarity: 'common',
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.5)',
      },
      {
        tier: 2,
        name: 'Silver Hustler',
        icon: '🥈',
        requirement: 10,
        rarity: 'common',
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.5)',
      },
      {
        tier: 3,
        name: 'Gold Hustler',
        icon: '🥇',
        requirement: 25,
        rarity: 'rare',
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.5)',
      },
      {
        tier: 4,
        name: 'Platinum Hustler',
        icon: '💎',
        requirement: 50,
        rarity: 'epic',
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.6)',
      },
      {
        tier: 5,
        name: 'Diamond Hustler',
        icon: '💠',
        requirement: 100,
        rarity: 'epic',
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 0.7)',
      },
      {
        tier: 6,
        name: 'Master Hustler',
        icon: '⭐',
        requirement: 250,
        rarity: 'legendary',
        color: '#FF6B6B',
        glow: 'rgba(255, 107, 107, 0.8)',
      },
      {
        tier: 7,
        name: 'Legendary Hustler',
        icon: '👑',
        requirement: 500,
        rarity: 'legendary',
        color: '#FFB800',
        glow: 'rgba(255, 184, 0, 1)',
      },
    ],
  },
  {
    id: 'speed-demon',
    category: 'speed',
    baseName: 'Speed Demon',
    description: 'Complete tasks quickly to unlock speed tiers',
    trackingKey: 'tasksCompleted',
    tiers: [
      {
        tier: 1,
        name: 'Quick Worker',
        icon: '⚡',
        requirement: 5,
        rarity: 'common',
        color: '#FFA500',
        glow: 'rgba(255, 165, 0, 0.5)',
      },
      {
        tier: 2,
        name: 'Speed Runner',
        icon: '💨',
        requirement: 20,
        rarity: 'rare',
        color: '#00CED1',
        glow: 'rgba(0, 206, 209, 0.6)',
      },
      {
        tier: 3,
        name: 'Lightning Fast',
        icon: '⚡',
        requirement: 50,
        rarity: 'epic',
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.7)',
      },
      {
        tier: 4,
        name: 'Speed Demon',
        icon: '🔥',
        requirement: 100,
        rarity: 'legendary',
        color: '#FF4500',
        glow: 'rgba(255, 69, 0, 0.9)',
      },
    ],
  },
  {
    id: 'money-maker',
    category: 'earnings',
    baseName: 'Money Maker',
    description: 'Earn money to unlock wealth tiers',
    trackingKey: 'earnings',
    tiers: [
      {
        tier: 1,
        name: 'Penny Pincher',
        icon: '💵',
        requirement: 100,
        rarity: 'common',
        color: '#85BB65',
        glow: 'rgba(133, 187, 101, 0.5)',
      },
      {
        tier: 2,
        name: 'Money Maker',
        icon: '💰',
        requirement: 500,
        rarity: 'rare',
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.6)',
      },
      {
        tier: 3,
        name: 'Big Earner',
        icon: '💸',
        requirement: 1000,
        rarity: 'epic',
        color: '#00FF00',
        glow: 'rgba(0, 255, 0, 0.7)',
      },
      {
        tier: 4,
        name: 'Wealth Builder',
        icon: '🏦',
        requirement: 2500,
        rarity: 'epic',
        color: '#4169E1',
        glow: 'rgba(65, 105, 225, 0.8)',
      },
      {
        tier: 5,
        name: 'Tycoon',
        icon: '👔',
        requirement: 5000,
        rarity: 'legendary',
        color: '#8B008B',
        glow: 'rgba(139, 0, 139, 0.9)',
      },
    ],
  },
  {
    id: 'streak-master',
    category: 'consistency',
    baseName: 'Streak Master',
    description: 'Maintain daily streaks to unlock consistency tiers',
    trackingKey: 'streakDays',
    tiers: [
      {
        tier: 1,
        name: 'Consistent',
        icon: '🔥',
        requirement: 3,
        rarity: 'common',
        color: '#FF6347',
        glow: 'rgba(255, 99, 71, 0.5)',
      },
      {
        tier: 2,
        name: 'Dedicated',
        icon: '🔥',
        requirement: 7,
        rarity: 'rare',
        color: '#FF4500',
        glow: 'rgba(255, 69, 0, 0.6)',
      },
      {
        tier: 3,
        name: 'Committed',
        icon: '🔥',
        requirement: 14,
        rarity: 'epic',
        color: '#FF0000',
        glow: 'rgba(255, 0, 0, 0.7)',
      },
      {
        tier: 4,
        name: 'Unstoppable',
        icon: '🔥',
        requirement: 30,
        rarity: 'epic',
        color: '#DC143C',
        glow: 'rgba(220, 20, 60, 0.8)',
      },
      {
        tier: 5,
        name: 'Eternal Flame',
        icon: '🔥',
        requirement: 100,
        rarity: 'legendary',
        color: '#8B0000',
        glow: 'rgba(139, 0, 0, 1)',
      },
    ],
  },
  {
    id: 'level-master',
    category: 'progression',
    baseName: 'Level Master',
    description: 'Reach higher levels to unlock prestige tiers',
    trackingKey: 'level',
    tiers: [
      {
        tier: 1,
        name: 'Novice',
        icon: '🌱',
        requirement: 5,
        rarity: 'common',
        color: '#90EE90',
        glow: 'rgba(144, 238, 144, 0.5)',
      },
      {
        tier: 2,
        name: 'Apprentice',
        icon: '🌿',
        requirement: 10,
        rarity: 'common',
        color: '#32CD32',
        glow: 'rgba(50, 205, 50, 0.5)',
      },
      {
        tier: 3,
        name: 'Expert',
        icon: '🌳',
        requirement: 25,
        rarity: 'rare',
        color: '#228B22',
        glow: 'rgba(34, 139, 34, 0.6)',
      },
      {
        tier: 4,
        name: 'Master',
        icon: '🏆',
        requirement: 50,
        rarity: 'epic',
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.7)',
      },
      {
        tier: 5,
        name: 'Grandmaster',
        icon: '👑',
        requirement: 75,
        rarity: 'legendary',
        color: '#FF1493',
        glow: 'rgba(255, 20, 147, 0.8)',
      },
      {
        tier: 6,
        name: 'Legend',
        icon: '⚡',
        requirement: 100,
        rarity: 'legendary',
        color: '#9400D3',
        glow: 'rgba(148, 0, 211, 1)',
      },
    ],
  },
  {
    id: 'xp-grinder',
    category: 'experience',
    baseName: 'XP Grinder',
    description: 'Earn XP to unlock experience tiers',
    trackingKey: 'xp',
    tiers: [
      {
        tier: 1,
        name: 'XP Collector',
        icon: '✨',
        requirement: 500,
        rarity: 'common',
        color: '#FFE4B5',
        glow: 'rgba(255, 228, 181, 0.5)',
      },
      {
        tier: 2,
        name: 'XP Hunter',
        icon: '⭐',
        requirement: 2000,
        rarity: 'rare',
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.6)',
      },
      {
        tier: 3,
        name: 'XP Farmer',
        icon: '🌟',
        requirement: 5000,
        rarity: 'epic',
        color: '#FFA500',
        glow: 'rgba(255, 165, 0, 0.7)',
      },
      {
        tier: 4,
        name: 'XP Master',
        icon: '💫',
        requirement: 10000,
        rarity: 'epic',
        color: '#FF8C00',
        glow: 'rgba(255, 140, 0, 0.8)',
      },
      {
        tier: 5,
        name: 'XP Legend',
        icon: '✨',
        requirement: 25000,
        rarity: 'legendary',
        color: '#FF4500',
        glow: 'rgba(255, 69, 0, 0.9)',
      },
    ],
  },
];

export function getBadgeProgress(user: any, badgeId: string): { currentTier: number; progress: number; nextTier: BadgeTier | null } {
  const badge = PROGRESSIVE_BADGES.find(b => b.id === badgeId);
  if (!badge) return { currentTier: 0, progress: 0, nextTier: null };

  let userValue = 0;
  switch (badge.trackingKey) {
    case 'tasksCompleted':
      userValue = user.tasksCompleted || 0;
      break;
    case 'xp':
      userValue = user.xp || 0;
      break;
    case 'earnings':
      userValue = user.earnings || 0;
      break;
    case 'streakDays':
      userValue = user.streaks?.longest || 0;
      break;
    case 'level':
      userValue = user.level || 1;
      break;
  }

  let currentTier = 0;
  let nextTier: BadgeTier | null = null;

  for (let i = badge.tiers.length - 1; i >= 0; i--) {
    if (userValue >= badge.tiers[i].requirement) {
      currentTier = badge.tiers[i].tier;
      nextTier = badge.tiers[i + 1] || null;
      break;
    }
  }

  if (currentTier === 0 && badge.tiers.length > 0) {
    nextTier = badge.tiers[0];
  }

  const progress = nextTier ? (userValue / nextTier.requirement) * 100 : 100;

  return { currentTier, progress: Math.min(progress, 100), nextTier };
}

export function getCurrentBadgeTier(badgeId: string, tier: number): BadgeTier | null {
  const badge = PROGRESSIVE_BADGES.find(b => b.id === badgeId);
  if (!badge) return null;
  return badge.tiers.find(t => t.tier === tier) || null;
}

export function getAllUnlockedBadges(user: any): { badge: ProgressiveBadge; tier: BadgeTier }[] {
  const unlocked: { badge: ProgressiveBadge; tier: BadgeTier }[] = [];

  PROGRESSIVE_BADGES.forEach(badge => {
    const { currentTier } = getBadgeProgress(user, badge.id);
    if (currentTier > 0) {
      const tier = getCurrentBadgeTier(badge.id, currentTier);
      if (tier) {
        unlocked.push({ badge, tier });
      }
    }
  });

  return unlocked;
}
