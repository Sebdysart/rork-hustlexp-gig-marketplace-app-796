import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { errorTracker } from './errorTracking';

export type SyncAction = 
  | 'create_task'
  | 'accept_task'
  | 'complete_task'
  | 'send_message'
  | 'rate_user'
  | 'update_profile'
  | 'purchase_powerup'
  | 'switch_mode';

export interface QueuedAction {
  id: string;
  action: SyncAction;
  data: any;
  timestamp: string;
  retries: number;
  lastAttempt?: string;
  error?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncResult {
  success: boolean;
  actionId: string;
  error?: string;
}

export interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'latest_wins';
  resolve: (serverData: any, clientData: any) => any;
}

const STORAGE_KEY = 'hustlexp_sync_queue';
const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 3000, 10000, 30000, 60000];

const ACTION_PRIORITIES: Record<SyncAction, 'high' | 'medium' | 'low'> = {
  complete_task: 'high',
  accept_task: 'high',
  send_message: 'medium',
  rate_user: 'medium',
  create_task: 'medium',
  update_profile: 'low',
  purchase_powerup: 'low',
  switch_mode: 'low',
};

class OfflineSyncQueue {
  private queue: QueuedAction[] = [];
  private isOnline = true;
  private isSyncing = false;
  private listeners: ((queue: QueuedAction[]) => void)[] = [];
  private conflictResolvers: Map<SyncAction, ConflictResolution> = new Map();

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
    this.setupDefaultConflictResolvers();
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[SyncQueue] Loaded ${this.queue.length} queued actions`);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[SyncQueue] Error loading queue:', error);
      errorTracker.logError(error as Error, { route: 'SyncQueue' });
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[SyncQueue] Error saving queue:', error);
      errorTracker.logError(error as Error, { route: 'SyncQueue' });
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state: any) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log(`[SyncQueue] Network status: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);

      if (wasOffline && this.isOnline && this.queue.length > 0) {
        console.log('[SyncQueue] Back online, starting sync...');
        this.syncAll();
      }
    });
  }

  private setupDefaultConflictResolvers() {
    this.conflictResolvers.set('create_task', {
      strategy: 'client_wins',
      resolve: (server, client) => client,
    });

    this.conflictResolvers.set('update_profile', {
      strategy: 'merge',
      resolve: (server, client) => ({ ...server, ...client }),
    });

    this.conflictResolvers.set('send_message', {
      strategy: 'latest_wins',
      resolve: (server, client) => {
        const serverTime = new Date(server.timestamp).getTime();
        const clientTime = new Date(client.timestamp).getTime();
        return clientTime > serverTime ? client : server;
      },
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.queue]));
  }

  async addAction(
    action: SyncAction,
    data: any,
    executeImmediately = true
  ): Promise<string> {
    const queuedAction: QueuedAction = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
      priority: ACTION_PRIORITIES[action] || 'medium',
    };

    this.queue.push(queuedAction);
    await this.saveQueue();
    this.notifyListeners();

    console.log(`[SyncQueue] Added action: ${action} (${queuedAction.id})`);

    if (this.isOnline && executeImmediately) {
      this.syncAction(queuedAction);
    }

    return queuedAction.id;
  }

  private async syncAction(action: QueuedAction): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        actionId: action.id,
        error: 'Device is offline',
      };
    }

    try {
      action.lastAttempt = new Date().toISOString();
      action.retries++;

      await this.executeAction(action);

      this.queue = this.queue.filter(a => a.id !== action.id);
      await this.saveQueue();
      this.notifyListeners();

      console.log(`[SyncQueue] Successfully synced: ${action.action}`);

      return {
        success: true,
        actionId: action.id,
      };
    } catch (error: any) {
      action.error = error.message;

      if (action.retries >= MAX_RETRIES) {
        console.error(`[SyncQueue] Failed after ${MAX_RETRIES} retries:`, action.action);
        errorTracker.logError(error, {
          route: 'SyncQueue',
          componentStack: `Action: ${action.action}, ID: ${action.id}`,
        });
        
        this.queue = this.queue.filter(a => a.id !== action.id);
        await this.saveQueue();
        this.notifyListeners();

        return {
          success: false,
          actionId: action.id,
          error: `Failed after ${MAX_RETRIES} retries: ${error.message}`,
        };
      }

      await this.saveQueue();
      this.notifyListeners();

      const delay = RETRY_DELAYS[Math.min(action.retries - 1, RETRY_DELAYS.length - 1)];
      console.log(`[SyncQueue] Retry ${action.retries}/${MAX_RETRIES} in ${delay}ms`);

      setTimeout(() => {
        if (this.isOnline) {
          this.syncAction(action);
        }
      }, delay);

      return {
        success: false,
        actionId: action.id,
        error: error.message,
      };
    }
  }

  private async executeAction(action: QueuedAction): Promise<any> {
    console.log(`[SyncQueue] Executing: ${action.action}`);

    switch (action.action) {
      case 'create_task':
        return this.syncCreateTask(action.data);
      case 'accept_task':
        return this.syncAcceptTask(action.data);
      case 'complete_task':
        return this.syncCompleteTask(action.data);
      case 'send_message':
        return this.syncSendMessage(action.data);
      case 'rate_user':
        return this.syncRateUser(action.data);
      case 'update_profile':
        return this.syncUpdateProfile(action.data);
      case 'purchase_powerup':
        return this.syncPurchasePowerup(action.data);
      case 'switch_mode':
        return this.syncSwitchMode(action.data);
      default:
        throw new Error(`Unknown action type: ${action.action}`);
    }
  }

  private async syncCreateTask(data: any): Promise<any> {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  private async syncAcceptTask(data: any): Promise<any> {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/tasks/${data.taskId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.userId }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  private async syncCompleteTask(data: any): Promise<any> {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/tasks/${data.taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.userId }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  private async syncSendMessage(data: any): Promise<any> {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  private async syncRateUser(data: any): Promise<any> {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  private async syncUpdateProfile(data: any): Promise<any> {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/users/${data.userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.updates),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  private async syncPurchasePowerup(data: any): Promise<any> {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/powerups/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  private async syncSwitchMode(data: any): Promise<any> {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/users/${data.userId}/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: data.mode }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  async syncAll(onProgress?: (current: number, total: number) => void): Promise<{
    succeeded: number;
    failed: number;
    total: number;
  }> {
    if (this.isSyncing) {
      console.log('[SyncQueue] Sync already in progress');
      return { succeeded: 0, failed: 0, total: 0 };
    }

    if (!this.isOnline) {
      console.log('[SyncQueue] Cannot sync while offline');
      return { succeeded: 0, failed: 0, total: 0 };
    }

    this.isSyncing = true;
    const sortedQueue = [...this.queue].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const total = sortedQueue.length;
    let succeeded = 0;
    let failed = 0;

    console.log(`[SyncQueue] Starting sync of ${total} actions...`);

    for (let i = 0; i < sortedQueue.length; i++) {
      const action = sortedQueue[i];

      if (onProgress) {
        onProgress(i + 1, total);
      }

      const result = await this.syncAction(action);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isSyncing = false;
    console.log(`[SyncQueue] Sync complete: ${succeeded} succeeded, ${failed} failed`);

    return { succeeded, failed, total };
  }

  onQueueChange(listener: (queue: QueuedAction[]) => void) {
    this.listeners.push(listener);
    listener([...this.queue]);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getQueue(): QueuedAction[] {
    return [...this.queue];
  }

  getQueueCount(): number {
    return this.queue.length;
  }

  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
    this.notifyListeners();
    console.log('[SyncQueue] Queue cleared');
  }

  async removeAction(actionId: string) {
    this.queue = this.queue.filter(a => a.id !== actionId);
    await this.saveQueue();
    this.notifyListeners();
  }

  registerConflictResolver(action: SyncAction, resolver: ConflictResolution) {
    this.conflictResolvers.set(action, resolver);
  }

  getConflictResolver(action: SyncAction): ConflictResolution | undefined {
    return this.conflictResolvers.get(action);
  }
}

export const offlineSyncQueue = new OfflineSyncQueue();
