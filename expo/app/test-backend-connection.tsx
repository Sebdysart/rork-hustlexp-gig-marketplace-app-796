import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import { maxPotentialService } from '@/services/backend/maxPotential';
import { API_URL } from '@/utils/api';
import GlassCard from '@/components/GlassCard';
import { CheckCircle, XCircle, Loader, Zap } from 'lucide-react-native';

export default function TestBackendConnection() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    apiUrl?: string;
    dashboardTest?: { success: boolean; data?: any; error?: string };
    taskFeedTest?: { success: boolean; data?: any; error?: string };
    progressTest?: { success: boolean; data?: any; error?: string };
  }>({});

  const runTests = async () => {
    setTesting(true);
    setResults({ apiUrl: API_URL });

    try {
      console.log('[Test] Testing dashboard endpoint...');
      const dashboardData = await maxPotentialService.getDashboard(true);
      setResults(prev => ({
        ...prev,
        dashboardTest: { success: true, data: dashboardData },
      }));
    } catch (error: any) {
      console.error('[Test] Dashboard test failed:', error);
      setResults(prev => ({
        ...prev,
        dashboardTest: { success: false, error: error.message },
      }));
    }

    try {
      console.log('[Test] Testing task feed endpoint...');
      const taskFeedData = await maxPotentialService.getTaskFeed(1, 10, {}, true);
      setResults(prev => ({
        ...prev,
        taskFeedTest: { success: true, data: taskFeedData },
      }));
    } catch (error: any) {
      console.error('[Test] Task feed test failed:', error);
      setResults(prev => ({
        ...prev,
        taskFeedTest: { success: false, error: error.message },
      }));
    }

    try {
      console.log('[Test] Testing progress summary endpoint...');
      const progressData = await maxPotentialService.getProgressSummary('week', true, true);
      setResults(prev => ({
        ...prev,
        progressTest: { success: true, data: progressData },
      }));
    } catch (error: any) {
      console.error('[Test] Progress summary test failed:', error);
      setResults(prev => ({
        ...prev,
        progressTest: { success: false, error: error.message },
      }));
    }

    setTesting(false);
  };

  const renderTestResult = (name: string, result?: { success: boolean; data?: any; error?: string }) => {
    if (!result) {
      return (
        <GlassCard style={styles.testCard}>
          <View style={styles.testHeader}>
            <Text style={styles.testName}>{name}</Text>
            <Loader size={20} color={premiumColors.glassWhite} />
          </View>
        </GlassCard>
      );
    }

    return (
      <GlassCard style={styles.testCard}>
        <View style={styles.testHeader}>
          <Text style={styles.testName}>{name}</Text>
          {result.success ? (
            <CheckCircle size={24} color={premiumColors.neonGreen} />
          ) : (
            <XCircle size={24} color="#FF6B6B" />
          )}
        </View>
        {result.success ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Success!</Text>
            {result.data && (
              <Text style={styles.dataPreview} numberOfLines={3}>
                {JSON.stringify(result.data, null, 2).substring(0, 150)}...
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {result.error}</Text>
          </View>
        )}
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Connection Test', headerShown: true }} />
      
      <LinearGradient
        colors={['#000814', '#001845', '#000814']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Zap size={48} color={premiumColors.neonCyan} />
          <Text style={styles.title}>Backend Connection Test</Text>
          <Text style={styles.subtitle}>Testing Replit backend integration</Text>
        </View>

        <GlassCard style={styles.apiCard}>
          <Text style={styles.apiLabel}>API URL:</Text>
          <Text style={styles.apiUrl}>{results.apiUrl || API_URL}</Text>
        </GlassCard>

        <TouchableOpacity
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={runTests}
          disabled={testing}
        >
          <LinearGradient
            colors={[premiumColors.neonCyan, premiumColors.neonMagenta]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {testing ? (
              <>
                <ActivityIndicator color="#000000" />
                <Text style={styles.buttonText}>Testing...</Text>
              </>
            ) : (
              <>
                <Zap size={20} color="#000000" />
                <Text style={styles.buttonText}>Run Tests</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {Object.keys(results).length > 1 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            
            {renderTestResult('Dashboard API', results.dashboardTest)}
            {renderTestResult('Task Feed API', results.taskFeedTest)}
            {renderTestResult('Progress Summary API', results.progressTest)}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What this tests:</Text>
          <Text style={styles.infoText}>• Connection to Replit backend</Text>
          <Text style={styles.infoText}>• Max Potential Dashboard endpoint</Text>
          <Text style={styles.infoText}>• Task Feed with pagination</Text>
          <Text style={styles.infoText}>• Progress Summary with chart data</Text>
          <Text style={styles.infoText}>• Mock mode (?mock=true parameter)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: premiumColors.glassWhite,
    textAlign: 'center',
  },
  apiCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  apiLabel: {
    fontSize: 14,
    color: premiumColors.glassWhite,
    marginBottom: spacing.xs,
  },
  apiUrl: {
    fontSize: 12,
    color: premiumColors.neonCyan,
    fontFamily: 'monospace',
  },
  testButton: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000000',
  },
  resultsSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  testCard: {
    padding: spacing.lg,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  testName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  successBox: {
    gap: spacing.sm,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonGreen,
  },
  dataPreview: {
    fontSize: 11,
    color: premiumColors.glassWhite,
    fontFamily: 'monospace',
  },
  errorBox: {
    padding: spacing.md,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: borderRadius.md,
  },
  errorText: {
    fontSize: 13,
    color: '#FF6B6B',
  },
  infoBox: {
    padding: spacing.lg,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 13,
    color: premiumColors.glassWhiteStrong,
  },
});
