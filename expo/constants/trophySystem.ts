export type TrophyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface Trophy {
  id: string;
  title: string;
  tier: TrophyTier;
  description: string;
  unlock_condition: {
    type: 'total_earnings' | 'badge_count' | 'task_count' | 'special_achievement';
    value?: number;
    badge_tier?: string;
    metadata?: Record<string, any>;
  };
  xp_reward: number;
  gritcoin_reward: number;
  visual_asset: string;
  visibility_boost: number;
  unlock_message: string;
}

export const TROPHIES: Trophy[] = [
  {
    id: 'trophy_earner_1k',
    title: 'Top Earner - $1K',
    tier: 'Bronze',
    description: 'Earned $1,000 total on HustleXP',
    unlock_condition: { type: 'total_earnings', value: 1000 },
    xp_reward: 500,
    gritcoin_reward: 100,
    visual_asset: 'trophy_earner_bronze.svg',
    visibility_boost: 5,
    unlock_message: 'Bronze Trophy unlocked! Your profile gets a visibility boost!',
  },
  {
    id: 'trophy_earner_10k',
    title: 'Top Earner - $10K',
    tier: 'Silver',
    description: 'Earned $10,000 total on HustleXP',
    unlock_condition: { type: 'total_earnings', value: 10000 },
    xp_reward: 2000,
    gritcoin_reward: 500,
    visual_asset: 'trophy_earner_silver.svg',
    visibility_boost: 15,
    unlock_message: 'Silver Trophy unlocked! Major visibility boost!',
  },
  {
    id: 'trophy_earner_50k',
    title: 'Top Earner - $50K',
    tier: 'Gold',
    description: 'Earned $50,000 total on HustleXP',
    unlock_condition: { type: 'total_earnings', value: 50000 },
    xp_reward: 10000,
    gritcoin_reward: 2000,
    visual_asset: 'trophy_earner_gold.svg',
    visibility_boost: 30,
    unlock_message: 'Gold Trophy unlocked! Elite status achieved!',
  },
  {
    id: 'trophy_earner_100k',
    title: 'Top Earner - $100K',
    tier: 'Platinum',
    description: 'Earned $100,000 total on HustleXP',
    unlock_condition: { type: 'total_earnings', value: 100000 },
    xp_reward: 25000,
    gritcoin_reward: 5000,
    visual_asset: 'trophy_earner_platinum.svg',
    visibility_boost: 50,
    unlock_message: 'Platinum Trophy unlocked! You are in the top 1%!',
  },
  {
    id: 'trophy_master_tradesman',
    title: 'Master Tradesman',
    tier: 'Gold',
    description: 'Unlock all Epic tier badges in any trade skill',
    unlock_condition: { type: 'badge_count', value: 1, badge_tier: 'Epic', metadata: { category_prefix: 'Skill:' } },
    xp_reward: 5000,
    gritcoin_reward: 1000,
    visual_asset: 'trophy_master_tradesman.svg',
    visibility_boost: 25,
    unlock_message: 'Master Tradesman Trophy! You are a true professional!',
  },
  {
    id: 'trophy_community_hero',
    title: 'Community Hero',
    tier: 'Platinum',
    description: 'Unlock all Community badges',
    unlock_condition: { type: 'badge_count', value: 10, metadata: { category: 'Community' } },
    xp_reward: 8000,
    gritcoin_reward: 1500,
    visual_asset: 'trophy_community_hero.svg',
    visibility_boost: 40,
    unlock_message: 'Community Hero Trophy! You make HustleXP better!',
  },
  {
    id: 'trophy_task_master_100',
    title: 'Task Master - 100',
    tier: 'Bronze',
    description: 'Complete 100 tasks',
    unlock_condition: { type: 'task_count', value: 100 },
    xp_reward: 1000,
    gritcoin_reward: 200,
    visual_asset: 'trophy_task_master_bronze.svg',
    visibility_boost: 10,
    unlock_message: 'Task Master Bronze! Century club member!',
  },
  {
    id: 'trophy_task_master_500',
    title: 'Task Master - 500',
    tier: 'Silver',
    description: 'Complete 500 tasks',
    unlock_condition: { type: 'task_count', value: 500 },
    xp_reward: 5000,
    gritcoin_reward: 1000,
    visual_asset: 'trophy_task_master_silver.svg',
    visibility_boost: 20,
    unlock_message: 'Task Master Silver! Legendary dedication!',
  },
  {
    id: 'trophy_task_master_1000',
    title: 'Task Master - 1000',
    tier: 'Gold',
    description: 'Complete 1000 tasks',
    unlock_condition: { type: 'task_count', value: 1000 },
    xp_reward: 15000,
    gritcoin_reward: 3000,
    visual_asset: 'trophy_task_master_gold.svg',
    visibility_boost: 35,
    unlock_message: 'Task Master Gold! You are unstoppable!',
  },
  {
    id: 'trophy_badge_collector',
    title: 'Badge Collector',
    tier: 'Silver',
    description: 'Unlock 50 badges',
    unlock_condition: { type: 'badge_count', value: 50 },
    xp_reward: 3000,
    gritcoin_reward: 600,
    visual_asset: 'trophy_badge_collector.svg',
    visibility_boost: 15,
    unlock_message: 'Badge Collector Trophy! Impressive collection!',
  },
  {
    id: 'trophy_legend',
    title: 'The Legend',
    tier: 'Diamond',
    description: 'Unlock 5 Legendary badges',
    unlock_condition: { type: 'badge_count', value: 5, badge_tier: 'Legendary' },
    xp_reward: 50000,
    gritcoin_reward: 10000,
    visual_asset: 'trophy_legend.svg',
    visibility_boost: 100,
    unlock_message: 'The Legend Trophy! You are a HustleXP icon!',
  },
  {
    id: 'trophy_perfect_hustler',
    title: 'Perfect Hustler',
    tier: 'Platinum',
    description: 'Maintain 5-star rating for 100 tasks',
    unlock_condition: { type: 'special_achievement', metadata: { achievement_id: 'perfect_100' } },
    xp_reward: 20000,
    gritcoin_reward: 4000,
    visual_asset: 'trophy_perfect_hustler.svg',
    visibility_boost: 45,
    unlock_message: 'Perfect Hustler Trophy! Flawless execution!',
  },
];

