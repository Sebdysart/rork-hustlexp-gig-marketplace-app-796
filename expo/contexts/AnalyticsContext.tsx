import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Analytics, AnalyticsEventType } from '@/utils/analytics';
import {
  GrowthMetricsAnalyzer,
  GrowthMetrics,
  CohortData,
  FunnelAnalysis,
} from '@/utils/growthMetrics';

interface AnalyticsContextValue {
  metrics: GrowthMetrics | null;
  cohorts: CohortData[];
  funnels: FunnelAnalysis[];
  isLoading: boolean;
  lastUpdated: string | null;
  trackEvent: (type: AnalyticsEventType, data?: Record<string, any>) => Promise<void>;
  refreshMetrics: () => Promise<void>;
  refreshCohorts: () => Promise<void>;
  refreshFunnels: () => Promise<void>;
  generateCohortReport: (weeks: number) => Promise<void>;
  generateFunnelReport: (name: string, stages: string[]) => Promise<void>;
}

export const [AnalyticsProvider, useAnalytics] = createContextHook<AnalyticsContextValue>(() => {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [funnels, setFunnels] = useState<FunnelAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sessionId] = useState<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const trackEvent = useCallback(async (type: AnalyticsEventType, data: Record<string, any> = {}) => {
    try {
      await Analytics.trackEvent({
        type,
        data: {
          ...data,
          sessionId,
          screen: data.screen || 'unknown',
        },
      });
    } catch (error) {
      console.error('[AnalyticsContext] Track event error:', error);
    }
  }, [sessionId]);

  const refreshMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const newMetrics = await GrowthMetricsAnalyzer.calculateGrowthMetrics();
      setMetrics(newMetrics);
      setLastUpdated(new Date().toISOString());
      console.log('[AnalyticsContext] Metrics refreshed:', newMetrics);
    } catch (error) {
      console.error('[AnalyticsContext] Refresh metrics error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCohorts = useCallback(async () => {
    try {
      const storedCohorts = await GrowthMetricsAnalyzer.getCohorts();
      setCohorts(storedCohorts);
      console.log('[AnalyticsContext] Cohorts loaded:', storedCohorts.length);
    } catch (error) {
      console.error('[AnalyticsContext] Refresh cohorts error:', error);
    }
  }, []);

  const refreshFunnels = useCallback(async () => {
    try {
      const storedFunnels = await GrowthMetricsAnalyzer.getFunnels();
      setFunnels(storedFunnels);
      console.log('[AnalyticsContext] Funnels loaded:', storedFunnels.length);
    } catch (error) {
      console.error('[AnalyticsContext] Refresh funnels error:', error);
    }
  }, []);

  const generateCohortReport = useCallback(async (weeks: number = 4) => {
    try {
      setIsLoading(true);
      const newCohorts: CohortData[] = [];
      
      for (let i = 0; i < weeks; i++) {
        const cohort = await GrowthMetricsAnalyzer.createCohort(i);
        await GrowthMetricsAnalyzer.saveCohort(cohort);
        newCohorts.push(cohort);
      }

      await refreshCohorts();
      console.log('[AnalyticsContext] Generated cohorts:', newCohorts.length);
    } catch (error) {
      console.error('[AnalyticsContext] Generate cohort report error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshCohorts]);

  const generateFunnelReport = useCallback(async (name: string, stages: string[]) => {
    try {
      setIsLoading(true);
      const funnel = await GrowthMetricsAnalyzer.analyzeFunnel(name, stages);
      await GrowthMetricsAnalyzer.saveFunnel(funnel);
      await refreshFunnels();
      console.log('[AnalyticsContext] Generated funnel:', funnel);
    } catch (error) {
      console.error('[AnalyticsContext] Generate funnel report error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshFunnels]);

  const initializeAnalytics = useCallback(async () => {
    console.log('[AnalyticsContext] Initializing analytics...');
    await refreshMetrics();
    await refreshCohorts();
    await refreshFunnels();
  }, [refreshMetrics, refreshCohorts, refreshFunnels]);

  useEffect(() => {
    initializeAnalytics();
    trackEvent('session_start', { sessionId });

    return () => {
      trackEvent('session_end', { sessionId });
    };
  }, [initializeAnalytics, trackEvent, sessionId]);

  const value = useMemo(
    () => ({
      metrics,
      cohorts,
      funnels,
      isLoading,
      lastUpdated,
      trackEvent,
      refreshMetrics,
      refreshCohorts,
      refreshFunnels,
      generateCohortReport,
      generateFunnelReport,
    }),
    [
      metrics,
      cohorts,
      funnels,
      isLoading,
      lastUpdated,
      trackEvent,
      refreshMetrics,
      refreshCohorts,
      refreshFunnels,
      generateCohortReport,
      generateFunnelReport,
    ]
  );

  return value;
});
