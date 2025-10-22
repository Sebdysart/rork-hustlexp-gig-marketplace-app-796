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
    
    if (cached && cached !== translatedText) {
      setTranslatedText(cached);
      lastTextRef.current = text;
      lastLangRef.current = currentLanguage;
    } else if (!cached && (lastTextRef.current !== text || lastLangRef.current !== currentLanguage)) {
      lastTextRef.current = text;
      lastLangRef.current = currentLanguage;
      let cancelled = false;
      translateText(text).then((result: string) => {
        if (!cancelled && result !== translatedText) {
          setTranslatedText(result);
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [text, currentLanguage, useAITranslation, aiTranslationCache, translatedText, translateText]);

  return translatedText;
}

export function useTranslatedTexts(texts: string[]): string[] {
  const { currentLanguage, useAITranslation, aiTranslationCache } = useLanguage() as any;
  const [translatedTexts, setTranslatedTexts] = useState<string[]>(texts);
  const textsKeyRef = useRef<string>('');

  useEffect(() => {
    const textsKey = texts.join('||');
    const cacheKey = `${currentLanguage}:${textsKey}`;
    
    if (textsKeyRef.current === cacheKey) {
      return;
    }
    
    if (!useAITranslation || currentLanguage === 'en') {
      if (JSON.stringify(translatedTexts) !== JSON.stringify(texts)) {
        setTranslatedTexts(texts);
        textsKeyRef.current = cacheKey;
      }
      return;
    }

    const translated = texts.map(text => {
      const key = `${currentLanguage}:${text}`;
      return (aiTranslationCache as Record<string, string>)[key] || text;
    });

    if (JSON.stringify(translated) !== JSON.stringify(translatedTexts)) {
      setTranslatedTexts(translated);
      textsKeyRef.current = cacheKey;
    }
  }, [texts, currentLanguage, useAITranslation, aiTranslationCache, translatedTexts]);

  return translatedTexts;
}
