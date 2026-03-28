import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { errorTracker } from './errorTracking';

export type BackgroundTask = {
  id: string;
  type: 'sync' | 'cleanup' | 'analytics' | 'notification' | 'custom';
  priority: 'high' | 'medium' | 'low';
  action: () => Promise<void>;
  interval?: number;
  lastRun?: string;
  nextRun?: string;
  retries: number;
  maxRetries: number;
  enabled: boolean;
};

export interface TaskResult {
  taskId: string;
  success: boolean;
  duration: number;
  error?: string;
  timestamp: string;
}

const TASK_HISTORY_KEY = 'hustlexp_task_history';
const MAX_HISTORY = 100;

class BackgroundTaskHandler {
  private tasks: Map<string, BackgroundTask> = new Map();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private appState: AppStateStatus = 'active';
  private history: TaskResult[] = [];
  private isInitialized = false;
  private appStateSubscription: any = null;

  async initialize() {
    if (this.isInitialized) return;

    await this.loadHistory();
    this.setupAppStateListener();
    this.isInitialized = true;

    console.log('[BackgroundTaskHandler] Initialized');
  }

  private async loadHistory() {
    try {
      const stored = await AsyncStorage.getItem(TASK_HISTORY_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
        console.log(`[BackgroundTaskHandler] Loaded ${this.history.length} task results`);
      }
    } catch (error) {
      console.error('[BackgroundTaskHandler] Error loading history:', error);
    }
  }

