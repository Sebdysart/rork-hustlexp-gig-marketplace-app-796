/**
 * Advanced Request Queuing System for AI
 * Handles request queuing, retries, and smart batching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = 'hustlexp_ai_request_queue';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

export interface QueuedRequest {
  id: string;
  type: 'chat' | 'task-parse' | 'recommendation' | 'coaching';
  payload: any;
  userId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  attempts: number;
  maxAttempts: number;
  timestamp: number;
  context?: Record<string, any>;
}

export interface QueueResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId: string;
}

type RequestHandler<T = any> = (payload: any, context?: Record<string, any>) => Promise<T>;

class AIRequestQueue {
  private queue: QueuedRequest[] = [];
  private processing: boolean = false;
  private handlers: Map<string, RequestHandler> = new Map();
  private listeners: Map<string, (result: QueueResult) => void> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueue();
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[AIRequestQueue] Loaded ${this.queue.length} queued requests`);
      }
    } catch (error) {
      console.error('[AIRequestQueue] Error loading queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[AIRequestQueue] Error saving queue:', error);
    }
  }

  registerHandler(type: string, handler: RequestHandler) {
    this.handlers.set(type, handler);
    console.log(`[AIRequestQueue] Registered handler for type: ${type}`);
  }

  async enqueue<T = any>(
    type: QueuedRequest['type'],
    payload: any,
    userId: string,
    options?: {
      priority?: QueuedRequest['priority'];
      maxAttempts?: number;
      context?: Record<string, any>;
    }
  ): Promise<string> {
    const request: QueuedRequest = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      userId,
      priority: options?.priority || 'medium',
      attempts: 0,
      maxAttempts: options?.maxAttempts || MAX_RETRY_ATTEMPTS,
      timestamp: Date.now(),
      context: options?.context,
    };

    this.queue.push(request);
    this.sortQueueByPriority();
    await this.saveQueue();

    console.log(`[AIRequestQueue] Enqueued ${type} request (ID: ${request.id}, Priority: ${request.priority})`);

    this.scheduleProcessing();

    return request.id;
  }

  onResult(requestId: string, callback: (result: QueueResult) => void) {
    this.listeners.set(requestId, callback);
  }

  private notifyListener(requestId: string, result: QueueResult) {
    const listener = this.listeners.get(requestId);
    if (listener) {
      listener(result);
      this.listeners.delete(requestId);
    }
  }

  private sortQueueByPriority() {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    this.queue.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });
  }

  private scheduleProcessing() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, BATCH_DELAY_MS);
  }

  private async processBatch() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`[AIRequestQueue] Processing batch (Queue size: ${this.queue.length})`);

    const batch = this.queue.slice(0, BATCH_SIZE);

    await Promise.allSettled(
      batch.map(request => this.processRequest(request))
    );

    await this.saveQueue();
    this.processing = false;

    if (this.queue.length > 0) {
      this.scheduleProcessing();
    }
  }

  private async processRequest(request: QueuedRequest): Promise<void> {
    const handler = this.handlers.get(request.type);
    
    if (!handler) {
      console.error(`[AIRequestQueue] No handler registered for type: ${request.type}`);
      this.removeFromQueue(request.id);
      this.notifyListener(request.id, {
        success: false,
        error: `No handler for type: ${request.type}`,
        requestId: request.id,
      });
      return;
    }

    request.attempts++;
    console.log(`[AIRequestQueue] Processing ${request.type} (ID: ${request.id}, Attempt: ${request.attempts}/${request.maxAttempts})`);

    try {
      const result = await handler(request.payload, request.context);
      
      console.log(`[AIRequestQueue] ✅ Success for ${request.id}`);
      this.removeFromQueue(request.id);
      this.notifyListener(request.id, {
        success: true,
        data: result,
        requestId: request.id,
      });
    } catch (error: any) {
      console.error(`[AIRequestQueue] ❌ Error for ${request.id}:`, error.message);

      if (request.attempts >= request.maxAttempts) {
        console.log(`[AIRequestQueue] Max attempts reached for ${request.id}, removing from queue`);
        this.removeFromQueue(request.id);
        this.notifyListener(request.id, {
          success: false,
          error: error.message,
          requestId: request.id,
        });
      } else {
        console.log(`[AIRequestQueue] Will retry ${request.id} after ${RETRY_DELAY_MS}ms`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  private removeFromQueue(requestId: string) {
    const index = this.queue.findIndex(r => r.id === requestId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
    console.log('[AIRequestQueue] Queue cleared');
  }

  async retryAll() {
    console.log(`[AIRequestQueue] Retrying all ${this.queue.length} queued requests`);
    this.queue.forEach(request => {
      request.attempts = 0;
    });
    await this.saveQueue();
    this.scheduleProcessing();
  }

  getQueueStats() {
    const stats = {
      total: this.queue.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      oldestRequest: this.queue[0]?.timestamp || null,
    };

    this.queue.forEach(request => {
      stats.byType[request.type] = (stats.byType[request.type] || 0) + 1;
      stats.byPriority[request.priority] = (stats.byPriority[request.priority] || 0) + 1;
    });

    return stats;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  isProcessing(): boolean {
    return this.processing;
  }
}

export const aiRequestQueue = new AIRequestQueue();
