import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PowerUp, Purchase, ActivePowerUp, UnlockedFeature } from '@/types';
import { useUser } from './UserContext';
import { calculateLevel } from '@/utils/gamification';
import { GRIT_REWARDS } from '@/constants/economy';

const STORAGE_KEYS = {
  PURCHASES: 'hustlexp_purchases',
  ACTIVE_POWERUPS: 'hustlexp_active_powerups',
};

const COMMISSION_RATE = 0.125;

let notificationHandler: ((userId: string, type: any, data?: any) => Promise<any>) | undefined;

export function setEconomyNotificationHandler(handler: (userId: string, type: any, data?: any) => Promise<any>) {
  notificationHandler = handler;
}

export const [EconomyProvider, useEconomy] = createContextHook(() => {
  const { currentUser, updateUser } = useUser();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<Record<string, ActivePowerUp[]>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedPurchases, storedActivePowerUps] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PURCHASES),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_POWERUPS),
      ]);

      if (storedPurchases) setPurchases(JSON.parse(storedPurchases));
      if (storedActivePowerUps) setActivePowerUps(JSON.parse(storedActivePowerUps));
    } catch (error) {
      console.error('Error loading economy data:', error);
    }
  };

  const checkAndUnlockFeatures = useCallback(async (newLevel: number, oldLevel: number) => {
    if (!currentUser) return;

    const gamificationFeatures = [
      { id: 'shop', name: 'Power-Up Shop', unlockLevel: 10 },
      { id: 'progressive-badges', name: 'Progressive Badges', unlockLevel: 10 },
      { id: 'seasons', name: 'Seasons', unlockLevel: 10 },
      { id: 'squads', name: 'Squads', unlockLevel: 25 },
      { id: 'squad-quests', name: 'Squad Quests', unlockLevel: 25 },
      { id: 'trophy-room', name: 'Trophy Room', unlockLevel: 25 },
      { id: 'skill-tree', name: 'Skill Tree', unlockLevel: 50 },
      { id: 'adventure-map', name: 'Adventure Map', unlockLevel: 50 },
    ];

    const unlockedFeatures = currentUser.unlockedFeatures || [];
    const newlyUnlocked: UnlockedFeature[] = [];

    for (const feature of gamificationFeatures) {
      if (newLevel >= feature.unlockLevel && oldLevel < feature.unlockLevel) {
        const alreadyUnlocked = unlockedFeatures.some(f => f.featureId === feature.id);
        if (!alreadyUnlocked) {
          const unlockedFeature: UnlockedFeature = {
            featureId: feature.id,
            unlockedAt: new Date().toISOString(),
            level: newLevel,
            viewed: false,
          };
          newlyUnlocked.push(unlockedFeature);

          if (notificationHandler) {
            notificationHandler(currentUser.id, 'feature_unlocked', {
              featureName: feature.name,
              featureId: feature.id,
              level: newLevel,
            });
          }
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      const updatedUser = {
        ...currentUser,
        unlockedFeatures: [...unlockedFeatures, ...newlyUnlocked],
      };
      await updateUser(updatedUser);
    }
  }, [currentUser, updateUser]);

  const awardXP = useCallback(async (xpAmount: number, reason: string) => {
    if (!currentUser) return;

    const userPowerUps = activePowerUps[currentUser.id] || [];
    const xpBoost = userPowerUps.find(p => p.powerUpId.includes('xp'));
    const xpMultiplier = xpBoost ? 2 : 1;

    const oldLevel = currentUser.level;
    const newXP = currentUser.xp + (xpAmount * xpMultiplier);
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;

    const updatedUser = {
      ...currentUser,
      xp: newXP,
      level: newLevel,
    };

    await updateUser(updatedUser);

    if (leveledUp && notificationHandler) {
      notificationHandler(currentUser.id, 'level_up', {
        newLevel,
      });
      await checkAndUnlockFeatures(newLevel, oldLevel);
    }

    console.log(`Awarded ${xpAmount * xpMultiplier} XP for ${reason}`);
    return { leveledUp, newLevel, xpAwarded: xpAmount * xpMultiplier };
  }, [currentUser, updateUser, activePowerUps, checkAndUnlockFeatures]);

  const awardGrit = useCallback(async (amount: number, reason: string) => {
    if (!currentUser) return;

    const currentGrit = currentUser.wallet?.grit || 0;
    const updatedUser = {
      ...currentUser,
      wallet: {
        ...currentUser.wallet,
        grit: currentGrit + amount,
        taskCredits: currentUser.wallet?.taskCredits || 0,
        crowns: currentUser.wallet?.crowns || 0,
      },
    };

    await updateUser(updatedUser);
    console.log(`Awarded ${amount} GRIT for ${reason}`);
  }, [currentUser, updateUser]);

  const processTaskCompletion = useCallback(async (task: { id: string; xpReward: number; payAmount: number; title: string }) => {
    if (!currentUser) return;

    const userPowerUps = activePowerUps[currentUser.id] || [];
    const xpBoost = userPowerUps.find(p => p.powerUpId.includes('xp'));
    const earningsBoost = userPowerUps.find(p => p.powerUpId.includes('earnings'));

    const xpMultiplier = xpBoost ? 2 : 1;
    const earningsMultiplier = earningsBoost ? 1.5 : 1;

    const commission = task.payAmount * COMMISSION_RATE;
    const netEarnings = task.payAmount - commission;

    const oldLevel = currentUser.level;
    const newXP = currentUser.xp + (task.xpReward * xpMultiplier);
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;

    const gritReward = GRIT_REWARDS.TASK_COMPLETION_BASE + (task.xpReward / 2);
    const currentGrit = currentUser.wallet?.grit || 0;

    const updatedUser = {
      ...currentUser,
      xp: newXP,
      level: newLevel,
      tasksCompleted: currentUser.tasksCompleted + 1,
      earnings: currentUser.earnings + (netEarnings * earningsMultiplier),
      wallet: {
        grit: currentGrit + gritReward,
        taskCredits: currentUser.wallet?.taskCredits || 0,
        crowns: currentUser.wallet?.crowns || 0,
      },
    };

    await updateUser(updatedUser);

    if (leveledUp && notificationHandler) {
      notificationHandler(currentUser.id, 'level_up', {
        newLevel,
      });
      await checkAndUnlockFeatures(newLevel, oldLevel);
    }

    console.log(`Task completed. Commission: ${commission.toFixed(2)}, Net earnings: ${netEarnings.toFixed(2)}`);
    return { leveledUp, newLevel, xpAwarded: task.xpReward * xpMultiplier, gritAwarded: gritReward, netEarnings };
  }, [currentUser, updateUser, activePowerUps, checkAndUnlockFeatures]);

  const purchasePowerUp = useCallback(async (powerUp: PowerUp) => {
    if (!currentUser) return { success: false, error: 'No user logged in' };

    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`,
      userId: currentUser.id,
      powerUpId: powerUp.id,
      price: powerUp.price,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      console.log('Processing Stripe payment for:', powerUp.name);
      console.log('Amount:', powerUp.price);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const completedPurchase: Purchase = {
        ...newPurchase,
        status: 'completed',
        stripePaymentId: `pi_test_${Date.now()}`,
      };

      const updatedPurchases = [...purchases, completedPurchase];
      setPurchases(updatedPurchases);
      await AsyncStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updatedPurchases));

      const activatedAt = new Date().toISOString();
      const expiresAt = powerUp.effect.duration
        ? new Date(Date.now() + powerUp.effect.duration * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const newActivePowerUp: ActivePowerUp = {
        powerUpId: powerUp.id,
        activatedAt,
        expiresAt,
      };

      const userActivePowerUps = activePowerUps[currentUser.id] || [];
      const updatedActivePowerUps = {
        ...activePowerUps,
        [currentUser.id]: [...userActivePowerUps, newActivePowerUp],
      };

      setActivePowerUps(updatedActivePowerUps);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_POWERUPS, JSON.stringify(updatedActivePowerUps));

      console.log('Power-up activated:', powerUp.name);
      return { success: true };
    } catch (error) {
      console.error('Purchase failed:', error);
      const failedPurchase: Purchase = {
        ...newPurchase,
        status: 'failed',
      };
      const updatedPurchases = [...purchases, failedPurchase];
      setPurchases(updatedPurchases);
      await AsyncStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updatedPurchases));

      return { success: false, error: 'Payment failed' };
    }
  }, [currentUser, purchases, activePowerUps]);

  const markFeatureAsViewed = useCallback(async (featureId: string) => {
    if (!currentUser) return;

    const unlockedFeatures = currentUser.unlockedFeatures || [];
    const updatedFeatures = unlockedFeatures.map(f =>
      f.featureId === featureId ? { ...f, viewed: true } : f
    );

    const updatedUser = {
      ...currentUser,
      unlockedFeatures: updatedFeatures,
    };

    await updateUser(updatedUser);
  }, [currentUser, updateUser]);

  return useMemo(() => ({
    purchases,
    activePowerUps,
    awardXP,
    awardGrit,
    processTaskCompletion,
    purchasePowerUp,
    markFeatureAsViewed,
  }), [
    purchases,
    activePowerUps,
    awardXP,
    awardGrit,
    processTaskCompletion,
    purchasePowerUp,
    markFeatureAsViewed,
  ]);
});
