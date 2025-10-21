import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, PanResponder, Modal } from 'react-native';
import { useState, useRef, useMemo, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, MapPin, Clock, DollarSign, TrendingUp, Filter, Sparkles, Target, CheckCircle, X, ChevronRight, Flame, Star } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { Task, TaskCategory } from '@/types';
import { suggestTaskBundles, type TaskBundle } from '@/utils/aiTaskBundling';
import { Alert } from 'react-native';
import { TaskCardSkeleton, StatCardSkeleton } from '@/components/SkeletonLoader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;
const SAFE_SCREEN_WIDTH = SCREEN_WIDTH || 375;

type FilterType = 'all' | 'nearby' | 'high_pay' | 'quick' | 'urgent';
type SortType = 'ai' | 'distance' | 'pay' | 'xp';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getCategoryIcon(category: TaskCategory): string {
  const icons: Partial<Record<TaskCategory, string>> = {
    cleaning: '🧹',
    errands: '🏃',
    delivery: '📦',
    moving: '🚚',
    handyman: '🔧',
    tech: '💻',
    creative: '🎨',
    other: '⚡',
    home_repair: '🔨',
    babysitting: '👶',
    pet_care: '🐕',
    tutoring: '📚',
    nursing: '⚕️',
    virtual: '💻',
    ai_automation: '🤖',
  };
  return icons[category] || '⚡';
}

