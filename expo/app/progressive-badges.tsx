import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trophy, Award, TrendingUp } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { Stack } from 'expo-router';
import { PROGRESSIVE_BADGES, getBadgeProgress, getAllUnlockedBadges, ProgressiveBadge, BadgeTier } from '@/constants/badgeProgression';
import ProgressiveBadgeCard from '@/components/ProgressiveBadgeCard';

export default function ProgressiveBadgesScreen() {
  const { currentUser } = useApp();
  const [selectedBadge, setSelectedBadge] = useState<{ badge: ProgressiveBadge; tier: BadgeTier | null } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!currentUser) {
    return null;
  }

  const unlockedBadges = getAllUnlockedBadges(currentUser);
  const totalTiers = PROGRESSIVE_BADGES.reduce((sum, badge) => sum + badge.tiers.length, 0);
  const unlockedTiers = unlockedBadges.length;
  const completionPercentage = (unlockedTiers / totalTiers) * 100;

  const categories = ['all', ...new Set(PROGRESSIVE_BADGES.map(b => b.category))];

  const filteredBadges = selectedCategory === 'all'
    ? PROGRESSIVE_BADGES
    : PROGRESSIVE_BADGES.filter(b => b.category === selectedCategory);

  const handleBadgePress = (badge: ProgressiveBadge) => {
    triggerHaptic('medium');
    const { currentTier } = getBadgeProgress(currentUser, badge.id);
    const tier = badge.tiers.find(t => t.tier === currentTier) || null;
    setSelectedBadge({ badge, tier });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Progressive Badges',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <GlassCard variant="darkStrong" neonBorder glowColor="neonAmber" style={styles.statsCard}>
            <LinearGradient
              colors={[premiumColors.neonAmber + '20', premiumColors.neonViolet + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
              <View style={styles.statsHeader}>
                <Trophy size={32} color={premiumColors.neonAmber} />
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsTitle}>Badge Progression</Text>
                  <Text style={styles.statsSubtitle}>
                    {unlockedTiers} / {totalTiers} Tiers Unlocked
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[premiumColors.neonAmber, premiumColors.neonViolet]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${completionPercentage}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{completionPercentage.toFixed(0)}% Complete</Text>
            </LinearGradient>
          </GlassCard>

          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    triggerHaptic('light');
                  }}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.badgesSection}>
            {filteredBadges.map((badge) => (
              <ProgressiveBadgeCard
                key={badge.id}
                badge={badge}
                user={currentUser}
                onPress={() => handleBadgePress(badge)}
              />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={selectedBadge !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedBadge(null);
                triggerHaptic('light');
              }}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>

            {selectedBadge && (
              <>
                <View style={styles.modalHeader}>
                  <Award size={32} color={premiumColors.neonAmber} />
                  <Text style={styles.modalTitle}>{selectedBadge.badge.baseName}</Text>
                </View>

                <Text style={styles.modalDescription}>{selectedBadge.badge.description}</Text>

                <View style={styles.tiersSection}>
                  <Text style={styles.tiersSectionTitle}>All Tiers</Text>
                  {selectedBadge.badge.tiers.map((tier) => {
                    const { currentTier } = getBadgeProgress(currentUser, selectedBadge.badge.id);
                    const isUnlocked = tier.tier <= currentTier;
                    const isCurrent = tier.tier === currentTier;

                    return (
                      <View
                        key={tier.tier}
                        style={[
                          styles.tierItem,
                          isUnlocked && { borderColor: tier.color },
                          isCurrent && styles.currentTierItem,
                        ]}
                      >
                        <LinearGradient
                          colors={
                            isUnlocked
                              ? [tier.color + '20', tier.color + '05']
                              : [Colors.card, Colors.card]
                          }
                          style={styles.tierItemGradient}
                        >
                          <View style={styles.tierItemLeft}>
                            <Text style={[styles.tierIcon, !isUnlocked && styles.tierIconLocked]}>
                              {isUnlocked ? tier.icon : '🔒'}
                            </Text>
                            <View>
                              <Text style={[styles.tierName, !isUnlocked && styles.tierNameLocked]}>
                                {tier.name}
                              </Text>
                              <Text style={styles.tierRequirement}>
                                Requirement: {tier.requirement}
                              </Text>
                            </View>
                          </View>
                          {isCurrent && (
                            <View style={styles.currentBadge}>
                              <TrendingUp size={16} color={premiumColors.neonCyan} />
                            </View>
                          )}
                        </LinearGradient>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  statsCard: {
    marginBottom: 20,
    overflow: 'visible',
  },
  statsGradient: {
    padding: 20,
    borderRadius: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statsTextContainer: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.card,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'right',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.card,
  },
  categoryChipActive: {
    backgroundColor: premiumColors.neonCyan + '30',
    borderColor: premiumColors.neonCyan,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  badgesSection: {
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  tiersSection: {
    gap: 12,
  },
  tiersSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  tierItem: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  currentTierItem: {
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  tierItemGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tierIcon: {
    fontSize: 32,
  },
  tierIconLocked: {
    opacity: 0.5,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  tierNameLocked: {
    color: Colors.textSecondary,
  },
  tierRequirement: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  currentBadge: {
    backgroundColor: premiumColors.neonCyan + '30',
    borderRadius: 20,
    padding: 8,
  },
});
