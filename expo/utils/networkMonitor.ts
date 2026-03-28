import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: ConnectionType;
  quality: NetworkQuality;
  timestamp: string;
}

export interface NetworkEvent {
  type: 'connected' | 'disconnected' | 'quality_changed';
  status: NetworkStatus;
  timestamp: string;
}

const STORAGE_KEY = 'hustlexp_network_history';
const MAX_HISTORY = 50;
const PING_TIMEOUT = 5000;

class NetworkMonitor {
  private currentStatus: NetworkStatus | null = null;
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private reconnectListeners: ((status: NetworkStatus) => void)[] = [];
  private disconnectListeners: ((status: NetworkStatus) => void)[] = [];
  private history: NetworkEvent[] = [];
  private unsubscribe: (() => void) | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadHistory();
    this.startMonitoring();
    this.startPeriodicPing();
  }

  private async loadHistory() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
        console.log(`[NetworkMonitor] Loaded ${this.history.length} network events`);
      }
    } catch (error) {
      console.error('[NetworkMonitor] Error loading history:', error);
    }
  }

  private async saveHistory() {
    try {
      const trimmedHistory = this.history.slice(-MAX_HISTORY);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('[NetworkMonitor] Error saving history:', error);
    }
  }

  private startMonitoring() {
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      this.handleNetworkChange(state);
    });
    console.log('[NetworkMonitor] Started monitoring network status');
  }

  private startPeriodicPing() {
    this.pingInterval = setInterval(() => {
      this.checkInternetQuality();
    }, 30000);
  }

  private handleNetworkChange(state: NetInfoState) {
    const wasConnected = this.currentStatus?.isConnected ?? false;
    const newStatus = this.createNetworkStatus(state);
    
    const isNowConnected = newStatus.isConnected;
    const qualityChanged = this.currentStatus?.quality !== newStatus.quality;

    this.currentStatus = newStatus;

    this.listeners.forEach(listener => listener(newStatus));

    if (!wasConnected && isNowConnected) {
      console.log('[NetworkMonitor] ✅ RECONNECTED:', newStatus.type);
      this.addToHistory('connected', newStatus);
      this.reconnectListeners.forEach(listener => listener(newStatus));
    } else if (wasConnected && !isNowConnected) {
      console.log('[NetworkMonitor] ❌ DISCONNECTED');
      this.addToHistory('disconnected', newStatus);
      this.disconnectListeners.forEach(listener => listener(newStatus));
    } else if (qualityChanged) {
      console.log('[NetworkMonitor] 📊 Quality changed:', newStatus.quality);
      this.addToHistory('quality_changed', newStatus);
    }
  }

  private createNetworkStatus(state: NetInfoState): NetworkStatus {
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable;
    
    let type: ConnectionType = 'unknown';
    if (state.type === 'wifi') type = 'wifi';
    else if (state.type === 'cellular') type = 'cellular';
    else if (state.type === 'ethernet') type = 'ethernet';
    else if (state.type === 'none') type = 'none';

    const quality = this.calculateQuality(state);

    return {
      isConnected,
      isInternetReachable,
      type,
      quality,
      timestamp: new Date().toISOString(),
    };
  }

  private calculateQuality(state: NetInfoState): NetworkQuality {
    if (!state.isConnected) {
      return 'offline';
    }

    if (state.type === 'cellular' && state.details) {
      const details = state.details as any;
      const generation = details.cellularGeneration;
      
      if (generation === '5g') return 'excellent';
      if (generation === '4g') return 'good';
      if (generation === '3g') return 'fair';
      return 'poor';
    }

    if (state.type === 'wifi') {
      return 'excellent';
    }

    if (state.type === 'ethernet') {
      return 'excellent';
    }

    return state.isInternetReachable === true ? 'good' : 'poor';
  }

  private async checkInternetQuality() {
    if (!this.currentStatus?.isConnected) return;

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT);

      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;
      
      let quality: NetworkQuality;
      if (response.ok) {
        if (latency < 200) quality = 'excellent';
        else if (latency < 500) quality = 'good';
        else if (latency < 1000) quality = 'fair';
        else quality = 'poor';
      } else {
        quality = 'poor';
      }

      if (this.currentStatus && this.currentStatus.quality !== quality) {
        const updatedStatus: NetworkStatus = {
          ...this.currentStatus,
          quality,
          timestamp: new Date().toISOString(),
        };
        
        this.currentStatus = updatedStatus;
        this.listeners.forEach(listener => listener(updatedStatus));
        this.addToHistory('quality_changed', updatedStatus);
        
        console.log(`[NetworkMonitor] Quality updated: ${quality} (${latency}ms)`);
      }
    } catch {
      console.log('[NetworkMonitor] Ping failed, marking as poor quality');
      
      if (this.currentStatus && this.currentStatus.quality !== 'poor') {
        const updatedStatus: NetworkStatus = {
          ...this.currentStatus,
          quality: 'poor',
          timestamp: new Date().toISOString(),
        };
        
        this.currentStatus = updatedStatus;
        this.listeners.forEach(listener => listener(updatedStatus));
      }
    }
  }

  private addToHistory(type: NetworkEvent['type'], status: NetworkStatus) {
    const event: NetworkEvent = {
      type,
      status,
      timestamp: new Date().toISOString(),
    };

    this.history.push(event);
    
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }

    this.saveHistory();
  }

  onChange(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.push(listener);
    
    if (this.currentStatus) {
      listener(this.currentStatus);
    }

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  onReconnect(listener: (status: NetworkStatus) => void): () => void {
    this.reconnectListeners.push(listener);

    return () => {
      this.reconnectListeners = this.reconnectListeners.filter(l => l !== listener);
    };
  }

  onDisconnect(listener: (status: NetworkStatus) => void): () => void {
    this.disconnectListeners.push(listener);

    return () => {
      this.disconnectListeners = this.disconnectListeners.filter(l => l !== listener);
    };
  }

  getCurrentStatus(): NetworkStatus | null {
    return this.currentStatus;
  }

  isOnline(): boolean {
    return this.currentStatus?.isConnected ?? false;
  }

  getConnectionType(): ConnectionType {
    return this.currentStatus?.type ?? 'unknown';
  }

  getQuality(): NetworkQuality {
    return this.currentStatus?.quality ?? 'offline';
  }

  getHistory(): NetworkEvent[] {
    return [...this.history];
  }

  getRecentDisconnections(limit = 10): NetworkEvent[] {
    return this.history
      .filter(event => event.type === 'disconnected')
      .slice(-limit);
  }

  getUptime(): number {
    const connectedEvents = this.history.filter(e => e.type === 'connected');
    const disconnectedEvents = this.history.filter(e => e.type === 'disconnected');
    
    if (connectedEvents.length === 0) return 100;
    
    const totalEvents = connectedEvents.length + disconnectedEvents.length;
    return (connectedEvents.length / totalEvents) * 100;
  }

  async clearHistory() {
    this.history = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[NetworkMonitor] History cleared');
  }

  async refresh() {
    const state = await NetInfo.fetch();
    this.handleNetworkChange(state);
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.listeners = [];
    this.reconnectListeners = [];
    this.disconnectListeners = [];
    
    console.log('[NetworkMonitor] Destroyed');
  }
}

export const networkMonitor = new NetworkMonitor();
