import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { premiumColors } from '@/constants/designTokens';
import { Layers, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react-native';

interface ErrorLocation {
  component: string;
  error: string;
  stackTrace?: string;
  timestamp: string;
}

export default function TextErrorScanner() {
  const [errors, setErrors] = useState<ErrorLocation[]>([]);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const scanForErrors = async () => {
    setScanning(true);
    setErrors([]);

    try {
      const detectedErrors: ErrorLocation[] = [];
      
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;

      console.error = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('Unexpected text node') || 
            message.includes('text node cannot be a child') ||
            message.includes('Text strings must be rendered')) {
          
          const stack = new Error().stack;
          const stackLines = stack?.split('\n') || [];
          const relevantStack = stackLines
            .filter(line => 
              line.includes('app/') || 
              line.includes('components/') ||
              line.includes('contexts/')
            )
            .slice(0, 5)
            .join('\n');

          detectedErrors.push({
            component: extractComponentName(stack || ''),
            error: message,
            stackTrace: relevantStack,
            timestamp: new Date().toISOString(),
          });
        }
        originalConsoleError(...args);
      };

      console.warn = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('Unexpected text node') || 
            message.includes('text node cannot be a child')) {
          
          const stack = new Error().stack;
          const stackLines = stack?.split('\n') || [];
          const relevantStack = stackLines
            .filter(line => 
              line.includes('app/') || 
              line.includes('components/') ||
              line.includes('contexts/')
            )
            .slice(0, 5)
            .join('\n');

          detectedErrors.push({
            component: extractComponentName(stack || ''),
            error: message,
            stackTrace: relevantStack,
            timestamp: new Date().toISOString(),
          });
        }
        originalConsoleWarn(...args);
      };

      await new Promise(resolve => setTimeout(resolve, 2000));

      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;

      setErrors(detectedErrors);
      setLastScan(new Date());
    } catch (error) {
      console.error('Scanner error:', error);
    } finally {
      setScanning(false);
    }
  };

  const extractComponentName = (stack: string): string => {
    const match = stack.match(/at (\w+)/);
    if (match) return match[1];
    
    const pathMatch = stack.match(/\/(app|components|contexts)\/([^:)]+)/);
    if (pathMatch) return pathMatch[2];
    
    return 'Unknown Component';
  };

  useEffect(() => {
    scanForErrors();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Text Error Scanner',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: premiumColors.softWhite,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Layers size={32} color={premiumColors.neonCyan} />
          </View>
          <Text style={styles.title}>Error Scanner</Text>
          <Text style={styles.subtitle}>
            Detecting text node errors in your app
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
          onPress={scanForErrors}
          disabled={scanning}
        >
          <RefreshCw 
            size={20} 
            color={premiumColors.deepBlack} 
            style={scanning ? styles.spinning : undefined}
          />
          <Text style={styles.scanButtonText}>
            {scanning ? 'Scanning...' : 'Run Scan'}
          </Text>
        </TouchableOpacity>

        {lastScan && (
          <Text style={styles.lastScan}>
            Last scan: {lastScan.toLocaleTimeString()}
          </Text>
        )}

        <View style={styles.resultsContainer}>
          {errors.length === 0 && !scanning && lastScan && (
            <View style={styles.noErrorsCard}>
              <CheckCircle size={48} color={premiumColors.neonGreen} />
              <Text style={styles.noErrorsText}>No errors detected!</Text>
              <Text style={styles.noErrorsSubtext}>
                Your app is running clean
              </Text>
            </View>
          )}

          {errors.length === 0 && !scanning && !lastScan && (
            <View style={styles.noErrorsCard}>
              <AlertCircle size={48} color={premiumColors.neonBlue} />
              <Text style={styles.noErrorsText}>Ready to scan</Text>
              <Text style={styles.noErrorsSubtext}>
                Tap the button above to start scanning
              </Text>
            </View>
          )}

          {errors.map((error, index) => (
            <View key={index} style={styles.errorCard}>
              <View style={styles.errorHeader}>
                <AlertCircle size={24} color={premiumColors.neonMagenta} />
                <Text style={styles.errorComponent}>{error.component}</Text>
              </View>
              
              <Text style={styles.errorMessage}>{error.error}</Text>
              
              {error.stackTrace && (
                <View style={styles.stackTraceContainer}>
                  <Text style={styles.stackTraceLabel}>Stack Trace:</Text>
                  <Text style={styles.stackTrace}>{error.stackTrace}</Text>
                </View>
              )}

              <Text style={styles.errorTime}>
                {new Date(error.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Common Causes:</Text>
          <Text style={styles.infoText}>
            • String/number directly in View without Text wrapper{'\n'}
            • Conditional that returns string instead of JSX{'\n'}
            • Array.map returning raw text{'\n'}
            • Template literals with spaces/newlines{'\n'}
            • Boolean/null/undefined in render
          </Text>
        </View>

        <View style={styles.tipSection}>
          <Text style={styles.tipTitle}>How to Fix:</Text>
          <Text style={styles.tipText}>
            1. Check the component name above{'\n'}
            2. Look for text outside Text components{'\n'}
            3. Wrap all strings in Text tags{'\n'}
            4. Use Text for empty strings: Text{'\n'}
            5. Check conditional renders
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
    backgroundColor: `${premiumColors.neonCyan}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: premiumColors.softWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: premiumColors.neonCyan,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: premiumColors.deepBlack,
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  lastScan: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultsContainer: {
    marginBottom: 24,
  },
  noErrorsCard: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${premiumColors.neonGreen}40`,
  },
  noErrorsText: {
    fontSize: 20,
    fontWeight: '600',
    color: premiumColors.softWhite,
    marginTop: 16,
    marginBottom: 8,
  },
  noErrorsSubtext: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${premiumColors.neonMagenta}40`,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  errorComponent: {
    fontSize: 18,
    fontWeight: '600',
    color: premiumColors.neonMagenta,
    flex: 1,
  },
  errorMessage: {
    fontSize: 14,
    color: premiumColors.softWhite,
    marginBottom: 12,
    lineHeight: 20,
  },
  stackTraceContainer: {
    backgroundColor: premiumColors.deepBlack,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  stackTraceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: premiumColors.neonBlue,
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 11,
    color: '#A0A0A0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  errorTime: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'right',
  },
  infoSection: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${premiumColors.neonBlue}40`,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: premiumColors.neonBlue,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 22,
  },
  tipSection: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${premiumColors.neonGreen}40`,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: premiumColors.neonGreen,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 22,
  },
});
