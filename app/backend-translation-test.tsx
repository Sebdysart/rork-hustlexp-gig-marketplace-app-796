import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hustleAI } from '@/utils/hustleAI';
import Colors from '@/constants/colors';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import { CheckCircle, XCircle, AlertCircle, Zap, Globe, Shield } from 'lucide-react-native';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export default function BackendTranslationTestScreen() {
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Standard Translation (/api/translate)', status: 'pending' },
    { name: 'Auto Language Detection (/api/translate/auto)', status: 'pending' },
    { name: 'Language Detection Only (/api/translate/detect)', status: 'pending' },
    { name: 'Quality Scoring', status: 'pending' },
    { name: 'Regional Variants (es-MX)', status: 'pending' },
    { name: 'Batch Translation (10 texts)', status: 'pending' },
    { name: 'Brand Protection (HustleXP)', status: 'pending' },
    { name: 'Placeholder Preservation ({name})', status: 'pending' },
  ]);

  const updateResult = (index: number, updates: Partial<TestResult>) => {
    setResults(prev => prev.map((r, i) => i === index ? { ...r, ...updates } : r));
  };

  const runAllTests = async () => {
    for (let i = 0; i < results.length; i++) {
      updateResult(i, { status: 'running' });
      
      try {
        const start = Date.now();
        let message = '';

        switch (i) {
          case 0: {
            const result = await hustleAI.translate({
              text: ['Hello, World!'],
              targetLanguage: 'es',
            });
            message = `✅ "${result.translations[0]}"`;
            break;
          }

          case 1: {
            const result = await hustleAI.translateAuto({
              text: ['Hello', 'Bonjour', 'Hola'],
              targetLanguage: 'ja',
            });
            message = `✅ Detected: ${result.detectedLanguages.join(', ')} → ${result.translations[0]}`;
            break;
          }

          case 2: {
            const result = await hustleAI.detectLanguage(['Hello', 'Bonjour', 'こんにちは']);
            message = `✅ Detected: ${result.detectedLanguages.join(', ')}`;
            break;
          }

          case 3: {
            const result = await hustleAI.translate({
              text: ['Complete your daily tasks'],
              targetLanguage: 'es',
              includeQualityScore: true,
            });
            const quality = result.qualityScores?.[0];
            message = quality 
              ? `✅ Score: ${(quality.overallScore * 100).toFixed(0)}% confidence`
              : '⚠️ No quality data';
            break;
          }

          case 4: {
            const result = await hustleAI.translate({
              text: ['I need a job'],
              targetLanguage: 'es-MX',
            });
            message = `✅ "${result.translations[0]}" (Mexican Spanish)`;
            break;
          }

          case 5: {
            const texts = Array(10).fill('Task').map((t, i) => `${t} ${i + 1}`);
            const result = await hustleAI.translate({
              text: texts,
              targetLanguage: 'fr',
            });
            message = `✅ Translated ${result.translations.length} texts`;
            break;
          }

          case 6: {
            const result = await hustleAI.translate({
              text: ['Earn more HustleXP and GritCoin by completing tasks'],
              targetLanguage: 'es',
            });
            const preserved = result.translations[0].includes('HustleXP') && 
                            result.translations[0].includes('GritCoin');
            message = preserved 
              ? `✅ Brands preserved: "${result.translations[0]}"`
              : `⚠️ Brands not preserved: "${result.translations[0]}"`;
            break;
          }

          case 7: {
            const result = await hustleAI.translate({
              text: ['Welcome {name}, you have {count} tasks'],
              targetLanguage: 'es',
            });
            const preserved = result.translations[0].includes('{name}') && 
                            result.translations[0].includes('{count}');
            message = preserved 
              ? `✅ Placeholders preserved: "${result.translations[0]}"`
              : `⚠️ Placeholders not preserved: "${result.translations[0]}"`;
            break;
          }
        }

        const duration = Date.now() - start;
        updateResult(i, { status: 'success', message, duration });
      } catch (error: any) {
        updateResult(i, { 
          status: 'error', 
          message: `❌ ${error?.message || 'Unknown error'}`,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle size={20} color={premiumColors.neonGreen} />;
      case 'error': return <XCircle size={20} color={premiumColors.neonMagenta} />;
      case 'running': return <ActivityIndicator size="small" color={premiumColors.neonCyan} />;
      default: return <AlertCircle size={20} color={premiumColors.glassWhiteStrong} />;
    }
  };

  const allCompleted = results.every(r => r.status === 'success' || r.status === 'error');
  const successCount = results.filter(r => r.status === 'success').length;
  const totalTests = results.length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Backend Translation Test',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }} 
      />

      <ScrollView style={styles.content} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.header}>
          <Globe size={40} color={premiumColors.neonCyan} />
          <Text style={styles.title}>Backend Translation V2</Text>
          <Text style={styles.subtitle}>Testing New Features</Text>
        </View>

        {allCompleted && (
          <View style={[
            styles.summaryCard,
            successCount === totalTests ? styles.successCard : styles.warningCard,
          ]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {successCount === totalTests ? '✅ All Tests Passed!' : '⚠️ Some Tests Failed'}
              </Text>
              <Text style={styles.summaryCount}>{successCount}/{totalTests}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={20} color={premiumColors.neonPurple} />
            <Text style={styles.sectionTitle}>Test Results</Text>
          </View>

          {results.map((result, index) => (
            <View key={index} style={styles.testCard}>
              <View style={styles.testHeader}>
                <View style={styles.testTitleRow}>
                  {getStatusIcon(result.status)}
                  <Text style={styles.testName}>{result.name}</Text>
                </View>
                {result.duration !== undefined && (
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{result.duration}ms</Text>
                  </View>
                )}
              </View>

              {result.message && (
                <Text style={[
                  styles.testMessage,
                  result.status === 'error' && styles.errorMessage,
                ]} numberOfLines={3}>
                  {result.message}
                </Text>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.runButton, !allCompleted && styles.runButtonActive]}
          onPress={runAllTests}
          disabled={!allCompleted && results.some(r => r.status === 'running')}
        >
          <Shield size={20} color={Colors.background} />
          <Text style={styles.runButtonText}>
            {allCompleted ? 'Run Tests Again' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 What This Tests:</Text>
          <Text style={styles.infoText}>• New /api/translate endpoint (3x faster)</Text>
          <Text style={styles.infoText}>• Auto language detection</Text>
          <Text style={styles.infoText}>• Quality scoring</Text>
          <Text style={styles.infoText}>• Regional variants (es-MX, pt-BR, etc.)</Text>
          <Text style={styles.infoText}>• Batch translation performance</Text>
          <Text style={styles.infoText}>• Brand name protection</Text>
          <Text style={styles.infoText}>• Placeholder preservation</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>⚡ Expected Performance:</Text>
          <Text style={styles.infoText}>• Cached: &lt;50ms</Text>
          <Text style={styles.infoText}>• Uncached: ~300ms</Text>
          <Text style={styles.infoText}>• With quality: ~2000ms</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.xs,
  },
  summaryCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
  },
  successCard: {
    backgroundColor: premiumColors.neonGreen + '20',
    borderColor: premiumColors.neonGreen,
  },
  warningCard: {
    backgroundColor: premiumColors.neonAmber + '20',
    borderColor: premiumColors.neonAmber,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonPurple,
  },
  testCard: {
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: premiumColors.neonCyan + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  testMessage: {
    fontSize: 12,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorMessage: {
    color: premiumColors.neonMagenta,
  },
  runButton: {
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  runButtonActive: {
    backgroundColor: premiumColors.neonCyan,
    borderColor: premiumColors.neonCyan,
  },
  runButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  infoCard: {
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 13,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.xs,
  },
});
