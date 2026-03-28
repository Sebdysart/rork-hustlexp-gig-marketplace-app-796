import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, DollarSign, Zap, X } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTaskLifecycle } from '@/contexts/TaskLifecycleContext';
import { useAILearning } from '@/utils/aiLearningIntegration';
import HustleAIAssistant from '@/components/HustleAIAssistant';
import NeonButton from '@/components/NeonButton';
import GlassCard from '@/components/GlassCard';
import { premiumColors, spacing, typography, borderRadius, neonGlow } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';
import { ScheduleSlot } from '@/types';

export default function TaskAcceptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, acceptTask, currentUser } = useApp();
  const { initializeTaskProgress, startTask, scheduleTask, generateScheduleSlots } = useTaskLifecycle();
  const { submitMatchAcceptance } = useAILearning();
  
  const [showAI, setShowAI] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const task = tasks.find(t => t.id === id);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setAiMessage('Task confirmed! Would you like to start now or schedule for later?');
      setShowAI(true);
      triggerHaptic('success');
    }, 800);
  }, [fadeAnim]);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Task not found</Text>
      </SafeAreaView>
    );
  }

  const handleStartNow = async () => {
    triggerHaptic('medium');
    await acceptTask(task.id);
    await initializeTaskProgress(task.id, task.title, task.estimatedDuration);
    await startTask(task.id);
    
    if (currentUser) {
      await submitMatchAcceptance(
        currentUser.id,
        task.id,
        85,
        88
      );
    }
    
    setAiMessage('Great! Let\'s get started. Opening your task dashboard...');
    setShowAI(true);
    
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const handleScheduleLater = () => {
    triggerHaptic('light');
    const slots = generateScheduleSlots();
    setScheduleSlots(slots);
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = async () => {
    if (!selectedSlot) return;
    
    triggerHaptic('success');
    await acceptTask(task.id);
    await initializeTaskProgress(task.id, task.title, task.estimatedDuration);
    await scheduleTask(task.id, selectedSlot.startTime);
    
    if (currentUser) {
      await submitMatchAcceptance(
        currentUser.id,
        task.id,
        85,
        88
      );
    }
    
    setShowScheduleModal(false);
    setAiMessage(`Perfect! Task scheduled for ${new Date(selectedSlot.startTime).toLocaleString()}. I'll remind you when it's time!`);
    setShowAI(true);
    
    setTimeout(() => {
      router.back();
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Zap size={48} color={premiumColors.deepBlack} strokeWidth={2.5} />
              <Text style={styles.headerTitle}>Task Accepted!</Text>
              <Text style={styles.headerSubtitle}>Ready to start your hustle?</Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <GlassCard style={styles.taskCard}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <DollarSign size={20} color={premiumColors.neonGreen} />
                  <Text style={styles.detailLabel}>Payment</Text>
                  <Text style={styles.detailValue}>${task.payAmount}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Zap size={20} color={premiumColors.neonAmber} />
                  <Text style={styles.detailLabel}>XP Reward</Text>
                  <Text style={styles.detailValue}>{task.xpReward} XP</Text>
                </View>

                <View style={styles.detailItem}>
                  <Clock size={20} color={premiumColors.neonCyan} />
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{task.estimatedDuration || '1-2h'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <MapPin size={20} color={premiumColors.neonMagenta} />
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{task.distance?.toFixed(1) || '0.5'} mi</Text>
                </View>
              </View>
            </GlassCard>

            <HustleAIAssistant
              message={aiMessage}
              visible={showAI}
              variant="info"
            />

            <View style={styles.actions}>
              <NeonButton
                title="Start Now"
                onPress={handleStartNow}
                variant="cyan"
                icon={<Zap size={20} color={premiumColors.deepBlack} />}
                style={styles.actionButton}
                fullWidth
              />

              <NeonButton
                title="Schedule Later"
                onPress={handleScheduleLater}
                variant="violet"
                icon={<Calendar size={20} color={premiumColors.deepBlack} />}
                style={styles.actionButton}
                fullWidth
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showScheduleModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Task</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              AI-recommended time slots based on your schedule
            </Text>

            <ScrollView style={styles.slotsContainer}>
              {scheduleSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotCard,
                    selectedSlot?.id === slot.id && styles.slotCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedSlot(slot);
                    triggerHaptic('light');
                  }}
                >
                  <View style={styles.slotHeader}>
                    <Clock size={20} color={slot.recommended ? premiumColors.neonGreen : '#FFFFFF'} />
                    <Text style={styles.slotTime}>
                      {formatDate(slot.startTime)}
                    </Text>
                    {slot.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  {slot.reason && (
                    <Text style={styles.slotReason}>
                      {slot.reason}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <NeonButton
              title="Confirm Schedule"
              onPress={handleScheduleConfirm}
              variant="cyan"
              disabled={!selectedSlot}
              style={styles.confirmButton}
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
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.heavy,
    color: premiumColors.deepBlack,
    marginTop: spacing.md,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: premiumColors.deepBlack,
    opacity: 0.8,
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
    marginBottom: spacing.xl,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
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
    maxHeight: '80%',
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
  slotsContainer: {
    maxHeight: 400,
    marginBottom: spacing.lg,
  },
  slotCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  slotCardSelected: {
    borderColor: premiumColors.neonCyan,
    ...neonGlow.cyan,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  slotTime: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    flex: 1,
    color: '#FFFFFF',
  },
  recommendedBadge: {
    backgroundColor: premiumColors.neonGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  recommendedText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: premiumColors.deepBlack,
  },
  slotReason: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    marginTop: spacing.xs,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  confirmButton: {
    width: '100%',
  },
});
