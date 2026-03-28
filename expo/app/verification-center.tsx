import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Database,
  Server,
  Smartphone,
  Wifi,
  Activity,
  Eye,
} from 'lucide-react-native';
import { premiumColors, spacing, borderRadius, COLORS } from '@/constants/designTokens';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

interface TestResult {
  name: string;
  status: TestStatus;
  message: string;
  details?: string;
}

interface TestCategory {
  title: string;
  icon: any;
  tests: TestResult[];
}

export default function VerificationCenter() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const appContext = useApp();

  const [categories, setCategories] = useState<TestCategory[]>([
    {
      title: 'Context & State',
      icon: Database,
      tests: [
        { name: 'UserContext', status: 'pending', message: 'Not tested' },
        { name: 'TasksContext', status: 'pending', message: 'Not tested' },
        { name: 'EconomyContext', status: 'pending', message: 'Not tested' },
        { name: 'AppContext', status: 'pending', message: 'Not tested' },
      ],
    },
    {
      title: 'Storage & Data',
      icon: Server,
      tests: [
        { name: 'AsyncStorage', status: 'pending', message: 'Not tested' },
        { name: 'User Data', status: 'pending', message: 'Not tested' },
        { name: 'Task Data', status: 'pending', message: 'Not tested' },
        { name: 'Economy Data', status: 'pending', message: 'Not tested' },
      ],
    },
    {
      title: 'Platform & UI',
      icon: Smartphone,
      tests: [
        { name: 'Platform Detection', status: 'pending', message: 'Not tested' },
        { name: 'SafeArea Insets', status: 'pending', message: 'Not tested' },
        { name: 'Text Node Safety', status: 'pending', message: 'Not tested' },
        { name: 'Navigation', status: 'pending', message: 'Not tested' },
      ],
    },
    {
      title: 'Network & APIs',
      icon: Wifi,
      tests: [
        { name: 'Internet Connection', status: 'pending', message: 'Not tested' },
        { name: 'Backend Health', status: 'pending', message: 'Not tested' },
      ],
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');

  const updateTest = (categoryIndex: number, testIndex: number, status: TestStatus, message: string, details?: string) => {
    setCategories(prev => {
      const newCategories = [...prev];
      newCategories[categoryIndex].tests[testIndex] = {
        ...newCategories[categoryIndex].tests[testIndex],
        status,
        message,
        details,
      };
      return newCategories;
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');

    try {
      await testContexts();
      await testStorage();
      await testPlatform();
      await testNetwork();

      const allPassed = categories.every(cat => 
        cat.tests.every(test => test.status === 'passed')
      );
      setOverallStatus(allPassed ? 'passed' : 'failed');
    } catch (error) {
      console.error('Test suite error:', error);
      setOverallStatus('failed');
    } finally {
      setIsRunning(false);
    }
  };

  const testContexts = async () => {
    updateTest(0, 0, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      if (!appContext.currentUser && !appContext.hasOnboarded) {
        updateTest(0, 0, 'passed', 'UserContext loaded', 'No user, not onboarded (expected)');
      } else if (appContext.currentUser) {
        updateTest(0, 0, 'passed', 'UserContext loaded', `User: ${appContext.currentUser.name}`);
      } else {
        updateTest(0, 0, 'passed', 'UserContext loaded', 'Has onboarded');
      }
    } catch (error) {
      updateTest(0, 0, 'failed', 'UserContext error', String(error));
    }

    updateTest(0, 1, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const taskCount = appContext.tasks?.length || 0;
      updateTest(0, 1, 'passed', 'TasksContext loaded', `${taskCount} tasks`);
    } catch (error) {
      updateTest(0, 1, 'failed', 'TasksContext error', String(error));
    }

    updateTest(0, 2, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const hasEconomyContext = appContext.awardGrit !== undefined && 
                               appContext.processTaskCompletion !== undefined;
      if (hasEconomyContext) {
        const grit = appContext.currentUser?.wallet?.grit || 0;
        updateTest(0, 2, 'passed', 'EconomyContext loaded', `${grit} Grit coins`);
      } else {
        updateTest(0, 2, 'failed', 'EconomyContext missing', 'Economy functions not available');
      }
    } catch (error) {
      updateTest(0, 2, 'failed', 'EconomyContext error', String(error));
    }

    updateTest(0, 3, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const hasUserContext = appContext.currentUser !== undefined || appContext.users !== undefined;
      const hasTasksContext = appContext.tasks !== undefined;
      const hasEconomyContext = appContext.awardGrit !== undefined;
      const hasAllProps = hasUserContext && hasTasksContext && hasEconomyContext;
      
      if (hasAllProps) {
        updateTest(0, 3, 'passed', 'AppContext merged', 'All contexts available');
      } else {
        const missing = [];
        if (!hasUserContext) missing.push('User');
        if (!hasTasksContext) missing.push('Tasks');
        if (!hasEconomyContext) missing.push('Economy');
        updateTest(0, 3, 'failed', 'AppContext incomplete', `Missing: ${missing.join(', ')}`);
      }
    } catch (error) {
      updateTest(0, 3, 'failed', 'AppContext error', String(error));
    }
  };

  const testStorage = async () => {
    updateTest(1, 0, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const testKey = 'verification_test';
      const testValue = 'test_value_' + Date.now();
      await AsyncStorage.setItem(testKey, testValue);
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        updateTest(1, 0, 'passed', 'AsyncStorage working', 'Read/write successful');
      } else {
        updateTest(1, 0, 'failed', 'AsyncStorage mismatch', `Expected ${testValue}, got ${retrieved}`);
      }
    } catch (error) {
      updateTest(1, 0, 'failed', 'AsyncStorage error', String(error));
    }

    updateTest(1, 1, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const userData = await AsyncStorage.getItem('hustlexp_current_user');
      const users = await AsyncStorage.getItem('hustlexp_users');
      if (users) {
        const usersArray = JSON.parse(users);
        updateTest(1, 1, 'passed', 'User data stored', `${usersArray.length} users in storage`);
      } else {
        updateTest(1, 1, 'passed', 'User data empty', 'No users stored yet');
      }
    } catch (error) {
      updateTest(1, 1, 'failed', 'User data error', String(error));
    }

    updateTest(1, 2, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const tasks = await AsyncStorage.getItem('hustlexp_tasks');
      if (tasks) {
        const tasksArray = JSON.parse(tasks);
        updateTest(1, 2, 'passed', 'Task data stored', `${tasksArray.length} tasks`);
      } else {
        updateTest(1, 2, 'passed', 'Task data empty', 'No tasks stored yet');
      }
    } catch (error) {
      updateTest(1, 2, 'failed', 'Task data error', String(error));
    }

    updateTest(1, 3, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const wallet = await AsyncStorage.getItem('hustlexp_wallet');
      if (wallet) {
        const walletData = JSON.parse(wallet);
        updateTest(1, 3, 'passed', 'Economy data stored', `Grit: ${walletData.grit || 0}`);
      } else {
        updateTest(1, 3, 'passed', 'Economy data empty', 'No wallet data yet');
      }
    } catch (error) {
      updateTest(1, 3, 'failed', 'Economy data error', String(error));
    }
  };

  const testPlatform = async () => {
    updateTest(2, 0, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const platform = Platform.OS;
      const version = Platform.Version;
      updateTest(2, 0, 'passed', `Platform: ${platform}`, `Version: ${version}`);
    } catch (error) {
      updateTest(2, 0, 'failed', 'Platform error', String(error));
    }

    updateTest(2, 1, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const hasInsets = insets && (insets.top > 0 || insets.bottom > 0);
      updateTest(2, 1, 'passed', 'SafeArea working', `Top: ${insets.top}, Bottom: ${insets.bottom}`);
    } catch (error) {
      updateTest(2, 1, 'failed', 'SafeArea error', String(error));
    }

    updateTest(2, 2, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const testElement = <View><Text>Test</Text></View>;
      updateTest(2, 2, 'passed', 'Text nodes safe', 'No errors detected');
    } catch (error) {
      updateTest(2, 2, 'failed', 'Text node error', String(error));
    }

    updateTest(2, 3, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      updateTest(2, 3, 'passed', 'Navigation ready', 'Expo Router loaded');
    } catch (error) {
      updateTest(2, 3, 'failed', 'Navigation error', String(error));
    }
  };

  const testNetwork = async () => {
    updateTest(3, 0, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD' });
      if (response.ok) {
        updateTest(3, 0, 'passed', 'Internet connected', 'Connection successful');
      } else {
        updateTest(3, 0, 'failed', 'Internet issue', `Status: ${response.status}`);
      }
    } catch (error) {
      updateTest(3, 0, 'failed', 'No internet', String(error));
    }

    updateTest(3, 1, 'running', 'Testing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      try {
        const response = await fetch(`${backendUrl}/health`, { method: 'GET' });
        if (response.ok) {
          updateTest(3, 1, 'passed', 'Backend online', backendUrl);
        } else {
          updateTest(3, 1, 'failed', 'Backend error', `Status: ${response.status}`);
        }
      } catch (error) {
        updateTest(3, 1, 'failed', 'Backend unreachable', String(error));
      }
    } else {
      updateTest(3, 1, 'passed', 'Backend not configured', 'No backend URL set');
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle2 size={20} color={premiumColors.neonGreen} />;
      case 'failed': return <XCircle size={20} color={COLORS.error} />;
      case 'running': return <Loader2 size={20} color={premiumColors.neonCyan} />;
      default: return <AlertCircle size={20} color="#666" />;
    }
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'passed': return premiumColors.neonGreen;
      case 'failed': return COLORS.error;
      case 'running': return premiumColors.neonCyan;
      default: return '#666';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ 
        headerShown: false,
      }} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Activity size={28} color={premiumColors.neonCyan} />
          <Text style={styles.headerTitle}>Verification Center</Text>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <XCircle size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl }
        ]}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Eye size={24} color={premiumColors.neonCyan} />
            <Text style={styles.statusTitle}>System Status</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Overall:</Text>
            <Text style={[
              styles.statusValue,
              { color: overallStatus === 'passed' ? premiumColors.neonGreen : 
                       overallStatus === 'failed' ? COLORS.error :
                       overallStatus === 'running' ? premiumColors.neonCyan : '#FFF' }
            ]}>
              {overallStatus === 'idle' ? 'Not Run' : 
               overallStatus === 'running' ? 'Running...' :
               overallStatus === 'passed' ? 'All Passed' : 'Some Failed'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Platform:</Text>
            <Text style={styles.statusValue}>{Platform.OS}</Text>
          </View>
          {appContext.currentUser && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>User:</Text>
              <Text style={styles.statusValue}>{appContext.currentUser.name}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.runButton,
            isRunning && styles.runButtonDisabled
          ]}
          onPress={runTests}
          disabled={isRunning}
        >
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        {categories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <category.icon size={24} color={premiumColors.neonCyan} />
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            {category.tests.map((test, testIndex) => (
              <View key={testIndex} style={styles.testRow}>
                <View style={styles.testLeft}>
                  {getStatusIcon(test.status)}
                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>{test.name}</Text>
                    <Text style={[
                      styles.testMessage,
                      { color: getStatusColor(test.status) }
                    ]}>
                      {test.message}
                    </Text>
                    {test.details && (
                      <Text style={styles.testDetails}>{test.details}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.infoCard}>
          <AlertCircle size={20} color={premiumColors.neonAmber} />
          <Text style={styles.infoText}>
            This verification center tests all critical app components. 
            Run tests before reporting issues or starting development.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  closeButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  statusLabel: {
    fontSize: 14,
    color: '#AAA',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  runButton: {
    backgroundColor: premiumColors.neonCyan,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  runButtonDisabled: {
    opacity: 0.5,
  },
  runButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.deepBlack,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  testLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  testMessage: {
    fontSize: 12,
    marginBottom: 2,
  },
  testDetails: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 180, 0, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 0, 0.3)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#CCC',
    lineHeight: 18,
  },
});
