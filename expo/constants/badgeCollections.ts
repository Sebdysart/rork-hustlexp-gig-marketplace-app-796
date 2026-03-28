export interface BadgeCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  badges: string[];
  completionReward: {
    xp: number;
    gritCoins: number;
    specialBadgeId?: string;
    title?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
}

export const BADGE_COLLECTIONS: BadgeCollection[] = [
  {
    id: 'hustler_journey',
    name: 'Hustler Journey',
    description: 'Complete all hustler progression badges',
    icon: '🚀',
    badges: [
      'badge_misc_first_task',
      'badge_rep_reliable_bronze',
      'badge_rep_reliable_silver',
      'badge_rep_reliable_gold',
      'badge_rep_reliable_platinum',
    ],
    completionReward: {
      xp: 10000,
      gritCoins: 2000,
      specialBadgeId: 'badge_collection_hustler_master',
      title: 'Hustler Master',
    },
    rarity: 'legendary',
    category: 'progression',
  },
  {
    id: 'skill_master',
    name: 'Skill Master Collection',
    description: 'Unlock all skill category badges at Master level',
    icon: '⚡',
    badges: [
      'badge_skill_cleaning_master',
      'badge_skill_moving_master',
      'badge_skill_handyman_master',
      'badge_skill_plumbing_master',
      'badge_skill_electrical_master',
      'badge_skill_childcare_master',
      'badge_skill_nursing_master',
      'badge_skill_tutoring_master',
      'badge_skill_digital_master',
      'badge_skill_socialmedia_master',
      'badge_skill_delivery_master',
      'badge_skill_landscaping_master',
    ],
    completionReward: {
      xp: 50000,
      gritCoins: 10000,
      specialBadgeId: 'badge_collection_ultimate_tradesman',
      title: 'Ultimate Tradesman',
    },
    rarity: 'legendary',
    category: 'skills',
  },
  {
    id: 'wealth_builder',
    name: 'Wealth Builder Path',
    description: 'Complete all economy milestone badges',
    icon: '💰',
    badges: [
      'badge_econ_first_100',
      'badge_econ_first_500',
      'badge_econ_first_1k',
      'badge_econ_first_5k',
      'badge_econ_first_10k',
      'badge_econ_first_25k',
      'badge_econ_first_50k',
    ],
    completionReward: {
      xp: 25000,
      gritCoins: 5000,
      specialBadgeId: 'badge_collection_wealth_titan',
      title: 'Wealth Titan',
    },
    rarity: 'epic',
    category: 'economy',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon Collection',
    description: 'Master all speed-related challenges',
    icon: '⚡',
    badges: [
      'badge_speed_same_day_10',
      'badge_speed_same_day_50',
      'badge_speed_quick_accept_streak',
      'badge_speed_efficiency_expert',
      'badge_speed_rapid_fire',
      'badge_speed_marathon_hustler',
    ],
    completionReward: {
      xp: 15000,
      gritCoins: 3000,
      specialBadgeId: 'badge_collection_velocity_master',
      title: 'Velocity Master',
    },
    rarity: 'epic',
    category: 'speed',
  },
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Build the strongest community network',
    icon: '👥',
    badges: [
      'badge_comm_referral_bronze',
      'badge_comm_referral_silver',
      'badge_comm_referral_gold',
      'badge_comm_referral_platinum',
      'badge_comm_mentor',
      'badge_comm_top_reviewer',
      'badge_comm_squad_leader',
      'badge_comm_team_player',
    ],
    completionReward: {
      xp: 20000,
      gritCoins: 4000,
      specialBadgeId: 'badge_collection_community_legend',
      title: 'Community Legend',
    },
    rarity: 'epic',
    category: 'community',
  },
  {
    id: 'ai_innovator',
    name: 'AI Innovator',
    description: 'Master all AI-powered features',
    icon: '🤖',
    badges: [
      'badge_ai_prompt_master',
      'badge_ai_prompt_legend',
      'badge_ai_auto_hustler',
      'badge_ai_auto_hustler_pro',
      'badge_ai_coach_student',
      'badge_ai_foreman_apprentice',
      'badge_ai_verification_trusted',
      'badge_ai_smart_matcher',
    ],
    completionReward: {
      xp: 18000,
      gritCoins: 3500,
      specialBadgeId: 'badge_collection_ai_whisperer',
      title: 'AI Whisperer',
    },
    rarity: 'epic',
    category: 'ai',
  },
  {
    id: 'reputation_guardian',
    name: 'Reputation Guardian',
    description: 'Maintain perfect reputation across all metrics',
    icon: '⭐',
    badges: [
      'badge_rep_five_star_streak_10',
      'badge_rep_five_star_streak_25',
      'badge_rep_five_star_streak_50',
      'badge_rep_quick_responder',
      'badge_rep_lightning_responder',
      'badge_rep_dispute_free_bronze',
      'badge_rep_dispute_free_silver',
      'badge_rep_dispute_free_gold',
    ],
    completionReward: {
      xp: 22000,
      gritCoins: 4500,
      specialBadgeId: 'badge_collection_reputation_titan',
      title: 'Reputation Titan',
    },
    rarity: 'legendary',
    category: 'reputation',
  },
  {
    id: 'safety_first',
    name: 'Safety First Collection',
    description: 'Complete all safety and verification badges',
    icon: '🛡️',
    badges: [
      'badge_safety_verified_id',
      'badge_safety_background_checked',
      'badge_safety_insured',
      'badge_safety_first_aid_certified',
      'badge_safety_cpr_certified',
      'badge_safety_drivers_license',
    ],
    completionReward: {
      xp: 12000,
      gritCoins: 2500,
      specialBadgeId: 'badge_collection_safety_guardian',
      title: 'Safety Guardian',
    },
    rarity: 'rare',
    category: 'safety',
  },
  {
    id: 'creator_elite',
    name: 'Creator Elite',
    description: 'Master the art of task creation',
    icon: '🎨',
    badges: [
      'badge_creator_repeat_poster',
      'badge_creator_power_poster',
      'badge_creator_mega_poster',
      'badge_creator_viral_task',
      'badge_creator_influencer_bronze',
      'badge_creator_influencer_silver',
      'badge_creator_influencer_gold',
      'badge_creator_generous_tipper',
    ],
    completionReward: {
      xp: 16000,
      gritCoins: 3200,
      specialBadgeId: 'badge_collection_creator_legend',
      title: 'Creator Legend',
    },
    rarity: 'epic',
    category: 'creator',
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain unbreakable streaks and consistency',
    icon: '🔥',
    badges: [
      'badge_misc_perfect_week',
      'badge_misc_perfect_month',
      'badge_misc_early_bird',
      'badge_misc_night_owl',
    ],
    completionReward: {
      xp: 10000,
      gritCoins: 2000,
      specialBadgeId: 'badge_collection_consistency_master',
      title: 'Consistency Master',
    },
    rarity: 'rare',
    category: 'consistency',
  },
  {
    id: 'event_collector',
    name: 'Event Collector',
    description: 'Participate in all special events',
    icon: '🎉',
    badges: [
      'badge_event_beta_tester',
      'badge_event_founder',
      'badge_event_summer_hustle_2025',
      'badge_event_holiday_helper_2024',
      'badge_event_new_year_2025',
      'badge_event_earth_day_2025',
      'badge_event_black_friday_2024',
      'badge_event_anniversary_year_1',
    ],
    completionReward: {
      xp: 30000,
      gritCoins: 6000,
      specialBadgeId: 'badge_collection_event_legend',
      title: 'Event Legend',
    },
    rarity: 'legendary',
    category: 'events',
  },
  {
    id: 'professional_trades',
    name: 'Professional Trades',
    description: 'Get certified in professional trades',
    icon: '🔧',
    badges: [
      'badge_safety_certified_electrician',
      'badge_safety_certified_plumber',
      'badge_safety_certified_hvac',
      'badge_safety_nursing_license',
    ],
    completionReward: {
      xp: 20000,
      gritCoins: 4000,
      specialBadgeId: 'badge_collection_master_tradesman',
      title: 'Master Tradesman',
    },
    rarity: 'legendary',
    category: 'professional',
  },
];

