import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Check, X, AlertCircle, Loader, Sparkles, Home, User, Wallet, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import { useApp } from '@/contexts/AppContext';
import { triggerHaptic } from '@/utils/haptics';

interface TestCase {
  id: string;
  feature: string;
  description: string;
  testSteps: string[];
  expectedResult: string;
  screen?: string;
  status: 'pending' | 'passed' | 'failed';
}

export default function TestOptionBFeatures() {
  const router = useRouter();
  const { currentUser, tasks, availableTasks, myAcceptedTasks } = useApp();
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'perfect-matches-1',
      feature: 'AI Perfect Matches (Home)',
      description: 'Test AI predictive matching on home screen',
      testSteps: [
        'Navigate to home screen',
        'Verify "Perfect Matches For You" section is visible',
        'Check that match scores (%) are displayed',
        'Verify insights are shown for top matches',
        'Test "Ask AI" button functionality',
      ],
      expectedResult: 'Top 3 AI-matched tasks displayed with scores, insights, and actions',
      screen: '/(tabs)/home',
      status: 'pending',
    },
    {
      id: 'perfect-matches-2',
      feature: 'AI Perfect Matches - Edge Cases',
      description: 'Test edge cases and error handling',
      testSteps: [
        'Test with 0 available tasks',
        'Test with new user (no history)',
        'Verify loading state displays',
        'Check empty state message',
      ],
      expectedResult: 'Graceful handling of edge cases with appropriate messages',
      screen: '/(tabs)/home',
      status: 'pending',
    },
    {
      id: 'task-detail-badge-1',
      feature: 'Task Detail AI Match Badge',
      description: 'Test AI match badge on task detail screen',
      testSteps: [
        'Navigate to any task detail',
        'Verify AI match badge is visible',
        'Check match score percentage',
        'Verify "Why this matches" insights',
        'Test expandable insights section',
      ],
      expectedResult: 'AI match badge with score and expandable insights displayed',
      screen: '/task/[id]',
      status: 'pending',
    },
    {
      id: 'profile-insights-1',
      feature: 'Profile AI Performance Insights',
      description: 'Test AI insights on profile screen',
      testSteps: [
        'Navigate to profile',
        'Verify "AI Performance Insights" section',
        'Check strength/weakness/opportunity cards',
        'Verify AI comparison with similar users',
        'Test "See All" expansion',
        'Check actionable insights have tap handlers',
      ],
      expectedResult: 'AI-powered performance insights with actionable recommendations',
      screen: '/(tabs)/profile',
      status: 'pending',
    },
    {
      id: 'profile-insights-2',
      feature: 'Profile Insights - Data Accuracy',
      description: 'Verify accuracy of AI insights',
      testSteps: [
        'Compare insights with actual user data',
        'Verify category expertise matches completed tasks',
        'Check earnings trend calculations',
        'Verify reputation score analysis',
        'Test weekly summary accuracy',
      ],
      expectedResult: 'All insights accurately reflect user performance data',
      screen: '/(tabs)/profile',
      status: 'pending',
    },
    {
      id: 'wallet-forecast-1',
      feature: 'Wallet AI Earnings Forecast',
      description: 'Test earnings forecast on wallet screen',
      testSteps: [
        'Navigate to wallet',
        'Verify "AI Earnings Forecast" card',
        'Check weekly and monthly toggles',
        'Verify projected amount displayed',
        'Check confidence percentage',
        'Test circular progress indicator',
      ],
      expectedResult: 'AI earnings forecast with weekly/monthly projections',
      screen: '/(tabs)/wallet',
      status: 'pending',
    },
    {
      id: 'wallet-forecast-2',
      feature: 'Wallet Forecast - Breakdown',
      description: 'Test detailed earnings breakdown',
      testSteps: [
        'Open earnings breakdown',
        'Verify base pay, bonuses, tips shown',
        'Check category breakdown',
        'Test recommendations section',
        'Verify trending indicators',
      ],
      expectedResult: 'Detailed breakdown with categories and AI recommendations',
      screen: '/(tabs)/wallet',
      status: 'pending',
    },
    {
      id: 'chat-suggestions-1',
      feature: 'Chat Inline AI Suggestions',
      description: 'Test AI suggestions in chat',
      testSteps: [
        'Navigate to any task chat',
        'Toggle "AI Suggestions" button',
        'Verify suggestions appear after other user messages',
        'Check quick reply options',
        'Test negotiation tips (if applicable)',
        'Verify tone analysis bar',
      ],
      expectedResult: 'Context-aware AI suggestions with tone analysis',
      screen: '/chat/[id]',
      status: 'pending',
    },
    {
      id: 'chat-suggestions-2',
      feature: 'Chat AI - Tone Analysis',
      description: 'Test tone detection and warnings',
      testSteps: [
        'Check sentiment detection (positive/neutral/negative)',
        'Verify professionalism score',
        'Test urgency indicators',
        'Check negotiation signal detection',
        'Verify tone advice for negative sentiment',
      ],
      expectedResult: 'Accurate tone analysis with contextual advice',
      screen: '/chat/[id]',
      status: 'pending',
    },
    {
      id: 'integration-1',
      feature: 'Cross-Feature Integration',
      description: 'Test features working together',
      testSteps: [
        'Accept task from Perfect Matches',
        'Navigate to task detail - verify match badge',
        'Go to chat - test AI suggestions',
        'Complete task and check profile insights',
        'Verify wallet forecast updates',
      ],
      expectedResult: 'All features work seamlessly together end-to-end',
      status: 'pending',
    },
    {
      id: 'performance-1',
      feature: 'Performance & Loading States',
      description: 'Test performance and UX',
      testSteps: [
        'Check loading indicators for all AI features',
        'Verify smooth animations',
        'Test with slow network (throttle)',
        'Check error handling for AI failures',
        'Verify fallback states',
      ],
      expectedResult: 'Smooth performance with proper loading/error states',
      status: 'pending',
    },
    {
      id: 'backend-1',
      feature: 'Backend Integration',
      description: 'Test backend AI services',
      testSteps: [
        'Verify all features connect to HustleAI backend',
        'Check API rate limiting',
        'Test backend fallback logic',
        'Verify data persistence',
      ],
      expectedResult: 'All AI features properly integrated with backend',
      status: 'pending',
    },
  ]);

  const handleNavigate = (screen?: string) => {
    if (!screen) {
      Alert.alert('Manual Test', 'This test requires manual verification. Navigate to the feature and verify functionality.');
      return;
    }

    try {
      if (screen.includes('[id]')) {
        const sampleId = availableTasks[0]?.id || 'task-1';
        const actualScreen = screen.replace('[id]', sampleId);
        router.push(actualScreen as any);
      } else {
        router.push(screen as any);
      }
      triggerHaptic('light');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Could not navigate to test screen');
    }
  };

  const handleTestResult = (testId: string, passed: boolean) => {
    setTestCases(prev =>
      prev.map(tc =>
        tc.id === testId ? { ...tc, status: passed ? 'passed' : 'failed' } : tc
      )
    );
    triggerHaptic(passed ? 'success' : 'error');

    if (passed) {
      Alert.alert('✅ Test Passed', 'Great! Moving to next test.');
    } else {
      Alert.alert('❌ Test Failed', 'Please document the issue and continue testing.');
    }
  };

  const handleRunAllTests = () => {
    Alert.alert(
      'Run All Tests',
      'This will guide you through all test cases sequentially. Ready?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            const firstTest = testCases.find(tc => tc.status === 'pending');
            if (firstTest && firstTest.screen) {
              handleNavigate(firstTest.screen);
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <Check size={20} color={premiumColors.neonGreen} />;
      case 'failed':
        return <X size={20} color={premiumColors.neonMagenta} />;
      default:
        return <AlertCircle size={20} color={Colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return premiumColors.neonGreen;
      case 'failed':
        return premiumColors.neonMagenta;
      default:
        return Colors.textSecondary;
    }
  };

  const passedCount = testCases.filter(tc => tc.status === 'passed').length;
  const failedCount = testCases.filter(tc => tc.status === 'failed').length;
  const pendingCount = testCases.filter(tc => tc.status === 'pending').length;
  const totalCount = testCases.length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Option B Test Suite',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Sparkles size={32} color={premiumColors.neonCyan} />
            </View>
            <Text style={styles.title}>Deep Integration Test Suite</Text>
            <Text style={styles.subtitle}>
              Test all 4 AI features and their integration
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{passedCount}</Text>
              <Text style={styles.statLabel}>Passed</Text>
              <Check size={16} color={premiumColors.neonGreen} />
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{failedCount}</Text>
              <Text style={styles.statLabel}>Failed</Text>
              <X size={16} color={premiumColors.neonMagenta} />
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
              <Loader size={16} color={Colors.textSecondary} />
            </View>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((passedCount + failedCount) / totalCount) * 100}%`,
                  backgroundColor: failedCount > 0 ? premiumColors.neonAmber : premiumColors.neonGreen,
                },
              ]}
            />
          </View>

          <TouchableOpacity style={styles.runAllButton} onPress={handleRunAllTests}>
            <Sparkles size={20} color={Colors.text} />
            <Text style={styles.runAllButtonText}>Run All Tests</Text>
          </TouchableOpacity>

          <View style={styles.quickNav}>
            <Text style={styles.quickNavTitle}>Quick Navigate:</Text>
            <View style={styles.quickNavButtons}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => handleNavigate('/(tabs)/home')}
              >
                <Home size={16} color={Colors.text} />
                <Text style={styles.navButtonText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => handleNavigate('/(tabs)/profile')}
              >
                <User size={16} color={Colors.text} />
                <Text style={styles.navButtonText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => handleNavigate('/(tabs)/wallet')}
              >
                <Wallet size={16} color={Colors.text} />
                <Text style={styles.navButtonText}>Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => handleNavigate(`/chat/${availableTasks[0]?.id || 'task-1'}`)}
              >
                <MessageCircle size={16} color={Colors.text} />
                <Text style={styles.navButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Test Cases</Text>

          {testCases.map((testCase, index) => (
            <View
              key={testCase.id}
              style={[
                styles.testCard,
                { borderLeftColor: getStatusColor(testCase.status) },
              ]}
            >
              <View style={styles.testHeader}>
                <View style={styles.testHeaderLeft}>
                  <View style={styles.testNumber}>
                    <Text style={styles.testNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.testInfo}>
                    <Text style={styles.testFeature}>{testCase.feature}</Text>
                    <Text style={styles.testDescription}>{testCase.description}</Text>
                  </View>
                </View>
                <View style={styles.testStatus}>{getStatusIcon(testCase.status)}</View>
              </View>

              <View style={styles.testSteps}>
                <Text style={styles.testStepsTitle}>Test Steps:</Text>
                {testCase.testSteps.map((step, idx) => (
                  <View key={idx} style={styles.testStep}>
                    <Text style={styles.testStepNumber}>{idx + 1}.</Text>
                    <Text style={styles.testStepText}>{step}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.expectedResult}>
                <Text style={styles.expectedResultLabel}>Expected Result:</Text>
                <Text style={styles.expectedResultText}>{testCase.expectedResult}</Text>
              </View>

              <View style={styles.testActions}>
                {testCase.screen && (
                  <TouchableOpacity
                    style={styles.testActionButton}
                    onPress={() => handleNavigate(testCase.screen)}
                  >
                    <Text style={styles.testActionButtonText}>Navigate to Feature</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.testResultButtons}>
                  <TouchableOpacity
                    style={[styles.resultButton, styles.passButton]}
                    onPress={() => handleTestResult(testCase.id, true)}
                  >
                    <Check size={16} color={Colors.text} />
                    <Text style={styles.resultButtonText}>Pass</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.resultButton, styles.failButton]}
                    onPress={() => handleTestResult(testCase.id, false)}
                  >
                    <X size={16} color={Colors.text} />
                    <Text style={styles.resultButtonText}>Fail</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  runAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: premiumColors.neonCyan,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  runAllButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  quickNav: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  quickNavTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  quickNavButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  testNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  testInfo: {
    flex: 1,
  },
  testFeature: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  testStatus: {
    marginLeft: 12,
  },
  testSteps: {
    marginBottom: 16,
  },
  testStepsTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  testStep: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  testStepNumber: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  testStepText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  expectedResult: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  expectedResultLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
    marginBottom: 4,
  },
  expectedResultText: {
    fontSize: 12,
    color: Colors.text,
  },
  testActions: {
    gap: 12,
  },
  testActionButton: {
    backgroundColor: Colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testActionButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  testResultButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  passButton: {
    backgroundColor: premiumColors.neonGreen,
  },
  failButton: {
    backgroundColor: premiumColors.neonMagenta,
  },
  resultButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
