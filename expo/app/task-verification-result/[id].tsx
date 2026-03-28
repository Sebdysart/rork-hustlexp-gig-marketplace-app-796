import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Loader, Eye, Clock, TrendingUp, XCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTaskLifecycle } from '@/contexts/TaskLifecycleContext';
import NeonButton from '@/components/NeonButton';
import GlassCard from '@/components/GlassCard';
import CircularProgress from '@/components/CircularProgress';
import { premiumColors, spacing, typography, borderRadius } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';

export default function TaskVerificationResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks } = useApp();
  const { getTaskVerification } = useTaskLifecycle();

  const [progress, setProgress] = useState<number>(0);
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [fadeAnim] = useState(new Animated.Value(0));

  const task = tasks.find(t => t.id === id);
  const verification = getTaskVerification(id || '');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [scaleAnim, fadeAnim]);

  useEffect(() => {
    if (verification?.aiVerificationStatus === 'verified') {
      triggerHaptic('success');
    }
  }, [verification?.aiVerificationStatus]);

  const handleContinue = () => {
    triggerHaptic('medium');
    router.push(`/task-complete/${id}` as any);
  };

  if (!task || !verification) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Verification' }} />
        <Text style={styles.errorText}>Verification not found</Text>
      </SafeAreaView>
    );
  }

  const isVerifying = verification.aiVerificationStatus === 'pending' || verification.aiVerificationStatus === 'verifying';
  const isVerified = verification.aiVerificationStatus === 'verified';
  const isFailed = verification.aiVerificationStatus === 'rejected';

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'AI Verification',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: '#FFFFFF',
          headerLeft: () => null,
        }} 
      />
      
      <LinearGradient
        colors={[
          premiumColors.deepBlack,
          isVerified ? premiumColors.neonGreen + '20' : premiumColors.neonCyan + '20'
        ]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.centerContent,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {isVerifying && (
              <>
                <View style={styles.iconContainer}>
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }}
                  >
                    <Loader size={64} color={premiumColors.neonCyan} strokeWidth={3} />
                  </Animated.View>
                </View>

                <Text style={styles.title}>Verifying Your Work</Text>
                <Text style={styles.subtitle}>
                  AI is analyzing your proof submission...
                </Text>

                <View style={styles.progressContainer}>
                  <CircularProgress
                    progress={progress / 100}
                    size={160}
                    strokeWidth={16}
                    color={premiumColors.neonCyan}
                    value={`${Math.round(progress)}%`}
                    label="Analyzing"
                  />
                </View>

                <GlassCard variant="dark" style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Eye size={20} color={premiumColors.neonCyan} />
                    <Text style={styles.infoText}>
                      Scanning {verification.proofData.length} proof item(s)
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Clock size={20} color={premiumColors.neonAmber} />
                    <Text style={styles.infoText}>
                      Estimated time: 5-10 seconds
                    </Text>
                  </View>
                </GlassCard>
              </>
            )}

            {isVerified && (
              <>
                <View style={[styles.iconContainer, styles.iconContainerSuccess]}>
                  <CheckCircle size={64} color={premiumColors.neonGreen} strokeWidth={3} />
                </View>

                <Text style={styles.title}>Verification Complete! ✅</Text>
                <Text style={styles.subtitle}>
                  Your work has been approved
                </Text>

                <View style={styles.statsGrid}>
                  <GlassCard 
                    variant="darkStrong" 
                    neonBorder 
                    glowColor="neonGreen"
                    style={styles.statCard}
                  >
                    <TrendingUp size={32} color={premiumColors.neonGreen} />
                    <Text style={styles.statValue}>{verification.aiConfidence?.toFixed(0)}%</Text>
                    <Text style={styles.statLabel}>Confidence</Text>
                  </GlassCard>

                  <GlassCard 
                    variant="darkStrong" 
                    neonBorder 
                    glowColor="neonCyan"
                    style={styles.statCard}
                  >
                    <CheckCircle size={32} color={premiumColors.neonCyan} />
                    <Text style={styles.statValue}>{verification.proofData.length}</Text>
                    <Text style={styles.statLabel}>Proof Items</Text>
                  </GlassCard>
                </View>

                {verification.aiNotes && (
                  <GlassCard variant="darkStrong" style={styles.notesCard}>
                    <Text style={styles.notesTitle}>AI Analysis</Text>
                    <Text style={styles.notesText}>{verification.aiNotes}</Text>
                  </GlassCard>
                )}

                <View style={styles.successBox}>
                  <CheckCircle size={24} color={premiumColors.neonGreen} />
                  <View style={styles.successContent}>
                    <Text style={styles.successTitle}>Payment Processing</Text>
                    <Text style={styles.successText}>
                      Your payment of ${task.payAmount} is being processed and will be available shortly.
                    </Text>
                  </View>
                </View>

                <NeonButton
                  title="Continue to Review"
                  onPress={handleContinue}
                  variant="green"
                  icon={<CheckCircle size={20} color={premiumColors.deepBlack} />}
                  fullWidth
                />
              </>
            )}

            {isFailed && (
              <>
                <View style={[styles.iconContainer, styles.iconContainerError]}>
                  <XCircle size={64} color={premiumColors.neonMagenta} strokeWidth={3} />
                </View>

                <Text style={styles.title}>Verification Failed</Text>
                <Text style={styles.subtitle}>
                  Unable to verify task completion
                </Text>

                <GlassCard variant="darkStrong" style={styles.notesCard}>
                  <Text style={styles.notesTitle}>Issues Detected</Text>
                  <Text style={styles.notesText}>
                    {verification.aiNotes || 'The submitted proof does not meet quality standards. Please retake photos with better lighting and clarity.'}
                  </Text>
                </GlassCard>

                <View style={styles.buttonGroup}>
                  <NeonButton
                    title="Resubmit Proof"
                    onPress={() => {
                      triggerHaptic('medium');
                      router.back();
                    }}
                    variant="cyan"
                    fullWidth
                  />
                  <NeonButton
                    title="Contact Support"
                    onPress={() => {
                      triggerHaptic('light');
                      router.push('/chat/hustleai');
                    }}
                    variant="violet"
                    fullWidth
                  />
                </View>
              </>
            )}
          </Animated.View>
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
    flexGrow: 1,
    padding: spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 3,
    borderColor: premiumColors.neonCyan + '40',
  },
  iconContainerSuccess: {
    backgroundColor: premiumColors.neonGreen + '20',
    borderColor: premiumColors.neonGreen + '40',
  },
  iconContainerError: {
    backgroundColor: premiumColors.neonMagenta + '20',
    borderColor: premiumColors.neonMagenta + '40',
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.heavy,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  progressContainer: {
    marginVertical: spacing.xxxl,
  },
  infoCard: {
    padding: spacing.lg,
    gap: spacing.md,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'visible',
  },
  statValue: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.heavy,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  notesCard: {
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  notesTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  notesText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  successBox: {
    flexDirection: 'row',
    backgroundColor: premiumColors.neonGreen + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '30',
    width: '100%',
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonGreen,
    marginBottom: spacing.xs,
  },
  successText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
  },
});
