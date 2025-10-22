import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslatedText(text: string): string {
  const { translateText, currentLanguage, useAITranslation, aiTranslationCache } = useLanguage() as any;
  const [translatedText, setTranslatedText] = useState<string>(text);

  useEffect(() => {
    if (!useAITranslation || currentLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    const cacheKey = `${currentLanguage}:${text}`;
    const cached = (aiTranslationCache as Record<string, string>)[cacheKey];
    
    if (cached) {
      setTranslatedText(cached);
    } else {
      translateText(text).then((result: string) => {
        setTranslatedText(result);
      });
    }
  }, [text, translateText, currentLanguage, useAITranslation, aiTranslationCache]);

  return translatedText;
}

export function useTranslatedTexts(texts: string[]): string[] {
  const { currentLanguage, useAITranslation, aiTranslationCache } = useLanguage() as any;
  const [translatedTexts, setTranslatedTexts] = useState<string[]>(texts);

  useEffect(() => {
    if (!useAITranslation || currentLanguage === 'en') {
      setTranslatedTexts(texts);
      return;
    }

    const translated = texts.map(text => {
      const cacheKey = `${currentLanguage}:${text}`;
      return (aiTranslationCache as Record<string, string>)[cacheKey] || text;
    });

    setTranslatedTexts(translated);
  }, [texts, currentLanguage, useAITranslation, aiTranslationCache]);

  return translatedTexts;
}
