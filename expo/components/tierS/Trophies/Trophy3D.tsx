import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface Trophy3DProps {
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlocked: boolean;
  size?: 'small' | 'medium' | 'large';
  rotating?: boolean;
}

const tierColors = {
  bronze: ['#CD7F32', '#8B4513', '#D4AF37'],
  silver: ['#C0C0C0', '#A8A8A8', '#E8E8E8'],
  gold: ['#FFD700', '#FFA500', '#FFEC8B'],
  platinum: ['#E5E4E2', '#D3D3D3', '#F5F5F5'],
  diamond: ['#B9F2FF', '#87CEEB', '#E0FFFF'],
};

const tierGlows = {
  bronze: 'rgba(205, 127, 50, 0.6)',
  silver: 'rgba(192, 192, 192, 0.7)',
  gold: 'rgba(255, 215, 0, 0.8)',
  platinum: 'rgba(229, 228, 226, 0.9)',
  diamond: 'rgba(185, 242, 255, 1)',
};

export default function Trophy3D({
  icon,
  tier,
  unlocked,
  size = 'medium',
  rotating = true,
}: Trophy3DProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const sizes = {
    small: 80,
    medium: 120,
    large: 160,
  };

  const iconSizes = {
    small: 40,
    medium: 60,
    large: 80,
  };

  useEffect(() => {
    if (!unlocked || !rotating) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 2,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [unlocked, rotating]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['-15deg', '15deg', '-15deg'],
  });

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const trophySize = sizes[size];
  const colors = tierColors[tier];
  const glow = tierGlows[tier];

  return (
    <View style={[styles.container, { width: trophySize, height: trophySize * 1.2 }]}>
      {unlocked && (
        <Animated.View
          style={[
            styles.glowCircle,
            {
              width: trophySize + 40,
              height: trophySize + 40,
              borderRadius: (trophySize + 40) / 2,
              backgroundColor: glow,
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.08],
                outputRange: [0.3, 0.6],
              }),
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.trophyContainer,
          {
            transform: [
              { rotateY: rotation },
              { translateY },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <View style={styles.trophy}>
          <View style={[styles.trophyTop, { width: trophySize }]}>
            <LinearGradient
              colors={unlocked ? [colors[0], colors[1], colors[2]] : [Colors.card, Colors.card, Colors.card]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cupTop}
            >
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, { fontSize: iconSizes[size] }]}>
                  {unlocked ? icon : '🔒'}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.handles}>
              <LinearGradient
                colors={unlocked ? [colors[0], colors[1], colors[2]] : [Colors.card, Colors.card]}
                style={[styles.handleLeft, { width: trophySize * 0.25 }]}
              />
              <LinearGradient
                colors={unlocked ? [colors[0], colors[1], colors[2]] : [Colors.card, Colors.card]}
                style={[styles.handleRight, { width: trophySize * 0.25 }]}
              />
            </View>
          </View>

          <View style={[styles.trophyBase, { width: trophySize * 0.8 }]}>
            <LinearGradient
              colors={unlocked ? [colors[1] || colors[0], colors[0]] : [Colors.card, Colors.card]}
              style={styles.baseGradient}
            />
          </View>

          <View style={[styles.trophyPedestal, { width: trophySize * 0.9 }]}>
            <LinearGradient
              colors={unlocked ? [colors[2] || colors[0], colors[1] || colors[0]] : [Colors.card, Colors.card]}
              style={styles.pedestalGradient}
            />
          </View>
        </View>

        {unlocked && (
          <View style={styles.shine}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      </Animated.View>

      {unlocked && (
        <View style={styles.sparkles}>
          {[...Array(6)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.sparkle,
                {
                  top: `${15 + index * 15}%`,
                  left: `${10 + (index % 3) * 35}%`,
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.08],
                    outputRange: [0.3, 0.8],
                  }),
                },
              ]}
            >
              <Trophy size={12} color={colors[0]} />
            </Animated.View>
          ))}
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
  glowCircle: {
    position: 'absolute',
  },
  trophyContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophy: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  trophyTop: {
    height: '55%',
    position: 'relative',
  },
  cupTop: {
    flex: 1,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
  handles: {
    position: 'absolute',
    width: '100%',
    height: '60%',
    top: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  handleLeft: {
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    position: 'absolute',
    left: -15,
  },
  handleRight: {
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    position: 'absolute',
    right: -15,
  },
  trophyBase: {
    height: '15%',
    marginTop: 4,
    overflow: 'hidden',
  },
  baseGradient: {
    flex: 1,
    borderRadius: 4,
  },
  trophyPedestal: {
    height: '20%',
    marginTop: 4,
    overflow: 'hidden',
  },
  pedestalGradient: {
    flex: 1,
    borderRadius: 8,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
  },
});
