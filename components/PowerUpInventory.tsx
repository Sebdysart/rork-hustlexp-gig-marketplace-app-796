import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ActivePowerUp } from '@/types';
import { POWER_UPS } from '@/constants/powerUps';
import { LinearGradient } from 'expo-linear-gradient';

interface PowerUpInventoryProps {
  activePowerUps: ActivePowerUp[];
  onUsePowerUp?: (powerUpId: string) => void;
}

export default function PowerUpInventory({ activePowerUps, onUsePowerUp }: PowerUpInventoryProps) {
  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const isExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt).getTime() <= new Date().getTime();
  };

  if (activePowerUps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No Active Power-Ups</Text>
        <Text style={styles.emptyText}>
          Visit the shop to purchase power-ups and boost your hustle!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {activePowerUps.map((activePowerUp, index) => {
        const powerUp = POWER_UPS.find(p => p.id === activePowerUp.powerUpId);
        if (!powerUp) return null;

        const expired = isExpired(activePowerUp.expiresAt);
        const timeRemaining = getTimeRemaining(activePowerUp.expiresAt);

        return (
          <View key={`${activePowerUp.powerUpId}-${index}`} style={styles.card}>
            <LinearGradient
              colors={expired ? ['#4B5563', '#374151'] : ['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{powerUp.icon}</Text>
                </View>
                
                <View style={styles.info}>
                  <Text style={styles.name}>{powerUp.name}</Text>
                  <Text style={styles.description}>{powerUp.description}</Text>
                  
                  <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, expired && styles.expiredBadge]}>
                      <Text style={styles.statusText}>
                        {expired ? '⏰ Expired' : `⏱️ ${timeRemaining}`}
                      </Text>
                    </View>
                    
                    {powerUp.effect.type === 'xp_boost' && (
                      <View style={styles.effectBadge}>
                        <Text style={styles.effectText}>⚡ {powerUp.effect.value}x XP</Text>
                      </View>
                    )}
                    
                    {powerUp.effect.type === 'earnings_boost' && (
                      <View style={styles.effectBadge}>
                        <Text style={styles.effectText}>💰 {powerUp.effect.value}x Earnings</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  effectBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  effectText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
