import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
  Easing,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Zap, Sparkles, Rocket, Star, TrendingUp, 
  ArrowRight, Trophy, Target, Crown, Flame 
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import { useSensory } from '@/hooks/useSensory';
import ConfettiExplosion from '@/components/tierS/Celebrations/ConfettiExplosion';
import React from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
}

interface FloatingElement {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  icon: React.ReactNode;
}

export default function WelcomeMaxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const sensory = useSensory();

  const [showConfetti, setShowConfetti] = useState(false);
  const [step, setStep] = useState<'intro' | 'reveal' | 'action'>('intro');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  
  const mainScale = useRef(new Animated.Value(0)).current;
  const mainOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const hologramShift = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const lightRayRotation = useRef(new Animated.Value(0)).current;



  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        sensory.tap();
        Animated.spring(buttonScale, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
      },
      onPanResponderRelease: () => {
        Animated.spring(buttonScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 50) {
          triggerSwipeEffect(gestureState.dx > 0 ? 'right' : 'left');
        }
      },
    })
  ).current;

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const colors = [
      premiumColors.neonCyan,
      premiumColors.neonMagenta,
      premiumColors.neonAmber,
      premiumColors.neonGreen,
      premiumColors.neonBlue,
    ];

    for (let i = 0; i < 150; i++) {
      const angle = (Math.PI * 2 * i) / 150;
      const radius = 50 + Math.random() * 200;
      const startX = SCREEN_WIDTH / 2 + Math.cos(angle) * radius;
      const startY = SCREEN_HEIGHT / 2 + Math.sin(angle) * radius;

      newParticles.push({
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
        rotation: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
      });
    }
    setParticles(newParticles);
  }, []);

  const createFloatingElements = useCallback(() => {
    const icons = [
      <Zap key="zap" size={24} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />,
      <Trophy key="trophy" size={24} color={premiumColors.neonAmber} />,
      <Star key="star" size={24} color={premiumColors.neonMagenta} fill={premiumColors.neonMagenta} />,
      <Flame key="flame" size={24} color="#FF6B35" />,
      <Crown key="crown" size={24} color="#FFD700" />,
      <Target key="target" size={24} color={premiumColors.neonGreen} />,
    ];

    const newElements: FloatingElement[] = [];
    for (let i = 0; i < 6; i++) {
      const startX = Math.random() * SCREEN_WIDTH;
      const startY = Math.random() * SCREEN_HEIGHT;
      
      newElements.push({
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        scale: new Animated.Value(0),
        rotation: new Animated.Value(0),
        icon: icons[i],
      });
    }
    setFloatingElements(newElements);
  }, []);

  const animateParticleExplosion = useCallback(() => {
    particles.forEach((particle, index) => {
      const delay = index * 5;
      const angle = (Math.PI * 2 * index) / particles.length;
      const distance = 150 + Math.random() * 300;
      const targetX = SCREEN_WIDTH / 2 + Math.cos(angle) * distance;
      const targetY = SCREEN_HEIGHT / 2 + Math.sin(angle) * distance;

      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particle.opacity, {
            toValue: 0.8,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particle.x, {
            toValue: targetX,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particle.y, {
            toValue: targetY,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 720 - 360,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(800 + delay),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, [particles]);

  const animateFloatingElements = useCallback(() => {
    floatingElements.forEach((element, index) => {
      const delay = index * 100;
      
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(element.scale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(element.y, {
                toValue: -20,
                duration: 2000 + Math.random() * 1000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(element.y, {
                toValue: 20,
                duration: 2000 + Math.random() * 1000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.timing(element.rotation, {
              toValue: 360,
              duration: 8000 + Math.random() * 4000,
              easing: Easing.linear,
              useNativeDriver: true,
            })
          ),
        ]),
      ]).start();
    });
  }, [floatingElements]);

  const triggerSwipeEffect = (direction: 'left' | 'right') => {
    sensory.swipe();
    Animated.sequence([
      Animated.timing(hologramShift, {
        toValue: direction === 'right' ? 20 : -20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(hologramShift, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    createParticles();
    createFloatingElements();

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 360,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowIntensity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.timing(mainOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep('reveal');
      animateParticleExplosion();
      animateFloatingElements();
      sensory.levelUp();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(lightRayRotation, {
        toValue: 360,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(hologramShift, {
          toValue: 5,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(hologramShift, {
          toValue: -5,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGetStarted = () => {
    sensory.success();
    setShowConfetti(true);

    Animated.parallel([
      Animated.timing(mainOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 2,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentUser) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/ai-onboarding');
      }
    });
  };

  const logoRotateInterpolate = logoRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const lightRayRotateInterpolate = lightRayRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const glowScale = glowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[
          '#000000',
          '#0D0D0F',
          '#1A0A1F',
          '#0F1A2E',
          '#000000',
        ]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {floatingElements.map((element) => (
        <Animated.View
          key={element.id}
          style={[
            styles.floatingElement,
            {
              transform: [
                { translateX: element.x },
                { translateY: element.y },
                { scale: element.scale },
                { rotate: element.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
              ],
              opacity: 0.6,
            },
          ]}
        >
          {element.icon}
        </Animated.View>
      ))}

      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              transform: [
                { scale: particle.scale },
                { rotate: particle.rotation.interpolate({
                  inputRange: [-360, 360],
                  outputRange: ['-360deg', '360deg'],
                }) },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.lightRayContainer,
          {
            transform: [{ rotate: lightRayRotateInterpolate }],
            opacity: 0.3,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            premiumColors.neonCyan + '40',
            'transparent',
          ]}
          style={styles.lightRay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <LinearGradient
          colors={[
            'transparent',
            premiumColors.neonMagenta + '40',
            'transparent',
          ]}
          style={[styles.lightRay, { transform: [{ rotate: '90deg' }] }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.glowCircle,
          {
            transform: [{ scale: pulseAnim }],
            opacity: glowIntensity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={[
            premiumColors.neonCyan + '80',
            premiumColors.neonMagenta + '60',
            'transparent',
          ]}
          style={styles.glowGradient}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: mainOpacity,
            transform: [{ translateY: hologramShift }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScale },
                { rotate: logoRotateInterpolate },
              ],
            },
          ]}
        >
          <View style={styles.logo3D}>
            <Animated.View
              style={[
                styles.logoGlowBackground,
                {
                  shadowRadius: glowScale,
                  shadowOpacity: glowIntensity,
                },
              ]}
            />
            <LinearGradient
              colors={[
                premiumColors.neonCyan + '40',
                premiumColors.neonMagenta + '20',
                premiumColors.neonBlue + '30',
              ]}
              style={[styles.logoInner, { position: 'absolute' }]}
            />
            <View style={[styles.logoInner, { backgroundColor: 'transparent' }]}>
              <BlurView intensity={40} tint="dark" style={styles.logoInner}>
                <View style={styles.logoZapContainer}>
                  <View style={styles.logoZapGlow2}>
                    <Zap size={100} color={premiumColors.neonMagenta} strokeWidth={2} fill="transparent" />
                  </View>
                  <View style={styles.logoZapGlow1}>
                    <Zap size={94} color={premiumColors.neonCyan} strokeWidth={3} fill={premiumColors.neonCyan + '80'} />
                  </View>
                  <LinearGradient
                    colors={[
                      '#FFFFFF',
                      premiumColors.neonCyan,
                      '#FFFFFF',
                    ]}
                    style={{ position: 'absolute' }}
                  >
                    <Zap size={88} color="#FFFFFF" strokeWidth={4} fill="#FFFFFF" />
                  </LinearGradient>
                </View>
              </BlurView>
            </View>
          </View>
        </Animated.View>

        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>HUSTLEXP</Text>
          <LinearGradient
            colors={[
              premiumColors.neonCyan,
              premiumColors.neonMagenta,
              premiumColors.neonAmber,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleUnderline}
          />
        </View>

        <Text style={styles.tagline}>
          Where Work Becomes Adventure
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Sparkles size={20} color={premiumColors.neonCyan} />
            <Text style={styles.statText}>AI-Powered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <TrendingUp size={20} color={premiumColors.neonGreen} />
            <Text style={styles.statText}>Earn XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Trophy size={20} color={premiumColors.neonAmber} />
            <Text style={styles.statText}>Level Up</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + spacing.xl,
            opacity: mainOpacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleGetStarted}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.startButton,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <BlurView intensity={20} tint="dark" style={styles.buttonBlur}>
              <LinearGradient
                colors={[
                  premiumColors.neonCyan,
                  premiumColors.neonBlue,
                  premiumColors.neonMagenta,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Animated.View
                  style={[
                    styles.buttonContent,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Rocket size={28} color="#000000" strokeWidth={3} />
                  <Text style={styles.buttonText}>Launch Experience</Text>
                  <ArrowRight size={28} color="#000000" strokeWidth={3} />
                </Animated.View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.swipeHint}>
          ← Swipe to explore · Tap to launch →
        </Text>
      </Animated.View>

      {showConfetti && <ConfettiExplosion active={true} count={100} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  floatingElement: {
    position: 'absolute',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    borderRadius: 100,
    zIndex: 2,
  },
  lightRayContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    left: -SCREEN_WIDTH / 2,
    top: -SCREEN_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightRay: {
    position: 'absolute',
    width: '100%',
    height: 4,
  },
  glowCircle: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderRadius: SCREEN_WIDTH * 0.75,
    alignSelf: 'center',
    top: SCREEN_HEIGHT / 2 - SCREEN_WIDTH * 0.75,
  },
  glowGradient: {
    flex: 1,
    borderRadius: SCREEN_WIDTH * 0.75,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: spacing.xxl,
  },
  logo3D: {
    width: 180,
    height: 180,
    position: 'relative',
  },
  logoInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 5, 15, 0.95)',
    borderWidth: 4,
    borderColor: premiumColors.neonCyan,
    zIndex: 2,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 0.8,
    elevation: 30,
  },
  logoZapContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    height: 110,
  },
  logoZapGlow1: {
    position: 'absolute',
    top: -5,
    left: -5,
    opacity: 0.7,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 1,
  },
  logoZapGlow2: {
    position: 'absolute',
    top: -10,
    left: -10,
    opacity: 0.4,
    shadowColor: premiumColors.neonMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 1,
  },
  logoGlowBackground: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: premiumColors.neonCyan,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: premiumColors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleUnderline: {
    width: '100%',
    height: 4,
    marginTop: spacing.sm,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    zIndex: 20,
  },
  startButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    shadowOpacity: 1,
    elevation: 20,
  },
  buttonBlur: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: '#000000',
    letterSpacing: 1,
  },
  swipeHint: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhite,
    textAlign: 'center',
    marginTop: spacing.lg,
    opacity: 0.6,
  },
});
