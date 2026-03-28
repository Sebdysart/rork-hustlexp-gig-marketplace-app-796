import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Circle, ArrowLeft, Rocket, MessageSquare, Bug, TrendingUp } from 'lucide-react-native';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
}

export default function BetaChecklistScreen() {
  const router = useRouter();

  const checklistItems: ChecklistItem[] = [
    {
      id: 'onboarding',
      title: 'Complete Onboarding',
      description: 'Set up your profile and preferences',
      completed: true,
    },
    {
      id: 'post-task',
      title: 'Post Your First Task',
      description: 'Try creating a task to understand the poster experience',
      completed: false,
      action: () => router.push('/post-task'),
    },
    {
      id: 'accept-task',
      title: 'Accept a Task',
      description: 'Experience the worker side by completing a task',
      completed: false,
      action: () => router.push('/(tabs)/tasks'),
    },
    {
      id: 'hustleai',
      title: 'Chat with HustleAI',
      description: 'Try the AI assistant for task recommendations',
      completed: false,
      action: () => router.push('/chat/hustleai'),
    },
    {
      id: 'feedback',
      title: 'Submit Feedback',
      description: 'Share your thoughts and help us improve',
      completed: false,
      action: () => router.push('/beta-feedback'),
    },
    {
      id: 'explore',
      title: 'Explore Features',
      description: 'Check out badges, quests, and gamification',
      completed: false,
      action: () => router.push('/(tabs)/profile'),
    },
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;

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
          <Text style={styles.headerTitle}>Beta Checklist</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="dark" style={styles.heroCard}>
            <LinearGradient
              colors={[premiumColors.neonViolet + '20', premiumColors.neonCyan + '15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Rocket size={48} color={premiumColors.neonViolet} strokeWidth={2} />
              <Text style={styles.heroTitle}>Welcome to Beta!</Text>
              <Text style={styles.heroSubtitle}>
                Complete these steps to get the full HustleXP experience
              </Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedCount} of {totalCount} completed
                </Text>
              </View>
            </LinearGradient>
          </GlassCard>

          <View style={styles.checklistSection}>
            <Text style={styles.sectionTitle}>Getting Started</Text>
            {checklistItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() => {
                  if (item.action) {
                    triggerHaptic('medium');
                    item.action();
                  }
                }}
                activeOpacity={item.action ? 0.7 : 1}
                disabled={!item.action}
              >
                <GlassCard variant="dark" style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <View style={styles.itemLeft}>
                      {item.completed ? (
                        <CheckCircle2 size={28} color={premiumColors.neonGreen} strokeWidth={2.5} />
                      ) : (
                        <Circle size={28} color={Colors.textSecondary} strokeWidth={2} />
                      )}
                      <View style={styles.itemText}>
                        <Text style={[styles.itemTitle, item.completed && styles.itemTitleCompleted]}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemDescription}>{item.description}</Text>
                      </View>
                    </View>
                    {item.action && (
                      <View style={styles.actionIndicator}>
                        <Text style={styles.actionText}>Try it</Text>
                      </View>
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.quickLinksSection}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            <View style={styles.quickLinksGrid}>
              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/beta-feedback');
                }}
                activeOpacity={0.8}
              >
                <GlassCard variant="dark" style={styles.quickLinkInner}>
                  <MessageSquare size={32} color={premiumColors.neonCyan} strokeWidth={2} />
                  <Text style={styles.quickLinkTitle}>Give Feedback</Text>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => {
                  triggerHaptic('medium');
                  console.log('Report bug');
                }}
                activeOpacity={0.8}
              >
                <GlassCard variant="dark" style={styles.quickLinkInner}>
                  <Bug size={32} color={premiumColors.neonAmber} strokeWidth={2} />
                  <Text style={styles.quickLinkTitle}>Report Bug</Text>
                </GlassCard>
              </TouchableOpacity>
            </View>
          </View>

          <GlassCard variant="dark" style={styles.infoCard}>
            <TrendingUp size={24} color={premiumColors.neonViolet} strokeWidth={2} />
            <Text style={styles.infoTitle}>Thank You for Testing!</Text>
            <Text style={styles.infoText}>
              Your feedback is invaluable in shaping HustleXP. Help us build the best task marketplace experience.
            </Text>
          </GlassCard>
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
  progressContainer: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  checklistSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  checklistItem: {
    marginBottom: spacing.md,
  },
  itemCard: {
    padding: spacing.lg,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemText: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  itemTitleCompleted: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  itemDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  quickLinksSection: {
    marginBottom: spacing.xl,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickLinkCard: {
    flex: 1,
  },
  quickLinkInner: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  quickLinkTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  infoCard: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
