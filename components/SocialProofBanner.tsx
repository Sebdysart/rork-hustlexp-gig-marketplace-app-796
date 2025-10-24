import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TrendingUp, Users, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';

interface SocialProofItem {
  id: string;
  type: 'signup' | 'task_completed' | 'level_up' | 'earning';
  message: string;
  timestamp: number;
}

// Mock names - these stay as names (not translated)
const MOCK_NAMES = ['John', 'Sarah', 'Mike', 'Emma', 'Alex', 'Chris', 'Maria', 'David'];

interface SocialProofBannerProps {
  compact?: boolean;
}

export default function SocialProofBanner({ compact = false }: SocialProofBannerProps) {
  const translations = useTranslatedTexts([
    'just joined', 'completed a task', 'reached Level', 'earned',
    'just now', 'm ago', 'h ago', 'd ago'
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  const getSocialProofItems = (): SocialProofItem[] => [
    { id: '1', type: 'signup', message: `${MOCK_NAMES[0]} ${translations[0] || 'just joined'}`, timestamp: Date.now() - 30000 },
    { id: '2', type: 'task_completed', message: `${MOCK_NAMES[1]} ${translations[1] || 'completed a task'}`, timestamp: Date.now() - 60000 },
    { id: '3', type: 'level_up', message: `${MOCK_NAMES[2]} ${translations[2] || 'reached Level'} 10`, timestamp: Date.now() - 120000 },
    { id: '4', type: 'earning', message: `${MOCK_NAMES[3]} ${translations[3] || 'earned'} $50`, timestamp: Date.now() - 180000 },
    { id: '5', type: 'signup', message: `${MOCK_NAMES[4]} ${translations[0] || 'just joined'}`, timestamp: Date.now() - 240000 },
  ];

  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return translations[4] || 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}${translations[5] || 'm ago'}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}${translations[6] || 'h ago'}`;
    return `${Math.floor(seconds / 86400)}${translations[7] || 'd ago'}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const items = getSocialProofItems();
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [fadeAnim, translations]);

  const currentItem = getSocialProofItems()[currentIndex];

  const getIcon = () => {
    switch (currentItem.type) {
      case 'signup':
        return <Users size={16} color={premiumColors.neonGreen} />;
      case 'task_completed':
        return <Zap size={16} color={premiumColors.neonCyan} />;
      case 'level_up':
        return <TrendingUp size={16} color={premiumColors.neonViolet} />;
      case 'earning':
        return <Text style={styles.earningIcon}>💰</Text>;
      default:
        return <Users size={16} color={premiumColors.neonGreen} />;
    }
  };

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, { opacity: fadeAnim }]}>
        <View style={styles.compactContent}>
          {getIcon()}
          <Text style={styles.compactText} numberOfLines={1}>
            {currentItem.message}
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[premiumColors.glassWhite, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <View style={styles.textContainer}>
            <Text style={styles.message}>{currentItem.message}</Text>
            <Text style={styles.timestamp}>{getTimeAgo(currentItem.timestamp)}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gradient: {
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: premiumColors.richBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  earningIcon: {
    fontSize: 16,
  },
  compactContainer: {
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
});
