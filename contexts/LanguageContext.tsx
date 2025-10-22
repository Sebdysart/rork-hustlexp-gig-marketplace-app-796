import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import { translations, LanguageCode } from '@/constants/translations';
import { getLocales } from 'expo-localization';

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

  const t = useCallback((key: string, options?: any) => {
    return i18n.t(key, options);
  }, [currentLanguage]);

  return useMemo(() => ({
    currentLanguage,
    changeLanguage,
    t,
    isLoading,
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
    ] as const,
  }), [currentLanguage, changeLanguage, t, isLoading]);
});
