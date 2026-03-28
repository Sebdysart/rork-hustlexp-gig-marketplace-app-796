import { User } from '@/types';
import { PRESTIGE_SYSTEM, calculatePrestigeRewards } from '@/constants/hustlerJourney';

export interface PrestigeResult {
  success: boolean;
  newPrestigeLevel: number;
  rewards: {
    crowns: number;
    payoutBoost: number;
    themes: number;
  };
  keptItems: {
    badges: number;
    taskCredits: number;
    crowns: number;
    verifications: number;
  };
}

export function canUserPrestige(user: User): boolean {
  return user.level >= 100;
}

export function calculatePrestigeData(user: User): PrestigeResult | null {
  if (!canUserPrestige(user)) {
    return null;
  }

  const currentPrestige = user.prestige?.level || 0;
  const newPrestigeLevel = currentPrestige + 1;

  if (newPrestigeLevel > PRESTIGE_SYSTEM.MAX_PRESTIGE) {
    return null;
  }

  const rewards = calculatePrestigeRewards(newPrestigeLevel);

  return {
    success: true,
    newPrestigeLevel,
    rewards,
    keptItems: {
      badges: user.badges.length,
      taskCredits: user.wallet?.taskCredits || 0,
      crowns: (user.wallet?.crowns || 0) + rewards.crowns,
      verifications: user.verificationBadges?.length || 0,
    },
  };
}

export function executePrestige(user: User): User {
  const prestigeData = calculatePrestigeData(user);
  
  if (!prestigeData) {
    throw new Error('Cannot prestige at this time');
  }

  const totalPrestige = (user.prestige?.totalPrestige || 0) + 1;
  const currentPayoutBoost = user.prestige?.permanentPayoutBoost || 0;

  return {
    ...user,
    level: PRESTIGE_SYSTEM.RESET_LEVEL,
    xp: 0,
    wallet: {
      grit: 0,
      taskCredits: user.wallet?.taskCredits || 0,
      crowns: (user.wallet?.crowns || 0) + prestigeData.rewards.crowns,
    },
    prestige: {
      level: prestigeData.newPrestigeLevel,
      totalPrestige,
      permanentPayoutBoost: currentPayoutBoost + prestigeData.rewards.payoutBoost,
    },
  };
}

export function getPrestigeDisplayName(prestigeLevel: number): string {
  if (prestigeLevel === 0) return '';
  if (prestigeLevel === 1) return '⭐';
  if (prestigeLevel === 2) return '⭐⭐';
  if (prestigeLevel === 3) return '⭐⭐⭐';
  if (prestigeLevel >= 4) return `⭐×${prestigeLevel}`;
  return '';
}

export function getTotalPayoutBoost(user: User): number {
  const prestigeBoost = user.prestige?.permanentPayoutBoost || 0;
  return prestigeBoost;
}
