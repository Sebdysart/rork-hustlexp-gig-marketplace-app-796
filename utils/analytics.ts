import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = 'hustlexp_analytics';

export type AnalyticsEvent = {
  type: 'share' | 'level_up' | 'quest_complete' | 'badge_unlock' | 'referral_click' | 'page_view';
  timestamp: number;
  data: Record<string, any>;
};

export class Analytics {
  static async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      const fullEvent: AnalyticsEvent = {
        ...event,
        timestamp: Date.now(),
      };

      const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
      const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
      
      events.push(fullEvent);

      const maxEvents = 1000;
      if (events.length > maxEvents) {
        events.splice(0, events.length - maxEvents);
      }

      await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
      console.log('[Analytics] Event tracked:', event.type, event.data);
    } catch (error) {
      console.error('[Analytics] Track error:', error);
    }
  }

  static async getEvents(
    type?: AnalyticsEvent['type'],
    startTime?: number,
    endTime?: number
  ): Promise<AnalyticsEvent[]> {
    try {
      const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
      let events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];

      if (type) {
        events = events.filter(e => e.type === type);
      }

      if (startTime) {
        events = events.filter(e => e.timestamp >= startTime);
      }

      if (endTime) {
        events = events.filter(e => e.timestamp <= endTime);
      }

      return events;
    } catch (error) {
      console.error('[Analytics] Get events error:', error);
      return [];
    }
  }

  static async getShareStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    last7Days: number;
    last30Days: number;
  }> {
    const events = await this.getEvents('share');
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const byType: Record<string, number> = {};
    let last7Days = 0;
    let last30Days = 0;

    events.forEach(event => {
      const shareType = event.data.contentType || 'unknown';
      byType[shareType] = (byType[shareType] || 0) + 1;

      if (event.timestamp >= sevenDaysAgo) last7Days++;
      if (event.timestamp >= thirtyDaysAgo) last30Days++;
    });

    return {
      total: events.length,
      byType,
      last7Days,
      last30Days,
    };
  }

  static async getViralScore(): Promise<number> {
    const shareStats = await this.getShareStats();
    const referralEvents = await this.getEvents('referral_click');
    
    const shareScore = shareStats.last7Days * 10;
    const referralScore = referralEvents.length * 25;
    const consistencyBonus = shareStats.last30Days > 10 ? 50 : 0;

    return Math.min(shareScore + referralScore + consistencyBonus, 1000);
  }

  static async clearAnalytics(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ANALYTICS_KEY);
      console.log('[Analytics] Cleared all analytics data');
    } catch (error) {
      console.error('[Analytics] Clear error:', error);
    }
  }
}
