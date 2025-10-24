import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { premiumColors } from '@/constants/designTokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ErrorLog = {
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
};

export default function TextNodeScannerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      if (
        message.includes('text node') || 
        message.includes('Text strings must be rendered') ||
        message.includes('child of a <View>')
      ) {
        const error = new Error();
        setErrorLogs(prev => [{
          timestamp: new Date().toLocaleTimeString(),
          message,
          stack: error.stack,
        }, ...prev].slice(0, 50));
      }

      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      if (
        message.includes('TextNodeFixer') ||
        message.includes('Auto-fixing')
      ) {
        setErrorLogs(prev => [{
          timestamp: new Date().toLocaleTimeString(),
          message: '🔧 ' + message,
        }, ...prev].slice(0, 50));
      }

      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [isMonitoring]);

  const clearLogs = () => {
    setErrorLogs([]);
  };

  const testRoutes = [
    { name: 'Home', path: '/(tabs)/home' },
    { name: 'Profile', path: '/(tabs)/profile' },
    { name: 'Tasks', path: '/(tabs)/tasks' },
    { name: 'Quests', path: '/(tabs)/quests' },
    { name: 'Wallet', path: '/(tabs)/wallet' },
    { name: 'Leaderboard', path: '/(tabs)/leaderboard' },
    { name: 'Chat', path: '/(tabs)/chat' },
    { name: 'Roadmap', path: '/(tabs)/roadmap' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Text Node Scanner</Text>
        <Text style={styles.subtitle}>
          {isMonitoring ? '🟢 Monitoring Active' : '⚫ Monitoring Paused'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => setIsMonitoring(!isMonitoring)}
        >
          <Text style={styles.buttonText}>
            {isMonitoring ? 'Pause' : 'Resume'} Monitoring
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={clearLogs}
        >
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.routeTest}>
        <Text style={styles.sectionTitle}>Test Routes</Text>
        <Text style={styles.sectionSubtitle}>
          Navigate to different screens to detect text node errors
        </Text>
        <View style={styles.routeGrid}>
          {testRoutes.map(route => (
            <TouchableOpacity
              key={route.path}
              style={styles.routeButton}
              onPress={() => {
                console.log(`[Scanner] Navigating to ${route.path}`);
                router.push(route.path as any);
              }}
            >
              <Text style={styles.routeButtonText}>{route.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.logsSection}>
        <Text style={styles.sectionTitle}>
          Error Logs ({errorLogs.length})
        </Text>
        
        {errorLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {isMonitoring 
                ? '✅ No errors detected!\n\nNavigate through the app to test for text node errors.'
                : '⏸️ Monitoring paused'}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.logsList}>
            {errorLogs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                </View>
                <Text style={styles.logMessage}>{log.message}</Text>
                {log.stack && (
                  <ScrollView horizontal style={styles.stackScroll}>
                    <Text style={styles.logStack}>{log.stack}</Text>
                  </ScrollView>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>📋 How to Use:</Text>
        <Text style={styles.instructionText}>
          1. Keep this screen open{'\n'}
          2. Tap a route button above{'\n'}
          3. Check logs for auto-fixed issues{'\n'}
          4. Errors show which component and text{'\n'}
          5. If you see errors, they are being auto-fixed
        </Text>
      </View>
    </View>
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
    borderBottomColor: premiumColors.glassWhite,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: premiumColors.neonCyan,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  routeTest: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 12,
  },
  routeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  routeButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  logsSection: {
    flex: 1,
    padding: 16,
  },
  logsList: {
    flex: 1,
    marginTop: 8,
  },
  logItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: premiumColors.neonMagenta,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logTimestamp: {
    fontSize: 11,
    color: '#999999',
    fontFamily: 'monospace' as const,
  },
  logMessage: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 18,
  },
  stackScroll: {
    maxHeight: 100,
  },
  logStack: {
    fontSize: 10,
    color: premiumColors.neonAmber,
    fontFamily: 'monospace' as const,
    lineHeight: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
  },
  instructions: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 18,
  },
});
