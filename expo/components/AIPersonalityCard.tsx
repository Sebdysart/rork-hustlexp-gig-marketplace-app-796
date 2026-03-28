import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, TrendingUp, Flame } from 'lucide-react-native';
import GlassCard from './GlassCard';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';

interface MatchReason {
  icon: 'check' | 'star' | 'fire' | 'zap';
  text: string;
  highlight?: boolean;
}

interface AIPersonalityCardProps {
  matchScore: number;
  personalizedMessage: string;
  matchReasons: MatchReason[];
  viewerCount: number;
  avgAcceptanceTime?: string;
}

export default function AIPersonalityCard({
  matchScore,
  personalizedMessage,
  matchReasons,
  viewerCount,
  avgAcceptanceTime = '4 minutes',
}: AIPersonalityCardProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const viewerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.spring(viewerAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const getMatchColor = (score: number): string => {
    if (score >= 95) return premiumColors.neonGreen;
    if (score >= 85) return premiumColors.neonCyan;
    if (score >= 75) return premiumColors.neonAmber;
    return premiumColors.neonOrange;
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'check':
        return '✅';
      case 'star':
        return '⭐';
      case 'fire':
        return '🔥';
      case 'zap':
        return '⚡';
      default:
        return '✅';
    }
  };

  return (
    <GlassCard
      variant="darkStrong"
      neonBorder
      glowColor="neonPurple"
      style={styles.container}
    >
      <LinearGradient
        colors={[premiumColors.neonPurple + '20', 'transparent']}
        style={styles.gradient}
      />

      <View style={styles.header}>
        <View style={styles.aiAvatar}>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-5deg', '5deg'],
                  }),
                },
              ],
            }}
          >
            <Sparkles size={24} color={premiumColors.neonPurple} />
          </Animated.View>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.aiTitle}>HustleAI says:</Text>
          <View
            style={[
              styles.matchBadge,
              { borderColor: getMatchColor(matchScore) },
            ]}
          >
            <Text
              style={[styles.matchScore, { color: getMatchColor(matchScore) }]}
            >
              {matchScore}% MATCH
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.message}>{personalizedMessage}</Text>
      </View>

      <View style={styles.reasonsSection}>
        <Text style={styles.reasonsTitle}>🎯 Why this matches you:</Text>
        <View style={styles.reasonsList}>
          {matchReasons.map((reason, index) => (
            <View
              key={index}
              style={[
                styles.reasonItem,
                reason.highlight && styles.reasonItemHighlight,
              ]}
            >
              <Text style={styles.reasonIcon}>{getIconComponent(reason.icon)}</Text>
              <Text style={styles.reasonText}>{reason.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {viewerCount > 0 && (
        <Animated.View
          style={[
            styles.socialProof,
            {
              transform: [{ scale: viewerAnim }],
              opacity: viewerAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[premiumColors.neonOrange + '20', premiumColors.neonOrange + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.socialProofGradient}
          >
            <Flame size={16} color={premiumColors.neonOrange} />
            <Text style={styles.socialProofText}>
              <Text style={styles.socialProofNumber}>{viewerCount}</Text> hustlers viewing this quest now
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {avgAcceptanceTime && (
        <View style={styles.urgencyBanner}>
          <TrendingUp size={14} color={premiumColors.neonCyan} />
          <Text style={styles.urgencyText}>
            Accepted within{' '}
            <Text style={styles.urgencyTime}>{avgAcceptanceTime}</Text> on average. Act fast!
          </Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    overflow: 'visible',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: premiumColors.neonPurple + '20',
    borderWidth: 2,
    borderColor: premiumColors.neonPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  matchBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: premiumColors.richBlack,
  },
  matchScore: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  messageBox: {
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: premiumColors.neonPurple,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  reasonsSection: {
    gap: 12,
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  reasonsList: {
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 10,
  },
  reasonItemHighlight: {
    backgroundColor: premiumColors.neonGreen + '15',
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '40',
  },
  reasonIcon: {
    fontSize: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  socialProof: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.neonOrange + '40',
  },
  socialProofGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  socialProofText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  socialProofNumber: {
    fontWeight: '800' as const,
    color: premiumColors.neonOrange,
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: premiumColors.neonCyan + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  urgencyText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  urgencyTime: {
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
});