function SwipeableTaskCard({ task, onSwipeLeft, onSwipeRight, distance, poster }: {
  task: Task;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  distance: number;
  poster?: { name: string; profilePic: string; reputationScore: number };
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [swiping, setSwiping] = useState<boolean>(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSwiping(true);
        triggerHaptic('light');
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        setSwiping(false);
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(pan, {
            toValue: { x: SAFE_SCREEN_WIDTH, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            triggerHaptic('success');
            onSwipeRight();
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.spring(pan, {
            toValue: { x: -SAFE_SCREEN_WIDTH, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            triggerHaptic('medium');
            onSwipeLeft();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-SAFE_SCREEN_WIDTH / 2, 0, SAFE_SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const opacity = pan.x.interpolate({
    inputRange: [-SAFE_SCREEN_WIDTH, 0, SAFE_SCREEN_WIDTH],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.swipeCard,
        {
          transform: [{ translateX: pan.x }, { rotate }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.taskCard}>
        <LinearGradient
          colors={[premiumColors.neonViolet + '15', premiumColors.neonCyan + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.taskGradient}
        >
          <View style={styles.taskHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(task.category)}</Text>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
            {task.urgency === 'today' && (
              <View style={styles.urgentBadge}>
                <Flame size={14} color={premiumColors.neonAmber} />
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>

          {poster && (
            <View style={styles.posterInfo}>
              <View style={styles.posterAvatar}>
                <Text style={styles.posterInitial}>{poster.name[0]}</Text>
              </View>
              <View style={styles.posterDetails}>
                <Text style={styles.posterName}>{poster.name}</Text>
                <View style={styles.posterRating}>
                  <Star size={12} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                  <Text style={styles.posterScore}>{poster.reputationScore.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.taskStats}>
            <View style={styles.statItem}>
              <DollarSign size={18} color={premiumColors.neonCyan} />
              <Text style={styles.statValue}>${task.payAmount}</Text>
            </View>
            <View style={styles.statItem}>
              <Zap size={18} color={premiumColors.neonAmber} />
              <Text style={styles.statValue}>+{task.xpReward} Grit</Text>
            </View>
            <View style={styles.statItem}>
              <MapPin size={18} color={premiumColors.neonViolet} />
              <Text style={styles.statValue}>{distance.toFixed(1)} mi</Text>
            </View>
          </View>

          <View style={styles.taskFooter}>
            <View style={styles.timeInfo}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.timeText}>{task.dateTime ? new Date(task.dateTime).toLocaleDateString() : 'Flexible'}</Text>
            </View>
            <View style={styles.swipeHint}>
              <Text style={styles.swipeHintText}>← Skip | Accept →</Text>
            </View>
          </View>
        </LinearGradient>
      </GlassCard>

      {swiping && (
        <>
          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.swipeLeft,
              {
                opacity: pan.x.interpolate({
                  inputRange: [-SWIPE_THRESHOLD, 0],
                  outputRange: [0.8, 0],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <X size={48} color="#fff" />
            <Text style={styles.swipeOverlayText}>SKIP</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.swipeRight,
              {
                opacity: pan.x.interpolate({
                  inputRange: [0, SWIPE_THRESHOLD, SAFE_SCREEN_WIDTH],
                  outputRange: [0, 0.8, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <CheckCircle size={48} color="#fff" />
            <Text style={styles.swipeOverlayText}>ACCEPT</Text>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

export default function TasksScreen() {
  const { currentUser, availableTasks, myAcceptedTasks, myTasks, acceptTask, users } = useApp();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('ai');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [showComboAnimation, setShowComboAnimation] = useState<boolean>(false);
  const [taskBundles, setTaskBundles] = useState<TaskBundle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];

    let filtered = availableTasks.map(task => {
      const distance = calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        task.location.lat,
        task.location.lng
      );
      return { ...task, distance };
    });

    switch (activeFilter) {
      case 'nearby':
        filtered = filtered.filter(t => t.distance <= 5);
        break;
      case 'high_pay':
        filtered = filtered.filter(t => t.payAmount >= 50);
        break;
      case 'quick':
        filtered = filtered.filter(t => t.xpReward <= 50);
        break;
      case 'urgent':
        filtered = filtered.filter(t => t.urgency === 'today');
        break;
    }

    switch (sortBy) {
      case 'distance':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'pay':
        filtered.sort((a, b) => b.payAmount - a.payAmount);
        break;
      case 'xp':
        filtered.sort((a, b) => b.xpReward - a.xpReward);
        break;
      case 'ai':
      default:
        filtered.sort((a, b) => {
          const scoreA = (a.xpReward * 2) + (a.payAmount * 0.5) - (a.distance * 5);
          const scoreB = (b.xpReward * 2) + (b.payAmount * 0.5) - (b.distance * 5);
          return scoreB - scoreA;
        });
        break;
    }

    return filtered;
  }, [availableTasks, currentUser, activeFilter, sortBy]);

  useEffect(() => {
    const currentTask = filteredTasks[currentTaskIndex];
    if (currentTask && currentUser && filteredTasks.length > 1) {
      suggestTaskBundles(currentTask, filteredTasks, currentUser.location, currentUser)
        .then(bundles => setTaskBundles(bundles))
        .catch(err => console.error('Failed to generate bundles:', err));
    }
  }, [currentTaskIndex, currentUser, filteredTasks]);

  useEffect(() => {
    if (currentUser) {
      setTimeout(() => setIsLoading(false), 600);
    }
  }, [currentUser]);

  const currentTask = filteredTasks[currentTaskIndex];
  const currentPoster = currentTask ? users.find(u => u.id === currentTask.posterId) : undefined;

  const handleSwipeLeft = () => {
    console.log('Task skipped:', currentTask?.id);
    setCurrentTaskIndex(prev => Math.min(prev + 1, filteredTasks.length - 1));
  };

  const handleSwipeRight = async () => {
    if (!currentTask) return;
    
    await acceptTask(currentTask.id);
    setComboStreak(prev => prev + 1);
    setShowComboAnimation(true);
    setTimeout(() => setShowComboAnimation(false), 1500);
    
    setCurrentTaskIndex(prev => Math.min(prev + 1, filteredTasks.length - 1));
  };

  const activeTasks = myAcceptedTasks.filter(t => t.status === 'in_progress');
  const completedToday = myAcceptedTasks.filter(t => {
    if (!t.completedAt) return false;
    const today = new Date().toDateString();
    return new Date(t.completedAt).toDateString() === today;
  });

  if (!currentUser) return null;

  const isPoster = currentUser.role === 'poster';

  if (isPoster) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>My Quests</Text>
                <Text style={styles.headerSubtitle}>
                  {myTasks.length} total quests posted
                </Text>
              </View>
            </View>

            <View style={styles.statsBar}>
              <GlassCard variant="dark" style={styles.statMini}>
                <Target size={16} color={premiumColors.neonCyan} />
                <Text style={styles.statMiniValue}>{myTasks.filter(t => t.status === 'open').length}</Text>
                <Text style={styles.statMiniLabel}>Open</Text>
              </GlassCard>
              <GlassCard variant="dark" style={styles.statMini}>
                <Clock size={16} color={premiumColors.neonAmber} />
                <Text style={styles.statMiniValue}>{myTasks.filter(t => t.status === 'in_progress').length}</Text>
                <Text style={styles.statMiniLabel}>In Progress</Text>
              </GlassCard>
              <GlassCard variant="dark" style={styles.statMini}>
                <CheckCircle size={16} color={premiumColors.neonGreen} />
                <Text style={styles.statMiniValue}>{myTasks.filter(t => t.status === 'completed').length}</Text>
                <Text style={styles.statMiniLabel}>Completed</Text>
              </GlassCard>
            </View>

            {['open', 'in_progress', 'completed'].map(status => {
              const statusTasks = myTasks.filter(t => t.status === status);
              if (statusTasks.length === 0) return null;

              return (
                <View key={status} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {status === 'open' ? 'Open Quests' : status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </Text>
                    <Text style={styles.sectionCount}>{statusTasks.length}</Text>
                  </View>
                  {statusTasks.map(task => {
                    const worker = task.workerId ? users.find(u => u.id === task.workerId) : undefined;
                    return (
                      <TouchableOpacity
                        key={task.id}
                        onPress={() => {
                          triggerHaptic('light');
                          router.push(`/task/${task.id}`);
                        }}
                      >
                        <GlassCard variant="dark" style={styles.posterTaskCard}>
                          <View style={styles.posterTaskHeader}>
                            <View style={styles.categoryBadge}>
                              <Text style={styles.categoryIcon}>{getCategoryIcon(task.category)}</Text>
                              <Text style={styles.categoryText}>{task.category}</Text>
                            </View>
                            <View style={[
                              styles.statusBadge,
                              { backgroundColor: status === 'open' ? premiumColors.neonCyan + '20' : status === 'in_progress' ? premiumColors.neonAmber + '20' : premiumColors.neonGreen + '20' }
                            ]}>
                              <View style={[
                                styles.statusDot,
                                { backgroundColor: status === 'open' ? premiumColors.neonCyan : status === 'in_progress' ? premiumColors.neonAmber : premiumColors.neonGreen }
                              ]} />
                              <Text style={[
                                styles.statusText,
                                { color: status === 'open' ? premiumColors.neonCyan : status === 'in_progress' ? premiumColors.neonAmber : premiumColors.neonGreen }
                              ]}>
                                {status === 'open' ? 'Open' : status === 'in_progress' ? 'In Progress' : 'Completed'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.posterTaskTitle}>{task.title}</Text>
                          <Text style={styles.posterTaskDescription} numberOfLines={2}>{task.description}</Text>
                          {worker && (
                            <View style={styles.workerInfo}>
                              <View style={styles.workerAvatar}>
                                <Text style={styles.workerInitial}>{worker.name[0]}</Text>
                              </View>
                              <View style={styles.workerDetails}>
                                <Text style={styles.workerLabel}>Assigned to</Text>
                                <Text style={styles.workerName}>{worker.name}</Text>
                              </View>
                            </View>
                          )}
                          <View style={styles.posterTaskFooter}>
                            <View style={styles.posterTaskStat}>
                              <DollarSign size={16} color={premiumColors.neonAmber} />
                              <Text style={styles.posterTaskStatValue}>${task.payAmount}</Text>
                            </View>
                            <View style={styles.posterTaskStat}>
                              <Clock size={16} color={Colors.textSecondary} />
                              <Text style={styles.posterTaskStatValue}>{new Date(task.createdAt).toLocaleDateString()}</Text>
                            </View>
                          </View>
                        </GlassCard>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}

            {myTasks.length === 0 && (
              <GlassCard variant="dark" style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No Quests Yet</Text>
                <Text style={styles.emptyText}>Create your first quest using AI or manual posting</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => {
                    triggerHaptic('medium');
                    router.push('/ai-task-creator');
                  }}
                >
                  <LinearGradient
                    colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createGradient}
                  >
                    <Text style={styles.createButtonText}>Create Quest</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </GlassCard>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>The Hustle Feed</Text>
              <Text style={styles.headerSubtitle}>
                {filteredTasks.length} gigs • AI-optimized for you
              </Text>
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                triggerHaptic('medium');
                setShowFilters(true);
              }}
            >
              <Filter size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <GlassCard variant="dark" style={styles.statMini}>
                  <Target size={16} color={premiumColors.neonCyan} />
                  <Text style={styles.statMiniValue}>{activeTasks.length}</Text>
                  <Text style={styles.statMiniLabel}>Active</Text>
                </GlassCard>
                <GlassCard variant="dark" style={styles.statMini}>
                  <CheckCircle size={16} color={premiumColors.neonAmber} />
                  <Text style={styles.statMiniValue}>{completedToday.length}</Text>
                  <Text style={styles.statMiniLabel}>Today</Text>
                </GlassCard>
                <GlassCard variant="dark" style={styles.statMini}>
                  <Flame size={16} color={premiumColors.neonViolet} />
                  <Text style={styles.statMiniValue}>{comboStreak}x</Text>
                  <Text style={styles.statMiniLabel}>Combo</Text>
                </GlassCard>
              </>
            )}
          </View>

          {showComboAnimation && (
            <View style={styles.comboAnimation}>
              <Text style={styles.comboText}>🔥 {comboStreak}x COMBO!</Text>
            </View>
          )}

          <View style={styles.aiInsight}>
            <Sparkles size={18} color={premiumColors.neonCyan} />
            <Text style={styles.aiInsightText}>
              {sortBy === 'ai' 
                ? 'AI matched these gigs to your skills & location'
                : `Sorted by ${sortBy === 'distance' ? 'nearest first' : sortBy === 'pay' ? 'highest pay' : 'most XP'}`
              }
            </Text>
          </View>

          {taskBundles.length > 0 && (
            <View style={styles.bundlesCard}>
              <View style={styles.bundlesHeader}>
                <Sparkles size={18} color={premiumColors.neonCyan} />
                <Text style={styles.bundlesTitle}>Smart Bundling</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {taskBundles.map(bundle => (
                  <TouchableOpacity
                    key={bundle.id}
                    style={styles.bundleChip}
                    onPress={() => {
                      triggerHaptic('medium');
                      Alert.alert(
                        '🎁 Task Bundle',
                        `${bundle.reasoning}\n\nTotal: ${bundle.totalPay} + ${bundle.totalXP} XP`,
                        [{ text: 'Got it' }]
                      );
                    }}
                  >
                    <Text style={styles.bundleCount}>{bundle.tasks.length} tasks</Text>
                    <Text style={styles.bundlePay}>${bundle.totalPay}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.swipeContainer}>
            {isLoading ? (
              <TaskCardSkeleton />
            ) : currentTask ? (
              <SwipeableTaskCard
                key={currentTask.id}
                task={currentTask}
                distance={currentTask.distance || 0}
                poster={currentPoster}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            ) : (
              <GlassCard variant="dark" style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🎉</Text>
                <Text style={styles.emptyTitle}>You've seen all gigs!</Text>
                <Text style={styles.emptyText}>Check back soon for new opportunities</Text>
              </GlassCard>
            )}
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                triggerHaptic('medium');
                router.push('/instant-match');
              }}
            >
              <LinearGradient
                colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Zap size={20} color="#fff" />
                <Text style={styles.actionText}>Instant Match</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Active Quests</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
                <ChevronRight size={20} color={Colors.accent} />
              </TouchableOpacity>
            </View>
            {activeTasks.length > 0 ? (
              activeTasks.slice(0, 3).map(task => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => {
                    triggerHaptic('light');
                    router.push(`/task/${task.id}`);
                  }}
                >
                  <GlassCard variant="dark" style={styles.activeTaskCard}>
                    <View style={styles.activeTaskHeader}>
                      <Text style={styles.activeTaskIcon}>{getCategoryIcon(task.category)}</Text>
                      <View style={styles.activeTaskInfo}>
                        <Text style={styles.activeTaskTitle}>{task.title}</Text>
                        <Text style={styles.activeTaskMeta}>
                          ${task.payAmount} • +{task.xpReward} Grit
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '60%' }]} />
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No active quests</Text>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionTitle}>Filter By</Text>
            <View style={styles.filterGrid}>
              {(['all', 'nearby', 'high_pay', 'quick', 'urgent'] as FilterType[]).map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                  onPress={() => {
                    setActiveFilter(filter);
                    triggerHaptic('light');
                  }}
                >
                  <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
                    {filter.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionTitle}>Sort By</Text>
            <View style={styles.filterGrid}>
              {(['ai', 'distance', 'pay', 'xp'] as SortType[]).map(sort => (
                <TouchableOpacity
                  key={sort}
                  style={[styles.filterChip, sortBy === sort && styles.filterChipActive]}
                  onPress={() => {
                    setSortBy(sort);
                    triggerHaptic('light');
                  }}
                >
                  <Text style={[styles.filterChipText, sortBy === sort && styles.filterChipTextActive]}>
                    {sort === 'ai' ? 'AI Match' : sort}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setShowFilters(false);
                triggerHaptic('success');
              }}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyGradient}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: premiumColors.neonViolet + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: premiumColors.neonViolet,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statMini: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statMiniValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statMiniLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  aiInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: premiumColors.neonCyan + '15',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  aiInsightText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  swipeContainer: {
    height: 420,
    marginBottom: 20,
    position: 'relative',
  },
  swipeCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  taskCard: {
    flex: 1,
    overflow: 'visible',
  },
  taskGradient: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonViolet + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  posterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonCyan + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterInitial: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  posterDetails: {
    flex: 1,
  },
  posterName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  posterRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  posterScore: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  swipeHint: {
    backgroundColor: premiumColors.glassWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  swipeHintText: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    gap: 12,
  },
  swipeLeft: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  swipeRight: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  swipeOverlayText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
  },
  comboAnimation: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  comboText: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
    textShadowColor: premiumColors.neonAmber,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  activeTaskCard: {
    padding: 16,
    marginBottom: 12,
  },
  activeTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  activeTaskIcon: {
    fontSize: 32,
  },
  activeTaskInfo: {
    flex: 1,
  },
  activeTaskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  activeTaskMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: premiumColors.neonCyan,
    borderRadius: 3,
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: premiumColors.richBlack,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: premiumColors.glassWhite,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: premiumColors.neonCyan + '20',
    borderColor: premiumColors.neonCyan,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: premiumColors.neonCyan,
  },
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  applyGradient: {
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  posterTaskCard: {
    padding: 16,
    marginBottom: 12,
  },
  posterTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
  },
  posterTaskTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  posterTaskDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  workerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: premiumColors.neonViolet + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInitial: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  workerDetails: {
    flex: 1,
  },
  workerLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  posterTaskFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  posterTaskStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  posterTaskStatValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  createGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  bundlesCard: {
    backgroundColor: premiumColors.neonCyan + '15',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  bundlesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bundlesTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  bundleChip: {
    backgroundColor: premiumColors.richBlack,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  bundleCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bundlePay: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
});
