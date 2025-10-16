import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Crown, Zap, DollarSign, Award, Lock, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { HUSTLER_JOURNEY, getTierForLevel, getProgressToNextTier, canPrestige } from '@/constants/hustlerJourney';
import { getPrestigeDisplayName } from '@/utils/prestige';
import { COLORS } from '@/constants/designTokens';

export default function RoadmapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();

  if (!currentUser) return null;

  const currentTier = getTierForLevel(currentUser.level);
  const progress = getProgressToNextTier(currentUser.level);
  const canUserPrestige = canPrestige(currentUser.level);
  const prestigeLevel = currentUser.prestige?.level || 0;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Hustler\'s Journey',
          headerStyle: { backgroundColor: COLORS.background.primary },
          headerTintColor: COLORS.text.primary,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.background.primary, COLORS.background.secondary] as [string, string, ...string[]]}
          style={styles.header}
        >
          <Text style={styles.tagline}>Level Up IRL</Text>
          <Text style={styles.subtitle}>Earn. Evolve. Excel.</Text>
          
          <View style={styles.currentTierCard}>
            <LinearGradient
              colors={currentTier.themeColors.gradient as [string, string, ...string[]]}
              style={styles.tierGradient}
            >
              <View style={styles.tierHeader}>
                <Text style={styles.tierTitle}>{currentTier.title}</Text>
                {prestigeLevel > 0 && (
                  <Text style={styles.prestigeBadge}>{getPrestigeDisplayName(prestigeLevel)}</Text>
                )}
              </View>
              <Text style={styles.tierLevel}>Level {currentUser.level}</Text>
              <Text style={styles.tierVibe}>{currentTier.vibe}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}% to next tier
                </Text>
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>

        <View style={styles.journeyContainer}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          
          {HUSTLER_JOURNEY.map((tier, index) => {
            const isUnlocked = currentUser.level >= tier.minLevel;
            const isCurrent = tier.id === currentTier.id;
            const isCompleted = currentUser.level > tier.maxLevel;

            return (
              <View key={tier.id} style={styles.tierItem}>
                <View style={styles.tierLine}>
                  {index < HUSTLER_JOURNEY.length - 1 && (
                    <View style={[
                      styles.connectionLine,
                      isCompleted && styles.connectionLineCompleted
                    ]} />
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.tierCard,
                    isCurrent && styles.tierCardCurrent,
                    !isUnlocked && styles.tierCardLocked,
                  ]}
                  disabled={!isUnlocked}
                >
                  <LinearGradient
                    colors={(isUnlocked ? tier.themeColors.gradient : ['#1F1F1F', '#0A0A0A']) as [string, string, ...string[]]}
                    style={styles.tierCardGradient}
                  >
                    <View style={styles.tierCardHeader}>
                      <View style={styles.tierInfo}>
                        <View style={styles.tierTitleRow}>
                          <Text style={[styles.tierCardTitle, !isUnlocked && styles.lockedText]}>
                            {tier.title}
                          </Text>
                          {isCompleted && <CheckCircle2 size={20} color="#10B981" />}
                          {!isUnlocked && <Lock size={20} color="#6B7280" />}
                        </View>
                        <Text style={[styles.tierRange, !isUnlocked && styles.lockedText]}>
                          Levels {tier.minLevel}-{tier.maxLevel}
                        </Text>
                        <Text style={[styles.tierCardVibe, !isUnlocked && styles.lockedText]}>
                          {tier.vibe}
                        </Text>
                      </View>
                      <Text style={styles.tierNumber}>Tier {tier.tier}</Text>
                    </View>

                    {isUnlocked && (
                      <>
                        <View style={styles.rewardsSection}>
                          <Text style={styles.rewardsTitle}>Rewards</Text>
                          <View style={styles.rewardsList}>
                            {tier.rewards.grit && (
                              <View style={styles.rewardItem}>
                                <Zap size={16} color="#FFD700" />
                                <Text style={styles.rewardText}>{tier.rewards.grit}⚡ Grit</Text>
                              </View>
                            )}
                            {tier.rewards.taskCredits && (
                              <View style={styles.rewardItem}>
                                <DollarSign size={16} color="#10B981" />
                                <Text style={styles.rewardText}>${tier.rewards.taskCredits} Credits</Text>
                              </View>
                            )}
                            {tier.rewards.boostTokens && (
                              <View style={styles.rewardItem}>
                                <Award size={16} color="#A855F7" />
                                <Text style={styles.rewardText}>{tier.rewards.boostTokens} Boosts</Text>
                              </View>
                            )}
                            {tier.rewards.payoutBoost && (
                              <View style={styles.rewardItem}>
                                <DollarSign size={16} color="#10B981" />
                                <Text style={styles.rewardText}>+{tier.rewards.payoutBoost}% Payout</Text>
                              </View>
                            )}
                            {tier.rewards.badge && (
                              <View style={styles.rewardItem}>
                                <Award size={16} color="#F59E0B" />
                                <Text style={styles.rewardText}>{tier.rewards.badge} Badge</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.unlocksSection}>
                          <Text style={styles.unlocksTitle}>Unlocks</Text>
                          {tier.unlocks.map((unlock, i) => (
                            <Text key={i} style={styles.unlockItem}>• {unlock}</Text>
                          ))}
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}

          {canUserPrestige && (
            <View style={styles.prestigeCard}>
              <LinearGradient
                colors={['#A855F7', '#7C3AED', '#6D28D9']}
                style={styles.prestigeGradient}
              >
                <Crown size={48} color="#FFD700" />
                <Text style={styles.prestigeTitle}>Prestige Mode Unlocked!</Text>
                <Text style={styles.prestigeSubtitle}>
                  Reset to Level 1 with permanent bonuses
                </Text>
                <View style={styles.prestigeButton}>
                  <Text style={styles.prestigeButtonText}>Enter Prestige →</Text>
                </View>
              </LinearGradient>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  tagline: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  currentTierCard: {
    borderRadius: 20,
    overflow: 'hidden' as const,
  },
  tierGradient: {
    padding: 24,
  },
  tierHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  prestigeBadge: {
    fontSize: 20,
  },
  tierLevel: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  tierVibe: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden' as const,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center' as const,
  },
  journeyContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    marginBottom: 24,
  },
  tierItem: {
    flexDirection: 'row' as const,
    marginBottom: 16,
  },
  tierLine: {
    width: 40,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },
  connectionLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#2A2A2A',
    position: 'absolute' as const,
    top: 0,
  },
  connectionLineCompleted: {
    backgroundColor: '#10B981',
  },
  tierCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  tierCardCurrent: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  tierCardLocked: {
    opacity: 0.5,
  },
  tierCardGradient: {
    padding: 20,
  },
  tierCardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 4,
  },
  tierCardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tierRange: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  tierCardVibe: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    fontStyle: 'italic' as const,
  },
  tierNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  lockedText: {
    color: '#6B7280',
  },
  rewardsSection: {
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rewardsList: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  unlocksSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  unlocksTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  unlockItem: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  prestigeCard: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden' as const,
  },
  prestigeGradient: {
    padding: 32,
    alignItems: 'center' as const,
  },
  prestigeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  prestigeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  prestigeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  prestigeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000000',
  },
});
