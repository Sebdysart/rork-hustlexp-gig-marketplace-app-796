import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { testBackendConnection } from '@/utils/testBackendConnection';
import { triggerHaptic } from '@/utils/haptics';

interface TestResults {
  health: boolean;
  chat: boolean;
  feedback: boolean;
  aiProfile: boolean;
  experiments: boolean;
  taskHistory: boolean;
  nearbyTasks: boolean;
  earningsHistory: boolean;
  disputeAI: boolean;
}

export default function BackendTestScreen() {
  const insets = useSafeAreaInsets();
  const [testing, setTesting] = useState<boolean>(false);
  const [results, setResults] = useState<TestResults | null>(null);

  const runTests = async () => {
    triggerHaptic('medium');
    setTesting(true);
    setResults(null);
    
    try {
      const testResults = await testBackendConnection();
      setResults(testResults);
      triggerHaptic('success');
    } catch (error) {
      console.error('Test suite failed:', error);
      triggerHaptic('error');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (passed: boolean | undefined) => {
    if (passed === undefined) return null;
    return passed ? (
      <CheckCircle size={24} color={premiumColors.neonGreen} />
    ) : (
      <XCircle size={24} color={premiumColors.neonMagenta} />
    );
  };

  const tests = [
    { key: 'health' as const, label: 'Health Check', description: 'Backend is online and responding', category: 'core' },
    { key: 'chat' as const, label: 'AI Chat', description: 'GPT-4 Turbo chat endpoint', category: 'core' },
    { key: 'feedback' as const, label: 'Feedback Loop', description: 'AI learning from user actions', category: 'core' },
    { key: 'aiProfile' as const, label: 'AI User Profile', description: 'Personalized recommendations', category: 'core' },
    { key: 'experiments' as const, label: 'A/B Testing', description: 'Experiment tracking', category: 'core' },
    { key: 'taskHistory' as const, label: 'Task History', description: 'Safety Scanner - User stats', category: 'phase3' },
    { key: 'nearbyTasks' as const, label: 'Nearby Tasks', description: 'Smart Bundling - Geolocation', category: 'phase3' },
    { key: 'earningsHistory' as const, label: 'Earnings History', description: 'Predictive Earnings - Analytics', category: 'phase3' },
    { key: 'disputeAI' as const, label: 'Dispute AI', description: 'AI Dispute Assistant - Auto-resolve', category: 'phase3' },
  ];

  const passedCount = results ? Object.values(results).filter(r => r).length : 0;
  const totalTests = tests.length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Backend Connection Test',
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
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.headerCard}>
            <Text style={styles.title}>HustleAI Backend Test Suite</Text>
            <Text style={styles.subtitle}>
              Testing connection to:
              {'\n'}https://lunch-garden-dycejr.replit.app
            </Text>
            
            {results && (
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryText}>
                  {passedCount}/{totalTests} tests passed
                </Text>
              </View>
            )}
          </GlassCard>

          <TouchableOpacity
            style={styles.testButton}
            onPress={runTests}
            disabled={testing}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[premiumColors.neonViolet, premiumColors.neonViolet + 'CC']}
              style={styles.testButtonGradient}
            >
              {testing ? (
                <>
                  <ActivityIndicator color={Colors.text} />
                  <Text style={styles.testButtonText}>Testing...</Text>
                </>
              ) : (
                <>
                  <RefreshCw size={24} color={Colors.text} />
                  <Text style={styles.testButtonText}>
                    {results ? 'Run Tests Again' : 'Start Tests'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.testsContainer}>
            <Text style={styles.sectionTitle}>🎯 Core AI Features</Text>
            {tests.filter(t => t.category === 'core').map((test) => (
              <GlassCard 
                key={test.key} 
                variant="dark" 
                style={styles.testCard}
              >
                <View style={styles.testHeader}>
                  <View style={styles.testInfo}>
                    <Text style={styles.testLabel}>{test.label}</Text>
                    <Text style={styles.testDescription}>{test.description}</Text>
                  </View>
                  <View style={styles.testStatus}>
                    {testing && !results && (
                      <ActivityIndicator size="small" color={premiumColors.neonCyan} />
                    )}
                    {results && getStatusIcon(results[test.key])}
                  </View>
                </View>
              </GlassCard>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🚀 Phase 3 Mobile Features</Text>
            {tests.filter(t => t.category === 'phase3').map((test) => (
              <GlassCard 
                key={test.key} 
                variant="dark" 
                style={styles.testCard}
                neonBorder
                glowColor="neonGreen"
              >
                <View style={styles.testHeader}>
                  <View style={styles.testInfo}>
                    <Text style={styles.testLabel}>{test.label}</Text>
                    <Text style={styles.testDescription}>{test.description}</Text>
                  </View>
                  <View style={styles.testStatus}>
                    {testing && !results && (
                      <ActivityIndicator size="small" color={premiumColors.neonGreen} />
                    )}
                    {results && getStatusIcon(results[test.key])}
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>

          {results && (
            <GlassCard 
              variant="darkStrong" 
              neonBorder 
              glowColor={passedCount === totalTests ? "neonGreen" : passedCount > 0 ? "neonAmber" : "neonMagenta"}
              style={styles.resultCard}
            >
              <Text style={styles.resultTitle}>
                {passedCount === totalTests ? '✅ All Systems Operational!' : 
                 passedCount > 0 ? '⚠️ Partial Functionality' : 
                 '❌ Backend Not Responding'}
              </Text>
              <Text style={styles.resultText}>
                {passedCount === totalTests 
                  ? 'Your HustleAI backend is fully connected and ready. All AI features will work correctly.'
                  : passedCount > 0 
                  ? 'Some endpoints are working, but others are not responding. Check your Replit deployment.'
                  : 'Unable to reach the backend. Ensure your Replit deployment is active and the URL is correct.'}
              </Text>
            </GlassCard>
          )}

          <GlassCard variant="dark" style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ What This Tests</Text>
            <Text style={styles.infoText}>
              Core AI:{'\n'}
              • Backend health & response times{'\n'}
              • AI chat with GPT-4 Turbo{'\n'}
              • Feedback loop for learning{'\n'}
              • User profile personalization{'\n'}
              • A/B testing infrastructure{'\n'}
              {'\n'}
              Phase 3 Mobile:{'\n'}
              • Safety Scanner (task history){'\n'}
              • Smart Bundling (nearby tasks){'\n'}
              • Predictive Earnings (analytics){'\n'}
              • AI Dispute Assistant (auto-resolve)
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
  headerCard: {
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  testButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  testButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  testsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  testCard: {
    padding: 16,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  testInfo: {
    flex: 1,
    gap: 4,
  },
  testLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  testDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  testStatus: {
    width: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  resultCard: {
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
});
