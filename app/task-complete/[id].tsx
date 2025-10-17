import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Trophy, TrendingUp, MessageCircle, DollarSign, Clock } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

import { useAILearning } from '@/utils/aiLearningIntegration';
import CompletionCelebration from '@/components/CompletionCelebration';
import NeonButton from '@/components/NeonButton';
import GlassCard from '@/components/GlassCard';
import { COLORS, premiumColors, spacing, typography, borderRadius } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';

export default function TaskCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, completeTask, currentUser } = useApp();
  const { submitTaskCompletion } = useAILearning();

  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [pricingFair, setPricingFair] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const task = tasks.find(t => t.id === id);

  const actualHours = 1;
  const predictedHours = task?.estimatedDuration ? parseFloat(task.estimatedDuration.split('-')[0]) : 1;
  const predictedPrice = task?.payAmount || 0;
  const actualPrice = task?.payAmount || 0;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    triggerHaptic('success');
  }, [fadeAnim]);

  if (!task || !currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Task not found</Text>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      await completeTask(task.id);

      await submitTaskCompletion(
        currentUser.id,
        task.id,
        rating,
        85,
        actualHours,
        pricingFair,
        predictedHours,
        predictedPrice,
        actualPrice
      );

      setShowCelebration(true);
      triggerHaptic('success');

      setTimeout(() => {
        router.back();
      }, 3000);
    } catch (error) {
      console.error('[TaskComplete] Error submitting completion:', error);
      triggerHaptic('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              setRating(star);
              triggerHaptic('light');
            }}
            style={styles.starButton}
            accessible={true}
            accessibilityLabel={`Rate ${star} out of 5 stars`}
            accessibilityRole="button"
          >
            <Star
              size={40}
              color={star <= rating ? premiumColors.gritGold : COLORS.textSecondary}
              fill={star <= rating ? premiumColors.gritGold : 'transparent'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTimeComparison = () => {
    const percentDiff = ((actualHours - predictedHours) / predictedHours) * 100;
    const isAccurate = Math.abs(percentDiff) < 20;

    return (
      <GlassCard variant="darkStrong" style={styles.comparisonCard}>
        <View style={styles.comparisonHeader}>
          <Clock size={20} color={premiumColors.neonCyan} />
          <Text style={styles.comparisonTitle}>Time Analysis</Text>
        </View>
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Estimated</Text>
            <Text style={styles.comparisonValue}>{predictedHours.toFixed(1)}h</Text>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Actual</Text>
            <Text style={styles.comparisonValue}>{actualHours.toFixed(1)}h</Text>
          </View>
        </View>
        {isAccurate && (
          <View style={styles.accuracyBadge}>
            <TrendingUp size={14} color={premiumColors.neonGreen} />
            <Text style={styles.accuracyText}>AI estimate was accurate!</Text>
          </View>
        )}
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal]}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <View style={styles.trophyContainer}>
                <Trophy size={64} color={premiumColors.gritGold} strokeWidth={2} />
              </View>
              <Text style={styles.title}>Task Complete! 🎉</Text>
              <Text style={styles.subtitle}>How did it go?</Text>
            </View>

            <GlassCard variant="darkStrong" style={styles.taskCard}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.taskMeta}>
                <View style={styles.metaItem}>
                  <DollarSign size={16} color={premiumColors.neonGreen} />
                  <Text style={styles.metaText}>${task.payAmount}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={16} color={premiumColors.neonCyan} />
                  <Text style={styles.metaText}>{actualHours.toFixed(1)}h</Text>
                </View>
              </View>
            </GlassCard>

            {renderTimeComparison()}

            <GlassCard variant="darkStrong" style={styles.ratingCard}>
              <Text style={styles.sectionTitle}>Rate this task</Text>
              {renderStars()}
            </GlassCard>

            <GlassCard variant="darkStrong" style={styles.pricingCard}>
              <Text style={styles.sectionTitle}>Was the pricing fair?</Text>
              <View style={styles.pricingButtons}>
                <TouchableOpacity
                  style={[
                    styles.pricingButton,
                    pricingFair && styles.pricingButtonActive
                  ]}
                  onPress={() => {
                    setPricingFair(true);
                    triggerHaptic('light');
                  }}
                  accessible={true}
                  accessibilityLabel="Pricing was fair"
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.pricingButtonText,
                    pricingFair && styles.pricingButtonTextActive
                  ]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pricingButton,
                    !pricingFair && styles.pricingButtonActive
                  ]}
                  onPress={() => {
                    setPricingFair(false);
                    triggerHaptic('light');
                  }}
                  accessible={true}
                  accessibilityLabel="Pricing was not fair"
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.pricingButtonText,
                    !pricingFair && styles.pricingButtonTextActive
                  ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            <GlassCard variant="darkStrong" style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <MessageCircle size={20} color={premiumColors.neonPurple} />
                <Text style={styles.sectionTitle}>Additional Feedback (Optional)</Text>
              </View>
              <TextInput
                style={styles.feedbackInput}
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Share your experience..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessible={true}
                accessibilityLabel="Feedback text input"
              />
            </GlassCard>

            <View style={styles.buttonContainer}>
              <NeonButton
                title={isSubmitting ? "Submitting..." : "Submit & Continue"}
                onPress={handleSubmit}
                disabled={isSubmitting}
                variant="cyan"
                fullWidth
                icon={<Trophy size={20} color={premiumColors.deepBlack} />}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {showCelebration && (
        <CompletionCelebration
          visible={showCelebration}
          xpEarned={task.xpReward}
          moneyEarned={task.payAmount}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorText: {
    color: COLORS.text,
    fontSize: typography.sizes.lg,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  trophyContainer: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  taskCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  taskTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: typography.weights.medium as any,
  },
  comparisonCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  comparisonTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: COLORS.text,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: typography.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  comparisonValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: premiumColors.neonCyan,
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: premiumColors.neonGreen + '20',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen,
  },
  accuracyText: {
    fontSize: typography.sizes.sm,
    color: premiumColors.neonGreen,
    fontWeight: typography.weights.medium as any,
  },
  ratingCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  pricingCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  pricingButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pricingButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: premiumColors.charcoal,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  pricingButtonActive: {
    backgroundColor: premiumColors.neonGreen + '20',
    borderColor: premiumColors.neonGreen,
  },
  pricingButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: COLORS.textSecondary,
  },
  pricingButtonTextActive: {
    color: premiumColors.neonGreen,
  },
  feedbackCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  feedbackInput: {
    backgroundColor: premiumColors.charcoal,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: COLORS.text,
    fontSize: typography.sizes.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
