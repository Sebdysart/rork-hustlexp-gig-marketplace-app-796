export interface TrophyTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: number;
  color: string;
  glow: string;
  model: string;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  category: 'milestone' | 'genre' | 'achievement' | 'prestige';
  genre?: 'cleaning' | 'errands' | 'handyman' | 'delivery' | 'tech' | 'creative' | 'nursing' | 'all';
  tiers: TrophyTier[];
  trackingKey: 'tasksCompleted' | 'genreTasksCompleted' | 'earnings' | 'level' | 'xp' | 'streakDays';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const TROPHIES: Trophy[] = [
  {
    id: 'quest-legend',
    name: 'Quest Legend',
    description: 'Complete quests to unlock legendary status',
    category: 'milestone',
    trackingKey: 'tasksCompleted',
    icon: '🏆',
    rarity: 'legendary',
    tiers: [
      {
        tier: 'bronze',
        requirement: 100,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '🥉',
      },
      {
        tier: 'silver',
        requirement: 250,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '🥈',
      },
      {
        tier: 'gold',
        requirement: 500,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '🥇',
      },
      {
        tier: 'platinum',
        requirement: 1000,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '💎',
      },
      {
        tier: 'diamond',
        requirement: 2500,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '💠',
      },
    ],
  },
  {
    id: 'clean-master',
    name: 'Clean Master',
    description: 'Master of cleaning tasks',
    category: 'genre',
    genre: 'cleaning',
    trackingKey: 'genreTasksCompleted',
    icon: '✨',
    rarity: 'epic',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '🧹',
      },
      {
        tier: 'silver',
        requirement: 50,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '🧽',
      },
      {
        tier: 'gold',
        requirement: 100,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '✨',
      },
      {
        tier: 'platinum',
        requirement: 250,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '🌟',
      },
      {
        tier: 'diamond',
        requirement: 500,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '💫',
      },
    ],
  },
  {
    id: 'errand-emperor',
    name: 'Errand Emperor',
    description: 'Rule the world of errands',
    category: 'genre',
    genre: 'errands',
    trackingKey: 'genreTasksCompleted',
    icon: '🏃',
    rarity: 'epic',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '📦',
      },
      {
        tier: 'silver',
        requirement: 50,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '🏃',
      },
      {
        tier: 'gold',
        requirement: 100,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '⚡',
      },
      {
        tier: 'platinum',
        requirement: 250,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '👑',
      },
      {
        tier: 'diamond',
        requirement: 500,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '🌠',
      },
    ],
  },
  {
    id: 'handyman-hero',
    name: 'Handyman Hero',
    description: 'Fix anything, anywhere',
    category: 'genre',
    genre: 'handyman',
    trackingKey: 'genreTasksCompleted',
    icon: '🔧',
    rarity: 'epic',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '🔨',
      },
      {
        tier: 'silver',
        requirement: 50,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '🔧',
      },
      {
        tier: 'gold',
        requirement: 100,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '⚙️',
      },
      {
        tier: 'platinum',
        requirement: 250,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '🛠️',
      },
      {
        tier: 'diamond',
        requirement: 500,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '⚡',
      },
    ],
  },
  {
    id: 'nursing-angel',
    name: 'Nursing Angel',
    description: 'Care with compassion',
    category: 'genre',
    genre: 'nursing',
    trackingKey: 'genreTasksCompleted',
    icon: '💉',
    rarity: 'epic',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '💊',
      },
      {
        tier: 'silver',
        requirement: 50,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '💉',
      },
      {
        tier: 'gold',
        requirement: 100,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '🏥',
      },
      {
        tier: 'platinum',
        requirement: 250,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '❤️',
      },
      {
        tier: 'diamond',
        requirement: 500,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '👼',
      },
    ],
  },
  {
    id: 'tech-wizard',
    name: 'Tech Wizard',
    description: 'Master of technology',
    category: 'genre',
    genre: 'tech',
    trackingKey: 'genreTasksCompleted',
    icon: '💻',
    rarity: 'epic',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '🖥️',
      },
      {
        tier: 'silver',
        requirement: 50,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '💻',
      },
      {
        tier: 'gold',
        requirement: 100,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '⚡',
      },
      {
        tier: 'platinum',
        requirement: 250,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '🧙',
      },
      {
        tier: 'diamond',
        requirement: 500,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '🌌',
      },
    ],
  },
  {
    id: 'wealth-builder',
    name: 'Wealth Builder',
    description: 'Accumulate massive earnings',
    category: 'achievement',
    trackingKey: 'earnings',
    icon: '💰',
    rarity: 'legendary',
    tiers: [
      {
        tier: 'bronze',
        requirement: 1000,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '💵',
      },
      {
        tier: 'silver',
        requirement: 5000,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '💰',
      },
      {
        tier: 'gold',
        requirement: 10000,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '💸',
      },
      {
        tier: 'platinum',
        requirement: 25000,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '🏦',
      },
      {
        tier: 'diamond',
        requirement: 50000,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '👑',
      },
    ],
  },
  {
    id: 'level-titan',
    name: 'Level Titan',
    description: 'Reach legendary levels',
    category: 'prestige',
    trackingKey: 'level',
    icon: '⚡',
    rarity: 'legendary',
    tiers: [
      {
        tier: 'bronze',
        requirement: 25,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '🌱',
      },
      {
        tier: 'silver',
        requirement: 50,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '🌿',
      },
      {
        tier: 'gold',
        requirement: 75,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '🌳',
      },
      {
        tier: 'platinum',
        requirement: 100,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '⚡',
      },
      {
        tier: 'diamond',
        requirement: 150,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '🌌',
      },
    ],
  },
  {
    id: 'streak-inferno',
    name: 'Streak Inferno',
    description: 'Maintain unstoppable streaks',
    category: 'achievement',
    trackingKey: 'streakDays',
    icon: '🔥',
    rarity: 'epic',
    tiers: [
      {
        tier: 'bronze',
        requirement: 7,
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.6)',
        model: '🔥',
      },
      {
        tier: 'silver',
        requirement: 30,
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.7)',
        model: '🔥',
      },
      {
        tier: 'gold',
        requirement: 100,
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.8)',
        model: '🔥',
      },
      {
        tier: 'platinum',
        requirement: 365,
        color: '#E5E4E2',
        glow: 'rgba(229, 228, 226, 0.9)',
        model: '🔥',
      },
      {
        tier: 'diamond',
        requirement: 1000,
        color: '#B9F2FF',
        glow: 'rgba(185, 242, 255, 1)',
        model: '🔥',
      },
    ],
  },
];

