import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import COLORS from '@/constants/colors';
import { Play, CheckCircle, XCircle, Activity } from 'lucide-react-native';
import {
  TestRunner,
  TestResult,
  testOnboardingFlow,
  testTaskPosting,
  testTaskAcceptance,
  testTaskCompletion,
  testMessaging,
  testLevelUp,
  generatePerformanceReport,
  simulateLoad,
} from '@/utils/testUtils';

export default function TestSuite() {
  const {
    currentUser,
    users,
    tasks,
    completeOnboarding,
    createTask,
    acceptTask,
    completeTask,
    sendMessage,
  } = useApp();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [performanceReport, setPerformanceReport] = useState<string>('');

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setPerformanceReport('');

    const runner = new TestRunner();

    await runner.runTest('Onboarding Flow', async () => {
      await testOnboardingFlow(completeOnboarding);
    });

    await runner.runTest('Task Posting', async () => {
      await testTaskPosting(createTask, currentUser);
    });

    await runner.runTest('Task Acceptance', async () => {
      await testTaskAcceptance(acceptTask, tasks, currentUser);
    });

    await runner.runTest('Task Completion', async () => {
      await testTaskCompletion(completeTask, tasks, currentUser);
    });

    await runner.runTest('Messaging', async () => {
      await testMessaging(sendMessage, tasks, currentUser);
    });

    await runner.runTest('Level Up System', async () => {
      await testLevelUp(currentUser, completeTask, tasks);
    });

    await runner.runTest('Load Simulation (1000 users)', async () => {
      const loadTest = simulateLoad(1000, 2000);
      if (!loadTest.canHandle) {
        throw new Error('Cannot handle 1000 users');
      }
    });

    const results = runner.getResults();
    setTestResults(results);

    const report = generatePerformanceReport(users, tasks, results);
    setPerformanceReport(report);

    setIsRunning(false);
  };

  const renderTestResult = (result: TestResult) => {
    const Icon = result.passed ? CheckCircle : XCircle;
    const color = result.passed ? COLORS.success : COLORS.error;

    return (
      <View key={result.testName} style={styles.testResult}>
        <Icon size={20} color={color} />
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{result.testName}</Text>
          <Text style={styles.testDuration}>{result.duration}ms</Text>
          {result.error && <Text style={styles.testError}>{result.error}</Text>}
        </View>
      </View>
    );
  };

  const summary = testResults.reduce(
    (acc, result) => {
      if (result.passed) acc.passed++;
      else acc.failed++;
      acc.totalDuration += result.duration;
      return acc;
    },
    { passed: 0, failed: 0, totalDuration: 0 }
  );

  const loadTest = simulateLoad(users.length, tasks.length);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Test Suite',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Activity size={32} color={COLORS.primary} />
          <Text style={styles.title}>HustleXP Test Suite</Text>
          <Text style={styles.subtitle}>Automated testing for key user flows</Text>
        </View>

        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Play size={20} color={COLORS.white} />
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        {testResults.length > 0 && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Test Summary</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryValue}>{testResults.length}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                    {summary.passed}
                  </Text>
                  <Text style={styles.summaryLabel}>Passed</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                    {summary.failed}
                  </Text>
                  <Text style={styles.summaryLabel}>Failed</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryValue}>{summary.totalDuration}ms</Text>
                  <Text style={styles.summaryLabel}>Duration</Text>
                </View>
              </View>
              <View style={styles.passRateBar}>
                <View
                  style={[
                    styles.passRateFill,
                    {
                      width: `${testResults.length > 0 ? (summary.passed / testResults.length) * 100 : 0}%`,
                      backgroundColor: summary.failed === 0 ? COLORS.success : COLORS.warning,
                    },
                  ]}
                />
              </View>
              <Text style={styles.passRateText}>
                Pass Rate: {testResults.length > 0 ? ((summary.passed / testResults.length) * 100).toFixed(1) : 0}%
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Results</Text>
              {testResults.map(renderTestResult)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Load Testing</Text>
              <View style={styles.loadCard}>
                <View style={styles.loadRow}>
                  <Text style={styles.loadLabel}>Current Users</Text>
                  <Text style={styles.loadValue}>{users.length}</Text>
                </View>
                <View style={styles.loadRow}>
                  <Text style={styles.loadLabel}>Current Tasks</Text>
                  <Text style={styles.loadValue}>{tasks.length}</Text>
                </View>
                <View style={styles.loadRow}>
                  <Text style={styles.loadLabel}>Estimated Memory</Text>
                  <Text style={styles.loadValue}>{loadTest.estimatedMemory}KB</Text>
                </View>
                <View style={styles.loadRow}>
                  <Text style={styles.loadLabel}>Load Time</Text>
                  <Text style={styles.loadValue}>{loadTest.estimatedLoadTime}ms</Text>
                </View>
                <View style={styles.loadRow}>
                  <Text style={styles.loadLabel}>Can Handle 1000+ Users</Text>
                  <Text
                    style={[
                      styles.loadValue,
                      { color: loadTest.canHandle ? COLORS.success : COLORS.error },
                    ]}
                  >
                    {loadTest.canHandle ? 'Yes ✓' : 'No ✗'}
                  </Text>
                </View>
              </View>
            </View>

            {performanceReport && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Report</Text>
                <View style={styles.reportCard}>
                  <Text style={styles.reportText}>{performanceReport}</Text>
                </View>
              </View>
            )}
          </>
        )}

        {testResults.length === 0 && !isRunning && (
          <View style={styles.emptyState}>
            <Activity size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No tests run yet</Text>
            <Text style={styles.emptySubtext}>
              Click &quot;Run All Tests&quot; to start automated testing
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 24,
  },
  runButtonDisabled: {
    opacity: 0.5,
  },
  runButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.white,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  passRateBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  passRateFill: {
    height: '100%',
    borderRadius: 4,
  },
  passRateText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  testResult: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  testDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  testError: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  loadCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  loadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  reportText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.text,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});
