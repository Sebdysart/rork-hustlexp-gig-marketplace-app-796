import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Zap, Sparkles, Rocket, 
  ArrowRight, Trophy, TrendingUp 
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import { useSensory } from '@/hooks/useSensory';
import ConfettiExplosion from '@/components/tierS/Celebrations/ConfettiExplosion';
import React from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeMaxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const sensory = useSensory();

  const [showConfetti, setShowConfetti] = useState(false);
  
  const mainOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(mainOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [logoScale, mainOpacity, pulseAnim]);

  const handleGetStarted = () => {
    sensory.success();
    setShowConfetti(true);

    Animated.parallel([
      Animated.timing(mainOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1.5,
        duration: 400,
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

  const handlePressIn = () => {
    sensory.tap();
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#000000', '#001020', '#000814', '#000000']}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.3, 0.7, 1]}
      />

      <Animated.View
        style={[
          styles.glowCircle,
          {
            transform: [{ scale: pulseAnim }],
            opacity: 0.3,
          },
        ]}
      >
        <LinearGradient
          colors={[
            premiumColors.neonCyan + '60',
            premiumColors.neonMagenta + '40',
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
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <LinearGradient
              colors={[
                premiumColors.neonCyan,
                premiumColors.neonMagenta,
              ]}
              style={styles.logoGradientBorder}
            >
              <View style={styles.logoInner}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Zap size={100} color="#FFFFFF" strokeWidth={4} fill={premiumColors.neonCyan + '40'} />
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        <View style={styles.titleContainer}>
          <LinearGradient
            colors={[
              premiumColors.neonCyan,
              '#FFFFFF',
              premiumColors.neonMagenta,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradientWrapper}
          >
            <Text style={styles.mainTitle}>HUSTLEXP</Text>
          </LinearGradient>
        </View>

        <Text style={styles.tagline}>
          Start Your Journey
        </Text>

        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBg, { backgroundColor: premiumColors.neonCyan + '20' }]}>
              <Sparkles size={18} color={premiumColors.neonCyan} />
            </View>
            <Text style={styles.featureText}>AI-Powered Matching</Text>
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
          activeOpacity={1}
          onPress={handleGetStarted}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View
            style={[
              styles.startButton,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
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
              <View style={styles.buttonContent}>
                <Rocket size={22} color="#000000" strokeWidth={2.5} />
                <Text style={styles.buttonText}>Start Your Journey</Text>
                <ArrowRight size={22} color="#000000" strokeWidth={2.5} />
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {showConfetti && <ConfettiExplosion active={true} count={80} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  glowCircle: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH * 0.6,
    alignSelf: 'center',
    top: '35%',
  },
  glowGradient: {
    flex: 1,
    borderRadius: SCREEN_WIDTH * 0.6,
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
  logoCircle: {
    width: 180,
    height: 180,
  },
  logoGradientBorder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    padding: 4,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 0.8,
    elevation: 20,
  },
  logoInner: {
    flex: 1,
    borderRadius: 86,
    backgroundColor: '#000814',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleGradientWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: '#000000',
    letterSpacing: 4,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xxl,
    letterSpacing: 0.5,
  },
  featuresRow: {
    alignItems: 'center',
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
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
    shadowRadius: 30,
    shadowOpacity: 0.8,
    elevation: 15,
  },
  buttonGradient: {
    borderRadius: borderRadius.full,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xxl,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#000000',
    letterSpacing: 0.5,
  },
});
