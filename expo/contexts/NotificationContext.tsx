import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationType } from '@/types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STORAGE_KEY = 'hustlexp_notifications';

const NOTIFICATION_MESSAGES: Record<NotificationType, { title: string; getMessage: (data?: any) => string }> = {
  quest_new: {
    title: '⚔️ A New Quest Awaits!',
    getMessage: (data) => `${data?.posterName || 'A hero'} has posted "${data?.taskTitle || 'a new quest'}" in your area!`,
  },
  quest_accepted: {
    title: '🎯 Quest Accepted!',
    getMessage: (data) => `${data?.workerName || 'A brave warrior'} has accepted your quest "${data?.taskTitle || 'your quest'}"!`,
  },
  quest_completed: {
    title: '🏆 Quest Completed!',
    getMessage: (data) => `You've completed "${data?.taskTitle || 'the quest'}" and earned ${data?.xpReward || 0} XP!`,
  },
  message_new: {
    title: '💬 New Message',
    getMessage: (data) => `${data?.senderName || 'Someone'} sent you a message about "${data?.taskTitle || 'a quest'}"`,
  },
  level_up: {
    title: '🌟 Level Up!',
    getMessage: (data) => `Congratulations! You've reached Level ${data?.newLevel || 0}! Your legend grows!`,
  },
  badge_earned: {
    title: '🏅 Badge Earned!',
    getMessage: (data) => `You've earned the "${data?.badgeName || 'new'}" badge! Your reputation increases!`,
  },
  feature_unlocked: {
    title: '🎉 New Feature Unlocked!',
    getMessage: (data) => `You've unlocked ${data?.featureName || 'a new feature'}! Tap to explore it now.`,
  },
};

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const throttleMap = useRef<Map<NotificationType, number>>(new Map());
  const THROTTLE_MS = 5000;

  useEffect(() => {
    loadNotifications();
    registerForPushNotifications();

    if (Platform.OS !== 'web') {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('📬 Notification received:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('📬 Notification tapped:', response);
      });
    }

    return () => {
      if (Platform.OS !== 'web') {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async (notifs: Notification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        console.log('Project ID not found');
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = pushTokenData.data;
      setExpoPushToken(token);
      console.log('📱 Push token:', token);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00FFFF',
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const addNotification = useCallback(async (
    userId: string,
    type: NotificationType,
    data?: Record<string, any>
  ) => {
    const now = Date.now();
    const lastTime = throttleMap.current.get(type) || 0;
    
    if (now - lastTime < THROTTLE_MS) {
      console.log(`🚫 Notification throttled: ${type}`);
      return null;
    }
    
    throttleMap.current.set(type, now);
    
    const template = NOTIFICATION_MESSAGES[type];
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      type,
      title: template.title,
      message: template.getMessage(data),
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);

    console.log('📢 Notification:', newNotification.title, '-', newNotification.message);

    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: newNotification.title,
          body: newNotification.message,
          data: newNotification.data,
          sound: true,
        },
        trigger: null,
      });
    }

    return newNotification;
  }, [notifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const markAllAsRead = useCallback(async (userId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const clearNotification = useCallback(async (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const clearAllNotifications = useCallback(async (userId: string) => {
    const updatedNotifications = notifications.filter(n => n.userId !== userId);
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const getUserNotifications = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId);
  }, [notifications]);

  const unreadCount = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }, [notifications]);

  return useMemo(() => ({
    notifications,
    isLoading,
    expoPushToken,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    getUserNotifications,
    unreadCount,
  }), [
    notifications,
    isLoading,
    expoPushToken,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    getUserNotifications,
    unreadCount,
  ]);
});
