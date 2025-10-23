import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Shield, Zap, Clock, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import GritCoin from '@/components/GritCoin';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';

interface StreakSaver {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: string;
  icon: string;
  color: string;
  owned: number;
}

const STREAK_SAVERS: StreakSaver[] = [
  {
    id: 'freeze-1day',
    name: 'Streak Freeze (1 Day)',
    description: 'Protect your streak for 1 day. Your streak won\'t break if you miss a day.',
    cost: 50,
    duration: '1 Day',
    icon: '❄️',
    color: premiumColors.neonCyan,
    owned: 2,
  },
  {
    id: 'freeze-3day',
    name: 'Streak Freeze (3 Days)',
    description: 'Protect your streak for 3 days. Perfect for weekends or short breaks.',
    cost: 120,
    duration: '3 Days',
    icon: '🧊',
    color: premiumColors.neonCyan,
    owned: 0,
  },
  {
    id: 'freeze-7day',
    name: 'Streak Freeze (7 Days)',
    description: 'Protect your streak for a full week. Ideal for vacations.',
    cost: 250,
    duration: '7 Days',
    icon: '🏔️',
    color: premiumColors.neonCyan,
    owned: 0,
  },
  {
    id: 'grace-period',
    name: 'Grace Period',
    description: 'Get 6 extra hours to complete your daily quest. Extends deadline to 6 AM next day.',
    cost: 30,
    duration: '6 Hours',
    icon: '⏰',
    color: premiumColors.neonAmber,
    owned: 1,
  },
  {
    id: 'streak-shield',
    name: 'Streak Shield',
    description: 'Automatically activates when you\'re about to lose your streak. One-time use.',
    cost: 100,
    duration: 'Auto',
    icon: '🛡️',
    color: premiumColors.neonViolet,
    owned: 0,
  },
  {
    id: 'double-xp',
    name: 'Double XP Boost',
    description: 'Earn 2x XP on all tasks for 24 hours. Stack with other bonuses!',
    cost: 150,
    duration: '24 Hours',
    icon: '⚡',
    color: premiumColors.neonGreen,
    owned: 0,
  },
];

