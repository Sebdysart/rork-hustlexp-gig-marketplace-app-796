import { Badge, BADGES_MANIFEST, getBadgeById, getNextTierBadge } from '@/constants/badgesManifest';

export interface BadgeProgress {
  badgeId: string;
  current: number;
  required: number;
  percentage: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface UserBadgeState {
  unlockedBadges: string[];
  badgeProgress: Record<string, BadgeProgress>;
  totalXP: number;
  totalGritCoins: number;
}

export function calculateXPFromTask(taskPayUsd: number, category: string): number {
  const baseMultiplier = 1.2;
  const categoryMultipliers: Record<string, number> = {
    Cleaning: 1.0,
    Moving: 1.3,
    Handyman: 1.4,
    Plumbing: 1.5,
    Electrical: 1.6,
    Childcare: 1.3,
    Nursing: 1.8,
    Tutoring: 1.2,
    Digital: 1.3,
    SocialMedia: 1.1,
    Delivery: 1.0,
    Landscaping: 1.2,
  };

  const multiplier = categoryMultipliers[category] || baseMultiplier;
  return Math.floor(taskPayUsd * multiplier);
}

export function calculateBadgeProgress(
  badge: Badge,
  userStats: {
    tasksCompleted: number;
    tasksByCategory: Record<string, number>;
    totalEarnings: number;
    streakDays: number;
    referrals: number;
    aiInteractions: number;
    verifiedDocuments: string[];
    specialEvents: string[];
  }
): BadgeProgress {
  const condition = badge.unlock_condition;
  let current = 0;
  let required = 0;

  switch (condition.type) {
    case 'count_tasks':
      if (condition.category) {
        current = userStats.tasksByCategory[condition.category] || 0;
      } else {
        current = userStats.tasksCompleted;
      }
      required = condition.count || 0;
      break;

    case 'total_earnings':
      current = userStats.totalEarnings;
      required = condition.amount || 0;
      break;

    case 'streak_days':
      current = userStats.streakDays;
      required = condition.days || 0;
      break;

    case 'referrals':
      current = userStats.referrals;
      required = condition.count || 0;
      break;

    case 'ai_interactions':
      current = userStats.aiInteractions;
      required = condition.count || 0;
      break;

    case 'verified_documents':
      const docType = condition.metadata?.doc_type;
      current = docType && userStats.verifiedDocuments.includes(docType) ? 1 : 0;
      required = 1;
      break;

    case 'special_event':
      const eventId = condition.event_id;
      current = eventId && userStats.specialEvents.includes(eventId) ? 1 : 0;
      required = 1;
      break;

    default:
      current = 0;
      required = 1;
  }

  const percentage = required > 0 ? Math.min((current / required) * 100, 100) : 0;
  const isUnlocked = current >= required;

  return {
    badgeId: badge.id,
    current,
    required,
    percentage,
    isUnlocked,
  };
}

export function getAllBadgeProgress(userStats: {
  tasksCompleted: number;
  tasksByCategory: Record<string, number>;
  totalEarnings: number;
  streakDays: number;
  referrals: number;
  aiInteractions: number;
  verifiedDocuments: string[];
  specialEvents: string[];
}): Record<string, BadgeProgress> {
  const progress: Record<string, BadgeProgress> = {};

  BADGES_MANIFEST.forEach(badge => {
    progress[badge.id] = calculateBadgeProgress(badge, userStats);
  });

  return progress;
}

export function getUnlockedBadges(badgeProgress: Record<string, BadgeProgress>): string[] {
  return Object.entries(badgeProgress)
    .filter(([_, progress]) => progress.isUnlocked)
    .map(([badgeId]) => badgeId);
}

export function getNextBadgesToUnlock(
  badgeProgress: Record<string, BadgeProgress>,
  limit: number = 5
): Badge[] {
  const unlockedBadges = getUnlockedBadges(badgeProgress);
  
  const nextBadges = BADGES_MANIFEST
    .filter(badge => !unlockedBadges.includes(badge.id))
    .map(badge => ({
      badge,
      progress: badgeProgress[badge.id],
    }))
    .filter(({ progress }) => progress.percentage > 0)
    .sort((a, b) => b.progress.percentage - a.progress.percentage)
    .slice(0, limit)
    .map(({ badge }) => badge);

  return nextBadges;
}

export function getBadgeEvolutionPath(badgeId: string): Badge[] {
  const path: Badge[] = [];
  let currentBadge = getBadgeById(badgeId);

  while (currentBadge) {
    path.push(currentBadge);
    const nextBadge = getNextTierBadge(currentBadge.id);
    if (!nextBadge || path.some(b => b.id === nextBadge.id)) break;
    currentBadge = nextBadge;
  }

  return path;
}

export function calculateTotalXPFromBadges(unlockedBadgeIds: string[]): number {
  return unlockedBadgeIds.reduce((total, badgeId) => {
    const badge = getBadgeById(badgeId);
    return total + (badge?.xp_reward || 0);
  }, 0);
}

export function calculateTotalGritCoinsFromBadges(unlockedBadgeIds: string[]): number {
  return unlockedBadgeIds.reduce((total, badgeId) => {
    const badge = getBadgeById(badgeId);
    return total + (badge?.gritcoin_reward || 0);
  }, 0);
}

export function shouldShowBadgeUnlockNotification(
  previousProgress: BadgeProgress,
  currentProgress: BadgeProgress
): boolean {
  return !previousProgress.isUnlocked && currentProgress.isUnlocked;
}

export function getBadgeRarityRank(badgeId: string): number {
  const badge = getBadgeById(badgeId);
  if (!badge) return 0;

  const tierRanks = {
    Common: 1,
    Uncommon: 2,
    Rare: 3,
    Epic: 4,
    Legendary: 5,
    Mythic: 6,
  };

  return tierRanks[badge.tier] || 0;
}

export function sortBadgesByRarity(badgeIds: string[]): string[] {
  return [...badgeIds].sort((a, b) => {
    const rankA = getBadgeRarityRank(a);
    const rankB = getBadgeRarityRank(b);
    return rankB - rankA;
  });
}

export function filterBadgesByCategory(badgeIds: string[], category: string): string[] {
  return badgeIds.filter(badgeId => {
    const badge = getBadgeById(badgeId);
    return badge?.category === category;
  });
}

export function filterBadgesByTier(badgeIds: string[], tier: string): string[] {
  return badgeIds.filter(badgeId => {
    const badge = getBadgeById(badgeId);
    return badge?.tier === tier;
  });
}

export function getMockUserStats() {
  return {
    tasksCompleted: 47,
    tasksByCategory: {
      Cleaning: 12,
      Moving: 5,
      Handyman: 8,
      Plumbing: 3,
      Electrical: 2,
      Childcare: 4,
      Nursing: 0,
      Tutoring: 6,
      Digital: 5,
      SocialMedia: 2,
      Delivery: 0,
      Landscaping: 0,
    },
    totalEarnings: 2450,
    streakDays: 12,
    referrals: 3,
    aiInteractions: 28,
    verifiedDocuments: ['id', 'drivers_license'],
    specialEvents: ['beta_cohort'],
  };
}
