import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Copy, Share2, Users, CheckCircle2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { generateReferralCode } from '@/constants/referrals';
import { generateReferralLink } from '@/utils/deepLinking';
import { trackViralAction } from '@/utils/viralIncentives';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';

interface InviteFriendsWidgetProps {
  userId: string;
  userName?: string;
  variant?: 'full' | 'compact';
}

export default function InviteFriendsWidget({
  userId,
  userName,
  variant = 'full',
}: InviteFriendsWidgetProps) {
  const translations = useTranslatedTexts([
    'Invite Friends', 'Earn rewards together', 'Earn rewards when they join',
    '100 Grit', '50 XP', '$10 Credit', 'Your Code', 'Copied!', 'Copy', 'Share',
    'View referral program details', 'Join HustleXP', 'Hey! Join me on HustleXP and earn money doing tasks. Use my code',
    'to get bonus rewards!', 'Share link copied to clipboard'
  ]);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const referralCode = generateReferralCode(userId);

  const handleCopyCode = async () => {
    triggerHaptic('medium');
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    await trackViralAction({
      type: 'share',
      platform: 'clipboard',
      contentId: 'referral_code',
    });
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    const link = generateReferralLink(referralCode, userName);
    const message = `${translations[12]} ${referralCode} ${translations[13]}\n\n${link}`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: translations[11],
            text: message,
          });
        } else {
          await Clipboard.setStringAsync(message);
          Alert.alert(translations[7], translations[14]);
        }
      } else {
        await Share.share({
          message,
          title: translations[11],
        });
      }

      await trackViralAction({
        type: 'share',
        platform: Platform.OS === 'web' ? 'web' : 'native',
        contentId: 'referral_invite',
        referralCode,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleViewDetails = () => {
    triggerHaptic('light');
    router.push('/referrals');
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={handleViewDetails} activeOpacity={0.9}>
        <GlassCard variant="dark" style={styles.compactContainer}>
          <LinearGradient
            colors={[premiumColors.neonViolet + '20', premiumColors.neonCyan + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.compactGradient}
          >
            <View style={styles.compactContent}>
              <View style={styles.compactIcon}>
                <Gift size={20} color={premiumColors.neonViolet} />
              </View>
              <View style={styles.compactTextContainer}>
                <Text style={styles.compactTitle}>{translations[0]}</Text>
                <Text style={styles.compactSubtitle}>{translations[1]}</Text>
              </View>
              <Users size={16} color={Colors.textSecondary} />
            </View>
          </LinearGradient>
        </GlassCard>
      </TouchableOpacity>
    );
  }

  return (
    <GlassCard variant="dark" style={styles.container}>
      <LinearGradient
        colors={[premiumColors.neonViolet + '15', premiumColors.neonCyan + '15']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Gift size={24} color={premiumColors.neonViolet} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{translations[0]}</Text>
            <Text style={styles.subtitle}>{translations[2]}</Text>
          </View>
        </View>

        <View style={styles.rewardSection}>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>⚡</Text>
            <Text style={styles.rewardText}>{translations[3]}</Text>
          </View>
          <View style={styles.rewardDivider} />
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>✨</Text>
            <Text style={styles.rewardText}>{translations[4]}</Text>
          </View>
          <View style={styles.rewardDivider} />
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>💰</Text>
            <Text style={styles.rewardText}>{translations[5]}</Text>
          </View>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>{translations[6]}</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{referralCode}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.copyButton]}
            onPress={handleCopyCode}
          >
            {copied ? (
              <>
                <CheckCircle2 size={18} color={premiumColors.neonGreen} />
                <Text style={[styles.actionButtonText, { color: premiumColors.neonGreen }]}>
                  {translations[7]}
                </Text>
              </>
            ) : (
              <>
                <Copy size={18} color={premiumColors.neonCyan} />
                <Text style={styles.actionButtonText}>{translations[8]}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <Share2 size={18} color={premiumColors.neonViolet} />
            <Text style={styles.actionButtonText}>{translations[9]}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.detailsLink} onPress={handleViewDetails}>
          <Text style={styles.detailsLinkText}>{translations[10]}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: premiumColors.neonViolet + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rewardSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: premiumColors.richBlack + '80',
    borderRadius: 12,
  },
  rewardItem: {
    alignItems: 'center',
    gap: 4,
  },
  rewardEmoji: {
    fontSize: 20,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  rewardDivider: {
    width: 1,
    height: 32,
    backgroundColor: premiumColors.glassWhite,
    opacity: 0.2,
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  codeContainer: {
    backgroundColor: premiumColors.richBlack,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  code: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
    letterSpacing: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  copyButton: {
    backgroundColor: premiumColors.neonCyan + '15',
    borderColor: premiumColors.neonCyan,
  },
  shareButton: {
    backgroundColor: premiumColors.neonViolet + '15',
    borderColor: premiumColors.neonViolet,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  detailsLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailsLinkText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
    textDecorationLine: 'underline',
  },
  compactContainer: {
    marginBottom: 12,
  },
  compactGradient: {
    padding: 12,
    borderRadius: 12,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonViolet + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  compactSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
