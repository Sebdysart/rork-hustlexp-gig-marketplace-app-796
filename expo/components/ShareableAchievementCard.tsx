import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 40, 400);

export interface ShareableAchievementData {
  icon: string;
  title: string;
  description: string;
  type: 'badge' | 'level' | 'quest' | 'streak' | 'trophy';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: {
    label: string;
    value: string;
  }[];
  userName?: string;
  timestamp?: Date;
}

interface ShareableAchievementCardProps {
  data: ShareableAchievementData;
  compact?: boolean;
}

export default function ShareableAchievementCard({
  data,
  compact = false,
}: ShareableAchievementCardProps) {
  const getRarityColors = () => {
    switch (data.rarity) {
      case 'legendary':
        return [premiumColors.neonAmber, premiumColors.neonOrange];
      case 'epic':
        return [premiumColors.neonViolet, premiumColors.neonMagenta];
      case 'rare':
        return [premiumColors.neonCyan, premiumColors.neonBlue];
      default:
        return [premiumColors.neonGreen, premiumColors.neonCyan];
    }
  };

  const getRarityLabel = () => {
    if (!data.rarity) return null;
    return data.rarity.charAt(0).toUpperCase() + data.rarity.slice(1);
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <LinearGradient
        colors={[premiumColors.richBlack, premiumColors.deepBlack]}
        style={styles.background}
      >
        <LinearGradient
          colors={[getRarityColors()[0], getRarityColors()[1], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.accentGradient}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.brandContainer}>
                <Text style={styles.brandText}>HustleXP</Text>
                <Text style={styles.brandEmoji}>⚡</Text>
              </View>
              {data.rarity && (
                <View
                  style={[
                    styles.rarityBadge,
                    { backgroundColor: getRarityColors()[0] },
                  ]}
                >
                  <Text style={styles.rarityText}>{getRarityLabel()}</Text>
                </View>
              )}
            </View>

            <View style={styles.achievementContent}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[getRarityColors()[0], getRarityColors()[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Text style={styles.icon}>{data.icon}</Text>
                </LinearGradient>
              </View>

              <Text style={styles.title}>{data.title}</Text>
              <Text style={styles.description}>{data.description}</Text>

              {data.stats && data.stats.length > 0 && (
                <View style={styles.statsContainer}>
                  {data.stats.map((stat, index) => (
                    <View key={index} style={styles.statItem}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.footer}>
              {data.userName && (
                <Text style={styles.userName}>@{data.userName}</Text>
              )}
              {data.timestamp && (
                <Text style={styles.timestamp}>
                  {new Date(data.timestamp).toLocaleDateString()}
                </Text>
              )}
            </View>

            <View style={styles.ctaContainer}>
              <LinearGradient
                colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Join HustleXP Today</Text>
              </LinearGradient>
              <Text style={styles.ctaSubtext}>hustlexp.app</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.decorativeElements}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  containerCompact: {
    aspectRatio: 16 / 9,
  },
  background: {
    flex: 1,
  },
  accentGradient: {
    flex: 1,
    padding: 2,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  brandEmoji: {
    fontSize: 18,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '80%',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600' as const,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0.7,
  },
  userName: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  ctaGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  ctaSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: premiumColors.neonCyan,
    opacity: 0.3,
  },
  dot1: {
    top: '20%',
    left: '10%',
  },
  dot2: {
    top: '60%',
    right: '15%',
  },
  dot3: {
    bottom: '25%',
    left: '20%',
  },
});
