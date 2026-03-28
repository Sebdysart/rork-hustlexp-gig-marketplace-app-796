import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Calendar,
} from 'lucide-react-native';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Analytics } from '@/utils/analytics';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard = ({ title, value, change, icon, color }: MetricCardProps) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIconContainer, { backgroundColor: color + '20' }]}>
      <Text>{icon}</Text>
    </View>
    <View style={styles.metricContent}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {change !== undefined && (
        <View style={styles.metricChange}>
          {change >= 0 ? (
            <TrendingUp size={14} color="#10B981" />
          ) : (
            <TrendingDown size={14} color="#EF4444" />
          )}
          <Text style={[styles.metricChangeText, { color: change >= 0 ? '#10B981' : '#EF4444' }]}>
            {Math.abs(change).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  </View>
);

interface ChartData {
  labels: string[];
  data: number[];
  color: string;
}

const SimpleLineChart = ({ labels, data, color }: ChartData) => {
  const maxValue = Math.max(...data, 1);
  const chartWidth = width - 64;
  const chartHeight = 150;
  const pointSpacing = chartWidth / (data.length - 1 || 1);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chart}>
        {data.map((value, index) => {
          const height = (value / maxValue) * chartHeight;
          const left = index * pointSpacing;
          
          return (
            <View
              key={index}
              style={[
                styles.chartBar,
                {
                  height: Math.max(height, 4),
                  left,
                  backgroundColor: color,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.chartLabels}>
        {labels.map((label, index) => (
          <Text key={index} style={styles.chartLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const FunnelView = ({ stages }: { stages: { name: string; users: number; conversionRate: number }[] }) => {
  const maxUsers = Math.max(...stages.map(s => s.users), 1);

  return (
    <View style={styles.funnelContainer}>
      {stages.map((stage, index) => {
        const widthPercent = (stage.users / maxUsers) * 100;
        
        return (
          <View key={index} style={styles.funnelStage}>
            <View style={[styles.funnelBar, { width: `${widthPercent}%` }]}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.funnelGradient}
              />
            </View>
            <View style={styles.funnelInfo}>
              <Text style={styles.funnelStageName}>{stage.name.replace('_', ' ')}</Text>
              <View style={styles.funnelStats}>
                <Text style={styles.funnelUsers}>{stage.users} users</Text>
                <Text style={styles.funnelConversion}>{stage.conversionRate.toFixed(1)}%</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const CohortTable = ({ cohorts }: { cohorts: any[] }) => {
  if (cohorts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Calendar size={48} color="#6B7280" />
        <Text style={styles.emptyStateText}>No cohort data available</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.cohortTable}>
        <View style={styles.cohortHeader}>
          <Text style={[styles.cohortCell, styles.cohortHeaderCell]}>Week</Text>
          <Text style={[styles.cohortCell, styles.cohortHeaderCell]}>Signups</Text>
          <Text style={[styles.cohortCell, styles.cohortHeaderCell]}>Day 1</Text>
          <Text style={[styles.cohortCell, styles.cohortHeaderCell]}>Day 7</Text>
          <Text style={[styles.cohortCell, styles.cohortHeaderCell]}>Day 30</Text>
        </View>
        {cohorts.slice(0, 10).map((cohort, index) => (
          <View key={index} style={styles.cohortRow}>
            <Text style={styles.cohortCell}>W{cohort.week}</Text>
            <Text style={styles.cohortCell}>{cohort.metrics.signups}</Text>
            <Text style={[styles.cohortCell, styles.cohortRetention]}>
              {cohort.metrics.day1Retention.toFixed(0)}%
            </Text>
            <Text style={[styles.cohortCell, styles.cohortRetention]}>
              {cohort.metrics.day7Retention.toFixed(0)}%
            </Text>
            <Text style={[styles.cohortCell, styles.cohortRetention]}>
              {cohort.metrics.day30Retention.toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default function AnalyticsDashboard() {
  const { metrics, cohorts, funnels, isLoading, lastUpdated, refreshMetrics, generateCohortReport, generateFunnelReport } = useAnalytics();
  const [activeTab, setActiveTab] = useState<'overview' | 'funnels' | 'cohorts'>('overview');
  const [dailyActiveUsers, setDailyActiveUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDailyActiveUsers();
  }, []);

  const loadDailyActiveUsers = async () => {
    const dau = await Analytics.getDailyActiveUsers(7);
    setDailyActiveUsers(dau);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await refreshMetrics();
    await loadDailyActiveUsers();
    setLoading(false);
  };

  const handleGenerateCohorts = async () => {
    setLoading(true);
    await generateCohortReport(8);
    setLoading(false);
  };

  const handleGenerateFunnels = async () => {
    setLoading(true);
    await generateFunnelReport('Onboarding', ['user_signup', 'onboarding_start', 'onboarding_complete']);
    await generateFunnelReport('First Task', ['onboarding_complete', 'task_viewed', 'task_accepted', 'first_task_completed']);
    await generateFunnelReport('Engagement', ['app_open', 'task_search', 'task_viewed', 'task_accepted']);
    setLoading(false);
  };

  const renderOverview = () => (
    <View>
      <View style={styles.metricsGrid}>
        <MetricCard
          title="DAU"
          value={metrics?.dau || 0}
          change={metrics?.growthRate}
          icon={<Users size={24} color="#8B5CF6" />}
          color="#8B5CF6"
        />
        <MetricCard
          title="WAU"
          value={metrics?.wau || 0}
          icon={<Activity size={24} color="#3B82F6" />}
          color="#3B82F6"
        />
        <MetricCard
          title="MAU"
          value={metrics?.mau || 0}
          icon={<TrendingUp size={24} color="#10B981" />}
          color="#10B981"
        />
        <MetricCard
          title="New Users (7d)"
          value={metrics?.newUsers7d || 0}
          icon={<Users size={24} color="#F59E0B" />}
          color="#F59E0B"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Active Users (7d)</Text>
        <SimpleLineChart
          labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
          data={dailyActiveUsers}
          color="#8B5CF6"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.keyMetrics}>
          <View style={styles.keyMetricRow}>
            <Text style={styles.keyMetricLabel}>7-Day Retention</Text>
            <Text style={styles.keyMetricValue}>{metrics?.retentionRate7d.toFixed(1)}%</Text>
          </View>
          <View style={styles.keyMetricRow}>
            <Text style={styles.keyMetricLabel}>30-Day Retention</Text>
            <Text style={styles.keyMetricValue}>{metrics?.retentionRate30d.toFixed(1)}%</Text>
          </View>
          <View style={styles.keyMetricRow}>
            <Text style={styles.keyMetricLabel}>Churn Rate</Text>
            <Text style={[styles.keyMetricValue, { color: '#EF4444' }]}>
              {metrics?.churnRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.keyMetricRow}>
            <Text style={styles.keyMetricLabel}>DAU/WAU Ratio</Text>
            <Text style={styles.keyMetricValue}>{metrics?.dauWauRatio.toFixed(2)}</Text>
          </View>
          <View style={styles.keyMetricRow}>
            <Text style={styles.keyMetricLabel}>Avg Session Duration</Text>
            <Text style={styles.keyMetricValue}>{metrics?.avgSessionDuration.toFixed(1)} min</Text>
          </View>
          <View style={styles.keyMetricRow}>
            <Text style={styles.keyMetricLabel}>Sessions per User</Text>
            <Text style={styles.keyMetricValue}>{metrics?.avgSessionsPerUser.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFunnels = () => (
    <View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleGenerateFunnels}
          disabled={loading}
        >
          <RefreshCw size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Generate Funnels</Text>
        </TouchableOpacity>
      </View>

      {funnels.length === 0 ? (
        <View style={styles.emptyState}>
          <PieChart size={48} color="#6B7280" />
          <Text style={styles.emptyStateText}>No funnel data available</Text>
          <Text style={styles.emptyStateSubtext}>Generate funnels to see conversion analysis</Text>
        </View>
      ) : (
        funnels.slice(0, 3).map((funnel, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.funnelHeader}>
              <Text style={styles.sectionTitle}>{funnel.name}</Text>
              <View style={styles.funnelMetrics}>
                <Text style={styles.funnelMetricLabel}>Overall Conversion:</Text>
                <Text style={styles.funnelMetricValue}>{funnel.overallConversion.toFixed(1)}%</Text>
              </View>
              <View style={styles.funnelMetrics}>
                <Text style={styles.funnelMetricLabel}>Avg Time to Convert:</Text>
                <Text style={styles.funnelMetricValue}>{funnel.avgTimeToConvert.toFixed(0)} min</Text>
              </View>
            </View>
            <FunnelView stages={funnel.stages} />
          </View>
        ))
      )}
    </View>
  );

  const renderCohorts = () => (
    <View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleGenerateCohorts}
          disabled={loading}
        >
          <Calendar size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Generate Cohorts</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Cohorts</Text>
        <Text style={styles.sectionSubtitle}>Retention by signup week</Text>
        <CohortTable cohorts={cohorts} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Analytics Dashboard',
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#FFF',
          headerRight: () => (
            <TouchableOpacity onPress={handleRefresh} disabled={loading}>
              <RefreshCw size={24} color="#FFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Growth Analytics</Text>
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </Text>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <BarChart3 size={20} color={activeTab === 'overview' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'funnels' && styles.tabActive]}
          onPress={() => setActiveTab('funnels')}
        >
          <PieChart size={20} color={activeTab === 'funnels' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'funnels' && styles.tabTextActive]}>
            Funnels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cohorts' && styles.tabActive]}
          onPress={() => setActiveTab('cohorts')}
        >
          <Calendar size={20} color={activeTab === 'cohorts' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'cohorts' && styles.tabTextActive]}>
            Cohorts
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading || loading} onRefresh={handleRefresh} />}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'funnels' && renderFunnels()}
        {activeTab === 'cohorts' && renderCohorts()}

        <View style={{ height: 32 }} />
      </ScrollView>

      {(isLoading || loading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Processing analytics...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 16,
  },
  chart: {
    height: 150,
    position: 'relative',
    marginBottom: 8,
  },
  chartBar: {
    position: 'absolute',
    bottom: 0,
    width: 8,
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  keyMetrics: {
    gap: 12,
    marginTop: 16,
  },
  keyMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  keyMetricLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  keyMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  actionRow: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  funnelContainer: {
    gap: 16,
    marginTop: 16,
  },
  funnelStage: {
    gap: 8,
  },
  funnelBar: {
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  funnelGradient: {
    flex: 1,
  },
  funnelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  funnelStageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'capitalize',
  },
  funnelStats: {
    flexDirection: 'row',
    gap: 16,
  },
  funnelUsers: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  funnelConversion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  funnelHeader: {
    marginBottom: 16,
    gap: 8,
  },
  funnelMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  funnelMetricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  funnelMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  cohortTable: {
    marginTop: 16,
  },
  cohortHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    paddingBottom: 8,
  },
  cohortRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  cohortCell: {
    width: 80,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  cohortHeaderCell: {
    fontWeight: '700',
    color: '#FFF',
  },
  cohortRetention: {
    color: '#10B981',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
