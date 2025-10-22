import { Platform } from 'react-native';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;
  private frameTimestamps: number[] = [];
  private lastFrameTime = 0;

  startFrameTracking(): () => void {
    if (Platform.OS === 'web') {
      return this.startWebFrameTracking();
    }
    return () => {};
  }

  private startWebFrameTracking(): () => void {
    let rafId: number;
    const trackFrame = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        this.frameTimestamps.push(delta);
        
        if (this.frameTimestamps.length > 60) {
          this.frameTimestamps.shift();
        }
      }
      
      this.lastFrameTime = timestamp;
      rafId = requestAnimationFrame(trackFrame);
    };

    rafId = requestAnimationFrame(trackFrame);
    
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }

  getCurrentFPS(): number {
    if (this.frameTimestamps.length === 0) return 60;
    
    const avgFrameTime = this.frameTimestamps.reduce((a, b) => a + b, 0) / this.frameTimestamps.length;
    return Math.round(1000 / avgFrameTime);
  }

  recordMetric(renderTime: number): void {
    const metric: PerformanceMetrics = {
      fps: this.getCurrentFPS(),
      memoryUsage: this.getMemoryUsage(),
      renderTime,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  private getMemoryUsage(): number {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }
    }
    return 0;
  }

  getAverageMetrics(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;

    const sum = this.metrics.reduce(
      (acc, m) => ({
        fps: acc.fps + m.fps,
        memoryUsage: acc.memoryUsage + m.memoryUsage,
        renderTime: acc.renderTime + m.renderTime,
        timestamp: m.timestamp,
      }),
      { fps: 0, memoryUsage: 0, renderTime: 0, timestamp: 0 }
    );

    return {
      fps: Math.round(sum.fps / this.metrics.length),
      memoryUsage: sum.memoryUsage / this.metrics.length,
      renderTime: sum.renderTime / this.metrics.length,
      timestamp: sum.timestamp,
    };
  }

  clearMetrics(): void {
    this.metrics = [];
    this.frameTimestamps = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function measureRenderTime<T>(
  componentName: string,
  fn: () => T
): T {
  const startTime = Date.now();
  const result = fn();
  const endTime = Date.now();
  const renderTime = endTime - startTime;

  if (renderTime > 16) {
    console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
  }

  performanceMonitor.recordMetric(renderTime);
  
  return result;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

export function batchUpdates<T>(
  updates: (() => T)[],
  batchSize: number = 10,
  delay: number = 0
): Promise<T[]> {
  return new Promise((resolve) => {
    const results: T[] = [];
    let currentBatch = 0;

    const processBatch = () => {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, updates.length);

      for (let i = start; i < end; i++) {
        results.push(updates[i]());
      }

      currentBatch++;

      if (currentBatch * batchSize < updates.length) {
        setTimeout(processBatch, delay);
      } else {
        resolve(results);
      }
    };

    processBatch();
  });
}

export function isLowEndDevice(): boolean {
  if (Platform.OS === 'web') {
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    return memory < 4 || cores < 4;
  }
  
  return false;
}

export function shouldReduceAnimations(): boolean {
  return isLowEndDevice();
}

export function getOptimalImageSize(
  screenWidth: number,
  devicePixelRatio: number = 1
): number {
  if (isLowEndDevice()) {
    return Math.min(screenWidth, 800);
  }
  
  return screenWidth * devicePixelRatio;
}

export default {
  performanceMonitor,
  measureRenderTime,
  debounce,
  throttle,
  memoize,
  batchUpdates,
  isLowEndDevice,
  shouldReduceAnimations,
  getOptimalImageSize,
};
