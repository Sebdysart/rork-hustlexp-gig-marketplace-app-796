import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  FlatList,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  DollarSign,
  MapPin,
  User,
  TrendingUp,
  Award,
  Star,
  Eye,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '@/contexts/AppContext';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { Task } from '@/types';
import { triggerHaptic } from '@/utils/haptics';

const { width } = Dimensions.get('window');

type TabType = 'active' | 'pending' | 'completed';

export default function PosterDashboard() {
  const { currentUser, myTasks, users } = useApp();
  const [selectedTab, setSelectedTab] = useState<TabType>('active');

  const activeTasks = useMemo(() => {
    return myTasks.filter(t => t.status === 'in_progress');
  }, [myTasks]);

  const pendingTasks = useMemo(() => {
    return myTasks.filter(t => t.status === 'open');
  }, [myTasks]);

  const completedTasks = useMemo(() => {
    return myTasks.filter(t => t.status === 'completed');
  }, [myTasks]);

  const trustXP = useMemo(() => {
    return completedTasks.length * 25;
  }, [completedTasks]);

  const totalSpent = useMemo(() => {
    return completedTasks.reduce((sum, task) => sum + task.payAmount, 0);
  }, [completedTasks]);

  const avgRating = useMemo(() => {
    return 4.8;
  }, []);

  const getWorkerForTask = (task: Task) => {
    if (!task.workerId) return null;
    return users.find(u => u.id === task.workerId);
  };

  const handleCreateTask = () => {
    triggerHaptic('light');
    router.push('/ai-task-creator');
  };

  const handleTaskPress = (taskId: string) => {
    triggerHaptic('light');
    router.push(`/task/${taskId}`);
  };

  const renderTaskCard = ({ item: task }: { item: Task }) => {
    const worker = getWorkerForTask(task);
    const isActive = task.status === 'in_progress';
    const isPending = task.status === 'open';
    const isCompleted = task.status === 'completed';

    return (
      <TouchableOpacity
        onPress={() => handleTaskPress(task.id)}
        activeOpacity={0.7}
      >
        <GlassCard style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleRow}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {task.title}
              </Text>
              {isActive && (
                <View style={[styles.statusBadge, styles.statusActive]}>
                  <Clock size={12} color={premiumColors.neonAmber} />
                  <Text style={[styles.statusText, { color: premiumColors.neonAmber }]}>
                    Active
                  </Text>
                </View>
              )}
              {isPending && (
                <View style={[styles.statusBadge, styles.statusPending]}>
                  <AlertCircle size={12} color={premiumColors.neonCyan} />
                  <Text style={[styles.statusText, { color: premiumColors.neonCyan }]}>
                    Pending
                  </Text>
                </View>
              )}
              {isCompleted && (
                <View style={[styles.statusBadge, styles.statusCompleted]}>
                  <CheckCircle2 size={12} color={premiumColors.neonGreen} />
                  <Text style={[styles.statusText, { color: premiumColors.neonGreen }]}>
                    Completed
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          </View>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color={premiumColors.neonGreen} />
              <Text style={styles.metaText}>${task.payAmount}</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={16} color={premiumColors.neonCyan} />
              <Text style={styles.metaText} numberOfLines={1}>
                {task.location.address.split(',')[0]}
              </Text>
            </View>
            {task.estimatedDuration && (
              <View style={styles.metaItem}>
                <Clock size={16} color={premiumColors.neonAmber} />
                <Text style={styles.metaText}>{task.estimatedDuration}</Text>
              </View>
            )}
          </View>

          {worker && (
            <View style={styles.workerInfo}>
              <View style={styles.workerAvatar}>
                <User size={20} color={Colors.text} />
              </View>
              <View style={styles.workerDetails}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <View style={styles.workerRating}>
                  <Star size={12} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                  <Text style={styles.workerRatingText}>{worker.reputationScore.toFixed(1)}</Text>
                  <Text style={styles.workerTasksText}>• {worker.tasksCompleted} tasks</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => {
                  triggerHaptic('light');
                  router.push(`/chat/${task.id}`);
                }}
              >
                <MessageCircle size={20} color={premiumColors.neonCyan} />
              </TouchableOpacity>
            </View>
          )}

          {isPending && (
            <View style={styles.pendingInfo}>
              <Eye size={16} color={Colors.textSecondary} />
              <Text style={styles.pendingText}>
                Waiting for hustlers to accept...
              </Text>
            </View>
          )}
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const messages = {
      active: {
        icon: Clock,
        title: 'No Active Tasks',
        subtitle: 'Your active tasks will appear here',
      },
      pending: {
        icon: AlertCircle,
        title: 'No Pending Tasks',
        subtitle: 'Create a task to get started',
      },
      completed: {
        icon: CheckCircle2,
        title: 'No Completed Tasks',
        subtitle: 'Your completed tasks will appear here',
      },
    };

    const message = messages[selectedTab];
    const IconComponent = message.icon;

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <IconComponent size={48} color={Colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>{message.title}</Text>
        <Text style={styles.emptySubtitle}>{message.subtitle}</Text>
        {selectedTab === 'pending' && (
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleCreateTask}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
              style={styles.emptyButtonGradient}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Create Task</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const currentTasks = selectedTab === 'active' ? activeTasks : selectedTab === 'pending' ? pendingTasks : completedTasks;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Tasks',
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCreateTask}
              style={styles.headerButton}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
                style={styles.headerButtonGradient}
              >
                <Plus size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          ),
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack]}
        style={styles.gradient}
      >
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <View style={styles.statsContainer}>
            <GlassCard style={styles.statsCard}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Award size={20} color={premiumColors.neonCyan} />
                  </View>
                  <View>
                    <Text style={styles.statValue}>{trustXP}</Text>
                    <Text style={styles.statLabel}>Trust XP</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <DollarSign size={20} color={premiumColors.neonGreen} />
                  </View>
                  <View>
                    <Text style={styles.statValue}>${totalSpent}</Text>
                    <Text style={styles.statLabel}>Total Spent</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Star size={20} color={premiumColors.neonAmber} />
                  </View>
                  <View>
                    <Text style={styles.statValue}>{avgRating}</Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScroll}
            >
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
                onPress={() => {
                  setSelectedTab('active');
                  triggerHaptic('light');
                }}
              >
                <Clock
                  size={18}
                  color={selectedTab === 'active' ? premiumColors.neonAmber : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'active' && styles.tabTextActive,
                  ]}
                >
                  Active ({activeTasks.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
                onPress={() => {
                  setSelectedTab('pending');
                  triggerHaptic('light');
                }}
              >
                <AlertCircle
                  size={18}
                  color={selectedTab === 'pending' ? premiumColors.neonCyan : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'pending' && styles.tabTextActive,
                  ]}
                >
                  Pending ({pendingTasks.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
                onPress={() => {
                  setSelectedTab('completed');
                  triggerHaptic('light');
                }}
              >
                <CheckCircle2
                  size={18}
                  color={selectedTab === 'completed' ? premiumColors.neonGreen : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'completed' && styles.tabTextActive,
                  ]}
                >
                  Completed ({completedTasks.length})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <FlatList
            data={currentTasks}
            renderItem={renderTaskCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerButton: {
    marginRight: 16,
  },
  headerButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  statsCard: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
  },
  statItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabsScroll: {
    gap: 12,
  },
  tab: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: premiumColors.neonAmber + '20',
  },
  statusPending: {
    backgroundColor: premiumColors.neonCyan + '20',
  },
  statusCompleted: {
    backgroundColor: premiumColors.neonGreen + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  workerInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  workerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  workerRating: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  workerRatingText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonAmber,
  },
  workerTasksText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  pendingInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  pendingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
