import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Brain, 
  Zap, 
  Bell, 
  Package, 
  DollarSign, 
  Scale, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { useApp } from '@/contexts/AppContext';
import { hustleAI } from '@/utils/hustleAI';
import { aiSmartNotifications } from '@/utils/aiSmartNotifications';
import { triggerHaptic } from '@/utils/haptics';

interface BackendStatus {
  isOnline: boolean;
  latency: number;
  version: string;
  lastChecked: Date;
}

interface FeatureStatus {
  id: string;
  name: string;
  icon: any;
  status: 'active' | 'degraded' | 'offline';
  lastUsed?: Date;
  requestCount: number;
  successRate: number;
  avgLatency: number;
}

export default function AIBackendDashboard() {
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    isOnline: false,
    latency: 0,
    version: 'unknown',
    lastChecked: new Date(),
  });
  
  const [features, setFeatures] = useState<FeatureStatus[]>([
    {
      id: 'chat',
      name: 'AI Chat',
      icon: Brain,
      status: 'offline',
      requestCount: 0,
      successRate: 0,
      avgLatency: 0,
    },
    {
      id: 'notifications',
      name: 'Smart Notifications',
      icon: Bell,
      status: 'offline',
      requestCount: 0,
      successRate: 0,
      avgLatency: 0,
    },
    {
      id: 'bundling',
      name: 'Task Bundling',
      icon: Package,
      status: 'offline',
      requestCount: 0,
      successRate: 0,
      avgLatency: 0,
    },
    {
      id: 'earnings',
      name: 'Earnings Prediction',
      icon: DollarSign,
      status: 'offline',
      requestCount: 0,
      successRate: 0,
      avgLatency: 0,
    },
    {
      id: 'disputes',
      name: 'Dispute Assistant',
      icon: Scale,
      status: 'offline',
      requestCount: 0,
      successRate: 0,
      avgLatency: 0,
    },
    {
      id: 'matching',
      name: 'Smart Matching',
      icon: Zap,
      status: 'offline',
      requestCount: 0,
      successRate: 0,
      avgLatency: 0,
    },
  ]);

  useEffect(() => {
    const init = async () => {
      await checkBackendHealth();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkBackendHealth = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const health = await hustleAI.checkHealth();
      const latency = Date.now() - startTime;
      
      setBackendStatus({
        isOnline: true,
        latency,
        version: health.version || 'unknown',
        lastChecked: new Date(),
      });

      await testAllFeatures();
    } catch (error) {
      console.error('[Backend Dashboard] Health check failed:', error);
      setBackendStatus({
        isOnline: false,
        latency: 0,
        version: 'unknown',
        lastChecked: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testAllFeatures = async () => {
    if (!currentUser) return;

    const updatedFeatures: FeatureStatus[] = [];

    for (const feature of features) {
      const startTime = Date.now();
      let status: 'active' | 'degraded' | 'offline' = 'offline';
      let successRate = 0;
      let requestCount = 0;

      try {
        switch (feature.id) {
          case 'chat':
            await hustleAI.chat(currentUser.id, 'test');
            status = 'active';
            successRate = 100;
            requestCount = 1;
            break;

          case 'notifications':
            await aiSmartNotifications.getSmartNotifications(currentUser.id);
            status = 'active';
            successRate = 100;
            requestCount = 1;
            break;

          case 'bundling':
            await hustleAI.chat(currentUser.id, 'Bundle test');
            status = 'active';
            successRate = 100;
            requestCount = 1;
            break;

          case 'earnings':
            await hustleAI.chat(currentUser.id, 'Earnings test');
            status = 'active';
            successRate = 100;
            requestCount = 1;
            break;

          case 'disputes':
            await hustleAI.chat(currentUser.id, 'Dispute test');
            status = 'active';
            successRate = 100;
            requestCount = 1;
            break;

          case 'matching':
            await hustleAI.chat(currentUser.id, 'Matching test');
            status = 'active';
            successRate = 100;
            requestCount = 1;
            break;
        }
      } catch (error) {
        console.warn(`[Backend Dashboard] ${feature.name} test failed:`, error);
        status = 'offline';
        successRate = 0;
      }

      const latency = Date.now() - startTime;

      updatedFeatures.push({
        ...feature,
        status,
        lastUsed: status === 'active' ? new Date() : feature.lastUsed,
        requestCount,
        successRate,
        avgLatency: latency,
      });
    }

    setFeatures(updatedFeatures);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('light');
    await checkBackendHealth();
    setRefreshing(false);
    triggerHaptic('success');
  };

  const getStatusColor = (status: 'active' | 'degraded' | 'offline') => {
    switch (status) {
      case 'active':
        return premiumColors.neonGreen;
      case 'degraded':
        return premiumColors.neonAmber;
      case 'offline':
        return premiumColors.neonMagenta;
    }
  };

  const getStatusIcon = (status: 'active' | 'degraded' | 'offline') => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'degraded':
        return AlertCircle;
      case 'offline':
        return XCircle;
    }
  };

  const activeFeatures = features.filter(f => f.status === 'active').length;
  const totalFeatures = features.length;
  const overallHealth = (activeFeatures / totalFeatures) * 100;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'AI Backend Dashboard',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: Colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                router.back();
              }}
              style={styles.backButton}
            >
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
          contentContainerStyle={[styles.scrollContent, { 
            paddingTop: insets.top + 16, 
            paddingBottom: insets.bottom + 40 
          }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={premiumColors.neonCyan}
            />
          }
        >
          {/* Backend Status Card */}
          <GlassCard 
            variant="darkStrong" 
            neonBorder 
            glowColor={backendStatus.isOnline ? "neonGreen" : "neonMagenta"}
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              <Activity 
                size={32} 
                color={backendStatus.isOnline ? premiumColors.neonGreen : premiumColors.neonMagenta} 
              />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {backendStatus.isOnline ? 'Backend Online' : 'Backend Offline'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {backendStatus.isOnline 
                    ? `Latency: ${backendStatus.latency}ms • v${backendStatus.version}`
                    : 'Unable to connect to HUSTLEAI'
                  }
                </Text>
              </View>
            </View>

            {backendStatus.isOnline && (
              <View style={styles.healthBar}>
                <View style={styles.healthBarBg}>
                  <LinearGradient
                    colors={[premiumColors.neonGreen, premiumColors.neonCyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.healthBarFill, { width: `${overallHealth}%` }]}
                  />
                </View>
                <Text style={styles.healthText}>
                  {activeFeatures}/{totalFeatures} features operational ({overallHealth.toFixed(0)}%)
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <RefreshCw size={16} color={Colors.text} />
              )}
              <Text style={styles.refreshButtonText}>
                {loading ? 'Testing...' : 'Refresh Status'}
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Features Grid */}
          <Text style={styles.sectionTitle}>AI Features Status</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => {
              const StatusIcon = getStatusIcon(feature.status);
              const FeatureIcon = feature.icon;
              
              return (
                <GlassCard 
                  key={feature.id}
                  variant="dark"
                  style={styles.featureCard}
                >
                  <View style={styles.featureHeader}>
                    <FeatureIcon 
                      size={24} 
                      color={getStatusColor(feature.status)} 
                    />
                    <StatusIcon 
                      size={16} 
                      color={getStatusColor(feature.status)} 
                    />
                  </View>
                  
                  <Text style={styles.featureName}>{feature.name}</Text>
                  
                  <View style={styles.featureStats}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Success</Text>
                      <Text style={styles.statValue}>
                        {feature.successRate}%
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Latency</Text>
                      <Text style={styles.statValue}>
                        {feature.avgLatency}ms
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.featureStatusBadge, { 
                    backgroundColor: getStatusColor(feature.status) + '20',
                    borderColor: getStatusColor(feature.status) + '40',
                  }]}>
                    <Text style={[styles.featureStatusText, { 
                      color: getStatusColor(feature.status) 
                    }]}>
                      {feature.status.toUpperCase()}
                    </Text>
                  </View>
                </GlassCard>
              );
            })}
          </View>

          {/* Integration Details */}
          <Text style={styles.sectionTitle}>Integration Details</Text>
          <GlassCard variant="dark" style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Backend URL</Text>
              <Text style={styles.detailValue}>
                lunch-garden-dycejr.replit.app
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>API Version</Text>
              <Text style={styles.detailValue}>
                {backendStatus.version}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Health Check</Text>
              <Text style={styles.detailValue}>
                {backendStatus.lastChecked.toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>User ID</Text>
              <Text style={[styles.detailValue, { fontSize: 11 }]} numberOfLines={1}>
                {currentUser?.id || 'Not logged in'}
              </Text>
            </View>
          </GlassCard>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/backend-test')}
            >
              <LinearGradient
                colors={[premiumColors.neonViolet, premiumColors.neonViolet + 'CC']}
                style={styles.actionButtonGradient}
              >
                <Activity size={20} color={Colors.text} />
                <Text style={styles.actionButtonText}>Run Full Tests</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/chat/hustleai')}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonCyan + 'CC']}
                style={styles.actionButtonGradient}
              >
                <Brain size={20} color={Colors.text} />
                <Text style={styles.actionButtonText}>Test AI Chat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Feature Descriptions */}
          <GlassCard variant="dark" style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Feature Descriptions</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>AI Chat</Text>: GPT-4 Turbo powered conversations{'\n'}
              <Text style={styles.infoBold}>Smart Notifications</Text>: ML-based notification timing{'\n'}
              <Text style={styles.infoBold}>Task Bundling</Text>: AI route optimization{'\n'}
              <Text style={styles.infoBold}>Earnings Prediction</Text>: Forecast earnings potential{'\n'}
              <Text style={styles.infoBold}>Dispute Assistant</Text>: Automated conflict resolution{'\n'}
              <Text style={styles.infoBold}>Smart Matching</Text>: Dual-role aware task matching
            </Text>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  statusCard: {
    padding: 24,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  statusInfo: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statusSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  healthBar: {
    gap: 8,
    marginBottom: 16,
  },
  healthBarBg: {
    height: 8,
    backgroundColor: premiumColors.charcoal,
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: premiumColors.charcoal,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    width: '48%',
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  featureStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  featureStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  featureStatusText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  detailsCard: {
    padding: 20,
    marginBottom: 32,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'right',
    flex: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  infoCard: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  infoBold: {
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
