import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Clock, CheckCircle, Sparkles, TrendingUp, Shield } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

import { POWER_UPS } from '@/constants/powerUps';
import { PowerUp } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import GlassCard from '@/components/GlassCard';
import NeonButton from '@/components/NeonButton';
import { premiumColors } from '@/constants/designTokens';

type Category = 'all' | 'boosts' | 'protection' | 'premium';

export default function ShopScreen() {
  const { currentUser, purchasePowerUp, activePowerUps } = useApp();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const insets = useSafeAreaInsets();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  if (!currentUser) {
    return null;
  }

  const userActivePowerUps = activePowerUps[currentUser.id] || [];

  const handlePurchase = async (powerUp: PowerUp) => {
    triggerHaptic('medium');
    
    Alert.alert(
      'Confirm Purchase',
      `Purchase ${powerUp.name} for $${powerUp.price.toFixed(2)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Buy Now',
          onPress: async () => {
            setPurchasing(powerUp.id);
            triggerHaptic('light');

            const result = await purchasePowerUp(powerUp);

            setPurchasing(null);

            if (result?.success) {
              triggerHaptic('success');
              Alert.alert(
                'Success! 🎉',
                `${powerUp.name} has been activated!`,
                [
                  {
                    text: 'Awesome!',
                    onPress: () => triggerHaptic('light'),
                  },
                ]
              );
            } else {
              triggerHaptic('error');
              Alert.alert(
                'Purchase Failed',
                result?.error || 'Something went wrong. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const isActive = (powerUpId: string) => {
    return userActivePowerUps.some(p => {
      if (p.powerUpId !== powerUpId) return false;
      const expiresAt = new Date(p.expiresAt);
      return expiresAt > new Date();
    });
  };

  const getTimeRemaining = (powerUpId: string) => {
    const activePowerUp = userActivePowerUps.find(p => p.powerUpId === powerUpId);
    if (!activePowerUp) return null;

    const expiresAt = new Date(activePowerUp.expiresAt);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'boosts':
        return <Zap size={18} color={premiumColors.neonCyan} />;
      case 'protection':
        return <Shield size={18} color={premiumColors.neonViolet} />;
      case 'premium':
        return <Sparkles size={18} color={premiumColors.neonAmber} />;
      default:
        return <TrendingUp size={18} color={premiumColors.neonMagenta} />;
    }
  };

  const getPowerUpCategory = (powerUp: PowerUp): Category => {
    if (powerUp.effect.type === 'streak_freeze') return 'protection';
    if (powerUp.price >= 15) return 'premium';
    if (powerUp.effect.type.includes('boost')) return 'boosts';
    return 'all';
  };

  const filteredPowerUps = selectedCategory === 'all'
    ? POWER_UPS
    : POWER_UPS.filter(p => getPowerUpCategory(p) === selectedCategory);

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'boosts', label: 'Boosts' },
    { id: 'protection', label: 'Protection' },
    { id: 'premium', label: 'Premium' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Power-Up Shop',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: '#FFFFFF',
          headerTransparent: false,
        }}
      />
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack, premiumColors.deepBlack]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <Sparkles size={48} color={premiumColors.neonCyan} />
            </Animated.View>
            <Text style={styles.headerTitle}>Power-Up Shop</Text>
            <Text style={styles.headerSubtitle}>Unlock your full potential</Text>
          </View>

          <GlassCard variant="dark" style={styles.infoCard}>
            <Zap size={20} color={premiumColors.neonAmber} />
            <Text style={styles.infoText}>Secure payments via Stripe • Instant activation</Text>
          </GlassCard>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  triggerHaptic('light');
                  setSelectedCategory(cat.id);
                }}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
              >
                {getCategoryIcon(cat.id)}
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.powerUpsGrid}>
            {filteredPowerUps.map((powerUp, index) => {
              const active = isActive(powerUp.id);
              const timeRemaining = getTimeRemaining(powerUp.id);
              const isPurchasing = purchasing === powerUp.id;
              const isPremium = powerUp.price >= 15;

              return (
                <GlassCard
                  key={powerUp.id}
                  variant="darkStrong"
                  animated
                  neonBorder={isPremium}
                  glowColor={isPremium ? 'neonAmber' : undefined}
                  style={styles.powerUpCard}
                >
                  <LinearGradient
                    colors={
                      active
                        ? [premiumColors.neonCyan + '20', premiumColors.neonViolet + '20']
                        : ['transparent', 'transparent']
                    }
                    style={styles.powerUpContent}
                  >
                    {active && (
                      <View style={styles.activeBadge}>
                        <CheckCircle size={14} color={premiumColors.neonGreen} />
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    )}

                    {isPremium && !active && (
                      <View style={styles.premiumBadge}>
                        <Sparkles size={12} color={premiumColors.neonAmber} />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}

                    <Animated.Text
                      style={[
                        styles.powerUpIcon,
                        {
                          transform: [
                            {
                              scale: shimmerAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 1.1, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      {powerUp.icon}
                    </Animated.Text>
                    <Text style={styles.powerUpName}>{powerUp.name}</Text>
                    <Text style={styles.powerUpDescription}>{powerUp.description}</Text>

                    <View style={styles.powerUpDetails}>
                      <View style={styles.detailRow}>
                        <Clock size={14} color={premiumColors.neonCyan} />
                        <Text style={styles.detailText}>
                          {powerUp.effect.duration ? `${powerUp.effect.duration}h` : '30 days'}
                        </Text>
                      </View>
                    </View>

                    {active && timeRemaining && (
                      <GlassCard variant="dark" style={styles.timeRemainingBadge}>
                        <Text style={styles.timeRemainingText}>⏱️ {timeRemaining} left</Text>
                      </GlassCard>
                    )}

                    {isPurchasing ? (
                      <View style={styles.loadingButton}>
                        <ActivityIndicator size="small" color={premiumColors.neonCyan} />
                        <Text style={styles.loadingText}>Processing...</Text>
                      </View>
                    ) : active ? (
                      <View style={styles.activeButton}>
                        <CheckCircle size={18} color={premiumColors.neonGreen} />
                        <Text style={styles.activeButtonText}>Activated</Text>
                      </View>
                    ) : (
                      <NeonButton
                        title={`${powerUp.price.toFixed(2)}`}
                        onPress={() => handlePurchase(powerUp)}
                        variant={isPremium ? 'amber' : 'cyan'}
                        size="medium"
                        fullWidth
                      />
                    )}
                  </LinearGradient>
                </GlassCard>
              );
            })}
          </View>

          <GlassCard variant="dark" style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>💳 Test Mode Active</Text>
            <Text style={styles.disclaimerText}>
              Running in Stripe test mode. No real charges will be made.
            </Text>
          </GlassCard>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: premiumColors.glassWhite,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  categoryChipActive: {
    backgroundColor: premiumColors.neonCyan + '30',
    borderColor: premiumColors.neonCyan,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  categoryChipTextActive: {
    color: premiumColors.neonCyan,
  },
  powerUpsGrid: {
    gap: 20,
  },
  powerUpCard: {
    overflow: 'visible',
  },
  powerUpContent: {
    padding: 24,
    position: 'relative' as const,
  },
  activeBadge: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonGreen + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  premiumBadge: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  powerUpIcon: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  powerUpName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  powerUpDescription: {
    fontSize: 14,
    color: premiumColors.glassWhiteStrong,
    marginBottom: 16,
    lineHeight: 20,
  },
  powerUpDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  timeRemainingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  timeRemainingText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: premiumColors.glassWhite,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  activeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: premiumColors.neonGreen + '20',
    borderWidth: 2,
    borderColor: premiumColors.neonGreen,
  },
  activeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  disclaimerCard: {
    padding: 20,
    marginTop: 32,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 20,
  },
});
