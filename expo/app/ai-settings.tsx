import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Info, Shield, Zap, MessageSquare, Users, DollarSign, ChevronRight, Activity } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from '@/utils/haptics';

const AI_SETTINGS_KEY = 'hustlexp_ai_settings';

interface AISettings {
  enableAI: boolean;
  taskSuggestions: boolean;
  chatAssist: boolean;
  workerMatching: boolean;
  payEstimation: boolean;
  dataSharing: boolean;
}

const DEFAULT_SETTINGS: AISettings = {
  enableAI: true,
  taskSuggestions: true,
  chatAssist: true,
  workerMatching: true,
  payEstimation: true,
  dataSharing: false,
};

export default function AISettingsScreen() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(AI_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AISettings) => {
    try {
      await AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      triggerHaptic('light');
    } catch (error) {
      console.error('Error saving AI settings:', error);
      Alert.alert('Error', 'Could not save settings. Please try again.');
    }
  };

  const handleToggle = (key: keyof AISettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    
    if (key === 'enableAI' && !newSettings.enableAI) {
      Alert.alert(
        'Disable AI Features?',
        'This will turn off all AI-powered features. You can re-enable them anytime.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              newSettings.taskSuggestions = false;
              newSettings.chatAssist = false;
              newSettings.workerMatching = false;
              newSettings.payEstimation = false;
              saveSettings(newSettings);
            },
          },
        ]
      );
      return;
    }

    if (key !== 'enableAI' && !settings.enableAI) {
      Alert.alert('AI Disabled', 'Please enable AI features first.');
      return;
    }

    saveSettings(newSettings);
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults?',
      'This will restore all AI settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => saveSettings(DEFAULT_SETTINGS),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'AI Settings',
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI Settings',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Sparkles size={32} color={premiumColors.neonViolet} />
            <Text style={styles.headerTitle}>AI Features</Text>
            <Text style={styles.headerSubtitle}>
              Control how AI assists you in HustleXP
            </Text>
          </View>

          <GlassCard variant="dark" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Info size={20} color={premiumColors.neonCyan} />
              <Text style={styles.infoTitle}>About AI in HustleXP</Text>
            </View>
            <Text style={styles.infoText}>
              We use AI to help you create better tasks, communicate clearly, and find the best matches. All AI features are optional and can be disabled anytime.
            </Text>
          </GlassCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Master Control</Text>
            <GlassCard variant="darkStrong" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: premiumColors.neonViolet + '20' }]}>
                    <Sparkles size={20} color={premiumColors.neonViolet} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Enable AI Features</Text>
                    <Text style={styles.settingDescription}>
                      Turn all AI features on or off
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.enableAI}
                  onValueChange={() => handleToggle('enableAI')}
                  trackColor={{ false: Colors.surface, true: premiumColors.neonViolet }}
                  thumbColor={settings.enableAI ? Colors.text : Colors.textSecondary}
                />
              </View>
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Features</Text>
            
            <GlassCard variant="dark" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: premiumColors.neonCyan + '20' }]}>
                    <Zap size={20} color={premiumColors.neonCyan} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Task Suggestions</Text>
                    <Text style={styles.settingDescription}>
                      AI-generated titles, descriptions, and tips
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.taskSuggestions}
                  onValueChange={() => handleToggle('taskSuggestions')}
                  trackColor={{ false: Colors.surface, true: premiumColors.neonCyan }}
                  thumbColor={settings.taskSuggestions ? Colors.text : Colors.textSecondary}
                  disabled={!settings.enableAI}
                />
              </View>
            </GlassCard>

            <GlassCard variant="dark" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: premiumColors.neonAmber + '20' }]}>
                    <MessageSquare size={20} color={premiumColors.neonAmber} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Chat Assistant</Text>
                    <Text style={styles.settingDescription}>
                      AI clarification and reply suggestions
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.chatAssist}
                  onValueChange={() => handleToggle('chatAssist')}
                  trackColor={{ false: Colors.surface, true: premiumColors.neonAmber }}
                  thumbColor={settings.chatAssist ? Colors.text : Colors.textSecondary}
                  disabled={!settings.enableAI}
                />
              </View>
            </GlassCard>

            <GlassCard variant="dark" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: premiumColors.neonGreen + '20' }]}>
                    <Users size={20} color={premiumColors.neonGreen} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Worker Matching</Text>
                    <Text style={styles.settingDescription}>
                      AI-powered worker recommendations
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.workerMatching}
                  onValueChange={() => handleToggle('workerMatching')}
                  trackColor={{ false: Colors.surface, true: premiumColors.neonGreen }}
                  thumbColor={settings.workerMatching ? Colors.text : Colors.textSecondary}
                  disabled={!settings.enableAI}
                />
              </View>
            </GlassCard>

            <GlassCard variant="dark" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: premiumColors.neonViolet + '20' }]}>
                    <DollarSign size={20} color={premiumColors.neonViolet} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Pay Estimation</Text>
                    <Text style={styles.settingDescription}>
                      AI-based fair pay recommendations
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.payEstimation}
                  onValueChange={() => handleToggle('payEstimation')}
                  trackColor={{ false: Colors.surface, true: premiumColors.neonViolet }}
                  thumbColor={settings.payEstimation ? Colors.text : Colors.textSecondary}
                  disabled={!settings.enableAI}
                />
              </View>
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer Tools</Text>
            
            <TouchableOpacity
              style={styles.linkCard}
              onPress={() => {
                triggerHaptic('light');
                router.push('/backend-test');
              }}
            >
              <View style={styles.linkContent}>
                <Activity size={20} color={premiumColors.neonCyan} />
                <Text style={styles.linkText}>Backend Connection Test</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            
            <GlassCard variant="dark" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: premiumColors.neonCyan + '20' }]}>
                    <Shield size={20} color={premiumColors.neonCyan} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Data Sharing</Text>
                    <Text style={styles.settingDescription}>
                      Share anonymized data to improve AI
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.dataSharing}
                  onValueChange={() => handleToggle('dataSharing')}
                  trackColor={{ false: Colors.surface, true: premiumColors.neonCyan }}
                  thumbColor={settings.dataSharing ? Colors.text : Colors.textSecondary}
                />
              </View>
            </GlassCard>

            <TouchableOpacity
              style={styles.linkCard}
              onPress={() => {
                Alert.alert(
                  'AI Privacy Policy',
                  'HustleXP uses AI to enhance your experience. We never sell your data. All AI processing is done securely, and you can opt out anytime.\n\nYour data is used only to:\n• Generate task suggestions\n• Improve chat clarity\n• Match workers with tasks\n• Estimate fair pay\n\nWe do not:\n• Share data with third parties\n• Use data for advertising\n• Store sensitive information',
                  [{ text: 'Got it', style: 'default' }]
                );
              }}
            >
              <View style={styles.linkContent}>
                <Shield size={20} color={premiumColors.neonViolet} />
                <Text style={styles.linkText}>View AI Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleResetToDefaults}>
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              AI features are powered by advanced language models. Results may vary and should be reviewed before use.
            </Text>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  settingCard: {
    padding: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
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
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  resetButton: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
});
