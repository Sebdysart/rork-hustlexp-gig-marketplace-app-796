import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import { hustleAI } from '@/utils/hustleAI';
import { CheckCircle, XCircle, Zap, AlertTriangle } from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const HUSTLEAI_URL = process.env.EXPO_PUBLIC_HUSTLEAI_URL || 'http://localhost:5000';

export default function AIDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>({});
  const [chatTest, setChatTest] = useState<any>(null);

  const testEndpoint = async (name: string, url: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      console.log(`[AI DIAGNOSTIC] Testing ${name}:`, url);
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      const contentType = response.headers.get('content-type');
      let data = null;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { raw: text.substring(0, 200) };
      }
      
      console.log(`[AI DIAGNOSTIC] ${name} Response:`, response.status, data);
      
      return {
        success: response.ok,
        status: response.status,
        data,
        duration,
        error: null,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      console.error(`[AI DIAGNOSTIC] ${name} Error:`, error);
      
      return {
        success: false,
        status: 0,
        data: null,
        duration,
        error: error.name === 'AbortError' ? 'Timeout (10s)' : (error.message || String(error)),
      };
    }
  };

  const testAIChatDirect = async () => {
    console.log('[AI DIAGNOSTIC] Testing AI Chat via hustleAI.chat()');
    const startTime = Date.now();
    
    try {
      const response = await hustleAI.chat('test-user-diagnostic', 'hello');
      const duration = Date.now() - startTime;
      
      console.log('[AI DIAGNOSTIC] AI Chat Response:', response);
      
      return {
        success: true,
        response: response.response,
        confidence: response.confidence,
        duration,
        error: null,
        isMock: response.response.includes('backend is currently unavailable'),
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      console.error('[AI DIAGNOSTIC] AI Chat Error:', error);
      
      return {
        success: false,
        response: null,
        confidence: 0,
        duration,
        error: error.message || String(error),
        isMock: false,
      };
    }
  };

  const runFullDiagnostic = async () => {
    setTesting(true);
    setResults({});
    setChatTest(null);

    const tests: any = {};

    // Test 1: Health endpoint
    tests.health = await testEndpoint('Health Check', `${API_URL}/api/health`);
    setResults({ ...tests });

    // Test 2: Direct backend root
    tests.backendRoot = await testEndpoint('Backend Root', BACKEND_URL);
    setResults({ ...tests });

    // Test 3: HTTPS health (hardcoded Replit URL)
    tests.httpsHealth = await testEndpoint('HTTPS Health', 'https://workspace-dycejr.replit.dev/api/health');
    setResults({ ...tests });

    // Test 4: AI Chat endpoint (POST)
    tests.chatEndpoint = await testEndpoint(
      'AI Chat Endpoint',
      `${HUSTLEAI_URL}/api/agent/chat`,
      'POST',
      { userId: 'test-user', message: 'hello' }
    );
    setResults({ ...tests });

    // Test 5: AI Chat via hustleAI.chat()
    const chatResult = await testAIChatDirect();
    setChatTest(chatResult);

    setTesting(false);
  };

  useEffect(() => {
    runFullDiagnostic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTestResult = (name: string, result: any) => {
    if (!result) {
      return null;
    }

    const Icon = result.success ? CheckCircle : XCircle;
    const iconColor = result.success ? premiumColors.neonGreen : '#FF6B6B';

    return (
      <GlassCard key={name} style={styles.testCard}>
        <View style={styles.testHeader}>
          <Text style={styles.testName}>{name}</Text>
          <Icon size={24} color={iconColor} />
        </View>
        <View style={styles.testDetails}>
          <Text style={styles.detailText}>Status: {result.status || 'N/A'}</Text>
          <Text style={styles.detailText}>Duration: {result.duration}ms</Text>
          {result.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{result.error}</Text>
            </View>
          )}
          {result.data && result.success && (
            <View style={styles.dataBox}>
              <Text style={styles.dataText}>
                {JSON.stringify(result.data, null, 2).substring(0, 150)}
              </Text>
            </View>
          )}
        </View>
      </GlassCard>
    );
  };

  const getDiagnosisMessage = () => {
    if (!chatTest || Object.keys(results).length === 0) {
      return null;
    }

    // Check if AI is working
    if (chatTest.success && !chatTest.isMock) {
      return {
        type: 'success',
        title: '✅ AI IS WORKING!',
        message: 'Your backend AI is connected and responding correctly.',
        icon: CheckCircle,
        color: premiumColors.neonGreen,
      };
    }

    // Check if getting mock responses
    if (chatTest.isMock) {
      return {
        type: 'warning',
        title: '⚠️ BACKEND NOT CONNECTED',
        message: 'AI is responding with fallback messages. Your Replit backend is not reachable.',
        icon: AlertTriangle,
        color: '#FFA500',
      };
    }

    // Complete failure
    return {
      type: 'error',
      title: '❌ AI NOT WORKING',
      message: 'AI Chat is completely failing. Check the error details below.',
      icon: XCircle,
      color: '#FF6B6B',
    };
  };

  const diagnosis = getDiagnosisMessage();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'AI Diagnostic', 
        headerStyle: { backgroundColor: '#000814' },
        headerTintColor: '#FFFFFF',
      }} />
      
      <LinearGradient
        colors={['#000814', '#001845', '#000814']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Zap size={56} color={premiumColors.neonCyan} />
          <Text style={styles.title}>AI Connection Diagnostic</Text>
          <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
        </View>

        {diagnosis && (
          <GlassCard style={[styles.diagnosisCard, { borderLeftColor: diagnosis.color, borderLeftWidth: 6 }]}>
            <View style={styles.diagnosisHeader}>
              <diagnosis.icon size={32} color={diagnosis.color} />
              <Text style={[styles.diagnosisTitle, { color: diagnosis.color }]}>{diagnosis.title}</Text>
            </View>
            <Text style={styles.diagnosisMessage}>{diagnosis.message}</Text>
          </GlassCard>
        )}

        <GlassCard style={styles.envCard}>
          <Text style={styles.sectionTitle}>Environment Configuration:</Text>
          <Text style={styles.envLabel}>EXPO_PUBLIC_API_URL:</Text>
          <Text style={styles.envValue}>{API_URL}</Text>
          <Text style={styles.envLabel}>EXPO_PUBLIC_BACKEND_URL:</Text>
          <Text style={styles.envValue}>{BACKEND_URL}</Text>
          <Text style={styles.envLabel}>EXPO_PUBLIC_HUSTLEAI_URL:</Text>
          <Text style={styles.envValue}>{HUSTLEAI_URL}</Text>
        </GlassCard>

        {testing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={premiumColors.neonCyan} />
            <Text style={styles.loadingText}>Running diagnostic tests...</Text>
          </View>
        )}

        {Object.keys(results).length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Endpoint Tests:</Text>
            {renderTestResult('Health Check', results.health)}
            {renderTestResult('Backend Root', results.backendRoot)}
            {renderTestResult('HTTPS Health', results.httpsHealth)}
            {renderTestResult('AI Chat Endpoint', results.chatEndpoint)}
          </View>
        )}

        {chatTest && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>AI Chat Test (via hustleAI.chat):</Text>
            <GlassCard style={[
              styles.testCard,
              { borderLeftWidth: 6, borderLeftColor: chatTest.success && !chatTest.isMock ? premiumColors.neonGreen : '#FF6B6B' }
            ]}>
              <View style={styles.testHeader}>
                <Text style={styles.testName}>AI Chat Function</Text>
                {chatTest.success && !chatTest.isMock ? (
                  <CheckCircle size={24} color={premiumColors.neonGreen} />
                ) : (
                  <XCircle size={24} color="#FF6B6B" />
                )}
              </View>
              <View style={styles.testDetails}>
                <Text style={styles.detailText}>Duration: {chatTest.duration}ms</Text>
                {chatTest.success && (
                  <>
                    <Text style={styles.detailText}>Confidence: {chatTest.confidence}%</Text>
                    <Text style={styles.detailText}>Using Mock: {chatTest.isMock ? 'YES ⚠️' : 'NO ✅'}</Text>
                    <View style={styles.responseBox}>
                      <Text style={styles.responseLabel}>Response:</Text>
                      <Text style={styles.responseText}>{chatTest.response?.substring(0, 200)}</Text>
                    </View>
                  </>
                )}
                {chatTest.error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{chatTest.error}</Text>
                  </View>
                )}
              </View>
            </GlassCard>
          </View>
        )}

        <TouchableOpacity
          style={styles.retryButton}
          onPress={runFullDiagnostic}
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
                <Text style={styles.buttonText}>Run Diagnostic Again</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <GlassCard style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>🔧 Next Steps:</Text>
          
          {chatTest?.isMock && (
            <>
              <Text style={styles.warningText}>⚠️ YOUR BACKEND IS NOT CONNECTED</Text>
              <Text style={styles.instructionItem}>1. Go to your Replit backend project</Text>
              <Text style={styles.instructionItem}>2. Make sure it&apos;s running (should see logs)</Text>
              <Text style={styles.instructionItem}>3. Copy the EXACT domain from Replit</Text>
              <Text style={styles.instructionItem}>4. Update .env with that domain</Text>
              <Text style={styles.instructionItem}>5. Restart this mobile app completely</Text>
            </>
          )}
          
          {chatTest?.success && !chatTest?.isMock && (
            <>
              <Text style={styles.successText}>✅ Everything is working!</Text>
              <Text style={styles.instructionItem}>Your AI Coach should now work with real AI responses.</Text>
            </>
          )}
        </GlassCard>
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
    paddingBottom: spacing.xxl * 3,
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
    fontSize: 14,
    color: premiumColors.glassWhite,
    textAlign: 'center',
  },
  diagnosisCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  diagnosisTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  diagnosisMessage: {
    fontSize: 15,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 22,
  },
  envCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  envLabel: {
    fontSize: 12,
    color: premiumColors.glassWhite,
    marginTop: spacing.sm,
  },
  envValue: {
    fontSize: 13,
    color: premiumColors.neonCyan,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    marginBottom: spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: premiumColors.glassWhite,
  },
  resultsSection: {
    marginBottom: spacing.xl,
  },
  testCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  testDetails: {
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: premiumColors.glassWhite,
  },
  errorBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: borderRadius.md,
  },
  errorText: {
    fontSize: 13,
    color: '#FF6B6B',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  dataBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderRadius: borderRadius.md,
  },
  dataText: {
    fontSize: 11,
    color: premiumColors.glassWhite,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  responseBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
  },
  responseLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.xs,
  },
  responseText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  retryButton: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
  instructionsCard: {
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFA500',
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
    marginBottom: spacing.md,
  },
  instructionItem: {
    fontSize: 14,
    color: premiumColors.glassWhite,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});
