import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Zap, TrendingUp, Award, CheckCircle2, X, Sparkles, BarChart3, HeadphonesIcon, Rocket } from 'lucide-react-native';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { SUBSCRIPTION_PLANS, getAnnualPrice, calculateSavings, type SubscriptionTier } from '@/constants/subscriptions';

export default function ProScreen() {
  const { currentUser } = useApp();
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('pro');

  if (!currentUser) return null;

  const currentTier = currentUser.subscription || 'free';
  const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);

  const handleSubscribe = (planId: SubscriptionTier) => {
    if (planId === 'free') return;

    triggerHaptic('success');
    Alert.alert(
      '🎉 Upgrade to ' + SUBSCRIPTION_PLANS.find(p => p.id === planId)?.name,
      `You're about to subscribe to ${SUBSCRIPTION_PLANS.find(p => p.id === planId)?.name} for $${isAnnual ? getAnnualPrice(SUBSCRIPTION_PLANS.find(p => p.id === planId)?.price || 0) : SUBSCRIPTION_PLANS.find(p => p.id === planId)?.price}/${isAnnual ? 'year' : 'month'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            Alert.alert('Success! 🎊', 'Your subscription is now active. Enjoy your premium benefits!');
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    triggerHaptic('medium');
    Alert.alert(
      'Manage Subscription',
      'View billing history, update payment method, or cancel subscription.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Billing History', onPress: () => {} },
        { text: 'Payment Method', onPress: () => {} },
        { text: 'Cancel Subscription', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'HustleXP Pro',
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal, premiumColors.deepBlack]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonAmber" style={styles.heroCard}>
            <LinearGradient
              colors={[premiumColors.neonAmber + '20', premiumColors.neonViolet + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroIcon}>
                <Crown size={48} color={premiumColors.neonAmber} />
              </View>
              <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
              <Text style={styles.heroSubtitle}>
                Get more tasks, earn more money, and level up faster with HustleXP Pro
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Zap size={24} color={premiumColors.neonCyan} />
                  <Text style={styles.statValue}>+50%</Text>
                  <Text style={styles.statLabel}>XP Boost</Text>
                </View>
                <View style={styles.statItem}>
                  <TrendingUp size={24} color={premiumColors.neonGreen} />
                  <Text style={styles.statValue}>60%</Text>
                  <Text style={styles.statLabel}>Lower Fees</Text>
                </View>
                <View style={styles.statItem}>
                  <Award size={24} color={premiumColors.neonAmber} />
                  <Text style={styles.statValue}>∞</Text>
                  <Text style={styles.statLabel}>Tasks</Text>
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

          <View style={styles.billingToggle}>
            <Text style={[styles.billingLabel, !isAnnual && styles.billingLabelActive]}>
              Monthly
            </Text>
            <Switch
              value={isAnnual}
              onValueChange={(value) => {
                setIsAnnual(value);
                triggerHaptic('selection');
              }}
              trackColor={{ false: premiumColors.richBlack, true: premiumColors.neonGreen + '50' }}
              thumbColor={isAnnual ? premiumColors.neonGreen : Colors.textSecondary}
              ios_backgroundColor={premiumColors.richBlack}
            />
            <View style={styles.annualLabelContainer}>
              <Text style={[styles.billingLabel, isAnnual && styles.billingLabelActive]}>
                Annual
              </Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save 20%</Text>
              </View>
            </View>
          </View>

          <View style={styles.plansContainer}>
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrentPlan = currentTier === plan.id;
              const price = isAnnual ? getAnnualPrice(plan.price) : plan.price;
              const savings = isAnnual ? calculateSavings(plan.price) : 0;

              return (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedPlan(plan.id);
                    triggerHaptic('light');
                  }}
                  disabled={plan.id === 'free'}
                >
                  <GlassCard
                    variant="dark"
                    style={[
                      styles.planCard,
                      selectedPlan === plan.id && styles.planCardSelected,
                      plan.popular && styles.planCardPopular,
                    ]}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Sparkles size={14} color={premiumColors.deepBlack} />
                        <Text style={styles.popularText}>MOST POPULAR</Text>
                      </View>
                    )}

                    <View style={styles.planHeader}>
                      <View style={[styles.planIcon, { backgroundColor: plan.color + '30' }]}>
                        <Text style={styles.planEmoji}>{plan.icon}</Text>
                      </View>
                      <View style={styles.planHeaderInfo}>
                        <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                        {isCurrentPlan && (
                          <View style={[styles.currentBadge, { backgroundColor: plan.color }]}>
                            <Text style={styles.currentBadgeText}>CURRENT</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.planPricing}>
                      <View style={styles.priceRow}>
                        <Text style={styles.currency}>$</Text>
                        <Text style={styles.price}>{price}</Text>
                        <Text style={styles.period}>/{isAnnual ? 'year' : 'month'}</Text>
                      </View>
                      {isAnnual && savings > 0 && (
                        <Text style={styles.savingsAmount}>Save ${savings}/year</Text>
                      )}
                    </View>

                    <View style={styles.featuresSection}>
                      {plan.features.slice(0, 4).map((feature) => (
                        <View key={feature.id} style={styles.featureRow}>
                          {feature.included ? (
                            <CheckCircle2 size={16} color={plan.color} />
                          ) : (
                            <X size={16} color={Colors.textSecondary} />
                          )}
                          <Text
                            style={[
                              styles.featureName,
                              !feature.included && styles.featureNameDisabled,
                            ]}
                          >
                            {feature.name}
                          </Text>
                          {feature.value && (
                            <Text style={[styles.featureValue, { color: plan.color }]}>
                              {feature.value}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>

                    {plan.id !== 'free' && !isCurrentPlan && (
                      <TouchableOpacity
                        style={styles.subscribeButton}
                        onPress={() => handleSubscribe(plan.id)}
                      >
                        <LinearGradient
                          colors={[plan.color, premiumColors.neonViolet]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.subscribeButtonGradient}
                        >
                          <Rocket size={18} color={Colors.text} />
                          <Text style={styles.subscribeButtonText}>Upgrade Now</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    {isCurrentPlan && plan.id !== 'free' && (
                      <TouchableOpacity
                        style={styles.manageButton}
                        onPress={handleManageSubscription}
                      >
                        <Text style={styles.manageButtonText}>Manage Subscription</Text>
                      </TouchableOpacity>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedPlanData && selectedPlanData.id !== 'free' && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Award size={20} color={premiumColors.neonAmber} />
                  <Text style={styles.sectionTitle}>All {selectedPlanData.name} Benefits</Text>
                </View>
              </View>

              <GlassCard variant="dark" style={styles.benefitsCard}>
                {selectedPlanData.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitRow}>
                    <CheckCircle2 size={18} color={selectedPlanData.color} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </GlassCard>
            </>
          )}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <BarChart3 size={20} color={premiumColors.neonCyan} />
              <Text style={styles.sectionTitle}>Feature Comparison</Text>
            </View>
          </View>

          <GlassCard variant="dark" style={styles.comparisonCard}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonHeaderText}>Feature</Text>
              <Text style={styles.comparisonHeaderText}>Free</Text>
              <Text style={styles.comparisonHeaderText}>Pro</Text>
              <Text style={styles.comparisonHeaderText}>Elite</Text>
            </View>

            {SUBSCRIPTION_PLANS[0].features.map((feature) => (
              <View key={feature.id} style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>{feature.name}</Text>
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const planFeature = plan.features.find(f => f.id === feature.id);
                  return (
                    <View key={plan.id} style={styles.comparisonCell}>
                      {planFeature?.included ? (
                        planFeature.value ? (
                          <Text style={[styles.comparisonValue, { color: plan.color }]}>
                            {planFeature.value}
                          </Text>
                        ) : (
                          <CheckCircle2 size={16} color={plan.color} />
                        )
                      ) : (
                        <X size={16} color={Colors.textSecondary} />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </GlassCard>

          <GlassCard variant="dark" style={styles.faqCard}>
            <Text style={styles.faqTitle}>💡 Frequently Asked Questions</Text>
            <View style={styles.faqList}>
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
                <Text style={styles.faqAnswer}>
                  Yes! You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
                </Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
                <Text style={styles.faqAnswer}>
                  We accept all major credit cards, debit cards, and digital wallets including Apple Pay and Google Pay.
                </Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Can I switch plans later?</Text>
                <Text style={styles.faqAnswer}>
                  Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard variant="dark" style={styles.supportCard}>
            <HeadphonesIcon size={24} color={premiumColors.neonCyan} />
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Need Help?</Text>
              <Text style={styles.supportText}>
                Our support team is here to answer any questions about subscriptions.
              </Text>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => {
                  triggerHaptic('medium');
                  Alert.alert('Contact Support', 'Email: support@hustlexp.com\nPhone: 1-800-HUSTLE');
                }}
              >
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
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
  heroCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
  },
  heroIcon: {
    width: 96,
    height: 96,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  billingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  billingLabelActive: {
    color: Colors.text,
  },
  annualLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingsBadge: {
    backgroundColor: premiumColors.neonGreen + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    padding: 20,
    position: 'relative',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: premiumColors.neonAmber,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planEmoji: {
    fontSize: 28,
  },
  planHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
  planPricing: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 4,
  },
  price: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 52,
  },
  period: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  savingsAmount: {
    fontSize: 14,
    color: premiumColors.neonGreen,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  featuresSection: {
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  featureNameDisabled: {
    color: Colors.textSecondary,
  },
  featureValue: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  manageButton: {
    backgroundColor: premiumColors.richBlack,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
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
  benefitsCard: {
    padding: 20,
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  benefitText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  comparisonCard: {
    padding: 16,
    marginBottom: 12,
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: premiumColors.glassWhite + '20',
    marginBottom: 12,
  },
  comparisonHeaderText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite + '10',
  },
  comparisonFeature: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonValue: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  faqCard: {
    padding: 20,
    marginBottom: 12,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  faqList: {
    gap: 16,
  },
  faqItem: {
    gap: 6,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  supportCard: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  supportText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: premiumColors.neonCyan + '20',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
});
