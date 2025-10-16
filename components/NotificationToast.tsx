import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Bell, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Notification } from '@/types';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
  duration?: number;
}

export default function NotificationToast({
  notification,
  onDismiss,
  duration = 5000,
}: NotificationToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const dismiss = useCallback(() => {
    if (!isMountedRef.current) return;
    
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (isMountedRef.current) {
        onDismiss();
      }
    });
  }, [translateY, opacity, onDismiss]);

  const iconColor = useMemo(() => {
    switch (notification.type) {
      case 'quest_new':
        return '#3B82F6';
      case 'quest_accepted':
        return '#10B981';
      case 'quest_completed':
        return '#F59E0B';
      case 'message_new':
        return '#8B5CF6';
      case 'level_up':
        return '#F59E0B';
      case 'badge_earned':
        return '#EC4899';
      default:
        return Colors.accent;
    }
  }, [notification.type]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const timer = requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      dismissTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          dismiss();
        }
      }, duration) as unknown as NodeJS.Timeout;
    });

    return () => {
      cancelAnimationFrame(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={dismiss}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Bell size={20} color={Colors.background} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={dismiss}>
          <X size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});
