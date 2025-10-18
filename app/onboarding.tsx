import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Sparkles, Briefcase, Hammer, Zap, Star, Crown, Users, DollarSign, TrendingUp, Lock, Shield, Wrench, Building2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { UserRole } from '@/types';
import { TradeCategory, TRADES } from '@/constants/tradesmen';
import { OFFER_CATEGORIES } from '@/constants/offerCategories';
import Colors from '@/constants/colors';
import Confetti from '@/components/Confetti';
import { triggerHaptic } from '@/utils/haptics';
import { spacing, borderRadius, premiumColors, neonGlow } from '@/constants/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialIndex, setTutorialIndex] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 500]);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [availability, setAvailability] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showQuestSneak, setShowQuestSneak] = useState<boolean>(false);
  const [aiNudgesOptIn, setAiNudgesOptIn] = useState<boolean>(true);
  const questSneakAnim = useRef(new Animated.Value(0)).current;

  const [selectedMode, setSelectedMode] = useState<'everyday' | 'tradesmen' | 'business' | null>(null);
  const [recommendedMode, setRecommendedMode] = useState<'everyday' | 'tradesmen' | 'business' | null>(null);
  const [selectedTrades, setSelectedTrades] = useState<TradeCategory[]>([]);
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
    const progress = step / 6;
    Animated.spring(progressBarAnim, {
      toValue: progress,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [step, progressBarAnim]);

  const transitionToNextStep = () => {
    triggerHaptic('medium');
    
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
      setStep(step + 1);
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

  const calculateRecommendedMode = (): 'everyday' | 'tradesmen' | 'business' => {
    const avgPrice = (priceRange[0] + priceRange[1]) / 2;
    const hasWeekendAvailability = availability.includes('weekend');
    const hasManyCategories = preferredCategories.length >= 3;
    
    if (avgPrice < 100 && maxDistance <= 5) {
      return 'everyday';
    } else if (avgPrice > 200 || hasManyCategories) {
      return 'tradesmen';
    } else if (hasWeekendAvailability && avgPrice > 150) {
      return 'business';
    }
    
    return 'everyday';
  };

  const handleContinue = () => {
    if (step === 1 && name.trim()) {
      transitionToNextStep();
    } else if (step === 2 && email.trim() && password.trim()) {
      transitionToNextStep();
    } else if (step === 3) {
      transitionToNextStep();
    } else if (step === 4 && preferredCategories.length > 0) {
      transitionToNextStep();
    } else if (step === 5 && availability.length > 0) {
      const recommended = calculateRecommendedMode();
      setRecommendedMode(recommended);
      transitionToNextStep();
    } else if (step === 6 && selectedMode) {
      if (selectedMode === 'tradesmen') {
        transitionToNextStep();
      } else {
        triggerHaptic('success');
        setShowTutorial(true);
      }
    } else if (step === 7 && selectedTrades.length > 0) {
      triggerHaptic('success');
      setShowConfetti(true);
      setShowTutorial(true);
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
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
    return 'Epic! You&apos;re ready!';
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (showTutorial && selectedMode) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showTutorial, selectedMode, fadeAnim]);



  const renderRoleTutorial = () => {
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
                    if (selectedMode === 'tradesmen' && selectedTrades.length > 0) {
                      setTimeout(() => {
                        completeOnboarding(name, 'worker', {
                          lat: 37.7749,
                          lng: -122.4194,
                          address: 'San Francisco, CA',
                        }, email, password, 'tradesmen', selectedTrades);
                        router.replace('/(tabs)/home');
                      }, 500);
                    } else if (selectedMode) {
                      const role: UserRole = selectedMode === 'business' ? 'poster' : 'worker';
                      setTimeout(() => {
                        completeOnboarding(name, role, {
                          lat: 37.7749,
                          lng: -122.4194,
                          address: 'San Francisco, CA',
                        }, email, password, selectedMode);
                        router.replace('/(tabs)/home');
                      }, 500);
                    }
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
                  if (selectedMode === 'tradesmen' && selectedTrades.length > 0) {
                    completeOnboarding(name, 'worker', {
                      lat: 37.7749,
                      lng: -122.4194,
                      address: 'San Francisco, CA',
                    }, email, password, 'tradesmen', selectedTrades);
                    router.replace('/(tabs)/home');
                  } else if (selectedMode) {
                    const role: UserRole = selectedMode === 'business' ? 'poster' : 'worker';
                    completeOnboarding(name, role, {
                      lat: 37.7749,
                      lng: -122.4194,
                      address: 'San Francisco, CA',
                    }, email, password, selectedMode);
                    router.replace('/(tabs)/home');
                  }
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
      {renderRoleTutorial()}
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View 
          style={[
            styles.scrollView,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: spacing.xl,
            }
          ]}
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
        {step === 1 ? (
          <>
            {!keyboardVisible && (
              <View style={styles.header}>
                <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
                  <LinearGradient
                    colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
                    style={styles.iconGradientBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Animated.View style={[styles.logoRing, { transform: [{ rotate: logoRotate }] }]}>
                      <View style={styles.logoRingInner} />
                    </Animated.View>
                    <View style={styles.iconGlow}>
                      <Zap size={48} color={premiumColors.neonCyan} strokeWidth={3} />
                    </View>
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.title}>HustleXP</Text>
                <Text style={styles.subtitle}>Your Journey to Legendary Status Starts Here</Text>
                <View style={styles.tagline}>
                  <Sparkles size={16} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                  <Text style={styles.taglineText}>Level Up Your Hustle</Text>
                  <Sparkles size={16} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                </View>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name</Text>
                <Animated.View
                  style={{
                    transform: [{
                      scale: inputFocusAnims.name.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.02],
                      }),
                    }],
                  }}
                >
                <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconBg}>
                      <Sparkles size={18} color={premiumColors.neonCyan} strokeWidth={2.5} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor={premiumColors.glassWhiteStrong}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      returnKeyType="next"
                      accessible={true}
                      accessibilityLabel="Name Input Field"
                      accessibilityHint="Enter your first and last name"
                      onFocus={() => {
                        Animated.spring(inputFocusAnims.name, {
                          toValue: 1,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onBlur={() => {
                        Animated.spring(inputFocusAnims.name, {
                          toValue: 0,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                    />
                  </View>
                </BlurView>
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <Animated.View
                  style={{
                    transform: [{
                      scale: inputFocusAnims.email.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.02],
                      }),
                    }],
                  }}
                >
                <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconBg}>
                      <Lock size={18} color={premiumColors.neonCyan} strokeWidth={2.5} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="your.email@example.com"
                      placeholderTextColor={premiumColors.glassWhiteStrong}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      accessible={true}
                      accessibilityLabel="Email Address Input Field"
                      accessibilityHint="Enter your email address"
                      onFocus={() => {
                        Animated.spring(inputFocusAnims.email, {
                          toValue: 1,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onBlur={() => {
                        Animated.spring(inputFocusAnims.email, {
                          toValue: 0,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                    />
                  </View>
                </BlurView>
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Create Password</Text>
                <Animated.View
                  style={{
                    transform: [{
                      scale: inputFocusAnims.password.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.02],
                      }),
                    }],
                  }}
                >
                <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconBg}>
                      <Shield size={18} color={premiumColors.neonCyan} strokeWidth={2.5} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Make it epic!"
                      placeholderTextColor={premiumColors.glassWhiteStrong}
                      value={password}
                      onChangeText={handlePasswordChange}
                      secureTextEntry
                      returnKeyType="go"
                      onSubmitEditing={handleContinue}
                      accessible={true}
                      accessibilityLabel="Password Input Field"
                      accessibilityHint="Create a strong password with at least 8 characters"
                      onFocus={() => {
                        Animated.spring(inputFocusAnims.password, {
                          toValue: 1,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onBlur={() => {
                        Animated.spring(inputFocusAnims.password, {
                          toValue: 0,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                    />
                  </View>
                </BlurView>
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <Animated.View
                        style={[
                          styles.strengthBarFill,
                          {
                            width: strengthBarAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: getStrengthColor(),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                      {getStrengthText()}
                    </Text>
                  </View>
                )}
                </Animated.View>
              </View>
              
              {showQuestSneak && !keyboardVisible && (
                <Animated.View
                  style={[
                    styles.questSneakBanner,
                    {
                      opacity: questSneakAnim,
                      transform: [
                        {
                          translateY: questSneakAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                  accessible={true}
                  accessibilityLabel="First Quest Sneak Peek: Earn 50 XP on signup"
                >
                  <BlurView intensity={40} tint="dark" style={styles.questSneakBlur}>
                    <LinearGradient
                      colors={[premiumColors.neonCyan + '40', premiumColors.neonBlue + '20']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.questSneakGradient}
                    >
                      <Sparkles size={20} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                      <View style={styles.questSneakTextContainer}>
                        <Text style={styles.questSneakTitle}>First Quest Sneak Peek</Text>
                        <Text style={styles.questSneakSubtitle}>Earn 50 XP on signup! 🎯</Text>
                      </View>
                      <Zap size={20} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                    </LinearGradient>
                  </BlurView>
                </Animated.View>
              )}

              {!keyboardVisible && (
                <View style={styles.securityBadge} accessible={true} accessibilityLabel="Your information is secure with 256-bit encryption">
                  <Shield size={14} color={premiumColors.neonGreen} strokeWidth={2.5} />
                  <Text style={styles.securityText}>Your info is secure with 256-bit encryption</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.aiOptInContainer}
                onPress={() => setAiNudgesOptIn(!aiNudgesOptIn)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityLabel="Opt-in for AI nudges"
                accessibilityState={{ checked: aiNudgesOptIn }}
              >
                <View style={[styles.checkbox, aiNudgesOptIn && styles.checkboxActive]}>
                  {aiNudgesOptIn && <Sparkles size={14} color={premiumColors.deepBlack} fill={premiumColors.deepBlack} />}
                </View>
                <Text style={styles.aiOptInText}>Enable AI nudges (adjust in Wellbeing Settings later)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressBarAnim.interpolate({
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
              <Text style={styles.progressText}>Step {step} of 6</Text>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: name.trim() && email.trim() && password.trim() ? ctaPulseAnim : 1 }],
              }}
            >
            <TouchableOpacity
              style={[styles.button, (!name.trim() || !email.trim() || !password.trim()) && styles.buttonDisabled]}
              onPress={() => {
                triggerHaptic('success');
                handleContinue();
              }}
              disabled={!name.trim() || !email.trim() || !password.trim()}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Let's Hustle - Continue to next step"
              accessibilityState={{ disabled: !name.trim() || !email.trim() || !password.trim() }}
            >
              <LinearGradient
                colors={name.trim() && email.trim() && password.trim() ? [premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta] : [premiumColors.glassWhite, premiumColors.glassWhite]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Zap size={24} color={name.trim() && email.trim() && password.trim() ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} fill={name.trim() && email.trim() && password.trim() ? premiumColors.deepBlack : 'transparent'} />
                <Text style={[styles.buttonText, (!name.trim() || !email.trim() || !password.trim()) && styles.buttonTextDisabled]}>Let&apos;s Hustle 🚀</Text>
                <Sparkles size={22} color={name.trim() && email.trim() && password.trim() ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
            </Animated.View>
          </>
        ) : step === 2 ? (
          <>
            <View style={styles.header}>
              <Text style={styles.pathTitle}>Secure Your Account</Text>
              <Text style={styles.pathSubtitle}>Set up your credentials</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressBarAnim.interpolate({
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
                <Text style={styles.progressText}>Step {step} of 6</Text>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <Animated.View
                  style={{
                    transform: [{
                      scale: inputFocusAnims.email.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.02],
                      }),
                    }],
                  }}
                >
                <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconBg}>
                      <Lock size={18} color={premiumColors.neonCyan} strokeWidth={2.5} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="your.email@example.com"
                      placeholderTextColor={premiumColors.glassWhiteStrong}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      onFocus={() => {
                        Animated.spring(inputFocusAnims.email, {
                          toValue: 1,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onBlur={() => {
                        Animated.spring(inputFocusAnims.email, {
                          toValue: 0,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                    />
                  </View>
                </BlurView>
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Create Password</Text>
                <Animated.View
                  style={{
                    transform: [{
                      scale: inputFocusAnims.password.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.02],
                      }),
                    }],
                  }}
                >
                <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconBg}>
                      <Shield size={18} color={premiumColors.neonCyan} strokeWidth={2.5} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Make it epic!"
                      placeholderTextColor={premiumColors.glassWhiteStrong}
                      value={password}
                      onChangeText={handlePasswordChange}
                      secureTextEntry
                      returnKeyType="go"
                      onSubmitEditing={handleContinue}
                      onFocus={() => {
                        Animated.spring(inputFocusAnims.password, {
                          toValue: 1,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onBlur={() => {
                        Animated.spring(inputFocusAnims.password, {
                          toValue: 0,
                          tension: 100,
                          friction: 7,
                          useNativeDriver: true,
                        }).start();
                      }}
                    />
                  </View>
                </BlurView>
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <Animated.View
                        style={[
                          styles.strengthBarFill,
                          {
                            width: strengthBarAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: getStrengthColor(),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                      {getStrengthText()}
                    </Text>
                  </View>
                )}
                </Animated.View>
              </View>

              <View style={styles.securityBadge}>
                <Shield size={14} color={premiumColors.neonGreen} strokeWidth={2.5} />
                <Text style={styles.securityText}>Your info is secure with 256-bit encryption</Text>
              </View>

              <TouchableOpacity
                style={styles.aiOptInContainer}
                onPress={() => setAiNudgesOptIn(!aiNudgesOptIn)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, aiNudgesOptIn && styles.checkboxActive]}>
                  {aiNudgesOptIn && <Sparkles size={14} color={premiumColors.deepBlack} fill={premiumColors.deepBlack} />}
                </View>
                <Text style={styles.aiOptInText}>Enable AI nudges (adjust in Wellbeing Settings later)</Text>
              </TouchableOpacity>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: email.trim() && password.trim() ? ctaPulseAnim : 1 }],
              }}
            >
            <TouchableOpacity
              style={[styles.button, (!email.trim() || !password.trim()) && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!email.trim() || !password.trim()}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={email.trim() && password.trim() ? [premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta] : [premiumColors.glassWhite, premiumColors.glassWhite]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Zap size={24} color={email.trim() && password.trim() ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} fill={email.trim() && password.trim() ? premiumColors.deepBlack : 'transparent'} />
                <Text style={[styles.buttonText, (!email.trim() || !password.trim()) && styles.buttonTextDisabled]}>Continue 🔒</Text>
                <Sparkles size={22} color={email.trim() && password.trim() ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
            </Animated.View>
          </>
        ) : step === 3 ? (
          <>
            <View style={styles.header}>
              <Text style={styles.pathTitle}>Set Your Location</Text>
              <Text style={styles.pathSubtitle}>Help us find tasks nearby</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressBarAnim.interpolate({
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
                <Text style={styles.progressText}>Step {step} of 6</Text>
              </View>
            </View>

            <View style={styles.form}>
              <BlurView intensity={40} tint="dark" style={styles.locationCard}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationTitle}>Max Distance</Text>
                <Text style={styles.locationValue}>{maxDistance} miles</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>1 mi</Text>
                  <View style={styles.sliderTrack}>
                    <Animated.View style={[styles.sliderFill, { width: `${(maxDistance / 25) * 100}%` }]} />
                    <View style={styles.sliderThumbWrapper}>
                      {[1, 5, 10, 15, 25].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => {
                            setMaxDistance(val);
                            triggerHaptic('selection');
                          }}
                          style={[styles.sliderThumb, maxDistance === val && styles.sliderThumbActive]}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.sliderLabel}>25 mi</Text>
                </View>
              </BlurView>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Zap size={24} color={premiumColors.deepBlack} strokeWidth={3} fill={premiumColors.deepBlack} />
                <Text style={styles.buttonText}>Continue 📍</Text>
                <Sparkles size={22} color={premiumColors.deepBlack} strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : step === 4 ? (
          <>
            <View style={styles.header}>
              <Text style={styles.pathTitle}>Task Categories</Text>
              <Text style={styles.pathSubtitle}>What type of work interests you?</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressBarAnim.interpolate({
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
                <Text style={styles.progressText}>Step {step} of 6</Text>
              </View>
            </View>

            <ScrollView style={styles.categoriesScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.categoriesGrid}>
                {OFFER_CATEGORIES.slice(0, 8).map((category) => {
                  const isSelected = preferredCategories.includes(category.id);
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryCard}
                      onPress={() => {
                        triggerHaptic('selection');
                        if (isSelected) {
                          setPreferredCategories(preferredCategories.filter(c => c !== category.id));
                        } else {
                          setPreferredCategories([...preferredCategories, category.id]);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <BlurView intensity={isSelected ? 40 : 20} tint="dark" style={styles.categoryBlur}>
                        <View style={[styles.categoryContent, isSelected && styles.categorySelected]}>
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text style={styles.categoryName}>{category.name}</Text>
                          {isSelected && (
                            <View style={styles.categoryCheck}>
                              <Sparkles size={12} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                            </View>
                          )}
                        </View>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Animated.View
              style={{
                transform: [{ scale: preferredCategories.length > 0 ? ctaPulseAnim : 1 }],
              }}
            >
            <TouchableOpacity
              style={[styles.button, preferredCategories.length === 0 && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={preferredCategories.length === 0}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={preferredCategories.length > 0 ? [premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta] : [premiumColors.glassWhite, premiumColors.glassWhite]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Sparkles size={22} color={preferredCategories.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} fill={preferredCategories.length > 0 ? premiumColors.deepBlack : 'transparent'} />
                <Text style={[styles.buttonText, preferredCategories.length === 0 && styles.buttonTextDisabled]}>Continue 🎯</Text>
                <Zap size={22} color={preferredCategories.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} fill={preferredCategories.length > 0 ? premiumColors.deepBlack : 'transparent'} strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
            </Animated.View>
          </>
        ) : step === 5 ? (
          <>
            <View style={styles.header}>
              <Text style={styles.pathTitle}>Price & Availability</Text>
              <Text style={styles.pathSubtitle}>When can you hustle?</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressBarAnim.interpolate({
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
                <Text style={styles.progressText}>Step {step} of 6</Text>
              </View>
            </View>

            <View style={styles.form}>
              <BlurView intensity={40} tint="dark" style={styles.priceCard}>
                <Text style={styles.priceTitle}>💰 Price Range</Text>
                <Text style={styles.priceValue}>${priceRange[0]} - ${priceRange[1]}</Text>
                <View style={styles.priceSliders}>
                  <View style={styles.priceSliderRow}>
                    <Text style={styles.priceLabel}>Min: ${priceRange[0]}</Text>
                    <View style={styles.priceButtons}>
                      {[20, 50, 100, 200].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => {
                            setPriceRange([val, Math.max(val + 50, priceRange[1])]);
                            triggerHaptic('selection');
                          }}
                          style={[styles.priceButton, priceRange[0] === val && styles.priceButtonActive]}
                        >
                          <Text style={[styles.priceButtonText, priceRange[0] === val && styles.priceButtonTextActive]}>${val}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.priceSliderRow}>
                    <Text style={styles.priceLabel}>Max: ${priceRange[1]}</Text>
                    <View style={styles.priceButtons}>
                      {[100, 250, 500, 1000].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => {
                            setPriceRange([Math.min(priceRange[0], val - 50), val]);
                            triggerHaptic('selection');
                          }}
                          style={[styles.priceButton, priceRange[1] === val && styles.priceButtonActive]}
                        >
                          <Text style={[styles.priceButtonText, priceRange[1] === val && styles.priceButtonTextActive]}>${val}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </BlurView>

              <BlurView intensity={40} tint="dark" style={styles.availabilityCard}>
                <Text style={styles.availabilityTitle}>⏰ When Are You Free?</Text>
                <View style={styles.availabilityGrid}>
                  {['weekday_morning', 'weekday_afternoon', 'weekday_evening', 'weekend', 'flexible'].map((time) => {
                    const isSelected = availability.includes(time);
                    const labels: Record<string, string> = {
                      weekday_morning: '🌅 Weekday AM',
                      weekday_afternoon: '☀️ Weekday PM',
                      weekday_evening: '🌙 Weekday Eve',
                      weekend: '🎉 Weekend',
                      flexible: '⚡ Flexible',
                    };
                    return (
                      <TouchableOpacity
                        key={time}
                        onPress={() => {
                          triggerHaptic('selection');
                          if (isSelected) {
                            setAvailability(availability.filter(a => a !== time));
                          } else {
                            setAvailability([...availability, time]);
                          }
                        }}
                        style={[styles.availabilityChip, isSelected && styles.availabilityChipActive]}
                      >
                        <Text style={[styles.availabilityChipText, isSelected && styles.availabilityChipTextActive]}>
                          {labels[time]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </BlurView>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: availability.length > 0 ? ctaPulseAnim : 1 }],
              }}
            >
            <TouchableOpacity
              style={[styles.button, availability.length === 0 && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={availability.length === 0}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={availability.length > 0 ? [premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta] : [premiumColors.glassWhite, premiumColors.glassWhite]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Sparkles size={22} color={availability.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} fill={availability.length > 0 ? premiumColors.deepBlack : 'transparent'} />
                <Text style={[styles.buttonText, availability.length === 0 && styles.buttonTextDisabled]}>AI Analyze Me 🤖</Text>
                <Zap size={22} color={availability.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} fill={availability.length > 0 ? premiumColors.deepBlack : 'transparent'} strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
            </Animated.View>
          </>
        ) : step === 6 ? (
          <>
            <View style={styles.header}>
              <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
                <LinearGradient
                  colors={[premiumColors.neonMagenta, premiumColors.neonViolet, premiumColors.neonCyan]}
                  style={styles.iconGradientBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Animated.View style={[styles.logoRing, { transform: [{ rotate: logoRotate }] }]}>
                    <View style={styles.logoRingInner} />
                  </Animated.View>
                  <View style={styles.iconGlow}>
                    <Crown size={42} color={premiumColors.neonMagenta} strokeWidth={2.5} fill={premiumColors.neonMagenta + '40'} />
                  </View>
                </LinearGradient>
              </Animated.View>
              <Text style={styles.pathTitle}>AI Recommends Your Path</Text>
              <Text style={styles.pathSubtitle}>Based on your preferences, but you choose!</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressBarAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[premiumColors.neonMagenta, premiumColors.neonViolet]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </View>
                <Text style={styles.progressText}>Step {step} of 6</Text>
              </View>
            </View>

            <View style={styles.roleContainer}>
              {[
                { 
                  mode: 'everyday' as const, 
                  icon: Hammer, 
                  title: 'Everyday Hustler', 
                  description: 'Simple tasks, errands, and gigs—quick XP gains!', 
                  tooltip: 'Perfect for side hustles and fast cash',
                  gradient: [premiumColors.neonAmber, '#FF6B00'],
                  accentColor: premiumColors.neonAmber,
                },
                { 
                  mode: 'tradesmen' as const, 
                  icon: Wrench, 
                  title: 'Tradesman Pro', 
                  description: 'Skilled trades and professional work—unlock premium badges!', 
                  tooltip: 'For certified professionals and skilled workers',
                  gradient: [premiumColors.neonBlue, premiumColors.neonCyan],
                  accentColor: premiumColors.neonBlue,
                },
                { 
                  mode: 'business' as const, 
                  icon: Building2, 
                  title: 'Business Poster', 
                  description: 'Post jobs and hire workers—build your empire!', 
                  tooltip: 'Manage projects and hire top talent',
                  gradient: [premiumColors.neonMagenta, premiumColors.neonViolet],
                  accentColor: premiumColors.neonMagenta,
                },
              ].map((option) => {
                const isSelected = selectedMode === option.mode;
                const isRecommended = recommendedMode === option.mode;
                const IconComponent = option.icon;
                const cardScale = roleCardScales[option.mode];
                const cardGlow = roleCardGlows[option.mode];

                return (
                  <Animated.View
                    key={option.mode}
                    style={[
                      styles.roleCardWrapper,
                      {
                        transform: [{ scale: cardScale }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.roleCardTouchable}
                      onPress={() => handleModeSelect(option.mode)}
                      activeOpacity={0.9}
                      accessibilityLabel={`${option.title}: ${option.description}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <BlurView intensity={isSelected ? 50 : isRecommended ? 40 : 25} tint="dark" style={styles.roleCardBlur}>
                        <LinearGradient
                          colors={isSelected ? [option.gradient[0] + '60', option.gradient[1] + '40', 'transparent'] as const : isRecommended ? [option.gradient[0] + '40', option.gradient[1] + '20', 'transparent'] as const : [premiumColors.glassDark + '40', 'transparent'] as const}
                          style={styles.roleCardGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Animated.View 
                            style={[
                              styles.roleCard, 
                              isSelected && styles.roleCardSelected,
                              isRecommended && styles.roleCardRecommended,
                              {
                                shadowOpacity: cardGlow.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 0.8],
                                }),
                                shadowRadius: cardGlow.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 30],
                                }),
                              },
                            ]}
                          >
                            {isRecommended && (
                              <View style={styles.aiRecommendBadge}>
                                <Sparkles size={16} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} strokeWidth={2.5} />
                                <Text style={styles.aiRecommendText}>AI Pick</Text>
                              </View>
                            )}
                            <View style={[styles.roleIconContainer, isSelected && { backgroundColor: option.accentColor + '20' }]}>
                              <IconComponent size={32} color={isSelected ? option.accentColor : premiumColors.glassWhiteStrong} strokeWidth={2.5} />
                            </View>
                            <View style={styles.roleAvatarPreview}>
                              <View style={[styles.roleAvatarSilhouette, { borderColor: option.accentColor }]} />
                            </View>
                            <Text style={[styles.roleTitle, isSelected && { color: option.accentColor }]}>{option.title}</Text>
                            <Text style={styles.roleDescription}>{option.description}</Text>
                            {isSelected && (
                              <View style={styles.selectedBadge}>
                                <Sparkles size={18} color={option.accentColor} fill={option.accentColor} strokeWidth={2.5} />
                              </View>
                            )}
                            <View style={styles.roleFloatingParticles}>
                              {[0, 1, 2].map((i) => (
                                <View key={i} style={[styles.floatingParticle, { backgroundColor: option.accentColor + '60' }]} />
                              ))}
                            </View>
                          </Animated.View>
                        </LinearGradient>
                      </BlurView>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            <Animated.View
              style={{
                transform: [{ scale: selectedMode ? ctaPulseAnim : 1 }],
              }}
            >
            <TouchableOpacity
              style={[styles.pathButton, !selectedMode && styles.buttonDisabled]}
              onPress={() => {
                triggerHaptic('success');
                handleContinue();
              }}
              disabled={!selectedMode}
              activeOpacity={0.85}
              accessibilityLabel="Continue to next step"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={selectedMode ? [premiumColors.neonMagenta, premiumColors.neonViolet, premiumColors.neonCyan] : [premiumColors.glassWhite, premiumColors.glassWhite]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.pathButtonGradient}
              >
                <Sparkles size={22} color={selectedMode ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} fill={selectedMode ? premiumColors.deepBlack : 'transparent'} />
                <Text style={[styles.pathButtonText, !selectedMode && styles.buttonTextDisabled]}>Begin Your Grind 💪</Text>
                <Zap size={22} color={selectedMode ? premiumColors.deepBlack : Colors.textSecondary} fill={selectedMode ? premiumColors.deepBlack : 'transparent'} strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
            </Animated.View>
          </>
        ) : step === 7 ? (
          <>
            <View style={styles.header}>
              <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
                <LinearGradient
                  colors={[premiumColors.neonBlue, premiumColors.neonCyan, 'transparent']}
                  style={styles.iconGradientBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.iconGlow}>
                    <Briefcase size={38} color={premiumColors.neonBlue} strokeWidth={2.5} />
                  </View>
                </LinearGradient>
              </Animated.View>
              <Text style={styles.title}>Select Your Trades</Text>
              <Text style={styles.subtitle}>Choose up to 3 trades you specialize in</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressBarAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[premiumColors.neonBlue, premiumColors.neonCyan]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </View>
                <Text style={styles.progressText}>Step 7 of 7 - Final Step!</Text>
              </View>
            </View>

            <ScrollView style={styles.tradesScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.tradesGrid}>
                {TRADES.map((trade) => {
                  const isSelected = selectedTrades.includes(trade.id);
                  const isDisabled = !isSelected && selectedTrades.length >= 3;

                  return (
                    <TouchableOpacity
                      key={trade.id}
                      style={[styles.tradeCard, isDisabled && styles.tradeCardDisabled]}
                      onPress={() => handleTradeToggle(trade.id)}
                      disabled={isDisabled}
                      activeOpacity={0.8}
                    >
                      <BlurView intensity={isSelected ? 40 : 20} tint="dark" style={styles.tradeCardBlur}>
                        <LinearGradient
                          colors={isSelected ? [trade.color + '80', trade.color + '40', 'transparent'] as const : ['transparent', 'transparent'] as const}
                          style={styles.tradeCardGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <View style={[styles.tradeCardContent, isSelected && styles.tradeCardSelected]}>
                            <Text style={styles.tradeIcon}>{trade.icon}</Text>
                            <Text style={styles.tradeName}>{trade.name}</Text>
                            {isSelected && (
                              <View style={styles.tradeSelectedBadge}>
                                <Sparkles size={12} color={trade.color} fill={trade.color} />
                              </View>
                            )}
                          </View>
                        </LinearGradient>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Animated.View
              style={{
                transform: [{ scale: selectedTrades.length > 0 ? ctaPulseAnim : 1 }],
              }}
            >
            <TouchableOpacity
              style={[styles.button, selectedTrades.length === 0 && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={selectedTrades.length === 0}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedTrades.length > 0 ? [premiumColors.neonBlue, premiumColors.neonCyan] : [premiumColors.glassWhite, premiumColors.glassWhite]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Sparkles size={22} color={selectedTrades.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} fill={selectedTrades.length > 0 ? premiumColors.deepBlack : 'transparent'} />
                <Text style={[styles.buttonText, selectedTrades.length === 0 && styles.buttonTextDisabled]}>Unlock Your Journey ⚡</Text>
                <Zap size={22} color={selectedTrades.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} fill={selectedTrades.length > 0 ? premiumColors.deepBlack : 'transparent'} strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
            </Animated.View>
          </>
        ) : null}
          </Animated.View>
        </View>
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
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
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
    ...neonGlow.cyan,
    shadowRadius: 100,
    shadowOpacity: 0.5,
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
    ...neonGlow.magenta,
    shadowRadius: 120,
    shadowOpacity: 0.4,
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
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xs,
    position: 'relative',
  },
  iconGradientBg: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 50,
    shadowOpacity: 1,
  },
  logoRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    borderStyle: 'dashed',
  },
  logoRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.full,
  },
  iconGlow: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 255, 0.4)',
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 0.8,
  },
  tagline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.4)',
    ...neonGlow.cyan,
    shadowRadius: 25,
    shadowOpacity: 0.6,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    textAlign: 'center',
    letterSpacing: -2,
    textShadowColor: premiumColors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  pathTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
    letterSpacing: -1.2,
    textShadowColor: premiumColors.neonMagenta + '80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  pathSubtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic' as const,
    letterSpacing: 0.4,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassWhite,
    opacity: 0.4,
  },
  progressDotActive: {
    width: 32,
    backgroundColor: premiumColors.neonMagenta,
    opacity: 1,
    ...neonGlow.subtle,
    shadowColor: premiumColors.neonMagenta,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  form: {
    gap: spacing.xs,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  inputBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.25)',
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    shadowColor: premiumColors.neonCyan,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  strengthContainer: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  strengthBar: {
    height: 6,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  roleContainer: {
    gap: spacing.sm,
  },
  roleCardWrapper: {
    borderRadius: borderRadius.xxl,
    overflow: 'visible',
  },
  roleCardTouchable: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  roleCardBlur: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  roleCardGradient: {
    borderRadius: borderRadius.xxl,
  },
  roleCard: {
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    position: 'relative',
    minHeight: 160,
    justifyContent: 'center',
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0,
    shadowRadius: 0,
    backgroundColor: 'rgba(18, 18, 26, 0.6)',
  },
  roleCardSelected: {
    borderColor: premiumColors.neonCyan,
    borderWidth: 3,
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  roleAvatarPreview: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    opacity: 0.3,
  },
  roleAvatarSilhouette: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    backgroundColor: premiumColors.glassDark,
  },
  roleFloatingParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  floatingParticle: {
    width: 4,
    height: 4,
    borderRadius: borderRadius.full,
    opacity: 0.6,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  roleDescription: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.9,
    letterSpacing: 0.2,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    ...neonGlow.cyan,
    shadowRadius: 20,
    shadowOpacity: 0.9,
  },
  pathButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.magenta,
    shadowRadius: 35,
    shadowOpacity: 0.9,
  },
  pathButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.xl + 2,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pathButtonText: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.8,
  },
  button: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: Colors.textSecondary,
  },
  tradesScroll: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  tradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  tradeCard: {
    width: (SCREEN_WIDTH - spacing.xxxl * 2 - spacing.md * 2) / 3,
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  tradeCardDisabled: {
    opacity: 0.4,
  },
  tradeCardBlur: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  tradeCardGradient: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  tradeCardContent: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tradeCardSelected: {
    borderColor: premiumColors.neonCyan,
    borderWidth: 2,
    ...neonGlow.subtle,
    shadowColor: premiumColors.neonCyan,
  },
  tradeIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  tradeName: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tradeSelectedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
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
    letterSpacing: -0.8,
  },
  tutorialDesc: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    opacity: 0.9,
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
    letterSpacing: 0.5,
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: premiumColors.neonGreen + '40',
    alignSelf: 'center',
  },
  securityText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonGreen,
    letterSpacing: 0.3,
  },
  progressBarContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  questSneakBanner: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  questSneakBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '60',
  },
  questSneakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  questSneakTextContainer: {
    flex: 1,
  },
  questSneakTitle: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  questSneakSubtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 2,
  },
  aiOptInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: premiumColors.glassWhiteStrong,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: premiumColors.neonCyan,
    borderColor: premiumColors.neonCyan,
  },
  aiOptInText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 16,
  },
  locationCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  locationValue: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.lg,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: premiumColors.neonCyan,
    borderRadius: borderRadius.full,
  },
  sliderThumbWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sliderThumb: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassWhiteStrong,
    borderWidth: 2,
    borderColor: premiumColors.glassDark,
  },
  sliderThumbActive: {
    backgroundColor: premiumColors.neonCyan,
    borderColor: premiumColors.neonCyan,
    transform: [{ scale: 1.3 }],
  },
  categoriesScroll: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  categoryCard: {
    width: (SCREEN_WIDTH - spacing.xxxl * 2 - spacing.md) / 2,
    aspectRatio: 1.3,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  categoryBlur: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  categoryContent: {
    flex: 1,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  categorySelected: {
    borderColor: premiumColors.neonCyan,
    borderWidth: 3,
    backgroundColor: premiumColors.neonCyan + '15',
  },
  categoryIcon: {
    fontSize: 42,
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  categoryCheck: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  priceCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: premiumColors.neonAmber + '40',
    marginBottom: spacing.md,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: premiumColors.neonAmber,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  priceSliders: {
    gap: spacing.md,
  },
  priceSliderRow: {
    gap: spacing.sm,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.xs,
  },
  priceButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  priceButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: premiumColors.glassDark,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  priceButtonActive: {
    backgroundColor: premiumColors.neonAmber + '20',
    borderColor: premiumColors.neonAmber,
  },
  priceButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
  },
  priceButtonTextActive: {
    color: premiumColors.neonAmber,
  },
  availabilityCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: premiumColors.neonMagenta + '40',
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  availabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  availabilityChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  availabilityChipActive: {
    backgroundColor: premiumColors.neonMagenta + '20',
    borderColor: premiumColors.neonMagenta,
  },
  availabilityChipText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
  },
  availabilityChipTextActive: {
    color: premiumColors.neonMagenta,
  },
  roleCardRecommended: {
    borderColor: premiumColors.neonAmber,
    borderWidth: 3,
    backgroundColor: premiumColors.neonAmber + '15',
  },
  aiRecommendBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: premiumColors.deepBlack,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
    ...neonGlow.subtle,
    shadowColor: premiumColors.neonAmber,
  },
  aiRecommendText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
});
