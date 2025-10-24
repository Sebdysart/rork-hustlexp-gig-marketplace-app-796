import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import { translations, LanguageCode as LanguageCodeType } from '@/constants/translations';

export type LanguageCode = LanguageCodeType;
import { getLocales } from 'expo-localization';
import { aiTranslationService } from '@/utils/aiTranslation';
import { generateAllAppTexts } from '@/utils/translationExtractor';

const STORAGE_KEY = 'hustlexp_language';
const AI_TRANSLATION_KEY = 'hustlexp_ai_translation_enabled';

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCodeType>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [useAITranslation, setUseAITranslation] = useState(true);
  const [aiTranslationCache, setAITranslationCache] = useState<Record<string, string>>({});
  const [translationError, setTranslationError] = useState<string | null>(null);
  const batchQueueRef = useRef<Map<string, string>>(new Map());
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
        // CRITICAL: Never cache empty strings, spaces, or dots
        const translatedValue = translations[index] || textsToTranslate[index] || '';
        const trimmed = translatedValue.trim();
        if (trimmed && !/^[\.\s,;:!?]*$/.test(trimmed)) {
          newCache[key] = translatedValue;
        } else {
          newCache[key] = textsToTranslate[index] || ' ';
        }
      });

      setAITranslationCache(prev => {
        const updated = { ...prev };
        Object.keys(newCache).forEach(key => {
          updated[key] = newCache[key];
        });
        return updated;
      });
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

  const t = useCallback((key: string, options?: any): string => {
    // Helper to validate and sanitize translation results
    const validateTranslation = (text: any, fallback: string): string => {
      if (!text || typeof text !== 'string') {
        return fallback;
      }
      const trimmed = text.trim();
      // Block ONLY whitespace and punctuation-only strings
      if (!trimmed || /^[\.\s,;:!?…]+$/.test(trimmed)) {
        console.warn('[Language.t] Blocked problematic translation:', JSON.stringify(text), 'for key:', key);
        return fallback;
      }
      return text;
    };

    if (useAITranslation && currentLanguage !== 'en') {
      const englishText = i18n.t(key, { ...options, locale: 'en' });
      const safeEnglish = validateTranslation(englishText, key);
      const cacheKey = `${currentLanguage}:${safeEnglish}`;
      
      if (aiTranslationCache[cacheKey]) {
        return validateTranslation(aiTranslationCache[cacheKey], safeEnglish);
      }
      
      if (!batchQueueRef.current.has(cacheKey)) {
        batchQueueRef.current.set(cacheKey, safeEnglish);
        scheduleBatch();
      }
      
      return safeEnglish;
    }
    
    const result = i18n.t(key, { ...options, locale: currentLanguage });
    return validateTranslation(result, key);
  }, [currentLanguage, useAITranslation, aiTranslationCache, scheduleBatch]);

  const preloadAllAppTranslations = useCallback(async (lang: LanguageCodeType) => {
    if (lang === 'en') {
      console.log('[Language] English selected, no translation needed');
      setTranslationProgress(100);
      return;
    }
    
    try {
      console.log('[Language] 🌐 Generating all app texts for full translation...');
      const allTexts = generateAllAppTexts();
      const totalTexts = allTexts.length;
      console.log(`[Language] 📝 Found ${totalTexts} texts to translate`);
      
      const BATCH_SIZE = 30;
      const batches: string[][] = [];
      
      for (let i = 0; i < allTexts.length; i += BATCH_SIZE) {
        batches.push(allTexts.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`[Language] 📦 Processing ${batches.length} batches with rate limit handling...`);
      
      let successfulBatches = 0;
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const progressPercent = Math.floor((i / batches.length) * 100);
        setTranslationProgress(progressPercent);
        
        try {
          console.log(`[Language] ⏳ Translating batch ${i + 1}/${batches.length} (${batch.length} texts) - ${progressPercent}%`);
          const translated = await aiTranslationService.translate(batch, lang, 'en');
          
          const newCache: Record<string, string> = {};
          batch.forEach((text, idx) => {
            const cacheKey = `${lang}:${text}`;
            // CRITICAL: Never cache empty strings, spaces, or dots
            const translatedValue = translated[idx] || text || '';
            const trimmed = translatedValue.trim();
            if (trimmed && !/^[\.\s,;:!?]*$/.test(trimmed)) {
              newCache[cacheKey] = translatedValue;
            } else {
              newCache[cacheKey] = text || ' ';
            }
          });
          
          setAITranslationCache(prev => ({ ...prev, ...newCache }));
          successfulBatches++;
          
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error: any) {
          console.error(`[Language] ❌ Batch ${i + 1} failed:`, error?.message || error);
          
          if (error?.message?.includes('429') || error?.message?.includes('Rate limit')) {
            const retryAfterMatch = error?.message?.match(/(\d+)\s*second/i);
            const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 60;
            console.log(`[Language] ⏸️ Rate limited. Waiting ${retryAfter}s before continuing...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            i--;
          } else {
            console.warn(`[Language] ⚠️ Skipping failed batch and continuing...`);
          }
        }
      }
      
      setTranslationProgress(100);
      console.log(`[Language] ✅ Translation complete! ${successfulBatches}/${batches.length} batches successful (${totalTexts} texts) → ${lang}`);
    } catch (error) {
      console.error('[Language] Preload failed:', error);
      setTranslationProgress(0);
    }
  }, []);

  const toggleAITranslation = useCallback(async (enabled: boolean) => {
    try {
      setUseAITranslation(enabled);
      await AsyncStorage.setItem(AI_TRANSLATION_KEY, enabled ? 'true' : 'false');
      
      if (enabled && currentLanguage !== 'en') {
        console.log('[Language] AI translation enabled - preloading entire app...');
        setIsLoading(true);
        await preloadAllAppTranslations(currentLanguage);
        setIsLoading(false);
      } else if (enabled) {
        console.log('[Language] AI translation enabled for future language changes');
      } else {
        console.log('[Language] AI translation disabled');
        setAITranslationCache({});
      }
    } catch (error) {
      console.error('[Language] Toggle AI translation failed:', error);
    }
  }, [currentLanguage, preloadAllAppTranslations]);

  const loadLanguageAndAIPreference = useCallback(async () => {
    try {
      const [storedLang, aiEnabled] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(AI_TRANSLATION_KEY),
      ]);
      
      const lang = storedLang ? (storedLang as LanguageCode) : (
        Object.keys(translations).includes(getLocales()[0]?.languageCode || 'en')
          ? (getLocales()[0]?.languageCode as LanguageCode)
          : 'en'
      );
      
      setCurrentLanguage(lang);
      i18n.locale = lang;
      
      const shouldEnableAI = aiEnabled !== 'false';
      setUseAITranslation(shouldEnableAI);
      
      if (shouldEnableAI && lang !== 'en') {
        console.log('[Language] AI translation enabled on startup, preloading...');
        await preloadAllAppTranslations(lang);
      }
    } catch (error) {
      console.error('[Language] Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  }, [preloadAllAppTranslations]);

  useEffect(() => {
    loadLanguageAndAIPreference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeLanguage = useCallback(async (lang: LanguageCodeType) => {
    try {
      setIsLoading(true);
      setTranslationProgress(0);
      setTranslationError(null);
      console.log('[Language] Changing language to:', lang);
      
      setCurrentLanguage(lang);
      i18n.locale = lang;
      await AsyncStorage.setItem(STORAGE_KEY, lang);
      
      setAITranslationCache({});
      batchQueueRef.current.clear();
      
      if (useAITranslation && lang !== 'en') {
        console.log('[Language] Preloading all translations for:', lang);
        await preloadAllAppTranslations(lang);
        setIsLoading(false);
      } else {
        console.log('[Language] Switched to', lang, '(no AI translation needed)');
        setIsLoading(false);
        setTranslationProgress(100);
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error('[Language] Error changing language:', errorMessage);
      setTranslationError(errorMessage);
      setIsLoading(false);
      setTranslationProgress(0);
    }
  }, [useAITranslation, preloadAllAppTranslations]);

  const translateText = useCallback(async (text: string, targetLang?: LanguageCodeType) => {
    const lang = targetLang || currentLanguage;
    
    if (!useAITranslation || lang === 'en') {
      return text;
    }
    
    const cacheKey = `${lang}:${text}`;
    
    if (aiTranslationCache[cacheKey]) {
      return aiTranslationCache[cacheKey];
    }
    
    try {
      const result = await aiTranslationService.translate([text], lang, 'en');
      const translated = result[0] || text || '';
      
      // CRITICAL: Never cache empty strings, spaces, or dots
      const trimmed = translated.trim();
      if (trimmed && !/^[\.\s,;:!?]*$/.test(trimmed)) {
        setAITranslationCache(prev => ({ ...prev, [cacheKey]: translated }));
        return translated;
      } else {
        return text || ' ';
      }
    } catch (error) {
      console.error('[Language] Translation failed:', error);
      return text || '';
    }
  }, [currentLanguage, useAITranslation, aiTranslationCache]);

  return useMemo(() => ({
    currentLanguage,
    changeLanguage,
    t,
    translateText,
    isLoading,
    translationProgress,
    translationError,
    useAITranslation,
    toggleAITranslation,
    aiTranslationCache,
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
  }), [currentLanguage, changeLanguage, t, translateText, isLoading, translationProgress, translationError, useAITranslation, toggleAITranslation, aiTranslationCache]);
});
