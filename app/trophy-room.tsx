import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Award, X, TrendingUp, Lock } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { Stack } from 'expo-router';
import { TROPHIES, getTrophyProgress, getAllUnlockedTrophies, Trophy as TrophyType, TrophyTier } from '@/constants/trophies';
import TrophyShowcase from '@/components/TrophyShowcase';

export default function TrophyRoomScreen() {
  const { currentUser } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTrophy, setSelectedTrophy] = useState<{ trophy: TrophyType; tier: TrophyTier | null; progress: number; nextTier: TrophyTier | null } | null>(null);

  if (!currentUser) {
    return null;
  }

  const unlockedTrophies = getAllUnlockedTrophies(currentUser);
  const totalTrophies = TROPHIES.length;
  const unlockedCount = unlockedTrophies.length;
  const completionPercentage = (unlockedCount / totalTrophies) * 100;

  const categories = ['all', 'milestone', 'genre', 'achievement', 'prestige'];

  const filteredTrophies = selectedCategory === 'all'
    ? TROPHIES
    : TROPHIES.filter(t => t.category === selectedCategory);

  const handleTrophyPress = (trophy: TrophyType) => {
    triggerHaptic('medium');
    const progress = getTrophyProgress(currentUser, trophy.id);
    setSelectedTrophy({ trophy, tier: progress.currentTier, progress: progress.progress, nextTier: progress.nextTier });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Trophy Room',
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
              colors={[premiumColors.neonAmber + '25', premiumColors.neonViolet + '25']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
              <View style={styles.statsHeader}>
                <Trophy size={40} color={premiumColors.neonAmber} />
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsTitle}>Trophy Collection</Text>
                  <Text style={styles.statsSubtitle}>
                    {unlockedCount} / {totalTrophies} Trophies Unlocked
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

          <View style={styles.showcaseSection}>
            <Text style={styles.sectionTitle}>🏆 Featured Trophies</Text>
            <TrophyShowcase trophies={unlockedTrophies} maxDisplay={6} />
          </View>

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

          <View style={styles.trophiesSection}>
            <Text style={styles.sectionTitle}>All Trophies</Text>
            {filteredTrophies.map((trophy) => {
              const { currentTier, progress, nextTier, isUnlocked } = getTrophyProgress(currentUser, trophy.id);
              
              return (
                <TouchableOpacity
                  key={trophy.id}
                  style={[
                    styles.trophyListCard,
                    !isUnlocked && styles.trophyListCardLocked,
                  ]}
                  onPress={() => handleTrophyPress(trophy)}
                >
                  <LinearGradient
                    colors={
                      currentTier
                        ? [currentTier.color + '25', currentTier.color + '10']
                        : [Colors.card, Colors.card]
                    }
                    style={styles.trophyListGradient}
                  >
                    <View style={styles.trophyListLeft}>
                      <View style={[
                        styles.trophyListIconContainer,
                        currentTier && { borderColor: currentTier.color },
                      ]}>
                        <Text style={[styles.trophyListIcon, !isUnlocked && styles.trophyListIconLocked]}>
                          {currentTier ? currentTier.model : '🔒'}
                        </Text>
                      </View>
                      <View style={styles.trophyListInfo}>
                        <Text style={[styles.trophyListName, !isUnlocked && styles.trophyListNameLocked]}>
                          {trophy.name}
                        </Text>
                        <Text style={styles.trophyListDescription} numberOfLines={1}>
                          {trophy.description}
                        </Text>
                        {currentTier && (
                          <View style={[styles.trophyListTierBadge, { backgroundColor: currentTier.color }]}>
                            <Text style={styles.trophyListTierText}>{currentTier.tier.toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    {nextTier && (
                      <View style={styles.trophyListProgress}>
                        <View style={styles.progressBarSmall}>
                          <LinearGradient
                            colors={[nextTier.color, nextTier.color + '80']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFillSmall, { width: `${progress}%` }]}
                          />
                        </View>
                        <Text style={styles.progressTextSmall}>{progress.toFixed(0)}%</Text>
                      </View>
                    )}

                    {!isUnlocked && (
                      <View style={styles.lockedBadge}>
                        <Lock size={16} color={Colors.textSecondary} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={selectedTrophy !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTrophy(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedTrophy(null);
                triggerHaptic('light');
              }}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>

            {selectedTrophy && (
              <>
                <View style={styles.modalHeader}>
                  <Award size={32} color={premiumColors.neonAmber} />
                  <Text style={styles.modalTitle}>{selectedTrophy.trophy.name}</Text>
                </View>

                <Text style={styles.modalDescription}>{selectedTrophy.trophy.description}</Text>

                <View style={styles.tiersSection}>
                  <Text style={styles.tiersSectionTitle}>All Tiers</Text>
                  {selectedTrophy.trophy.tiers.map((tier) => {
                    const isUnlocked = selectedTrophy.tier && 
                      selectedTrophy.trophy.tiers.indexOf(tier) <= 
                      selectedTrophy.trophy.tiers.indexOf(selectedTrophy.tier);
                    const isCurrent = selectedTrophy.tier?.tier === tier.tier;

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
                              ? [tier.color + '25', tier.color + '10']
                              : [Colors.card, Colors.card]
                          }
                          style={styles.tierItemGradient}
                        >
                          <View style={styles.tierItemLeft}>
                            <Text style={[styles.tierIcon, !isUnlocked && styles.tierIconLocked]}>
                              {isUnlocked ? tier.model : '🔒'}
                            </Text>
                            <View>
                              <Text style={[styles.tierName, !isUnlocked && styles.tierNameLocked]}>
                                {tier.tier.toUpperCase()} Tier
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
    padding: 24,
    borderRadius: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  statsTextContainer: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: Colors.card,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'right',
  },
  showcaseSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
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
  trophiesSection: {
    gap: 12,
  },
  trophyListCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  trophyListCardLocked: {
    opacity: 0.7,
  },
  trophyListGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  trophyListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trophyListIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyListIcon: {
    fontSize: 32,
  },
  trophyListIconLocked: {
    opacity: 0.5,
  },
  trophyListInfo: {
    flex: 1,
    gap: 4,
  },
  trophyListName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  trophyListNameLocked: {
    color: Colors.textSecondary,
  },
  trophyListDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trophyListTierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  trophyListTierText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#000',
  },
  trophyListProgress: {
    width: 80,
    gap: 4,
  },
  progressBarSmall: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
  },
  progressTextSmall: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'right',
  },
  lockedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
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
