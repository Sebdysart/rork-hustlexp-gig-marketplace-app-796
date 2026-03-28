import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, CheckCircle, Camera, Navigation, AlertCircle, MessageCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { WorkroomStatus } from '@/types';
import PanicButton from '@/components/PanicButton';

const STATUS_STEPS: WorkroomStatus['status'][] = [
  'on_the_way',
  'on_site',
  'in_progress',
  'proof_ready',
  'completed',
];

const STATUS_LABELS = {
  on_the_way: 'On the Way',
  on_site: 'On Site',
  in_progress: 'In Progress',
  proof_ready: 'Proof Ready',
  completed: 'Completed',
};

const STATUS_ICONS = {
  on_the_way: Navigation,
  on_site: MapPin,
  in_progress: Clock,
  proof_ready: Camera,
  completed: CheckCircle,
};

export default function WorkroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, users, currentUser, completeTask } = useApp();
  const [workroomStatus, setWorkroomStatus] = useState<WorkroomStatus>({
    taskId: id || '',
    status: 'on_the_way',
  });
  const [notes, setNotes] = useState<string>('');
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);

  const task = tasks.find(t => t.id === id);
  const poster = task ? users.find(u => u.id === task.posterId) : null;
  const worker = task?.workerId ? users.find(u => u.id === task.workerId) : null;

  const isWorker = currentUser?.id === task?.workerId;
  const isPoster = currentUser?.id === task?.posterId;

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Workroom status:', workroomStatus.status);
    }, 5000);
    return () => clearInterval(interval);
  }, [workroomStatus]);

  if (!task || !currentUser) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Workroom',
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  const handleCheckIn = () => {
    triggerHaptic('success');
    setWorkroomStatus({
      ...workroomStatus,
      status: 'on_site',
      checkInTime: new Date().toISOString(),
      gpsLocation: currentUser.location,
    });
    Alert.alert('Checked In! 📍', 'You have arrived at the location.');
  };

  const handleStartWork = () => {
    triggerHaptic('success');
    setWorkroomStatus({
      ...workroomStatus,
      status: 'in_progress',
    });
    Alert.alert('Work Started! 🚀', 'Timer is now running.');
  };

  const handleAddProof = () => {
    triggerHaptic('medium');
    const mockPhoto = `https://images.unsplash.com/photo-${Date.now() % 1000000000000}?w=400`;
    setProofPhotos([...proofPhotos, mockPhoto]);
    setWorkroomStatus({
      ...workroomStatus,
      status: 'proof_ready',
      proofPhotos: [...proofPhotos, mockPhoto],
    });
    Alert.alert('Photo Added! 📸', 'Proof uploaded successfully.');
  };

  const handleComplete = async () => {
    if (proofPhotos.length === 0) {
      Alert.alert('Missing Proof', 'Please upload at least one photo before completing.');
      return;
    }

    triggerHaptic('success');
    setWorkroomStatus({
      ...workroomStatus,
      status: 'completed',
      checkOutTime: new Date().toISOString(),
      notes,
    });

    await completeTask(task.id);

    Alert.alert(
      'Quest Completed! 🎉',
      `You earned $${task.payAmount} and ${task.xpReward} XP!`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const currentStepIndex = STATUS_STEPS.indexOf(workroomStatus.status);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Workroom',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={styles.taskMeta}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.taskMetaText}>{task.location.address}</Text>
            </View>
          </View>

          <View style={styles.statusRing}>
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusRingGradient}
            >
              <View style={styles.statusRingInner}>
                {(() => {
                  const Icon = STATUS_ICONS[workroomStatus.status];
                  return <Icon size={48} color={Colors.accent} />;
                })()}
                <Text style={styles.statusRingText}>
                  {STATUS_LABELS[workroomStatus.status]}
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.progressBar}>
            {STATUS_STEPS.map((step, index) => (
              <View
                key={step}
                style={[
                  styles.progressStep,
                  index <= currentStepIndex && styles.progressStepActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.participantsCard}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <View style={styles.participantRow}>
              {poster && (
                <View style={styles.participant}>
                  <Image source={{ uri: poster.profilePic }} style={styles.participantAvatar} />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{poster.name}</Text>
                    <Text style={styles.participantRole}>Poster</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => router.push(`/chat/${task.id}`)}
                  >
                    <MessageCircle size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>
              )}
              {worker && (
                <View style={styles.participant}>
                  <Image source={{ uri: worker.profilePic }} style={styles.participantAvatar} />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{worker.name}</Text>
                    <Text style={styles.participantRole}>Worker</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => router.push(`/chat/${task.id}`)}
                  >
                    <MessageCircle size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {isWorker && (
            <>
              <View style={styles.actionsCard}>
                <Text style={styles.sectionTitle}>Actions</Text>
                {workroomStatus.status === 'on_the_way' && (
                  <TouchableOpacity style={styles.actionButton} onPress={handleCheckIn}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.accent]}
                      style={styles.actionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MapPin size={20} color={Colors.text} />
                      <Text style={styles.actionButtonText}>Check In (GPS)</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                {workroomStatus.status === 'on_site' && (
                  <TouchableOpacity style={styles.actionButton} onPress={handleStartWork}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.accent]}
                      style={styles.actionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Clock size={20} color={Colors.text} />
                      <Text style={styles.actionButtonText}>Start Work</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                {(workroomStatus.status === 'in_progress' || workroomStatus.status === 'proof_ready') && (
                  <>
                    <TouchableOpacity style={styles.actionButton} onPress={handleAddProof}>
                      <LinearGradient
                        colors={[Colors.primary, Colors.accent]}
                        style={styles.actionGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Camera size={20} color={Colors.text} />
                        <Text style={styles.actionButtonText}>Add Proof Photo</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    {proofPhotos.length > 0 && (
                      <TouchableOpacity style={styles.actionButton} onPress={handleComplete}>
                        <LinearGradient
                          colors={[Colors.success, Colors.accent]}
                          style={styles.actionGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <CheckCircle size={20} color={Colors.text} />
                          <Text style={styles.actionButtonText}>Complete Task</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              {proofPhotos.length > 0 && (
                <View style={styles.proofSection}>
                  <Text style={styles.sectionTitle}>Proof Photos ({proofPhotos.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.proofGrid}>
                      {proofPhotos.map((photo, index) => (
                        <Image key={index} source={{ uri: photo }} style={styles.proofPhoto} />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about the work..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </>
          )}

          <PanicButton taskId={task.id} style={styles.panicButton} />

          {isPoster && (
            <View style={styles.infoCard}>
              <AlertCircle size={20} color={Colors.accent} />
              <Text style={styles.infoText}>
                You can track the worker&apos;s progress in real-time. They will notify you when the task is complete.
              </Text>
            </View>
          )}

          {workroomStatus.checkInTime && (
            <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <View style={styles.timelineItem}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.timelineText}>
                  Checked in at {new Date(workroomStatus.checkInTime).toLocaleTimeString()}
                </Text>
              </View>
              {workroomStatus.checkOutTime && (
                <View style={styles.timelineItem}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.timelineText}>
                    Completed at {new Date(workroomStatus.checkOutTime).toLocaleTimeString()}
                  </Text>
                </View>
              )}
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
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  taskHeader: {
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusRing: {
    alignSelf: 'center',
    marginBottom: 24,
    borderRadius: 100,
    overflow: 'hidden',
  },
  statusRingGradient: {
    padding: 4,
  },
  statusRingInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  statusRingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.card,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: Colors.accent,
  },
  participantsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  participantRow: {
    gap: 12,
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  participantRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  proofSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  proofGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  proofPhoto: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  notesSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  timelineCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 14,
    color: Colors.text,
  },
  panicButton: {
    marginBottom: 16,
  },
});
