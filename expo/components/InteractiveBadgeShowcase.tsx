import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Badge } from '@/types';
import { getRarityColor } from '@/utils/gamification';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';

interface InteractiveBadgeShowcaseProps {
  badges: Badge[];
}

export default function InteractiveBadgeShowcase({ badges }: InteractiveBadgeShowcaseProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const scaleAnims = useRef(badges.map(() => new Animated.Value(1))).current;

  const handleBadgePress = (badge: Badge, index: number) => {
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

    setSelectedBadge(badge);
  };

  const closeModal = () => {
    triggerHaptic('light');
    setSelectedBadge(null);
  };

  if (badges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Sparkles size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>Complete quests to earn badges!</Text>
        <Text style={styles.emptySubtext}>Your trophy collection will appear here</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {badges.map((badge, index) => (
          <TouchableOpacity
            key={badge.id}
            activeOpacity={0.9}
            onPress={() => handleBadgePress(badge, index)}
          >
            <Animated.View
              style={[
                styles.badgeCard,
                {
                  borderColor: getRarityColor(badge.rarity),
                  transform: [{ scale: scaleAnims[index] || 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={[getRarityColor(badge.rarity) + '20', getRarityColor(badge.rarity) + '05']}
                style={styles.badgeGradient}
              >
                <View style={styles.badgeIconContainer}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                </View>
                <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(badge.rarity) }]}>
                  <Text style={styles.rarityText}>{badge.rarity}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={selectedBadge !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>

            {selectedBadge && (
              <>
                <View style={styles.modalBadgeContainer}>
                  <LinearGradient
                    colors={[getRarityColor(selectedBadge.rarity) + '40', getRarityColor(selectedBadge.rarity) + '10']}
                    style={styles.modalBadgeGradient}
                  >
                    <Text style={styles.modalBadgeIcon}>{selectedBadge.icon}</Text>
                  </LinearGradient>
                </View>

                <View style={[styles.modalRarityBadge, { backgroundColor: getRarityColor(selectedBadge.rarity) }]}>
                  <Text style={styles.modalRarityText}>{selectedBadge.rarity.toUpperCase()}</Text>
                </View>

                <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>
                <Text style={styles.modalBadgeDescription}>{selectedBadge.description}</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  badgeCard: {
    width: 120,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  badgeGradient: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#000',
    textTransform: 'uppercase' as const,
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
  },
  progressContainer: {
    width: '100%',
    marginTop: 24,
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
});
