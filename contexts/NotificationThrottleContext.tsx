import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useRef } from 'react';
import { NotificationType } from '@/types';

interface ThrottleConfig {
  maxPerMinute: number;
  cooldownMs: number;
}

const THROTTLE_CONFIG: Record<NotificationType, ThrottleConfig> = {
  quest_new: { maxPerMinute: 3, cooldownMs: 20000 },
  quest_accepted: { maxPerMinute: 5, cooldownMs: 10000 },
  quest_completed: { maxPerMinute: 5, cooldownMs: 5000 },
  message_new: { maxPerMinute: 10, cooldownMs: 3000 },
  level_up: { maxPerMinute: 1, cooldownMs: 60000 },
  badge_earned: { maxPerMinute: 2, cooldownMs: 30000 },
  feature_unlocked: { maxPerMinute: 1, cooldownMs: 60000 },
};

interface NotificationRecord {
  type: NotificationType;
  timestamp: number;
  count: number;
}

export const [NotificationThrottleProvider, useNotificationThrottle] = createContextHook(() => {
  const [records, setRecords] = useState<Map<NotificationType, NotificationRecord[]>>(new Map());
  const lastNotificationTime = useRef<Map<NotificationType, number>>(new Map());

  const shouldAllowNotification = useCallback((type: NotificationType): boolean => {
    const now = Date.now();
    const config = THROTTLE_CONFIG[type];
    
    const lastTime = lastNotificationTime.current.get(type) || 0;
    if (now - lastTime < config.cooldownMs) {
      console.log(`🚫 Notification throttled: ${type} (cooldown active)`);
      return false;
    }

    const typeRecords = records.get(type) || [];
    const oneMinuteAgo = now - 60000;
    const recentRecords = typeRecords.filter(r => r.timestamp > oneMinuteAgo);
    
    if (recentRecords.length >= config.maxPerMinute) {
      console.log(`🚫 Notification throttled: ${type} (rate limit exceeded)`);
      return false;
    }

    return true;
  }, [records]);

  const recordNotification = useCallback((type: NotificationType) => {
    const now = Date.now();
    lastNotificationTime.current.set(type, now);

    setRecords(prev => {
      const newRecords = new Map(prev);
      const typeRecords = newRecords.get(type) || [];
      const oneMinuteAgo = now - 60000;
      
      const filteredRecords = typeRecords.filter(r => r.timestamp > oneMinuteAgo);
      filteredRecords.push({ type, timestamp: now, count: 1 });
      
      newRecords.set(type, filteredRecords);
      return newRecords;
    });
  }, []);

  const getThrottleStatus = useCallback((type: NotificationType) => {
    const now = Date.now();
    const config = THROTTLE_CONFIG[type];
    const typeRecords = records.get(type) || [];
    const oneMinuteAgo = now - 60000;
    const recentCount = typeRecords.filter(r => r.timestamp > oneMinuteAgo).length;
    
    const lastTime = lastNotificationTime.current.get(type) || 0;
    const cooldownRemaining = Math.max(0, config.cooldownMs - (now - lastTime));
    
    return {
      allowed: shouldAllowNotification(type),
      recentCount,
      maxPerMinute: config.maxPerMinute,
      cooldownRemaining,
    };
  }, [records, shouldAllowNotification]);

  return useMemo(() => ({
    shouldAllowNotification,
    recordNotification,
    getThrottleStatus,
  }), [shouldAllowNotification, recordNotification, getThrottleStatus]);
});
