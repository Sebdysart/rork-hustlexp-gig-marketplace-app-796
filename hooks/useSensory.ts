import { useSettings } from '@/contexts/SettingsContext';
import { 
  triggerSensoryFeedback, 
  SensoryPattern,
  SensoryConfig,
  sensoryPresets 
} from '@/utils/tierS/sensoryFeedback';
import { SoundType } from '@/utils/soundSystem';

export function useSensory() {
  const { settings } = useSettings();

  const trigger = (pattern: SensoryPattern, customConfig?: Partial<SensoryConfig>) => {
    const config: SensoryConfig = {
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion,
      ...customConfig,
    };

    triggerSensoryFeedback(pattern, config);
  };

  const triggerWithSound = (pattern: SensoryPattern, soundType: SoundType) => {
    trigger(pattern, { soundType });
  };

  return {
    trigger,
    triggerWithSound,
    
    success: () => trigger('success'),
    error: () => trigger('error'),
    warning: () => trigger('warning'),
    tap: () => trigger('tap'),
    swipe: () => trigger('swipe'),
    longPress: () => trigger('longPress'),
    levelUp: () => trigger('levelUp'),
    achievement: () => trigger('achievement'),
    coin: () => trigger('coin'),
    notification: () => trigger('notification'),
    
    buttonPress: () => sensoryPresets.buttonPress({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
    cardSwipe: () => sensoryPresets.cardSwipe({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
    menuOpen: () => sensoryPresets.menuOpen({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
    taskComplete: () => sensoryPresets.taskComplete({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
    taskFailed: () => sensoryPresets.taskFailed({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
    badgeUnlock: () => sensoryPresets.badgeUnlock({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
    xpGain: () => sensoryPresets.xpGain({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
    rankUp: () => sensoryPresets.rankUp({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
    alert: () => sensoryPresets.alert({ 
      haptic: settings.hapticsEnabled,
      audio: settings.soundEnabled,
      visual: !settings.reducedMotion 
    }),
  };
}
