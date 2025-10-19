import { hustleAI } from './hustleAI';

export interface NotificationPreference {
  category: string;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  minPayAmount: number;
  maxDistance: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}

export interface SmartNotification {
  id: string;
  type: 'task_match' | 'price_drop' | 'bundle_opportunity' | 'streak_reminder' | 'earnings_forecast';
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  taskId?: string;
  bundleIds?: string[];
  aiReasoning: string;
  confidence: number;
  scheduledFor?: Date;
}

export interface NotificationLearning {
  userId: string;
  notificationId: string;
  opened: boolean;
  actionTaken: boolean;
  timeToOpen?: number;
  timeToAction?: number;
  dismissed: boolean;
}

class AISmartNotifications {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_HUSTLEAI_URL || 
      'https://35e59b08-e7a7-448e-ae3a-4ff316aab102-00-31edtpdmpi4hm.picard.replit.dev/api';
  }

  async getSmartNotifications(userId: string): Promise<SmartNotification[]> {
    try {
      console.log('[AISmartNotifications] Fetching smart notifications for:', userId);
      
      const response = await hustleAI.chat(userId, JSON.stringify({
        action: 'get_smart_notifications',
        userId,
        context: {
          currentTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      }));

      if (response && typeof response === 'object' && 'notifications' in response) {
        const notifications = (response as any).notifications as SmartNotification[];
        console.log('[AISmartNotifications] Received notifications:', notifications.length);
        return notifications;
      }

      return this.getFallbackNotifications(userId);
    } catch (error) {
      console.error('[AISmartNotifications] Error fetching notifications:', error);
      return this.getFallbackNotifications(userId);
    }
  }

  async shouldNotifyUser(
    userId: string,
    notificationType: SmartNotification['type'],
    context: Record<string, any>
  ): Promise<{ shouldNotify: boolean; reasoning: string; confidence: number }> {
    try {
      console.log('[AISmartNotifications] Checking if should notify:', { userId, notificationType });

      const response = await hustleAI.chat(userId, JSON.stringify({
        action: 'should_notify',
        userId,
        notificationType,
        context: {
          ...context,
          currentTime: new Date().toISOString(),
          dayOfWeek: new Date().getDay(),
          hour: new Date().getHours(),
        }
      }));

      if (response && typeof response === 'object') {
        const result = response as any;
        return {
          shouldNotify: result.shouldNotify ?? true,
          reasoning: result.reasoning ?? 'Based on user preferences',
          confidence: result.confidence ?? 0.7,
        };
      }

      return {
        shouldNotify: true,
        reasoning: 'Default notification policy',
        confidence: 0.5,
      };
    } catch (error) {
      console.error('[AISmartNotifications] Error checking notification:', error);
      return {
        shouldNotify: true,
        reasoning: 'Fallback - notification check failed',
        confidence: 0.3,
      };
    }
  }

  async submitNotificationFeedback(learning: NotificationLearning): Promise<void> {
    try {
      console.log('[AISmartNotifications] Submitting feedback:', learning);

      await fetch(`${this.baseURL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: learning.userId,
          feedbackType: 'notification',
          notificationId: learning.notificationId,
          opened: learning.opened,
          actionTaken: learning.actionTaken,
          timeToOpen: learning.timeToOpen,
          timeToAction: learning.timeToAction,
          dismissed: learning.dismissed,
          timestamp: new Date().toISOString(),
        }),
      });

      console.log('[AISmartNotifications] Feedback submitted successfully');
    } catch (error) {
      console.error('[AISmartNotifications] Error submitting feedback:', error);
    }
  }

  async getOptimalNotificationTime(
    userId: string,
    notificationType: SmartNotification['type']
  ): Promise<{ hour: number; dayOfWeek: number; confidence: number }> {
    try {
      console.log('[AISmartNotifications] Getting optimal time:', { userId, notificationType });

      const response = await hustleAI.chat(userId, JSON.stringify({
        action: 'optimal_notification_time',
        userId,
        notificationType,
      }));

      if (response && typeof response === 'object') {
        const result = response as any;
        return {
          hour: result.hour ?? 10,
          dayOfWeek: result.dayOfWeek ?? 1,
          confidence: result.confidence ?? 0.6,
        };
      }

      return { hour: 10, dayOfWeek: 1, confidence: 0.5 };
    } catch (error) {
      console.error('[AISmartNotifications] Error getting optimal time:', error);
      return { hour: 10, dayOfWeek: 1, confidence: 0.3 };
    }
  }

  async getBundleOpportunityNotification(
    userId: string,
    taskIds: string[]
  ): Promise<SmartNotification | null> {
    try {
      console.log('[AISmartNotifications] Checking bundle opportunity:', { userId, taskIds });

      const response = await hustleAI.chat(userId, JSON.stringify({
        action: 'bundle_opportunity',
        userId,
        taskIds,
      }));

      if (response && typeof response === 'object') {
        const result = response as any;
        if (result.hasBundleOpportunity) {
          return {
            id: `bundle_${Date.now()}`,
            type: 'bundle_opportunity',
            title: result.title || 'Bundle Multiple Tasks',
            body: result.body || 'Complete multiple nearby tasks and earn more!',
            priority: 'high',
            bundleIds: taskIds,
            aiReasoning: result.reasoning || 'Tasks are nearby and can be completed efficiently',
            confidence: result.confidence || 0.75,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('[AISmartNotifications] Error checking bundle:', error);
      return null;
    }
  }

  async getEarningsForecastNotification(
    userId: string
  ): Promise<SmartNotification | null> {
    try {
      console.log('[AISmartNotifications] Getting earnings forecast:', userId);

      const response = await hustleAI.chat(userId, JSON.stringify({
        action: 'earnings_forecast',
        userId,
        period: 'week',
      }));

      if (response && typeof response === 'object') {
        const result = response as any;
        if (result.hasForecast) {
          return {
            id: `forecast_${Date.now()}`,
            type: 'earnings_forecast',
            title: result.title || 'This Week\'s Earning Potential',
            body: result.body || `You could earn $${result.estimatedEarnings} this week`,
            priority: 'medium',
            aiReasoning: result.reasoning || 'Based on your activity patterns and available tasks',
            confidence: result.confidence || 0.7,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('[AISmartNotifications] Error getting forecast:', error);
      return null;
    }
  }

  private getFallbackNotifications(userId: string): SmartNotification[] {
    const now = new Date();
    const hour = now.getHours();

    const fallbacks: SmartNotification[] = [];

    if (hour >= 9 && hour <= 11) {
      fallbacks.push({
        id: `fallback_morning_${Date.now()}`,
        type: 'task_match',
        title: 'Good Morning!',
        body: 'New tasks are waiting for you',
        priority: 'medium',
        aiReasoning: 'Morning notification based on typical user activity',
        confidence: 0.5,
      });
    }

    return fallbacks;
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreference[]
  ): Promise<void> {
    try {
      console.log('[AISmartNotifications] Updating preferences:', { userId, preferences });

      await fetch(`${this.baseURL}/users/${userId}/notification-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      console.log('[AISmartNotifications] Preferences updated');
    } catch (error) {
      console.error('[AISmartNotifications] Error updating preferences:', error);
    }
  }
}

export const aiSmartNotifications = new AISmartNotifications();
