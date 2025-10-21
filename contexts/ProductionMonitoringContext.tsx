import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { networkMonitor, NetworkStatus } from '@/utils/networkMonitor';
import { offlineSyncQueue } from '@/utils/offlineSyncQueue';
import { apiErrorRecovery } from '@/utils/apiErrorRecovery';
import { backgroundTaskHandler } from '@/utils/backgroundTaskHandler';
import { detectMemoryLeaks } from '@/utils/memoryLeakPrevention';
import { errorTracker } from '@/utils/errorTracking';

export interface ProductionMetrics {
  networkStatus: NetworkStatus | null;
  syncQueueCount: number;
  failedRequestsCount: number;
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usagePercent: number;
  };
  errorCount: number;
  uptime: number;
  lastSyncAttempt?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  issues: string[];
  recommendations: string[];
}

export const [ProductionMonitoringProvider, useProductionMonitoring] = createContextHook(() => {
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    networkStatus: null,
    syncQueueCount: 0,
    failedRequestsCount: 0,
    memoryUsage: {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      usagePercent: 0,
    },
    errorCount: 0,
    uptime: 100,
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    issues: [],
    recommendations: [],
  });

  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  useEffect(() => {
    backgroundTaskHandler.initialize();
    setupNetworkMonitoring();
    setupMetricsCollection();
    setupAutoSync();
    
    return () => {
      console.log('[ProductionMonitoring] Cleaning up...');
    };
  }, []);

  const setupNetworkMonitoring = useCallback(() => {
    const unsubscribe = networkMonitor.onChange((status: NetworkStatus) => {
      setMetrics(prev => ({ ...prev, networkStatus: status }));
    });

    networkMonitor.onReconnect(async () => {
      console.log('[ProductionMonitoring] Network reconnected, syncing...');
      await syncAll();
    });

    return unsubscribe;
  }, []);

  const setupMetricsCollection = useCallback(() => {
    backgroundTaskHandler.registerTask(
      'metrics-collection',
      'analytics',
      async () => {
        const syncQueueCount = offlineSyncQueue.getQueueCount();
        const failedRequestsCount = apiErrorRecovery.getFailedRequestsCount();
        const memoryUsage = detectMemoryLeaks();
        const errorCount = errorTracker.getRecentErrors(50).length;
        const uptime = networkMonitor.getUptime();

        setMetrics(prev => ({
          ...prev,
          syncQueueCount,
          failedRequestsCount,
          memoryUsage,
          errorCount,
          uptime,
        }));

        evaluateSystemHealth({
          syncQueueCount,
          failedRequestsCount,
          memoryUsage,
          errorCount,
          uptime,
          networkStatus: networkMonitor.getCurrentStatus(),
        });
      },
      {
        priority: 'medium',
        interval: 30000,
        enabled: true,
      }
    );
  }, []);

  const setupAutoSync = useCallback(() => {
    backgroundTaskHandler.registerTask(
      'auto-sync',
      'sync',
      async () => {
        if (!networkMonitor.isOnline()) {
          console.log('[ProductionMonitoring] Skipping auto-sync: offline');
          return;
        }

        const queueCount = offlineSyncQueue.getQueueCount();
        if (queueCount === 0) {
          return;
        }

        console.log(`[ProductionMonitoring] Auto-syncing ${queueCount} items...`);
        await syncAll();
      },
      {
        priority: 'high',
        interval: 60000,
        enabled: true,
      }
    );
  }, []);

  const evaluateSystemHealth = useCallback((currentMetrics: Partial<ProductionMetrics>) => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: SystemHealth['status'] = 'healthy';

    if (currentMetrics.networkStatus && !currentMetrics.networkStatus.isConnected) {
      status = 'degraded';
      issues.push('Device is offline');
      recommendations.push('Check internet connection');
    }

    if ((currentMetrics.syncQueueCount ?? 0) > 10) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push(`${currentMetrics.syncQueueCount} pending sync actions`);
      recommendations.push('Sync pending actions when online');
    }

    if ((currentMetrics.failedRequestsCount ?? 0) > 5) {
      status = 'degraded';
      issues.push(`${currentMetrics.failedRequestsCount} failed requests`);
      recommendations.push('Retry failed requests');
    }

    if ((currentMetrics.memoryUsage?.usagePercent ?? 0) > 90) {
      status = 'critical';
      issues.push('Critical memory usage detected');
      recommendations.push('Close unused apps or restart the app');
    } else if ((currentMetrics.memoryUsage?.usagePercent ?? 0) > 75) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push('High memory usage detected');
      recommendations.push('Consider closing some features');
    }

    if ((currentMetrics.errorCount ?? 0) > 10) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push(`${currentMetrics.errorCount} recent errors`);
      recommendations.push('Report issues to support');
    }

    setSystemHealth({ status, issues, recommendations });
  }, []);

  const syncAll = useCallback(async () => {
    if (isAutoSyncing) {
      console.log('[ProductionMonitoring] Sync already in progress');
      return { succeeded: 0, failed: 0, total: 0 };
    }

    setIsAutoSyncing(true);

    try {
      const syncResult = await offlineSyncQueue.syncAll((current, total) => {
        console.log(`[ProductionMonitoring] Syncing ${current}/${total}...`);
      });

      const retryResult = await apiErrorRecovery.retryFailedRequests((current, total) => {
        console.log(`[ProductionMonitoring] Retrying ${current}/${total}...`);
      });

      setMetrics(prev => ({
        ...prev,
        lastSyncAttempt: new Date().toISOString(),
        syncQueueCount: offlineSyncQueue.getQueueCount(),
        failedRequestsCount: apiErrorRecovery.getFailedRequestsCount(),
      }));

      console.log('[ProductionMonitoring] Sync complete:', {
        sync: syncResult,
        retry: retryResult,
      });

      return {
        succeeded: syncResult.succeeded + retryResult.succeeded,
        failed: syncResult.failed + retryResult.failed,
        total: syncResult.total + retryResult.total,
      };
    } finally {
      setIsAutoSyncing(false);
    }
  }, [isAutoSyncing]);

  const clearAllData = useCallback(async () => {
    await offlineSyncQueue.clearQueue();
    await apiErrorRecovery.clearFailedRequests();
    await networkMonitor.clearHistory();
    await backgroundTaskHandler.clearHistory();
    errorTracker.clearErrors();

    setMetrics({
      networkStatus: networkMonitor.getCurrentStatus(),
      syncQueueCount: 0,
      failedRequestsCount: 0,
      memoryUsage: detectMemoryLeaks(),
      errorCount: 0,
      uptime: 100,
    });

    console.log('[ProductionMonitoring] All monitoring data cleared');
  }, []);

  const getDetailedMetrics = useCallback(() => {
    return {
      ...metrics,
      networkHistory: networkMonitor.getHistory(),
      syncQueue: offlineSyncQueue.getQueue(),
      failedRequests: apiErrorRecovery.getFailedRequests(),
      recentErrors: errorTracker.getRecentErrors(20),
      backgroundTasks: backgroundTaskHandler.getAllTasks(),
    };
  }, [metrics]);

  const forceSync = useCallback(async () => {
    console.log('[ProductionMonitoring] Force sync triggered');
    return await syncAll();
  }, [syncAll]);

  const refreshMetrics = useCallback(() => {
    const syncQueueCount = offlineSyncQueue.getQueueCount();
    const failedRequestsCount = apiErrorRecovery.getFailedRequestsCount();
    const memoryUsage = detectMemoryLeaks();
    const errorCount = errorTracker.getRecentErrors(50).length;
    const uptime = networkMonitor.getUptime();
    const networkStatus = networkMonitor.getCurrentStatus();

    setMetrics(prev => ({
      ...prev,
      networkStatus,
      syncQueueCount,
      failedRequestsCount,
      memoryUsage,
      errorCount,
      uptime,
    }));

    evaluateSystemHealth({
      syncQueueCount,
      failedRequestsCount,
      memoryUsage,
      errorCount,
      uptime,
      networkStatus,
    });
  }, [evaluateSystemHealth]);

  const isOnline = useCallback(() => networkMonitor.isOnline(), []);
  const getNetworkQuality = useCallback(() => networkMonitor.getQuality(), []);

  return useMemo(() => ({
    metrics,
    systemHealth,
    isAutoSyncing,
    syncAll: forceSync,
    clearAllData,
    getDetailedMetrics,
    refreshMetrics,
    isOnline,
    getNetworkQuality,
  }), [
    metrics,
    systemHealth,
    isAutoSyncing,
    forceSync,
    clearAllData,
    getDetailedMetrics,
    refreshMetrics,
    isOnline,
    getNetworkQuality,
  ]);
});
