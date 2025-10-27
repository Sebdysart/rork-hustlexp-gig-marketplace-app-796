import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Circle, Play, AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/designTokens';
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';

interface TestCase {
  id: string;
  name: string;
  description: string;
  steps: string[];
  status: 'pending' | 'pass' | 'fail';
}

export default function TestOptionAComplete() {
  const router = useRouter();
  const { open, proactiveAlerts, messages } = useUltimateAICoach();
  
  const [tests, setTests] = useState<TestCase[]>([
    {
      id: 'floating-button',
      name: 'Floating AI Button',
      description: 'Verify floating button appears and is functional',
      steps: [
        'Look for purple sparkle button in bottom-right',
        'Button should pulse and glow',
        'Tap button to open AI Coach',
        'Verify modal opens',
      ],
      status: 'pending',
    },
    {
      id: 'notification-badge',
      name: 'Notification Badge',
      description: 'Badge shows when proactive alerts exist',
      steps: [
        'Check floating button for red badge',
        `Current unread alerts: ${proactiveAlerts.length}`,
        'Badge should appear when alerts > 0',
        'Badge should disappear when alerts read',
      ],
      status: 'pending',
    },
    {
      id: 'proactive-alerts',
      name: 'Proactive Alert System',
      description: 'Verify 5 alert types are configured',
      steps: [
        'Streak warning (2hrs before expiry)',
        'Perfect match (95%+ score)',
        'Earnings opportunity (3+ high-pay)',
        'Level up soon (80%+ progress)',
        'Badge progress (80%+ complete)',
      ],
      status: 'pending',
    },
    {
      id: 'quick-actions-home',
      name: 'Quick Actions - Home',
      description: 'Context-aware actions on home screen',
      steps: [
        'Navigate to Home screen',
        'Look for "AI Quick Actions" panel at bottom',
        'Should show 3 actions: Perfect Matches, Nearby, Earning Potential',
        'Tap any action → AI Coach opens with context',
      ],
      status: 'pending',
    },
    {
      id: 'quick-actions-wallet',
      name: 'Quick Actions - Wallet',
      description: 'Wallet-specific AI actions',
      steps: [
        'Navigate to Wallet screen',
        'Look for Quick Actions panel',
        'Should show: Forecast, Boost Income, Analyze',
        'Actions should be relevant to earnings',
      ],
      status: 'pending',
    },
    {
      id: 'quick-actions-profile',
      name: 'Quick Actions - Profile',
      description: 'Profile-specific AI actions',
      steps: [
        'Navigate to Profile screen',
        'Look for Quick Actions panel',
        'Should show: Performance Review, Level Up, Badges',
        'Actions should be relevant to user stats',
      ],
      status: 'pending',
    },
    {
      id: 'ai-coach-modal',
      name: 'AI Coach Modal',
      description: 'Full chat interface works',
      steps: [
        'Open AI Coach via floating button',
        'Modal slides up from bottom',
        'Shows chat history',
        'Can send messages',
        'Messages get AI responses',
      ],
      status: 'pending',
    },
    {
      id: 'context-awareness',
      name: 'Context Awareness',
      description: 'AI knows current screen context',
      steps: [
        'Open AI on different screens',
        'Quick actions should change per screen',
        'AI responses should be contextual',
        'Actions navigate to relevant screens',
      ],
      status: 'pending',
    },
    {
      id: 'animations',
      name: 'Animations & Polish',
      description: 'Smooth 60 FPS animations',
      steps: [
        'Floating button pulse animation',
        'Quick actions slide-up animation',
        'Modal slide-up transition',
        'All animations smooth, no jank',
      ],
      status: 'pending',
    },
    {
      id: 'integration',
      name: 'Full Integration',
      description: 'All components work together',
      steps: [
        'Floating button + Quick actions visible',
        'Proactive alerts trigger correctly',
        'Backend AI responses working',
        'No console errors',
        'Works on iOS/Android/Web',
      ],
      status: 'pending',
    },
  ]);

  const updateTestStatus = (id: string, status: 'pass' | 'fail') => {
    setTests(prev =>
      prev.map(test => (test.id === id ? { ...test, status } : test))
    );
  };

  const passedTests = tests.filter(t => t.status === 'pass').length;
  const failedTests = tests.filter(t => t.status === 'fail').length;
  const pendingTests = tests.filter(t => t.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Option A - 100% Test Suite',
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#FFF',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <LinearGradient
          colors={['rgba(138, 43, 226, 0.2)', 'rgba(138, 43, 226, 0.05)']}
          style={styles.header}
        >
          <Text style={styles.title}>🎯 Option A: 100% Complete</Text>
          <Text style={styles.subtitle}>Test Suite & Verification</Text>

          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{passedTests}</Text>
              <Text style={styles.statLabel}>Passed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{failedTests}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pendingTests}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>💡 Total Messages: {messages.length}</Text>
            <Text style={styles.infoText}>🔔 Proactive Alerts: {proactiveAlerts.length}</Text>
            <Text style={styles.infoText}>
              ✅ Completion: {Math.round((passedTests / tests.length) * 100)}%
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={open}
          >
            <Text style={styles.quickButtonText}>🎯 Open AI Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.quickButtonText}>🏠 Test Home Screen</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Test Cases</Text>

        {tests.map((test) => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.testHeader}>
              <View style={styles.testTitleRow}>
                {test.status === 'pass' && <CheckCircle color="#00FF88" size={24} />}
                {test.status === 'fail' && <AlertCircle color="#FF4444" size={24} />}
                {test.status === 'pending' && <Circle color={COLORS.textSecondary} size={24} />}
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testDescription}>{test.description}</Text>
                </View>
              </View>
            </View>

            <View style={styles.testSteps}>
              {test.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {test.status === 'pending' && (
              <View style={styles.testActions}>
                <TouchableOpacity
                  style={[styles.testButton, styles.passButton]}
                  onPress={() => updateTestStatus(test.id, 'pass')}
                >
                  <CheckCircle color="#FFF" size={18} />
                  <Text style={styles.testButtonText}>Pass</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.testButton, styles.failButton]}
                  onPress={() => updateTestStatus(test.id, 'fail')}
                >
                  <AlertCircle color="#FFF" size={18} />
                  <Text style={styles.testButtonText}>Fail</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {passedTests === tests.length && (
          <LinearGradient
            colors={['rgba(0, 255, 136, 0.2)', 'rgba(0, 255, 136, 0.05)']}
            style={styles.successCard}
          >
            <Text style={styles.successTitle}>🎉 All Tests Passed!</Text>
            <Text style={styles.successText}>
              Option A is 100% complete and ready for production!
            </Text>
          </LinearGradient>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  testHeader: {
    marginBottom: 12,
  },
  testTitleRow: {
    flexDirection: 'row',
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
  testDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  testSteps: {
    gap: 8,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepNumber: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600' as const,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  testActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  passButton: {
    backgroundColor: '#00FF88',
  },
  failButton: {
    backgroundColor: '#FF4444',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  successCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#00FF88',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
  },
});