export default function StreakSaversScreen() {
  const { currentUser } = useApp();

  const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16] = useTranslatedTexts([
    'Streak Savers',
    'Protect your streak and boost your progress with power-ups!',
    'Day Streak',
    'Grit Coins',
    'Streak Protection',
    'XP Boosters',
    'Activate',
    'Purchase',
    '💡 How Streak Savers Work',
    'Streak Freeze:',
    'Prevents your streak from breaking for the specified duration',
    'Grace Period:',
    'Extends your daily deadline by 6 hours',
    'Streak Shield:',
    'Automatically activates when needed (one-time use)',
    'XP Boosters:'
  ]);

  if (!currentUser) return null;

  const handlePurchase = (saver: StreakSaver) => {
    const userCoins = currentUser.coins ?? 0;
    if (userCoins < saver.cost) {
      triggerHaptic('error');
      Alert.alert(
        'Not Enough Grit Coins',
        `You need ${saver.cost} Grit Coins to purchase this. You have ${currentUser.coins || 0}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    triggerHaptic('success');
    Alert.alert(
      'Purchase Successful! 🎉',
      `${saver.name} has been added to your inventory.`,
      [{ text: 'OK' }]
    );
  };

  const handleActivate = (saver: StreakSaver) => {
    if (saver.owned === 0) {
      handlePurchase(saver);
      return;
    }

    triggerHaptic('success');
    Alert.alert(
      'Activate Power-Up?',
      `Do you want to activate ${saver.name}? You have ${saver.owned} remaining.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: () => {
            Alert.alert('Activated! ✨', `${saver.name} is now active!`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t1,
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonAmber" style={styles.headerCard}>
            <LinearGradient
              colors={[premiumColors.neonAmber + '20', premiumColors.neonViolet + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerIcon}>
                <Flame size={32} color={premiumColors.neonAmber} />
              </View>
              <Text style={styles.headerTitle}>{t1}</Text>
              <Text style={styles.headerSubtitle}>
                {t2}
              </Text>

              <View style={styles.streakInfo}>
                <View style={styles.streakBadge}>
                  <Flame size={24} color={premiumColors.neonAmber} />
                  <Text style={styles.streakValue}>{currentUser.streaks.current}</Text>
                  <Text style={styles.streakLabel}>{t3}</Text>
                </View>
                <View style={styles.coinsBadge}>
                  <GritCoin size={24} />
                  <Text style={styles.coinsValue}>{currentUser.coins || 0}</Text>
                  <Text style={styles.coinsLabel}>{t4}</Text>
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Shield size={20} color={premiumColors.neonCyan} />
              <Text style={styles.sectionTitle}>{t5}</Text>
            </View>
          </View>

          {STREAK_SAVERS.filter(s => s.id.includes('freeze') || s.id.includes('grace') || s.id.includes('shield')).map((saver) => (
            <GlassCard key={saver.id} variant="dark" style={styles.saverCard}>
              <View style={styles.saverHeader}>
                <View style={[styles.saverIconContainer, { backgroundColor: saver.color + '20' }]}>
                  <Text style={styles.saverIcon}>{saver.icon}</Text>
                  {saver.owned > 0 && (
                    <View style={[styles.ownedBadge, { backgroundColor: saver.color }]}>
                      <Text style={styles.ownedText}>{saver.owned}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.saverInfo}>
                  <Text style={styles.saverName}>{saver.name}</Text>
                  <View style={styles.saverMeta}>
                    <View style={[styles.durationBadge, { backgroundColor: saver.color + '20' }]}>
                      <Clock size={12} color={saver.color} />
                      <Text style={[styles.durationText, { color: saver.color }]}>
                        {saver.duration}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.saverDescription}>{saver.description}</Text>

              <View style={styles.saverFooter}>
                <View style={styles.costContainer}>
                  <GritCoin size={20} />
                  <Text style={styles.costText}>{saver.cost}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    saver.owned > 0 && styles.actionButtonOwned,
                  ]}
                  onPress={() => handleActivate(saver)}
                >
                  <LinearGradient
                    colors={
                      saver.owned > 0
                        ? [premiumColors.neonGreen, premiumColors.neonCyan]
                        : [saver.color, premiumColors.neonViolet]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButtonGradient}
                  >
                    {saver.owned > 0 ? (
                      <>
                        <CheckCircle2 size={16} color={Colors.text} />
                        <Text style={styles.actionButtonText}>{t7}</Text>
                      </>
                    ) : (
                      <>
                        <Zap size={16} color={Colors.text} />
                        <Text style={styles.actionButtonText}>{t8}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Zap size={20} color={premiumColors.neonGreen} />
              <Text style={styles.sectionTitle}>{t6}</Text>
            </View>
          </View>

          {STREAK_SAVERS.filter(s => s.id.includes('xp')).map((saver) => (
            <GlassCard key={saver.id} variant="dark" style={styles.saverCard}>
              <View style={styles.saverHeader}>
                <View style={[styles.saverIconContainer, { backgroundColor: saver.color + '20' }]}>
                  <Text style={styles.saverIcon}>{saver.icon}</Text>
                  {saver.owned > 0 && (
                    <View style={[styles.ownedBadge, { backgroundColor: saver.color }]}>
                      <Text style={styles.ownedText}>{saver.owned}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.saverInfo}>
                  <Text style={styles.saverName}>{saver.name}</Text>
                  <View style={styles.saverMeta}>
                    <View style={[styles.durationBadge, { backgroundColor: saver.color + '20' }]}>
                      <Clock size={12} color={saver.color} />
                      <Text style={[styles.durationText, { color: saver.color }]}>
                        {saver.duration}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.saverDescription}>{saver.description}</Text>

              <View style={styles.saverFooter}>
                <View style={styles.costContainer}>
                  <GritCoin size={20} />
                  <Text style={styles.costText}>{saver.cost}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    saver.owned > 0 && styles.actionButtonOwned,
                  ]}
                  onPress={() => handleActivate(saver)}
                >
                  <LinearGradient
                    colors={
                      saver.owned > 0
                        ? [premiumColors.neonGreen, premiumColors.neonCyan]
                        : [saver.color, premiumColors.neonViolet]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButtonGradient}
                  >
                    {saver.owned > 0 ? (
                      <>
                        <CheckCircle2 size={16} color={Colors.text} />
                        <Text style={styles.actionButtonText}>{t7}</Text>
                      </>
                    ) : (
                      <>
                        <Zap size={16} color={Colors.text} />
                        <Text style={styles.actionButtonText}>{t8}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}

          <GlassCard variant="dark" style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t9}</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>{t10}</Text> {t11}
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>{t12}</Text> {t13}
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>{t14}</Text> {t15}
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>{t16}</Text> Multiply your XP earnings for limited time
              </Text>
            </View>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
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
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  streakInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  streakBadge: {
    alignItems: 'center',
    gap: 4,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  streakLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  coinsBadge: {
    alignItems: 'center',
    gap: 4,
  },
  coinsValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  coinsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  saverCard: {
    marginBottom: 12,
    padding: 16,
  },
  saverHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  saverIconContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saverIcon: {
    fontSize: 28,
  },
  ownedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
  },
  ownedText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  saverInfo: {
    flex: 1,
  },
  saverName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  saverMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  saverDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  saverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  costText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  actionButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionButtonOwned: {},
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  infoCard: {
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
