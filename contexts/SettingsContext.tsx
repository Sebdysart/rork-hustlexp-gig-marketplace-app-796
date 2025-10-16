import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'hustlexp_settings';

export type AppSettings = {
  gamificationEnabled: boolean;
  dailyQuestLimit: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkModeEnabled: boolean;
  accessibilityMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  largeFontMode: boolean;
  keyboardNavigationEnabled: boolean;
  aiNudgesEnabled: boolean;
  burnoutWarningsEnabled: boolean;
  fontSize: number;
};

const DEFAULT_SETTINGS: AppSettings = {
  gamificationEnabled: true,
  dailyQuestLimit: 3,
  notificationsEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
  darkModeEnabled: false,
  accessibilityMode: false,
  reducedMotion: false,
  highContrast: false,
  colorBlindMode: 'none',
  largeFontMode: false,
  keyboardNavigationEnabled: false,
  aiNudgesEnabled: true,
  burnoutWarningsEnabled: true,
  fontSize: 14,
};

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dailyQuestsCompleted, setDailyQuestsCompleted] = useState<number>(0);
  const [lastResetDate, setLastResetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed.settings || DEFAULT_SETTINGS);
        setDailyQuestsCompleted(parsed.dailyQuestsCompleted || 0);
        setLastResetDate(parsed.lastResetDate || new Date().toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      const data = {
        settings: newSettings,
        dailyQuestsCompleted,
        lastResetDate,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
      setSettings(newSettings);
      console.log('Settings saved:', newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [dailyQuestsCompleted, lastResetDate]);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const incrementDailyQuests = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (today !== lastResetDate) {
      setDailyQuestsCompleted(1);
      setLastResetDate(today);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({
        settings,
        dailyQuestsCompleted: 1,
        lastResetDate: today,
      }));
    } else {
      const newCount = dailyQuestsCompleted + 1;
      setDailyQuestsCompleted(newCount);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({
        settings,
        dailyQuestsCompleted: newCount,
        lastResetDate,
      }));
    }
  }, [lastResetDate, dailyQuestsCompleted, settings]);

  const canAcceptMoreQuests = useCallback((): boolean => {
    if (!settings.gamificationEnabled) return true;
    
    const today = new Date().toISOString().split('T')[0];
    if (today !== lastResetDate) {
      return true;
    }
    
    return dailyQuestsCompleted < settings.dailyQuestLimit;
  }, [settings.gamificationEnabled, settings.dailyQuestLimit, lastResetDate, dailyQuestsCompleted]);

  const getRemainingQuests = useCallback((): number => {
    if (!settings.gamificationEnabled) return Infinity;
    
    const today = new Date().toISOString().split('T')[0];
    if (today !== lastResetDate) {
      return settings.dailyQuestLimit;
    }
    
    return Math.max(0, settings.dailyQuestLimit - dailyQuestsCompleted);
  }, [settings.gamificationEnabled, settings.dailyQuestLimit, lastResetDate, dailyQuestsCompleted]);

  const resetSettings = useCallback(async () => {
    await saveSettings(DEFAULT_SETTINGS);
    setDailyQuestsCompleted(0);
    setLastResetDate(new Date().toISOString().split('T')[0]);
  }, [saveSettings]);

  return useMemo(() => ({
    settings,
    isLoading,
    dailyQuestsCompleted,
    updateSetting,
    saveSettings,
    resetSettings,
    incrementDailyQuests,
    canAcceptMoreQuests,
    getRemainingQuests,
  }), [
    settings,
    isLoading,
    dailyQuestsCompleted,
    updateSetting,
    saveSettings,
    resetSettings,
    incrementDailyQuests,
    canAcceptMoreQuests,
    getRemainingQuests,
  ]);
});
