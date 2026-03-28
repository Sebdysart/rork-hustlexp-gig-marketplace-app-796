import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorTracker } from './errorTracking';

export type RetryStrategy = 'exponential' | 'linear' | 'fixed';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  strategy: RetryStrategy;
  backoffMultiplier: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, delay: number) => void;
}

export interface APIError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  strategy: 'exponential',
  backoffMultiplier: 2,
};

const STORAGE_KEY = 'hustlexp_failed_requests';

export interface FailedRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: string;
  attempts: number;
  lastError?: string;
}

class APIErrorRecovery {
  private failedRequests: FailedRequest[] = [];
  private retryInProgress = false;

  constructor() {
    this.loadFailedRequests();
  }

  private async loadFailedRequests() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.failedRequests = JSON.parse(stored);
        console.log(`[APIErrorRecovery] Loaded ${this.failedRequests.length} failed requests`);
      }
    } catch (error) {
      console.error('[APIErrorRecovery] Error loading failed requests:', error);
    }
  }

  private async saveFailedRequests() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.failedRequests));
    } catch (error) {
      console.error('[APIErrorRecovery] Error saving failed requests:', error);
    }
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    switch (config.strategy) {
      case 'exponential':
        delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
        break;
      case 'linear':
        delay = config.initialDelay * attempt;
        break;
      case 'fixed':
      default:
        delay = config.initialDelay;
        break;
    }

    const jitter = Math.random() * 0.3 * delay;
    delay = delay + jitter;

    return Math.min(delay, config.maxDelay);
  }

  private isRetryableError(error: any): boolean {
    if (error?.retryable === false) return false;

    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    if (error?.status && retryableStatuses.includes(error.status)) {
      return true;
    }

    const retryableCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'];
    if (error?.code && retryableCodes.includes(error.code)) {
      return true;
    }

    if (error?.message?.includes('Network request failed')) return true;
    if (error?.message?.includes('timeout')) return true;

    return false;
  }

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: any;
    let attempt = 0;

    while (attempt <= finalConfig.maxRetries) {
      try {
        const result = await fn();
        
        if (attempt > 0) {
          console.log(`[APIErrorRecovery] Request succeeded on attempt ${attempt + 1}`);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        attempt++;

        const shouldRetry = finalConfig.shouldRetry 
          ? finalConfig.shouldRetry(error)
          : this.isRetryableError(error);

        if (!shouldRetry || attempt > finalConfig.maxRetries) {
          errorTracker.logError(error, {
            route: 'API Request',
            componentStack: `Attempt ${attempt}/${finalConfig.maxRetries}`,
          });
          throw error;
        }

        const delay = this.calculateDelay(attempt, finalConfig);
        
        console.log(
          `[APIErrorRecovery] Attempt ${attempt} failed. Retrying in ${delay}ms...`,
          error.message
        );

        if (finalConfig.onRetry) {
          finalConfig.onRetry(attempt, delay);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  async saveFailedRequest(
    url: string,
    method: string,
    body?: any,
    headers?: Record<string, string>,
    error?: any
  ): Promise<string> {
    const failedRequest: FailedRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      body,
      headers,
      timestamp: new Date().toISOString(),
      attempts: 0,
      lastError: error?.message,
    };

    this.failedRequests.push(failedRequest);
    await this.saveFailedRequests();

    console.log(`[APIErrorRecovery] Saved failed request: ${method} ${url}`);
    return failedRequest.id;
  }

  async retryFailedRequests(onProgress?: (current: number, total: number) => void): Promise<{
    succeeded: number;
    failed: number;
    total: number;
  }> {
    if (this.retryInProgress) {
      console.log('[APIErrorRecovery] Retry already in progress');
      return { succeeded: 0, failed: 0, total: 0 };
    }

    this.retryInProgress = true;
    const total = this.failedRequests.length;
    let succeeded = 0;
    let failed = 0;

    console.log(`[APIErrorRecovery] Retrying ${total} failed requests...`);

    const requestsToRetry = [...this.failedRequests];
    this.failedRequests = [];

    for (let i = 0; i < requestsToRetry.length; i++) {
      const request = requestsToRetry[i];
      
      if (onProgress) {
        onProgress(i + 1, total);
      }

      try {
        request.attempts++;
        
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        if (response.ok) {
          succeeded++;
          console.log(`[APIErrorRecovery] Successfully retried: ${request.method} ${request.url}`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error: any) {
        failed++;
        request.lastError = error.message;
        
        if (request.attempts < 3) {
          this.failedRequests.push(request);
        } else {
          console.log(`[APIErrorRecovery] Giving up on request after ${request.attempts} attempts`);
        }
      }
    }

    await this.saveFailedRequests();
    this.retryInProgress = false;

    console.log(`[APIErrorRecovery] Retry complete: ${succeeded} succeeded, ${failed} failed`);
    
    return { succeeded, failed, total };
  }

  async clearFailedRequests() {
    this.failedRequests = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[APIErrorRecovery] Cleared all failed requests');
  }

  getFailedRequestsCount(): number {
    return this.failedRequests.length;
  }

  getFailedRequests(): FailedRequest[] {
    return [...this.failedRequests];
  }

  async removeFailedRequest(id: string) {
    this.failedRequests = this.failedRequests.filter(r => r.id !== id);
    await this.saveFailedRequests();
  }
}

export const apiErrorRecovery = new APIErrorRecovery();

export async function fetchWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryConfig?: Partial<RetryConfig>
): Promise<T> {
  return apiErrorRecovery.executeWithRetry(async () => {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error: APIError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.retryable = response.status >= 500 || response.status === 429;
      throw error;
    }

    return response.json();
  }, retryConfig);
}
