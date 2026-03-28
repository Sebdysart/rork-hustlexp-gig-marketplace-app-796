import { hustleAI } from './hustleAI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEALTH_CHECK_KEY = 'hustleai_health_status';
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000;

export type BackendStatus = 'online' | 'offline' | 'degraded' | 'checking';

export interface HealthStatus {
  status: BackendStatus;
  lastCheck: number;
  latency: number | null;
  version: string | null;
  message: string;
}

class BackendHealthMonitor {
  private currentStatus: HealthStatus = {
    status: 'checking',
    lastCheck: 0,
    latency: null,
    version: null,
    message: 'Initializing...',
  };
  
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(status: HealthStatus) => void> = [];

  async initialize(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(HEALTH_CHECK_KEY);
      if (cached) {
        this.currentStatus = JSON.parse(cached);
      }
    } catch (error) {
      console.warn('[Health] Failed to load cached status');
    }

    await this.checkHealth();

    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, HEALTH_CHECK_INTERVAL);
  }

  async checkHealth(): Promise<HealthStatus> {
    this.updateStatus({ status: 'checking', message: 'Checking backend...' });

    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        hustleAI.checkHealth(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 5000)
        )
      ]) as { status: string; version: string };

      const latency = Date.now() - startTime;

      if (result.status === 'ok') {
        const newStatus: HealthStatus = {
          status: latency < 3000 ? 'online' : 'degraded',
          lastCheck: Date.now(),
          latency,
          version: result.version,
          message: latency < 3000 
            ? '✅ AI Online' 
            : '⚠️ AI Slow',
        };

        this.updateStatus(newStatus);
        return newStatus;
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      
      const newStatus: HealthStatus = {
        status: 'offline',
        lastCheck: Date.now(),
        latency: null,
        version: null,
        message: errorMsg === 'TIMEOUT' 
          ? '🔌 AI Offline (Timeout)' 
          : '🔌 AI Offline',
      };

      this.updateStatus(newStatus);
      return newStatus;
    }

    const offlineStatus: HealthStatus = {
      status: 'offline',
      lastCheck: Date.now(),
      latency: null,
      version: null,
      message: '🔌 AI Offline',
    };

    this.updateStatus(offlineStatus);
    return offlineStatus;
  }

  private async updateStatus(updates: Partial<HealthStatus>): Promise<void> {
    this.currentStatus = { ...this.currentStatus, ...updates };

    try {
      await AsyncStorage.setItem(HEALTH_CHECK_KEY, JSON.stringify(this.currentStatus));
    } catch (error) {
      console.warn('[Health] Failed to cache status');
    }

    this.listeners.forEach(listener => listener(this.currentStatus));
  }

  getStatus(): HealthStatus {
    return this.currentStatus;
  }

  subscribe(listener: (status: HealthStatus) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const backendHealth = new BackendHealthMonitor();
