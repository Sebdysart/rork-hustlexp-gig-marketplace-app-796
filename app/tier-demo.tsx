import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TierProgressIndicator from '@/components/TierProgressIndicator';
import AscensionCeremony from '@/components/AscensionCeremony';
import { ASCENSION_TIERS } from '@/constants/ascensionTiers';
import { useAscensionTier } from '@/hooks/useAscensionTier';
import { ChevronRight, Zap } from 'lucide-react-native';
import TierBadge from '@/components/TierBadge';
import TierUpgradeBanner from '@/components/TierUpgradeBanner';

export default function TierDemoScreen() {
  const insets = useSafeAreaInsets();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [showCeremony, setShowCeremony] = useState<boolean>(false);
  const [ceremonyTier, setCeremonyTier] = useState<typeof ASCENSION_TIERS[0] | null>(null);

  const tierData = useAscensionTier(selectedLevel);

  const handleTierPreview = (tierId: string) => {
    const tier = ASCENSION_TIERS.find((t) => t.id === tierId);
    if (tier) {
      setCeremonyTier(tier);
      setShowCeremony(true);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Ascension Tier System Demo',
          headerStyle: {
            backgroundColor: '#0D0D0F',
          },
          headerTintColor: '#FFFFFF',
        }} 
      />

      <LinearGradient
        colors={['#0D0D0F', '#1A1A1F', '#0D0D0F']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🎯 MAX POTENTIAL Tier System</Text>
          <Text style={styles.subtitle}>
            Experience the most addictive tier progression ever built
          </Text>
        </View>

        <View style={styles.levelSelector}>
          <Text style={styles.sectionTitle}>Test at Different Levels</Text>
          <View style={styles.levelButtons}>
            {[1, 5, 10, 11, 15, 20, 21, 25, 30, 31, 35, 40, 41, 50].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  selectedLevel === level && styles.levelButtonActive,
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    selectedLevel === level && styles.levelButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.currentStats}>
          <Text style={styles.sectionTitle}>Current Level: {selectedLevel}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Zap size={24} color="#FCD34D" fill="#FCD34D" />
              <Text style={styles.statValue}>{tierData.xpMultiplier}x</Text>
              <Text style={styles.statLabel}>XP Multiplier</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{tierData.platformFee}%</Text>
              <Text style={styles.statLabel}>Platform Fee</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{tierData.priorityMatching}</Text>
              <Text style={styles.statLabel}>Priority</Text>
            </View>
          </View>
        </View>

        <TierProgressIndicator currentLevel={selectedLevel} currentXP={0} />

        <View style={styles.compact}>
          <Text style={styles.sectionTitle}>Compact Mode (for headers)</Text>
          <TierProgressIndicator currentLevel={selectedLevel} currentXP={0} compact />
        </View>

        <View style={styles.badges}>
          <Text style={styles.sectionTitle}>Tier Badges (use in cards/profiles)</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badgeItem}>
              <TierBadge level={selectedLevel} size="small" />
              <Text style={styles.badgeLabel}>Small</Text>
            </View>
            <View style={styles.badgeItem}>
              <TierBadge level={selectedLevel} size="medium" />
              <Text style={styles.badgeLabel}>Medium</Text>
            </View>
            <View style={styles.badgeItem}>
              <TierBadge level={selectedLevel} size="large" />
              <Text style={styles.badgeLabel}>Large</Text>
            </View>
            <View style={styles.badgeItem}>
              <TierBadge level={selectedLevel} size="medium" showLevel={false} />
              <Text style={styles.badgeLabel}>No Level</Text>
            </View>
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.sectionTitle}>Near-Tier Banner (when close)</Text>
          <TierUpgradeBanner
            currentLevel={selectedLevel}
            onViewDetails={() => console.log('View details')}
          />
        </View>

        <View style={styles.tiersList}>
          <Text style={styles.sectionTitle}>All Tiers - Tap to Preview Ceremony</Text>
          {ASCENSION_TIERS.map((tier, index) => (
            <TouchableOpacity
              key={tier.id}
              style={styles.tierCard}
              onPress={() => handleTierPreview(tier.id)}
            >
              <LinearGradient
                colors={[tier.theme.gradientStart, tier.theme.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tierGradient}
              >
                <View style={styles.tierHeader}>
                  <View>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierLevels}>
                      Levels {tier.minLevel}-{tier.maxLevel}
                    </Text>
                  </View>
                  <ChevronRight size={24} color="#FFFFFF" />
                </View>

                <View style={styles.tierBenefits}>
                  <View style={styles.benefitRow}>
                    <Text style={styles.benefitText}>⚡ {tier.xpMultiplier}x XP</Text>
                    <Text style={styles.benefitText}>💰 {tier.platformFee}% Fee</Text>
                  </View>
                  <View style={styles.benefitRow}>
                    <Text style={styles.benefitText}>🎯 {tier.priorityMatching}</Text>
                    <Text style={styles.benefitText}>
                      🎨 {tier.effects.holographic ? 'Holographic' : 'Standard'}
                    </Text>
                  </View>
                </View>

                <View style={styles.tierPerks}>
                  {tier.perks.slice(0, 2).map((perk, perkIndex) => (
                    <Text key={perkIndex} style={styles.perkText} numberOfLines={1}>
                      • {perk}
                    </Text>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎮 This tier system creates slot-machine-level addiction
          </Text>
          <Text style={styles.footerSubtext}>
            Near-tier glow → FOMO → Task completion → Ceremony → Dopamine → Repeat
          </Text>
        </View>
      </ScrollView>

      {showCeremony && ceremonyTier && (
        <AscensionCeremony
          tier={ceremonyTier}
          newLevel={ceremonyTier.minLevel}
          onComplete={() => setShowCeremony(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  levelSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  levelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  levelButtonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  levelButtonTextActive: {
    color: '#FFFFFF',
  },
  currentStats: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  compact: {
    marginBottom: 24,
  },
  badges: {
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeItem: {
    alignItems: 'center',
    gap: 8,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  banner: {
    marginBottom: 24,
  },
  tiersList: {
    marginBottom: 24,
  },
  tierCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tierGradient: {
    padding: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tierLevels: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  tierBenefits: {
    marginBottom: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  tierPerks: {
    marginTop: 8,
  },
  perkText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});
