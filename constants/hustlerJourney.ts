export interface JourneyTier {
  id: string;
  tier: number;
  minLevel: number;
  maxLevel: number;
  title: string;
  theme: string;
  themeColors: {
    primary: string;
    secondary: string;
    gradient: string[];
    glow: string;
  };
  rewards: {
    grit?: number;
    taskCredits?: number;
    boostTokens?: number;
    payoutBoost?: number;
    badge?: string;
  };
  vibe: string;
  unlocks: string[];
  animation: 'pulse' | 'glow' | 'shimmer' | 'particle' | 'liquid';
}

export const HUSTLER_JOURNEY: JourneyTier[] = [
  {
    id: 'starter',
    tier: 1,
    minLevel: 1,
    maxLevel: 10,
    title: 'The Starter',
    theme: 'Neon blue gradients, intro city skyline',
    themeColors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      gradient: ['#3B82F6', '#1E40AF'],
      glow: '#60A5FA',
    },
    rewards: {
      grit: 100,
      badge: 'First Steps',
    },
    vibe: 'Just getting started',
    unlocks: ['XP Bar Animation', 'Basic Tasks', 'Daily Login Bonus'],
    animation: 'pulse',
  },
  {
    id: 'side_hustler',
    tier: 2,
    minLevel: 11,
    maxLevel: 20,
    title: 'Side Hustler',
    theme: 'Futuristic orange UI overlay',
    themeColors: {
      primary: '#F97316',
      secondary: '#FB923C',
      gradient: ['#F97316', '#EA580C'],
      glow: '#FB923C',
    },
    rewards: {
      taskCredits: 5,
      badge: 'Momentum Builder',
    },
    vibe: 'Building momentum',
    unlocks: ['Task Filters', 'Profile Customization', 'Streak Tracking'],
    animation: 'glow',
  },
  {
    id: 'operator',
    tier: 3,
    minLevel: 21,
    maxLevel: 30,
    title: 'The Operator',
    theme: 'Silver chrome UI + grid animation',
    themeColors: {
      primary: '#C0C0C0',
      secondary: '#E8E8E8',
      gradient: ['#E8E8E8', '#A8A8A8'],
      glow: '#FFFFFF',
    },
    rewards: {
      grit: 300,
      boostTokens: 2,
      badge: 'System Master',
    },
    vibe: 'Systemizing the grind',
    unlocks: ['Power-Up Shop', 'Advanced Stats', 'Priority Notifications'],
    animation: 'shimmer',
  },
  {
    id: 'rainmaker',
    tier: 4,
    minLevel: 31,
    maxLevel: 40,
    title: 'Rainmaker',
    theme: 'Metallic purple aura',
    themeColors: {
      primary: '#A855F7',
      secondary: '#C084FC',
      gradient: ['#A855F7', '#7C3AED'],
      glow: '#C084FC',
    },
    rewards: {
      payoutBoost: 3,
      badge: 'Deal Magnet',
    },
    vibe: 'Deals start finding you',
    unlocks: ['Verified Badge', 'Featured Profile', 'Instant Match Priority'],
    animation: 'glow',
  },
  {
    id: 'architect',
    tier: 5,
    minLevel: 41,
    maxLevel: 50,
    title: 'The Architect',
    theme: 'Gold accents + skyline animation',
    themeColors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      gradient: ['#FFD700', '#FF8C00'],
      glow: '#FFED4E',
    },
    rewards: {
      grit: 500,
      taskCredits: 10,
      badge: 'Empire Builder',
    },
    vibe: "You're designing your empire",
    unlocks: ['Squad Creation', 'Custom Themes', 'Analytics Dashboard'],
    animation: 'shimmer',
  },
  {
    id: 'boss',
    tier: 6,
    minLevel: 51,
    maxLevel: 60,
    title: 'Boss Level',
    theme: 'Dynamic background w/ motion blur',
    themeColors: {
      primary: '#EF4444',
      secondary: '#F87171',
      gradient: ['#EF4444', '#DC2626'],
      glow: '#FCA5A5',
    },
    rewards: {
      boostTokens: 5,
      badge: 'Boss Status',
    },
    vibe: "You're a name now",
    unlocks: ['Priority Listings', 'Exclusive Power-Ups', 'VIP Support'],
    animation: 'pulse',
  },
  {
    id: 'icon',
    tier: 7,
    minLevel: 61,
    maxLevel: 70,
    title: 'Icon',
    theme: 'Neon pulse glow profile',
    themeColors: {
      primary: '#06B6D4',
      secondary: '#22D3EE',
      gradient: ['#06B6D4', '#0891B2'],
      glow: '#67E8F9',
    },
    rewards: {
      taskCredits: 15,
      badge: 'Brand Power',
    },
    vibe: 'Branding power unlocked',
    unlocks: ['Personal Brand Kit', 'Social Share Tools', 'Influencer Perks'],
    animation: 'glow',
  },
  {
    id: 'legacy',
    tier: 8,
    minLevel: 71,
    maxLevel: 80,
    title: 'Legacy Builder',
    theme: 'Jet-black theme w/ gold trails',
    themeColors: {
      primary: '#000000',
      secondary: '#FFD700',
      gradient: ['#1F1F1F', '#000000'],
      glow: '#FFD700',
    },
    rewards: {
      grit: 1000,
      payoutBoost: 5,
      badge: 'Legacy',
    },
    vibe: 'Wealth & influence expanding',
    unlocks: ['Partner Perks', 'Elite Contracts', 'Mentorship Program'],
    animation: 'particle',
  },
  {
    id: 'mogul',
    tier: 9,
    minLevel: 81,
    maxLevel: 90,
    title: 'Mogul',
    theme: 'Diamond gradient holographic',
    themeColors: {
      primary: '#B9F2FF',
      secondary: '#00CED1',
      gradient: ['#B9F2FF', '#00CED1', '#4682B4'],
      glow: '#E0FFFF',
    },
    rewards: {
      taskCredits: 25,
      payoutBoost: 5,
      badge: 'Elite Status',
    },
    vibe: 'Elite status earned',
    unlocks: ['Diamond Badge', 'Exclusive Events', 'Premium Partnerships'],
    animation: 'shimmer',
  },
  {
    id: 'elite',
    tier: 10,
    minLevel: 91,
    maxLevel: 100,
    title: 'Hustle Elite',
    theme: 'Animated particle UI (like liquid gold)',
    themeColors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      gradient: ['#FFD700', '#FF8C00', '#FF6347'],
      glow: '#FFED4E',
    },
    rewards: {
      taskCredits: 50,
      badge: 'Elite',
    },
    vibe: 'You made it — but you can go higher',
    unlocks: ['Prestige Mode', 'All Features', 'Legendary Status'],
    animation: 'liquid',
  },
];

