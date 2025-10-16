import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Search, Star, Lock, CheckCircle, Sparkles, Trophy } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { Badge } from '@/types';
import { getRarityColor } from '@/utils/gamification';
import { BADGES } from '@/constants/badges';
import { Stack } from 'expo-router';

export default function BadgeLibraryScreen() {
  const { currentUser, updateUser } = useApp();
  type ExtendedBadge = Badge & { unlocked: boolean; showcased: boolean };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<ExtendedBadge | null>(null);
  const [showcaseMode, setShowcaseMode] = useState<boolean>(false);

  if (!currentUser) {
    return null;
  }

  const userBadgeIds = currentUser.badges.map(b => b.id);
  const showcasedBadgeIds = currentUser.showcasedBadges || [];

  const allBadges: ExtendedBadge[] = BADGES.map(badge => ({
    ...badge,
    unlocked: userBadgeIds.includes(badge.id),
    showcased: showcasedBadgeIds.includes(badge.id),
  }));

  const filteredBadges = allBadges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return matchesSearch && matchesRarity;
  });

  const unlockedCount = allBadges.filter(b => b.unlocked).length;
  const totalCount = allBadges.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  const handleBadgePress = (badge: ExtendedBadge) => {
    triggerHaptic('medium');
    setSelectedBadge(badge);
  };

  const handleToggleShowcase = async (badgeId: string): Promise<void> => {
    if (!currentUser) return;

    const currentShowcased = currentUser.showcasedBadges || [];
    let newShowcased: string[];

    if (currentShowcased.includes(badgeId)) {
      newShowcased = currentShowcased.filter(id => id !== badgeId);
      triggerHaptic('light');
    } else {
      if (currentShowcased.length >= 6) {
        Alert.alert('Showcase Full', 'You can only showcase up to 6 badges. Remove one first.');
        triggerHaptic('error');
        return;
      }
      newShowcased = [...currentShowcased, badgeId];
      triggerHaptic('success');
    }

    await updateUser({
      ...currentUser,
      showcasedBadges: newShowcased,
    });
  };

  const rarities = ['all', 'common', 'rare', 'epic', 'legendary'];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Badge Library',
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
                  <Text style={styles.statsTitle}>Collection Progress</Text>
                  <Text style={styles.statsSubtitle}>
                    {unlockedCount} / {totalCount} Badges Unlocked
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
            <View style={styles.showcaseHeader}>
              <View style={styles.showcaseHeaderLeft}>
                <Sparkles size={20} color={premiumColors.neonCyan} />
                <Text style={styles.showcaseTitle}>Showcased Badges</Text>
              </View>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => {
                  setShowcaseMode(!showcaseMode);
                  triggerHaptic('light');
                }}
              >
                <Text style={styles.manageButtonText}>
                  {showcaseMode ? 'Done' : 'Manage'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.showcaseGrid}>
              {[...Array(6)].map((_, index) => {
                const showcasedBadge = allBadges.find(b => b.id === showcasedBadgeIds[index]);
                return (
                  <View key={index} style={styles.showcaseSlot}>
                    {showcasedBadge ? (
                      <TouchableOpacity
                        style={[
                          styles.showcasedBadge,
                          { borderColor: getRarityColor(showcasedBadge.rarity) }
                        ]}
                        onPress={() => handleBadgePress(showcasedBadge)}
                      >
                        <Text style={styles.showcasedBadgeIcon}>{showcasedBadge.icon}</Text>
                        {showcaseMode && (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleToggleShowcase(showcasedBadge.id)}
                          >
                            <X size={12} color="#fff" />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptySlot}>
                        <Lock size={20} color={Colors.textSecondary} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <Text style={styles.showcaseHint}>
              {showcaseMode 
                ? 'Tap badges below to add them to your showcase' 
                : 'Tap "Manage" to customize your showcase'}
            </Text>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Search size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search badges..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {rarities.map((rarity) => (
                <TouchableOpacity
                  key={rarity}
                  style={[
                    styles.filterChip,
                    selectedRarity === rarity && styles.filterChipActive,
                    selectedRarity === rarity && rarity !== 'all' && {
                      backgroundColor: getRarityColor(rarity as any) + '30',
                      borderColor: getRarityColor(rarity as any),
                    }
                  ]}
                  onPress={() => {
                    setSelectedRarity(rarity);
                    triggerHaptic('light');
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRarity === rarity && styles.filterChipTextActive,
                    ]}
                  >
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.badgesGrid}>
            {filteredBadges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeCard,
                  !badge.unlocked && styles.badgeCardLocked,
                  badge.showcased && styles.badgeCardShowcased,
                  { borderColor: badge.unlocked ? getRarityColor(badge.rarity) : Colors.card }
                ]}
                onPress={() => {
                  if (showcaseMode && badge.unlocked) {
                    handleToggleShowcase(badge.id);
                  } else {
                    handleBadgePress(badge);
                  }
                }}
              >
                <LinearGradient
                  colors={
                    badge.unlocked
                      ? [getRarityColor(badge.rarity) + '20', getRarityColor(badge.rarity) + '05']
                      : [Colors.card, Colors.card]
                  }
                  style={styles.badgeGradient}
                >
                  <View style={styles.badgeIconContainer}>
                    <Text style={[styles.badgeIcon, !badge.unlocked && styles.badgeIconLocked]}>
                      {badge.unlocked ? badge.icon : '🔒'}
                    </Text>
                  </View>
                  <Text style={[styles.badgeName, !badge.unlocked && styles.badgeNameLocked]} numberOfLines={2}>
                    {badge.unlocked ? badge.name : '???'}
                  </Text>
                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(badge.rarity) }]}>
                    <Text style={styles.rarityText}>{badge.rarity}</Text>
                  </View>
                  {badge.showcased && (
                    <View style={styles.showcasedIndicator}>
                      <Star size={12} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                    </View>
                  )}
                  {!badge.unlocked && (
                    <View style={styles.lockedOverlay}>
                      <Lock size={24} color={Colors.textSecondary} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {filteredBadges.length === 0 && (
            <View style={styles.emptyState}>
              <Search size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No badges found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          )}
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
                <View style={styles.modalBadgeContainer}>
                  <LinearGradient
                    colors={
                      selectedBadge.unlocked
                        ? [getRarityColor(selectedBadge.rarity) + '40', getRarityColor(selectedBadge.rarity) + '10']
                        : [Colors.card, Colors.card]
                    }
                    style={styles.modalBadgeGradient}
                  >
                    <Text style={styles.modalBadgeIcon}>
                      {selectedBadge.unlocked ? selectedBadge.icon : '🔒'}
                    </Text>
                  </LinearGradient>
                </View>

                <View style={[styles.modalRarityBadge, { backgroundColor: getRarityColor(selectedBadge.rarity) }]}>
                  <Text style={styles.modalRarityText}>{selectedBadge.rarity.toUpperCase()}</Text>
                </View>

                <Text style={styles.modalBadgeName}>
                  {selectedBadge.unlocked ? selectedBadge.name : 'Locked Badge'}
                </Text>
                <Text style={styles.modalBadgeDescription}>
                  {selectedBadge.unlocked ? selectedBadge.description : 'Complete more quests to unlock this badge!'}
                </Text>

                {selectedBadge.unlocked && (
                  <TouchableOpacity
                    style={[
                      styles.showcaseButton,
                      selectedBadge.showcased && styles.showcaseButtonActive
                    ]}
                    onPress={() => {
                      handleToggleShowcase(selectedBadge.id);
                      setSelectedBadge(null);
                    }}
                  >
                    <LinearGradient
                      colors={
                        selectedBadge.showcased
                          ? [Colors.card, Colors.card]
                          : [premiumColors.neonCyan, premiumColors.neonViolet]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.showcaseButtonGradient}
                    >
                      {selectedBadge.showcased ? (
                        <CheckCircle size={20} color={Colors.text} />
                      ) : (
                        <Star size={20} color="#fff" />
                      )}
                      <Text style={styles.showcaseButtonText}>
                        {selectedBadge.showcased ? 'Showcased' : 'Add to Showcase'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
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
  showcaseSection: {
    marginBottom: 24,
  },
  showcaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  showcaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  showcaseTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  manageButton: {
    backgroundColor: premiumColors.neonCyan + '30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  showcaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  showcaseSlot: {
    width: '30%',
    aspectRatio: 1,
  },
  showcasedBadge: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  showcasedBadgeIcon: {
    fontSize: 40,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    padding: 4,
  },
  emptySlot: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.card,
    borderStyle: 'dashed' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showcaseHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
  searchSection: {
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.card,
  },
  filterChipActive: {
    backgroundColor: premiumColors.neonCyan + '30',
    borderColor: premiumColors.neonCyan,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '31%',
    aspectRatio: 0.8,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeCardShowcased: {
    shadowColor: premiumColors.neonAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeGradient: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: Colors.textSecondary,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#000',
    textTransform: 'uppercase' as const,
  },
  showcasedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 4,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    maxWidth: 400,
    alignItems: 'center',
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
  modalBadgeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
  },
  modalBadgeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBadgeIcon: {
    fontSize: 64,
  },
  modalRarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalRarityText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#000',
  },
  modalBadgeName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBadgeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  showcaseButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  showcaseButtonActive: {
    opacity: 0.8,
  },
  showcaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  showcaseButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
