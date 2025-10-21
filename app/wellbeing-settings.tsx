import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Brain, Shield, Moon, ArrowLeft } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';

export default function WellbeingSettingsScreen() {
  const router = useRouter();
  const { settings, updateSetting, getRemainingQuests } = useSettings();

  const dailyLimits = [
    { label: 'Unlimited (Recommended)', value: 999 },
    { label: '10 tasks/day', value: 10 },
    { label: '5 tasks/day', value: 5 },
    { label: '3 tasks/day', value: 3 },
  ];

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    triggerHaptic('selection');
    await updateSetting(key, value);
  };

  const handleLimitChange = async (limit: number) => {
    triggerHaptic('selection');
    await updateSetting('dailyQuestLimit', limit);
  };

  const remaining = getRemainingQuests();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              triggerHaptic('light');
              router.back();
            }}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="dark" style={styles.heroCard}>
            <LinearGradient
              colors={[premiumColors.neonGreen + '20', premiumColors.neonCyan + '15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Heart size={48} color={premiumColors.neonGreen} strokeWidth={2} />
              <Text style={styles.heroTitle}>Your Hustle, Your Rules</Text>
              <Text style={styles.heroSubtitle}>
                Customize your task preferences and AI assistance
              </Text>
            </LinearGradient>
          </GlassCard>

          <GlassCard variant="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={24} color={premiumColors.neonCyan} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Daily Limits</Text>
            </View>

            <View style={styles.statusBanner}>
              <Text style={styles.statusLabel}>Today:</Text>
              <Text style={styles.statusValue}>
                {remaining === Infinity ? '∞' : remaining} task{remaining !== 1 ? 's' : ''} remaining
              </Text>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.groupLabel}>Set Daily Task Limit</Text>
              <Text style={styles.groupDescription}>
                Set daily task limit (Unlimited recommended for maximum flexibility)
              </Text>
              <View style={styles.chipGrid}>
                {dailyLimits.map((limit) => (
                  <TouchableOpacity
                    key={limit.value}
                    style={[
                      styles.limitChip,
                      settings.dailyQuestLimit === limit.value && styles.limitChipActive,
                    ]}
                    onPress={() => handleLimitChange(limit.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        settings.dailyQuestLimit === limit.value && styles.chipTextActive,
                      ]}
                    >
                      {limit.label}
                    </Text>
                    {limit.value === 999 && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>⭐</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {settings.dailyQuestLimit === 999 && (
              <View style={styles.encouragementBox}>
                <Heart size={16} color={premiumColors.neonGreen} />
                <Text style={styles.encouragementText}>
                  Unlimited mode activated! Work at your own pace without restrictions.
                </Text>
              </View>
            )}
          </GlassCard>

          <GlassCard variant="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Brain size={24} color={premiumColors.neonViolet} strokeWidth={2} />
              <Text style={styles.sectionTitle}>AI Assistance</Text>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Task Offers from HustleAI</Text>
                <Text style={styles.settingDescription}>
                  Get personalized task recommendations in Messages
                </Text>
              </View>
              <Switch
                value={settings.aiNudgesEnabled}
                onValueChange={(val) => handleToggle('aiNudgesEnabled', val)}
                trackColor={{ false: Colors.textSecondary + '40', true: premiumColors.neonViolet + '60' }}
                thumbColor={settings.aiNudgesEnabled ? premiumColors.neonViolet : Colors.textSecondary}
                ios_backgroundColor={Colors.textSecondary + '40'}
              />
            </View>

            <Text style={styles.noteText}>
              💡 When enabled, HustleAI will send you curated task offers based on your skills, location, and
              availability. All offers appear in the Messages tab.
            </Text>
          </GlassCard>

          <View style={styles.infoBox}>
            <Moon size={20} color={premiumColors.neonCyan} />
            <Text style={styles.infoText}>
              You&apos;re in control. Customize these settings to match your working style and preferences.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  heroCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: premiumColors.neonCyan + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.lg,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  settingGroup: {
    marginBottom: spacing.lg,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  groupDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  limitChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    position: 'relative',
  },
  limitChipActive: {
    backgroundColor: premiumColors.neonCyan + '20',
    borderColor: premiumColors.neonCyan,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: premiumColors.neonCyan,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: premiumColors.neonAmber,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedText: {
    fontSize: 10,
  },
  encouragementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: premiumColors.neonGreen + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '30',
  },
  encouragementText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  noteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.md,
    fontStyle: 'italic' as const,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: premiumColors.neonCyan + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
});
