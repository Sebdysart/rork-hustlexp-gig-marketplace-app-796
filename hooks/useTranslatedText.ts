import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslatedText(text: string): string {
  const { translateText, currentLanguage, useAITranslation, aiTranslationCache } = useLanguage() as any;
  const [translatedText, setTranslatedText] = useState<string>(text);
  const lastTextRef = useRef<string>(text);
  const lastLangRef = useRef<string>(currentLanguage);

  useEffect(() => {
    if (!useAITranslation || currentLanguage === 'en') {
      if (translatedText !== text) {
        setTranslatedText(text);
      }
      return;
    }

    const cacheKey = `${currentLanguage}:${text}`;
    const cached = (aiTranslationCache as Record<string, string>)[cacheKey];
    
    if (cached) {
      setTranslatedText(cached);
      lastTextRef.current = text;
      lastLangRef.current = currentLanguage;
    } else if (lastTextRef.current !== text || lastLangRef.current !== currentLanguage) {
      lastTextRef.current = text;
      lastLangRef.current = currentLanguage;
      let cancelled = false;
      translateText(text).then((result: string) => {
        if (!cancelled) {
          setTranslatedText(result);
        }
      });
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, currentLanguage, useAITranslation, aiTranslationCache]);

  return translatedText;
}

export function useTranslatedTexts(texts: string[]): string[] {
  const { currentLanguage, useAITranslation, aiTranslationCache } = useLanguage() as any;
  const [translatedTexts, setTranslatedTexts] = useState<string[]>(texts);
  const prevTextsRef = useRef<string>('');
  const prevLangRef = useRef<string>('');
  const prevCacheKeysRef = useRef<string>('');

  useEffect(() => {
    if (!useAITranslation || currentLanguage === 'en') {
      const textsKey = JSON.stringify(texts);
      if (prevTextsRef.current !== textsKey) {
        console.log('[useTranslatedTexts] Setting to original texts (AI disabled or EN)');
        prevTextsRef.current = textsKey;
        setTranslatedTexts(texts);
      }
      return;
    }

    const textsKey = JSON.stringify(texts);
    const relevantCacheKeys = texts.map(t => `${currentLanguage}:${t}`).sort().join('|');
    const cacheKeysInCache = relevantCacheKeys.split('|').filter(k => 
      (aiTranslationCache as Record<string, string>)[k]
    ).join('|');
    
    const hasChanged = prevTextsRef.current !== textsKey || 
                       prevLangRef.current !== currentLanguage ||
                       prevCacheKeysRef.current !== cacheKeysInCache;
    
    if (!hasChanged) {
      return;
    }
    
    console.log(`[useTranslatedTexts] Re-rendering for language: ${currentLanguage}`);
    console.log(`[useTranslatedTexts] Cache keys available: ${cacheKeysInCache.split('|').length}`);
    
    prevTextsRef.current = textsKey;
    prevLangRef.current = currentLanguage;
    prevCacheKeysRef.current = cacheKeysInCache;

    const translated = texts.map(text => {
      const key = `${currentLanguage}:${text}`;
      const translation = (aiTranslationCache as Record<string, string>)[key];
      if (translation) {
        console.log(`[useTranslatedTexts] ✅ "${text.substring(0, 30)}..." → "${translation.substring(0, 30)}..."`);
      }
      return translation || text;
    });

    setTranslatedTexts(translated);
  }, [texts, currentLanguage, useAITranslation, aiTranslationCache]);

  return translatedTexts;
}
