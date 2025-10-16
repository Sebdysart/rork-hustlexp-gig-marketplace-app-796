import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';
import { gradients, premiumColors } from '@/constants/designTokens';

interface GritCoinProps {
  size?: number;
  animated?: boolean;
  style?: ViewStyle;
  glowIntensity?: 'low' | 'medium' | 'high';
}

export default function GritCoin({ 
  size = 32, 
  animated = true, 
  style,
  glowIntensity = 'medium' 
}: GritCoinProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
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

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [animated, rotateAnim, pulseAnim, glowAnim]);

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  const scaleX = rotateAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.6, 0.2, 0.6, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const getGlowSize = () => {
    switch (glowIntensity) {
      case 'low':
        return size * 1.5;
      case 'high':
        return size * 2.2;
      default:
        return size * 1.8;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {Platform.OS !== 'web' && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              width: getGlowSize(),
              height: getGlowSize(),
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        >
          <LinearGradient
            colors={gradients.gritCoin}
            style={styles.glow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.coinContainer,
          {
            width: size,
            height: size,
            transform: [
              { perspective: 1000 },
              { rotateY },
              { scaleX },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[premiumColors.gritGold, premiumColors.gritGoldDark]}
          style={styles.coinFace}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.coinInner}>
            <LinearGradient
              colors={[premiumColors.gritGoldLight, premiumColors.gritGold, premiumColors.gritGoldDark]}
              style={[styles.coinCenter, { width: size * 0.85, height: size * 0.85 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.iconContainer}>
                <Zap 
                  size={size * 0.5} 
                  color="#000" 
                  fill="#000"
                  strokeWidth={3}
                />
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>

        <View style={[styles.coinEdge, { width: size * 0.1, height: size }]}>
          <LinearGradient
            colors={['#B8860B', '#DAA520', '#B8860B']}
            style={styles.edgeGradient}
          />
        </View>
      </Animated.View>

      <View style={[styles.shine, { width: size * 0.3, height: size * 0.6 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  glow: {
    flex: 1,
    opacity: 0.4,
    borderRadius: 1000,
  },
  coinContainer: {
    position: 'relative',
    borderRadius: 1000,
    overflow: 'visible',
  },
  coinFace: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  coinInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinCenter: {
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B8860B',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinEdge: {
    position: 'absolute',
    left: '45%',
    top: 0,
    borderRadius: 2,
    overflow: 'hidden',
  },
  edgeGradient: {
    flex: 1,
  },
  shine: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 100,
    transform: [{ rotate: '45deg' }],
  },
});
