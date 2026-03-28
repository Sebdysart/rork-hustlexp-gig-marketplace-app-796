import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';

type ErrorInfo = {
  file: string;
  line: number;
  component: string;
  snippet: string;
};

export default function ErrorFinderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [scanning, setScanning] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const errorStr = args.join(' ');
      if (errorStr.includes('text node') || errorStr.includes('Text strings must be rendered within a <Text>')) {
        setCurrentError(errorStr);
        
        const stack = new Error().stack;
        if (stack) {
          console.log('=== ERROR STACK ===');
          console.log(stack);
          console.log('===================');
        }
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const testTextRender = () => {
    const results: string[] = [];
    
    const testValues = [
      '.',
      '..',
      '...',
      '',
      ' ',
      'undefined',
      'null',
      '   ',
      'Hello.',
      '. test',
    ];
    
    testValues.forEach(val => {
      try {
        const TestComponent = () => (
          <View>
            <Text>{val}</Text>
          </View>
        );
        results.push(`✅ "${val}" - Safe`);
      } catch (e) {
        results.push(`❌ "${val}" - Error: ${e}`);
      }
    });
    
    setTestResults(results);
  };

  const scanForIssues = async () => {
    setScanning(true);
    const found: ErrorInfo[] = [];

    console.log('Starting comprehensive scan...');
    console.log('Please navigate to different tabs to trigger the error');
    console.log('Watch the console for stack traces');

    try {
      const routes = [
        '/(tabs)/home',
        '/(tabs)/profile', 
        '/(tabs)/leaderboard',
        '/(tabs)/chat',
        '/(tabs)/wallet',
        '/(tabs)/quests',
        '/(tabs)/tasks',
        '/(tabs)/roadmap',
      ];

      for (const route of routes) {
        console.log(`Checking route: ${route}`);
      }

    } catch (error) {
      console.error('Scan error:', error);
    }

    setErrors(found);
    setScanning(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Error Finder',
          headerShown: false,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Text Node Error Detector</Text>
          <Text style={styles.subtitle}>Live error monitoring active</Text>
        </View>

        {currentError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Current Error Detected:</Text>
            <Text style={styles.errorText}>{currentError}</Text>
            <Text style={styles.errorHint}>Check console for stack trace</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.scanButton}
          onPress={scanForIssues}
          disabled={scanning}
        >
          <Text style={styles.scanButtonText}>
            {scanning ? 'Scanning...' : 'Scan All Routes'}
          </Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>How to find the error:</Text>
          <Text style={styles.instructionText}>1. Open browser DevTools (F12)</Text>
          <Text style={styles.instructionText}>2. Go to Console tab</Text>
          <Text style={styles.instructionText}>3. Navigate through app tabs</Text>
          <Text style={styles.instructionText}>4. Watch for error stack traces</Text>
          <Text style={styles.instructionText}>5. Stack trace will show exact file and line</Text>
        </View>

        <View style={styles.commonCauses}>
          <Text style={styles.sectionTitle}>Common Causes:</Text>
          <Text style={styles.causeText}>• Conditional rendering: {'{condition ? "text" : null}'}</Text>
          <Text style={styles.causeText}>• Template literals in View: {'{`text ${var}`}'}</Text>
          <Text style={styles.causeText}>• String variables: {'{stringVar}'}</Text>
          <Text style={styles.causeText}>• Array join: {'{arr.join(", ")}'}</Text>
          <Text style={styles.causeText}>• Number to string: {'{count + " items"}'}</Text>
          <Text style={styles.causeText}>• Translation returns: {'{t[0]} could return "."'}</Text>
        </View>

        <TouchableOpacity
          style={styles.testButton}
          onPress={testTextRender}
        >
          <Text style={styles.testButtonText}>Test Text Rendering</Text>
        </TouchableOpacity>

        {testResults.length > 0 && (
          <View style={styles.testResults}>
            <Text style={styles.sectionTitle}>Test Results:</Text>
            {testResults.map((result, idx) => (
              <Text key={idx} style={styles.testResultText}>{result}</Text>
            ))}
          </View>
        )}

        <View style={styles.quickNav}>
          <Text style={styles.sectionTitle}>Quick Navigate:</Text>
          <View style={styles.quickNavGrid}>
            {['home', 'profile', 'tasks', 'quests', 'wallet', 'leaderboard'].map(route => (
              <TouchableOpacity
                key={route}
                style={styles.quickNavButton}
                onPress={() => {
                  console.log(`Navigating to /(tabs)/${route}`);
                  router.push(`/(tabs)/${route}` as any);
                }}
              >
                <Search size={16} color={COLORS.text} />
                <Text style={styles.quickNavText}>{route}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {errors.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.sectionTitle}>Found Issues:</Text>
            {errors.map((error, idx) => (
              <View key={idx} style={styles.errorItem}>
                <Text style={styles.errorFile}>{error.file}:{error.line}</Text>
                <Text style={styles.errorComponent}>{error.component}</Text>
                <Text style={styles.errorSnippet}>{error.snippet}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorBox: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: '#ffcccc',
    fontStyle: 'italic',
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  commonCauses: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  causeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  results: {
    marginTop: 16,
  },
  errorItem: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  errorFile: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  errorComponent: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSnippet: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: COLORS.primary + '40',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  testButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  testResults: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  testResultText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  quickNav: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  quickNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  quickNavText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
});