import { Platform, Share } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export async function shareAchievement(achievement: {
  type: 'level_up' | 'badge_earned' | 'streak' | 'quest_completed';
  data: {
    level?: number;
    badgeName?: string;
    streakDays?: number;
    questsCompleted?: number;
  };
}) {
  let message = '';
  let url = 'https://hustlexp.app';

  switch (achievement.type) {
    case 'level_up':
      message = `🎉 I just leveled up to Level ${achievement.data.level} on HustleXP! Join me in the ultimate gig marketplace adventure! #HustleXP #LevelUp`;
      break;
    case 'badge_earned':
      message = `🏆 I earned the "${achievement.data.badgeName}" badge on HustleXP! #HustleXP #Achievement`;
      break;
    case 'streak':
      message = `🔥 ${achievement.data.streakDays} day streak on HustleXP! I'm on fire! #HustleXP #Streak`;
      break;
    case 'quest_completed':
      message = `✅ Completed ${achievement.data.questsCompleted} quests on HustleXP! #HustleXP #Hustle`;
      break;
  }

  if (Platform.OS === 'web') {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
    await WebBrowser.openBrowserAsync(twitterUrl);
  } else {
    try {
      await Share.share({
        message: `${message}\n\n${url}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }
}

export async function shareToTwitter(text: string) {
  const url = 'https://hustlexp.app';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  if (Platform.OS === 'web') {
    await WebBrowser.openBrowserAsync(twitterUrl);
  } else {
    await WebBrowser.openBrowserAsync(twitterUrl);
  }
}
