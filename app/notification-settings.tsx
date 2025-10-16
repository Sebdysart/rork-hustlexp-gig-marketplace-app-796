import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Clipboard } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, BellOff, Zap, Trophy, MessageCircle, Star, CheckCircle, Copy } from 'lucide-react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotifications } from '@/contexts/NotificationContext';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import React from "react";

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
};

export default function NotificationSettingsScreen() {
  const { expoPushToken, addNotification } = useNotifications();
  const { currentUser } = useApp();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'quest_new',
      title: 'New Quests',
      description: 'Get notified when new quests match your skills',
      icon: <Zap size={24} color={premiumColors.neonCyan} />,
      enabled: true,
    },
    {
      id: 'quest_accepted',
      title: 'Quest Accepted',
      description: 'When someone accepts your posted quest',
      icon: <CheckCircle size={24} color={premiumColors.neonGreen} />,
      enabled: true,
    },
    {
      id: 'quest_completed',
      title: 'Quest Completed',
      description: 'When you complete a quest and earn rewards',
      icon: <Trophy size={24} color={premiumColors.neonAmber} />,
      enabled: true,
    },
    {
      id: 'message_new',
      title: 'New Messages',
      description: 'When you receive a new message',
      icon: <MessageCircle size={24} color={premiumColors.neonViolet} />,
      enabled: true,
    },
    {
      id: 'level_up',
      title: 'Level Up',
      description: 'When you reach a new level',
      icon: <Star size={24} color={premiumColors.neonMagenta} />,
      enabled: true,
    },
    {
      id: 'badge_earned',
      title: 'Badge Earned',
      description: 'When you unlock a new badge',
      icon: <Trophy size={24} color={premiumColors.neonAmber} />,
      enabled: true,
    },
  ]);

  const toggleSetting = (id: string) => {
    triggerHaptic('selection');
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const toggleAll = (enabled: boolean) => {
    triggerHaptic('medium');
    setSettings(prev => prev.map(setting => ({ ...setting, enabled })));
  };

  const testNotification = async () => {
    if (!currentUser) return;
    
    triggerHaptic('success');
    await addNotification(currentUser.id, 'level_up', {
      newLevel: currentUser.level + 1,
    });
    
    Alert.alert(
      '🔔 Test Notification Sent!',
      'Check your notification center to see it.',
      [{ text: 'OK' }]
    );
  };

  const copyPushToken = () => {
    if (expoPushToken) {
      Clipboard.setString(expoPushToken);
      triggerHaptic('success');
      Alert.alert('✅ Copied!', 'Push token copied to clipboard');
    }
  };

  const allEnabled = settings.every(s => s.enabled);
  const allDisabled = settings.every(s => !s.enabled);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />

      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <GlassCard variant="dark" style={styles.headerCard}>
            <View style={styles.headerIcon}>
              <Bell size={32} color={premiumColors.neonCyan} />
            </View>
            <Text style={styles.headerTitle}>Stay in the Loop</Text>
            <Text style={styles.headerDescription}>
              Get real-time updates about quests, messages, and achievements
            </Text>
          </GlassCard>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => toggleAll(true)}
                disabled={allEnabled}
              >
                <GlassCard variant="dark" style={[styles.quickActionCard, allEnabled && styles.quickActionDisabled]}>
                  <Bell size={20} color={allEnabled ? Colors.textSecondary : premiumColors.neonGreen} />
                  <Text style={[styles.quickActionText, allEnabled && styles.quickActionTextDisabled]}>
                    Enable All
                  </Text>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => toggleAll(false)}
                disabled={allDisabled}
              >
                <GlassCard variant="dark" style={[styles.quickActionCard, allDisabled && styles.quickActionDisabled]}>
                  <BellOff size={20} color={allDisabled ? Colors.textSecondary : Colors.error} />
                  <Text style={[styles.quickActionText, allDisabled && styles.quickActionTextDisabled]}>
                    Disable All
                  </Text>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={testNotification}
              >
                <GlassCard variant="dark" style={styles.quickActionCard}>
                  <Zap size={20} color={premiumColors.neonCyan} />
                  <Text style={styles.quickActionText}>Test</Text>
                </GlassCard>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notification Types</Text>
            </View>
            {settings.map((setting) => (
              <GlassCard key={setting.id} variant="dark" style={styles.settingCard}>
                <View style={styles.settingIcon}>{setting.icon}</View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => toggleSetting(setting.id)}
                  trackColor={{ false: Colors.card, true: premiumColors.neonCyan + '50' }}
                  thumbColor={setting.enabled ? premiumColors.neonCyan : Colors.textSecondary}
                  ios_backgroundColor={Colors.card}
                />
              </GlassCard>
            ))}
          </View>

          {expoPushToken && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Developer Info</Text>
              </View>
              <GlassCard variant="dark" style={styles.tokenCard}>
                <Text style={styles.tokenLabel}>Push Token</Text>
                <View style={styles.tokenRow}>
                  <Text style={styles.tokenText} numberOfLines={1}>
                    {expoPushToken}
                  </Text>
                  <TouchableOpacity onPress={copyPushToken} style={styles.copyButton}>
                    <Copy size={16} color={premiumColors.neonCyan} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              💡 Notifications help you stay updated on quest activity, messages, and achievements in real-time.
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
    backgroundColor: Colors.background,
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
  headerCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
  },
  quickActionCard: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionDisabled: {
    opacity: 0.4,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  quickActionTextDisabled: {
    color: Colors.textSecondary,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: premiumColors.glassDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tokenCard: {
    padding: 16,
    gap: 12,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tokenText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: premiumColors.neonCyan,
  },
  copyButton: {
    padding: 8,
    backgroundColor: premiumColors.glassDark,
    borderRadius: 8,
  },
  infoSection: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
