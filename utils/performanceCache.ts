import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'hustlexp_cache_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export class PerformanceCache {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      if (now - entry.timestamp > CACHE_EXPIRY_MS) {
        await this.remove(key);
        return null;
      }

      console.log(`[Cache] Hit for key: ${key}`);
      return entry.data;
    } catch (error) {
      console.error('[Cache] Get error:', error);
      return null;
    }
  }

  static async set<T>(key: string, data: T): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
      console.log(`[Cache] Set for key: ${key}`);
    } catch (error) {
      console.error('[Cache] Set error:', error);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      console.log(`[Cache] Removed key: ${key}`);
    } catch (error) {
      console.error('[Cache] Remove error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`[Cache] Cleared ${cacheKeys.length} entries`);
    } catch (error) {
      console.error('[Cache] Clear error:', error);
    }
  }

  static async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    console.log(`[Cache] Miss for key: ${key}, fetching...`);
    const data = await fetchFn();
    await this.set(key, data);
    return data;
  }
}

export const preloadImages = async (imageUrls: string[]): Promise<void> => {
  console.log(`[Performance] Preloading ${imageUrls.length} images`);
  const promises = imageUrls.map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  });
  await Promise.all(promises);
  console.log('[Performance] Image preload complete');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
