import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export type ShareableContent = {
  type: 'level-up' | 'badge' | 'quest' | 'streak' | 'referral';
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
};

export const shareAchievement = async (content: ShareableContent): Promise<boolean> => {
  try {
    const shareMessage = `${content.message}\n\nJoin me on HustleXP! ${content.url || 'https://hustlexp.app'}`;

    const result = await Share.share({
      title: content.title,
      message: shareMessage,
      url: content.url,
    });

    if (result.action === Share.sharedAction) {
      console.log('[Viral] Content shared successfully:', content.type);
      return true;
    } else if (result.action === Share.dismissedAction) {
      console.log('[Viral] Share dismissed');
      return false;
    }
    return false;
  } catch (error) {
    console.error('[Viral] Share error:', error);
    return false;
  }
};

export const copyReferralLink = async (referralCode: string): Promise<boolean> => {
  try {
    const referralUrl = `https://hustlexp.app/join?ref=${referralCode}`;
    await Clipboard.setStringAsync(referralUrl);
    console.log('[Viral] Referral link copied:', referralUrl);
    return true;
  } catch (error) {
    console.error('[Viral] Copy error:', error);
    return false;
  }
};

export const generateShareableText = (
  type: ShareableContent['type'],
  data: Record<string, any>
): string => {
  switch (type) {
    case 'level-up':
      return `🎉 Just hit Level ${data.level} on HustleXP! ${data.xp} XP earned! 💪`;
    case 'badge':
      return `🏆 Unlocked the "${data.badgeName}" badge on HustleXP! ${data.description}`;
    case 'quest':
      return `✅ Completed ${data.questCount} quests on HustleXP! Earning ${data.gritCoins} GritCoins! 🪙`;
    case 'streak':
      return `🔥 ${data.streakDays} day streak on HustleXP! Can't stop, won't stop! 💯`;
    case 'referral':
      return `Join me on HustleXP and earn ${data.bonusXP} bonus XP! Use my code: ${data.referralCode}`;
    default:
      return 'Check out HustleXP - the gamified gig economy app!';
  }
};

export const trackShare = async (
  contentType: ShareableContent['type'],
  success: boolean
): Promise<void> => {
  console.log('[Analytics] Share tracked:', {
    contentType,
    success,
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
  });
};

export const generateSocialMediaLinks = (content: ShareableContent) => {
  const encodedMessage = encodeURIComponent(content.message);
  const encodedUrl = encodeURIComponent(content.url || 'https://hustlexp.app');

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(content.title)}`,
  };
};
