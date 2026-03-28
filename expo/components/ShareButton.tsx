import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { shareAchievement, generateShareableText, trackShare, ShareableContent } from '@/utils/viralSharing';
import { triggerHaptic } from '@/utils/haptics';
import Colors from '@/constants/colors';

interface ShareButtonProps {
  type: ShareableContent['type'];
  data: Record<string, any>;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button';
  label?: string;
}

export default function ShareButton({ 
  type, 
  data, 
  size = 'medium', 
  variant = 'icon',
  label = 'Share'
}: ShareButtonProps) {
  const handleShare = async () => {
    triggerHaptic('medium');
    
    const message = generateShareableText(type, data);
    const content: ShareableContent = {
      type,
      title: `HustleXP Achievement`,
      message,
      url: 'https://hustlexp.app',
    };

    const success = await shareAchievement(content);
    await trackShare(type, success);

    if (success) {
      Alert.alert('Shared!', 'Your achievement has been shared successfully! 🎉');
    }
  };

  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        style={[styles.iconButton, styles[`${size}Button`]]}
        onPress={handleShare}
        accessible
        accessibilityLabel={`Share ${type}`}
        accessibilityRole="button"
      >
        <Share2 size={iconSize} color={Colors.accent} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, styles[`${size}Button`]]}
      onPress={handleShare}
      accessible
      accessibilityLabel={`Share ${type}`}
      accessibilityRole="button"
    >
      <Share2 size={iconSize} color={Colors.text} />
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  smallButton: {
    padding: 6,
  },
  mediumButton: {
    padding: 8,
  },
  largeButton: {
    padding: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
