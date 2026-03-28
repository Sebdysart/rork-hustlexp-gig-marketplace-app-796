import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';

interface Badge3DProps {
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  glowing?: boolean;
}

const rarityColors = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

const rarityGlows = {
  common: 'rgba(156, 163, 175, 0.5)',
  rare: 'rgba(59, 130, 246, 0.7)',
  epic: 'rgba(168, 85, 247, 0.8)',
  legendary: 'rgba(245, 158, 11, 1)',
};

export default function Badge3D({
  icon,
  rarity,
  unlocked,
  size = 'medium',
  animated = true,
  glowing = true,
}: Badge3DProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  const sizes = {
    small: 60,
    medium: 100,
    large: 140,
  };

  const iconSizes = {
    small: 32,
    medium: 56,
    large: 80,
  };

  useEffect(() => {
    if (!animated || !unlocked) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (glowing) {
      Animated.loop(
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
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 300),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [animated, unlocked, glowing]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const badgeSize = sizes[size];
  const iconSize = iconSizes[size];
  const color = rarityColors[rarity];
  const glow = rarityGlows[rarity];

  return (
    <View style={[styles.container, { width: badgeSize, height: badgeSize }]}>
      {unlocked && glowing && (
        <>
          <Animated.View
            style={[
              styles.glowRing,
              {
                width: badgeSize + 20,
                height: badgeSize + 20,
                borderRadius: (badgeSize + 20) / 2,
                borderColor: color,
                opacity: glowOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing,
              {
                width: badgeSize + 40,
                height: badgeSize + 40,
                borderRadius: (badgeSize + 40) / 2,
                borderColor: color,
                opacity: glowOpacity,
                borderWidth: 1,
              },
            ]}
          />
        </>
      )}

      <Animated.View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            transform: [{ rotate: rotation }, { scale: pulseAnim }],
            shadowColor: unlocked ? glow : Colors.card,
          },
        ]}
      >
        <LinearGradient
          colors={
            unlocked
              ? [color + 'FF', color + '80', color + '40']
              : [Colors.card, Colors.card, Colors.card]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.badgeGradient, { borderRadius: badgeSize / 2 }]}
        >
          <View
            style={[
              styles.innerCircle,
              {
                width: badgeSize - 20,
                height: badgeSize - 20,
                borderRadius: (badgeSize - 20) / 2,
              },
            ]}
          >
            <LinearGradient
              colors={
                unlocked
                  ? [Colors.surface, Colors.card]
                  : [Colors.card + '80', Colors.card + '80']
              }
              style={[
                styles.innerGradient,
                { borderRadius: (badgeSize - 20) / 2 },
              ]}
            >
              <Text
                style={[
                  styles.icon,
                  { fontSize: iconSize },
                  !unlocked && styles.iconLocked,
                ]}
              >
                {unlocked ? icon : '🔒'}
              </Text>
            </LinearGradient>
          </View>

          {unlocked && (
            <View style={styles.shinEffect}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {unlocked && glowing && (
        <View style={styles.particles}>
          {particleAnims.map((anim, index) => {
            const angle = (index * 60 * Math.PI) / 180;
            const translateX = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(angle) * 40],
            });
            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(angle) * 40],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1, 0],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    transform: [{ translateX }, { translateY }],
                    opacity,
                  },
                ]}
              >
                <Sparkles size={8} color={color} />
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  badge: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  innerCircle: {
    overflow: 'hidden',
  },
  innerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
  iconLocked: {
    opacity: 0.4,
  },
  shinEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
  particles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
  },
});
