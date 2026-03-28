import { useMemo } from 'react';
import {
  AscensionTier,
  getTierForLevel,
  getNextTier,
  getProgressToNextTier,
  getLevelsUntilNextTier,
  isNearNextTier,
} from '@/constants/ascensionTiers';

export interface UseAscensionTierResult {
  currentTier: AscensionTier;
  nextTier: AscensionTier | null;
  progress: number;
  levelsRemaining: number;
  isNearNext: boolean;
  isMaxTier: boolean;
  xpMultiplier: number;
  platformFee: number;
  priorityMatching: string;
  theme: AscensionTier['theme'];
  effects: AscensionTier['effects'];
  hasJustUnlocked: (oldLevel: number, newLevel: number) => boolean;
}

export function useAscensionTier(currentLevel: number): UseAscensionTierResult {
  const currentTier = useMemo(() => getTierForLevel(currentLevel), [currentLevel]);
  const nextTier = useMemo(() => getNextTier(currentLevel), [currentLevel]);
  const progress = useMemo(() => getProgressToNextTier(currentLevel), [currentLevel]);
  const levelsRemaining = useMemo(() => getLevelsUntilNextTier(currentLevel), [currentLevel]);
  const isNearNext = useMemo(() => isNearNextTier(currentLevel, 0.8), [currentLevel]);
  const isMaxTier = useMemo(() => !nextTier, [nextTier]);

  const hasJustUnlocked = (oldLevel: number, newLevel: number): boolean => {
    const oldTier = getTierForLevel(oldLevel);
    const newTier = getTierForLevel(newLevel);
    return oldTier.id !== newTier.id;
  };

  return {
    currentTier,
    nextTier,
    progress,
    levelsRemaining,
    isNearNext,
    isMaxTier,
    xpMultiplier: currentTier.xpMultiplier,
    platformFee: currentTier.platformFee,
    priorityMatching: currentTier.priorityMatching,
    theme: currentTier.theme,
    effects: currentTier.effects,
    hasJustUnlocked,
  };
}

export function calculateTierBonusXP(baseXP: number, currentLevel: number): number {
  const tier = getTierForLevel(currentLevel);
  return baseXP * tier.xpMultiplier;
}

export function calculateTierPlatformFee(amount: number, currentLevel: number): number {
  const tier = getTierForLevel(currentLevel);
  return amount * (tier.platformFee / 100);
}

export function getTierSavings(currentLevel: number): {
  feePercentageSaved: number;
  baselineFee: number;
  currentFee: number;
} {
  const baselineFee = 15;
  const currentTier = getTierForLevel(currentLevel);
  const currentFee = currentTier.platformFee;
  const feePercentageSaved = baselineFee - currentFee;

  return {
    feePercentageSaved,
    baselineFee,
    currentFee,
  };
}
