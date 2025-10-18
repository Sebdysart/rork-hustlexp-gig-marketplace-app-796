import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Sparkles, Briefcase, Hammer, Zap, Star, Crown, Users, DollarSign, TrendingUp, Lock, Shield, Wrench, Building2, MapPin, Calendar } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { UserRole } from '@/types';
import { TradeCategory, TRADES } from '@/constants/tradesmen';
import Colors from '@/constants/colors';
import Confetti from '@/components/Confetti';
import { triggerHaptic } from '@/utils/haptics';
import { spacing, borderRadius, premiumColors, neonGlow } from '@/constants/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TASK_CATEGORIES = ['Delivery', 'Cleaning', 'Moving', 'Handyman', 'Photography', 'Pet Care', 'Tech Support', 'Tutoring', 'Landscaping', 'Assembly', 'Painting', 'Errands'];

export interface UserPreferences {
  preferredCategories: string[];
  priceRange: { min: number; max: number };
  maxDistance: number;
  workDays: string[];
  workHours: { start: number; end: number };
  urgencyPreference: string;
}

export default function OnboardingEnhancedScreen() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialIndex, setTutorialIndex] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [totalSteps, setTotalSteps] = useState<number>(3);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showQuestSneak, setShowQuestSneak] = useState<boolean>(false);
  const [aiNudgesOptIn, setAiNudgesOptIn] = useState<boolean>(true);
  const questSneakAnim = useRef(new Animated.Value(0)).current;

  const [selectedMode, setSelectedMode] = useState<'everyday' | 'tradesmen' | 'business' | null>(null);
  const [selectedTrades, setSelectedTrades] = useState<TradeCategory[]>([]);
  
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 20, max: 100 });
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [workHours, setWorkHours] = useState<{ start: number; end: number }>({ start: 9, end: 17 });
  const [urgencyPreference, setUrgencyPreference] = useState<string>('flexible');
  
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;
  const strengthBarAnim = useRef(new Animated.Value(0)).current;
  const ctaPulseAnim = useRef(new Animated.Value(1)).current;
  const inputFocusAnims = useRef({
    name: new Animated.Value(0),
    email: new Animated.Value(0),
    password: new Animated.Value(0),
  }).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const roleCardScales = useRef({
    everyday: new Animated.Value(1),
    tradesmen: new Animated.Value(1),
    business: new Animated.Value(1),
  }).current;
  const roleCardGlows = useRef({
    everyday: new Animated.Value(0),
    tradesmen: new Animated.Value(0),
    business: new Animated.Value(0),
  }).current;

  useEffect(() => {
    setTimeout(() => {
      setShowQuestSneak(true);
      Animated.timing(questSneakAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 800);

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(ctaPulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [glowAnim, logoRotateAnim, particleAnims, ctaPulseAnim]);

  useEffect(() => {
    const progress = step / totalSteps;
    Animated.spring(progressBarAnim, {
      toValue: progress,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [step, totalSteps, progressBarAnim]);

  const transitionToNextStep = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep((prev) => prev + 1);
      slideAnim.setValue(SCREEN_WIDTH);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
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
  };

  const handleContinue = () => {
    triggerHaptic('medium');
    
    if (step === 1 && name.trim() && email.trim() && password.trim()) {
      transitionToNextStep();
    } else if (step === 2 && selectedMode) {
      if (selectedMode === 'business') {
        setShowTutorial(true);
      } else if (selectedMode === 'tradesmen') {
        setTotalSteps(5);
        transitionToNextStep();
      } else {
        setTotalSteps(5);
        transitionToNextStep();
      }
    } else if (step === 3 && selectedTrades.length > 0) {
      transitionToNextStep();
    } else if (step === 4 && preferredCategories.length > 0) {
      transitionToNextStep();
    } else if (step === 5 && workDays.length > 0) {
      triggerHaptic('success');
      setShowConfetti(true);
      setShowTutorial(true);
    }
  };

  const handleModeSelect = (mode: 'everyday' | 'tradesmen' | 'business') => {
    triggerHaptic('selection');
    setSelectedMode(mode);
    setShowConfetti(true);
    
    Animated.sequence([
      Animated.parallel([
        Animated.spring(roleCardScales[mode], {
          toValue: 1.08,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(roleCardGlows[mode], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(roleCardScales[mode], {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Object.keys(roleCardScales).forEach((key) => {
      if (key !== mode) {
        Animated.parallel([
          Animated.spring(roleCardScales[key as keyof typeof roleCardScales], {
            toValue: 1,
            tension: 80,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(roleCardGlows[key as keyof typeof roleCardGlows], {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleTradeToggle = (trade: TradeCategory) => {
    triggerHaptic('selection');
    if (selectedTrades.includes(trade)) {
      setSelectedTrades(selectedTrades.filter(t => t !== trade));
    } else if (selectedTrades.length < 3) {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    const strength = calculatePasswordStrength(pwd);
    setPasswordStrength(strength);
    Animated.spring(strengthBarAnim, {
      toValue: strength / 100,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  };

  const getStrengthColor = (): string => {
    if (passwordStrength < 40) return '#FF3B30';
    if (passwordStrength < 70) return premiumColors.neonAmber;
    return premiumColors.neonGreen;
  };

  const getStrengthText = (): string => {
    if (passwordStrength < 40) return 'Weak - Make it epic!';
    if (passwordStrength < 70) return 'Good - Almost there!';
    return 'Epic! You\'re ready!';
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const completeWithPreferences = () => {
    const preferences: UserPreferences = {
      preferredCategories,
      priceRange,
      maxDistance,
      workDays,
      workHours,
      urgencyPreference,
    };
    
    if (selectedMode === 'tradesmen' && selectedTrades.length > 0) {
      setTimeout(() => {
        (completeOnboarding as any)(name, 'worker', {
          lat: 37.7749,
          lng: -122.4194,
          address: 'San Francisco, CA',
        }, email, password, 'tradesmen', selectedTrades, preferences);
        router.replace('/(tabs)/home');
      }, 500);
    } else if (selectedMode) {
      const role: UserRole = selectedMode === 'business' ? 'poster' : 'worker';
      setTimeout(() => {
        (completeOnboarding as any)(name, role, {
          lat: 37.7749,
          lng: -122.4194,
          address: 'San Francisco, CA',
        }, email, password, selectedMode, undefined, preferences);
        router.replace('/(tabs)/home');
      }, 500);
    }
  };

  useEffect(() => {
    if (showTutorial && selectedMode) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showTutorial, selectedMode, fadeAnim]);

  const renderTutorial = () => {
    if (!showTutorial || !selectedMode) return null;

    const tutorials = {
      everyday: [
        { icon: <Zap size={48} color={premiumColors.neonAmber} />, title: 'Quick Gigs', desc: 'Accept simple tasks like errands, deliveries, and odd jobs' },
        { icon: <DollarSign size={48} color={premiumColors.neonGreen} />, title: 'Fast Cash', desc: 'Get paid instantly after completing tasks. Build your reputation fast' },
        { icon: <TrendingUp size={48} color={premiumColors.neonCyan} />, title: 'Level Up', desc: 'Earn XP, unlock badges, and climb the leaderboard with every task' },
      ],
      tradesmen: [
        { icon: <Briefcase size={48} color={premiumColors.neonBlue} />, title: 'Pro Jobs', desc: 'Access skilled trade jobs with higher pay and professional clients' },
        { icon: <Star size={48} color={premiumColors.neonAmber} />, title: 'Trade Badges', desc: 'Earn trade-specific badges from Copper to Diamond as you master your craft' },
        { icon: <Users size={48} color={premiumColors.neonMagenta} />, title: 'Form Squads', desc: 'Team up with other tradesmen for larger projects and bigger payouts' },
      ],
      business: [
        { icon: <Sparkles size={48} color={premiumColors.neonMagenta} />, title: 'Post Jobs', desc: 'Create tasks and get matched with qualified workers in seconds' },
        { icon: <Users size={48} color={premiumColors.neonCyan} />, title: 'Instant Match', desc: 'AI finds the perfect worker based on skills, location, and trust score' },
        { icon: <Star size={48} color={premiumColors.neonAmber} />, title: 'Track Progress', desc: 'Monitor work with GPS check-ins, proof photos, and real-time updates' },
      ],
    };

    const slides = tutorials[selectedMode];
    const currentSlide = slides[tutorialIndex];

    return (
      <View style={styles.tutorialOverlay}>
        <LinearGradient
          colors={[premiumColors.deepBlack + 'F0', premiumColors.richBlack + 'F0']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.tutorialContent}>
          <Animated.View style={[styles.tutorialCard, { opacity: fadeAnim }]}>
            <BlurView intensity={40} tint="dark" style={styles.tutorialBlur}>
              <View style={styles.tutorialIconContainer}>
                {currentSlide.icon}
              </View>
              <Text style={styles.tutorialTitle}>{currentSlide.title}</Text>
              <Text style={styles.tutorialDesc}>{currentSlide.desc}</Text>
              
              <View style={styles.tutorialDots}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tutorialDot,
                      i === tutorialIndex && styles.tutorialDotActive,
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.tutorialButton}
                onPress={() => {
                  triggerHaptic('selection');
                  if (tutorialIndex < slides.length - 1) {
                    setTutorialIndex(tutorialIndex + 1);
                  } else {
                    completeWithPreferences();
                  }
                }}
              >
                <LinearGradient
                  colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tutorialButtonGradient}
                >
                  <Text style={styles.tutorialButtonText}>
                    {tutorialIndex < slides.length - 1 ? 'Next' : 'Start Hustling!'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tutorialSkip}
                onPress={() => {
                  triggerHaptic('light');
                  completeWithPreferences();
                }}
              >
                <Text style={styles.tutorialSkipText}>Skip</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0C', '#12121A', '#1A1A2E', '#1F1F3A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.gridOverlay} />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      {particleAnims.map((anim, index) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_HEIGHT, -100],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, 0.8, 0.8, 0],
        });
        const scale = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1.2, 0.5],
        });
        const left = (index * SCREEN_WIDTH) / 12;
        const colors = [premiumColors.neonCyan, premiumColors.neonMagenta, premiumColors.neonAmber];
        const color = colors[index % colors.length];

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left,
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          >
            <Sparkles size={index % 2 === 0 ? 20 : 14} color={color} />
          </Animated.View>
        );
      })}

      {showConfetti && <Confetti />}
      {renderTutorial()}
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={[
            styles.scrollView,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: spacing.xl,
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.contentWrapper, 
              { 
                opacity: fadeAnim, 
                transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
              }
            ]}
          >
            {/* Render step based on current step value... */}
            {step === 1 && (
              <Text style={styles.title}>Step 1: Basic Info</Text>
            )}
            {step === 2 && (
              <Text style={styles.title}>Step 2: Choose Mode</Text>
            )}
            {step === 3 && (
              <Text style={styles.title}>Step 3: Select Trades</Text>
            )}
            {step === 4 && (
              <Text style={styles.title}>Step 4: Task Preferences</Text>
            )}
            {step === 5 && (
              <Text style={styles.title}>Step 5: Availability</Text>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 200,
    backgroundColor: premiumColors.neonCyan,
    opacity: 0.15,
    borderRadius: 9999,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: premiumColors.neonMagenta,
    opacity: 0.1,
    borderRadius: 9999,
  },
  particle: {
    position: 'absolute',
    zIndex: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialContent: {
    width: '100%',
    paddingHorizontal: spacing.xxxl,
  },
  tutorialCard: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  tutorialBlur: {
    padding: spacing.xxxl,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    alignItems: 'center',
  },
  tutorialIconContainer: {
    marginBottom: spacing.xl,
  },
  tutorialTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  tutorialDesc: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  tutorialDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tutorialDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassWhite,
  },
  tutorialDotActive: {
    width: 24,
    backgroundColor: premiumColors.neonCyan,
  },
  tutorialButton: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  tutorialButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tutorialSkip: {
    paddingVertical: spacing.sm,
  },
  tutorialSkipText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    opacity: 0.7,
  },
});
