import { useEffect, useRef, useCallback, DependencyList, useState } from 'react';

export function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

export function useSafeState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const isMounted = useIsMounted();

  const safeSetState = useCallback((value: T | ((prev: T) => T)) => {
    if (isMounted()) {
      setState(value);
    }
  }, [isMounted]);

  return [state, safeSetState];
}

export function useSafeAsync<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useIsMounted();

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      try {
        if (isMounted()) {
          setLoading(true);
          setError(null);
        }

        const result = await asyncFn();

        if (!cancelled && isMounted()) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled && isMounted()) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, error, loading };
}

export function useCancellablePromise<T>() {
  const promises = useRef<{ promise: Promise<T>; cancel: () => void }[]>([]);
  const isMounted = useIsMounted();

  useEffect(() => {
    const currentPromises = promises.current;
    return () => {
      currentPromises.forEach(p => p.cancel());
    };
  }, []);

  const cancellablePromise = useCallback(<R>(promise: Promise<R>): Promise<R> => {
    let cancelled = false;

    const wrappedPromise = new Promise<R>((resolve, reject) => {
      promise
        .then(value => {
          if (!cancelled && isMounted()) {
            resolve(value);
          }
        })
        .catch(error => {
          if (!cancelled && isMounted()) {
            reject(error);
          }
        });
    });

    const cancel = () => {
      cancelled = true;
    };

    promises.current.push({ promise: wrappedPromise as any, cancel });

    return wrappedPromise;
  }, [isMounted]);

  return { cancellablePromise };
}

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current();
    };

    timeoutRef.current = setTimeout(tick, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { clear };
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current();
    };

    intervalRef.current = setInterval(tick, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay]);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  return { clear };
}

export function useCleanup(cleanupFn: () => void, deps: DependencyList) {
  const cleanupRef = useRef(cleanupFn);
  
  useEffect(() => {
    cleanupRef.current = cleanupFn;
  }, [cleanupFn]);

  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, deps);
}

export class ResourceManager {
  private resources: Map<string, () => void> = new Map();

  register(id: string, cleanup: () => void) {
    if (this.resources.has(id)) {
      console.warn(`[ResourceManager] Resource ${id} already registered, replacing...`);
      this.cleanup(id);
    }

    this.resources.set(id, cleanup);
    console.log(`[ResourceManager] Registered resource: ${id}`);
  }

  cleanup(id: string) {
    const cleanup = this.resources.get(id);
    if (cleanup) {
      try {
        cleanup();
        this.resources.delete(id);
        console.log(`[ResourceManager] Cleaned up resource: ${id}`);
      } catch (error) {
        console.error(`[ResourceManager] Error cleaning up resource ${id}:`, error);
      }
    }
  }

  cleanupAll() {
    console.log(`[ResourceManager] Cleaning up ${this.resources.size} resources...`);
    
    this.resources.forEach((cleanup, id) => {
      try {
        cleanup();
        console.log(`[ResourceManager] Cleaned up: ${id}`);
      } catch (error) {
        console.error(`[ResourceManager] Error cleaning up ${id}:`, error);
      }
    });

    this.resources.clear();
    console.log('[ResourceManager] All resources cleaned up');
  }

  getResourceCount(): number {
    return this.resources.size;
  }

  getResourceIds(): string[] {
    return Array.from(this.resources.keys());
  }
}

export const globalResourceManager = new ResourceManager();

export function useResourceManager() {
  const manager = useRef(new ResourceManager());

  useEffect(() => {
    const currentManager = manager.current;
    return () => {
      currentManager.cleanupAll();
    };
  }, []);

  return manager.current;
}

export function useAbortController() {
  const controllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    const controller = controllerRef.current;
    return () => {
      controller.abort();
    };
  }, []);

  const getSignal = useCallback(() => {
    return controllerRef.current?.signal;
  }, []);

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = new AbortController();
    }
  }, []);

  return { getSignal, abort };
}

export function detectMemoryLeaks() {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    console.log('[MemoryLeakDetector] performance.memory not available');
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      usagePercent: 0,
    };
  }

  const memory = (performance as any).memory;
  const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

  const stats = {
    usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576),
    totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576),
    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576),
    usagePercent: Math.round(usagePercent),
  };

  if (usagePercent > 90) {
    console.warn('[MemoryLeakDetector] High memory usage detected:', stats);
  } else if (usagePercent > 75) {
    console.warn('[MemoryLeakDetector] Elevated memory usage:', stats);
  }

  return stats;
}

export function useMemoryMonitor(intervalMs = 30000) {
  useInterval(() => {
    const stats = detectMemoryLeaks();
    console.log('[MemoryMonitor] Current memory:', stats);
  }, intervalMs);
}

export function createWeakCache<K extends object, V>() {
  const cache = new WeakMap<K, V>();

  return {
    get(key: K): V | undefined {
      return cache.get(key);
    },
    set(key: K, value: V): void {
      cache.set(key, value);
    },
    has(key: K): boolean {
      return cache.has(key);
    },
    delete(key: K): boolean {
      return cache.delete(key);
    },
  };
}

export function debounceCleanup<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): [(...args: Parameters<T>) => void, () => void] {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };

  const cleanup = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return [debouncedFn, cleanup];
}

export function throttleCleanup<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): [(...args: Parameters<T>) => void, () => void] {
  let inThrottle = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttledFn = (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      timeoutId = setTimeout(() => {
        inThrottle = false;
        timeoutId = null;
      }, limit);
    }
  };

  const cleanup = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    inThrottle = false;
  };

  return [throttledFn, cleanup];
}
