import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getRankForLevel } from '@/constants/ranks';
import { LinearGradient } from 'expo-linear-gradient';
import { playSound } from '@/utils/soundSystem';

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete: () => void;
}

export default function LevelUpAnimation({ newLevel, onComplete }: LevelUpAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const raysAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef<Animated.Value[]>([]);

  for (let i = 0; i < 12; i++) {
    if (!starsAnim.current[i]) {
      starsAnim.current[i] = new Animated.Value(0);
    }
  }

  const rank = getRankForLevel(newLevel);

  useEffect(() => {
    playSound('levelUp');
    
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.timing(raysAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        { iterations: 2 }
      ),
    ]).start();

    const starAnimations = starsAnim.current.map((anim, index) => {
      return Animated.sequence([
        Animated.delay(index * 80),
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(starAnimations).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete();
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, raysAnim, onComplete]);

  const raysRotation = raysAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.raysContainer,
          {
            transform: [{ rotate: raysRotation }],
            opacity: opacityAnim,
          },
        ]}
      >
        {[...Array(8)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.ray,
              {
                transform: [{ rotate: `${(index * 360) / 8}deg` }],
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={[rank.gradient[0], rank.gradient[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.levelUpText}>LEVEL UP!</Text>
          <Text style={styles.levelNumber}>{newLevel}</Text>
          <Text style={styles.rankName}>{rank.name}</Text>
          <Text style={styles.rankIcon}>{rank.icon}</Text>
        </LinearGradient>
      </Animated.View>

      {starsAnim.current.map((anim, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const distance = 180;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const starScale = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1.5, 1],
        });

        return (
          <Animated.Text
            key={index}
            style={[
              styles.star,
              {
                left: `${50}%`,
                top: `${50}%`,
                transform: [
                  { translateX: x },
                  { translateY: y },
                  { scale: starScale },
                ],
              },
            ]}
          >
            ⭐
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 9999,
  },
  raysContainer: {
    position: 'absolute',
    width: 400,
    height: 400,
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 200,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    left: '50%',
    top: '50%',
    marginLeft: -2,
    marginTop: -100,
  },
  content: {
    width: 280,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 16,
  },
  levelNumber: {
    fontSize: 72,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rankName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  rankIcon: {
    fontSize: 48,
  },
  star: {
    position: 'absolute',
    fontSize: 32,
  },
});