export function getTrophyById(id: string): Trophy | undefined {
  return TROPHIES.find(trophy => trophy.id === id);
}

export function getTrophiesByTier(tier: TrophyTier): Trophy[] {
  return TROPHIES.filter(trophy => trophy.tier === tier);
}

export function calculateTrophyProgress(
  trophy: Trophy,
  userStats: {
    totalEarnings: number;
    tasksCompleted: number;
    unlockedBadges: string[];
  }
): { current: number; required: number; percentage: number; isUnlocked: boolean } {
  const condition = trophy.unlock_condition;
  let current = 0;
  let required = 0;

  switch (condition.type) {
    case 'total_earnings':
      current = userStats.totalEarnings;
      required = condition.value || 0;
      break;

    case 'task_count':
      current = userStats.tasksCompleted;
      required = condition.value || 0;
      break;

    case 'badge_count':
      if (condition.badge_tier) {
        current = userStats.unlockedBadges.length;
      } else {
        current = userStats.unlockedBadges.length;
      }
      required = condition.value || 0;
      break;

    case 'special_achievement':
      current = 0;
      required = 1;
      break;
  }

  const percentage = required > 0 ? Math.min((current / required) * 100, 100) : 0;
  const isUnlocked = current >= required;

  return { current, required, percentage, isUnlocked };
}

export const TROPHY_TIER_COLORS: Record<TrophyTier, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Diamond: '#B9F2FF',
};

export function getTrophyTierColor(tier: TrophyTier): string {
  return TROPHY_TIER_COLORS[tier];
}
