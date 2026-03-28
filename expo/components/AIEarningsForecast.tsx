import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Info,
  Calendar,
  DollarSign,
  Zap
} from 'lucide-react-native';
import GlassCard from './GlassCard';
import { premiumColors, spacing, typography, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import Svg, { Circle } from 'react-native-svg';

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface ForecastData {
  period: 'week' | 'month';
  amount: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  breakdown: {
    basePay?: number;
    bonuses?: number;
    tips?: number;
    streakBonus?: number;
  };
  recommendations: string[];
  categories?: CategoryBreakdown[];
}

interface AIEarningsForecastProps {
  weeklyForecast: ForecastData;
  monthlyForecast: ForecastData;
  currentWeekEarnings: number;
  currentMonthEarnings: number;
  loading?: boolean;
}

function CircularProgress({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = premiumColors.neonCyan 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={premiumColors.glassWhite}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

export default function AIEarningsForecast({
  weeklyForecast,
  monthlyForecast,
  currentWeekEarnings,
  currentMonthEarnings,
  loading = false,
}: AIEarningsForecastProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  }, [glowAnim, scaleAnim]);

  const forecast = selectedPeriod === 'week' ? weeklyForecast : monthlyForecast;
  const currentEarnings = selectedPeriod === 'week' ? currentWeekEarnings : currentMonthEarnings;
  
  const progressToGoal = (currentEarnings / forecast.amount) * 100;
  const remaining = Math.max(0, forecast.amount - currentEarnings);

  const getTrendIcon = () => {
    if (forecast.trend === 'up') return <TrendingUp size={20} color={premiumColors.neonGreen} />;
    if (forecast.trend === 'down') return <TrendingDown size={20} color={premiumColors.neonAmber} />;
    return <Target size={20} color={Colors.textSecondary} />;
  };

  const getTrendColor = () => {
    if (forecast.trend === 'up') return premiumColors.neonGreen;
    if (forecast.trend === 'down') return premiumColors.neonAmber;
    return Colors.textSecondary;
  };

  if (loading) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <GlassCard variant="dark" neonBorder glowColor="neonCyan" style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={premiumColors.neonCyan} />
            <Text style={styles.loadingText}>AI analyzing your earning patterns...</Text>
            <Text style={styles.loadingSubtext}>Predicting future income based on your task history</Text>
          </View>
        </GlassCard>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <GlassCard variant="dark" neonBorder glowColor="neonCyan" style={styles.container}>
        <LinearGradient
          colors={[premiumColors.neonCyan + '15', 'transparent', premiumColors.neonMagenta + '10']}
          style={styles.gradient}
        />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIconContainer}>
              <Sparkles size={24} color={premiumColors.neonCyan} />
            </View>
            <View>
              <Text style={styles.title}>AI EARNINGS FORECAST</Text>
              <Text style={styles.subtitle}>Powered by HustleXP AI Engine</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setShowRecommendations(!showRecommendations);
              triggerHaptic('light');
            }}
            style={styles.infoButton}
          >
            <Info size={20} color={premiumColors.glassWhiteStrong} />
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'week' && styles.periodButtonActive,
            ]}
            onPress={() => {
              setSelectedPeriod('week');
              triggerHaptic('light');
            }}
          >
            <Calendar size={16} color={selectedPeriod === 'week' ? Colors.text : Colors.textSecondary} />
            <Text style={[
              styles.periodText,
              selectedPeriod === 'week' && styles.periodTextActive,
            ]}>
              Next Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.periodButtonActive,
            ]}
            onPress={() => {
              setSelectedPeriod('month');
              triggerHaptic('light');
            }}
          >
            <Calendar size={16} color={selectedPeriod === 'month' ? Colors.text : Colors.textSecondary} />
            <Text style={[
              styles.periodText,
              selectedPeriod === 'month' && styles.periodTextActive,
            ]}>
              Next Month
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainForecast}>
          <View style={styles.amountContainer}>
            <View style={styles.trendContainer}>
              {getTrendIcon()}
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {forecast.trend === 'up' ? 'Trending Up' : forecast.trend === 'down' ? 'Trending Down' : 'Stable'}
              </Text>
            </View>
            
            <View style={styles.amountRow}>
              <DollarSign size={32} color={premiumColors.neonCyan} />
              <Text style={styles.forecastAmount}>
                {forecast.amount.toFixed(0)}
              </Text>
            </View>

            <Text style={styles.periodLabel}>
              Projected {selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} Earnings
            </Text>

            <View style={styles.confidenceContainer}>
              <Zap size={14} color={premiumColors.neonAmber} />
              <Text style={styles.confidenceText}>
                {(forecast.confidence * 100).toFixed(0)}% confidence based on your history
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <CircularProgress 
              progress={Math.min(100, progressToGoal)} 
              color={getTrendColor()}
            />
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Current Progress</Text>
              <Text style={styles.progressValue}>${currentEarnings.toFixed(0)}</Text>
              {remaining > 0 && (
                <Text style={styles.remainingText}>
                  ${remaining.toFixed(0)} to goal
                </Text>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.breakdownButton}
          onPress={() => {
            setShowBreakdown(!showBreakdown);
            triggerHaptic('light');
          }}
        >
          <Target size={16} color={premiumColors.neonCyan} />
          <Text style={styles.breakdownButtonText}>
            {showBreakdown ? 'Hide' : 'Show'} Earnings Breakdown
          </Text>
        </TouchableOpacity>

        {showBreakdown && (
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownTitle}>Category Breakdown</Text>
            </View>
            
            <View style={styles.breakdownItems}>
              {forecast.breakdown.basePay !== undefined && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>💰 Base Pay</Text>
                  <Text style={styles.breakdownValue}>
                    ${forecast.breakdown.basePay.toFixed(0)}
                  </Text>
                </View>
              )}
              
              {forecast.breakdown.bonuses !== undefined && forecast.breakdown.bonuses > 0 && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>🎁 Bonuses</Text>
                  <Text style={[styles.breakdownValue, styles.bonusValue]}>
                    +${forecast.breakdown.bonuses.toFixed(0)}
                  </Text>
                </View>
              )}
              
              {forecast.breakdown.tips !== undefined && forecast.breakdown.tips > 0 && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>💵 Tips</Text>
                  <Text style={[styles.breakdownValue, styles.bonusValue]}>
                    +${forecast.breakdown.tips.toFixed(0)}
                  </Text>
                </View>
              )}
              
              {forecast.breakdown.streakBonus !== undefined && forecast.breakdown.streakBonus > 0 && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>🔥 Streak Bonus</Text>
                  <Text style={[styles.breakdownValue, styles.bonusValue]}>
                    +${forecast.breakdown.streakBonus.toFixed(0)}
                  </Text>
                </View>
              )}
            </View>

            {forecast.categories && forecast.categories.length > 0 && (
              <>
                <View style={styles.categoriesHeader}>
                  <Text style={styles.categoriesTitle}>Top Categories</Text>
                </View>
                {forecast.categories.slice(0, 3).map((cat, idx) => (
                  <View key={idx} style={styles.categoryItem}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryDot, { 
                        backgroundColor: idx === 0 ? premiumColors.neonCyan : 
                                       idx === 1 ? premiumColors.neonViolet : 
                                       premiumColors.neonAmber 
                      }]} />
                      <Text style={styles.categoryName}>{cat.category}</Text>
                      {cat.trend === 'up' && <TrendingUp size={12} color={premiumColors.neonGreen} />}
                      {cat.trend === 'down' && <TrendingDown size={12} color={premiumColors.neonAmber} />}
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryAmount}>${cat.amount.toFixed(0)}</Text>
                      <Text style={styles.categoryPercentage}>{cat.percentage}%</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {showRecommendations && forecast.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <View style={styles.recommendationsHeader}>
              <Sparkles size={16} color={premiumColors.neonAmber} />
              <Text style={styles.recommendationsTitle}>AI Recommendations</Text>
            </View>
            {forecast.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recommendationItem}>
                <View style={styles.recommendationBullet} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Predictions are based on your task history, completion rate, and market trends. 
            Actual earnings may vary.
          </Text>
        </View>

        {forecast.trend === 'up' && (
          <View style={styles.trendBanner}>
            <LinearGradient
              colors={[premiumColors.neonGreen + '20', 'transparent']}
              style={styles.trendBannerGradient}
            />
            <TrendingUp size={20} color={premiumColors.neonGreen} />
            <Text style={styles.trendBannerText}>
              📈 Your earnings are trending upward! Keep up the momentum!
            </Text>
          </View>
        )}

        {forecast.trend === 'down' && (
          <View style={[styles.trendBanner, styles.trendBannerWarning]}>
            <LinearGradient
              colors={[premiumColors.neonAmber + '20', 'transparent']}
              style={styles.trendBannerGradient}
            />
            <TrendingDown size={20} color={premiumColors.neonAmber} />
            <Text style={styles.trendBannerText}>
              📉 Earnings may be lower than usual. Check AI recommendations above.
            </Text>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    overflow: 'visible',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: premiumColors.neonCyan + '20',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoButton: {
    padding: spacing.sm,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: premiumColors.glassWhite,
  },
  periodButtonActive: {
    backgroundColor: premiumColors.neonCyan + '30',
    borderWidth: 1,
    borderColor: premiumColors.neonCyan,
  },
  periodText: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  periodTextActive: {
    color: Colors.text,
    fontWeight: typography.weights.bold,
  },
  mainForecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  amountContainer: {
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  trendText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  forecastAmount: {
    fontSize: 42,
    fontWeight: typography.weights.heavy,
    color: premiumColors.neonCyan,
    letterSpacing: -1,
  },
  periodLabel: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: premiumColors.neonAmber + '15',
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: typography.sizes.xs,
    color: premiumColors.neonAmber,
    fontWeight: typography.weights.semibold,
  },
  progressContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  remainingText: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  breakdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  breakdownButtonText: {
    fontSize: typography.sizes.sm,
    color: Colors.text,
    fontWeight: typography.weights.semibold,
  },
  breakdownContainer: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
    marginTop: spacing.md,
  },
  breakdownHeader: {
    marginBottom: spacing.md,
  },
  breakdownTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  breakdownItems: {
    gap: spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: borderRadius.sm,
  },
  breakdownLabel: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  breakdownValue: {
    fontSize: typography.sizes.md,
    color: Colors.text,
    fontWeight: typography.weights.bold,
  },
  bonusValue: {
    color: premiumColors.neonGreen,
  },
  categoriesHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  categoriesTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: typography.sizes.sm,
    color: Colors.text,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: typography.sizes.md,
    color: Colors.text,
    fontWeight: typography.weights.bold,
  },
  categoryPercentage: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
  },
  recommendationsContainer: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: premiumColors.neonAmber + '10',
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: premiumColors.neonAmber,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  recommendationsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: premiumColors.neonAmber,
    marginTop: 6,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  disclaimer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  disclaimerText: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic' as const,
    lineHeight: 16,
  },
  trendBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: premiumColors.neonGreen + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '40',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  trendBannerWarning: {
    backgroundColor: premiumColors.neonAmber + '15',
    borderColor: premiumColors.neonAmber + '40',
  },
  trendBannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  trendBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: Colors.text,
    fontWeight: typography.weights.semibold,
  },
  loadingSubtext: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
