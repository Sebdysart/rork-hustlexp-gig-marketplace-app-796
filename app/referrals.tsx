import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Copy, Share2, Gift, Users, TrendingUp, Award, CheckCircle2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import {
  REFERRAL_REWARDS,
  REFERRAL_TIERS,
  generateReferralCode,
  calculateReferralProgress,
} from '@/constants/referrals';

export default function ReferralsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  const referralCode = generateReferralCode(currentUser.id);
  const referralCount = 0;
  const { currentTier, nextTier, progress } = calculateReferralProgress(referralCount);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    const message = `Join me on HustleXP and earn money doing tasks! Use my code ${referralCode} to get bonus rewards. Download now: https://hustlexp.app/ref/${referralCode}`;
    
    try {
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(message);
        alert('Referral link copied to clipboard!');
      } else {
        await Share.share({
          message,
          title: 'Join HustleXP',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Refer & Earn',
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal, premiumColors.richBlack]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.heroCard}>
            <LinearGradient
              colors={[premiumColors.neonViolet + '20', premiumColors.neonCyan + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroIcon}>
                <Gift size={48} color={premiumColors.neonViolet} />
              </View>
              <Text style={styles.heroTitle}>Invite Friends, Earn Together</Text>
              <Text style={styles.heroSubtitle}>
                Get rewarded when your friends join and complete their first task
              </Text>
            </LinearGradient>
          </GlassCard>

          <GlassCard variant="dark" style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.code}>{referralCode}</Text>
            </View>
            <View style={styles.codeActions}>
              <TouchableOpacity
                style={[styles.codeButton, styles.copyButton]}
                onPress={handleCopyCode}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={18} color={premiumColors.neonGreen} />
                    <Text style={[styles.codeButtonText, { color: premiumColors.neonGreen }]}>
                      Copied!
                    </Text>
                  </>
                ) : (
                  <>
                    <Copy size={18} color={premiumColors.neonCyan} />
                    <Text style={styles.codeButtonText}>Copy Code</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.codeButton, styles.shareButton]}
                onPress={handleShare}
              >
                <Share2 size={18} color={premiumColors.neonViolet} />
                <Text style={styles.codeButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          <GlassCard variant="dark" style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Users size={20} color={premiumColors.neonCyan} />
              <Text style={styles.statsTitle}>Your Referral Stats</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{referralCount}</Text>
                <Text style={styles.statLabel}>Total Referrals</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>$0</Text>
                <Text style={styles.statLabel}>Earned</Text>
              </View>
            </View>
          </GlassCard>

          {nextTier && (
            <GlassCard variant="dark" style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressHeaderLeft}>
                  <TrendingUp size={20} color={premiumColors.neonAmber} />
                  <Text style={styles.progressTitle}>Progress to {nextTier.name}</Text>
                </View>
                <Text style={styles.progressCount}>
                  {referralCount}/{nextTier.referralsRequired}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
              <Text style={styles.progressSubtitle}>
                {nextTier.referralsRequired - referralCount} more referrals to unlock
              </Text>
            </GlassCard>
          )}

          <View style={styles.sectionHeader}>
            <Award size={20} color={premiumColors.neonAmber} />
            <Text style={styles.sectionTitle}>Rewards</Text>
          </View>

          <GlassCard variant="dark" style={styles.rewardsCard}>
            <Text style={styles.rewardsSubtitle}>When your friend signs up:</Text>
            <View style={styles.rewardsList}>
              {REFERRAL_REWARDS.referrer.immediate.map((reward) => (
                <View key={reward.id} style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  <Text style={styles.rewardText}>{reward.description}</Text>
                </View>
              ))}
            </View>

            <View style={styles.rewardsDivider} />

            <Text style={styles.rewardsSubtitle}>When they complete their first task:</Text>
            <View style={styles.rewardsList}>
              {REFERRAL_REWARDS.referrer.onFirstTask.map((reward) => (
                <View key={reward.id} style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  <Text style={styles.rewardText}>{reward.description}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={premiumColors.neonViolet} />
            <Text style={styles.sectionTitle}>Referral Tiers</Text>
          </View>

          {REFERRAL_TIERS.map((tier, index) => {
            const isUnlocked = referralCount >= tier.referralsRequired;
            const isCurrent = currentTier?.tier === tier.tier;

            return (
              <GlassCard
                key={tier.tier}
                variant="dark"
                style={[
                  styles.tierCard,
                  isCurrent && styles.tierCardCurrent,
                  !isUnlocked && styles.tierCardLocked,
                ]}
              >
                <View style={styles.tierHeader}>
                  <View style={styles.tierLeft}>
                    <View
                      style={[
                        styles.tierIconContainer,
                        { backgroundColor: tier.color + '20' },
                        isCurrent && { borderColor: tier.color, borderWidth: 2 },
                      ]}
                    >
                      <Text style={styles.tierNumber}>{tier.tier}</Text>
                    </View>
                    <View>
                      <Text style={[styles.tierName, { color: tier.color }]}>
                        {tier.name}
                      </Text>
                      <Text style={styles.tierRequirement}>
                        {tier.referralsRequired} referrals
                      </Text>
                    </View>
                  </View>
                  {isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: tier.color }]}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                  {isUnlocked && !isCurrent && (
                    <CheckCircle2 size={24} color={premiumColors.neonGreen} />
                  )}
                </View>

                {isUnlocked && (
                  <View style={styles.tierRewards}>
                    {tier.rewards.map((reward) => (
                      <View key={reward.id} style={styles.tierRewardItem}>
                        <Text style={styles.tierRewardIcon}>{reward.icon}</Text>
                        <Text style={styles.tierRewardText}>{reward.description}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>
            );
          })}

          <GlassCard variant="dark" style={styles.infoCard}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <View style={styles.infoSteps}>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>1</Text>
                </View>
                <Text style={styles.infoStepText}>
                  Share your referral code with friends
                </Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>2</Text>
                </View>
                <Text style={styles.infoStepText}>
                  They sign up using your code
                </Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>3</Text>
                </View>
                <Text style={styles.infoStepText}>
                  You both get instant rewards!
                </Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>4</Text>
                </View>
                <Text style={styles.infoStepText}>
                  Earn more when they complete tasks
                </Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  backButton: {
    padding: 8,
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
  heroCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeCard: {
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '600' as const,
  },
  codeContainer: {
    backgroundColor: premiumColors.richBlack,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
  },
  code: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
    letterSpacing: 4,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  codeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  copyButton: {
    backgroundColor: premiumColors.neonCyan + '20',
    borderColor: premiumColors.neonCyan,
  },
  shareButton: {
    backgroundColor: premiumColors.neonViolet + '20',
    borderColor: premiumColors.neonViolet,
  },
  codeButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statsCard: {
    padding: 20,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: premiumColors.glassWhite,
    opacity: 0.2,
  },
  progressCard: {
    padding: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  rewardsCard: {
    padding: 20,
    marginBottom: 20,
  },
  rewardsSubtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  rewardsList: {
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardIcon: {
    fontSize: 20,
  },
  rewardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  rewardsDivider: {
    height: 1,
    backgroundColor: premiumColors.glassWhite,
    opacity: 0.2,
    marginVertical: 20,
  },
  tierCard: {
    padding: 20,
    marginBottom: 12,
  },
  tierCardCurrent: {
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
  },
  tierCardLocked: {
    opacity: 0.5,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierNumber: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  tierRequirement: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
  tierRewards: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite + '20',
  },
  tierRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tierRewardIcon: {
    fontSize: 16,
  },
  tierRewardText: {
    fontSize: 13,
    color: Colors.text,
  },
  infoCard: {
    padding: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  infoSteps: {
    gap: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: premiumColors.neonCyan + '20',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoStepNumberText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
  },
  infoStepText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
});
