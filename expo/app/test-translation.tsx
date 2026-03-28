import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import T from '@/components/T';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';

export default function TestTranslationScreen() {
  const { currentLanguage, changeLanguage, availableLanguages, isLoading, translationProgress, aiTranslationCache } = useLanguage();

  const testPhrases = [
    'Welcome to HustleXP',
    'Your Journey to Legendary Status Starts Here',
    'Level Up Your Hustle',
    'Your Name',
    'Email Address',
    'Create Password',
    'Complete Tasks',
    'Post Tasks',
    'Let\'s Hustle',
    'Start Hustling!',
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Translation Test', headerShown: true }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Language: {currentLanguage}</Text>
          <Text style={styles.info}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
          <Text style={styles.info}>Progress: {translationProgress}%</Text>
          <Text style={styles.info}>Cached: {Object.keys(aiTranslationCache).length} translations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Language</Text>
          <View style={styles.languageGrid}>
            {availableLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  currentLanguage === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  currentLanguage === lang.code && styles.languageNameActive,
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Translated Phrases (using &lt;T&gt;)</Text>
          {testPhrases.map((phrase, index) => (
            <View key={index} style={styles.phraseRow}>
              <Text style={styles.phraseOriginal}>EN: {phrase}</Text>
              <T style={styles.phraseTranslated} key={`trans-${index}`}>{phrase}</T>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache Contents ({currentLanguage})</Text>
          <Text style={styles.cacheText} numberOfLines={20}>
            {JSON.stringify(aiTranslationCache, null, 2)}
          </Text>
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
  contentContainer: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.md,
  },
  info: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    gap: spacing.sm,
  },
  languageButtonActive: {
    borderColor: premiumColors.neonCyan,
    backgroundColor: premiumColors.neonCyan + '20',
  },
  languageFlag: {
    fontSize: 20,
  },
  languageName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  languageNameActive: {
    color: premiumColors.neonCyan,
    fontWeight: '700' as const,
  },
  phraseRow: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.lg,
  },
  phraseOriginal: {
    fontSize: 12,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.xs,
    fontStyle: 'italic' as const,
  },
  phraseTranslated: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cacheText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: premiumColors.glassWhiteStrong,
  },
});
