import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { ACHIEVEMENTS, getUnlockedAchievements, getLockedAchievements, getAchievementsByCategory, AchievementCategory } from '@/constants/achievements';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Trophy, Zap, Star, Target, Flame } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrophyRoomScreen() {
  const { currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  
  if (!currentUser) return null;

  const unlockedAchievements = getUnlockedAchievements(currentUser);
  const lockedAchievements = getLockedAchievements(currentUser);
  
  const displayAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : getAchievementsByCategory(selectedCategory);

  const categories: { id: AchievementCategory | 'all'; name: string; icon: any }[] = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'speed', name: 'Speed', icon: Zap },
    { id: 'perfection', name: 'Perfect', icon: Star },
    { id: 'specialist', name: 'Specialist', icon: Target },
    { id: 'grind', name: 'Grind', icon: Flame },
    { id: 'legendary', name: 'Legendary', icon: Trophy },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#64748B';
      case 'rare':
        return '#3B82F6';
      case 'epic':
        return '#A855F7';
      case 'legendary':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Trophy Room',
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800' as const },
        }}
      />
      
      <View style={styles.header}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.headerGradient}
        >
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Trophy size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{unlockedAchievements.length}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Lock size={24} color="#64748B" />
              <Text style={styles.statNumber}>{lockedAchievements.length}</Text>
              <Text style={styles.statLabel}>Locked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Star size={24} color="#10B981" />
              <Text style={styles.statNumber}>
                {Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon size={16} color={isSelected ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom }} showsVerticalScrollIndicator={false}>
        {displayAchievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
          return (
            <AchievementCard 
              key={achievement.id}
              achievement={achievement}
              isUnlocked={isUnlocked}
              rarityColor={getRarityColor(achievement.rarity)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

interface AchievementCardProps {
  achievement: typeof ACHIEVEMENTS[0];
  isUnlocked: boolean;
  rarityColor: string;
}

function AchievementCard({ achievement, isUnlocked, rarityColor }: AchievementCardProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isUnlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isUnlocked, shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  return (
    <View style={[styles.achievementCard, !isUnlocked && styles.achievementCardLocked]}>
      {isUnlocked && (
        <Animated.View style={[styles.shimmerEffect, { opacity: shimmerOpacity }]}>
          <LinearGradient
            colors={[rarityColor + '40', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
      
      <View style={styles.achievementIconContainer}>
        {isUnlocked ? (
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        ) : (
          <View style={styles.lockedIcon}>
            <Lock size={24} color="#64748B" />
          </View>
        )}
      </View>

      <View style={styles.achievementContent}>
        <View style={styles.achievementHeader}>
          <Text style={[styles.achievementName, !isUnlocked && styles.textLocked]}>
            {isUnlocked ? achievement.name : '???'}
          </Text>
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
            <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={[styles.achievementDescription, !isUnlocked && styles.textLocked]}>
          {isUnlocked ? achievement.description : 'Complete this achievement to reveal'}
        </Text>

        <View style={styles.achievementFooter}>
          <View style={styles.rarityInfo}>
            <Text style={styles.rarityPercent}>
              {achievement.rarityPercent}% of hustlers
            </Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{achievement.xpBonus} XP</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 16,
  },
  headerGradient: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#7C3AED',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#FFFFFF',
  },
  achievementIcon: {
    fontSize: 36,
  },
  lockedIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#0F172A',
    flex: 1,
  },
  achievementDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },
  textLocked: {
    opacity: 0.5,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityInfo: {
    flex: 1,
  },
  rarityPercent: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic' as const,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  xpBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
