import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { premiumColors } from '@/constants/designTokens';
import { AlertTriangle } from 'lucide-react-native';

export default function FindTextError() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Find Text Error' }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <AlertTriangle size={48} color={premiumColors.neonAmber} />
          <Text style={styles.title}>Debugging Text Node Error</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 1: Open Browser Console</Text>
            <Text style={styles.text}>
              Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
            </Text>
            <Text style={styles.text}>
              Go to the Console tab
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 2: Look for the Error</Text>
            <Text style={styles.text}>
              Find the red error message that says:{'\n'}
              &quot;Unexpected text node&quot;
            </Text>
            <Text style={styles.text}>
              The error will show a component stack that looks like:{'\n'}
              in View{'\n'}
              in SomeComponent{'\n'}
              in AnotherComponent
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 3: Navigate to Test Routes</Text>
            <Text style={styles.text}>
              Click the buttons below to test different screens.{'\n'}
              Watch the console to see which screen triggers the error.
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.buttonText}>Test Home Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.buttonText}>Test Profile Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/(tabs)/tasks')}
            >
              <Text style={styles.buttonText}>Test Tasks Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/(tabs)/quests')}
            >
              <Text style={styles.buttonText}>Test Quests Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/sign-in')}
            >
              <Text style={styles.buttonText}>Test Sign In Screen</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Causes:</Text>
            <Text style={styles.code}>
              1. {`<View>{someVariable}</View>`}{'\n'}
              Should be: {`<View><Text>{someVariable}</Text></View>`}
            </Text>
            <Text style={styles.code}>
              2. {`<View>{condition && "text"}</View>`}{'\n'}
              Should be: {`<View>{condition && <Text>text</Text>}</View>`}
            </Text>
            <Text style={styles.code}>
              3. Space between tags:{'\n'}
              {`<View> </View>`}{'\n'}
              Should be: {`<View />`} or {`<View></View>`}
            </Text>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Pro Tip</Text>
            <Text style={styles.tipText}>
              If the error appears immediately when loading the app, it is likely in:{'\n'}
              • app/_layout.tsx{'\n'}
              • app/index.tsx{'\n'}
              • One of the Context providers{'\n'}
              • A component rendered in the root layout
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
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
    marginTop: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  section: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  code: {
    fontSize: 12,
    color: premiumColors.neonGreen,
    fontFamily: 'monospace' as const,
    lineHeight: 18,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    backgroundColor: premiumColors.neonCyan,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.deepBlack,
  },
  tipBox: {
    padding: 20,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
    gap: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});
