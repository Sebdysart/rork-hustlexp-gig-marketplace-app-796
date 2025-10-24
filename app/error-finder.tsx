import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { premiumColors } from '@/constants/designTokens';

export default function ErrorFinderScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const originalError = console.error;
    const originalLog = console.log;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [`[ERROR] ${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 100));
      setErrorCount(prev => prev + 1);
      originalError(...args);
    };

    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('TEXT NODE') || message.includes('text node') || message.includes('Unexpected')) {
        setLogs(prev => [`[LOG] ${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 100));
      }
      originalLog(...args);
    };

    console.warn = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [`[WARN] ${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 100));
      originalWarn(...args);
    };

    return () => {
      console.error = originalError;
      console.log = originalLog;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Error Finder',
        headerStyle: { backgroundColor: premiumColors.deepBlack },
        headerTintColor: '#fff',
      }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Text Node Error Detective</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{errorCount} errors</Text>
        </View>
        <Text style={styles.subtitle}>
          This screen intercepts all console logs to find the text node error
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Navigate through your app{'\n'}
          2. When you see the error appear, come back here{'\n'}
          3. The error details will be logged below{'\n'}
          4. Look for component names, text content, and stack traces
        </Text>
      </View>

      <ScrollView style={styles.logsContainer}>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No logs yet. Navigate through the app to trigger the error.</Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <Text style={[
                styles.logText,
                log.includes('[ERROR]') && styles.errorText,
                log.includes('[WARN]') && styles.warnText,
              ]}>
                {log}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.clearButton}
        onPress={() => {
          setLogs([]);
          setErrorCount(0);
        }}
      >
        <Text style={styles.clearButtonText}>Clear Logs</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  instructions: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    margin: 10,
    borderRadius: 10,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  logsContainer: {
    flex: 1,
    padding: 10,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ecdc4',
  },
  logText: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  errorText: {
    borderLeftColor: '#ff6b6b',
    color: '#ff6b6b',
  },
  warnText: {
    borderLeftColor: '#ffa500',
    color: '#ffa500',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    padding: 16,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
