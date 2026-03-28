/**
 * Text Node Error Diagnostic Tool
 * 
 * This page helps identify text node errors in real-time
 * Run this page and watch the console for any issues
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { premiumColors, spacing, typography } from '@/constants/designTokens';
import { useLanguage } from '@/contexts/LanguageContext';
import { TextNodeErrorDetector } from '@/utils/textNodeErrorDetector';
import { RuntimeErrorDebugger } from '@/utils/errorDebugger';
import GlassCard from '@/components/GlassCard';

export default function TextNodeDiagnostic() {
  const insets = useSafeAreaInsets();
  const { t, currentLanguage } = useLanguage();
  const [testResults, setTestResults] = useState<{
    name: string;
    passed: boolean;
    message: string;
  }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: typeof testResults = [];

    // Test 1: Translation function
    try {
      const homeTitle = t('tabs.home');
      const isValid = !!(homeTitle && homeTitle.trim() && homeTitle.trim() !== '.');
      results.push({
        name: 'Translation Function',
        passed: isValid,
        message: isValid 
          ? `t('tabs.home') = "${homeTitle}" ✓` 
          : `t('tabs.home') returned invalid value: "${homeTitle}"`,
      });
    } catch (error: any) {
      results.push({
        name: 'Translation Function',
        passed: false,
        message: `Error: ${error.message}`,
      });
    }

    // Test 2: Empty string handling
    try {
      const emptyTest = t('nonexistent.key.that.does.not.exist');
      const isValid = !!(emptyTest && emptyTest.trim());
      results.push({
        name: 'Empty String Handling',
        passed: isValid,
        message: isValid
          ? `Fallback returned: "${emptyTest}" ✓`
          : `Returned empty/invalid: "${emptyTest}"`,
      });
    } catch (error: any) {
      results.push({
        name: 'Empty String Handling',
        passed: false,
        message: `Error: ${error.message}`,
      });
    }

    // Test 3: Current language
    results.push({
      name: 'Current Language',
      passed: true,
      message: `Language: ${currentLanguage}`,
    });

    // Test 4: Error detector status
    const textNodeErrors = TextNodeErrorDetector.getErrorReport();
    const hasErrors = textNodeErrors !== 'No text node errors detected';
    results.push({
      name: 'Text Node Errors',
      passed: !hasErrors,
      message: hasErrors ? textNodeErrors : 'No errors detected ✓',
    });

    // Test 5: Runtime errors
    try {
      const runtimeErrors = RuntimeErrorDebugger.getTextNodeErrors();
      results.push({
        name: 'Runtime Errors',
        passed: runtimeErrors.length === 0,
        message: runtimeErrors.length === 0
          ? 'No runtime errors ✓'
          : `Found ${runtimeErrors.length} runtime errors`,
      });
    } catch {
      results.push({
        name: 'Runtime Errors',
        passed: true,
        message: 'Runtime debugger not available',
      });
    }

    // Test 6: Platform check
    results.push({
      name: 'Platform',
      passed: true,
      message: `Running on: ${Platform.OS}`,
    });

    setTestResults(results);
    setIsRunning(false);
  }, [t, currentLanguage]);

  const clearErrors = useCallback(() => {
    TextNodeErrorDetector.clearErrors();
    try {
      RuntimeErrorDebugger.clear();
    } catch {
      // Silently fail if not available
    }
    setTestResults([]);
  }, []);

  const printDetailedReport = useCallback(() => {
    console.log('\n═══════════════════════════════════════');
    console.log('📊 TEXT NODE DIAGNOSTIC REPORT');
    console.log('═══════════════════════════════════════\n');
    
    console.log('Test Results:');
    testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}: ${result.passed ? '✓' : '✗'}`);
      console.log(`   ${result.message}\n`);
    });

    console.log('\nText Node Error Detector Report:');
    console.log(TextNodeErrorDetector.getErrorReport());

    try {
      console.log('\nRuntime Error Summary:');
      RuntimeErrorDebugger.printSummary();
    } catch {
      console.log('Runtime debugger not available');
    }

    console.log('\n═══════════════════════════════════════\n');
  }, [testResults]);

  return (
    <>
      <Stack.Screen options={{ title: 'Text Node Diagnostic' }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom || spacing.xl }}>
        <View style={styles.content}>
          {/* Header */}
          <GlassCard variant="dark" style={styles.header}>
            <AlertCircle size={40} color={premiumColors.neonAmber} />
            <Text style={styles.headerTitle}>Text Node Error Diagnostic</Text>
            <Text style={styles.headerSubtitle}>
              Run diagnostics to check for text node rendering issues
            </Text>
          </GlassCard>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={runDiagnostics}
              disabled={isRunning}
            >
              <Text style={styles.buttonText}>
                {isRunning ? 'Running...' : 'Run Diagnostics'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={clearErrors}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Clear Errors
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={printDetailedReport}
              disabled={testResults.length === 0}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Print to Console
              </Text>
            </TouchableOpacity>
          </View>

          {/* Results */}
          {testResults.length > 0 && (
            <GlassCard variant="dark" style={styles.results}>
              <Text style={styles.resultsTitle}>Test Results</Text>
              {testResults.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    {result.passed ? (
                      <CheckCircle size={20} color={premiumColors.neonGreen} />
                    ) : (
                      <AlertCircle size={20} color={premiumColors.neonMagenta} />
                    )}
                    <Text style={[
                      styles.resultName,
                      result.passed ? styles.resultPassed : styles.resultFailed
                    ]}>
                      {result.name}
                    </Text>
                  </View>
                  <Text style={styles.resultMessage}>{result.message}</Text>
                </View>
              ))}
            </GlassCard>
          )}

          {/* Info */}
          <GlassCard variant="dark" style={styles.info}>
            <Info size={24} color={premiumColors.neonCyan} />
            <Text style={styles.infoTitle}>How to Use</Text>
            <Text style={styles.infoText}>
              1. Click &quot;Run Diagnostics&quot; to test for issues{'\n'}
              2. Check the results for any failures{'\n'}
              3. Open the console (if on web) or check logs{'\n'}
              4. Use &quot;Print to Console&quot; for detailed report{'\n'}
              5. If errors found, check the component stack{'\n\n'}
              All translation functions should return valid strings, never empty values or dots.
            </Text>
          </GlassCard>

          {/* Summary Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {testResults.filter(r => r.passed).length}
              </Text>
              <Text style={styles.statLabel}>Passed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statValueFail]}>
                {testResults.filter(r => !r.passed).length}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{testResults.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: '#FFFFFF',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: premiumColors.neonCyan,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: premiumColors.deepBlack,
  },
  secondaryButtonText: {
    color: premiumColors.glassWhiteStrong,
  },
  results: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  resultItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  resultName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  resultPassed: {
    color: premiumColors.neonGreen,
  },
  resultFailed: {
    color: premiumColors.neonMagenta,
  },
  resultMessage: {
    fontSize: typography.sizes.sm,
    color: premiumColors.glassWhiteStrong,
    marginLeft: spacing.lg + spacing.sm,
  },
  info: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonCyan,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: typography.weights.heavy,
    color: premiumColors.neonGreen,
    marginBottom: spacing.xs,
  },
  statValueFail: {
    color: premiumColors.neonMagenta,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: premiumColors.glassWhiteStrong,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