export function getTrophyProgress(user: any, trophyId: string): {
  currentTier: TrophyTier | null;
  progress: number;
  nextTier: TrophyTier | null;
  isUnlocked: boolean;
} {
  const trophy = TROPHIES.find(t => t.id === trophyId);
  if (!trophy) return { currentTier: null, progress: 0, nextTier: null, isUnlocked: false };

  let userValue = 0;
  switch (trophy.trackingKey) {
    case 'tasksCompleted':
      userValue = user.tasksCompleted || 0;
      break;
    case 'genreTasksCompleted':
      if (trophy.genre && user.genreTasksCompleted) {
        userValue = user.genreTasksCompleted[trophy.genre] || 0;
      }
      break;
    case 'earnings':
      userValue = user.earnings || 0;
      break;
    case 'level':
      userValue = user.level || 1;
      break;
    case 'xp':
      userValue = user.xp || 0;
      break;
    case 'streakDays':
      userValue = user.streaks?.longest || 0;
      break;
  }

  let currentTier: TrophyTier | null = null;
  let nextTier: TrophyTier | null = trophy.tiers[0];
  let isUnlocked = false;

  for (let i = trophy.tiers.length - 1; i >= 0; i--) {
    if (userValue >= trophy.tiers[i].requirement) {
      currentTier = trophy.tiers[i];
      nextTier = trophy.tiers[i + 1] || null;
      isUnlocked = true;
      break;
    }
  }

  const progress = nextTier ? Math.min((userValue / nextTier.requirement) * 100, 100) : 100;

  return { currentTier, progress, nextTier, isUnlocked };
}

export function getAllUnlockedTrophies(user: any): { trophy: Trophy; tier: TrophyTier }[] {
  const unlocked: { trophy: Trophy; tier: TrophyTier }[] = [];

  TROPHIES.forEach(trophy => {
    const { currentTier, isUnlocked } = getTrophyProgress(user, trophy.id);
    if (isUnlocked && currentTier) {
      unlocked.push({ trophy, tier: currentTier });
    }
  });

  return unlocked.sort((a, b) => {
    const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
    return tierOrder[b.tier.tier] - tierOrder[a.tier.tier];
  });
}
