import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, getThemeById, AppTheme } from '@/constants/themes';

const STORAGE_KEY_MODE = 'hustlexp_theme_mode';
const STORAGE_KEY_THEME = 'hustlexp_selected_theme';

type ThemeMode = 'light' | 'dark' | 'auto';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(THEMES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const [storedMode, storedThemeId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_MODE),
        AsyncStorage.getItem(STORAGE_KEY_THEME),
      ]);
      
      if (storedMode) {
        setThemeMode(storedMode as ThemeMode);
      }
      
      if (storedThemeId) {
        const theme = getThemeById(storedThemeId);
        setSelectedTheme(theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMode = useCallback(async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }, []);

  const changeTheme = useCallback(async (themeId: string) => {
    const theme = getThemeById(themeId);
    setSelectedTheme(theme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, themeId);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const isDark = themeMode === 'auto' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  return useMemo(() => ({
    themeMode,
    setThemeMode: setMode,
    selectedTheme,
    changeTheme,
    colors: selectedTheme.colors,
    isDark,
    isLoading,
  }), [themeMode, setMode, selectedTheme, changeTheme, isDark, isLoading]);
});
