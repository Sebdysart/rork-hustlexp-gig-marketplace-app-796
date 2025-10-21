import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquare, ArrowLeft, Send, Star, Bug, Lightbulb, Zap } from 'lucide-react-native';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { useApp } from '@/contexts/AppContext';

type FeedbackType = 'bug' | 'feature' | 'general' | 'performance';

export default function BetaFeedbackScreen() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const feedbackTypes = [
    { id: 'bug' as const, label: 'Bug Report', icon: Bug, color: premiumColors.neonAmber },
    { id: 'feature' as const, label: 'Feature Request', icon: Lightbulb, color: premiumColors.neonCyan },
    { id: 'performance' as const, label: 'Performance', icon: Zap, color: premiumColors.neonViolet },
    { id: 'general' as const, label: 'General Feedback', icon: MessageSquare, color: premiumColors.neonGreen },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please provide both a title and description for your feedback.');
      return;
    }

    triggerHaptic('success');
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const feedback = {
      type: feedbackType,
      rating,
      title: title.trim(),
      description: description.trim(),
      userId: currentUser?.id,
      userName: currentUser?.name,
      timestamp: new Date().toISOString(),
    };

    console.log('[BetaFeedback] Submitted:', feedback);

    setIsSubmitting(false);
    Alert.alert(
      'Thank You! 🎉',
      'Your feedback has been received and will help us improve the app.',
      [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              triggerHaptic('light');
              router.back();
            }}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Beta Feedback</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="dark" style={styles.heroCard}>
            <LinearGradient
              colors={[premiumColors.neonCyan + '20', premiumColors.neonViolet + '15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <MessageSquare size={48} color={premiumColors.neonCyan} strokeWidth={2} />
              <Text style={styles.heroTitle}>Help Us Improve</Text>
              <Text style={styles.heroSubtitle}>
                Your feedback shapes the future of HustleXP. Thank you for being a beta tester!
              </Text>
            </LinearGradient>
          </GlassCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback Type</Text>
            <View style={styles.typeGrid}>
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isActive = feedbackType === type.id;

                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      isActive && { borderColor: type.color, backgroundColor: type.color + '15' },
                    ]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setFeedbackType(type.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon size={24} color={isActive ? type.color : Colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.typeLabel, isActive && { color: type.color }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Rating</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => {
                    triggerHaptic('light');
                    setRating(star);
                  }}
                  activeOpacity={0.7}
                >
                  <Star
                    size={40}
                    color={star <= rating ? premiumColors.neonAmber : Colors.textSecondary}
                    fill={star <= rating ? premiumColors.neonAmber : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title</Text>
            <GlassCard variant="dark" style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Brief summary of your feedback"
                placeholderTextColor={Colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <GlassCard variant="dark" style={styles.inputCard}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your feedback in detail..."
                placeholderTextColor={Colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
            </GlassCard>
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[premiumColors.neonCyan, premiumColors.neonCyan + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              <Send size={20} color={Colors.text} strokeWidth={2.5} />
              <Text style={styles.submitText}>
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  heroCard: {
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  inputCard: {
    padding: 0,
    overflow: 'hidden',
  },
  input: {
    fontSize: 15,
    color: Colors.text,
    padding: spacing.lg,
    minHeight: 50,
  },
  textArea: {
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  submitButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
});
