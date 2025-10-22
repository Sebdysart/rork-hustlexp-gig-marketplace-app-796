import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import Badge3D from './Badge3D';

const { width } = Dimensions.get('window');

interface BadgeEvolutionProps {
  fromBadge: {
    icon: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  toBadge: {
    icon: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  onComplete?: () => void;
}

export default function BadgeEvolution({
  fromBadge,
  toBadge,
  onComplete,
}: BadgeEvolutionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fromScaleAnim = useRef(new Animated.Value(1)).current;
  const toScaleAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef([...Array(30)].map(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(fromScaleAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fromScaleAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(toScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]);

    particleAnims.forEach((anims, index) => {
      const angle = (index * 12 * Math.PI) / 180;
      const distance = 120;
      
      Animated.sequence([
        Animated.delay(800 + index * 20),
        Animated.parallel([
          Animated.timing(anims.x, {
            toValue: Math.cos(angle) * distance,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anims.y, {
            toValue: Math.sin(angle) * distance,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anims.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anims.opacity, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(anims.scale, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anims.scale, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });

    sequence.start(() => {
      if (onComplete) {
        setTimeout(onComplete, 1500);
      }
    });
  }, []);

  const arrowTranslateX = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const arrowOpacity = arrowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <LinearGradient
          colors={[
            premiumColors.neonViolet + '40',
            Colors.background,
            premiumColors.neonAmber + '40',
          ]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.particles}>
        {particleAnims.map((anims, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX: anims.x },
                  { translateY: anims.y },
                  { scale: anims.scale },
                ],
                opacity: anims.opacity,
              },
            ]}
          >
            <Sparkles size={16} color={premiumColors.neonCyan} />
          </Animated.View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.title}>BADGE EVOLUTION!</Text>

        <View style={styles.evolutionContainer}>
          <Animated.View
            style={[
              styles.badgeWrapper,
              {
                opacity: fromScaleAnim,
                transform: [{ scale: fromScaleAnim }],
              },
            ]}
          >
            <Badge3D
              icon={fromBadge.icon}
              rarity={fromBadge.rarity}
              unlocked={true}
              size="large"
              animated={false}
              glowing={false}
            />
            <Text style={styles.badgeName}>{fromBadge.name}</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.arrowContainer,
              {
                opacity: arrowOpacity,
                transform: [{ translateX: arrowTranslateX }],
              },
            ]}
          >
            <LinearGradient
              colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.arrowGradient}
            >
              <ArrowRight size={32} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.badgeWrapper,
              {
                opacity: toScaleAnim,
                transform: [{ scale: toScaleAnim }],
              },
            ]}
          >
            <Badge3D
              icon={toBadge.icon}
              rarity={toBadge.rarity}
              unlocked={true}
              size="large"
              animated={true}
              glowing={true}
            />
            <Text style={styles.badgeName}>{toBadge.name}</Text>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: toScaleAnim,
              transform: [
                {
                  translateY: toScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.message}>Your badge has evolved!</Text>
          <Text style={styles.submessage}>
            You&apos;ve reached the next tier in your journey
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
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
  content: {
    alignItems: 'center',
    gap: 40,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: premiumColors.neonAmber,
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  evolutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  badgeWrapper: {
    alignItems: 'center',
    gap: 16,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  arrowContainer: {
    marginHorizontal: 10,
  },
  arrowGradient: {
    padding: 12,
    borderRadius: 50,
  },
  messageContainer: {
    alignItems: 'center',
    gap: 8,
  },
  message: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: width - 80,
  },
});
