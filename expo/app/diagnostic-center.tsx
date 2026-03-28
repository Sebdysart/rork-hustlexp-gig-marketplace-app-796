import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { premiumColors } from '@/constants/designTokens';
import { Search, AlertTriangle, CheckCircle, FileSearch, Bug } from 'lucide-react-native';
import { getTextErrorLog, clearTextErrorLog } from '@/utils/textErrorInterceptor';

export default function DiagnosticCenter() {
  const router = useRouter();
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const errors = getTextErrorLog();
      setErrorCount(errors.length);
      if (errors.length > 0) {
        const latest = errors[errors.length - 1];
        setLastError(`${latest.fileName || 'Unknown'} - Line ${latest.lineNumber || '?'}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClearErrors = () => {
    clearTextErrorLog();
    setErrorCount(0);
    setLastError(null);
    Alert.alert('Success', 'Error log cleared');
  };

  const handleViewScanner = () => {
    router.push('/text-error-scanner');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Diagnostic Center',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: '#FFFFFF',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Bug size={40} color={premiumColors.neonMagenta} />
          </View>
          <Text style={styles.title}>Diagnostic Center</Text>
          <Text style={styles.subtitle}>
            Real-time error detection and analysis
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {errorCount === 0 ? (
              <CheckCircle size={32} color={premiumColors.neonGreen} />
            ) : (
              <AlertTriangle size={32} color={premiumColors.neonMagenta} />
            )}
            <Text style={styles.statusTitle}>
              {errorCount === 0 ? 'All Clear' : `${errorCount} Error(s) Detected`}
            </Text>
          </View>

          {lastError && (
            <View style={styles.errorInfo}>
              <Text style={styles.errorLabel}>Last Error Location:</Text>
              <Text style={styles.errorText}>{lastError}</Text>
            </View>
          )}

          <View style={styles.statusDescription}>
            <Text style={styles.descriptionText}>
              {errorCount === 0 
                ? 'Your app is running smoothly. The interceptor is monitoring for any text node errors.'
                : 'Text node errors have been detected. Check the console for detailed information including file names and line numbers.'
              }
            </Text>
          </View>
        </View>

        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>Diagnostic Tools</Text>

          <TouchableOpacity 
            style={styles.toolCard}
            onPress={handleViewScanner}
          >
            <View style={styles.toolIcon}>
              <Search size={24} color={premiumColors.neonCyan} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={styles.toolTitle}>Error Scanner</Text>
              <Text style={styles.toolDescription}>
                Scan for text node errors in real-time
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolCard}
            onPress={handleClearErrors}
          >
            <View style={styles.toolIcon}>
              <FileSearch size={24} color={premiumColors.neonBlue} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={styles.toolTitle}>Clear Error Log</Text>
              <Text style={styles.toolDescription}>
                Reset the error counter and log
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>What to Check:</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              1. Open your browser console (F12) to see detailed error logs
            </Text>
            <Text style={styles.instructionItem}>
              2. Look for the red box with file name and line number
            </Text>
            <Text style={styles.instructionItem}>
              3. The error will show exactly which file has the issue
            </Text>
            <Text style={styles.instructionItem}>
              4. Look for text outside Text components in that file
            </Text>
          </View>
        </View>

        <View style={styles.commonIssuesSection}>
          <Text style={styles.commonIssuesTitle}>Common Issues:</Text>
          <View style={styles.issueCard}>
            <Text style={styles.issueExample}>❌ Bad:</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>View{'\n'}  Hello World{'\n'}/View</Text>
            </View>
          </View>
          <View style={styles.issueCard}>
            <Text style={styles.issueExample}>✅ Good:</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>View{'\n'}  TextHello World/Text{'\n'}/View</Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Pro Tips:</Text>
          <Text style={styles.tipText}>
            • The error happens when raw text appears directly in a View{'\n'}
            • All text must be wrapped in Text component{'\n'}
            • Check conditional renders: {'{'}condition && text{'}'}  should be {'{'}condition && TextText/Text{'}'}{'\n'}
            • Empty strings also need wrapping: Text/Text or {'{'}null{'}'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${premiumColors.neonMagenta}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: premiumColors.softWhite,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: premiumColors.neonMagenta,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  errorInfo: {
    backgroundColor: premiumColors.deepBlack,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: premiumColors.neonMagenta,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  statusDescription: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: `rgba(255, 255, 255, 0.2)`,
  },
  descriptionText: {
    fontSize: 14,
    color: premiumColors.softWhite,
    lineHeight: 20,
  },
  toolsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  toolCard: {
    flexDirection: 'row',
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `rgba(255, 255, 255, 0.2)`,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${premiumColors.neonCyan}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: premiumColors.softWhite,
  },
  instructionsSection: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${premiumColors.neonBlue}40`,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: premiumColors.neonBlue,
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: premiumColors.softWhite,
    lineHeight: 20,
  },
  commonIssuesSection: {
    marginBottom: 16,
  },
  commonIssuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  issueCard: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  issueExample: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: premiumColors.deepBlack,
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontSize: 12,
    color: premiumColors.neonCyan,
    fontFamily: 'monospace',
  },
  tipsSection: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${premiumColors.neonGreen}40`,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: premiumColors.neonGreen,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: premiumColors.softWhite,
    lineHeight: 22,
  },
});
