import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Type, Volume2, Zap, Moon, ArrowLeft } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';

export default function AccessibilitySettingsScreen() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const fontSizes = [
    { label: 'Small', value: 11 },
    { label: 'Default', value: 14 },
    { label: 'Large', value: 18 },
    { label: 'Extra Large', value: 22 },
    { label: 'Huge', value: 28 },
  ];

  const colorBlindModes = [
    { label: 'None', value: 'none' as const },
    { label: 'Protanopia', value: 'protanopia' as const },
    { label: 'Deuteranopia', value: 'deuteranopia' as const },
    { label: 'Tritanopia', value: 'tritanopia' as const },
  ];

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    triggerHaptic('selection');
    await updateSetting(key, value);
  };

  const handleFontSizeChange = async (size: number) => {
    triggerHaptic('selection');
    await updateSetting('fontSize', size);
  };

  const handleColorBlindModeChange = async (mode: typeof settings.colorBlindMode) => {
    triggerHaptic('selection');
    await updateSetting('colorBlindMode', mode);
  };

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
          <Text style={styles.headerTitle}>Accessibility</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eye size={24} color={premiumColors.neonCyan} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Visual</Text>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>High Contrast Mode</Text>
                <Text style={styles.settingDescription}>
                  Increases contrast for better readability
                </Text>
              </View>
              <Switch
                value={settings.highContrast}
                onValueChange={(val) => handleToggle('highContrast', val)}
                trackColor={{ false: Colors.textSecondary + '40', true: premiumColors.neonCyan + '60' }}
                thumbColor={settings.highContrast ? premiumColors.neonCyan : Colors.textSecondary}
                ios_backgroundColor={Colors.textSecondary + '40'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reduced Motion</Text>
                <Text style={styles.settingDescription}>
                  Minimize animations and transitions
                </Text>
              </View>
              <Switch
                value={settings.reducedMotion}
                onValueChange={(val) => handleToggle('reducedMotion', val)}
                trackColor={{ false: Colors.textSecondary + '40', true: premiumColors.neonCyan + '60' }}
                thumbColor={settings.reducedMotion ? premiumColors.neonCyan : Colors.textSecondary}
                ios_backgroundColor={Colors.textSecondary + '40'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingGroup}>
              <Text style={styles.groupLabel}>Color Blind Mode</Text>
              <View style={styles.chipGrid}>
                {colorBlindModes.map((mode) => (
                  <TouchableOpacity
                    key={mode.value}
                    style={[
                      styles.chip,
                      settings.colorBlindMode === mode.value && styles.chipActive,
                    ]}
                    onPress={() => handleColorBlindModeChange(mode.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        settings.colorBlindMode === mode.value && styles.chipTextActive,
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassCard>

          <GlassCard variant="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Type size={24} color={premiumColors.neonAmber} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Text</Text>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.groupLabel}>Font Size</Text>
              <View style={styles.chipGrid}>
                {fontSizes.map((size) => (
                  <TouchableOpacity
                    key={size.value}
                    style={[
                      styles.chip,
                      settings.fontSize === size.value && styles.chipActive,
                    ]}
                    onPress={() => handleFontSizeChange(size.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { fontSize: Math.max(12, size.value - 4) },
                        settings.fontSize === size.value && styles.chipTextActive,
                      ]}
                    >
                      {size.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.previewCard}>
              <Text style={[styles.previewText, { fontSize: settings.fontSize }]}>
                Preview: This is how text will appear at {settings.fontSize}px
              </Text>
            </View>
          </GlassCard>

          <GlassCard variant="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Volume2 size={24} color={premiumColors.neonGreen} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Audio & Haptics</Text>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>
                  Play audio feedback for actions
                </Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(val) => handleToggle('soundEnabled', val)}
                trackColor={{ false: Colors.textSecondary + '40', true: premiumColors.neonGreen + '60' }}
                thumbColor={settings.soundEnabled ? premiumColors.neonGreen : Colors.textSecondary}
                ios_backgroundColor={Colors.textSecondary + '40'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>
                  Vibration feedback for interactions
                </Text>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(val) => handleToggle('hapticsEnabled', val)}
                trackColor={{ false: Colors.textSecondary + '40', true: premiumColors.neonGreen + '60' }}
                thumbColor={settings.hapticsEnabled ? premiumColors.neonGreen : Colors.textSecondary}
                ios_backgroundColor={Colors.textSecondary + '40'}
              />
            </View>
          </GlassCard>

          <GlassCard variant="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={24} color={premiumColors.neonViolet} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Navigation</Text>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Keyboard Navigation</Text>
                <Text style={styles.settingDescription}>
                  Navigate using keyboard shortcuts
                </Text>
              </View>
              <Switch
                value={settings.keyboardNavigationEnabled}
                onValueChange={(val) => handleToggle('keyboardNavigationEnabled', val)}
                trackColor={{ false: Colors.textSecondary + '40', true: premiumColors.neonViolet + '60' }}
                thumbColor={settings.keyboardNavigationEnabled ? premiumColors.neonViolet : Colors.textSecondary}
                ios_backgroundColor={Colors.textSecondary + '40'}
              />
            </View>
          </GlassCard>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              These settings help make HustleXP more accessible for everyone. Screen reader support is built-in
              across the app.
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
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
  divider: {
    height: 1,
    backgroundColor: premiumColors.glassWhite,
    marginVertical: spacing.lg,
  },
  settingGroup: {
    marginBottom: spacing.lg,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  chipActive: {
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
  previewCard: {
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  previewText: {
    color: Colors.text,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: premiumColors.neonCyan + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  infoText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    textAlign: 'center',
  },
});
