export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 'speed' | 'perfection' | 'specialist' | 'grind' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  rarityPercent: number;
  xpBonus: number;
  condition: (user: any) => boolean;
  unlockedMessage: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'lightning-bolt',
    name: 'Lightning Bolt',
    description: 'Accept tasks within 30 seconds 100 times',
    icon: '⚡',
    category: 'speed',
    rarity: 'epic',
    rarityPercent: 5.2,
    xpBonus: 500,
    condition: (user) => (user.speedAccepts || 0) >= 100,
    unlockedMessage: 'You are LIGHTNING FAST! +500 XP',
  },
  {
    id: 'flash',
    name: 'Flash',
    description: 'Complete 10 tasks in one day',
    icon: '⚡',
    category: 'speed',
    rarity: 'rare',
    rarityPercent: 12.5,
    xpBonus: 300,
    condition: (user) => (user.maxTasksInDay || 0) >= 10,
    unlockedMessage: 'A true speed demon! +300 XP',
  },
  {
    id: 'speed-of-light',
    name: 'Speed of Light',
    description: 'Maintain <15min response time for 30 days',
    icon: '💨',
    category: 'speed',
    rarity: 'legendary',
    rarityPercent: 2.1,
    xpBonus: 1000,
    condition: (user) => (user.fastResponseStreak || 0) >= 30,
    unlockedMessage: 'LEGENDARY speed! +1000 XP',
  },
  {
    id: 'flawless-streak',
    name: 'Flawless Streak',
    description: '50 consecutive 5-star reviews',
    icon: '⭐',
    category: 'perfection',
    rarity: 'epic',
    rarityPercent: 4.8,
    xpBonus: 750,
    condition: (user) => (user.perfectReviewStreak || 0) >= 50,
    unlockedMessage: 'Perfection personified! +750 XP',
  },
  {
    id: 'trust-master',
    name: 'Trust Master',
    description: 'Maintain 95+ trust score for 90 days',
    icon: '🛡️',
    category: 'perfection',
    rarity: 'legendary',
    rarityPercent: 3.2,
    xpBonus: 1000,
    condition: (user) => (user.highTrustDays || 0) >= 90,
    unlockedMessage: 'LEGENDARY trust! +1000 XP',
  },
  {
    id: 'zero-disputes',
    name: 'Zero Disputes',
    description: '500 tasks with no poster conflicts',
    icon: '🤝',
    category: 'perfection',
    rarity: 'epic',
    rarityPercent: 6.7,
    xpBonus: 500,
    condition: (user) => user.tasksCompleted >= 500 && (user.disputes || 0) === 0,
    unlockedMessage: 'Conflict-free excellence! +500 XP',
  },
  {
    id: 'triple-threat',
    name: 'Triple Threat',
    description: 'Master 3 categories (Legendary badges)',
    icon: '🔥',
    category: 'specialist',
    rarity: 'legendary',
    rarityPercent: 1.8,
    xpBonus: 1500,
    condition: (user) => {
      const legendaryCount = Object.values(user.genreTasksCompleted || {}).filter((count: any) => count >= 1000).length;
      return legendaryCount >= 3;
    },
    unlockedMessage: 'LEGENDARY specialist! +1500 XP',
  },
  {
    id: 'jack-of-all-trades',
    name: 'Jack of All Trades',
    description: 'Complete tasks in 10+ categories',
    icon: '🎯',
    category: 'specialist',
    rarity: 'rare',
    rarityPercent: 15.3,
    xpBonus: 400,
    condition: (user) => Object.keys(user.genreTasksCompleted || {}).length >= 10,
    unlockedMessage: 'Versatility master! +400 XP',
  },
  {
    id: 'category-king',
    name: 'Category King',
    description: '#1 in category leaderboard for 7 days',
    icon: '👑',
    category: 'specialist',
    rarity: 'epic',
    rarityPercent: 4.2,
    xpBonus: 800,
    condition: (user) => (user.categoryLeaderDays || 0) >= 7,
    unlockedMessage: 'Crowned champion! +800 XP',
  },
  {
    id: 'marathon-runner',
    name: 'Marathon Runner',
    description: '100-day login streak',
    icon: '🏃',
    category: 'grind',
    rarity: 'epic',
    rarityPercent: 7.8,
    xpBonus: 600,
    condition: (user) => (user.streaks?.longest || 0) >= 100,
    unlockedMessage: 'Unstoppable dedication! +600 XP',
  },
  {
    id: 'hustlers-hustler',
    name: "Hustler's Hustler",
    description: '1,000 total tasks completed',
    icon: '💪',
    category: 'grind',
    rarity: 'epic',
    rarityPercent: 8.5,
    xpBonus: 1000,
    condition: (user) => user.tasksCompleted >= 1000,
    unlockedMessage: 'True hustler! +1000 XP',
  },
  {
    id: 'millionaire-mindset',
    name: 'Millionaire Mindset',
    description: 'Earn 1M GritCoins lifetime',
    icon: '💎',
    category: 'grind',
    rarity: 'legendary',
    rarityPercent: 2.4,
    xpBonus: 2000,
    condition: (user) => (user.lifetimeGritCoins || 0) >= 1000000,
    unlockedMessage: 'LEGENDARY wealth! +2000 XP',
  },
  {
    id: 'goat-status',
    name: 'GOAT Status',
    description: 'Rank #1 overall for 30 days',
    icon: '🐐',
    category: 'legendary',
    rarity: 'legendary',
    rarityPercent: 0.5,
    xpBonus: 5000,
    condition: (user) => (user.rankOneDays || 0) >= 30,
    unlockedMessage: 'YOU ARE THE GOAT! +5000 XP',
  },
  {
    id: 'platinum-standard',
    name: 'Platinum Standard',
    description: 'Legendary badges in 5+ categories',
    icon: '💠',
    category: 'legendary',
    rarity: 'legendary',
    rarityPercent: 0.8,
    xpBonus: 3000,
    condition: (user) => {
      const legendaryCount = Object.values(user.genreTasksCompleted || {}).filter((count: any) => count >= 1000).length;
      return legendaryCount >= 5;
    },
    unlockedMessage: 'LEGENDARY mastery! +3000 XP',
  },
  {
    id: 'the-myth',
    name: 'The Myth',
    description: '10,000 tasks completed',
    icon: '🌟',
    category: 'legendary',
    rarity: 'legendary',
    rarityPercent: 0.2,
    xpBonus: 10000,
    condition: (user) => user.tasksCompleted >= 10000,
    unlockedMessage: 'YOU ARE LEGENDARY! +10000 XP',
  },
];

export function checkAchievements(user: any): Achievement[] {
  const unlockedAchievements = user.achievements || [];
  const newlyUnlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    const isAlreadyUnlocked = unlockedAchievements.includes(achievement.id);
    if (!isAlreadyUnlocked && achievement.condition(user)) {
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
}

export function getUnlockedAchievements(user: any): Achievement[] {
  const unlockedIds = user.achievements || [];
  return ACHIEVEMENTS.filter(achievement => unlockedIds.includes(achievement.id));
}

export function getLockedAchievements(user: any): Achievement[] {
  const unlockedIds = user.achievements || [];
  return ACHIEVEMENTS.filter(achievement => !unlockedIds.includes(achievement.id));
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
}
