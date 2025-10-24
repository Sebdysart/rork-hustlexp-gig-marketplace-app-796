import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslatedText(text: string): string {
  const { translateText, currentLanguage, useAITranslation, aiTranslationCache } = useLanguage() as any;
  const [translatedText, setTranslatedText] = useState<string>(text || '');
  const lastTextRef = useRef<string>(text || '');
  const lastLangRef = useRef<string>(currentLanguage);

  useEffect(() => {
    if (!useAITranslation || currentLanguage === 'en') {
      if (translatedText !== text) {
        setTranslatedText(text || '');
      }
      return;
    }

    const cacheKey = `${currentLanguage}:${text}`;
    const cached = (aiTranslationCache as Record<string, string>)[cacheKey];
    
    if (cached) {
      setTranslatedText(cached || text || '');
      lastTextRef.current = text;
      lastLangRef.current = currentLanguage;
    } else if (lastTextRef.current !== text || lastLangRef.current !== currentLanguage) {
      lastTextRef.current = text;
      lastLangRef.current = currentLanguage;
      let cancelled = false;
      translateText(text).then((result: string) => {
        if (!cancelled) {
          const finalResult = result || text || '';
          if (finalResult.trim() === '.' || finalResult.trim() === '') {
            setTranslatedText(text);
          } else {
            setTranslatedText(finalResult);
          }
        }
      });
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, currentLanguage, useAITranslation, aiTranslationCache]);

  // CRITICAL: Always return a valid string, never undefined or special characters
  const result = translatedText || text || 'Loading';
  const trimmed = result.trim();
  // Prevent rendering problematic values that cause 'Unexpected text node' errors
  if (trimmed === '.' || trimmed === '' || !trimmed) {
    return text || 'Loading'; // Return fallback text (safe in Text components)
  }
  return result;
}

export function useTranslatedTexts(texts: string[]): string[] {
  const { currentLanguage, useAITranslation, aiTranslationCache } = useLanguage() as any;
  const [translatedTexts, setTranslatedTexts] = useState<string[]>(texts);
  const prevTextsRef = useRef<string>('');
  const prevLangRef = useRef<string>('');
  const cacheRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!useAITranslation || currentLanguage === 'en') {
      const textsKey = JSON.stringify(texts);
      if (prevTextsRef.current !== textsKey || prevLangRef.current !== currentLanguage) {
        console.log('[useTranslatedTexts] Setting to original texts (AI disabled or EN)');
        prevTextsRef.current = textsKey;
        prevLangRef.current = currentLanguage;
        setTranslatedTexts(texts);
      }
      return;
    }

    const textsKey = JSON.stringify(texts);
    const cache = aiTranslationCache as Record<string, string>;
    
    const cacheChanged = JSON.stringify(cacheRef.current) !== JSON.stringify(cache);
    const languageChanged = prevLangRef.current !== currentLanguage;
    const textsChanged = prevTextsRef.current !== textsKey;
    
    if (!cacheChanged && !languageChanged && !textsChanged) {
      return;
    }
    
    console.log(`[useTranslatedTexts] Update triggered - lang: ${languageChanged}, texts: ${textsChanged}, cache: ${cacheChanged}`);
    
    cacheRef.current = { ...cache };
    prevTextsRef.current = textsKey;
    prevLangRef.current = currentLanguage;

    const translated = texts.map(text => {
      const key = `${currentLanguage}:${text}`;
      const translation = cache[key];
      if (translation && translation !== text) {
        console.log(`[useTranslatedTexts] ✅ "${text.substring(0, 30)}..." → "${translation.substring(0, 30)}..."`);
      }
      // CRITICAL: Always return a valid string, never undefined or special characters
      const result = translation || text || 'Loading';
      const trimmed = result.trim();
      // Prevent rendering problematic values that cause 'Unexpected text node' errors
      if (trimmed === '.' || trimmed === '' || !trimmed) {
        return text || 'Loading'; // Return fallback text (safe in Text components)
      }
      return result;
    });

    setTranslatedTexts(translated);
  }, [texts, currentLanguage, useAITranslation, aiTranslationCache]);

  return translatedTexts;
}
