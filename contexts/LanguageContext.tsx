import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const t = useCallback((key: string, options?: any) => {
    if (useAITranslation && currentLanguage !== 'en') {
      const cacheKey = `${currentLanguage}:${key}`;
      if (aiTranslationCache[cacheKey]) {
        return aiTranslationCache[cacheKey];
      }
      
      const englishText = i18n.t(key, { ...options, locale: 'en' });
      
      aiTranslationService.translate(englishText, currentLanguage, 'en')
        .then(([translated]) => {
          setAITranslationCache(prev => ({
            ...prev,
            [cacheKey]: translated,
          }));
        })
        .catch((error) => {
          console.error('[Language] AI translation error:', error);
        });
      
      return englishText;
    }
    
    return i18n.t(key, { ...options, locale: currentLanguage });
  }, [currentLanguage, useAITranslation, aiTranslationCache]);

  const toggleAITranslation = useCallback((enabled: boolean) => {
    setUseAITranslation(enabled);
    if (enabled) {
      console.log('[Language] AI translation enabled');
    }
  }, []);

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
