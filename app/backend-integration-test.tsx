import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBackend } from '@/contexts/BackendContext';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import { Check, X, Wifi, WifiOff } from 'lucide-react-native';

type TestResult = {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
};

export default function BackendIntegrationTest() {
  const { isConnected, isAuthenticated, wsConnected, services, currentUserId } = useBackend();
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    const tests = [
      {
        name: 'Connection Status',
        test: async () => {
          if (!isConnected) throw new Error('Not connected to backend');
          return 'Backend connected';
        }
      },
      {
        name: 'Authentication',
        test: async () => {
          if (!isAuthenticated) throw new Error('Not authenticated');
          return `Authenticated as ${currentUserId}`;
        }
      },
      {
        name: 'WebSocket Connection',
        test: async () => {
          if (!wsConnected) throw new Error('WebSocket not connected');
          return 'WebSocket active';
        }
      },
      {
        name: 'Get Tasks',
        test: async () => {
          const start = Date.now();
          const tasks = await services.task.getTasks();
          const duration = Date.now() - start;
          return `Retrieved ${tasks.total} tasks in ${duration}ms`;
        }
      },
      {
        name: 'Get Wallet',
        test: async () => {
          const start = Date.now();
          const wallet = await services.payment.getWallet();
          const duration = Date.now() - start;
          return `Balance: $${wallet.balance.toFixed(2)} (${duration}ms)`;
        }
      },
      {
        name: 'Get Leaderboard',
        test: async () => {
          const start = Date.now();
          const leaderboard = await services.analytics.getLeaderboard('xp', 10);
          const duration = Date.now() - start;
          return `Top ${leaderboard.length} users loaded (${duration}ms)`;
        }
      },
      {
        name: 'Platform Health',
        test: async () => {
          const start = Date.now();
          const health = await services.ai.getPlatformHealth();
          const duration = Date.now() - start;
          return `Supply/Demand: ${health.supplyDemandRatio.toFixed(2)} (${duration}ms)`;
        }
      },
      {
        name: 'Get Recommendations',
        test: async () => {
          const start = Date.now();
          const recs = await services.ai.getRecommendations({
            maxDistance: 10
          });
          const duration = Date.now() - start;
          return `${recs.length} recommendations (${duration}ms)`;
        }
      },
      {
        name: 'Performance Dashboard',
        test: async () => {
          const start = Date.now();
          const dashboard = await services.analytics.getPerformanceDashboard();
          const duration = Date.now() - start;
          return `${dashboard.totalTasks} tasks, ${dashboard.completionRate}% rate (${duration}ms)`;
        }
      },
      {
        name: 'Market Forecasts',
        test: async () => {
          const start = Date.now();
          const forecasts = await services.analytics.getMarketForecasts();
          const duration = Date.now() - start;
          return `${forecasts.length} category forecasts (${duration}ms)`;
        }
      }
    ];

    for (const { name, test } of tests) {
      try {
        const startTime = Date.now();
        const message = await test();
        const duration = Date.now() - startTime;
        
        addResult({
          name,
          status: 'success',
          message,
          duration
        });
      } catch (error: any) {
        addResult({
          name,
          status: 'error',
          message: error.message || 'Unknown error'
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setTesting(false);
  };

  const renderStatusIcon = (status: TestResult['status']) => {
    if (status === 'success') return <Check size={20} color={premiumColors.neonGreen} />;
    if (status === 'error') return <X size={20} color={Colors.error} />;
    return <ActivityIndicator size="small" color={premiumColors.neonBlue} />;
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / (results.length || 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Backend Integration Test</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>API Connection:</Text>
            <View style={styles.statusValue}>
              {isConnected ? (
                <Wifi size={20} color={premiumColors.neonGreen} />
              ) : (
                <WifiOff size={20} color={Colors.error} />
              )}
              <Text style={[styles.statusText, { color: isConnected ? premiumColors.neonGreen : Colors.error }]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Authentication:</Text>
            <Text style={[styles.statusText, { color: isAuthenticated ? premiumColors.neonGreen : Colors.error }]}>
              {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>WebSocket:</Text>
            <Text style={[styles.statusText, { color: wsConnected ? premiumColors.neonGreen : Colors.error }]}>
              {wsConnected ? '✅ Connected' : '❌ Disconnected'}
            </Text>
          </View>

          {currentUserId && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>User ID:</Text>
              <Text style={styles.statusText}>{currentUserId}</Text>
            </View>
          )}
        </View>

        {results.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Test Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{successCount}</Text>
                <Text style={styles.summaryLabel}>Passed</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: Colors.error }]}>{errorCount}</Text>
                <Text style={styles.summaryLabel}>Failed</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{avgDuration.toFixed(0)}ms</Text>
                <Text style={styles.summaryLabel}>Avg Time</Text>
              </View>
            </View>
          </View>
        )}

        {results.map((result, index) => (
          <View key={index} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              {renderStatusIcon(result.status)}
              <Text style={styles.resultName}>{result.name}</Text>
              {result.duration !== undefined && (
                <Text style={styles.resultDuration}>{result.duration}ms</Text>
              )}
            </View>
            {result.message && (
              <Text style={[
                styles.resultMessage,
                { color: result.status === 'error' ? Colors.error : premiumColors.softWhite }
              ]}>
                {result.message}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, testing && styles.buttonDisabled]}
          onPress={runTests}
          disabled={testing}
        >
          {testing ? (
            <>
              <ActivityIndicator color={premiumColors.deepBlack} />
              <Text style={styles.buttonText}>Running Tests...</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>
              {results.length > 0 ? 'Run Tests Again' : 'Run Backend Tests'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: premiumColors.softWhite,
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: premiumColors.charcoal,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  summaryCard: {
    backgroundColor: premiumColors.charcoal,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.softWhite,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  resultCard: {
    backgroundColor: premiumColors.charcoal,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: premiumColors.softWhite,
  },
  resultDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  resultMessage: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 32,
  },
  button: {
    backgroundColor: premiumColors.neonGreen,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.deepBlack,
  },
});
