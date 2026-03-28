import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, MapPin, Star, Clock, CheckCircle, TrendingUp, Award, Shield } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';
import { User, Task } from '@/types';
import Confetti from '@/components/Confetti';
import GlassCard from '@/components/GlassCard';
import { premiumColors } from '@/constants/designTokens';

const COUNTDOWN_SECONDS = 90;

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

function calculateMatchScore(worker: User, task: Task, distance: number): number {
  let score = 0;

  score += Math.max(0, 50 - distance * 2);
  
  score += worker.reputationScore * 5;
  
  const categoryMatch = worker.skills?.includes(task.category) ? 20 : 0;
  score += categoryMatch;
  
  score += Math.min(worker.tasksCompleted * 0.5, 15);
  
  const proofCount = worker.proofLinks?.length || 0;
  score += Math.min(proofCount * 2, 10);

  return Math.round(score);
}

export default function InstantMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, users, currentUser } = useApp();
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isHiring, setIsHiring] = useState<boolean>(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13] = useTranslatedTexts([
    'Instant Match',
    'Task not found',
    'Time Left',
    '⚡ AI-Powered Instant Match',
    'Top hustlers ranked by skills, distance & reputation',
    'No workers available right now',
    'Try again in a few minutes',
    'Worker',
    'Workers',
    'Available',
    'TOP MATCH',
    'Hiring...',
    'Instant Hire'
  ]);

  const task = tasks.find(t => t.id === id);

  const rankedWorkers = useMemo(() => {
    if (!task || !currentUser) return [];

    const availableWorkers = users.filter(u => 
      u.id !== currentUser.id &&
      (u.role === 'worker' || u.role === 'both') &&
      (u.availabilityStatus === 'available_now' || u.isOnline)
    );

    const workersWithScores = availableWorkers.map(worker => {
      const distance = calculateDistance(
        task.location.lat,
        task.location.lng,
        worker.location.lat,
        worker.location.lng
      );

      const matchScore = calculateMatchScore(worker, task, distance);

      return {
        worker,
        distance,
        matchScore,
      };
    });

    return workersWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }, [task, users, currentUser]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  if (!task || !currentUser) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t1,
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t2}</Text>
        </View>
      </View>
    );
  }

  const handleSelectWorker = (workerId: string) => {
    setSelectedWorkerId(workerId);
    triggerHaptic('medium');
  };

  const handleInstantHire = async () => {
    if (!selectedWorkerId) return;

    setIsHiring(true);
    triggerHaptic('success');

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await new Promise(resolve => setTimeout(resolve, 1500));

    setShowConfetti(true);

    setTimeout(() => {
      setIsHiring(false);
      router.back();
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Instant Match',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={[premiumColors.neonCyan + '30', premiumColors.neonViolet + '30']}
                style={styles.countdownCircle}
              >
                <Zap size={32} color={premiumColors.neonCyan} />
                <Text style={styles.countdownText}>{formatTime(countdown)}</Text>
                <Text style={styles.countdownLabel}>{t3}</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.headerTitle}>{t4}</Text>
            <Text style={styles.headerSubtitle}>
              {t5}
            </Text>
          </View>

          <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.taskCard}>
            <LinearGradient
              colors={[premiumColors.neonViolet + '15', premiumColors.neonCyan + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.taskGradient}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.taskMeta}>
                <View style={styles.taskMetaItem}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.taskMetaText}>{task.location.address}</Text>
                </View>
                <View style={styles.taskPayBadge}>
                  <Text style={styles.taskPay}>${task.payAmount}</Text>
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

          {rankedWorkers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t6}</Text>
              <Text style={styles.emptySubtext}>{t7}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {rankedWorkers.length} {rankedWorkers.length > 1 ? t9 : t8} {t10}
              </Text>
              {rankedWorkers.map(({ worker, distance, matchScore }, index) => (
                <TouchableOpacity
                  key={worker.id}
                  onPress={() => handleSelectWorker(worker.id)}
                >
                  <GlassCard
                    variant={selectedWorkerId === worker.id ? 'darkStrong' : 'dark'}
                    neonBorder={selectedWorkerId === worker.id}
                    glowColor="neonCyan"
                    style={styles.workerCard}
                  >
                    {index === 0 && (
                      <View style={styles.topMatchBadge}>
                        <Award size={14} color={premiumColors.neonAmber} />
                        <Text style={styles.topMatchText}>{t11}</Text>
                      </View>
                    )}
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.workerCardContent}>
                      <View style={styles.avatarContainer}>
                        <Image source={{ uri: worker.profilePic }} style={styles.workerAvatar} />
                        {worker.availabilityStatus === 'available_now' && (
                          <View style={styles.availableNowIndicator}>
                            <Zap size={10} color={premiumColors.deepBlack} fill={premiumColors.neonAmber} />
                          </View>
                        )}
                        {worker.isOnline && !worker.availabilityStatus && <View style={styles.onlineIndicator} />}
                      </View>
                      <View style={styles.workerInfo}>
                        <View style={styles.workerHeader}>
                          <Text style={styles.workerName}>{worker.name}</Text>
                          {worker.isVerified && (
                            <Shield size={16} color={premiumColors.neonCyan} />
                          )}
                        </View>
                        <View style={styles.workerStats}>
                          <View style={styles.workerStat}>
                            <Star size={14} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                            <Text style={styles.workerStatText}>
                              {worker.reputationScore.toFixed(1)}
                            </Text>
                          </View>
                          <View style={styles.workerStat}>
                            <MapPin size={14} color={premiumColors.neonViolet} />
                            <Text style={styles.workerStatText}>
                              {distance.toFixed(1)} mi
                            </Text>
                          </View>
                          <View style={styles.workerStat}>
                            <TrendingUp size={14} color={premiumColors.neonCyan} />
                            <Text style={styles.workerStatText}>
                              {worker.tasksCompleted}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.matchScoreContainer}>
                          <Text style={styles.matchScoreLabel}>AI Match Score</Text>
                          <View style={styles.matchScoreBar}>
                            <LinearGradient
                              colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={[
                                styles.matchScoreFill,
                                { width: `${matchScore}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.matchScoreValue}>{matchScore}%</Text>
                        </View>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </>
          )}

          {selectedWorkerId && (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.hireButton, isHiring && styles.hireButtonDisabled]}
                onPress={handleInstantHire}
                disabled={isHiring}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.accent]}
                  style={styles.hireGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Zap size={24} color={Colors.text} />
                  <Text style={styles.hireButtonText}>
                    {isHiring ? t12 : t13}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={styles.infoCard}>
            <Clock size={20} color={Colors.accent} />
            <Text style={styles.infoText}>
              Workers are ranked by skills, distance, and reputation. Select one to instantly hire!
            </Text>
          </View>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: premiumColors.neonCyan,
  },
  countdownText: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 8,
    letterSpacing: -1,
  },
  countdownLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600' as const,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  taskCard: {
    marginBottom: 24,
    overflow: 'visible',
  },
  taskGradient: {
    padding: 20,
    borderRadius: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  taskPayBadge: {
    backgroundColor: premiumColors.neonCyan + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  taskPay: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  workerCard: {
    marginBottom: 16,
    overflow: 'visible',
  },
  workerCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  topMatchBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: premiumColors.neonAmber,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  topMatchText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: premiumColors.neonViolet + '30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: premiumColors.neonViolet,
    zIndex: 5,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: premiumColors.neonViolet,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: premiumColors.neonGreen,
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
  },
  availableNowIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: premiumColors.neonAmber,
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  workerInfo: {
    flex: 1,
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  workerStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  workerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workerStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  matchScoreContainer: {
    gap: 4,
  },
  matchScoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  matchScoreBar: {
    height: 8,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 4,
    overflow: 'hidden',
  },
  matchScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  matchScoreValue: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
  },
  hireButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  hireButtonDisabled: {
    opacity: 0.6,
  },
  hireGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  hireButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
