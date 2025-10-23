import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Lock, ChevronRight, Award, TrendingUp, Zap } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { KYC_TIERS, getUserKYCTier, getNextKYCTier, getKYCProgress } from '@/constants/kycTiers';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';

export default function KYCVerificationScreen() {
  const { currentUser } = useApp();

  const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18] = useTranslatedTexts([
    'KYC Verification',
    'Current Tier',
    'Progress to',
    'Current Benefits',
    'Next:',
    'Requirements',
    'REQUIRED',
    'Unlock These Benefits',
    'All Verification Tiers',
    'CURRENT',
    'Max Task Value',
    'Unlimited',
    'Trust Bonus',
    '🔒 Why Verify?',
    'Build Trust:',
    'Verified users get more tasks and higher ratings',
    'Unlock Features:',
    'Access higher-value tasks and premium benefits'
  ]);

  if (!currentUser) return null;

  const userVerifications = currentUser.verifications || [];
  const currentTier = getUserKYCTier(userVerifications);
  const nextTier = getNextKYCTier(currentTier);
  const progress = nextTier ? getKYCProgress(userVerifications, nextTier) : 100;

  const handleStartVerification = (requirementId: string) => {
    triggerHaptic('medium');
    
    switch (requirementId) {
      case 'email':
        Alert.alert('Email Verification', 'A verification link has been sent to your email address.');
        break;
      case 'phone':
        Alert.alert('Phone Verification', 'Enter your phone number to receive a verification code.');
        break;
      case 'id':
        router.push('/verification');
        break;
      case 'selfie':
        Alert.alert('Selfie Verification', 'Take a selfie to verify your identity.');
        break;
      case 'background':
        Alert.alert('Background Check', 'This will redirect you to our trusted partner for background verification.');
        break;
      case 'address':
        Alert.alert('Address Verification', 'Upload a utility bill or bank statement to verify your address.');
        break;
      case 'business':
        Alert.alert('Business License', 'Upload your business license or professional certification.');
        break;
      case 'insurance':
        Alert.alert('Insurance Proof', 'Upload proof of your liability insurance.');
        break;
      default:
        Alert.alert('Coming Soon', 'This verification method will be available soon.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t1,
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.currentTierCard}>
            <LinearGradient
              colors={[currentTier.color + '20', currentTier.color + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.currentTierGradient}
            >
              <View style={styles.currentTierHeader}>
                <View style={[styles.tierIconLarge, { backgroundColor: currentTier.color + '30' }]}>
                  <Text style={styles.tierEmojiLarge}>{currentTier.icon}</Text>
                </View>
                <View style={styles.currentTierInfo}>
                  <Text style={styles.currentTierLabel}>{t2}</Text>
                  <Text style={[styles.currentTierName, { color: currentTier.color }]}>
                    {currentTier.name}
                  </Text>
                  <Text style={styles.currentTierDescription}>{currentTier.description}</Text>
                </View>
              </View>

              {nextTier && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{t3} {nextTier.name}</Text>
                    <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[currentTier.color, nextTier.color]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${progress}%` }]}
                    />
                  </View>
                </View>
              )}

              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>{t4}</Text>
                <View style={styles.benefitsList}>
                  {currentTier.benefits.slice(0, 3).map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <CheckCircle2 size={14} color={currentTier.color} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

          {nextTier && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <TrendingUp size={20} color={premiumColors.neonAmber} />
                  <Text style={styles.sectionTitle}>{t5} {nextTier.name}</Text>
                </View>
              </View>

              <GlassCard variant="dark" style={styles.nextTierCard}>
                <View style={styles.nextTierHeader}>
                  <View style={[styles.tierIconMedium, { backgroundColor: nextTier.color + '30' }]}>
                    <Text style={styles.tierEmojiMedium}>{nextTier.icon}</Text>
                  </View>
                  <View style={styles.nextTierInfo}>
                    <Text style={[styles.nextTierName, { color: nextTier.color }]}>
                      {nextTier.name}
                    </Text>
                    <Text style={styles.nextTierDescription}>{nextTier.description}</Text>
                  </View>
                </View>

                <View style={styles.requirementsSection}>
                  <Text style={styles.requirementsTitle}>{t6}</Text>
                  {nextTier.requirements.map((req) => {
                    const isCompleted = userVerifications.includes(req.id);
                    return (
                      <TouchableOpacity
                        key={req.id}
                        style={[
                          styles.requirementItem,
                          isCompleted && styles.requirementItemCompleted,
                        ]}
                        onPress={() => !isCompleted && handleStartVerification(req.id)}
                        disabled={isCompleted}
                      >
                        <View style={styles.requirementLeft}>
                          <View
                            style={[
                              styles.requirementIcon,
                              isCompleted && styles.requirementIconCompleted,
                            ]}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={20} color={premiumColors.neonGreen} />
                            ) : (
                              <Text style={styles.requirementEmoji}>{req.icon}</Text>
                            )}
                          </View>
                          <View style={styles.requirementInfo}>
                            <View style={styles.requirementTitleRow}>
                              <Text style={styles.requirementName}>{req.name}</Text>
                              {req.required && (
                                <View style={styles.requiredBadge}>
                                  <Text style={styles.requiredText}>{t7}</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.requirementDescription}>{req.description}</Text>
                          </View>
                        </View>
                        {!isCompleted && (
                          <ChevronRight size={20} color={Colors.textSecondary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.nextBenefitsSection}>
                  <Text style={styles.nextBenefitsTitle}>{t8}</Text>
                  <View style={styles.nextBenefitsList}>
                    {nextTier.benefits.slice(0, 4).map((benefit, index) => (
                      <View key={index} style={styles.nextBenefitItem}>
                        <Zap size={14} color={nextTier.color} />
                        <Text style={styles.nextBenefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </GlassCard>
            </>
          )}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Award size={20} color={premiumColors.neonViolet} />
              <Text style={styles.sectionTitle}>{t9}</Text>
            </View>
          </View>

          {KYC_TIERS.slice(1).map((tier, index) => {
            const isUnlocked = tier.level <= currentTier.level;
            const isCurrent = tier.id === currentTier.id;

            return (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.tierCard,
                  isCurrent && styles.tierCardCurrent,
                ]}
                onPress={() => {
                  triggerHaptic('light');
                }}
                activeOpacity={0.8}
              >
                <GlassCard variant="dark" style={styles.tierCardInner}>
                  <View style={styles.tierCardHeader}>
                    <View style={[styles.tierIconSmall, { backgroundColor: tier.color + '30' }]}>
                      {isUnlocked ? (
                        <Text style={styles.tierEmojiSmall}>{tier.icon}</Text>
                      ) : (
                        <Lock size={20} color={Colors.textSecondary} />
                      )}
                    </View>
                    <View style={styles.tierCardInfo}>
                      <View style={styles.tierCardTitleRow}>
                        <Text style={[styles.tierCardName, { color: tier.color }]}>
                          {tier.name}
                        </Text>
                        {isCurrent && (
                          <View style={[styles.currentBadge, { backgroundColor: tier.color }]}>
                            <Text style={styles.currentBadgeText}>{t10}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.tierCardDescription}>{tier.description}</Text>
                    </View>
                  </View>

                  <View style={styles.tierCardStats}>
                    <View style={styles.tierCardStat}>
                      <Text style={styles.tierCardStatLabel}>{t11}</Text>
                      <Text style={[styles.tierCardStatValue, { color: tier.color }]}>
                        {tier.maxTaskValue === Infinity ? t12 : `${tier.maxTaskValue}`}
                      </Text>
                    </View>
                    <View style={styles.tierCardStat}>
                      <Text style={styles.tierCardStatLabel}>{t13}</Text>
                      <Text style={[styles.tierCardStatValue, { color: tier.color }]}>
                        +{tier.trustScoreBonus}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}

          <GlassCard variant="dark" style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t14}</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>{t15}</Text> {t16}
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>{t17}</Text> {t18}
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Lower Fees:</Text> Higher tiers pay lower platform fees
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Safety First:</Text> Verification protects both workers and posters
              </Text>
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
  currentTierCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  currentTierGradient: {
    padding: 20,
    borderRadius: 16,
  },
  currentTierHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  tierIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierEmojiLarge: {
    fontSize: 36,
  },
  currentTierInfo: {
    flex: 1,
  },
  currentTierLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  currentTierName: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  currentTierDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  progressPercent: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  progressBar: {
    height: 10,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  benefitsSection: {},
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  nextTierCard: {
    padding: 20,
    marginBottom: 12,
  },
  nextTierHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tierIconMedium: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierEmojiMedium: {
    fontSize: 28,
  },
  nextTierInfo: {
    flex: 1,
  },
  nextTierName: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  nextTierDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  requirementsSection: {
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    marginBottom: 8,
  },
  requirementItemCompleted: {
    backgroundColor: premiumColors.neonGreen + '15',
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '30',
  },
  requirementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  requirementIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: premiumColors.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementIconCompleted: {
    backgroundColor: premiumColors.neonGreen + '20',
  },
  requirementEmoji: {
    fontSize: 20,
  },
  requirementInfo: {
    flex: 1,
  },
  requirementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  requirementName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  requiredBadge: {
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
    letterSpacing: 0.5,
  },
  requirementDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  nextBenefitsSection: {},
  nextBenefitsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  nextBenefitsList: {
    gap: 8,
  },
  nextBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextBenefitText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  tierCard: {
    marginBottom: 12,
  },
  tierCardCurrent: {
    transform: [{ scale: 1.02 }],
  },
  tierCardInner: {
    padding: 16,
  },
  tierCardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tierIconSmall: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierEmojiSmall: {
    fontSize: 24,
  },
  tierCardInfo: {
    flex: 1,
  },
  tierCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tierCardName: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
  tierCardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tierCardStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tierCardStat: {
    flex: 1,
  },
  tierCardStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  tierCardStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  infoCard: {
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
