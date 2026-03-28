import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTierForLevel, isNearNextTier } from '@/constants/ascensionTiers';
import { Star, Zap, Trophy, Crown } from 'lucide-react-native';

interface TierBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
  showLevel?: boolean;
  showGlow?: boolean;
}

export default function TierBadge({
  level,
  size = 'medium',
  showLevel = true,
  showGlow = true,
}: TierBadgeProps) {
  const tier = getTierForLevel(level);
  const isNear = isNearNextTier(level, 0.8);
  const shouldGlow = showGlow && isNear;

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldGlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [shouldGlow, glowAnim]);

  const sizes = {
    small: {
      container: 32,
      icon: 12,
      fontSize: 9,
      borderWidth: 1.5,
    },
    medium: {
      container: 44,
      icon: 16,
      fontSize: 11,
      borderWidth: 2,
    },
    large: {
      container: 64,
      icon: 24,
      fontSize: 14,
      borderWidth: 2.5,
    },
  };

  const sizeConfig = sizes[size];

  const getIcon = () => {
    const iconSize = sizeConfig.icon;
    const color = '#FFFFFF';

    switch (tier.id) {
      case 'prestige':
        return <Crown size={iconSize} color={color} fill={color} />;
      case 'the_architect':
        return <Trophy size={iconSize} color={color} fill={color} />;
      case 'rainmaker':
        return <Zap size={iconSize} color={color} fill={color} />;
      default:
        return <Star size={iconSize} color={color} fill={color} />;
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <View style={styles.container}>
      {shouldGlow && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              width: sizeConfig.container + 8,
              height: sizeConfig.container + 8,
              opacity: glowOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', tier.theme.accentColor, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      <LinearGradient
        colors={[tier.theme.gradientStart, tier.theme.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badge,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderWidth: sizeConfig.borderWidth,
          },
        ]}
      >
        <View style={styles.iconContainer}>{getIcon()}</View>
        {showLevel && (
          <View style={[styles.levelIndicator]}>
            <Text
              style={[
                styles.levelText,
                {
                  fontSize: sizeConfig.fontSize,
                },
              ]}
            >
              {level}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    position: 'absolute',
    borderRadius: 1000,
  },
  badge: {
    borderRadius: 1000,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  levelText: {
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
