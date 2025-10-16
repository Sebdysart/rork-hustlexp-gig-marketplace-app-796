import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Camera, Clock, MessageCircle, CheckCircle, Upload, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { triggerHaptic } from '@/utils/haptics';

type TaskStatus = 'accepted' | 'scheduled' | 'in-progress' | 'verification' | 'completed';

export default function TaskLifecycleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks } = useApp();
  const [status, setStatus] = useState<TaskStatus>('accepted');
  const [progress, setProgress] = useState<number>(0);
  const [showAIMessage, setShowAIMessage] = useState<boolean>(true);
  const [proofText, setProofText] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const task = tasks.find((t) => t.id === id);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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
  }, [pulseAnim]);

  useEffect(() => {
    if (status === 'in-progress') {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAIMessage(false);
    }, 5000) as unknown as number;
    return () => clearTimeout(timer as unknown as NodeJS.Timeout);
  }, []);

  const handleStartNow = () => {
    triggerHaptic('medium');
    setStatus('in-progress');
    setProgress(0);
  };

  const handleScheduleLater = () => {
    triggerHaptic('medium');
    setStatus('scheduled');
  };

  const handleMarkComplete = () => {
    triggerHaptic('medium');
    setStatus('verification');
  };

  const handleVerificationSubmit = () => {
    triggerHaptic('success');
    setStatus('completed');
    setTimeout(() => {
      router.push('/poster-dashboard' as any);
    }, 2000);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Task Not Found', headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: task.title,
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {showAIMessage && status === 'accepted' && (
          <Animated.View style={[styles.aiMessageContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>🤖</Text>
            </View>
            <View style={styles.aiMessageBubble}>
              <Text style={styles.aiMessageText}>
                Task confirmed! Would you like to start now or schedule for later?
              </Text>
            </View>
          </Animated.View>
        )}

        {status === 'accepted' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartNow}>
              <Clock size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Start Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleScheduleLater}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Schedule Later</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'scheduled' && (
          <View style={styles.scheduledContainer}>
            <Text style={styles.scheduledTitle}>Task Scheduled</Text>
            <Text style={styles.scheduledText}>
              AI recommends starting tomorrow at 9:00 AM based on your availability
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartNow}>
              <Text style={styles.primaryButtonText}>Start Early</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'in-progress' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Task In Progress</Text>
              <Text style={styles.timeElapsed}>{formatTime(timeElapsed)}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% Complete</Text>

            <View style={styles.subtasksContainer}>
              <Text style={styles.subtasksTitle}>Subtasks</Text>
              {['Prep', 'Main Work', 'Cleanup'].map((subtask, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.subtaskItem}
                  onPress={() => {
                    triggerHaptic('light');
                    setProgress(Math.min(100, progress + 33));
                  }}
                >
                  <CheckCircle
                    size={20}
                    color={progress > index * 33 ? Colors.success : Colors.textSecondary}
                  />
                  <Text style={styles.subtaskText}>{subtask}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleMarkComplete}>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'verification' && (
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationTitle}>Upload Proof of Completion</Text>
            <Text style={styles.verificationSubtitle}>
              Help us verify your work with photos, videos, or notes
            </Text>

            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadButton}>
                <Camera size={32} color={Colors.primary} />
                <Text style={styles.uploadButtonText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton}>
                <Upload size={32} color={Colors.primary} />
                <Text style={styles.uploadButtonText}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton}>
                <MessageCircle size={32} color={Colors.primary} />
                <Text style={styles.uploadButtonText}>Notes</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.proofInput}
              placeholder="Add notes about the completed work..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              value={proofText}
              onChangeText={setProofText}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleVerificationSubmit}>
              <Text style={styles.primaryButtonText}>Submit for Verification</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'completed' && (
          <View style={styles.completedContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.completedEmoji}>🎉</Text>
            </Animated.View>
            <Text style={styles.completedTitle}>Task Completed!</Text>
            <Text style={styles.completedSubtitle}>
              AI verified: matches task description
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+125</Text>
                <Text style={styles.statLabel}>HustleXP</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
                <Text style={styles.statLabel}>Time Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  aiMessageContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiAvatarText: {
    fontSize: 20,
  },
  aiMessageBubble: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiMessageText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  actionContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scheduledContainer: {
    alignItems: 'center',
    gap: 16,
  },
  scheduledTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scheduledText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    gap: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  timeElapsed: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  subtasksContainer: {
    gap: 12,
  },
  subtasksTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  subtaskText: {
    fontSize: 16,
    color: Colors.text,
  },
  verificationContainer: {
    gap: 20,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  verificationSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  proofInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completedContainer: {
    alignItems: 'center',
    gap: 16,
  },
  completedEmoji: {
    fontSize: 80,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  completedSubtitle: {
    fontSize: 16,
    color: Colors.success,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
