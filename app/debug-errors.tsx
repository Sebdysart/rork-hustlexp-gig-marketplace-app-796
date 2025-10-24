import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react-native';
import RuntimeErrorDebugger from '@/utils/errorDebugger';
import { useState } from 'react';

export default function DebugErrorsScreen() {
  const insets = useSafeAreaInsets();
  const [, setRefreshKey] = useState(0);

  const errors = RuntimeErrorDebugger.getErrors();
  const textNodeErrors = RuntimeErrorDebugger.getTextNodeErrors();

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClear = () => {
    RuntimeErrorDebugger.clear();
    setRefreshKey(prev => prev + 1);
  };

  const handlePrint = () => {
    RuntimeErrorDebugger.printSummary();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Error Debugger',
        headerStyle: { backgroundColor: premiumColors.deepBlack },
        headerTintColor: Colors.text,
      }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View style={styles.header}>
          <View style={styles.statCard}>
            <AlertCircle size={24} color={premiumColors.neonCyan} />
            <Text style={styles.statLabel}>Total Errors</Text>
            <Text style={styles.statValue}>{errors.length}</Text>
          </View>
          
          <View style={[styles.statCard, textNodeErrors.length > 0 && styles.errorCard]}>
            {textNodeErrors.length > 0 ? (
              <AlertCircle size={24} color="#FF3B30" />
            ) : (
              <CheckCircle size={24} color={premiumColors.neonGreen} />
            )}
            <Text style={styles.statLabel}>Text Node Errors</Text>
            <Text style={[
              styles.statValue,
              textNodeErrors.length > 0 && styles.errorValue
            ]}>
              {textNodeErrors.length}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={handleRefresh}>
            <RefreshCw size={18} color={Colors.text} />
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handlePrint}>
            <Text style={styles.buttonText}>Print Summary</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
            <Text style={[styles.buttonText, styles.clearButtonText]}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {textNodeErrors.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔴 Text Node Errors Found!</Text>
            {textNodeErrors.map((error, index) => (
              <View key={index} style={styles.errorCard}>
                <Text style={styles.errorTitle}>Error #{index + 1}</Text>
                <Text style={styles.errorMessage}>{error.message}</Text>
                {error.stack && (
                  <>
                    <Text style={styles.errorStackTitle}>Stack Trace:</Text>
                    <ScrollView horizontal style={styles.stackScroll}>
                      <Text style={styles.errorStack}>{error.stack}</Text>
                    </ScrollView>
                  </>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noErrors}>
            <CheckCircle size={48} color={premiumColors.neonGreen} />
            <Text style={styles.noErrorsText}>No text node errors detected</Text>
            <Text style={styles.noErrorsSubtext}>
              The error debugger is active and monitoring. If the error occurs, it will be captured here.
            </Text>
          </View>
        )}

        {errors.length > textNodeErrors.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Errors</Text>
            {errors
              .filter(e => !e.message.includes('Unexpected text node'))
              .map((error, index) => (
                <View key={index} style={styles.errorCardOther}>
                  <Text style={styles.errorMessage}>{error.message}</Text>
                </View>
              ))}
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to use this debugger:</Text>
          <Text style={styles.instructionsText}>
            1. Navigate through the app normally{'\n'}
            2. When the error occurs, come back here{'\n'}
            3. Check the &quot;Text Node Errors&quot; section for details{'\n'}
            4. The stack trace will show you which component/file is causing the issue{'\n'}
            5. Press &quot;Print Summary&quot; to see detailed console logs
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorCard: {
    borderColor: '#FF3B3080',
  },
  statLabel: {
    fontSize: 12,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: premiumColors.neonCyan,
  },
  errorValue: {
    color: '#FF3B30',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    gap: spacing.xs,
  },
  clearButton: {
    borderColor: '#FF3B3080',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  clearButtonText: {
    color: '#FF3B30',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FF3B30',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'monospace',
    marginBottom: spacing.sm,
  },
  errorStackTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  stackScroll: {
    maxHeight: 200,
  },
  errorStack: {
    fontSize: 11,
    color: premiumColors.glassWhiteStrong,
    fontFamily: 'monospace',
  },
  errorCardOther: {
    padding: spacing.md,
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    marginBottom: spacing.sm,
  },
  noErrors: {
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.neonGreen + '40',
    marginBottom: spacing.xl,
  },
  noErrorsText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  noErrorsSubtext: {
    fontSize: 14,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructions: {
    padding: spacing.lg,
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.md,
  },
  instructionsText: {
    fontSize: 14,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 22,
  },
});
