import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { aiFeedbackService, AIUserProfile } from '@/utils/aiFeedbackService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hustlexp_ai_profile_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface AIProfileCache {
  profile: AIUserProfile | null;
  lastFetched: string;
}

export const [AIProfileProvider, useAIProfile] = createContextHook(() => {
  const [aiProfile, setAIProfile] = useState<AIUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  const loadCachedProfile = useCallback(async (userId: string) => {
    try {
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (cached) {
        const data: AIProfileCache = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(data.lastFetched).getTime();
        
        if (cacheAge < CACHE_DURATION) {
          console.log('[AIProfile] Using cached profile');
          setAIProfile(data.profile);
          setLastFetched(data.lastFetched);
          return true;
        }
      }
    } catch (error) {
      console.error('[AIProfile] Error loading cached profile:', error);
    }
    return false;
  }, []);

  const saveCachedProfile = useCallback(async (userId: string, profile: AIUserProfile) => {
    try {
      const cache: AIProfileCache = {
        profile,
        lastFetched: new Date().toISOString(),
      };
      await AsyncStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(cache));
    } catch (error) {
      console.error('[AIProfile] Error saving cached profile:', error);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string, forceRefresh = false) => {
    if (isLoading) {
      console.log('[AIProfile] Already loading, skipping duplicate request');
      return;
    }

    if (lastUserId === userId && !forceRefresh) {
      const hadCache = await loadCachedProfile(userId);
      if (hadCache) {
        console.log('[AIProfile] Using cache for same user');
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setLastUserId(userId);
    console.log('[AIProfile] Fetching AI profile for user:', userId);

    try {
      const profile = await aiFeedbackService.fetchAIProfile(userId);
      
      if (profile) {
        setAIProfile(profile);
        setLastFetched(new Date().toISOString());
        await saveCachedProfile(userId, profile);
        console.log('[AIProfile] Profile fetched successfully');
        setError(null);
      } else {
        const errorMsg = 'No profile data returned from API';
        console.log('[AIProfile]', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch profile';
      console.error('[AIProfile] Error fetching profile:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastUserId, loadCachedProfile, saveCachedProfile]);

  const getTaskInsight = useCallback((taskCategory: string, taskPrice: number): string | null => {
    if (!aiProfile) return null;

    const preferredCategory = aiProfile.preferredCategories.find(
      c => c.category.toLowerCase() === taskCategory.toLowerCase()
    );

    if (preferredCategory) {
      return `You usually accept ${taskCategory} tasks`;
    }

    if (taskPrice >= aiProfile.priceRange.min && taskPrice <= aiProfile.priceRange.max) {
      return `Price matches your typical range ($${aiProfile.priceRange.min}-$${aiProfile.priceRange.max})`;
    }

    return aiProfile.aiInsights[0] || null;
  }, [aiProfile]);

  const shouldShowTask = useCallback((taskCategory: string, taskPrice: number): boolean => {
    if (!aiProfile || !aiProfile.recommendedFilters) return true;

    const { categories, priceMin, priceMax } = aiProfile.recommendedFilters;

    if (categories.length > 0 && !categories.includes(taskCategory)) {
      return false;
    }

    if (taskPrice < priceMin || taskPrice > priceMax) {
      return false;
    }

    return true;
  }, [aiProfile]);

  const getCategoryPreference = useCallback((category: string): number => {
    if (!aiProfile) return 0;

    const pref = aiProfile.preferredCategories.find(
      c => c.category.toLowerCase() === category.toLowerCase()
    );

    return pref ? pref.frequency : 0;
  }, [aiProfile]);

  const isActiveTime = useCallback((): boolean => {
    if (!aiProfile) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

    const hourPattern = aiProfile.acceptancePatterns.timeOfDay.find(
      p => p.hour === currentHour
    );

    const dayPattern = aiProfile.acceptancePatterns.dayOfWeek.find(
      p => p.day === currentDay
    );

    return (hourPattern?.frequency || 0) > 0 || (dayPattern?.frequency || 0) > 0;
  }, [aiProfile]);

  return useMemo(() => ({
    aiProfile,
    isLoading,
    lastFetched,
    error,
    fetchProfile,
    getTaskInsight,
    shouldShowTask,
    getCategoryPreference,
    isActiveTime,
  }), [
    aiProfile,
    isLoading,
    lastFetched,
    error,
    fetchProfile,
    getTaskInsight,
    shouldShowTask,
    getCategoryPreference,
    isActiveTime,
  ]);
});
