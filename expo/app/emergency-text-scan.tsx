import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { premiumColors } from '@/constants/designTokens';
import { Stack } from 'expo-router';

export default function EmergencyTextScan() {
  const [scanResults, setScanResults] = useState<string[]>([]);

  useEffect(() => {
    const results: string[] = [];
    
    results.push('🔍 Scanning for common text node error patterns...\n');
    
    results.push('Common patterns that cause this error:');
    results.push('1. {variable} directly in <View>');
    results.push('2. {condition && "text"}');
    results.push('3. Spaces or newlines between tags');
    results.push('4. String literals without <Text>');
    results.push('5. Translation calls t() without <Text>\n');
    
    results.push('✅ Check these locations in your app:');
    results.push('- Home screen');
    results.push('- Tab layouts');
    results.push('- Modal screens');
    results.push('- Any screen you recently modified\n');
    
    results.push('Common culprits:');
    results.push('- <View>{user.name}</View>');
    results.push('- <View>{isLoading && "Loading..."}</View>');
    results.push('- <View> </View> (space between tags)');
    results.push('- <View>\\n</View> (newline between tags)');
    results.push('- <Stack.Screen options={{title: someVar}} /> where title renders in View\n');
    
    results.push('🔧 Quick Fix Template:');
    results.push('❌ <View>{someText}</View>');
    results.push('✅ <View><Text>{someText}</Text></View>');
    
    setScanResults(results);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Emergency Text Scan' }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🚨</Text>
          <Text style={styles.title}>Text Node Emergency Scan</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {scanResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          ))}

          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>Next Steps:</Text>
            <Text style={styles.actionText}>
              1. Look at your browser console for the full error stack{'\n'}
              2. The error will show which component is causing it{'\n'}
              3. Search that file for any of the patterns above{'\n'}
              4. Wrap ALL text content in {'<Text>'} components{'\n'}
              5. Check for extra spaces or newlines in JSX
            </Text>
          </View>

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 Pro Tip:</Text>
            <Text style={styles.tipText}>
              Open your browser's Developer Tools (F12){'\n'}
              Check the Console tab{'\n'}
              Look for red error messages{'\n'}
              The error will show the exact file and line number
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  resultItem: {
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'monospace' as const,
    lineHeight: 20,
  },
  actionSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  tipSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
