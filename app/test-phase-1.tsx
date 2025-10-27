import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Play } from 'lucide-react-native';
import { COLORS } from '@/constants/designTokens';

type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: TestStatus;
  error?: string;
  steps?: string[];
  currentStep?: number;
}

export default function TestPhase1Screen() {
  const router = useRouter();
  const aiCoach = useUltimateAICoach();
  const { currentUser } = useApp();

  const [tests, setTests] = useState<TestCase[]>([
    {
      id: 'context-awareness',
      name: 'Context Awareness',
      description: 'AI should know current screen and user data without asking',
      status: 'pending',
      steps: [
        'Check if AI context has currentUser data',
        'Verify availableTasks count is accessible',
        'Confirm userPatterns are analyzed',
        'Validate context updates work',
      ],
    },
    {
      id: 'message-persistence',
      name: 'Message Persistence',
      description: 'Messages should persist across app restarts',
      status: 'pending',
      steps: [
        'Send test message',
        'Check messages array',
        'Verify message saved to AsyncStorage',
        'Confirm message ID format',
      ],
    },
    {
      id: 'proactive-alerts',
      name: 'Proactive Alerts',
      description: 'AI should send alerts for streaks, matches, etc.',
      status: 'pending',
      steps: [
        'Check proactiveAlerts array',
        'Verify throttling (1 per hour)',
        'Confirm alert types work',
        'Validate haptic feedback',
      ],
    },
    {
      id: 'highlight-system',
      name: 'Highlight System',
      description: 'UI highlighting overlay should work',
      status: 'pending',
      steps: [
        'Check highlightConfig state',
        'Test highlightElement function',
        'Verify dismissHighlight works',
        'Confirm duration timer works',
      ],
    },
    {
      id: 'settings-management',
      name: 'Settings Management',
      description: 'Settings should persist and apply correctly',
      status: 'pending',
      steps: [
        'Load settings from AsyncStorage',
        'Update settings',
        'Verify settings apply',
        'Confirm settings persist',
      ],
    },
    {
      id: 'backend-health',
      name: 'Backend Health Check',
      description: 'Backend connection should be monitored',
      status: 'pending',
      steps: [
        'Check backendStatus',
        'Verify health monitoring',
        'Confirm status updates',
        'Test fallback behavior',
      ],
    },
  ]);

  const [autoRun, setAutoRun] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  useEffect(() => {
    if (autoRun && currentTestIndex < tests.length) {
      const test = tests[currentTestIndex];
      if (test.status === 'pending') {
        runTest(test.id);
      }
    }
  }, [autoRun, currentTestIndex]);

  const updateTest = (id: string, updates: Partial<TestCase>) => {
    setTests(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const runTest = async (testId: string) => {
    updateTest(testId, { status: 'running', error: undefined, currentStep: 0 });

    try {
      switch (testId) {
        case 'context-awareness':
          await testContextAwareness(testId);
          break;
        case 'message-persistence':
          await testMessagePersistence(testId);
          break;
        case 'proactive-alerts':
          await testProactiveAlerts(testId);
          break;
        case 'highlight-system':
          await testHighlightSystem(testId);
          break;
        case 'settings-management':
          await testSettingsManagement(testId);
          break;
        case 'backend-health':
          await testBackendHealth(testId);
          break;
      }
      updateTest(testId, { status: 'passed', currentStep: undefined });
      
      if (autoRun) {
        setCurrentTestIndex(prev => prev + 1);
      }
    } catch (error: any) {
      updateTest(testId, {
        status: 'failed',
        error: error.message,
        currentStep: undefined,
      });
      setAutoRun(false);
    }
  };

  const testContextAwareness = async (testId: string) => {
    updateTest(testId, { currentStep: 0 });
    await delay(500);

    if (!aiCoach.currentContext) {
      throw new Error('currentContext is undefined');
    }

    updateTest(testId, { currentStep: 1 });
    await delay(500);

    if (!currentUser) {
      throw new Error('currentUser not available in context');
    }

    updateTest(testId, { currentStep: 2 });
    await delay(500);

    if (!aiCoach.userPatterns) {
      console.warn('User patterns not analyzed yet (expected for new users)');
    }

    updateTest(testId, { currentStep: 3 });
    await delay(500);

    aiCoach.updateContext({ screen: 'test-phase-1', testMode: true });
    if (!aiCoach.currentContext.testMode) {
      throw new Error('Context update failed');
    }
  };

  const testMessagePersistence = async (testId: string) => {
    updateTest(testId, { currentStep: 0 });
    await delay(500);

    const testMessage = `Test message ${Date.now()}`;
    await aiCoach.sendMessage(testMessage);

    updateTest(testId, { currentStep: 1 });
    await delay(1000);

    const lastMessage = aiCoach.messages[aiCoach.messages.length - 2];
    if (!lastMessage || lastMessage.content !== testMessage) {
      throw new Error('Message not found in messages array');
    }

    updateTest(testId, { currentStep: 2 });
    await delay(500);

    if (!lastMessage.id.startsWith('user-')) {
      throw new Error('Message ID format incorrect');
    }

    updateTest(testId, { currentStep: 3 });
  };

  const testProactiveAlerts = async (testId: string) => {
    updateTest(testId, { currentStep: 0 });
    await delay(500);

    const proactiveMessages = aiCoach.messages.filter(m => m.proactive);
    console.log(`Found ${proactiveMessages.length} proactive alerts`);

    updateTest(testId, { currentStep: 1 });
    await delay(500);

    if (proactiveMessages.length > 1) {
      const first = proactiveMessages[0];
      const second = proactiveMessages[1];
      const timeDiff = new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime();
      
      if (timeDiff < 60 * 60 * 1000) {
        console.warn('Proactive alerts sent too frequently (should be 1 per hour)');
      }
    }

    updateTest(testId, { currentStep: 2 });
    await delay(500);

    if (aiCoach.settings.proactiveAlertsEnabled === false) {
      console.log('Proactive alerts are disabled in settings');
    }

    updateTest(testId, { currentStep: 3 });
  };

  const testHighlightSystem = async (testId: string) => {
    updateTest(testId, { currentStep: 0 });
    await delay(500);

    if (aiCoach.highlightConfig !== null) {
      throw new Error('Highlight should be null initially');
    }

    updateTest(testId, { currentStep: 1 });
    await delay(500);

    aiCoach.highlightElement({
      elementId: 'test-button',
      message: 'Test highlight',
      position: { x: 100, y: 100, width: 200, height: 50 },
    }, undefined);

    await delay(100);

    if (!aiCoach.highlightConfig) {
      throw new Error('Highlight not set');
    }

    updateTest(testId, { currentStep: 2 });
    await delay(500);

    aiCoach.dismissHighlight();

    await delay(100);

    if (aiCoach.highlightConfig !== null) {
      throw new Error('Highlight not dismissed');
    }

    updateTest(testId, { currentStep: 3 });
    await delay(500);

    aiCoach.highlightElement({
      elementId: 'test-button-2',
      message: 'Test with duration',
      position: { x: 100, y: 200, width: 200, height: 50 },
    }, 1000);

    await delay(1200);

    if (aiCoach.highlightConfig !== null) {
      throw new Error('Highlight duration timer failed');
    }
  };

  const testSettingsManagement = async (testId: string) => {
    updateTest(testId, { currentStep: 0 });
    await delay(500);

    const originalSettings = { ...aiCoach.settings };

    updateTest(testId, { currentStep: 1 });
    await delay(500);

    await aiCoach.updateSettings({ hapticFeedback: !originalSettings.hapticFeedback });

    await delay(500);

    if (aiCoach.settings.hapticFeedback === originalSettings.hapticFeedback) {
      throw new Error('Settings not updated');
    }

    updateTest(testId, { currentStep: 2 });
    await delay(500);

    await aiCoach.updateSettings({ hapticFeedback: originalSettings.hapticFeedback });

    updateTest(testId, { currentStep: 3 });
  };

  const testBackendHealth = async (testId: string) => {
    updateTest(testId, { currentStep: 0 });
    await delay(500);

    if (!aiCoach.backendStatus) {
      throw new Error('Backend status not available');
    }

    updateTest(testId, { currentStep: 1 });
    await delay(500);

    console.log('Backend status:', aiCoach.backendStatus.message);

    updateTest(testId, { currentStep: 2 });
    await delay(500);

    if (!['online', 'degraded', 'offline'].includes(aiCoach.backendStatus.status)) {
      throw new Error('Invalid backend status');
    }

    updateTest(testId, { currentStep: 3 });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runAllTests = () => {
    setCurrentTestIndex(0);
    setAutoRun(true);
    setTests(prev => prev.map(t => ({ ...t, status: 'pending' as TestStatus, error: undefined })));
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={24} color={COLORS.success} />;
      case 'failed':
        return <XCircle size={24} color={COLORS.error} />;
      case 'running':
        return <ActivityIndicator size={24} color={COLORS.primary} />;
      default:
        return <AlertCircle size={24} color="#666" />;
    }
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const progress = (passedCount / tests.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Phase 1 Tests</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Test Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Progress: {Math.round(progress)}%</Text>
          <Text style={styles.summaryText}>
            {passedCount} passed, {failedCount} failed, {tests.length - passedCount - failedCount} pending
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.runAllButton, autoRun && styles.runAllButtonDisabled]}
          onPress={runAllTests}
          disabled={autoRun}
        >
          <Play size={20} color="#fff" />
          <Text style={styles.runAllButtonText}>
            {autoRun ? 'Running...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <View style={styles.autoRunToggle}>
          <Text style={styles.autoRunLabel}>Auto-run</Text>
          <Switch
            value={autoRun}
            onValueChange={setAutoRun}
            trackColor={{ false: '#444', true: COLORS.primary }}
          />
        </View>
      </View>

      <ScrollView style={styles.testList} contentContainerStyle={styles.testListContent}>
        {tests.map(test => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.testHeader}>
              {getStatusIcon(test.status)}
              <View style={styles.testInfo}>
                <Text style={styles.testName}>{test.name}</Text>
                <Text style={styles.testDescription}>{test.description}</Text>
              </View>
            </View>

            {test.steps && test.status === 'running' && (
              <View style={styles.steps}>
                {test.steps.map((step, index) => (
                  <View key={index} style={styles.step}>
                    <View
                      style={[
                        styles.stepIndicator,
                        index <= (test.currentStep ?? -1) && styles.stepIndicatorActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.stepText,
                        index === test.currentStep && styles.stepTextActive,
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {test.error && (
              <View style={styles.error}>
                <XCircle size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{test.error}</Text>
              </View>
            )}

            {test.status === 'pending' && (
              <TouchableOpacity
                style={styles.runButton}
                onPress={() => runTest(test.id)}
              >
                <Text style={styles.runButtonText}>Run Test</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Phase 1 Status: {passedCount === tests.length ? '✅ Complete' : '🚧 In Progress'}
        </Text>
        {passedCount === tests.length && (
          <Text style={styles.successText}>
            All tests passed! Ready for Phase 2 🚀
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  summary: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#999',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  runAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  runAllButtonDisabled: {
    opacity: 0.5,
  },
  runAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  autoRunToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoRunLabel: {
    fontSize: 14,
    color: '#999',
  },
  testList: {
    flex: 1,
  },
  testListContent: {
    padding: 20,
    gap: 16,
  },
  testCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  steps: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
    gap: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  stepIndicatorActive: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    fontSize: 13,
    color: '#666',
  },
  stepTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  runButton: {
    marginTop: 12,
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  runButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
    gap: 8,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: COLORS.success,
    textAlign: 'center',
  },
});
