import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Trophy, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import Badge3D from './Badge3D';

const { width } = Dimensions.get('window');

interface BadgeUnlockAnimationProps {
  badgeIcon: string;
  badgeName: string;
  badgeDescription: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  onComplete?: () => void;
}

export default function BadgeUnlockAnimation({
  badgeIcon,
  badgeName,
  badgeDescription,
  rarity,
  onComplete,
}: BadgeUnlockAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const raysAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef([...Array(20)].map(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(raysAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(
      Animated.timing(raysAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    particleAnims.forEach((anims, index) => {
      const angle = (index * 18 * Math.PI) / 180;
      const distance = 150;
      
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 50),
          Animated.parallel([
            Animated.timing(anims.x, {
              toValue: Math.cos(angle) * distance,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anims.y, {
              toValue: Math.sin(angle) * distance,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anims.opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(anims.opacity, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(anims.scale, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(anims.scale, {
                toValue: 0,
                duration: 1200,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.delay(0),
          Animated.parallel([
            Animated.timing(anims.x, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(anims.y, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    sequence.start(() => {
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    });
  }, []);

  const rayRotation = raysAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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

      <Animated.View
        style={[
          styles.rays,
          {
            transform: [{ rotate: rayRotation }],
            opacity: fadeAnim,
          },
        ]}
      >
        {[...Array(12)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.ray,
              {
                transform: [{ rotate: `${index * 30}deg` }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                premiumColors.neonAmber + '30',
                'transparent',
              ]}
              style={styles.rayGradient}
            />
          </View>
        ))}
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
            {index % 3 === 0 ? (
              <Sparkles size={16} color={premiumColors.neonAmber} />
            ) : index % 3 === 1 ? (
              <Star size={14} color={premiumColors.neonCyan} />
            ) : (
              <Trophy size={12} color={premiumColors.neonViolet} />
            )}
          </Animated.View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.badgeContainer}>
          <Badge3D
            icon={badgeIcon}
            rarity={rarity}
            unlocked={true}
            size="large"
            animated={true}
            glowing={true}
          />
        </View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
              transform: [
                {
                  translateY: textFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.unlockText}>BADGE UNLOCKED!</Text>
          <Text style={styles.badgeName}>{badgeName}</Text>
          <Text style={styles.badgeDescription}>{badgeDescription}</Text>
          
          <View style={styles.rarityContainer}>
            <LinearGradient
              colors={[
                premiumColors.neonAmber,
                premiumColors.neonViolet,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rarityBadge}
            >
              <Text style={styles.rarityText}>{rarity.toUpperCase()}</Text>
            </LinearGradient>
          </View>
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
  rays: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: width,
    left: '50%',
    top: '50%',
    marginLeft: -2,
    marginTop: -width / 2,
  },
  rayGradient: {
    flex: 1,
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
    gap: 32,
    padding: 20,
  },
  badgeContainer: {
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  unlockText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: premiumColors.neonAmber,
    letterSpacing: 3,
    textAlign: 'center',
  },
  badgeName: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badgeDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: width - 80,
    lineHeight: 24,
  },
  rarityContainer: {
    marginTop: 8,
  },
  rarityBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rarityText: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: '#fff',
    letterSpacing: 2,
  },
});
