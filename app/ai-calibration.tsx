import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Settings, RefreshCw, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors, spacing, borderRadius, typography, neonGlow } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';

import { aiFeedbackService, CalibrationMetric } from '@/utils/aiFeedbackService';

export default function AICalibrationScreen() {
  const [metrics, setMetrics] = useState<CalibrationMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const data = await aiFeedbackService.fetchCalibration();
      setMetrics(data);
    } catch (error) {
      console.error('[AICalibration] Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      case 'stable':
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return Colors.success;
      case 'down':
        return Colors.error;
      case 'stable':
      default:
        return Colors.info;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return Colors.success;
    if (confidence >= 70) return Colors.warning;
    return Colors.error;
  };

  const applyRecommendation = async (metric: CalibrationMetric) => {
    console.log(`[AICalibration] Applying recommendation for ${metric.metric}:`, metric.suggestedValue);
    
    const updatedMetrics = metrics.map(m =>
      m.metric === metric.metric
        ? { ...m, currentValue: m.suggestedValue, shouldUpdate: false }
        : m
    );
    setMetrics(updatedMetrics);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'AI Calibration', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading AI metrics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'AI Calibration', 
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        <GlassCard variant="dark" style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Settings size={32} color={premiumColors.neonCyan} />
          </View>
          <Text style={styles.headerTitle}>AI System Calibration</Text>
          <Text style={styles.headerSubtitle}>
            Real-time AI performance metrics and automatic optimization recommendations
          </Text>
        </GlassCard>

        {metrics.length === 0 ? (
          <GlassCard variant="dark" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No calibration data available yet.</Text>
            <Text style={styles.emptySubtext}>
              The AI engine needs more data to generate calibration recommendations.
            </Text>
          </GlassCard>
        ) : (
          <>
            {metrics.map((metric) => {
              const TrendIcon = getTrendIcon(metric.trend);
              const trendColor = getTrendColor(metric.trend);
              const confidenceColor = getConfidenceColor(metric.confidence);

              return (
                <GlassCard key={metric.metric} variant="darkStrong" style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricTitleRow}>
                      <Text style={styles.metricTitle}>{metric.metric.replace(/_/g, ' ').toUpperCase()}</Text>
                      <View style={[styles.trendBadge, { backgroundColor: trendColor + '20' }]}>
                        <TrendIcon size={14} color={trendColor} />
                        <Text style={[styles.trendText, { color: trendColor }]}>
                          {metric.trend}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.metricStats}>
                    <View style={styles.statColumn}>
                      <Text style={styles.statLabel}>Current Value</Text>
                      <Text style={styles.statValue}>{metric.currentValue}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statColumn}>
                      <Text style={styles.statLabel}>Success Rate</Text>
                      <Text style={styles.statValue}>{metric.successRate.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statColumn}>
                      <Text style={styles.statLabel}>Sample Size</Text>
                      <Text style={styles.statValue}>{metric.sampleSize}</Text>
                    </View>
                  </View>

                  <View style={styles.recommendationBox}>
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationTitle}>AI Recommendation</Text>
                      <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + '20' }]}>
                        <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                          {metric.confidence.toFixed(0)}% confidence
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.recommendationText}>{metric.recommendation}</Text>
                    
                    {metric.shouldUpdate && (
                      <View style={styles.suggestedValueRow}>
                        <Text style={styles.suggestedLabel}>Suggested Value:</Text>
                        <Text style={styles.suggestedValue}>{metric.suggestedValue}</Text>
                      </View>
                    )}
                  </View>

                  {metric.shouldUpdate ? (
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={() => applyRecommendation(metric)}
                      activeOpacity={0.7}
                    >
                      <CheckCircle size={20} color={Colors.success} />
                      <Text style={styles.applyButtonText}>Apply Recommendation</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.appliedBadge}>
                      <CheckCircle size={16} color={Colors.success} />
                      <Text style={styles.appliedText}>Recommendation Applied</Text>
                    </View>
                  )}
                </GlassCard>
              );
            })}
          </>
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <RefreshCw size={20} color={Colors.text} />
          <Text style={styles.refreshButtonText}>Refresh Metrics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  headerCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: premiumColors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...neonGlow.cyan,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  metricCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricHeader: {
    marginBottom: spacing.md,
  },
  metricTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  trendText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  metricStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: premiumColors.glassWhite,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  recommendationBox: {
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: premiumColors.neonCyan,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recommendationTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  confidenceText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  recommendationText: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  suggestedValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  suggestedLabel: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
  },
  suggestedValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonCyan,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success + '20',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  applyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.success,
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success + '20',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  appliedText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.success,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: premiumColors.glassDark,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  refreshButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
  },
});
