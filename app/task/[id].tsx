import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, DollarSign, Calendar, Clock, User, Star, Zap, CheckCircle, Shield, Award, MessageCircle, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useAILearning } from '@/utils/aiLearningIntegration';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import Confetti from '@/components/Confetti';
import GlassCard from '@/components/GlassCard';
import { premiumColors } from '@/constants/designTokens';
import { scanTaskSafety, getRiskColor, SafetyScanResult } from '@/utils/aiSafetyScanner';
import { suggestTaskBundles, TaskBundle } from '@/utils/aiTaskBundling';
import TaskBundleSuggestions from '@/components/TaskBundleSuggestions';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, users, currentUser, acceptTask } = useApp();
  const { submitMatchRejection } = useAILearning();
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [viewStartTime] = useState<number>(Date.now());
  const [safetyScan, setSafetyScan] = useState<SafetyScanResult | null>(null);
  const [showSafetyDetails, setShowSafetyDetails] = useState<boolean>(false);
  const [taskBundles, setTaskBundles] = useState<TaskBundle[]>([]);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const task = tasks.find(t => t.id === id);
  const poster = task ? users.find(u => u.id === task.posterId) : null;
  const worker = task?.workerId ? users.find(u => u.id === task.workerId) : null;

  useEffect(() => {
    if (task && poster) {
      const performScan = async () => {
        const posterHistory = poster.posterProfile ? {
          tasksPosted: poster.posterProfile.tasksPosted,
          cancelRate: 0.1,
          avgRating: poster.posterProfile.avgRating,
          strikes: poster.strikes?.length || 0
        } : undefined;

        const result = await scanTaskSafety(task, posterHistory);
        setSafetyScan(result);
      };
      performScan();
    }
  }, [task, poster]);

  useEffect(() => {
    if (task && currentUser) {
      const isWorkerRole = currentUser.role === 'worker' || currentUser.role === 'both';
      const canAcceptTask = isWorkerRole && task.status === 'open' && task.posterId !== currentUser.id;
      
      if (canAcceptTask) {
        const suggestBundles = async () => {
          const openTasks = tasks.filter(t => t.status === 'open' && t.id !== task.id);
          const userLocation = currentUser.location || task.location;
          const bundles = await suggestTaskBundles(task, openTasks, userLocation, currentUser);
          setTaskBundles(bundles);
        };
        suggestBundles();
      }
    }
  }, [task, tasks, currentUser]);

  useEffect(() => {
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
  }, [pulseAnim]);

  useEffect(() => {
    return () => {
      const timeViewed = (Date.now() - viewStartTime) / 1000;
      const isWorker = currentUser?.role === 'worker' || currentUser?.role === 'both';
      const canAcceptTask = isWorker && task?.status === 'open' && task?.posterId !== currentUser?.id;
      
      if (currentUser && task && canAcceptTask && !isAccepting && timeViewed > 3) {
        submitMatchRejection(
          currentUser.id,
          task.id,
          85,
          88,
          'viewed_not_accepted'
        );
      }
    };
  }, [viewStartTime, currentUser, task, isAccepting, submitMatchRejection]);

  if (!task || !poster) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Quest Details',
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Quest not found</Text>
        </View>
      </View>
    );
  }

  const isWorker = currentUser?.role === 'worker' || currentUser?.role === 'both';
  const canAccept = isWorker && task.status === 'open' && task.posterId !== currentUser?.id;
  const isMyTask = task.posterId === currentUser?.id;
  const isAccepted = task.workerId === currentUser?.id;

  const handleAcceptQuest = async () => {
    if (!currentUser) return;

    setIsAccepting(true);
    triggerHaptic('success');

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    await acceptTask(task.id);
    
    setShowConfetti(true);
    
    setTimeout(() => {
      setIsAccepting(false);
      Alert.alert(
        'Quest Accepted! 🎉',
        `You have been instantly hired for "${task.title}"! The poster has been notified.`,
        [
          {
            text: 'View My Quests',
            onPress: () => router.push('/(tabs)/home'),
          },
        ]
      );
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Quest Details',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{task.category.toUpperCase()}</Text>
            </View>
            {task.status === 'open' && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.statusBadge}>
                  <Zap size={14} color={Colors.accent} />
                  <Text style={styles.statusText}>AVAILABLE NOW</Text>
                </View>
              </Animated.View>
            )}
            {task.status === 'in_progress' && (
              <View style={[styles.statusBadge, styles.statusBadgeInProgress]}>
                <Text style={styles.statusText}>IN PROGRESS</Text>
              </View>
            )}
            {task.status === 'completed' && (
              <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                <CheckCircle size={14} color={Colors.success} />
                <Text style={styles.statusText}>COMPLETED</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.description}>{task.description}</Text>

          {safetyScan && canAccept && (
            <TouchableOpacity
              onPress={() => {
                setShowSafetyDetails(!showSafetyDetails);
                triggerHaptic('light');
              }}
            >
              <GlassCard
                variant={safetyScan.overallRisk === 'low' ? 'dark' : 'darkStrong'}
                neonBorder
                glowColor={safetyScan.overallRisk === 'low' || safetyScan.overallRisk === 'critical' ? 'neonGreen' : 'neonAmber'}
                style={styles.safetyCard}
              >
                <View style={styles.safetyHeader}>
                  {safetyScan.overallRisk === 'low' ? (
                    <ShieldCheck size={24} color={getRiskColor(safetyScan.overallRisk)} />
                  ) : (
                    <AlertTriangle size={24} color={getRiskColor(safetyScan.overallRisk)} />
                  )}
                  <View style={styles.safetyHeaderText}>
                    <Text style={styles.safetyTitle}>AI Safety Scan</Text>
                    <Text style={[styles.safetyRiskLabel, { color: getRiskColor(safetyScan.overallRisk) }]}>
                      {safetyScan.overallRisk.toUpperCase()} RISK
                    </Text>
                  </View>
                </View>

                {showSafetyDetails && (
                  <View style={styles.safetyDetails}>
                    {safetyScan.flags.length > 0 && (
                      <View style={styles.flagsSection}>
                        <Text style={styles.flagsTitle}>⚠️ Concerns Detected:</Text>
                        {safetyScan.flags.map((flag, index) => (
                          <View key={index} style={styles.flagItem}>
                            <Text style={[styles.flagLevel, { color: getRiskColor(flag.level) }]}>•</Text>
                            <View style={styles.flagContent}>
                              <Text style={styles.flagMessage}>{flag.message}</Text>
                              <Text style={styles.flagRecommendation}>{flag.recommendation}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.recommendationsSection}>
                      {safetyScan.recommendations.map((rec, index) => (
                        <Text key={index} style={styles.recommendationText}>{rec}</Text>
                      ))}
                    </View>

                    {safetyScan.shouldBlock && (
                      <View style={styles.blockWarning}>
                        <Shield size={16} color={Colors.error} />
                        <Text style={styles.blockWarningText}>
                          We strongly recommend avoiding this task.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.safetyTapHint}>
                  {showSafetyDetails ? 'Tap to hide details' : 'Tap to view details'}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          )}

          {taskBundles.length > 0 && canAccept && (
            <TaskBundleSuggestions
              bundles={taskBundles}
              onSelectBundle={(bundle) => {
                console.log('Selected bundle:', bundle);
              }}
            />
          )}

          <View style={styles.infoGrid}>
            <GlassCard variant="dark" neonBorder glowColor="neonCyan" style={styles.infoCard}>
              <DollarSign size={28} color={premiumColors.neonCyan} />
              <Text style={styles.infoValue}>${task.payAmount}</Text>
              <Text style={styles.infoLabel}>{task.payType === 'fixed' ? 'Fixed Pay' : 'Per Hour'}</Text>
            </GlassCard>
            <GlassCard variant="dark" neonBorder glowColor="neonAmber" style={styles.infoCard}>
              <Zap size={28} color={premiumColors.neonAmber} />
              <Text style={styles.infoValue}>{task.xpReward}</Text>
              <Text style={styles.infoLabel}>Grit XP</Text>
            </GlassCard>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <MapPin size={20} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{task.location.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={20} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{formatDate(task.dateTime ||  '')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{formatTime(task.dateTime || '')}</Text>
            </View>
          </View>

          {task.extras && task.extras.length > 0 && (
            <View style={styles.extrasSection}>
              <Text style={styles.sectionTitle}>Extras</Text>
              <View style={styles.extrasList}>
                {task.extras.map((extra, index) => (
                  <View key={index} style={styles.extraChip}>
                    <Text style={styles.extraText}>{extra}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.posterSection}>
            <Text style={styles.sectionTitle}>Posted By</Text>
            <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.posterCard}>
              <View style={styles.posterCardContent}>
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: poster.profilePic }} style={styles.posterAvatar} />
                  {poster.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Shield size={12} color={premiumColors.neonCyan} />
                    </View>
                  )}
                </View>
                <View style={styles.posterInfo}>
                  <View style={styles.posterNameRow}>
                    <Text style={styles.posterName}>{poster.name}</Text>
                    <View style={styles.posterLevel}>
                      <Award size={12} color={premiumColors.neonAmber} />
                      <Text style={styles.posterLevelText}>Lv {poster.level}</Text>
                    </View>
                  </View>
                  <View style={styles.posterStats}>
                    <View style={styles.posterStat}>
                      <Star size={14} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                      <Text style={styles.posterRating}>{poster.reputationScore.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.posterDivider}>•</Text>
                    <Text style={styles.posterTaskCount}>{poster.tasksCompleted} quests</Text>
                  </View>
                </View>
              </View>
              {!isMyTask && (
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => {
                    triggerHaptic('light');
                    console.log('Open chat with poster');
                  }}
                >
                  <MessageCircle size={18} color={premiumColors.neonCyan} />
                  <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          </View>

          {worker && (
            <View style={styles.workerSection}>
              <Text style={styles.sectionTitle}>Accepted By</Text>
              <View style={styles.posterCard}>
                <Image source={{ uri: worker.profilePic }} style={styles.posterAvatar} />
                <View style={styles.posterInfo}>
                  <Text style={styles.posterName}>{worker.name}</Text>
                  <View style={styles.posterStats}>
                    <Star size={14} color={Colors.accent} />
                    <Text style={styles.posterRating}>{worker.reputationScore.toFixed(1)}</Text>
                    <Text style={styles.posterTaskCount}>• {worker.tasksCompleted} quests</Text>
                  </View>
                </View>
                <View style={styles.posterLevel}>
                  <Text style={styles.posterLevelText}>Lv {worker.level}</Text>
                </View>
              </View>
            </View>
          )}

          {canAccept && (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.acceptButton, isAccepting && styles.acceptButtonDisabled]}
                onPress={handleAcceptQuest}
                disabled={isAccepting}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.accent]}
                  style={styles.acceptGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Zap size={24} color={Colors.text} />
                  <Text style={styles.acceptButtonText}>
                    {isAccepting ? 'Accepting Quest...' : 'Accept Quest'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {isAccepted && (
            <View style={styles.acceptedBanner}>
              <CheckCircle size={24} color={Colors.success} />
              <Text style={styles.acceptedText}>You have accepted this quest!</Text>
            </View>
          )}

          {isMyTask && (
            <View style={styles.myTaskBanner}>
              <User size={24} color={Colors.accent} />
              <Text style={styles.myTaskText}>This is your quest</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
      {showConfetti && <Confetti />}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  statusBadge: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeInProgress: {
    backgroundColor: Colors.primary,
  },
  statusBadgeCompleted: {
    backgroundColor: Colors.success + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    overflow: 'visible',
  },
  infoValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  detailsSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  extrasSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  extrasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  extraChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  extraText: {
    fontSize: 14,
    color: Colors.text,
  },
  posterSection: {
    marginBottom: 24,
  },
  workerSection: {
    marginBottom: 24,
  },
  posterCard: {
    padding: 16,
    gap: 12,
    overflow: 'visible',
  },
  posterCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: premiumColors.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
  },
  posterAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  posterInfo: {
    flex: 1,
  },
  posterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  posterName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  posterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  posterStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  posterDivider: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  posterRating: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  posterTaskCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  posterLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  posterLevelText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: premiumColors.neonCyan + '20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  acceptButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  acceptButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  acceptedBanner: {
    backgroundColor: Colors.success + '20',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  acceptedText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  myTaskBanner: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  myTaskText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  safetyCard: {
    padding: 16,
    marginBottom: 20,
    overflow: 'visible',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  safetyHeaderText: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  safetyRiskLabel: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  safetyDetails: {
    marginTop: 16,
    gap: 12,
  },
  flagsSection: {
    gap: 8,
  },
  flagsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  flagItem: {
    flexDirection: 'row',
    gap: 8,
  },
  flagLevel: {
    fontSize: 20,
    fontWeight: '900' as const,
    lineHeight: 20,
  },
  flagContent: {
    flex: 1,
    gap: 4,
  },
  flagMessage: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  flagRecommendation: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  recommendationsSection: {
    backgroundColor: Colors.card + '80',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  recommendationText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  blockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.error + '20',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  blockWarningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  safetyTapHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
});
