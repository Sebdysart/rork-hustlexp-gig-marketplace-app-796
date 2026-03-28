import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Zap, TrendingUp, Award, Users, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from './GlassCard';

type ActivityType = 'quest_completed' | 'level_up' | 'badge_earned' | 'squad_formed' | 'instant_hire';

interface Activity {
  id: string;
  type: ActivityType;
  userName: string;
  detail: string;
  timestamp: Date;
  xpGained?: number;
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'quest_completed',
    userName: 'Sarah M.',
    detail: 'completed "Office Cleaning"',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    xpGained: 150,
  },
  {
    id: '2',
    type: 'level_up',
    userName: 'Mike T.',
    detail: 'reached Level 25',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '3',
    type: 'instant_hire',
    userName: 'Alex K.',
    detail: 'was instantly hired for "Furniture Assembly"',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: '4',
    type: 'badge_earned',
    userName: 'Emma R.',
    detail: 'earned "Speed Demon" badge',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: '5',
    type: 'squad_formed',
    userName: 'Team Alpha',
    detail: 'formed a new squad',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
];

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'quest_completed':
      return <CheckCircle size={16} color={premiumColors.neonGreen} />;
    case 'level_up':
      return <TrendingUp size={16} color={premiumColors.neonCyan} />;
    case 'badge_earned':
      return <Award size={16} color={premiumColors.neonAmber} />;
    case 'squad_formed':
      return <Users size={16} color={premiumColors.neonViolet} />;
    case 'instant_hire':
      return <Zap size={16} color={premiumColors.neonCyan} />;
  }
}

function getActivityColor(type: ActivityType): string {
  switch (type) {
    case 'quest_completed':
      return premiumColors.neonGreen;
    case 'level_up':
      return premiumColors.neonCyan;
    case 'badge_earned':
      return premiumColors.neonAmber;
    case 'squad_formed':
      return premiumColors.neonViolet;
    case 'instant_hire':
      return premiumColors.neonCyan;
  }
}

function formatTimestamp(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} mins ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan'];
      const lastInitials = ['A', 'B', 'C', 'D'];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)];
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: ['quest_completed', 'level_up', 'badge_earned', 'instant_hire'][Math.floor(Math.random() * 4)] as ActivityType,
        userName: `${firstName} ${lastInitial}.`,
        detail: 'just completed a quest',
        timestamp: new Date(),
        xpGained: Math.floor(Math.random() * 200) + 50,
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 15000);

    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <GlassCard variant="dark" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveDot} />
            <Text style={styles.headerTitle}>Live Activity</Text>
          </View>
          <Text style={styles.headerSubtitle}>Real-time updates</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activitiesContainer}
        >
          {activities.map((activity, index) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIconContainer, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                {getActivityIcon(activity.type)}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText} numberOfLines={2}>
                  <Text style={styles.activityUserName}>{activity.userName} </Text>
                  <Text style={styles.activityDetail}>{activity.detail}</Text>
                </Text>
                <View style={styles.activityFooter}>
                  <Text style={styles.activityTimestamp}>{formatTimestamp(activity.timestamp)}</Text>
                  {activity.xpGained && (
                    <View style={styles.xpBadge}>
                      <Zap size={10} color={premiumColors.neonAmber} />
                      <Text style={styles.xpText}>+{activity.xpGained}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    padding: 16,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: premiumColors.neonGreen,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activitiesContainer: {
    gap: 12,
    paddingRight: 16,
  },
  activityItem: {
    width: 240,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    gap: 6,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityUserName: {
    fontWeight: '700' as const,
    color: Colors.text,
  },
  activityDetail: {
    color: Colors.textSecondary,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTimestamp: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
});
