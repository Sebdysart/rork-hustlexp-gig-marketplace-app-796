import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = 'hustlexp_analytics';

export type AnalyticsEventType =
  | 'app_open'
  | 'app_close'
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'onboarding_skip'
  | 'task_viewed'
  | 'task_accepted'
  | 'task_started'
  | 'task_completed'
  | 'task_posted'
  | 'task_cancelled'
  | 'task_search'
  | 'first_task_completed'
  | 'share'
  | 'level_up'
  | 'quest_complete'
  | 'quest_accepted'
  | 'badge_unlock'
  | 'trophy_earned'
  | 'referral_click'
  | 'referral_signup'
  | 'page_view'
  | 'screen_view'
  | 'button_click'
  | 'feature_used'
  | 'powerup_purchased'
  | 'powerup_activated'
  | 'squad_joined'
  | 'squad_created'
  | 'offer_created'
  | 'offer_viewed'
  | 'chat_opened'
  | 'chat_message_sent'
  | 'mode_switched'
  | 'role_changed'
  | 'settings_changed'
  | 'notification_received'
  | 'notification_clicked'
  | 'push_permission_granted'
  | 'push_permission_denied'
  | 'error_occurred'
  | 'session_start'
  | 'session_end';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

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

  static async getAllEvents(): Promise<AnalyticsEvent[]> {
    try {
      const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Analytics] Get all events error:', error);
      return [];
    }
  }

  static async getEventCount(type: AnalyticsEventType): Promise<number> {
    const events = await this.getEvents(type);
    return events.length;
  }

  static async getUniqueUsers(startTime?: number, endTime?: number): Promise<string[]> {
    const events = await this.getEvents(undefined, startTime, endTime);
    const uniqueUsers = new Set<string>();
    events.forEach(event => {
      if (event.userId) uniqueUsers.add(event.userId);
    });
    return Array.from(uniqueUsers);
  }

  static async getDailyActiveUsers(days: number = 7): Promise<number[]> {
    const now = Date.now();
    const dailyCounts: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const users = await this.getUniqueUsers(dayStart, dayEnd);
      dailyCounts.push(users.length);
    }

    return dailyCounts;
  }

  static async getEventsByDay(type: AnalyticsEventType, days: number = 7): Promise<number[]> {
    const now = Date.now();
    const dailyCounts: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const events = await this.getEvents(type, dayStart, dayEnd);
      dailyCounts.push(events.length);
    }

    return dailyCounts;
  }
}
