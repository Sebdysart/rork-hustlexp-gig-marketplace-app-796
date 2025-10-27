import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  DollarSign,
  Target,
  MessageCircle,
  BarChart3,
  Zap,
  Trophy,
} from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';
import { useApp } from '@/contexts/AppContext';
import { COLORS } from '@/constants/designTokens';
import * as Haptics from 'expo-haptics';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

export default function AIQuickActions() {
  const pathname = usePathname();
  const router = useRouter();
  const { sendMessage, open } = useUltimateAICoach();
  const { currentUser, availableTasks, myAcceptedTasks } = useApp();
  
  const [visible, setVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const getContextActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    if (!currentUser) return actions;

    switch (pathname) {
      case '/':
      case '/index':
      case '/(tabs)/home':
        actions.push(
          {
            id: 'find-best-matches',
            label: 'Find Perfect Matches',
            icon: <Target color="#FFF" size={20} />,
            description: 'AI finds the best quests for you',
            action: () => {
              open();
              sendMessage('Show me my perfect match quests based on my profile and history');
            },
          },
          {
            id: 'show-nearby',
            label: `Nearby Quests (${availableTasks.length})`,
            icon: <MapPin color="#FFF" size={20} />,
            description: 'View available quests near you',
            action: () => {
              open();
              sendMessage('Show me available quests near my location');
            },
          },
          {
            id: 'earnings-today',
            label: 'Earning Potential',
            icon: <TrendingUp color="#FFF" size={20} />,
            description: 'See how much you can earn today',
            action: () => {
              open();
              sendMessage('What\'s my earning potential for today based on available quests?');
            },
          }
        );
        break;

      case '/(tabs)/tasks':
        actions.push(
          {
            id: 'filter-best',
            label: 'Filter Best Matches',
            icon: <Sparkles color="#FFF" size={20} />,
            description: 'AI-powered quest filtering',
            action: () => {
              open();
              sendMessage('Filter these quests to show me the best matches based on my skills and preferences');
            },
          },
          {
            id: 'optimize-route',
            label: 'Optimize Route',
            icon: <MapPin color="#FFF" size={20} />,
            description: 'Plan the most efficient route',
            action: () => {
              open();
              sendMessage('Help me plan the most efficient route to complete multiple quests today');
            },
          }
        );
        break;

      case '/(tabs)/wallet':
        actions.push(
          {
            id: 'forecast-earnings',
            label: 'Forecast Earnings',
            icon: <BarChart3 color="#FFF" size={20} />,
            description: 'Predict your earnings',
            action: () => {
              open();
              sendMessage('What are my projected earnings for this week and month?');
            },
          },
          {
            id: 'boost-income',
            label: 'Boost My Income',
            icon: <Zap color="#FFF" size={20} />,
            description: 'AI tips to earn more',
            action: () => {
              open();
              sendMessage('How can I increase my earnings? Give me specific actionable tips');
            },
          },
          {
            id: 'spending-insights',
            label: 'Analyze Spending',
            icon: <DollarSign color="#FFF" size={20} />,
            description: 'Get insights on your earnings',
            action: () => {
              open();
              sendMessage('Analyze my earnings pattern and give me insights on peak times and categories');
            },
          }
        );
        break;

      case '/(tabs)/profile':
      case '/(tabs)/profile-max':
        actions.push(
          {
            id: 'performance-analysis',
            label: 'Performance Review',
            icon: <BarChart3 color="#FFF" size={20} />,
            description: 'AI analyzes your performance',
            action: () => {
              open();
              sendMessage('Give me a detailed performance review with strengths, weaknesses, and improvement areas');
            },
          },
          {
            id: 'level-up-tips',
            label: 'Level Up Faster',
            icon: <Trophy color="#FFF" size={20} />,
            description: 'Tips to gain more XP',
            action: () => {
              open();
              sendMessage('What\'s the fastest way for me to level up? Give me specific quest recommendations');
            },
          },
          {
            id: 'badges-progress',
            label: 'Badge Progress',
            icon: <Target color="#FFF" size={20} />,
            description: 'Track badge completion',
            action: () => {
              open();
              sendMessage('Which badges am I closest to earning? How can I unlock them quickly?');
            },
          }
        );
        break;

      case '/(tabs)/quests':
        actions.push(
          {
            id: 'quest-suggestions',
            label: 'Quest Suggestions',
            icon: <Sparkles color="#FFF" size={20} />,
            description: 'AI recommends quests for you',
            action: () => {
              open();
              sendMessage('Recommend daily quests that match my skill level and preferences');
            },
          },
          {
            id: 'fastest-completion',
            label: 'Fastest Path',
            icon: <Zap color="#FFF" size={20} />,
            description: 'Complete quests fastest',
            action: () => {
              open();
              sendMessage('What\'s the fastest way to complete my current quests?');
            },
          }
        );
        break;

      case '/(tabs)/chat':
        actions.push(
          {
            id: 'negotiation-help',
            label: 'Negotiation Tips',
            icon: <MessageCircle color="#FFF" size={20} />,
            description: 'Get help negotiating',
            action: () => {
              open();
              sendMessage('Help me negotiate better rates for quests. What should I say?');
            },
          },
          {
            id: 'reply-suggestions',
            label: 'Smart Replies',
            icon: <Sparkles color="#FFF" size={20} />,
            description: 'AI suggests responses',
            action: () => {
              open();
              sendMessage('Suggest professional responses for my active conversations');
            },
          }
        );
        break;

      default:
        if (pathname.startsWith('/task/')) {
          actions.push(
            {
              id: 'task-analysis',
              label: 'Analyze Quest',
              icon: <BarChart3 color="#FFF" size={20} />,
              description: 'AI analyzes this quest',
              action: () => {
                open();
                sendMessage('Analyze this quest for me. Is it worth it? What should I know?');
              },
            },
            {
              id: 'negotiate-rate',
              label: 'Negotiate Rate',
              icon: <DollarSign color="#FFF" size={20} />,
              description: 'Help negotiate better pay',
              action: () => {
                open();
                sendMessage('Should I negotiate this rate? Give me a professional negotiation script');
              },
            }
          );
        }
        break;
    }

    return actions.slice(0, 3);
  };

  const actions = getContextActions();

  useEffect(() => {
    if (actions.length > 0) {
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [pathname, actions.length]);

  const handleActionPress = (action: QuickAction) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    action.action();
  };

  if (!visible || actions.length === 0) {
    return null;
  }

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

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
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={['rgba(30, 30, 30, 0.95)', 'rgba(18, 18, 18, 0.95)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Sparkles color={COLORS.accent} size={20} />
            <Text style={styles.headerText}>AI Quick Actions</Text>
          </View>

          <View style={styles.actionsGrid}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.7}
              >
                <View style={styles.actionIconContainer}>
                  <LinearGradient
                    colors={['rgba(138, 43, 226, 0.3)', 'rgba(138, 43, 226, 0.1)']}
                    style={styles.iconGradient}
                  >
                    {action.icon}
                  </LinearGradient>
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.select({ ios: 170, android: 160, default: 150 }),
    left: 16,
    right: 16,
    zIndex: 999,
  },
  blur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsGrid: {
    gap: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
