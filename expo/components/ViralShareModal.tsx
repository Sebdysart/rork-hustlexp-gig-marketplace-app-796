import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Twitter, Facebook, Linkedin, MessageCircle, Copy, CheckCircle2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { Analytics } from '@/utils/analytics';

const { width } = Dimensions.get('window');

export interface ShareContent {
  title: string;
  message: string;
  image?: string;
  hashtags?: string[];
  url?: string;
}

interface ViralShareModalProps {
  visible: boolean;
  onClose: () => void;
  content: ShareContent;
  achievement?: {
    icon: string;
    title: string;
    description: string;
    rarity?: string;
  };
}

export default function ViralShareModal({
  visible,
  onClose,
  content,
  achievement,
}: ViralShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: 'native' | 'twitter' | 'facebook' | 'linkedin' | 'copy') => {
    triggerHaptic('medium');

    const shareText = `${content.message}\n\n${content.hashtags?.map(h => `#${h}`).join(' ') || ''}`;
    const shareUrl = content.url || 'https://hustlexp.app';

    try {
      if (platform === 'native') {
        if (Platform.OS === 'web') {
          await navigator.share({
            title: content.title,
            text: shareText,
            url: shareUrl,
          });
        } else {
          await Share.share({
            title: content.title,
            message: `${shareText}\n${shareUrl}`,
          });
        }
      } else if (platform === 'copy') {
        await Clipboard.setStringAsync(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        Alert.alert('Copied!', 'Share text copied to clipboard');
      } else {
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(shareUrl);

        let url = '';
        if (platform === 'twitter') {
          url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        } else if (platform === 'facebook') {
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        } else if (platform === 'linkedin') {
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        }

        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        }
      }

      await Analytics.trackEvent({
        type: 'share',
        data: {
          platform,
          contentType: achievement ? 'achievement' : 'generic',
          achievementTitle: achievement?.title,
        },
      });

      triggerHaptic('success');
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <GlassCard variant="darkStrong" style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Share Your Achievement 🎉</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
            >
              {achievement && (
                <GlassCard variant="dark" style={styles.achievementCard}>
                  <LinearGradient
                    colors={[premiumColors.neonViolet + '30', premiumColors.neonCyan + '30']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.achievementGradient}
                  >
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    {achievement.rarity && (
                      <View style={styles.rarityBadge}>
                        <Text style={styles.rarityText}>{achievement.rarity}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </GlassCard>
              )}

              <Text style={styles.sectionTitle}>Share to</Text>

              <View style={styles.platformsGrid}>
                <TouchableOpacity
                  style={styles.platformButton}
                  onPress={() => handleShare('native')}
                >
                  <View style={[styles.platformIcon, { backgroundColor: premiumColors.neonViolet + '20' }]}>
                    <MessageCircle size={24} color={premiumColors.neonViolet} />
                  </View>
                  <Text style={styles.platformLabel}>Share</Text>
                </TouchableOpacity>

                {Platform.OS === 'web' && (
                  <>
                    <TouchableOpacity
                      style={styles.platformButton}
                      onPress={() => handleShare('twitter')}
                    >
                      <View style={[styles.platformIcon, { backgroundColor: '#1DA1F220' }]}>
                        <Twitter size={24} color="#1DA1F2" />
                      </View>
                      <Text style={styles.platformLabel}>Twitter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.platformButton}
                      onPress={() => handleShare('facebook')}
                    >
                      <View style={[styles.platformIcon, { backgroundColor: '#1877F220' }]}>
                        <Facebook size={24} color="#1877F2" />
                      </View>
                      <Text style={styles.platformLabel}>Facebook</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.platformButton}
                      onPress={() => handleShare('linkedin')}
                    >
                      <View style={[styles.platformIcon, { backgroundColor: '#0A66C220' }]}>
                        <Linkedin size={24} color="#0A66C2" />
                      </View>
                      <Text style={styles.platformLabel}>LinkedIn</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={styles.platformButton}
                  onPress={() => handleShare('copy')}
                >
                  <View style={[styles.platformIcon, { backgroundColor: premiumColors.neonCyan + '20' }]}>
                    {copied ? (
                      <CheckCircle2 size={24} color={premiumColors.neonGreen} />
                    ) : (
                      <Copy size={24} color={premiumColors.neonCyan} />
                    )}
                  </View>
                  <Text style={styles.platformLabel}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              <GlassCard variant="dark" style={styles.rewardCard}>
                <Text style={styles.rewardTitle}>🎁 Share Rewards</Text>
                <Text style={styles.rewardText}>
                  Earn 50 XP when someone joins using your share!
                </Text>
              </GlassCard>

              <Text style={styles.previewTitle}>Preview:</Text>
              <GlassCard variant="dark" style={styles.previewCard}>
                <Text style={styles.previewText}>{content.message}</Text>
                {content.hashtags && content.hashtags.length > 0 && (
                  <Text style={styles.previewHashtags}>
                    {content.hashtags.map(h => `#${h}`).join(' ')}
                  </Text>
                )}
              </GlassCard>
            </ScrollView>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    maxHeight: '80%',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 500,
  },
  achievementCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  achievementIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  rarityBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: premiumColors.neonAmber,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  platformButton: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  platformIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  rewardCard: {
    padding: 16,
    marginBottom: 20,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  previewCard: {
    padding: 16,
  },
  previewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  previewHashtags: {
    fontSize: 13,
    color: premiumColors.neonCyan,
    fontWeight: '600' as const,
  },
});
