import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AscensionTier, ASCENSION_TIERS } from '@/constants/ascensionTiers';
import { playSound } from '@/utils/soundSystem';
import { triggerHaptic } from '@/utils/haptics';
import { Share, Trophy, Zap, Crown, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface AscensionCeremonyProps {
  tier: AscensionTier;
  newLevel: number;
  onComplete: () => void;
}

export default function AscensionCeremony({
  tier,
  newLevel,
  onComplete,
}: AscensionCeremonyProps) {
  const [currentStage, setCurrentStage] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const titleScaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const perksAnim = useRef<Animated.Value[]>([]).current;
  const confettiAnims = useRef<Animated.Value[]>([]).current;
  const raysAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  for (let i = 0; i < tier.perks.length; i++) {
    if (!perksAnim[i]) {
      perksAnim[i] = new Animated.Value(0);
    }
  }

  for (let i = 0; i < tier.unlockCelebration.particleCount; i++) {
    if (!confettiAnims[i]) {
      confettiAnims[i] = new Animated.Value(0);
    }
  }

  useEffect(() => {
    performCeremony();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performCeremony = async () => {
    playSound('levelUp');
    triggerHaptic('heavy');

    await stage1BuildUp();
    await stage2Reveal();
    await stage3RewardsShowcase();
    await stage4ThemePreview();
    await stage5SocialProof();

    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const stage1BuildUp = () => {
    return new Promise<void>((resolve) => {
      setCurrentStage(1);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.5,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      setTimeout(() => {
        triggerHaptic('medium');
        resolve();
      }, 2000);
    });
  };

  const stage2Reveal = () => {
    return new Promise<void>((resolve) => {
      setCurrentStage(2);
      playSound('success');
      triggerHaptic('heavy');

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(titleScaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(raysAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]).start();

      if (tier.effects.confetti) {
        launchConfetti();
      }

      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      setTimeout(() => {
        triggerHaptic('light');
        resolve();
      }, 3000);
    });
  };

  const stage3RewardsShowcase = () => {
    return new Promise<void>((resolve) => {
      setCurrentStage(3);

      const animations = perksAnim.map((anim, index) => {
        return Animated.sequence([
          Animated.delay(index * 400),
          Animated.spring(anim, {
            toValue: 1,
            tension: 60,
            friction: 6,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.stagger(150, animations).start();

      perksAnim.forEach((_, index) => {
        setTimeout(() => {
          playSound('tap');
          triggerHaptic('light');
        }, index * 400);
      });

      setTimeout(() => {
        resolve();
      }, tier.perks.length * 400 + 1000);
    });
  };

  const stage4ThemePreview = () => {
    return new Promise<void>((resolve) => {
      setCurrentStage(4);
      playSound('success');
      triggerHaptic('medium');

      setTimeout(() => {
        resolve();
      }, 3000);
    });
  };

  const stage5SocialProof = () => {
    return new Promise<void>((resolve) => {
      setCurrentStage(5);

      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };

  const launchConfetti = () => {
    confettiAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(Math.random() * 500),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const raysRotation = raysAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {currentStage >= 2 && (
        <Animated.View
          style={[
            styles.raysContainer,
            {
              transform: [{ rotate: raysRotation }],
              opacity: fadeAnim,
            },
          ]}
        >
          {[...Array(16)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.ray,
                {
                  backgroundColor: tier.theme.glowColor,
                  transform: [{ rotate: `${(index * 360) / 16}deg` }],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}

      {tier.effects.confetti &&
        currentStage >= 2 &&
        confettiAnims.map((anim, index) => {
          const angle = Math.random() * Math.PI * 2;
          const distance = width * 0.8;
          const x = Math.cos(angle) * distance * Math.random();
          const y = -height / 2 + height * 1.5;

          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, y],
          });

          const rotation = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${Math.random() * 720 - 360}deg`],
          });

          const confettiColors = [
            tier.theme.primaryColor,
            tier.theme.secondaryColor,
            tier.theme.accentColor,
            '#FFD700',
            '#FFF',
          ];
          const color = confettiColors[index % confettiColors.length];

          return (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  backgroundColor: color,
                  left: width / 2 + x,
                  transform: [{ translateY }, { rotate: rotation }],
                  opacity: anim,
                },
              ]}
            />
          );
        })}

      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {currentStage >= 1 && (
          <Animated.View style={[styles.buildUpContainer]}>
            <Animated.Text
              style={[
                styles.buildUpText,
                { transform: [{ scale: glowScale }] },
              ]}
            >
              You&apos;ve reached...
            </Animated.Text>
          </Animated.View>
        )}

        {currentStage >= 2 && (
          <Animated.View
            style={[
              styles.tierCard,
              {
                transform: [{ scale: titleScaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[tier.theme.gradientStart, tier.theme.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tierGradient}
            >
              {tier.effects.holographic && (
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      transform: [{ translateX: shimmerTranslate }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      'transparent',
                      'rgba(255,255,255,0.3)',
                      'transparent',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              )}

              <View style={styles.iconContainer}>
                {tier.id === 'prestige' ? (
                  <Crown size={64} color={tier.theme.accentColor} strokeWidth={2} />
                ) : tier.id === 'the_architect' ? (
                  <Trophy size={64} color={tier.theme.accentColor} strokeWidth={2} />
                ) : tier.id === 'rainmaker' ? (
                  <Zap size={64} color={tier.theme.accentColor} strokeWidth={2} />
                ) : (
                  <Star size={64} color={tier.theme.accentColor} strokeWidth={2} />
                )}
              </View>

              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={styles.levelText}>Level {newLevel}</Text>
              <Text style={styles.subtitle}>
                {tier.id === 'prestige'
                  ? 'The Elite'
                  : tier.id === 'the_architect'
                  ? 'Designing Your Empire'
                  : tier.id === 'rainmaker'
                  ? 'Deals Start Finding You'
                  : tier.id === 'the_operator'
                  ? 'Building Momentum'
                  : 'Your Journey Begins'}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {currentStage >= 3 && (
          <View style={styles.perksContainer}>
            {tier.perks.slice(0, 4).map((perk, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.perkCard,
                  {
                    opacity: perksAnim[index],
                    transform: [
                      {
                        translateY: perksAnim[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                      { scale: perksAnim[index] },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.perkBadge,
                    { backgroundColor: tier.theme.accentColor },
                  ]}
                >
                  <Text style={styles.perkBadgeText}>NEW</Text>
                </View>
                <Text style={styles.perkText}>{perk}</Text>
              </Animated.View>
            ))}
          </View>
        )}

        {currentStage >= 4 && (
          <Animated.View style={[styles.evolutionContainer]}>
            <Text style={styles.evolutionText}>🎉 Your hustle evolved! 🎉</Text>
          </Animated.View>
        )}

        {currentStage >= 5 && (
          <Animated.View style={[styles.socialContainer]}>
            <Text style={styles.socialText}>
              You&apos;re in the top {((5 - ASCENSION_TIERS.findIndex((t) => t.id === tier.id)) * 20)}% of hustlers!
            </Text>
            <View style={styles.shareButton}>
              <Share size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share Achievement</Text>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  raysContainer: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
  },
  ray: {
    position: 'absolute',
    width: 6,
    height: width * 0.75,
    left: '50%',
    top: '50%',
    marginLeft: -3,
    marginTop: -(width * 0.375),
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  centerContent: {
    alignItems: 'center',
    width: width * 0.9,
    maxWidth: 420,
  },
  buildUpContainer: {
    marginBottom: 32,
  },
  buildUpText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  tierCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  tierGradient: {
    padding: 40,
    alignItems: 'center',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  iconContainer: {
    marginBottom: 20,
  },
  tierName: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  perksContainer: {
    width: '100%',
    gap: 12,
  },
  perkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  perkBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  perkBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#000000',
    letterSpacing: 1,
  },
  perkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  evolutionContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  evolutionText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  socialContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 16,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
