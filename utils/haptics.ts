import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticType = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const triggerHaptic = async (type: HapticType = 'light'): Promise<void> => {
  if (Platform.OS === 'web') {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'selection':
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(30);
          break;
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'warning':
          navigator.vibrate([20, 50, 20]);
          break;
        case 'error':
          navigator.vibrate([30, 50, 30, 50, 30]);
          break;
      }
    }
    return;
  }

  try {
    switch (type) {
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    console.log('Haptic feedback not available:', error);
  }
};
