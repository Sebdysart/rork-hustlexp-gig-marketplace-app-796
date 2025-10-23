import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import Colors from '@/constants/colors';

export default function TranslationDebugScreen() {
  const insets = useSafeAreaInsets();
  const { 
    currentLanguage, 
    useAITranslation, 
    aiTranslationCache,
    isLoading,
    translationProgress,
    changeLanguage
  } = useLanguage();

  const [testKey] = useState('HustleXP');
  const cacheKey = `${currentLanguage}:${testKey}`;

  const cacheEntries = Object.entries(aiTranslationCache);
  const cacheForCurrentLang = cacheEntries.filter(([key]) => key.startsWith(`${currentLanguage}:`));
  
  const sampleTexts = [
    'HustleXP',
    'Your Journey to Legendary Status Starts Here',
    'Level Up Your Hustle',
    'Complete Tasks',
    'Post Tasks'
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { 
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20 
        }
      ]}
    >
      <Text style={styles.title}>🔍 Translation Debug</Text>

      <BlurView intensity={30} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ System Status</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Current Language:</Text>
          <Text style={styles.value}>{currentLanguage}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>AI Translation:</Text>
          <Text style={[styles.value, { color: useAITranslation ? premiumColors.neonGreen : premiumColors.neonRed }]}>
            {useAITranslation ? 'ENABLED ✅' : 'DISABLED ❌'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Loading:</Text>
          <Text style={[styles.value, { color: isLoading ? premiumColors.neonAmber : premiumColors.neonGreen }]}>
            {isLoading ? `YES (${translationProgress}%)` : 'NO ✅'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cache Size (Total):</Text>
          <Text style={styles.value}>{cacheEntries.length} entries</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cache for {currentLanguage}:</Text>
          <Text style={styles.value}>{cacheForCurrentLang.length} entries</Text>
        </View>
      </BlurView>

      <BlurView intensity={30} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>🔑 Sample Cache Keys</Text>
        {sampleTexts.slice(0, 3).map((text) => {
          const key = `${currentLanguage}:${text}`;
          const exists = key in aiTranslationCache;
          const translation = aiTranslationCache[key];
          
          return (
            <View key={text} style={styles.cacheEntry}>
              <Text style={styles.cacheKey}>{text}</Text>
              {exists ? (
                <>
                  <Text style={[styles.cacheStatus, { color: premiumColors.neonGreen }]}>✅ CACHED</Text>
                  <Text style={styles.cacheValue}>{translation}</Text>
                </>
              ) : (
                <Text style={[styles.cacheStatus, { color: premiumColors.neonRed }]}>❌ MISSING</Text>
              )}
            </View>
          );
        })}
      </BlurView>

      <BlurView intensity={30} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>🧪 Backend Test Info</Text>
        <Text style={styles.instruction}>
          Share this with backend team:
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Language: {currentLanguage}</Text>
          <Text style={styles.infoText}>Expected Cache Key Format:</Text>
          <Text style={styles.codeText}>{`"${currentLanguage}:HustleXP"`}</Text>
          <Text style={styles.infoText}>Cache Has Key: {cacheKey in aiTranslationCache ? 'YES ✅' : 'NO ❌'}</Text>
          {cacheKey in aiTranslationCache && (
            <Text style={styles.infoText}>Translation: {aiTranslationCache[cacheKey]}</Text>
          )}
        </View>
      </BlurView>

      <BlurView intensity={30} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>📋 All Cache Entries ({cacheForCurrentLang.length})</Text>
        <ScrollView style={styles.cacheList} nestedScrollEnabled>
          {cacheForCurrentLang.length === 0 ? (
            <Text style={styles.emptyText}>
              No translations cached for {currentLanguage}
              {'\n\n'}
              This means either:
              {'\n'}• Language just changed and preload is running
              {'\n'}• Backend translation failed
              {'\n'}• Cache key format mismatch
            </Text>
          ) : (
            cacheForCurrentLang.slice(0, 20).map(([key, value]) => (
              <View key={key} style={styles.cacheItem}>
                <Text style={styles.cacheItemKey} numberOfLines={1}>
                  {key.split(':')[1]}
                </Text>
                <Text style={styles.cacheItemValue} numberOfLines={1}>
                  {value}
                </Text>
              </View>
            ))
          )}
          {cacheForCurrentLang.length > 20 && (
            <Text style={styles.moreText}>
              ... and {cacheForCurrentLang.length - 20} more
            </Text>
          )}
        </ScrollView>
      </BlurView>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => {
          console.log('[Debug] Manual language refresh triggered');
          changeLanguage(currentLanguage);
        }}
      >
        <RefreshCw size={20} color={premiumColors.deepBlack} />
        <Text style={styles.refreshButtonText}>Force Re-translate</Text>
      </TouchableOpacity>

      <BlurView intensity={30} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>📝 Backend Requirements</Text>
        <Text style={styles.helpText}>
          The backend translation API must return data in this format:
          {'\n\n'}
          ✅ Correct Response:
        </Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>
{`{
  "translations": [
    "HustleXP",
    "Tu viaje hacia...",
    "Mejora tu trabajo"
  ]
}`}
          </Text>
        </View>
        <Text style={styles.helpText}>
          {'\n'}
          Frontend caches as:
        </Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>
{`"es:HustleXP" → "HustleXP"
"es:Your Journey..." → "Tu viaje..."`}
          </Text>
        </View>
      </BlurView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    overflow: 'hidden',
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  value: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cacheEntry: {
    backgroundColor: premiumColors.glassDark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    gap: spacing.xs,
  },
  cacheKey: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cacheStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  cacheValue: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: premiumColors.neonCyan,
    fontStyle: 'italic' as const,
  },
  instruction: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.xs,
  },
  infoBox: {
    backgroundColor: premiumColors.glassDark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: premiumColors.neonAmber,
    fontFamily: 'monospace' as const,
  },
  cacheList: {
    maxHeight: 200,
  },
  cacheItem: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  cacheItemKey: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  cacheItemValue: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: premiumColors.neonCyan,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: 20,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    fontStyle: 'italic' as const,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: premiumColors.neonCyan,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
  },
  helpText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 18,
  },
  codeBlock: {
    backgroundColor: premiumColors.deepBlack,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
});
