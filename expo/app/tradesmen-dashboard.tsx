import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Zap, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Clock, 
  Star,
  Briefcase,
  ChevronRight,
  Shield,
  Target,
  Flame
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors, spacing, typography, borderRadius, neonGlow } from '@/constants/designTokens';
import { TRADES, TRADE_BADGE_PROGRESSIONS } from '@/constants/tradesmen';
import GlassCard from '@/components/GlassCard';
import CircularProgress from '@/components/CircularProgress';
import TradeBadgeShowcase from '@/components/TradeBadgeShowcase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TradesmenDashboard() {
  const router = useRouter();
  const { currentUser } = useApp();

  if (!currentUser?.tradesmanProfile) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Tradesmen Dashboard', headerShown: true }} />
        <View style={styles.emptyState}>
          <Briefcase size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No Tradesmen Profile Found</Text>
          <Text style={styles.emptySubtext}>Complete onboarding to access Pro features</Text>
        </View>
      </View>
    );
  }

  const profile = currentUser.tradesmanProfile;
  const primaryTrade = profile.primaryTrade || profile.trades[0];
  const primaryTradeInfo = TRADES.find(t => t.id === primaryTrade);
  const currentBadgeLevel = profile.currentBadges[primaryTrade] || 'copper';
  const currentTradeXP = profile.tradeXP[primaryTrade] || 0;

  const badges = TRADE_BADGE_PROGRESSIONS[primaryTrade as keyof typeof TRADE_BADGE_PROGRESSIONS];
  const currentBadgeIndex = badges.findIndex((b: { level: string }) => b.level === currentBadgeLevel);
  const currentBadge = badges[currentBadgeIndex];
  const nextBadge = badges[currentBadgeIndex + 1];

  const xpProgress = nextBadge 
    ? ((currentTradeXP - currentBadge.xpRequired) / (nextBadge.xpRequired - currentBadge.xpRequired)) * 100
    : 100;

  const stats = [
    { 
      label: 'Jobs Completed', 
      value: profile.completedJobs.toString(), 
      icon: <Target size={20} color={premiumColors.neonCyan} />,
      gradient: [premiumColors.neonCyan, premiumColors.neonBlue]
    },
    { 
      label: 'Total Earnings', 
      value: `$${profile.businessMetrics.totalEarnings.toLocaleString()}`, 
      icon: <DollarSign size={20} color={premiumColors.neonGreen} />,
      gradient: [premiumColors.neonGreen, '#00CC66']
    },
    { 
      label: 'Avg Job Value', 
      value: `$${profile.businessMetrics.averageJobValue.toFixed(0)}`, 
      icon: <TrendingUp size={20} color={premiumColors.neonAmber} />,
      gradient: [premiumColors.neonAmber, '#FF9500']
    },
    { 
      label: 'Response Time', 
      value: `${profile.responseTime || 0}m`, 
      icon: <Clock size={20} color={premiumColors.neonMagenta} />,
      gradient: [premiumColors.neonMagenta, premiumColors.neonViolet]
    },
  ];

  const metrics = [
    { label: 'On-Time Rate', value: profile.businessMetrics.onTimeCompletion, max: 100, color: premiumColors.neonGreen },
    { label: 'Repeat Clients', value: profile.businessMetrics.repeatClients, max: profile.completedJobs || 1, color: premiumColors.neonCyan },
    { label: 'Trade XP', value: currentTradeXP, max: nextBadge?.xpRequired || currentTradeXP, color: premiumColors.neonAmber },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Tradesmen Pro', 
          headerShown: true,
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
        }} 
      />
      
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.headerCard}>
          <LinearGradient
            colors={[primaryTradeInfo?.color + '40' || premiumColors.neonCyan + '40', 'transparent']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View style={styles.tradeIconContainer}>
                  <Text style={styles.tradeIconLarge}>{primaryTradeInfo?.icon}</Text>
                  {profile.isPro && (
                    <View style={styles.proBadge}>
                      <Shield size={12} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                    </View>
                  )}
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.tradeName}>{primaryTradeInfo?.name}</Text>
                  <Text style={styles.tradeSubtitle}>Professional Tradesman</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                    <Text style={styles.ratingText}>{currentUser.reputationScore.toFixed(1)}</Text>
                    <Text style={styles.ratingCount}>({currentUser.tasksCompleted} jobs)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.availabilityContainer}>
                <View style={[styles.availabilityDot, profile.availableNow && styles.availableDotActive]} />
                <Text style={styles.availabilityText}>
                  {profile.availableNow ? 'Available Now' : 'Offline'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </GlassCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Badge Progress</Text>
          <GlassCard style={styles.badgeCard}>
            <View style={styles.badgeHeader}>
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeName}>{currentBadge.name}</Text>
                <Text style={styles.badgeDescription}>{currentBadge.description}</Text>
              </View>
              <View style={[styles.badgeIconContainer, { backgroundColor: currentBadge.color + '20' }]}>
                <Text style={styles.badgeIcon}>{primaryTradeInfo?.icon}</Text>
              </View>
            </View>

            {nextBadge && (
              <>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[currentBadge.color, nextBadge.color]}
                      style={[styles.progressFill, { width: `${Math.min(xpProgress, 100)}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {currentTradeXP} / {nextBadge.xpRequired} XP
                  </Text>
                </View>

                <View style={styles.nextBadgeContainer}>
                  <Text style={styles.nextBadgeLabel}>Next: {nextBadge.name}</Text>
                  <Text style={styles.nextBadgeXP}>{nextBadge.xpRequired - currentTradeXP} XP to go</Text>
                </View>
              </>
            )}

            <View style={styles.unlockEffects}>
              <Text style={styles.unlockEffectsTitle}>Current Perks:</Text>
              {currentBadge.unlockEffects.map((effect: string, index: number) => (
                <View key={index} style={styles.unlockEffect}>
                  <Zap size={14} color={currentBadge.color} />
                  <Text style={styles.unlockEffectText}>{effect}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Metrics</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <GlassCard key={index} style={styles.statCard}>
                <LinearGradient
                  colors={[stat.gradient[0] + '20', 'transparent']}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statIcon}>{stat.icon}</View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              </GlassCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <GlassCard style={styles.metricsCard}>
            {metrics.map((metric, index) => (
              <View key={index} style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>
                    {metric.label.includes('Rate') ? `${metric.value}%` : metric.value}
                  </Text>
                </View>
                <CircularProgress
                  size={60}
                  progress={(metric.value / metric.max) * 100}
                  strokeWidth={6}
                  color={metric.color}
                />
              </View>
            ))}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Trade Badges</Text>
          <View style={styles.allBadgesGrid}>
            {profile.trades.map((trade) => {
              const tradeInfo = TRADES.find(t => t.id === trade);
              const badgeLevel = profile.currentBadges[trade] || 'copper';
              const badges = TRADE_BADGE_PROGRESSIONS[trade as keyof typeof TRADE_BADGE_PROGRESSIONS];
              const badge = badges.find((b: { level: string }) => b.level === badgeLevel);
              
              if (!badge || !tradeInfo) return null;
              
              return (
                <GlassCard key={trade} style={styles.tradeBadgeCard}>
                  <TradeBadgeShowcase badge={badge} size="small" animated={false} showDetails={false} />
                  <Text style={styles.tradeBadgeName}>{tradeInfo.name}</Text>
                  <Text style={styles.tradeBadgeXP}>{profile.tradeXP[trade] || 0} XP</Text>
                </GlassCard>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Features</Text>
          <View style={styles.featuresGrid}>
            {[
              { title: 'My Offers', icon: <Briefcase size={24} color={premiumColors.neonCyan} />, route: '/offers/index' },
              { title: 'Portfolio', icon: <Briefcase size={24} color={premiumColors.neonCyan} />, route: '/portfolio' },
              { title: 'Pro Quests', icon: <Target size={24} color={premiumColors.neonAmber} />, route: '/pro-quests' },
              { title: 'Tool Inventory', icon: <Award size={24} color={premiumColors.neonMagenta} />, route: '/tool-inventory' },
              { title: 'Certifications', icon: <Shield size={24} color={premiumColors.neonGreen} />, route: '/certification-upload' },
            ].map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={() => router.push(feature.route as any)}
                activeOpacity={0.8}
              >
                <BlurView intensity={20} tint="dark" style={styles.featureBlur}>
                  <View style={styles.featureContent}>
                    {feature.icon}
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <ChevronRight size={20} color={Colors.textSecondary} />
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/pro')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[premiumColors.neonMagenta, premiumColors.neonViolet]}
              style={styles.upgradeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Flame size={24} color={Colors.text} />
              <View style={styles.upgradeTextContainer}>
                <Text style={styles.upgradeTitle}>Upgrade to Elite Pro</Text>
                <Text style={styles.upgradeSubtitle}>Unlock all features + zero commission</Text>
              </View>
              <ChevronRight size={24} color={Colors.text} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  headerCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: spacing.lg,
  },
  headerContent: {
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tradeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    position: 'relative',
  },
  tradeIconLarge: {
    fontSize: 40,
  },
  proBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.deepBlack,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
  },
  headerInfo: {
    flex: 1,
  },
  tradeName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
  },
  tradeSubtitle: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  ratingText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonAmber,
  },
  ratingCount: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    alignSelf: 'flex-start',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.textSecondary,
  },
  availableDotActive: {
    backgroundColor: premiumColors.neonGreen,
    ...neonGlow.green,
  },
  availabilityText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  badgeCard: {
    padding: spacing.lg,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  badgeDescription: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  badgeIcon: {
    fontSize: 32,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  nextBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  nextBadgeLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
  },
  nextBadgeXP: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  unlockEffects: {
    gap: spacing.sm,
  },
  unlockEffectsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  unlockEffect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unlockEffectText: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    overflow: 'hidden',
  },
  statGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  metricsCard: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonCyan,
  },
  featuresGrid: {
    gap: spacing.md,
  },
  featureCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  featureBlur: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  featureTitle: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
  },
  upgradeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...neonGlow.magenta,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  upgradeSubtitle: {
    fontSize: typography.sizes.sm,
    color: Colors.text,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  allBadgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tradeBadgeCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2) / 3,
    padding: spacing.sm,
    alignItems: 'center',
  },
  tradeBadgeName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  tradeBadgeXP: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
});
