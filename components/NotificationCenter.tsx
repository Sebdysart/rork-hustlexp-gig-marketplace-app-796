import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationToast from './NotificationToast';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types';

export default function NotificationCenter() {
  const { notifications } = useNotifications();
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [queue, setQueue] = useState<Notification[]>([]);
  const shownNotificationIds = useRef<Set<string>>(new Set());
  const lastNotificationCount = useRef<number>(0);

  useEffect(() => {
    if (notifications.length > lastNotificationCount.current) {
      const newNotifications = notifications.filter(
        n => !shownNotificationIds.current.has(n.id) && !n.read
      );

      if (newNotifications.length > 0) {
        newNotifications.forEach(n => shownNotificationIds.current.add(n.id));
        
        if (!activeNotification) {
          setActiveNotification(newNotifications[0]);
          setQueue(newNotifications.slice(1));
        } else {
          setQueue(prev => [...prev, ...newNotifications]);
        }
      }
    }
    lastNotificationCount.current = notifications.length;
  }, [notifications, activeNotification]);

  const handleDismiss = () => {
    setActiveNotification(null);
    
    if (queue.length > 0) {
      setTimeout(() => {
        setActiveNotification(queue[0]);
        setQueue(queue.slice(1));
      }, 500);
    }
  };

  if (!activeNotification) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <NotificationToast
        notification={activeNotification}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
