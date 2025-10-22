import AsyncStorage from '@react-native-async-storage/async-storage';
import { hustleAI } from './hustleAI';

const TRANSLATION_CACHE_KEY = 'hustlexp_translation_cache';
const CACHE_VERSION = '1.0';
const CACHE_EXPIRY_DAYS = 7;

interface TranslationCache {
  version: string;
  timestamp: number;
  translations: Record<string, Record<string, string>>;
}

class AITranslationService {
  private cache: TranslationCache | null = null;
  private loadPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadCache();
    await this.loadPromise;
    this.loadPromise = null;
  }

  private async loadCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
      
      if (cached) {
        const parsed = JSON.parse(cached) as TranslationCache;
        const daysSinceCache = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
        
        if (parsed.version === CACHE_VERSION && daysSinceCache < CACHE_EXPIRY_DAYS) {
          this.cache = parsed;
          console.log('[AI Translation] Loaded cache with', Object.keys(parsed.translations).length, 'languages');
          return;
        }
      }
      
      this.cache = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        translations: {},
      };
    } catch (error) {
      console.error('[AI Translation] Failed to load cache:', error);
      this.cache = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        translations: {},
      };
    }
  }

  private async saveCache(): Promise<void> {
    if (!this.cache) return;

    try {
      await AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('[AI Translation] Failed to save cache:', error);
    }
  }

  async translate(
    text: string | string[],
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<string[]> {
    await this.initialize();

    if (!this.cache) {
      console.error('[AI Translation] Cache not initialized');
      return Array.isArray(text) ? text : [text];
    }

    if (targetLanguage === sourceLanguage) {
      return Array.isArray(text) ? text : [text];
    }

    const textsArray = Array.isArray(text) ? text : [text];
    const results: string[] = [];
    const toTranslate: { text: string; index: number }[] = [];

    if (!this.cache.translations[targetLanguage]) {
      this.cache.translations[targetLanguage] = {};
    }

    for (let i = 0; i < textsArray.length; i++) {
      const txt = textsArray[i];
      
      if (this.cache.translations[targetLanguage][txt]) {
        results[i] = this.cache.translations[targetLanguage][txt];
      } else {
        toTranslate.push({ text: txt, index: i });
        results[i] = txt;
      }
    }

    if (toTranslate.length > 0) {
      try {
        console.log(`[AI Translation] Translating ${toTranslate.length} texts to ${targetLanguage}`);
        
        const response = await hustleAI.translate({
          text: toTranslate.map(t => t.text),
          targetLanguage,
          sourceLanguage,
          context: 'HustleXP mobile app - gig economy platform',
        });

        for (let i = 0; i < toTranslate.length; i++) {
          const { text: originalText, index } = toTranslate[i];
          const translated = response.translations[i] || originalText;
          
          results[index] = translated;
          this.cache.translations[targetLanguage][originalText] = translated;
        }

        await this.saveCache();
      } catch (error) {
        console.error('[AI Translation] Translation failed:', error);
      }
    }

    return results;
  }

  async clearCache(): Promise<void> {
    this.cache = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      translations: {},
    };
    await this.saveCache();
  }

  async preloadLanguage(targetLanguage: string, commonPhrases: string[]): Promise<void> {
    await this.initialize();
    
    console.log(`[AI Translation] Preloading ${commonPhrases.length} phrases for ${targetLanguage}`);
    await this.translate(commonPhrases, targetLanguage);
  }
}

export const aiTranslationService = new AITranslationService();
