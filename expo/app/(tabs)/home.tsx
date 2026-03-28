import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Switch, Platform } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, TrendingUp, Map, Zap, Search, Plus, MessageCircle, Flame, Power } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import FloatingHUD from '@/components/FloatingHUD';
import { triggerHaptic } from '@/utils/haptics';
import GlassCard from '@/components/GlassCard';
import { premiumColors } from '@/constants/designTokens';
import React from 'react';

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

export default function HomeScreen() {
  const { currentUser, availableTasks, myTasks, updateAvailabilityStatus } = useApp();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  const onRefresh = () => {
    triggerHaptic('light');
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleStreakPress = () => {
    triggerHaptic('success');
    router.push('/(tabs)/roadmap');
  };

  const isHustler = currentUser?.role === 'worker' || currentUser?.role === 'both';
  const isPoster = currentUser?.role === 'poster';

  const toggleAvailability = async () => {
    if (!currentUser) return;
    triggerHaptic('medium');
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    if (newStatus) {
      await updateAvailabilityStatus('available_now');
      console.log('✅ You are now available for tasks');
    } else {
      await updateAvailabilityStatus('offline');
      console.log('⭕ You are now offline');
    }
  };

  const nearbyTasks = useMemo(() => {
    if (!isHustler || !currentUser) return [];
    return availableTasks.filter(task => {
      const distance = calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        task.location.lat,
        task.location.lng
      );
      return distance <= 10;
    }).slice(0, 8);
  }, [availableTasks, currentUser, isHustler]);

  if (!currentUser) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMissionCopy = () => {
    if (isHustler && nearbyTasks.length > 0) {
      return `${nearbyTasks.length} task${nearbyTasks.length > 1 ? 's' : ''} near you`;
    }
    if (isPoster && myTasks.filter(t => t.status === 'open').length > 0) {
      return 'Your tasks are live';
    }
    return 'Ready to hustle?';
  };

  if (isPoster) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[premiumColors.deepBlack, premiumColors.charcoal, premiumColors.richBlack]}
          style={styles.gradient}
        >
          <FloatingHUD 
            currentXP={currentUser.xp} 
            level={currentUser.level} 
            streakCount={currentUser.streaks.current}
            onStreakPress={handleStreakPress}
          />
          
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
            }
          >
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>{getGreeting()}, {currentUser.name}</Text>
                <Text style={styles.subtitle}>{getMissionCopy()}</Text>
              </View>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/search');
                }}
              >
                <Search size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.posterStatsCard}>
              <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.statsCardInner}>
                <Text style={styles.statsCardTitle}>Your Tasks</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{myTasks.filter(t => t.status === 'open').length}</Text>
                    <Text style={styles.statLabel}>Open</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{myTasks.filter(t => t.status === 'in_progress').length}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{myTasks.filter(t => t.status === 'completed').length}</Text>
                    <Text style={styles.statLabel}>Done</Text>
                  </View>
                </View>
              </GlassCard>
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => {
                triggerHaptic('success');
                router.push('/post-task');
              }}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
                style={styles.ctaGradient}
              >
                <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.ctaText}>Post a Task</Text>
              </LinearGradient>
            </TouchableOpacity>

            {myTasks.length > 0 && (
              <View style={styles.tasksSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Tasks</Text>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic('light');
                      router.push('/(tabs)/tasks');
                    }}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>

                {myTasks.slice(0, 3).map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => {
                      triggerHaptic('light');
                      router.push(`/task/${task.id}`);
                    }}
                  >
                    <GlassCard variant="dark" style={styles.taskCardInner}>
                      <View style={styles.taskHeader}>
                        <View style={[
                          styles.taskStatus,
                          { backgroundColor: task.status === 'open' ? premiumColors.neonGreen + '20' : task.status === 'in_progress' ? premiumColors.neonAmber + '20' : premiumColors.neonBlue + '20' }
                        ]}>
                          <Text style={[
                            styles.taskStatusText,
                            { color: task.status === 'open' ? premiumColors.neonGreen : task.status === 'in_progress' ? premiumColors.neonAmber : premiumColors.neonBlue }
                          ]}>
                            {task.status === 'open' ? 'OPEN' : task.status === 'in_progress' ? 'ACTIVE' : 'COMPLETED'}
                          </Text>
                        </View>
                        <Text style={styles.taskPay}>${task.payAmount}</Text>
                      </View>
                      <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                      <Text style={styles.taskCategory}>{task.category}</Text>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal, premiumColors.richBlack]}
        style={styles.gradient}
      >
        <FloatingHUD 
          currentXP={currentUser.xp} 
          level={currentUser.level} 
          streakCount={currentUser.streaks.current}
          onStreakPress={handleStreakPress}
        />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>{getGreeting()}, {currentUser.name}</Text>
              <Text style={styles.subtitle}>{getMissionCopy()}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/search');
                }}
              >
                <Search size={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/adventure-map');
                }}
              >
                <Map size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.availabilityCard}>
            <GlassCard variant="darkStrong" neonBorder glowColor={isAvailable ? "neonGreen" : "neonCyan"} style={styles.availabilityCardInner}>
              <View style={styles.availabilityHeader}>
                <View style={styles.availabilityLeft}>
                  <View style={[
                    styles.availabilityIcon,
                    { backgroundColor: isAvailable ? premiumColors.neonGreen + '20' : premiumColors.neonCyan + '20' }
                  ]}>
                    <Power size={24} color={isAvailable ? premiumColors.neonGreen : premiumColors.neonCyan} strokeWidth={2.5} />
                  </View>
                  <View style={styles.availabilityText}>
                    <Text style={styles.availabilityTitle}>Available Now</Text>
                    <Text style={styles.availabilitySubtitle}>
                      {isAvailable ? 'Visible to posters nearby' : 'You are offline'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isAvailable}
                  onValueChange={toggleAvailability}
                  trackColor={{ false: Colors.textSecondary + '40', true: premiumColors.neonGreen + '60' }}
                  thumbColor={isAvailable ? premiumColors.neonGreen : Colors.textSecondary}
                  ios_backgroundColor={Colors.textSecondary + '40'}
                />
              </View>
            </GlassCard>
          </View>

          <View style={styles.statsRow}>
            <GlassCard variant="dark" style={styles.statCard}>
              <TrendingUp size={24} color={premiumColors.neonCyan} />
              <Text style={styles.statValue}>{currentUser.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </GlassCard>
            <GlassCard variant="dark" style={styles.statCard}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{currentUser.reputationScore.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </GlassCard>
            <GlassCard variant="dark" style={styles.statCard}>
              <Flame size={24} color={premiumColors.neonAmber} />
              <Text style={styles.statValue}>{currentUser.streaks.current}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </GlassCard>
          </View>

          {nearbyTasks.length > 0 && (
            <View style={styles.tasksSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nearby Tasks</Text>
                <View style={styles.taskCountBadge}>
                  <Zap size={12} color={premiumColors.neonAmber} />
                  <Text style={styles.taskCountText}>{nearbyTasks.length}</Text>
                </View>
              </View>

              {nearbyTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => {
                    triggerHaptic('light');
                    router.push(`/task/${task.id}`);
                  }}
                >
                  <GlassCard variant="dark" style={styles.taskCardInner}>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskCategoryBadge}>
                        <Text style={styles.taskCategoryText}>{task.category}</Text>
                      </View>
                      <Text style={styles.taskPay}>${task.payAmount}</Text>
                    </View>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={styles.taskFooter}>
                      <View style={styles.taskXP}>
                        <Sparkles size={14} color={premiumColors.neonCyan} />
                        <Text style={styles.taskXPText}>{task.xpReward} XP</Text>
                      </View>
                      <Text style={styles.taskDistance}>
                        {calculateDistance(
                          currentUser.location.lat,
                          currentUser.location.lng,
                          task.location.lat,
                          task.location.lng
                        ).toFixed(1)} km away
                      </Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {nearbyTasks.length === 0 && (
            <View style={styles.emptyState}>
              <GlassCard variant="dark" style={styles.emptyStateCard}>
                <View style={styles.emptyIcon}>
                  <Sparkles size={48} color={premiumColors.neonCyan} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No Nearby Tasks</Text>
                <Text style={styles.emptyText}>Check back soon or expand your search radius</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => {
                    triggerHaptic('medium');
                    router.push('/adventure-map');
                  }}
                >
                  <Text style={styles.emptyButtonText}>Browse All Tasks</Text>
                </TouchableOpacity>
              </GlassCard>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
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
    paddingTop: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: premiumColors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: premiumColors.neonCyan,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: premiumColors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: premiumColors.neonCyan,
  },
  availabilityCard: {
    marginBottom: 24,
  },
  availabilityCardInner: {
    padding: 20,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  availabilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityText: {
    flex: 1,
    gap: 4,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  availabilitySubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statIcon: {
    fontSize: 24,
  },
  tasksSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  taskCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskCardInner: {
    padding: 16,
    gap: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCategoryBadge: {
    backgroundColor: premiumColors.neonCyan + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  taskCategoryText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    textTransform: 'uppercase',
  },
  taskPay: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 22,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskXPText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  taskDistance: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  emptyState: {
    marginTop: 40,
  },
  emptyStateCard: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: premiumColors.neonCyan + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '30',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: premiumColors.neonCyan,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  posterStatsCard: {
    marginBottom: 24,
  },
  statsCardInner: {
    padding: 20,
    gap: 16,
  },
  statsCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: premiumColors.richBlack + '80',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  ctaButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  taskStatus: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  taskCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
