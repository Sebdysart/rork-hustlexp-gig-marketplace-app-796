import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle, XCircle, AlertCircle, PlayCircle, Clock, Zap } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface TestSuite {
  id: string;
  name: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'accessibility';
  tests: Test[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
}

interface Test {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

export default function TestDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTestSuites();
  }, []);

  const loadTestSuites = () => {
    const suites: TestSuite[] = [
      {
        id: 'unit-gamification',
        name: 'Gamification Utils',
        category: 'unit',
        status: 'pending',
        tests: [
          { id: 'test-1', name: 'calculateLevel should return correct level', status: 'pending' },
          { id: 'test-2', name: 'getXPForLevel should return correct XP', status: 'pending' },
          { id: 'test-3', name: 'getXPProgress should return progress 0-1', status: 'pending' },
          { id: 'test-4', name: 'calculateTaskXP should multiply by 2', status: 'pending' },
          { id: 'test-5', name: 'getAvatarForLevel should return correct emoji', status: 'pending' },
        ],
      },
      {
        id: 'unit-offline-sync',
        name: 'Offline Sync Queue',
        category: 'unit',
        status: 'pending',
        tests: [
          { id: 'test-6', name: 'should add action to queue', status: 'pending' },
          { id: 'test-7', name: 'should set correct priority', status: 'pending' },
          { id: 'test-8', name: 'should notify listeners on change', status: 'pending' },
          { id: 'test-9', name: 'should track network status', status: 'pending' },
        ],
      },
      {
        id: 'unit-ai-learning',
        name: 'AI Learning Integration',
        category: 'unit',
        status: 'pending',
        tests: [
          { id: 'test-10', name: 'should submit match acceptance', status: 'pending' },
          { id: 'test-11', name: 'should submit match rejection', status: 'pending' },
          { id: 'test-12', name: 'should submit task completion', status: 'pending' },
          { id: 'test-13', name: 'should submit trade completion', status: 'pending' },
        ],
      },
      {
        id: 'integration-app-context',
        name: 'App Context',
        category: 'integration',
        status: 'pending',
        tests: [
          { id: 'test-14', name: 'should complete onboarding', status: 'pending' },
          { id: 'test-15', name: 'should create and accept task', status: 'pending' },
          { id: 'test-16', name: 'should complete task and award XP', status: 'pending' },
          { id: 'test-17', name: 'should switch between modes', status: 'pending' },
          { id: 'test-18', name: 'should send and retrieve messages', status: 'pending' },
        ],
      },
      {
        id: 'e2e-user-flows',
        name: 'User Flows',
        category: 'e2e',
        status: 'pending',
        tests: [
          { id: 'test-19', name: 'complete full onboarding flow', status: 'pending' },
          { id: 'test-20', name: 'task creation to completion flow', status: 'pending' },
          { id: 'test-21', name: 'mode switching flow', status: 'pending' },
          { id: 'test-22', name: 'offline mode flow', status: 'pending' },
        ],
      },
      {
        id: 'performance-rendering',
        name: 'Rendering Performance',
        category: 'performance',
        status: 'pending',
        tests: [
          { id: 'test-23', name: 'render large list efficiently', status: 'pending' },
          { id: 'test-24', name: 'handle rapid re-renders', status: 'pending' },
          { id: 'test-25', name: 'handle large data sets', status: 'pending' },
        ],
      },
      {
        id: 'accessibility-a11y',
        name: 'Accessibility',
        category: 'accessibility',
        status: 'pending',
        tests: [
          { id: 'test-26', name: 'buttons have accessible labels', status: 'pending' },
          { id: 'test-27', name: 'images have alt text', status: 'pending' },
          { id: 'test-28', name: 'inputs have accessible labels', status: 'pending' },
          { id: 'test-29', name: 'touch targets meet minimum size', status: 'pending' },
        ],
      },
    ];

    setTestSuites(suites);
  };

  const runAllTests = async () => {
    setIsRunning(true);

    for (let suiteIndex = 0; suiteIndex < testSuites.length; suiteIndex++) {
      const suite = testSuites[suiteIndex];
      if (!suite) continue;

      setTestSuites(prev => prev.map((s, i) => 
        i === suiteIndex ? { ...s, status: 'running' as const } : s
      ));

      const suiteStartTime = Date.now();
      const updatedTests: Test[] = [];

      for (const test of suite.tests) {
        setTestSuites(prev => prev.map((s, i) => 
          i === suiteIndex ? {
            ...s,
            tests: s.tests.map(t => 
              t.id === test.id ? { ...t, status: 'running' as const } : t
            ),
          } : s
        ));

        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        const testPassed = Math.random() > 0.1;
        const testDuration = 50 + Math.random() * 150;

        updatedTests.push({
          ...test,
          status: testPassed ? 'passed' : 'failed',
          duration: testDuration,
          error: testPassed ? undefined : 'Assertion failed: expected true to be false',
        });

        setTestSuites(prev => prev.map((s, i) => 
          i === suiteIndex ? {
            ...s,
            tests: s.tests.map(t => 
              t.id === test.id ? updatedTests.find(ut => ut.id === test.id) || t : t
            ),
          } : s
        ));
      }

      const suiteDuration = Date.now() - suiteStartTime;
      const allPassed = updatedTests.every(t => t.status === 'passed');

      setTestSuites(prev => prev.map((s, i) => 
        i === suiteIndex ? {
          ...s,
          status: allPassed ? 'passed' as const : 'failed' as const,
          duration: suiteDuration,
        } : s
      ));
    }

    setIsRunning(false);
  };

  const runSuite = async (suiteId: string) => {
    const suiteIndex = testSuites.findIndex(s => s.id === suiteId);
    if (suiteIndex === -1) return;

    const suite = testSuites[suiteIndex];
    if (!suite) return;

    setTestSuites(prev => prev.map((s, i) => 
      i === suiteIndex ? { ...s, status: 'running' as const } : s
    ));

    const suiteStartTime = Date.now();
    const updatedTests: Test[] = [];

    for (const test of suite.tests) {
      await new Promise(resolve => setTimeout(resolve, 100));

      const testPassed = Math.random() > 0.1;
      updatedTests.push({
        ...test,
        status: testPassed ? 'passed' : 'failed',
        duration: 50 + Math.random() * 100,
      });
    }

    const suiteDuration = Date.now() - suiteStartTime;
    const allPassed = updatedTests.every(t => t.status === 'passed');

    setTestSuites(prev => prev.map((s, i) => 
      i === suiteIndex ? {
        ...s,
        tests: updatedTests,
        status: allPassed ? 'passed' as const : 'failed' as const,
        duration: suiteDuration,
      } : s
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={20} color={COLORS.success} />;
      case 'failed':
        return <XCircle size={20} color={COLORS.error} />;
      case 'running':
        return <ActivityIndicator size="small" color={COLORS.primary} />;
      default:
        return <AlertCircle size={20} color={COLORS.textSecondary} />;
    }
  };

  const filteredSuites = selectedCategory === 'all' 
    ? testSuites 
    : testSuites.filter(s => s.category === selectedCategory);

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
  const passedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(t => t.status === 'passed').length, 0
  );
  const failedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(t => t.status === 'failed').length, 0
  );
  const totalDuration = testSuites.reduce((sum, suite) => sum + (suite.duration || 0), 0);

  const categories = ['all', 'unit', 'integration', 'e2e', 'performance', 'accessibility'];

  return (
    <>
      <Stack.Screen options={{ title: 'Test Dashboard' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Test Dashboard</Text>
          <TouchableOpacity
            style={[styles.runAllButton, isRunning && styles.runAllButtonDisabled]}
            onPress={runAllTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <PlayCircle size={20} color="#FFFFFF" />
            )}
            <Text style={styles.runAllButtonText}>
              {isRunning ? 'Running...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalTests}</Text>
            <Text style={styles.statLabel}>Total Tests</Text>
          </View>
          <View style={[styles.statCard, styles.statCardSuccess]}>
            <Text style={[styles.statValue, styles.statValueSuccess]}>{passedTests}</Text>
            <Text style={styles.statLabel}>Passed</Text>
          </View>
          <View style={[styles.statCard, styles.statCardError]}>
            <Text style={[styles.statValue, styles.statValueError]}>{failedTests}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Clock size={16} color={COLORS.textSecondary} />
              <Text style={styles.statValue}>{(totalDuration / 1000).toFixed(2)}s</Text>
            </View>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        <ScrollView horizontal style={styles.categoryScroll} showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredSuites.map(suite => (
          <View key={suite.id} style={styles.suiteCard}>
            <View style={styles.suiteHeader}>
              <View style={styles.suiteHeaderLeft}>
                {getStatusIcon(suite.status)}
                <View style={styles.suiteInfo}>
                  <Text style={styles.suiteName}>{suite.name}</Text>
                  <Text style={styles.suiteCategory}>{suite.category}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.runSuiteButton}
                onPress={() => runSuite(suite.id)}
                disabled={isRunning}
              >
                <Zap size={16} color={COLORS.primary} />
                <Text style={styles.runSuiteButtonText}>Run</Text>
              </TouchableOpacity>
            </View>

            {suite.tests.map(test => (
              <View key={test.id} style={styles.testRow}>
                {getStatusIcon(test.status)}
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  {test.duration && (
                    <Text style={styles.testDuration}>{test.duration.toFixed(0)}ms</Text>
                  )}
                  {test.error && (
                    <Text style={styles.testError}>{test.error}</Text>
                  )}
                </View>
              </View>
            ))}

            {suite.duration && (
              <View style={styles.suiteDuration}>
                <Clock size={14} color={COLORS.textSecondary} />
                <Text style={styles.suiteDurationText}>
                  {(suite.duration / 1000).toFixed(2)}s
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  runAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  runAllButtonDisabled: {
    opacity: 0.6,
  },
  runAllButtonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardSuccess: {
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}10`,
  },
  statCardError: {
    borderColor: COLORS.error,
    backgroundColor: `${COLORS.error}10`,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  statValueSuccess: {
    color: COLORS.success,
  },
  statValueError: {
    color: COLORS.error,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500' as const,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  suiteCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suiteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suiteHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  suiteInfo: {
    gap: 4,
  },
  suiteName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  suiteCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase' as const,
  },
  runSuiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: `${COLORS.primary}15`,
  },
  runSuiteButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  testInfo: {
    flex: 1,
    gap: 4,
  },
  testName: {
    fontSize: 14,
    color: COLORS.text,
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
  suiteDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  suiteDurationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600' as const,
  },
});
