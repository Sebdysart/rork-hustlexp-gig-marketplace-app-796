import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, Target, Trophy, Users, TrendingUp, Sparkles, Briefcase, Hammer, Building2, Star, Map, Shield, DollarSign, MessageCircle, Award } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';
import Confetti from '@/components/Confetti';
import React from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TutorialSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    route: string;
  };
}

export default function WelcomeTutorialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const { fromOnboarding } = useLocalSearchParams<{ fromOnboarding?: string }>();
  
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fromOnboarding === 'true') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [fromOnboarding]);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: currentSlide / (slides.length - 1),
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [currentSlide, progressAnim]);

  const mode = currentUser?.activeMode || 'everyday';
  const role = currentUser?.role || 'worker';

  const getTutorialSlides = (): TutorialSlide[] => {
    if (mode === 'business' || role === 'poster') {
      return [
        {
          icon: <Briefcase size={64} color={premiumColors.neonMagenta} strokeWidth={2} />,
          title: 'Welcome, Business Commander! 💼',
          description: "You're now in Business Mode. Post tasks, hire workers, and grow your empire.",
        },
        {
          icon: <Sparkles size={64} color={premiumColors.neonViolet} strokeWidth={2} />,
          title: 'AI-Powered Task Creation',
          description: 'Use our AI Assistant to create tasks instantly. Just tell us what you need, and we match you with the perfect worker.',
          action: {
            label: 'Try AI Creator',
            route: '/ai-task-creator',
          },
        },
        {
          icon: <Target size={64} color={premiumColors.neonCyan} strokeWidth={2} />,
          title: 'Instant Matching',
          description: 'Our AI finds qualified workers near you based on skills, ratings, and availability. Get matched in seconds!',
        },
        {
          icon: <Shield size={64} color={premiumColors.neonGreen} strokeWidth={2} />,
          title: 'Track & Protect',
          description: 'Monitor progress with GPS check-ins, proof photos, and real-time updates. Escrow protects both parties.',
        },
        {
          icon: <Star size={64} color={premiumColors.neonAmber} strokeWidth={2} />,
          title: 'Build Your Reputation',
          description: 'Rate workers after completion. Great reviews attract top talent and help the community thrive.',
        },
      ];
    }

    if (mode === 'tradesmen') {
      return [
        {
          icon: <Hammer size={64} color={premiumColors.neonBlue} strokeWidth={2} />,
          title: 'Welcome, Tradesman Pro! 🔧',
          description: "You're in Tradesmen Mode. Accept pro jobs, earn trade badges, and build your career.",
        },
        {
          icon: <Trophy size={64} color={premiumColors.neonAmber} strokeWidth={2} />,
          title: 'Trade Badge System',
          description: 'Earn specialized badges from Copper to Diamond as you master your craft. Each level unlocks higher-paying jobs.',
        },
        {
          icon: <DollarSign size={64} color={premiumColors.neonGreen} strokeWidth={2} />,
          title: 'Premium Earnings',
          description: 'Skilled trade jobs pay more. Build your reputation to unlock exclusive high-value projects.',
        },
        {
          icon: <Users size={64} color={premiumColors.neonCyan} strokeWidth={2} />,
          title: 'Form Squads',
          description: 'Team up with other tradesmen for larger projects. Share earnings and tackle bigger challenges together.',
          action: {
            label: 'Explore Squads',
            route: '/squads',
          },
        },
        {
          icon: <Award size={64} color={premiumColors.neonViolet} strokeWidth={2} />,
          title: 'Certifications Matter',
          description: 'Upload certifications to boost trust score and access premium job boards. Show clients you\'re the real deal.',
        },
      ];
    }

    return [
      {
        icon: <Zap size={64} color={premiumColors.neonAmber} strokeWidth={2} />,
        title: 'Welcome, Everyday Hustler! ⚡',
        description: "You're ready to hustle! Accept tasks, earn rewards, and build your reputation.",
      },
      {
        icon: <Map size={64} color={premiumColors.neonCyan} strokeWidth={2} />,
        title: 'Find Tasks Nearby',
        description: 'Browse the map to discover gigs in your area. Filter by pay, distance, and category.',
        action: {
          label: 'Open Map',
          route: '/adventure-map',
        },
      },
      {
        icon: <Target size={64} color={premiumColors.neonViolet} strokeWidth={2} />,
        title: 'Accept & Complete Tasks',
        description: 'Choose tasks that match your skills. Submit proof when done, and get paid instantly.',
      },
      {
        icon: <TrendingUp size={64} color={premiumColors.neonGreen} strokeWidth={2} />,
        title: 'Build Your Profile',
        description: 'Complete tasks to boost your trust score. Better reputation means more opportunities and higher pay.',
      },
      {
        icon: <Shield size={64} color={premiumColors.neonCyan} strokeWidth={2} />,
        title: 'Stay Protected',
        description: 'Escrow system holds payment safely. Only released when both parties confirm completion.',
      },
      {
        icon: <MessageCircle size={64} color={premiumColors.neonMagenta} strokeWidth={2} />,
        title: 'Chat with HustleAI',
        description: 'Get personalized guidance, task suggestions, and instant help from our AI assistant. Available 24/7 in your chat.',
      },
    ];
  };

  const slides = getTutorialSlides();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      triggerHaptic('medium');
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -SCREEN_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentSlide(currentSlide + 1);
        slideAnim.setValue(SCREEN_WIDTH);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    triggerHaptic('light');
    router.replace('/(tabs)/home');
  };

  const handleFinish = () => {
    triggerHaptic('success');
    setShowConfetti(true);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 1000);
    });
  };

  const handleActionPress = (route: string) => {
    triggerHaptic('medium');
    router.push(route as any);
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack, premiumColors.charcoal]}
        style={StyleSheet.absoluteFill}
      />
      
      {showConfetti && <Confetti />}

      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={[premiumColors.neonCyan, premiumColors.neonMagenta]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressText}>
              {currentSlide + 1} of {slides.length}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.slideContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconGlow}>
              {slide.icon}
            </View>
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>

          {slide.action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleActionPress(slide.action!.route)}
              activeOpacity={0.8}
            >
              <BlurView intensity={40} tint="dark" style={styles.actionBlur}>
                <LinearGradient
                  colors={[premiumColors.neonCyan + '40', premiumColors.neonBlue + '20']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionLabel}>{slide.action.label}</Text>
                  <Sparkles size={18} color={premiumColors.neonCyan} strokeWidth={2} />
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          )}

          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? 'Let\'s Hustle! 🚀' : 'Next'}
              </Text>
              <Zap size={20} color={premiumColors.deepBlack} fill={premiumColors.deepBlack} strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressContainer: {
    flex: 1,
    marginRight: spacing.lg,
    gap: spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.xxxl,
    alignItems: 'center',
  },
  iconGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  actionBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '60',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: premiumColors.glassWhite,
    opacity: 0.3,
  },
  dotActive: {
    width: 24,
    backgroundColor: premiumColors.neonCyan,
    opacity: 1,
  },
  footer: {
    paddingTop: spacing.lg,
  },
  nextButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.cyan,
    shadowRadius: 30,
    shadowOpacity: 0.9,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
});
