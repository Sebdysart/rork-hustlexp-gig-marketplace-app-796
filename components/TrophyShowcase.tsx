import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trophy, Sparkles, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import { Trophy as TrophyType, TrophyTier } from '@/constants/trophies';

interface TrophyShowcaseProps {
  trophies: { trophy: TrophyType; tier: TrophyTier }[];
  maxDisplay?: number;
}

export default function TrophyShowcase({ trophies, maxDisplay = 6 }: TrophyShowcaseProps) {
  const [selectedTrophy, setSelectedTrophy] = useState<{ trophy: TrophyType; tier: TrophyTier } | null>(null);
  const scaleAnims = useRef(trophies.map(() => new Animated.Value(1))).current;

  const handleTrophyPress = (trophy: { trophy: TrophyType; tier: TrophyTier }, index: number) => {
    triggerHaptic('medium');
    
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedTrophy(trophy);
  };

  const closeModal = () => {
    triggerHaptic('light');
    setSelectedTrophy(null);
  };

  const displayedTrophies = trophies.slice(0, maxDisplay);
  const emptySlots = Math.max(0, maxDisplay - displayedTrophies.length);

  if (trophies.length === 0 && maxDisplay === 6) {
    return (
      <View style={styles.emptyContainer}>
        <Trophy size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>No trophies earned yet!</Text>
        <Text style={styles.emptySubtext}>Complete more quests to unlock trophies</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.showcaseContainer}>
        <View style={styles.trophyGrid}>
          {displayedTrophies.map((item, index) => (
            <TouchableOpacity
              key={`${item.trophy.id}-${item.tier.tier}`}
              activeOpacity={0.9}
              onPress={() => handleTrophyPress(item, index)}
            >
              <Animated.View
                style={[
                  styles.trophyCard,
                  {
                    borderColor: item.tier.color,
                    transform: [{ scale: scaleAnims[index] || 1 }],
                    shadowColor: item.tier.glow,
                  },
                ]}
              >
                <LinearGradient
                  colors={[item.tier.color + '30', item.tier.color + '10']}
                  style={styles.trophyGradient}
                >
                  <View style={styles.trophyIconContainer}>
                    <Text style={styles.trophyIcon}>{item.tier.model}</Text>
                  </View>
                  <Text style={styles.trophyName} numberOfLines={1}>
                    {item.trophy.name}
                  </Text>
                  <View style={[styles.tierBadge, { backgroundColor: item.tier.color }]}>
                    <Text style={styles.tierText}>{item.tier.tier.toUpperCase()}</Text>
                  </View>
                  <View style={styles.glowEffect}>
                    <Sparkles size={12} color={item.tier.color} />
                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          ))}
          
          {[...Array(emptySlots)].map((_, index) => (
            <View key={`empty-${index}`} style={styles.emptySlot}>
              <Lock size={24} color={Colors.textSecondary} />
              <Text style={styles.emptySlotText}>Locked</Text>
            </View>
          ))}
        </View>
      </View>

      <Modal
        visible={selectedTrophy !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>

            {selectedTrophy && (
              <>
                <View style={styles.modalTrophyContainer}>
                  <LinearGradient
                    colors={[selectedTrophy.tier.color + '50', selectedTrophy.tier.color + '20']}
                    style={styles.modalTrophyGradient}
                  >
                    <Text style={styles.modalTrophyIcon}>{selectedTrophy.tier.model}</Text>
                    <View style={styles.modalGlowRing} />
                  </LinearGradient>
                </View>

                <View style={[styles.modalTierBadge, { backgroundColor: selectedTrophy.tier.color }]}>
                  <Text style={styles.modalTierText}>{selectedTrophy.tier.tier.toUpperCase()} TIER</Text>
                </View>

                <Text style={styles.modalTrophyName}>{selectedTrophy.trophy.name}</Text>
                <Text style={styles.modalTrophyDescription}>{selectedTrophy.trophy.description}</Text>

                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Category</Text>
                    <Text style={styles.modalStatValue}>
                      {selectedTrophy.trophy.category.charAt(0).toUpperCase() + selectedTrophy.trophy.category.slice(1)}
                    </Text>
                  </View>
                  {selectedTrophy.trophy.genre && (
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Genre</Text>
                      <Text style={styles.modalStatValue}>
                        {selectedTrophy.trophy.genre.charAt(0).toUpperCase() + selectedTrophy.trophy.genre.slice(1)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Requirement</Text>
                    <Text style={styles.modalStatValue}>{selectedTrophy.tier.requirement}</Text>
                  </View>
                </View>

                <View style={styles.allTiersSection}>
                  <Text style={styles.allTiersTitle}>All Tiers</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.allTiersScroll}>
                    {selectedTrophy.trophy.tiers.map((tier) => (
                      <View
                        key={tier.tier}
                        style={[
                          styles.miniTierCard,
                          tier.tier === selectedTrophy.tier.tier && styles.miniTierCardActive,
                          { borderColor: tier.color },
                        ]}
                      >
                        <Text style={styles.miniTierIcon}>{tier.model}</Text>
                        <Text style={styles.miniTierName}>{tier.tier}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  showcaseContainer: {
    width: '100%',
  },
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trophyCard: {
    width: '31%',
    aspectRatio: 0.85,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  trophyGradient: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  trophyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  trophyIcon: {
    fontSize: 36,
  },
  trophyName: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 8,
    fontWeight: '800' as const,
    color: '#000',
  },
  glowEffect: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptySlot: {
    width: '31%',
    aspectRatio: 0.85,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.card,
    borderStyle: 'dashed' as const,
    backgroundColor: Colors.card + '30',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptySlotText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    maxWidth: 400,
    maxHeight: '85%',
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
  modalTrophyContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  modalTrophyGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTrophyIcon: {
    fontSize: 80,
  },
  modalGlowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: premiumColors.neonAmber + '50',
  },
  modalTierBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTierText: {
    fontSize: 13,
    fontWeight: '900' as const,
    color: '#000',
    letterSpacing: 1,
  },
  modalTrophyName: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalTrophyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalStats: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  modalStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  modalStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  modalStatValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  allTiersSection: {
    width: '100%',
  },
  allTiersTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  allTiersScroll: {
    gap: 8,
  },
  miniTierCard: {
    width: 60,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  miniTierCardActive: {
    backgroundColor: premiumColors.neonCyan + '20',
  },
  miniTierIcon: {
    fontSize: 24,
  },
  miniTierName: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.text,
    textTransform: 'uppercase' as const,
  },
});
