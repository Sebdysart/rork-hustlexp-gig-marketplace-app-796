import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Award,
  Clock,
  Target,
  Zap
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors, spacing, typography, borderRadius } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import CircularProgress from '@/components/CircularProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TradesmenEarnings() {
  const { currentUser, myAcceptedTasks } = useApp();

  if (!currentUser?.tradesmanProfile) {
    return null;
  }

  const profile = currentUser.tradesmanProfile;
  const completedTasks = myAcceptedTasks.filter(t => t.status === 'completed');

  const today = new Date();
  const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayEarnings = completedTasks
    .filter(t => t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.payAmount, 0);

  const weekEarnings = completedTasks
    .filter(t => t.completedAt && new Date(t.completedAt) >= thisWeekStart)
    .reduce((sum, t) => sum + t.payAmount, 0);

  const monthEarnings = completedTasks
    .filter(t => t.completedAt && new Date(t.completedAt) >= thisMonthStart)
    .reduce((sum, t) => sum + t.payAmount, 0);

  const weeklyHistory = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayEarnings = completedTasks
      .filter(t => t.completedAt && new Date(t.completedAt).toDateString() === date.toDateString())
      .reduce((sum, t) => sum + t.payAmount, 0);
    return dayEarnings;
  });

  const maxWeeklyEarning = Math.max(...weeklyHistory, 1);

  const stats = [
    {
      label: 'Today',
      value: `$${todayEarnings.toFixed(0)}`,
      icon: <DollarSign size={24} color={premiumColors.neonGreen} />,
      gradient: [premiumColors.neonGreen, '#00CC66'],
    },
    {
      label: 'This Week',
      value: `$${weekEarnings.toFixed(0)}`,
      icon: <Calendar size={24} color={premiumColors.neonCyan} />,
      gradient: [premiumColors.neonCyan, premiumColors.neonBlue],
    },
    {
      label: 'This Month',
      value: `$${monthEarnings.toFixed(0)}`,
      icon: <TrendingUp size={24} color={premiumColors.neonAmber} />,
      gradient: [premiumColors.neonAmber, '#FF9500'],
    },
    {
      label: 'All Time',
      value: `$${profile.businessMetrics.totalEarnings.toFixed(0)}`,
      icon: <Award size={24} color={premiumColors.neonMagenta} />,
      gradient: [premiumColors.neonMagenta, premiumColors.neonViolet],
    },
  ];

  const metrics = [
    {
      label: 'Avg Job Value',
      value: `$${profile.businessMetrics.averageJobValue.toFixed(0)}`,
      target: profile.businessMetrics.averageJobValue * 1.5,
      current: profile.businessMetrics.averageJobValue,
      color: premiumColors.neonCyan,
    },
    {
      label: 'Jobs This Month',
      value: completedTasks.filter(t => t.completedAt && new Date(t.completedAt) >= thisMonthStart).length.toString(),
      target: 20,
      current: completedTasks.filter(t => t.completedAt && new Date(t.completedAt) >= thisMonthStart).length,
      color: premiumColors.neonAmber,
    },
    {
      label: 'Repeat Clients',
      value: profile.businessMetrics.repeatClients.toString(),
      target: profile.completedJobs,
      current: profile.businessMetrics.repeatClients,
      color: premiumColors.neonGreen,
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Earnings',
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Earnings</Text>
          <GlassCard style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyHistory.map((earning, index) => {
                const height = (earning / maxWeeklyEarning) * 120;
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <LinearGradient
                        colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
                        style={[styles.bar, { height: Math.max(height, 4) }]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{days[index]}</Text>
                    <Text style={styles.barValue}>${earning.toFixed(0)}</Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <GlassCard style={styles.metricsCard}>
            {metrics.map((metric, index) => (
              <View key={index} style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                </View>
                <CircularProgress
                  size={60}
                  progress={(metric.current / metric.target) * 100}
                  strokeWidth={6}
                  color={metric.color}
                />
              </View>
            ))}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Boost Your Earnings</Text>
          <View style={styles.tipsGrid}>
            {[
              { icon: <Clock size={20} color={premiumColors.neonCyan} />, tip: 'Accept weekend jobs for 20% bonus' },
              { icon: <Target size={20} color={premiumColors.neonAmber} />, tip: 'Complete 5 jobs this week for streak bonus' },
              { icon: <Zap size={20} color={premiumColors.neonGreen} />, tip: 'Turn on GO Mode during peak hours' },
            ].map((item, index) => (
              <GlassCard key={index} style={styles.tipCard}>
                <View style={styles.tipIcon}>{item.icon}</View>
                <Text style={styles.tipText}>{item.tip}</Text>
              </GlassCard>
            ))}
          </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  chartCard: {
    padding: spacing.lg,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
  },
  barValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
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
  tipsGrid: {
    gap: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
