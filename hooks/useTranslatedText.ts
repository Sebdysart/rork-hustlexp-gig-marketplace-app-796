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

  useEffect(() => {
    if (!useAITranslation || currentLanguage === 'en') {
      if (JSON.stringify(translatedTexts) !== JSON.stringify(texts)) {
        setTranslatedTexts(texts);
      }
      return;
    }

    const textsKey = JSON.stringify(texts);
    const hasChanged = prevTextsRef.current !== textsKey || prevLangRef.current !== currentLanguage;
    
    if (!hasChanged) {
      return;
    }
    
    prevTextsRef.current = textsKey;
    prevLangRef.current = currentLanguage;

    const translated = texts.map(text => {
      const key = `${currentLanguage}:${text}`;
      return (aiTranslationCache as Record<string, string>)[key] || text;
    });

    if (JSON.stringify(translatedTexts) !== JSON.stringify(translated)) {
      setTranslatedTexts(translated);
    }
  }, [texts, currentLanguage, useAITranslation, aiTranslationCache, translatedTexts]);

  return translatedTexts;
}