export function getCollectionProgress(
  collectionId: string,
  unlockedBadges: string[]
): {
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
  missingBadges: string[];
} {
  const collection = BADGE_COLLECTIONS.find((c) => c.id === collectionId);
  if (!collection) {
    return {
      completed: 0,
      total: 0,
      percentage: 0,
      isComplete: false,
      missingBadges: [],
    };
  }

  const completed = collection.badges.filter((badgeId) =>
    unlockedBadges.includes(badgeId)
  ).length;
  const total = collection.badges.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = completed === total;
  const missingBadges = collection.badges.filter(
    (badgeId) => !unlockedBadges.includes(badgeId)
  );

  return {
    completed,
    total,
    percentage,
    isComplete,
    missingBadges,
  };
}

export function getAllCollectionsProgress(unlockedBadges: string[]): {
  [collectionId: string]: ReturnType<typeof getCollectionProgress>;
} {
  const progress: {
    [collectionId: string]: ReturnType<typeof getCollectionProgress>;
  } = {};

  BADGE_COLLECTIONS.forEach((collection) => {
    progress[collection.id] = getCollectionProgress(
      collection.id,
      unlockedBadges
    );
  });

  return progress;
}

export function getCompletedCollections(unlockedBadges: string[]): BadgeCollection[] {
  return BADGE_COLLECTIONS.filter((collection) => {
    const progress = getCollectionProgress(collection.id, unlockedBadges);
    return progress.isComplete;
  });
}

export function getNearlyCompleteCollections(
  unlockedBadges: string[],
  threshold: number = 80
): BadgeCollection[] {
  return BADGE_COLLECTIONS.filter((collection) => {
    const progress = getCollectionProgress(collection.id, unlockedBadges);
    return progress.percentage >= threshold && !progress.isComplete;
  });
}
