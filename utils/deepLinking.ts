import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

export interface DeepLinkConfig {
  type: 'referral' | 'task' | 'profile' | 'achievement' | 'quest';
  id?: string;
  params?: Record<string, string>;
}

const APP_SCHEME = 'hustlexp';
const APP_DOMAIN = 'hustlexp.app';

export function generateDeepLink(config: DeepLinkConfig): string {
  const { type, id, params = {} } = config;

  let path = type;
  if (id) {
    path += `/${id}`;
  }

  const queryParams = new URLSearchParams(params).toString();
  const query = queryParams ? `?${queryParams}` : '';

  if (Platform.OS === 'web') {
    return `https://${APP_DOMAIN}/${path}${query}`;
  }

  return `${APP_SCHEME}://${path}${query}`;
}

export function generateReferralLink(referralCode: string, userName?: string): string {
  return generateDeepLink({
    type: 'referral',
    id: referralCode,
    params: {
      ...(userName && { from: userName }),
      utm_source: 'referral',
      utm_medium: 'share',
    },
  });
}

export function generateTaskLink(taskId: string, posterName?: string): string {
  return generateDeepLink({
    type: 'task',
    id: taskId,
    params: {
      ...(posterName && { poster: posterName }),
      utm_source: 'task_share',
    },
  });
}

export function generateProfileLink(userId: string): string {
  return generateDeepLink({
    type: 'profile',
    id: userId,
    params: {
      utm_source: 'profile_share',
    },
  });
}

export function generateAchievementLink(achievementId: string, achievementName: string): string {
  return generateDeepLink({
    type: 'achievement',
    id: achievementId,
    params: {
      name: achievementName,
      utm_source: 'achievement_share',
    },
  });
}

export async function parseDeepLink(url: string): Promise<DeepLinkConfig | null> {
  try {
    const { path, queryParams } = Linking.parse(url);
    
    if (!path) return null;

    const pathParts = path.split('/').filter(Boolean);
    const type = pathParts[0] as DeepLinkConfig['type'];
    const id = pathParts[1];

    return {
      type,
      id,
      params: queryParams as Record<string, string>,
    };
  } catch (error) {
    console.error('[DeepLink] Parse error:', error);
    return null;
  }
}

export function createShareableLink(config: DeepLinkConfig): {
  shortUrl: string;
  fullUrl: string;
  shareText: string;
} {
  const fullUrl = generateDeepLink(config);
  
  let shareText = '';
  switch (config.type) {
    case 'referral':
      shareText = `Join me on HustleXP! Use code ${config.id} to get bonus rewards. 🚀`;
      break;
    case 'task':
      shareText = `Check out this task on HustleXP! 💼`;
      break;
    case 'profile':
      shareText = `Check out my HustleXP profile! 👤`;
      break;
    case 'achievement':
      shareText = `I just unlocked this achievement on HustleXP! 🏆`;
      break;
    case 'quest':
      shareText = `Check out this quest on HustleXP! ⚔️`;
      break;
  }

  return {
    shortUrl: fullUrl,
    fullUrl,
    shareText,
  };
}

export async function openDeepLink(url: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[DeepLink] Open error:', error);
    return false;
  }
}

export function generateQRCodeUrl(deepLink: string): string {
  const encodedUrl = encodeURIComponent(deepLink);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
}
