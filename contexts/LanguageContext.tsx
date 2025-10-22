import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import { translations, LanguageCode } from '@/constants/translations';
import { getLocales } from 'expo-localization';
import { aiTranslationService } from '@/utils/aiTranslation';

const STORAGE_KEY = 'hustlexp_language';

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lang = stored as LanguageCode;
        setCurrentLanguage(lang);
        i18n.locale = lang;
      } else {
        const deviceLang = getLocales()[0]?.languageCode || 'en';
        const supportedLang = Object.keys(translations).includes(deviceLang) 
          ? (deviceLang as LanguageCode) 
          : 'en';
        setCurrentLanguage(supportedLang);
        i18n.locale = supportedLang;
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (lang: LanguageCode) => {
    try {
      setCurrentLanguage(lang);
      i18n.locale = lang;
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  const [useAITranslation, setUseAITranslation] = useState(false);
  const [aiTranslationCache, setAITranslationCache] = useState<Record<string, string>>({});
  const batchQueueRef = useRef<Map<string, string>>(new Map());
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPreloadingRef = useRef(false);

  const processBatch = useCallback(async () => {
    if (batchQueueRef.current.size === 0 || isPreloadingRef.current) {
      return;
    }

    isPreloadingRef.current = true;
    const batchMap = new Map(batchQueueRef.current);
    batchQueueRef.current.clear();

    const textsToTranslate = Array.from(batchMap.values());
    const keys = Array.from(batchMap.keys());

    try {
      const translations = await aiTranslationService.translate(
        textsToTranslate,
        currentLanguage,
        'en'
      );

      const newCache: Record<string, string> = {};
      keys.forEach((key, index) => {
        newCache[key] = translations[index] || textsToTranslate[index];
      });

      setAITranslationCache(prev => ({ ...prev, ...newCache }));
    } catch (error: any) {
      console.error('[Language] Batch translation failed:', error);
      
      if (error?.message?.includes('429') || error?.message?.includes('Rate limit')) {
        const retryAfter = parseInt(error?.message?.match(/\d+/)?.[0] || '60');
        console.log(`[Language] Rate limited. Will retry in ${retryAfter}s`);
        
        batchQueueRef.current = new Map([...batchQueueRef.current, ...batchMap]);
        
        setTimeout(() => {
          isPreloadingRef.current = false;
          processBatch();
        }, retryAfter * 1000);
        return;
      }
    } finally {
      if (!batchQueueRef.current.size) {
        isPreloadingRef.current = false;
      }
    }
  }, [currentLanguage]);

  const scheduleBatch = useCallback(() => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    batchTimeoutRef.current = setTimeout(() => {
      processBatch();
    }, 500);
  }, [processBatch]);

  const t = useCallback((key: string, options?: any) => {
    if (useAITranslation && currentLanguage !== 'en') {
      const englishText = i18n.t(key, { ...options, locale: 'en' });
      const cacheKey = `${currentLanguage}:${englishText}`;
      
      if (aiTranslationCache[cacheKey]) {
        return aiTranslationCache[cacheKey];
      }
      
      if (!batchQueueRef.current.has(cacheKey)) {
        batchQueueRef.current.set(cacheKey, englishText);
        scheduleBatch();
      }
      
      return englishText;
    }
    
    return i18n.t(key, { ...options, locale: currentLanguage });
  }, [currentLanguage, useAITranslation, aiTranslationCache, scheduleBatch]);

  const toggleAITranslation = useCallback(async (enabled: boolean) => {
    setUseAITranslation(enabled);
    if (enabled && currentLanguage !== 'en') {
      console.log('[Language] AI translation enabled - preloading common phrases');
      
      const commonKeys = [
        'common.accept', 'common.decline', 'common.save', 'common.cancel',
        'common.loading', 'common.error', 'common.success',
        'tabs.home', 'tabs.tasks', 'tabs.quests', 'tabs.wallet', 'tabs.profile',
        'tasks.available', 'tasks.inProgress', 'tasks.completed',
        'profile.level', 'profile.xp', 'profile.earnings',
      ];
      
      const commonPhrases = commonKeys.map(k => i18n.t(k, { locale: 'en' }));
      
      try {
        await aiTranslationService.translate(commonPhrases, currentLanguage, 'en');
        const newCache: Record<string, string> = {};
        commonKeys.forEach((key, index) => {
          const englishText = i18n.t(key, { locale: 'en' });
          const cacheKey = `${currentLanguage}:${englishText}`;
          newCache[cacheKey] = commonPhrases[index];
        });
        setAITranslationCache(prev => ({ ...prev, ...newCache }));
      } catch (error) {
        console.error('[Language] Preload failed:', error);
      }
    }
  }, [currentLanguage]);

  return useMemo(() => ({
    currentLanguage,
    changeLanguage,
    t,
    isLoading,
    useAITranslation,
    toggleAITranslation,
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    ] as const,
  }), [currentLanguage, changeLanguage, t, isLoading, useAITranslation, toggleAITranslation]);
});
