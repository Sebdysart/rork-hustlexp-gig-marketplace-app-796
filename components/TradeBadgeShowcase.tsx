import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TradeBadge } from '@/constants/tradesmen';
import { Zap, Flame, Sparkles } from 'lucide-react-native';

interface TradeBadgeShowcaseProps {
  badge: TradeBadge;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showDetails?: boolean;
}

export default function TradeBadgeShowcase({
  badge,
  size = 'medium',
  animated = true,
  showDetails = false,
}: TradeBadgeShowcaseProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      if (badge.animationType === 'forge') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [animated, badge.animationType, rotateAnim, glowAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const sizeMap = {
    small: 60,
    medium: 100,
    large: 140,
  };

  const iconSizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const badgeSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  const getAnimationIcon = () => {
    switch (badge.animationType) {
      case 'spark':
        return <Zap size={iconSize / 2} color={badge.color} />;
      case 'forge':
        return <Flame size={iconSize / 2} color={badge.color} />;
      case 'glow':
        return <Sparkles size={iconSize / 2} color={badge.color} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, showDetails && styles.containerWithDetails]}>
      <View style={styles.badgeContainer}>
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: badgeSize + 20,
              height: badgeSize + 20,
              borderRadius: (badgeSize + 20) / 2,
              borderColor: badge.color,
              opacity: glowOpacity,
              transform: [{ rotate }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[badge.color, badge.color + 'CC', badge.color + '99']}
            style={styles.badgeGradient}
          >
            <View style={styles.metalOverlay}>
              <Text style={[styles.icon, { fontSize: iconSize }]}>{badge.icon}</Text>
              {animated && (
                <View style={styles.animationIcon}>
                  {getAnimationIcon()}
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={[styles.levelIndicator, { backgroundColor: badge.color }]}>
          <Text style={styles.levelText}>{badge.level.toUpperCase()}</Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <Text style={[styles.badgeName, { color: badge.color }]}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>
          
          {badge.unlockEffects.length > 0 && (
            <View style={styles.effects}>
              <Text style={styles.effectsTitle}>Perks:</Text>
              {badge.unlockEffects.map((effect, index) => (
                <View key={index} style={styles.effectItem}>
                  <View style={[styles.effectDot, { backgroundColor: badge.color }]} />
                  <Text style={styles.effectText}>{effect}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerWithDetails: {
    width: '100%',
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 3,
  },
  badge: {
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metalOverlay: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    textAlign: 'center',
  },
  animationIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  levelIndicator: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  details: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  effects: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  effectsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  effectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  effectText: {
    fontSize: 13,
    color: '#CCC',
    flex: 1,
  },
});
