import { Platform } from 'react-native';
import { triggerHaptic as baseHaptic, HapticType } from '@/utils/haptics';

export type SensoryPattern = 
  | 'success'
  | 'error'
  | 'warning'
  | 'tap'
  | 'swipe'
  | 'longPress'
  | 'levelUp'
  | 'achievement'
  | 'coin'
  | 'notification';

export interface SensoryConfig {
  haptic?: boolean;
  audio?: boolean;
  visual?: boolean;
}

const hapticPatterns: Record<SensoryPattern, HapticType[]> = {
  success: ['medium', 'light'],
  error: ['heavy', 'medium'],
  warning: ['medium'],
  tap: ['light'],
  swipe: ['light'],
  longPress: ['medium', 'light'],
  levelUp: ['heavy', 'medium', 'light'],
  achievement: ['heavy', 'light', 'light'],
  coin: ['light'],
  notification: ['light', 'light'],
};

const defaultConfig: SensoryConfig = {
  haptic: true,
  audio: false,
  visual: true,
};

export async function triggerSensoryFeedback(
  pattern: SensoryPattern,
  config: SensoryConfig = defaultConfig
): Promise<void> {
  const finalConfig = { ...defaultConfig, ...config };

  if (finalConfig.haptic && Platform.OS !== 'web') {
    const haptics = hapticPatterns[pattern];
    
    for (let i = 0; i < haptics.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i * 50));
      baseHaptic(haptics[i]);
    }
  }
}

export function triggerSuccess(config?: SensoryConfig): void {
  triggerSensoryFeedback('success', config);
}

export function triggerError(config?: SensoryConfig): void {
  triggerSensoryFeedback('error', config);
}

export function triggerWarning(config?: SensoryConfig): void {
  triggerSensoryFeedback('warning', config);
}

export function triggerTap(config?: SensoryConfig): void {
  triggerSensoryFeedback('tap', config);
}

export function triggerSwipe(config?: SensoryConfig): void {
  triggerSensoryFeedback('swipe', config);
}

export function triggerLongPress(config?: SensoryConfig): void {
  triggerSensoryFeedback('longPress', config);
}

export function triggerLevelUp(config?: SensoryConfig): void {
  triggerSensoryFeedback('levelUp', config);
}

export function triggerAchievement(config?: SensoryConfig): void {
  triggerSensoryFeedback('achievement', config);
}

export function triggerCoin(config?: SensoryConfig): void {
  triggerSensoryFeedback('coin', config);
}

export function triggerNotification(config?: SensoryConfig): void {
  triggerSensoryFeedback('notification', config);
}

export function createCustomPattern(
  hapticSequence: HapticType[],
  delayMs: number = 50
): (config?: SensoryConfig) => Promise<void> {
  return async (config: SensoryConfig = defaultConfig) => {
    const finalConfig = { ...defaultConfig, ...config };

    if (finalConfig.haptic && Platform.OS !== 'web') {
      for (let i = 0; i < hapticSequence.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i * delayMs));
        baseHaptic(hapticSequence[i]);
      }
    }
  };
}

export const sensoryPresets = {
  buttonPress: (config?: SensoryConfig) => triggerTap(config),
  cardSwipe: (config?: SensoryConfig) => triggerSwipe(config),
  menuOpen: (config?: SensoryConfig) => triggerLongPress(config),
  taskComplete: (config?: SensoryConfig) => triggerSuccess(config),
  taskFailed: (config?: SensoryConfig) => triggerError(config),
  badgeUnlock: (config?: SensoryConfig) => triggerAchievement(config),
  xpGain: (config?: SensoryConfig) => triggerCoin(config),
  rankUp: (config?: SensoryConfig) => triggerLevelUp(config),
  alert: (config?: SensoryConfig) => triggerNotification(config),
} as const;

export default {
  triggerSensoryFeedback,
  triggerSuccess,
  triggerError,
  triggerWarning,
  triggerTap,
  triggerSwipe,
  triggerLongPress,
  triggerLevelUp,
  triggerAchievement,
  triggerCoin,
  triggerNotification,
  createCustomPattern,
  sensoryPresets,
};
