export interface ReferralReward {
  id: string;
  type: 'grit' | 'xp' | 'task_credit' | 'boost' | 'badge';
  amount: number;
  description: string;
  icon: string;
}

export interface ReferralTier {
  tier: number;
  name: string;
  referralsRequired: number;
  rewards: ReferralReward[];
  color: string;
  badge?: string;
}

export const REFERRAL_REWARDS = {
  referrer: {
    immediate: [
      {
        id: 'ref-grit',
        type: 'grit' as const,
        amount: 100,
        description: '100 Grit when friend signs up',
        icon: '⚡',
      },
      {
        id: 'ref-xp',
        type: 'xp' as const,
        amount: 50,
        description: '50 XP bonus',
        icon: '✨',
      },
    ],
    onFirstTask: [
      {
        id: 'ref-task-credit',
        type: 'task_credit' as const,
        amount: 10,
        description: '$10 task credit when friend completes first task',
        icon: '💰',
      },
      {
        id: 'ref-boost',
        type: 'boost' as const,
        amount: 1,
        description: '10% earnings boost for 7 days',
        icon: '🚀',
      },
    ],
  },
  referee: {
    immediate: [
      {
        id: 'new-grit',
        type: 'grit' as const,
        amount: 50,
        description: '50 Grit welcome bonus',
        icon: '⚡',
      },
      {
        id: 'new-xp',
        type: 'xp' as const,
        amount: 25,
        description: '25 XP head start',
        icon: '✨',
      },
    ],
    onFirstTask: [
      {
        id: 'new-task-credit',
        type: 'task_credit' as const,
        amount: 5,
        description: '$5 task credit after first completion',
        icon: '💰',
      },
    ],
  },
};

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    tier: 1,
    name: 'Networker',
    referralsRequired: 5,
    color: '#10B981',
    rewards: [
      {
        id: 'tier1-grit',
        type: 'grit',
        amount: 250,
        description: '250 Grit Bonus',
        icon: '⚡',
      },
      {
        id: 'tier1-badge',
        type: 'badge',
        amount: 1,
        description: 'Networker Badge',
        icon: '🌟',
      },
    ],
  },
  {
    tier: 2,
    name: 'Connector',
    referralsRequired: 15,
    color: '#3B82F6',
    rewards: [
      {
        id: 'tier2-grit',
        type: 'grit',
        amount: 500,
        description: '500 Grit Bonus',
        icon: '⚡',
      },
      {
        id: 'tier2-xp',
        type: 'xp',
        amount: 500,
        description: '500 XP Bonus',
        icon: '✨',
      },
      {
        id: 'tier2-badge',
        type: 'badge',
        amount: 1,
        description: 'Connector Badge',
        icon: '🔗',
      },
    ],
  },
  {
    tier: 3,
    name: 'Influencer',
    referralsRequired: 50,
    color: '#8B5CF6',
    rewards: [
      {
        id: 'tier3-grit',
        type: 'grit',
        amount: 1000,
        description: '1000 Grit Bonus',
        icon: '⚡',
      },
      {
        id: 'tier3-xp',
        type: 'xp',
        amount: 1000,
        description: '1000 XP Bonus',
        icon: '✨',
      },
      {
        id: 'tier3-credit',
        type: 'task_credit',
        amount: 50,
        description: '$50 Task Credit',
        icon: '💰',
      },
      {
        id: 'tier3-badge',
        type: 'badge',
        amount: 1,
        description: 'Influencer Badge',
        icon: '👑',
      },
    ],
  },
  {
    tier: 4,
    name: 'Legend',
    referralsRequired: 100,
    color: '#F59E0B',
    badge: 'legend-referrer',
    rewards: [
      {
        id: 'tier4-grit',
        type: 'grit',
        amount: 2500,
        description: '2500 Grit Bonus',
        icon: '⚡',
      },
      {
        id: 'tier4-xp',
        type: 'xp',
        amount: 2500,
        description: '2500 XP Bonus',
        icon: '✨',
      },
      {
        id: 'tier4-credit',
        type: 'task_credit',
        amount: 100,
        description: '$100 Task Credit',
        icon: '💰',
      },
      {
        id: 'tier4-boost',
        type: 'boost',
        amount: 1,
        description: 'Permanent 5% Earnings Boost',
        icon: '🚀',
      },
      {
        id: 'tier4-badge',
        type: 'badge',
        amount: 1,
        description: 'Legend Badge',
        icon: '🏆',
      },
    ],
  },
];

export function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getReferralTier(referralCount: number): ReferralTier | null {
  for (let i = REFERRAL_TIERS.length - 1; i >= 0; i--) {
    if (referralCount >= REFERRAL_TIERS[i].referralsRequired) {
      return REFERRAL_TIERS[i];
    }
  }
  return null;
}

export function getNextReferralTier(referralCount: number): ReferralTier | null {
  for (const tier of REFERRAL_TIERS) {
    if (referralCount < tier.referralsRequired) {
      return tier;
    }
  }
  return null;
}

export function calculateReferralProgress(referralCount: number): {
  currentTier: ReferralTier | null;
  nextTier: ReferralTier | null;
  progress: number;
} {
  const currentTier = getReferralTier(referralCount);
  const nextTier = getNextReferralTier(referralCount);

  let progress = 0;
  if (nextTier) {
    const prevRequired = currentTier?.referralsRequired || 0;
    const nextRequired = nextTier.referralsRequired;
    progress = ((referralCount - prevRequired) / (nextRequired - prevRequired)) * 100;
  } else {
    progress = 100;
  }

  return { currentTier, nextTier, progress };
}
