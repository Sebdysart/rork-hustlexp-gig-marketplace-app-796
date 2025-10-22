import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Download, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import Badge3D from './Badge3D';
import { triggerHaptic } from '@/utils/haptics';

interface BadgeShareCardProps {
  badge: {
    icon: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  userName: string;
  onClose: () => void;
}

export default function BadgeShareCard({
  badge,
  userName,
  onClose,
}: BadgeShareCardProps) {
  const handleShare = async () => {
    triggerHaptic('medium');
    
    const message = `🎉 I just unlocked the "${badge.name}" badge on HustleXP! ${badge.description} #HustleXP #Achiever`;
    
    try {
      await Share.share({
        message,
        title: `${badge.name} Badge Unlocked!`,
      });
      triggerHaptic('success');
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleDownload = async () => {
    triggerHaptic('medium');
    triggerHaptic('success');
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            triggerHaptic('light');
            onClose();
          }}
        >
          <X size={24} color={Colors.text} />
        </TouchableOpacity>

        <LinearGradient
          colors={[
            premiumColors.neonViolet + '20',
            Colors.surface,
            premiumColors.neonAmber + '20',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>ACHIEVEMENT UNLOCKED</Text>
          </View>

          <View style={styles.badgeContainer}>
            <Badge3D
              icon={badge.icon}
              rarity={badge.rarity}
              unlocked={true}
              size="large"
              animated={true}
              glowing={true}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            
            <View style={styles.rarityContainer}>
              <LinearGradient
                colors={[premiumColors.neonAmber, premiumColors.neonViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rarityBadge}
              >
                <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.userContainer}>
            <Text style={styles.userText}>Earned by</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Share2 size={20} color="#fff" />
                <Text style={styles.actionText}>Share</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownload}
            >
              <LinearGradient
                colors={[premiumColors.neonAmber, premiumColors.neonViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Download size={20} color="#fff" />
                <Text style={styles.actionText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>HustleXP</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
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
  cardGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 24,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: premiumColors.neonAmber + '30',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '900' as const,
    color: premiumColors.neonAmber,
    letterSpacing: 2,
  },
  badgeContainer: {
    marginVertical: 16,
  },
  infoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  badgeName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  rarityContainer: {
    marginTop: 8,
  },
  rarityBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '900' as const,
    color: '#fff',
    letterSpacing: 2,
  },
  userContainer: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
    width: '100%',
  },
  userText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  watermark: {
    marginTop: 8,
  },
  watermarkText: {
    fontSize: 10,
    color: Colors.textSecondary,
    opacity: 0.5,
  },
});
