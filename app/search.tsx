import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  DollarSign, 
  Zap, 
  MapPin, 
  Calendar, 
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Award,
  Flame,
  Zap as Lightning
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography, borderRadius, premiumColors } from '@/constants/designTokens';
import { useSensory } from '@/hooks/useSensory';
import Confetti from '@/components/Confetti';

type SearchFilter = {
  minPay?: number;
  maxPay?: number;
  minXP?: number;
  category?: string;
  distance?: number;
  status?: 'open' | 'in_progress' | 'completed';
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SearchScreen() {
  const { tasks, users, currentUser } = useApp();
  const { colors: theme } = useTheme();
  const router = useRouter();
  const sensory = useSensory();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'tasks' | 'users'>('tasks');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [smartFilter, setSmartFilter] = useState<'for_me' | 'quick_wins' | 'big_scores' | 'on_route' | 'level_up' | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [newMatches, setNewMatches] = useState<number>(0);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateMatchScore = (task: any): number => {
    if (!currentUser) return 70;

    let score = 70;

    const distance = calculateDistance(
      currentUser.location.lat,
      currentUser.location.lng,
      task.location.lat,
      task.location.lng
    );

    if (distance < 2) score += 15;
    else if (distance < 5) score += 10;
    else if (distance < 10) score += 5;

    if (currentUser.level >= 10) score += 5;
    if (currentUser.reputationScore >= 4.5) score += 5;
    if (currentUser.tasksCompleted >= 10) score += 5;

    return Math.min(100, Math.max(0, score));
  };

  const getSuccessProbability = (task: any): number => {
    if (!currentUser) return 75;

    let probability = 75;

    if (currentUser.tasksCompleted > 50) probability += 10;
    else if (currentUser.tasksCompleted > 20) probability += 5;

    if (currentUser.reputationScore >= 4.5) probability += 10;
    else if (currentUser.reputationScore >= 4.0) probability += 5;

    return Math.min(99, probability);
  };

  const filteredTasks = useMemo(() => {
    let results = tasks.filter(t => t.status === 'open');

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.category.toLowerCase().includes(query)
      );
    }

    if (filters.minPay !== undefined) {
      results = results.filter((task) => task.payAmount >= filters.minPay!);
    }

    if (filters.maxPay !== undefined) {
      results = results.filter((task) => task.payAmount <= filters.maxPay!);
    }

    if (filters.minXP !== undefined) {
      results = results.filter((task) => task.xpReward >= filters.minXP!);
    }

    if (filters.category) {
      results = results.filter((task) => task.category === filters.category);
    }

    if (filters.status) {
      results = results.filter((task) => task.status === filters.status);
    }

    if (smartFilter && currentUser) {
      switch (smartFilter) {
        case 'for_me':
          results = results.sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a));
          break;
        case 'quick_wins':
          results = results.filter(t => {
            const estimatedHours = parseInt(t.estimatedDuration || '2');
            return estimatedHours <= 2;
          }).sort((a, b) => getSuccessProbability(b) - getSuccessProbability(a));
          break;
        case 'big_scores':
          results = results.sort((a, b) => (b.xpReward + b.payAmount) - (a.xpReward + a.payAmount));
          break;
        case 'on_route':
          if (currentUser) {
            results = results
              .map(task => ({
                task,
                distance: calculateDistance(
                  currentUser.location.lat,
                  currentUser.location.lng,
                  task.location.lat,
                  task.location.lng
                )
              }))
              .filter(({ distance }) => distance < 10)
              .sort((a, b) => a.distance - b.distance)
              .map(({ task }) => task);
          }
          break;
        case 'level_up':
          const xpNeededForNextLevel = (currentUser.level * 100) - currentUser.xp;
          results = results.filter(t => t.xpReward >= xpNeededForNextLevel * 0.2)
            .sort((a, b) => b.xpReward - a.xpReward);
          break;
      }
    } else {
      results = results.sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a));
    }

    return results;
  }, [tasks, searchQuery, filters, smartFilter, currentUser]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return Array.from(cats);
  }, [tasks]);

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || smartFilter !== null;

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * 5);
      if (random === 0) {
        setNewMatches(prev => prev + 1);
        sensory.notification();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleTaskPress = (task: any, matchScore: number) => {
    sensory.tap();
    
    if (matchScore >= 90) {
      setShowConfetti(true);
      sensory.achievement();
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    router.push(`/task/${task.id}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {showConfetti && <Confetti count={60} duration={3000} />}

      <View style={styles.headerContainer}>
        <View style={styles.heroSection}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Find Quests</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>AI-matched opportunities just for you</Text>
          {currentUser && currentUser.level < 13 && (
            <View style={styles.levelProgressContainer}>
              <View style={styles.miniXPBar}>
                <View 
                  style={[
                    styles.miniXPFill, 
                    { 
                      width: `${(currentUser.xp % 100)}%`,
                      backgroundColor: premiumColors.neonViolet 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.levelProgressText, { color: theme.textSecondary }]}>
                Complete 2 more tasks to reach Level {currentUser.level + 1}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
            <Search size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={`Search ${searchType}...`}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: hasActiveFilters ? theme.primary : theme.card }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={20} color={hasActiveFilters ? '#FFFFFF' : theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {newMatches > 0 && (
        <TouchableOpacity 
          style={[styles.liveActivityBanner, { backgroundColor: premiumColors.neonCyan + '20' }]}
          onPress={() => {
            setNewMatches(0);
            sensory.tap();
          }}
        >
          <Lightning size={16} color={premiumColors.neonCyan} />
          <Text style={[styles.liveActivityText, { color: premiumColors.neonCyan }]}>
            {newMatches} new perfect {newMatches === 1 ? 'match' : 'matches'} found while you were searching
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.smartFilters}
        contentContainerStyle={styles.smartFiltersContent}
      >
        <TouchableOpacity
          style={[
            styles.smartFilterChip,
            smartFilter === 'for_me' && styles.smartFilterChipActive,
            { 
              backgroundColor: smartFilter === 'for_me' ? premiumColors.neonViolet + '30' : theme.card,
              borderColor: smartFilter === 'for_me' ? premiumColors.neonViolet : theme.border 
            }
          ]}
          onPress={() => {
            setSmartFilter(smartFilter === 'for_me' ? null : 'for_me');
            sensory.tap();
          }}
        >
          <Target size={16} color={smartFilter === 'for_me' ? premiumColors.neonViolet : theme.text} />
          <Text style={[
            styles.smartFilterText, 
            { color: smartFilter === 'for_me' ? premiumColors.neonViolet : theme.text }
          ]}>For Me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.smartFilterChip,
            smartFilter === 'quick_wins' && styles.smartFilterChipActive,
            { 
              backgroundColor: smartFilter === 'quick_wins' ? premiumColors.neonGreen + '30' : theme.card,
              borderColor: smartFilter === 'quick_wins' ? premiumColors.neonGreen : theme.border 
            }
          ]}
          onPress={() => {
            setSmartFilter(smartFilter === 'quick_wins' ? null : 'quick_wins');
            sensory.tap();
          }}
        >
          <Clock size={16} color={smartFilter === 'quick_wins' ? premiumColors.neonGreen : theme.text} />
          <Text style={[
            styles.smartFilterText, 
            { color: smartFilter === 'quick_wins' ? premiumColors.neonGreen : theme.text }
          ]}>Quick Wins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.smartFilterChip,
            smartFilter === 'big_scores' && styles.smartFilterChipActive,
            { 
              backgroundColor: smartFilter === 'big_scores' ? premiumColors.neonAmber + '30' : theme.card,
              borderColor: smartFilter === 'big_scores' ? premiumColors.neonAmber : theme.border 
            }
          ]}
          onPress={() => {
            setSmartFilter(smartFilter === 'big_scores' ? null : 'big_scores');
            sensory.tap();
          }}
        >
          <TrendingUp size={16} color={smartFilter === 'big_scores' ? premiumColors.neonAmber : theme.text} />
          <Text style={[
            styles.smartFilterText, 
            { color: smartFilter === 'big_scores' ? premiumColors.neonAmber : theme.text }
          ]}>Big Scores</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.smartFilterChip,
            smartFilter === 'on_route' && styles.smartFilterChipActive,
            { 
              backgroundColor: smartFilter === 'on_route' ? premiumColors.neonCyan + '30' : theme.card,
              borderColor: smartFilter === 'on_route' ? premiumColors.neonCyan : theme.border 
            }
          ]}
          onPress={() => {
            setSmartFilter(smartFilter === 'on_route' ? null : 'on_route');
            sensory.tap();
          }}
        >
          <MapPin size={16} color={smartFilter === 'on_route' ? premiumColors.neonCyan : theme.text} />
          <Text style={[
            styles.smartFilterText, 
            { color: smartFilter === 'on_route' ? premiumColors.neonCyan : theme.text }
          ]}>On My Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.smartFilterChip,
            smartFilter === 'level_up' && styles.smartFilterChipActive,
            { 
              backgroundColor: smartFilter === 'level_up' ? premiumColors.neonMagenta + '30' : theme.card,
              borderColor: smartFilter === 'level_up' ? premiumColors.neonMagenta : theme.border 
            }
          ]}
          onPress={() => {
            setSmartFilter(smartFilter === 'level_up' ? null : 'level_up');
            sensory.tap();
          }}
        >
          <Award size={16} color={smartFilter === 'level_up' ? premiumColors.neonMagenta : theme.text} />
          <Text style={[
            styles.smartFilterText, 
            { color: smartFilter === 'level_up' ? premiumColors.neonMagenta : theme.text }
          ]}>Level Up</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            searchType === 'tasks' && [styles.activeTab, { borderBottomColor: theme.primary }],
          ]}
          onPress={() => setSearchType('tasks')}
        >
          <Text
            style={[
              styles.tabText,
              { color: searchType === 'tasks' ? theme.primary : theme.textSecondary },
            ]}
          >
            Quests ({filteredTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            searchType === 'users' && [styles.activeTab, { borderBottomColor: theme.primary }],
          ]}
          onPress={() => setSearchType('users')}
        >
          <Text
            style={[
              styles.tabText,
              { color: searchType === 'users' ? theme.primary : theme.textSecondary },
            ]}
          >
            Hustlers ({filteredUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && searchType === 'tasks' && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Filters</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.clearButton, { color: theme.primary }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Min Pay</Text>
              <View style={[styles.filterInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <DollarSign size={16} color={theme.textSecondary} />
                <TextInput
                  style={[styles.filterInputText, { color: theme.text }]}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={filters.minPay?.toString() || ''}
                  onChangeText={(text) => setFilters({ ...filters, minPay: text ? parseFloat(text) : undefined })}
                />
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Max Pay</Text>
              <View style={[styles.filterInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <DollarSign size={16} color={theme.textSecondary} />
                <TextInput
                  style={[styles.filterInputText, { color: theme.text }]}
                  placeholder="1000"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={filters.maxPay?.toString() || ''}
                  onChangeText={(text) => setFilters({ ...filters, maxPay: text ? parseFloat(text) : undefined })}
                />
              </View>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Min XP</Text>
            <View style={[styles.filterInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Zap size={16} color={theme.textSecondary} />
              <TextInput
                style={[styles.filterInputText, { color: theme.text }]}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={filters.minXP?.toString() || ''}
                onChangeText={(text) => setFilters({ ...filters, minXP: text ? parseFloat(text) : undefined })}
              />
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { backgroundColor: !filters.category ? theme.primary : theme.background, borderColor: theme.border },
                ]}
                onPress={() => setFilters({ ...filters, category: undefined })}
              >
                <Text style={[styles.categoryChipText, { color: !filters.category ? '#FFFFFF' : theme.text }]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: filters.category === cat ? theme.primary : theme.background, borderColor: theme.border },
                  ]}
                  onPress={() => setFilters({ ...filters, category: cat })}
                >
                  <Text style={[styles.categoryChipText, { color: filters.category === cat ? '#FFFFFF' : theme.text }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Status</Text>
            <View style={styles.statusRow}>
              {(['open', 'in_progress', 'completed'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusChip,
                    { backgroundColor: filters.status === status ? theme.primary : theme.background, borderColor: theme.border },
                  ]}
                  onPress={() => setFilters({ ...filters, status: filters.status === status ? undefined : status })}
                >
                  <Text style={[styles.statusChipText, { color: filters.status === status ? '#FFFFFF' : theme.text }]}>
                    {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        {searchType === 'tasks' ? (
          filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const matchScore = calculateMatchScore(task);
              const successProbability = getSuccessProbability(task);
              const distance = currentUser ? calculateDistance(
                currentUser.location.lat,
                currentUser.location.lng,
                task.location.lat,
                task.location.lng
              ) : 0;

              return (
                <EnhancedTaskCard 
                  key={task.id} 
                  task={task} 
                  matchScore={matchScore}
                  successProbability={successProbability}
                  distance={distance}
                  currentStreak={currentUser?.streaks.current || 0}
                  onPress={() => handleTaskPress(task, matchScore)} 
                  theme={theme} 
                />
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.card }]}>
                <Search size={48} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No quests found</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery || hasActiveFilters ? "Here's what you CAN do:" : 'Start searching for quests'}
              </Text>
              {(searchQuery || hasActiveFilters) && currentUser && (
                <TouchableOpacity 
                  style={[styles.aiCoachButton, { backgroundColor: premiumColors.neonViolet + '20', borderColor: premiumColors.neonViolet }]}
                  onPress={() => {
                    sensory.tap();
                    router.push('/ai-coach');
                  }}
                >
                  <Sparkles size={20} color={premiumColors.neonViolet} />
                  <Text style={[styles.aiCoachText, { color: premiumColors.neonViolet }]}>Get AI Recommendations</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        ) : (
          filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(`/user/${user.id}`)}
              >
                <LinearGradient
                  colors={['rgba(0, 255, 255, 0.1)', 'rgba(255, 0, 168, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.userGradient}
                />
                <View style={styles.userInfo}>
                  <View style={[styles.userAvatar, { borderColor: theme.primary }]}>
                    <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                    <Text style={[styles.userBio, { color: theme.textSecondary }]} numberOfLines={1}>
                      {user.bio}
                    </Text>
                    <View style={styles.userStats}>
                      <View style={styles.userStat}>
                        <Zap size={14} color={theme.primary} />
                        <Text style={[styles.userStatText, { color: theme.textSecondary }]}>
                          Lvl {user.level}
                        </Text>
                      </View>
                      <View style={styles.userStat}>
                        <Text style={[styles.userStatText, { color: theme.textSecondary }]}>
                          ⭐ {user.reputationScore.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.card }]}>
                <Search size={48} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No hustlers found</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery ? 'Try a different search term' : 'Start searching for hustlers'}
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface EnhancedTaskCardProps {
  task: any;
  matchScore: number;
  successProbability: number;
  distance: number;
  currentStreak: number;
  onPress: () => void;
  theme: any;
}

function EnhancedTaskCard({ 
  task, 
  matchScore, 
  successProbability, 
  distance, 
  currentStreak,
  onPress, 
  theme 
}: EnhancedTaskCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getMatchColor = (): string => {
    if (matchScore >= 90) return premiumColors.neonMagenta;
    if (matchScore >= 80) return premiumColors.neonAmber;
    if (matchScore >= 70) return premiumColors.neonCyan;
    return premiumColors.glassWhite;
  };

  const getMatchLabel = (): string => {
    if (matchScore >= 90) return 'Perfect Match';
    if (matchScore >= 80) return 'Excellent Match';
    if (matchScore >= 70) return 'Good Match';
    return 'Available';
  };

  const matchColor = getMatchColor();
  const matchLabel = getMatchLabel();
  const commission = task.payAmount * 0.125;
  const netEarnings = task.payAmount - commission;

  const isUrgent = task.urgency === 'today' || task.urgency === '48h';
  const hasSpeedBonus = parseInt(task.estimatedDuration || '2') <= 2;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (matchScore >= 90) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [matchScore]);
  const daysUntilDue = task.dateTime
    ? Math.ceil((new Date(task.dateTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 7;

  const getLocationText = (location: any): string => {
    if (!location) return 'Remote';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      if (location.address) return String(location.address);
      if (location.city) return String(location.city);
      return 'Location';
    }
    return 'Remote';
  };

  return (
    <Animated.View style={{ transform: [{ scale: matchScore >= 90 ? pulseAnim : 1 }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.taskCard, 
          { 
            backgroundColor: theme.card, 
            borderColor: matchColor,
            borderWidth: matchScore >= 80 ? 2 : 1,
            shadowColor: matchColor,
            shadowOpacity: matchScore >= 90 ? 0.5 : 0.2,
          }
        ]}
      >
        <LinearGradient
          colors={[
            matchColor + (matchScore >= 90 ? '30' : '15'),
            matchColor + '10',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.taskGradient}
        />

        <View style={[styles.matchBadge, { backgroundColor: matchColor + '20' }]}>
          {matchScore >= 90 && <Sparkles size={12} color={matchColor} />}
          <Text style={[styles.matchBadgeText, { color: matchColor }]}>
            {matchLabel} • {matchScore}%
          </Text>
        </View>

        {isUrgent && (
          <View style={[styles.urgentBadge, { backgroundColor: premiumColors.neonOrange + '20' }]}>
            <Flame size={12} color={premiumColors.neonOrange} />
            <Text style={[styles.urgentText, { color: premiumColors.neonOrange }]}>URGENT - 2X XP</Text>
          </View>
        )}

      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View style={[styles.taskIconContainer, { backgroundColor: premiumColors.glassWhite }]}>
            <Sparkles size={20} color={premiumColors.neonCyan} />
          </View>
          <View style={styles.taskHeaderInfo}>
            <Text style={[styles.taskTitle, { color: theme.text }]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={[styles.taskDescription, { color: theme.textSecondary }]} numberOfLines={2}>
              {task.description}
            </Text>
          </View>
        </View>

        <View style={styles.aiInsights}>
          <View style={styles.insightRow}>
            <View style={[styles.insightBadge, { backgroundColor: premiumColors.neonGreen + '20' }]}>
              <Target size={12} color={premiumColors.neonGreen} />
              <Text style={[styles.insightText, { color: premiumColors.neonGreen }]}>
                {successProbability}% success rate for you
              </Text>
            </View>
          </View>
          {hasSpeedBonus && (
            <View style={styles.insightRow}>
              <View style={[styles.insightBadge, { backgroundColor: premiumColors.neonAmber + '20' }]}>
                <Lightning size={12} color={premiumColors.neonAmber} />
                <Text style={[styles.insightText, { color: premiumColors.neonAmber }]}>
                  Complete in under 2hrs = +50 XP bonus
                </Text>
              </View>
            </View>
          )}
          {currentStreak >= 5 && (
            <View style={styles.insightRow}>
              <View style={[styles.insightBadge, { backgroundColor: premiumColors.neonMagenta + '20' }]}>
                <Flame size={12} color={premiumColors.neonMagenta} />
                <Text style={[styles.insightText, { color: premiumColors.neonMagenta }]}>
                  Complete this to extend your {currentStreak}-day streak!
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.taskMeta}>
          <View style={styles.taskMetaRow}>
            <View style={styles.taskMetaItem}>
              <MapPin size={14} color={theme.textSecondary} />
              <Text style={[styles.taskMetaText, { color: theme.textSecondary }]} numberOfLines={1}>
                {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)} mi`} away • On your route home
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.taskFooter}>
          <View style={styles.rewardColumn}>
            <Text style={[styles.netEarningsLabel, { color: theme.textSecondary }]}>You&apos;ll pocket</Text>
            <View style={[styles.taskPriceTag, { backgroundColor: premiumColors.neonGreen + '20' }]}>
              <DollarSign size={18} color={premiumColors.neonGreen} />
              <Text style={[styles.taskPrice, { color: premiumColors.neonGreen }]}>
                ${netEarnings.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={[styles.taskXPTag, { backgroundColor: premiumColors.neonAmber + '20' }]}>
            <Zap size={16} color={premiumColors.neonAmber} />
            <Text style={[styles.taskXP, { color: premiumColors.neonAmber }]}>
              {task.xpReward}{hasSpeedBonus ? '+50' : ''} XP
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.instantMatchButton, { backgroundColor: matchScore >= 90 ? matchColor : premiumColors.neonViolet }]}
            onPress={(e) => {
              e.stopPropagation();
              onPress();
            }}
          >
            <Text style={styles.instantMatchText}>Instant Match</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  liveActivityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan,
  },
  liveActivityText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  levelProgressContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  miniXPBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  miniXPFill: {
    height: '100%',
  },
  levelProgressText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  smartFilters: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  smartFiltersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  smartFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  smartFilterChipActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  smartFilterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  matchBadge: {
    position: 'absolute' as const,
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    zIndex: 10,
  },
  matchBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  urgentBadge: {
    position: 'absolute' as const,
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    zIndex: 10,
  },
  urgentText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  aiInsights: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  insightText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  rewardColumn: {
    gap: 4,
  },
  netEarningsLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  instantMatchButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantMatchText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  aiCoachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  aiCoachText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  heroSection: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  filterButton: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    position: 'relative' as const,
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  filterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  filterInputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  results: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.lg,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    textAlign: 'center' as const,
    maxWidth: 280,
  },
  taskCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  taskGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  taskContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  taskDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.sm * 1.4,
  },
  taskMeta: {
    gap: spacing.sm,
  },
  taskMetaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  taskPriceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  taskPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  taskXPTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  taskXP: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  userCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  userGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  userInfo: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#00FFFF',
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  userBio: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  userStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userStatText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
