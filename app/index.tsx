import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, Sparkles, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import { useSensory } from '@/hooks/useSensory';
import ConfettiExplosion from '@/components/tierS/Celebrations/ConfettiExplosion';
import React from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const sensory = useSensory();

  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;
  const nebulaSwirl = useRef(new Animated.Value(0)).current;
  const ambientHue = useRef(new Animated.Value(0)).current;
  const buttonWave = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const mainOpacity = useRef(new Animated.Value(0)).current;
  const titleReveal = useRef(new Animated.Value(0)).current;
  const sparkBurst = useRef(new Animated.Value(0)).current;
  const lightRayRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const newParticles: Particle[] = [];
    const colors = [
      premiumColors.neonCyan,
      premiumColors.neonMagenta,
      premiumColors.neonAmber,
      '#FFFFFF',
    ];

    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 * i) / 80;
      const startX = SCREEN_WIDTH / 2;
      const startY = SCREEN_HEIGHT / 2 - 100;

      newParticles.push({
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
      });
    }
    setParticles(newParticles);

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowIntensity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.timing(mainOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      sensory.success();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      newParticles.forEach((particle, index) => {
        const delay = index * 8;
        const angle = (Math.PI * 2 * index) / newParticles.length;
        const distance = 100 + Math.random() * 250;
        const targetX = SCREEN_WIDTH / 2 + Math.cos(angle) * distance;
        const targetY = SCREEN_HEIGHT / 2 - 100 + Math.sin(angle) * distance;

        Animated.parallel([
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.opacity, {
              toValue: 0.9,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.spring(particle.scale, {
              toValue: 1,
              tension: 50,
              friction: 5,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.x, {
              toValue: targetX,
              duration: 1000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.y, {
              toValue: targetY,
              duration: 1000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.delay(1000 + delay),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    });

    Animated.sequence([
      Animated.delay(1800),
      Animated.timing(titleReveal, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.08,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(nebulaSwirl, {
        toValue: 360,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ambientHue, {
          toValue: 1,
          duration: 12000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(ambientHue, {
          toValue: 0,
          duration: 12000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(buttonWave, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.timing(lightRayRotation, {
        toValue: 360,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleLaunch = () => {
    sensory.success();
    
    Animated.sequence([
      Animated.timing(sparkBurst, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sparkBurst, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(mainOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 3,
        duration: 600,
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

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const nebulaSwirlRotate = nebulaSwirl.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const buttonWavePosition = buttonWave.interpolate({
    inputRange: [0, 1],
    outputRange: ['-150%', '250%'],
  });

  const ambientColor1 = ambientHue.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['#000814', '#1A0F2E', '#0A1F2E', '#000814'],
  });

  const ambientColor2 = ambientHue.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['#1A0F2E', '#2E0F1A', '#14001A', '#1A0F2E'],
  });

  const lightRayRotateInterpolate = lightRayRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Animated.View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            '#000000',
            ambientColor1 as any,
            ambientColor2 as any,
            '#000000',
          ]}
          style={StyleSheet.absoluteFill}
          locations={[0, 0.4, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.nebulaContainer,
          {
            transform: [{ rotate: nebulaSwirlRotate }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            premiumColors.neonCyan + '20',
            premiumColors.neonMagenta + '20',
            premiumColors.neonBlue + '15',
            'transparent',
          ]}
          style={styles.nebula}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.lightRayContainer,
          {
            transform: [{ rotate: lightRayRotateInterpolate }],
            opacity: 0.25,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            premiumColors.neonCyan + '50',
            'transparent',
          ]}
          style={styles.lightRay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <LinearGradient
          colors={[
            'transparent',
            premiumColors.neonMagenta + '50',
            'transparent',
          ]}
          style={[styles.lightRay, { transform: [{ rotate: '90deg' }] }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

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
              transform: [{ scale: particle.scale }],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: mainOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: Animated.multiply(logoScale, logoPulse) },
                { rotate: logoRotateInterpolate },
              ],
            },
          ]}
        >
          <View style={styles.logo3D}>
            <Animated.View
              style={[
                styles.glowBackground,
                {
                  opacity: glowIntensity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.7],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={[
                  premiumColors.neonCyan + 'CC',
                  premiumColors.neonMagenta + 'AA',
                  premiumColors.neonBlue + '88',
                ]}
                style={styles.glowGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            
            <BlurView intensity={80} tint="dark" style={styles.logoInner}>
              <View style={styles.logoZapContainer}>
                <Animated.View
                  style={[
                    {
                      transform: [
                        {
                          scale: sparkBurst.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.2, 1],
                          }),
                        },
                      ],
                      opacity: sparkBurst.interpolate({
                        inputRange: [0, 0.4, 1],
                        outputRange: [1, 0.8, 1],
                      }),
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 45,
                      backgroundColor: premiumColors.neonCyan + '15',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Zap 
                      size={56} 
                      color={premiumColors.neonCyan} 
                      strokeWidth={2.5} 
                      fill={premiumColors.neonCyan} 
                    />
                  </View>
                </Animated.View>
              </View>
            </BlurView>
          </View>
        </Animated.View>

        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>HUSTLEXP</Text>
        </View>

        <Text style={styles.tagline}>
          Start Your Journey
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Sparkles size={22} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
            <Text style={styles.statText}>AI-Powered Matching</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 20) + spacing.xl,
            opacity: mainOpacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLaunch}
          onPressIn={() => {
            sensory.tap();
            Animated.spring(buttonScale, {
              toValue: 0.95,
              tension: 300,
              friction: 12,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(buttonScale, {
              toValue: 1,
              tension: 300,
              friction: 12,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Animated.View
            style={[
              styles.startButton,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <BlurView intensity={30} tint="dark" style={styles.buttonBlur}>
              <View style={styles.buttonGradientContainer}>
                <LinearGradient
                  colors={[
                    premiumColors.neonCyan,
                    premiumColors.neonBlue,
                    premiumColors.neonMagenta,
                    premiumColors.neonAmber,
                  ]}
                  locations={[0, 0.3, 0.7, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                />
                <Animated.View
                  style={[
                    styles.buttonWave,
                    {
                      transform: [{ translateX: buttonWavePosition as any }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      'transparent',
                      'rgba(255, 255, 255, 0.6)',
                      'transparent',
                    ]}
                    style={styles.waveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </Animated.View>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Start Your Journey</Text>
                  <ArrowRight size={24} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {showConfetti && <ConfettiExplosion active={true} count={120} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  particle: {
    position: 'absolute',
    borderRadius: 100,
    zIndex: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
  nebulaContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2.5,
    height: SCREEN_HEIGHT * 2.5,
    left: -SCREEN_WIDTH * 0.75,
    top: -SCREEN_HEIGHT * 0.75,
  },
  nebula: {
    flex: 1,
    opacity: 0.5,
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
    height: 6,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: spacing.xxl * 1.5,
  },
  logo3D: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    zIndex: 0,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 80,
    shadowOpacity: 1,
  },
  glowGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  logoInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 6,
    borderColor: premiumColors.neonCyan,
    zIndex: 2,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 50,
    shadowOpacity: 1,
    elevation: 50,
    overflow: 'hidden',
  },
  logoZapContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
    opacity: 0.92,
  },
  tagline: {
    fontSize: 19,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xxl,
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
    shadowRadius: 50,
    shadowOpacity: 1,
    elevation: 30,
  },
  buttonBlur: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  buttonGradientContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius.full,
  },
  buttonGradient: {
    paddingVertical: spacing.xl * 1.2,
    paddingHorizontal: spacing.xxl,
  },
  buttonWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  waveGradient: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  buttonText: {
    fontSize: 19,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
