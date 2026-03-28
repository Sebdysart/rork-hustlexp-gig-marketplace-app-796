import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, DollarSign, Zap, CheckCircle, Circle, 
  Pause, Play, MessageCircle, Camera, X, ChevronRight
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTaskLifecycle } from '@/contexts/TaskLifecycleContext';
import HustleAIAssistant from '@/components/HustleAIAssistant';
import NeonButton from '@/components/NeonButton';
import GlassCard from '@/components/GlassCard';
import CircularProgress from '@/components/CircularProgress';
import { premiumColors, spacing, typography, borderRadius } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';

export default function TaskActiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, users } = useApp();
  const { 
    getTaskProgress, 
    getActiveTimer, 
    getProgressPercentage,
    pauseTask,
    resumeTask,
    completeSubtask,
    completeCheckpoint
  } = useTaskLifecycle();

  const [showAI, setShowAI] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateNote, setUpdateNote] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  const task = tasks.find(t => t.id === id);
  const poster = task ? users.find(u => u.id === task.posterId) : null;
  const progress = getTaskProgress(id || '');
  const activeTimer = getActiveTimer(id || '');
  const progressPercentage = getProgressPercentage(id || '');

  useEffect(() => {
    if (progress?.status === 'active') {
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

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [progress?.status, pulseAnim, glowAnim]);

  useEffect(() => {
    if (progress && progress.subtasks.length > 0) {
      const currentSubtask = progress.subtasks[progress.currentSubtaskIndex];
      if (currentSubtask && !currentSubtask.completed) {
        setTimeout(() => {
          setAiMessage(`Focus on: ${currentSubtask.title}. You're doing great!`);
          setShowAI(true);
        }, 2000);
      }
    }
  }, [progress?.currentSubtaskIndex]);

  if (!task || !poster || !progress) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Active Task' }} />
        <Text style={styles.errorText}>Task not found</Text>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = async () => {
    triggerHaptic('medium');
    if (progress.status === 'active') {
      await pauseTask(task.id);
      setAiMessage('Task paused. Take a break! 💪');
      setShowAI(true);
    } else if (progress.status === 'paused') {
      await resumeTask(task.id);
      setAiMessage('Welcome back! Let&apos;s continue where you left off.');
      setShowAI(true);
    }
  };

  const handleSubtaskComplete = async (subtaskId: string) => {
    triggerHaptic('success');
    await completeSubtask(task.id, subtaskId);
    
    const completedCount = progress.subtasks.filter(st => st.completed).length + 1;
    const totalCount = progress.subtasks.length;
    
    if (completedCount === totalCount) {
      setAiMessage('All subtasks complete! Ready to submit proof of completion?');
    } else {
      setAiMessage(`Great work! ${totalCount - completedCount} subtask${totalCount - completedCount > 1 ? 's' : ''} remaining.`);
    }
    setShowAI(true);
  };

  const handleCheckpointComplete = async (checkpointId: string) => {
    triggerHaptic('success');
    await completeCheckpoint(task.id, checkpointId, updateNote);
    setShowUpdateModal(false);
    setUpdateNote('');
    setAiMessage('Checkpoint completed! Keep up the momentum! 🔥');
    setShowAI(true);
  };

  const handleMarkComplete = () => {
    triggerHaptic('medium');
    router.push(`/task-verify/${task.id}`);
  };

  const allSubtasksComplete = progress.subtasks.every(st => st.completed);
  const isActive = progress.status === 'active';
  const isPaused = progress.status === 'paused';

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Active Task',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[premiumColors.neonCyan + '20', premiumColors.neonViolet + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.statusRow}>
              <Animated.View style={[
                styles.statusIndicator,
                {
                  backgroundColor: isActive ? premiumColors.neonGreen : premiumColors.neonAmber,
                  transform: [{ scale: pulseAnim }],
                }
              ]} />
              <Text style={styles.statusText}>
                {isActive ? 'In Progress' : isPaused ? 'Paused' : 'Scheduled'}
              </Text>
            </View>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.timerText}>{formatTime(activeTimer)}</Text>
            </Animated.View>

            <CircularProgress
              progress={progressPercentage / 100}
              size={120}
              strokeWidth={12}
              color={premiumColors.neonCyan}
              value={`${Math.round(progressPercentage)}%`}
              label="Complete"
            />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <GlassCard style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>

            <View style={styles.taskMeta}>
              <View style={styles.metaItem}>
                <DollarSign size={18} color={premiumColors.neonGreen} />
                <Text style={styles.metaText}>${task.payAmount}</Text>
              </View>
              <View style={styles.metaItem}>
                <Zap size={18} color={premiumColors.neonAmber} />
                <Text style={styles.metaText}>{task.xpReward} XP</Text>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={18} color={premiumColors.neonCyan} />
                <Text style={styles.metaText}>{task.location.address}</Text>
              </View>
            </View>
          </GlassCard>

          <HustleAIAssistant
            message={aiMessage}
            visible={showAI}
            variant="info"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Progress</Text>
            <View style={styles.subtasksList}>
              {progress.subtasks.map((subtask, index) => (
                <TouchableOpacity
                  key={subtask.id}
                  style={[
                    styles.subtaskCard,
                    subtask.completed && styles.subtaskCardCompleted,
                  ]}
                  onPress={() => !subtask.completed && handleSubtaskComplete(subtask.id)}
                  disabled={subtask.completed}
                  activeOpacity={0.7}
                >
                  <View style={styles.subtaskLeft}>
                    <View style={[
                      styles.subtaskIcon,
                      subtask.completed && styles.subtaskIconCompleted,
                    ]}>
                      {subtask.completed ? (
                        <CheckCircle size={24} color={premiumColors.neonGreen} />
                      ) : (
                        <Circle size={24} color={premiumColors.neonCyan} />
                      )}
                    </View>
                    <View style={styles.subtaskInfo}>
                      <Text style={[
                        styles.subtaskTitle,
                        subtask.completed && styles.subtaskTitleCompleted,
                      ]}>
                        {subtask.title}
                      </Text>
                      {subtask.estimatedDuration && (
                        <Text style={styles.subtaskDuration}>
                          ~{subtask.estimatedDuration} min
                        </Text>
                      )}
                    </View>
                  </View>
                  {!subtask.completed && index === progress.currentSubtaskIndex && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {progress.checkpoints.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Multi-Day Checkpoints</Text>
              <View style={styles.checkpointsList}>
                {progress.checkpoints.map((checkpoint) => (
                  <GlassCard
                    key={checkpoint.id}
                    variant={checkpoint.completed ? 'darkStrong' : 'dark'}
                    style={styles.checkpointCard}
                  >
                    <View style={styles.checkpointHeader}>
                      <View style={styles.checkpointLeft}>
                        <View style={[
                          styles.checkpointDay,
                          checkpoint.completed && styles.checkpointDayCompleted,
                        ]}>
                          <Text style={[
                            styles.checkpointDayText,
                            checkpoint.completed && styles.checkpointDayTextCompleted,
                          ]}>
                            Day {checkpoint.day}
                          </Text>
                        </View>
                        <Text style={styles.checkpointTitle}>{checkpoint.title}</Text>
                      </View>
                      {checkpoint.completed ? (
                        <CheckCircle size={24} color={premiumColors.neonGreen} />
                      ) : (
                        <TouchableOpacity
                          style={styles.checkpointButton}
                          onPress={() => {
                            triggerHaptic('light');
                            setShowUpdateModal(true);
                          }}
                        >
                          <ChevronRight size={20} color={premiumColors.neonCyan} />
                        </TouchableOpacity>
                      )}
                    </View>
                    {checkpoint.notes && (
                      <Text style={styles.checkpointNotes}>{checkpoint.notes}</Text>
                    )}
                  </GlassCard>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <NeonButton
              title={isActive ? 'Pause Task' : 'Resume Task'}
              onPress={handlePauseResume}
              variant={isActive ? 'amber' : 'cyan'}
              icon={isActive ? <Pause size={20} color={premiumColors.deepBlack} /> : <Play size={20} color={premiumColors.deepBlack} />}
              style={styles.actionButton}
              fullWidth
            />

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => {
                triggerHaptic('light');
                router.push(`/chat/${task.id}`);
              }}
            >
              <GlassCard variant="dark" neonBorder glowColor="neonViolet" style={styles.chatButtonInner}>
                <MessageCircle size={20} color={premiumColors.neonViolet} />
                <Text style={styles.chatButtonText}>Message Poster</Text>
              </GlassCard>
            </TouchableOpacity>

            {allSubtasksComplete && (
              <NeonButton
                title="Mark Complete & Submit Proof"
                onPress={handleMarkComplete}
                variant="green"
                icon={<Camera size={20} color={premiumColors.deepBlack} />}
                style={styles.completeButton}
                fullWidth
              />
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showUpdateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Checkpoint</Text>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Add notes about today&apos;s progress (optional)
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="What did you accomplish today?"
              placeholderTextColor="#666"
              value={updateNote}
              onChangeText={setUpdateNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <NeonButton
              title="Complete Checkpoint"
              onPress={() => {
                const checkpoint = progress.checkpoints.find(cp => !cp.completed);
                if (checkpoint) {
                  handleCheckpointComplete(checkpoint.id);
                }
              }}
              variant="cyan"
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  headerGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
  timerText: {
    fontSize: typography.sizes.xxxl * 1.5,
    fontWeight: typography.weights.heavy,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  content: {
    padding: spacing.lg,
  },
  taskCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  taskTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  taskDescription: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    marginBottom: spacing.lg,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  subtasksList: {
    gap: spacing.md,
  },
  subtaskCard: {
    backgroundColor: premiumColors.richBlack,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
  },
  subtaskCardCompleted: {
    borderColor: premiumColors.neonGreen + '40',
    opacity: 0.7,
  },
  subtaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  subtaskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskIconCompleted: {
    backgroundColor: premiumColors.neonGreen + '20',
  },
  subtaskInfo: {
    flex: 1,
  },
  subtaskTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  subtaskDuration: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  currentBadge: {
    backgroundColor: premiumColors.neonAmber,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: premiumColors.deepBlack,
  },
  checkpointsList: {
    gap: spacing.md,
  },
  checkpointCard: {
    padding: spacing.lg,
  },
  checkpointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkpointLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  checkpointDay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
  },
  checkpointDayCompleted: {
    backgroundColor: premiumColors.neonGreen + '20',
    borderColor: premiumColors.neonGreen,
  },
  checkpointDayText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonCyan,
  },
  checkpointDayTextCompleted: {
    color: premiumColors.neonGreen,
  },
  checkpointTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
    flex: 1,
  },
  checkpointButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkpointNotes: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  chatButton: {
    width: '100%',
  },
  chatButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  chatButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonViolet,
  },
  completeButton: {
    width: '100%',
  },
  errorText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
    marginTop: spacing.xxxl,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: premiumColors.richBlack,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    marginBottom: spacing.lg,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  textInput: {
    backgroundColor: premiumColors.deepBlack,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: spacing.lg,
    minHeight: 120,
  },
});
