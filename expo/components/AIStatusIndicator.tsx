import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { backendHealth, type HealthStatus } from '@/utils/backendHealth';
import COLORS from '@/constants/colors';

export function AIStatusIndicator({ style }: { style?: any }) {
  const [status, setStatus] = useState<HealthStatus>(backendHealth.getStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const unsubscribe = backendHealth.subscribe(setStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (status.status === 'checking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status.status, pulseAnim]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await backendHealth.checkHealth();
    setIsRefreshing(false);
  };

  const getIcon = () => {
    switch (status.status) {
      case 'online':
        return <Wifi size={16} color={COLORS.success} />;
      case 'offline':
        return <WifiOff size={16} color={COLORS.error} />;
      case 'degraded':
        return <AlertTriangle size={16} color={COLORS.warning} />;
      case 'checking':
        return <RefreshCw size={16} color={COLORS.accent} />;
    }
  };

  const getColor = () => {
    switch (status.status) {
      case 'online':
        return COLORS.success;
      case 'offline':
        return COLORS.error;
      case 'degraded':
        return COLORS.warning;
      case 'checking':
        return COLORS.accent;
    }
  };

  return (
    <TouchableOpacity
      onPress={handleRefresh}
      disabled={isRefreshing}
      style={[styles.container, style]}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        {getIcon()}
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: getColor() }]}>
          {status.message}
        </Text>
        {status.latency && (
          <Text style={styles.latencyText}>
            {status.latency}ms
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  latencyText: {
    fontSize: 10,
    color: '#666',
  },
});
