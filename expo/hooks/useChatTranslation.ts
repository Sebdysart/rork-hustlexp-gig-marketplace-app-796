import { useState, useCallback } from 'react';
import { useLanguage, LanguageCode } from '@/contexts/LanguageContext';

export interface TranslatedMessage {
  originalText: string;
  translatedText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  isTranslated: boolean;
}

export function useChatTranslation() {
  const { currentLanguage, translateText, useAITranslation } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateMessage = useCallback(
    async (
      message: string,
      senderLanguage: LanguageCode,
      recipientLanguage: LanguageCode
    ): Promise<TranslatedMessage> => {
      if (!useAITranslation || senderLanguage === recipientLanguage) {
        return {
          originalText: message,
          translatedText: message,
          sourceLanguage: senderLanguage,
          targetLanguage: recipientLanguage,
          isTranslated: false,
        };
      }

      try {
        setIsTranslating(true);
        const translated = await translateText(message, recipientLanguage);

        return {
          originalText: message,
          translatedText: translated,
          sourceLanguage: senderLanguage,
          targetLanguage: recipientLanguage,
          isTranslated: true,
        };
      } catch (error) {
        console.error('[ChatTranslation] Failed to translate message:', error);
        return {
          originalText: message,
          translatedText: message,
          sourceLanguage: senderLanguage,
          targetLanguage: recipientLanguage,
          isTranslated: false,
        };
      } finally {
        setIsTranslating(false);
      }
    },
    [translateText, useAITranslation]
  );

  const translateToMyLanguage = useCallback(
    async (message: string, senderLanguage: LanguageCode): Promise<TranslatedMessage> => {
      return translateMessage(message, senderLanguage, currentLanguage);
    },
    [translateMessage, currentLanguage]
  );

  return {
    translateMessage,
    translateToMyLanguage,
    isTranslating,
    currentLanguage,
    aiTranslationEnabled: useAITranslation,
  };
}