export interface PrestigeLevel {
  level: number;
  payoutBoost: number;
  unlocks: string[];
  theme: string;
}

export const PRESTIGE_SYSTEM = {
  MAX_PRESTIGE: 10,
  RESET_LEVEL: 1,
  KEEP_ITEMS: ['badges', 'crowns', 'taskCredits', 'verifications'],
  RESET_ITEMS: ['level', 'xp', 'grit'],
  BENEFITS_PER_PRESTIGE: {
    payoutBoost: 2,
    crownReward: 1,
    exclusiveThemes: 1,
  },
};

export function getTierForLevel(level: number): JourneyTier {
  return HUSTLER_JOURNEY.find(
    tier => level >= tier.minLevel && level <= tier.maxLevel
  ) || HUSTLER_JOURNEY[0];
}

export function getNextTier(currentLevel: number): JourneyTier | null {
  const currentTier = getTierForLevel(currentLevel);
  const currentIndex = HUSTLER_JOURNEY.findIndex(t => t.id === currentTier.id);
  return currentIndex < HUSTLER_JOURNEY.length - 1 ? HUSTLER_JOURNEY[currentIndex + 1] : null;
}

export function getProgressToNextTier(currentLevel: number): number {
  const currentTier = getTierForLevel(currentLevel);
  const progress = (currentLevel - currentTier.minLevel) / (currentTier.maxLevel - currentTier.minLevel + 1);
  return Math.max(0, Math.min(1, progress));
}

export function canPrestige(level: number): boolean {
  return level >= 100;
}

export function calculatePrestigeRewards(prestigeLevel: number): {
  crowns: number;
  payoutBoost: number;
  themes: number;
} {
  return {
    crowns: prestigeLevel * PRESTIGE_SYSTEM.BENEFITS_PER_PRESTIGE.crownReward,
    payoutBoost: prestigeLevel * PRESTIGE_SYSTEM.BENEFITS_PER_PRESTIGE.payoutBoost,
    themes: prestigeLevel * PRESTIGE_SYSTEM.BENEFITS_PER_PRESTIGE.exclusiveThemes,
  };
}
