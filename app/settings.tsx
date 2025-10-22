import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings as SettingsIcon, Zap, Bell, Eye, RotateCcw, Info, ChevronRight, Gift, LogOut, Sparkles, Heart, TestTube, Activity, Globe } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { useState, useEffect } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { signOut } = useApp();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const insets = useSafeAreaInsets();
  const [screenReaderEnabled, setScreenReaderEnabled] = useState<boolean>(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
      setScreenReaderEnabled(enabled);
    });
  }, []);

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    triggerHaptic('light');
    await updateSetting(key, value);
  };



  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            triggerHaptic('success');
            Alert.alert('Success', 'Settings have been reset to default');
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            triggerHaptic('success');
            router.replace('/sign-in');
          },
        },
      ]
    );
  };



  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />

      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Language & Region</Text>
            </View>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                const currentIndex = availableLanguages.findIndex(l => l.code === currentLanguage);
                const nextLang = availableLanguages[(currentIndex + 1) % availableLanguages.length];
                changeLanguage(nextLang.code);
                triggerHaptic('light');
              }}
              accessible
              accessibilityLabel={`Current language: ${availableLanguages.find(l => l.code === currentLanguage)?.name}`}
              accessibilityHint="Tap to cycle through available languages"
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>
                  {availableLanguages.find(l => l.code === currentLanguage)?.flag} Language
                </Text>
                <Text style={styles.settingDescription}>
                  {availableLanguages.find(l => l.code === currentLanguage)?.name}
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Gamification</Text>
            </View>

            <View style={styles.settingRow} accessible accessibilityLabel="Enable gamification features">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Gamification</Text>
                <Text style={styles.settingDescription}>
                  Turn off to disable XP, levels, and badges
                </Text>
              </View>
              <Switch
                value={settings.gamificationEnabled}
                onValueChange={(value) => handleToggle('gamificationEnabled', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.gamificationEnabled ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="Gamification toggle"
                accessibilityRole="switch"
              />
            </View>


          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>AI Features</Text>
            </View>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                triggerHaptic('medium');
                router.push('/ai-backend-dashboard');
              }}
              accessible
              accessibilityLabel="AI Backend Dashboard"
              accessibilityHint="Tap to view real-time backend status and feature health"
            >
              <View style={styles.settingInfo}>
                <Activity size={20} color="#06B6D4" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>AI Backend Dashboard</Text>
                  <Text style={styles.settingDescription}>Monitor AI features & backend health</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                triggerHaptic('medium');
                router.push('/backend-test');
              }}
              accessible
              accessibilityLabel="Backend Test"
              accessibilityHint="Tap to run comprehensive backend integration tests"
            >
              <View style={styles.settingInfo}>
                <TestTube size={20} color="#10B981" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Backend Test Suite</Text>
                  <Text style={styles.settingDescription}>Run full backend integration tests</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                triggerHaptic('medium');
                router.push('/ai-settings');
              }}
              accessible
              accessibilityLabel="AI Settings"
              accessibilityHint="Tap to configure AI features and privacy"
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>AI Settings</Text>
                <Text style={styles.settingDescription}>Control AI features and privacy</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Notifications & Feedback</Text>
            </View>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/notification-settings')}
              accessible
              accessibilityLabel="Notification settings"
              accessibilityHint="Tap to configure notification preferences"
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notification Settings</Text>
                <Text style={styles.settingDescription}>Configure push notifications</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/kyc-verification')}
              accessible
              accessibilityLabel="KYC verification"
              accessibilityHint="Tap to manage your verification status"
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>KYC Verification</Text>
                <Text style={styles.settingDescription}>Manage your verification tier</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                triggerHaptic('medium');
                router.push('/referrals');
              }}
              accessible
              accessibilityLabel="Refer & Earn"
              accessibilityHint="Tap to view referral program and earn rewards"
            >
              <View style={styles.settingInfo}>
                <Gift size={20} color={Colors.accent} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Refer & Earn</Text>
                  <Text style={styles.settingDescription}>Invite friends and get rewards</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.settingRow} accessible accessibilityLabel="Enable notifications">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Receive quest updates</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => handleToggle('notificationsEnabled', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.notificationsEnabled ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="Notifications toggle"
                accessibilityRole="switch"
              />
            </View>

            <View style={styles.settingRow} accessible accessibilityLabel="Enable sound effects">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>Play audio feedback</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => handleToggle('soundEnabled', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.soundEnabled ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="Sound effects toggle"
                accessibilityRole="switch"
              />
            </View>

            <View style={styles.settingRow} accessible accessibilityLabel="Enable haptic feedback">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>Vibration on interactions</Text>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(value) => handleToggle('hapticsEnabled', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.hapticsEnabled ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="Haptic feedback toggle"
                accessibilityRole="switch"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eye size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Accessibility</Text>
            </View>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                triggerHaptic('medium');
                router.push('/accessibility-settings');
              }}
              accessible
              accessibilityLabel="Accessibility Settings"
              accessibilityHint="Tap to configure visual, audio, and navigation accessibility features"
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Accessibility Settings</Text>
                <Text style={styles.settingDescription}>Visual, audio & navigation options</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                triggerHaptic('medium');
                router.push('/wellbeing-settings');
              }}
              accessible
              accessibilityLabel="Wellbeing Settings"
              accessibilityHint="Tap to set daily limits and manage burnout protection"
            >
              <View style={styles.settingInfo}>
                <Heart size={20} color={Colors.accent} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Wellbeing Settings</Text>
                  <Text style={styles.settingDescription}>Daily limits & burnout protection</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {screenReaderEnabled && (
              <View style={styles.infoCard} accessible accessibilityLabel="Screen reader is active">
                <Info size={16} color={Colors.accent} />
                <Text style={styles.infoText}>Screen reader detected and active</Text>
              </View>
            )}

            <View style={styles.settingRow} accessible accessibilityLabel="Enable accessibility mode">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Accessibility Mode</Text>
                <Text style={styles.settingDescription}>Enhanced screen reader support</Text>
              </View>
              <Switch
                value={settings.accessibilityMode}
                onValueChange={(value) => handleToggle('accessibilityMode', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.accessibilityMode ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="Accessibility mode toggle"
                accessibilityRole="switch"
              />
            </View>

            <View style={styles.settingRow} accessible accessibilityLabel="Enable reduced motion">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reduced Motion</Text>
                <Text style={styles.settingDescription}>Minimize animations</Text>
              </View>
              <Switch
                value={settings.reducedMotion}
                onValueChange={(value) => handleToggle('reducedMotion', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.reducedMotion ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="Reduced motion toggle"
                accessibilityRole="switch"
              />
            </View>

            <View style={styles.settingRow} accessible accessibilityLabel="Enable high contrast mode">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>High Contrast</Text>
                <Text style={styles.settingDescription}>Increase text visibility</Text>
              </View>
              <Switch
                value={settings.highContrast}
                onValueChange={(value) => handleToggle('highContrast', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.highContrast ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="High contrast toggle"
                accessibilityRole="switch"
              />
            </View>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                const modes: ('none' | 'protanopia' | 'deuteranopia' | 'tritanopia')[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
                const currentIndex = modes.indexOf(settings.colorBlindMode);
                const nextMode = modes[(currentIndex + 1) % modes.length];
                updateSetting('colorBlindMode', nextMode);
                triggerHaptic('light');
              }}
              accessible
              accessibilityLabel={`Color blind mode: ${settings.colorBlindMode}`}
              accessibilityHint="Tap to cycle through color blind modes"
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Color Blind Mode</Text>
                <Text style={styles.settingDescription}>
                  Current: {settings.colorBlindMode === 'none' ? 'Off' : settings.colorBlindMode}
                </Text>
              </View>
              <Text style={styles.settingValue}>
                {settings.colorBlindMode === 'none' ? 'Off' : settings.colorBlindMode.charAt(0).toUpperCase() + settings.colorBlindMode.slice(1)}
              </Text>
            </TouchableOpacity>

            <View style={styles.settingRow} accessible accessibilityLabel="Enable large font mode">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Large Font Mode</Text>
                <Text style={styles.settingDescription}>Increase text size throughout app</Text>
              </View>
              <Switch
                value={settings.largeFontMode}
                onValueChange={(value) => handleToggle('largeFontMode', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.largeFontMode ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="Large font mode toggle"
                accessibilityRole="switch"
              />
            </View>

            <View style={styles.settingRow} accessible accessibilityLabel="Enable keyboard navigation">
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Keyboard Navigation</Text>
                <Text style={styles.settingDescription}>Enhanced keyboard support</Text>
              </View>
              <Switch
                value={settings.keyboardNavigationEnabled}
                onValueChange={(value) => handleToggle('keyboardNavigationEnabled', value)}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor={settings.keyboardNavigationEnabled ? Colors.accent : Colors.textSecondary}
                accessibilityLabel="Keyboard navigation toggle"
                accessibilityRole="switch"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SettingsIcon size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Advanced</Text>
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              accessible
              accessibilityLabel="Reset all settings to default"
              accessibilityRole="button"
            >
              <RotateCcw size={20} color={Colors.text} />
              <Text style={styles.resetButtonText}>Reset All Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              accessible
              accessibilityLabel="Sign out of your account"
              accessibilityRole="button"
            >
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>


        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
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
  },
  settingValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.accent,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
    marginTop: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  infoSection: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.surface,
  },
  modalButtonSave: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modalButtonTextSave: {
    color: Colors.background,
  },
});
