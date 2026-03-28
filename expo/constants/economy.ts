export type CurrencyType = 'grit' | 'taskCredits' | 'crowns';

export interface Currency {
  type: CurrencyType;
  name: string;
  symbol: string;
  description: string;
  color: string;
  gradient: string[];
}

export const CURRENCIES: Record<CurrencyType, Currency> = {
  grit: {
    type: 'grit',
    name: 'Grit',
    symbol: '⚡',
    description: 'Earned through real effort — not luck',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
  },
  taskCredits: {
    type: 'taskCredits',
    name: 'Task Credits',
    symbol: '💵',
    description: 'Spend on premium tools or withdraw',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  crowns: {
    type: 'crowns',
    name: 'Crowns',
    symbol: '👑',
    description: 'Prestige tokens for permanent upgrades',
    color: '#A855F7',
    gradient: ['#A855F7', '#7C3AED'],
  },
};

export interface WalletBalance {
  grit: number;
  taskCredits: number;
  crowns: number;
}

export interface EconomyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'convert';
  currency: CurrencyType;
  amount: number;
  source: string;
  description: string;
  createdAt: string;
}

export const GRIT_REWARDS = {
  TASK_COMPLETION_BASE: 50,
  DAILY_STREAK: 25,
  LEVEL_UP: 100,
  BADGE_EARNED: 75,
  FIRST_TASK_OF_DAY: 30,
  PERFECT_RATING: 40,
  FAST_RESPONSE: 20,
  PROOF_UPLOAD: 15,
};

export const TASK_CREDIT_REWARDS = {
  TIER_MILESTONE: 5,
  PRESTIGE: 50,
  WEEKLY_TOP_10: 10,
  MONTHLY_TOP_3: 25,
};

export const CONVERSION_RATES = {
  GRIT_TO_TASK_CREDITS: 100,
  TASK_CREDITS_TO_USD: 1,
};