  private async saveHistory() {
    try {
      const trimmedHistory = this.history.slice(-MAX_HISTORY);
      await AsyncStorage.setItem(TASK_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('[BackgroundTaskHandler] Error saving history:', error);
    }
  }

  private setupAppStateListener() {
    const subscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.appStateSubscription = subscription;
    console.log('[BackgroundTaskHandler] App state listener registered');
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    const wasBackground = this.appState === 'background';
    const isNowActive = nextAppState === 'active';

    this.appState = nextAppState;

    console.log(`[BackgroundTaskHandler] App state: ${nextAppState}`);

    if (wasBackground && isNowActive) {
      console.log('[BackgroundTaskHandler] App returned to foreground, running pending tasks...');
      this.runPendingTasks();
    }

    if (nextAppState === 'background') {
      console.log('[BackgroundTaskHandler] App moved to background');
      this.handleBackground();
    }
  };

  private async runPendingTasks() {
    const pendingTasks = Array.from(this.tasks.values()).filter(task => {
      if (!task.enabled) return false;
      if (!task.interval || !task.lastRun) return true;

      const lastRunTime = new Date(task.lastRun).getTime();
      const now = Date.now();
      const timeSinceLastRun = now - lastRunTime;

      return timeSinceLastRun >= task.interval;
    });

    console.log(`[BackgroundTaskHandler] Running ${pendingTasks.length} pending tasks...`);

    for (const task of pendingTasks) {
      await this.executeTask(task);
    }
  }

  private handleBackground() {
    if (Platform.OS === 'web') {
      console.log('[BackgroundTaskHandler] Web platform: keeping all tasks active');
      return;
    }

    const highPriorityTasks = Array.from(this.tasks.values()).filter(
      task => task.priority === 'high' && task.enabled
    );

    console.log(`[BackgroundTaskHandler] Keeping ${highPriorityTasks.length} high-priority tasks active`);
  }

  registerTask(
    id: string,
    type: BackgroundTask['type'],
    action: () => Promise<void>,
    options: {
      priority?: BackgroundTask['priority'];
      interval?: number;
      maxRetries?: number;
      enabled?: boolean;
    } = {}
  ): string {
    const task: BackgroundTask = {
      id,
      type,
      action,
      priority: options.priority ?? 'medium',
      interval: options.interval,
      retries: 0,
      maxRetries: options.maxRetries ?? 3,
      enabled: options.enabled ?? true,
    };

    this.tasks.set(id, task);

    if (task.interval && task.enabled) {
      this.scheduleTask(task);
    }

    console.log(`[BackgroundTaskHandler] Registered task: ${id} (${type})`);

    return id;
  }

  private scheduleTask(task: BackgroundTask) {
    if (!task.interval) return;

    const existingInterval = this.intervals.get(task.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const interval = setInterval(() => {
      if (task.enabled) {
        this.executeTask(task);
      }
    }, task.interval);

    this.intervals.set(task.id, interval);

    console.log(`[BackgroundTaskHandler] Scheduled task ${task.id} every ${task.interval}ms`);
  }

  private async executeTask(task: BackgroundTask): Promise<TaskResult> {
    const startTime = Date.now();
    console.log(`[BackgroundTaskHandler] Executing task: ${task.id}`);

    try {
      await task.action();

      const duration = Date.now() - startTime;
      task.lastRun = new Date().toISOString();
      task.retries = 0;

      if (task.interval) {
        const nextRunTime = Date.now() + task.interval;
        task.nextRun = new Date(nextRunTime).toISOString();
      }

      const result: TaskResult = {
        taskId: task.id,
        success: true,
        duration,
        timestamp: new Date().toISOString(),
      };

      this.addToHistory(result);

      console.log(`[BackgroundTaskHandler] Task ${task.id} completed in ${duration}ms`);

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      task.retries++;

      console.error(`[BackgroundTaskHandler] Task ${task.id} failed (attempt ${task.retries}/${task.maxRetries}):`, error.message);

      errorTracker.logError(error, {
        route: 'BackgroundTaskHandler',
        componentStack: `Task: ${task.id}, Type: ${task.type}`,
      });

      const result: TaskResult = {
        taskId: task.id,
        success: false,
        duration,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      this.addToHistory(result);

      if (task.retries >= task.maxRetries) {
        console.error(`[BackgroundTaskHandler] Task ${task.id} disabled after ${task.maxRetries} failures`);
        task.enabled = false;
      }

      return result;
    }
  }

  private addToHistory(result: TaskResult) {
    this.history.push(result);

    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }

    this.saveHistory();
  }

  async runTask(taskId: string): Promise<TaskResult | null> {
    const task = this.tasks.get(taskId);

    if (!task) {
      console.error(`[BackgroundTaskHandler] Task not found: ${taskId}`);
      return null;
    }

    return this.executeTask(task);
  }

  enableTask(taskId: string) {
    const task = this.tasks.get(taskId);

    if (!task) {
      console.error(`[BackgroundTaskHandler] Task not found: ${taskId}`);
      return;
    }

    task.enabled = true;
    task.retries = 0;

    if (task.interval) {
      this.scheduleTask(task);
    }

    console.log(`[BackgroundTaskHandler] Task ${taskId} enabled`);
  }

  disableTask(taskId: string) {
    const task = this.tasks.get(taskId);

    if (!task) {
      console.error(`[BackgroundTaskHandler] Task not found: ${taskId}`);
      return;
    }

    task.enabled = false;

    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }

    console.log(`[BackgroundTaskHandler] Task ${taskId} disabled`);
  }

  unregisterTask(taskId: string) {
    this.disableTask(taskId);
    this.tasks.delete(taskId);
    console.log(`[BackgroundTaskHandler] Task ${taskId} unregistered`);
  }

  getTask(taskId: string): BackgroundTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): BackgroundTask[] {
    return Array.from(this.tasks.values());
  }

  getTaskHistory(taskId?: string, limit = 20): TaskResult[] {
    let filtered = this.history;

    if (taskId) {
      filtered = filtered.filter(result => result.taskId === taskId);
    }

    return filtered.slice(-limit);
  }

  getTaskStats(taskId: string): {
    totalRuns: number;
    successRate: number;
    averageDuration: number;
    lastRun?: string;
    nextRun?: string;
  } | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const taskHistory = this.history.filter(r => r.taskId === taskId);
    const totalRuns = taskHistory.length;

    if (totalRuns === 0) {
      return {
        totalRuns: 0,
        successRate: 0,
        averageDuration: 0,
        lastRun: task.lastRun,
        nextRun: task.nextRun,
      };
    }

    const successes = taskHistory.filter(r => r.success).length;
    const successRate = (successes / totalRuns) * 100;
    const totalDuration = taskHistory.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = totalDuration / totalRuns;

    return {
      totalRuns,
      successRate,
      averageDuration,
      lastRun: task.lastRun,
      nextRun: task.nextRun,
    };
  }

  async clearHistory() {
    this.history = [];
    await AsyncStorage.removeItem(TASK_HISTORY_KEY);
    console.log('[BackgroundTaskHandler] History cleared');
  }

  destroy() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.tasks.clear();

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    console.log('[BackgroundTaskHandler] Destroyed');
  }
}

export const backgroundTaskHandler = new BackgroundTaskHandler();
