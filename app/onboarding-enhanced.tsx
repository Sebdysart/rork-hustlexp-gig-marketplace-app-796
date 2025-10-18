import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Sparkles, Briefcase, Zap, Star, Crown, Users, DollarSign, TrendingUp, Calendar, Clock, MapPinIcon } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { UserRole } from '@/types';
import { TradeCategory } from '@/constants/tradesmen';
import Colors from '@/constants/colors';
import Confetti from '@/components/Confetti';
import { triggerHaptic } from '@/utils/haptics';
import { spacing, borderRadius, premiumColors } from '@/constants/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TASK_CATEGORIES = [
  { id: 'delivery', name: 'Delivery', icon: '📦' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'moving', name: 'Moving', icon: '🚚' },
  { id: 'handyman', name: 'Handyman', icon: '🔧' },
  { id: 'photography', name: 'Photography', icon: '📸' },
  { id: 'petcare', name: 'Pet Care', icon: '🐕' },
  { id: 'techsupport', name: 'Tech Support', icon: '💻' },
  { id: 'tutoring', name: 'Tutoring', icon: '📚' },
  { id: 'landscaping', name: 'Landscaping', icon: '🌳' },
  { id: 'assembly', name: 'Assembly', icon: '🛠️' },
  { id: 'painting', name: 'Painting', icon: '🎨' },
  { id: 'errands', name: 'Errands', icon: '🏃' },
];

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
  const [step, setStep] = useState<number>(4);
  const [totalSteps] = useState<number>(5);
  const [name] = useState<string>('Test User');
  const [email] = useState<string>('test@example.com');
  const [password] = useState<string>('password123');

  const [selectedMode] = useState<'everyday' | 'tradesmen' | 'business'>('everyday');
  const [selectedTrades] = useState<TradeCategory[]>([]);
  
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 20, max: 100 });
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [workHours, setWorkHours] = useState<{ start: number; end: number }>({ start: 9, end: 17 });
  const [urgencyPreference, setUrgencyPreference] = useState<string>('flexible');
  
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;
  const ctaPulseAnim = useRef(new Animated.Value(1)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    
    if (step === 4 && preferredCategories.length > 0) {
      transitionToNextStep();
    } else if (step === 5 && workDays.length > 0) {
      triggerHaptic('success');
      setShowConfetti(true);
      setShowTutorial(true);
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
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
    
    const role: UserRole = selectedMode === 'business' ? 'poster' : 'worker';
    setTimeout(() => {
      (completeOnboarding as any)(name, role, {
        lat: 37.7749,
        lng: -122.4194,
        address: 'San Francisco, CA',
      }, email, password, selectedMode, selectedTrades.length > 0 ? selectedTrades : undefined, preferences);
      router.replace('/(tabs)/home');
    }, 500);
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
            {step === 4 && (
              <>
                <View style={styles.header}>
                  <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
                    <LinearGradient
                      colors={[premiumColors.neonAmber, premiumColors.neonOrange, 'transparent']}
                      style={styles.iconGradientBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.iconGlow}>
                        <Sparkles size={38} color={premiumColors.neonAmber} strokeWidth={2.5} />
                      </View>
                    </LinearGradient>
                  </Animated.View>
                  <Text style={styles.title}>Task Preferences</Text>
                  <Text style={styles.subtitle}>Help AI find tasks perfect for you</Text>
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
                          colors={[premiumColors.neonAmber, premiumColors.neonOrange]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      </Animated.View>
                    </View>
                    <Text style={styles.progressText}>Step {step} of {totalSteps}</Text>
                  </View>
                </View>

                <ScrollView style={styles.preferencesScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.sectionLabel}>Categories You Like</Text>
                  <View style={styles.categoriesGrid}>
                    {TASK_CATEGORIES.map((category) => {
                      const isSelected = preferredCategories.includes(category.id);
                      return (
                        <TouchableOpacity
                          key={category.id}
                          style={styles.categoryChip}
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
                          <BlurView intensity={isSelected ? 40 : 20} tint="dark" style={styles.categoryChipBlur}>
                            <LinearGradient
                              colors={isSelected ? [premiumColors.neonAmber + '60', premiumColors.neonOrange + '40', 'transparent'] as const : ['transparent', 'transparent'] as const}
                              style={styles.categoryChipGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <View style={[styles.categoryChipContent, isSelected && styles.categoryChipSelected]}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text style={[styles.categoryName, isSelected && { color: premiumColors.neonAmber }]}>{category.name}</Text>
                                {isSelected && (
                                  <View style={styles.categorySelectedBadge}>
                                    <Sparkles size={10} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                                  </View>
                                )}
                              </View>
                            </LinearGradient>
                          </BlurView>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.sliderSection}>
                    <View style={styles.sliderHeader}>
                      <View style={styles.sliderIconWrapper}>
                        <DollarSign size={20} color={premiumColors.neonGreen} strokeWidth={2.5} />
                      </View>
                      <View style={styles.sliderHeaderText}>
                        <Text style={styles.sectionLabel}>Price Range</Text>
                        <Text style={styles.sliderValue}>${priceRange.min} - ${priceRange.max}</Text>
                      </View>
                    </View>
                    <BlurView intensity={30} tint="dark" style={styles.sliderCard}>
                      <View style={styles.sliderTrack}>
                        <View style={[styles.sliderTrackFill, { width: `${((priceRange.max - 10) / 490) * 100}%` }]} />
                        <View style={styles.sliderLabels}>
                          <Text style={styles.sliderLabel}>$10</Text>
                          <Text style={styles.sliderLabel}>$500</Text>
                        </View>
                      </View>
                      <View style={styles.sliderButtons}>
                        <TouchableOpacity
                          style={styles.sliderButton}
                          onPress={() => {
                            triggerHaptic('light');
                            setPriceRange({ ...priceRange, min: Math.max(10, priceRange.min - 10) });
                          }}
                        >
                          <Text style={styles.sliderButtonText}>−</Text>
                        </TouchableOpacity>
                        <View style={styles.sliderButtonSpacer} />
                        <TouchableOpacity
                          style={styles.sliderButton}
                          onPress={() => {
                            triggerHaptic('light');
                            setPriceRange({ ...priceRange, max: Math.min(500, priceRange.max + 10) });
                          }}
                        >
                          <Text style={styles.sliderButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  </View>

                  <View style={styles.sliderSection}>
                    <View style={styles.sliderHeader}>
                      <View style={styles.sliderIconWrapper}>
                        <MapPinIcon size={20} color={premiumColors.neonCyan} strokeWidth={2.5} />
                      </View>
                      <View style={styles.sliderHeaderText}>
                        <Text style={styles.sectionLabel}>Max Travel Distance</Text>
                        <Text style={styles.sliderValue}>{maxDistance} miles</Text>
                      </View>
                    </View>
                    <BlurView intensity={30} tint="dark" style={styles.sliderCard}>
                      <View style={styles.sliderTrack}>
                        <View style={[styles.sliderTrackFill, { width: `${(maxDistance / 50) * 100}%` }]} />
                        <View style={styles.sliderLabels}>
                          <Text style={styles.sliderLabel}>1 mi</Text>
                          <Text style={styles.sliderLabel}>50 mi</Text>
                        </View>
                      </View>
                      <View style={styles.sliderButtons}>
                        <TouchableOpacity
                          style={styles.sliderButton}
                          onPress={() => {
                            triggerHaptic('light');
                            setMaxDistance(Math.max(1, maxDistance - 5));
                          }}
                        >
                          <Text style={styles.sliderButtonText}>−</Text>
                        </TouchableOpacity>
                        <View style={styles.sliderButtonSpacer} />
                        <TouchableOpacity
                          style={styles.sliderButton}
                          onPress={() => {
                            triggerHaptic('light');
                            setMaxDistance(Math.min(50, maxDistance + 5));
                          }}
                        >
                          <Text style={styles.sliderButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </BlurView>
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
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={preferredCategories.length > 0 ? [premiumColors.neonAmber, premiumColors.neonOrange] : [premiumColors.glassWhite, premiumColors.glassWhite]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Sparkles size={22} color={preferredCategories.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} fill={preferredCategories.length > 0 ? premiumColors.deepBlack : 'transparent'} />
                      <Text style={[styles.buttonText, preferredCategories.length === 0 && styles.buttonTextDisabled]}>Next: Availability</Text>
                      <Zap size={22} color={preferredCategories.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} fill={preferredCategories.length > 0 ? premiumColors.deepBlack : 'transparent'} strokeWidth={3} />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
            {step === 5 && (
              <>
                <View style={styles.header}>
                  <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
                    <LinearGradient
                      colors={[premiumColors.neonViolet, premiumColors.neonMagenta, 'transparent']}
                      style={styles.iconGradientBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.iconGlow}>
                        <Calendar size={38} color={premiumColors.neonViolet} strokeWidth={2.5} />
                      </View>
                    </LinearGradient>
                  </Animated.View>
                  <Text style={styles.title}>Your Availability</Text>
                  <Text style={styles.subtitle}>When are you ready to hustle?</Text>
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
                          colors={[premiumColors.neonViolet, premiumColors.neonMagenta]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      </Animated.View>
                    </View>
                    <Text style={styles.progressText}>Step {step} of {totalSteps} - Final Step!</Text>
                  </View>
                </View>

                <ScrollView style={styles.preferencesScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.sectionLabel}>Available Days</Text>
                  <View style={styles.daysGrid}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isSelected = workDays.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          style={styles.dayChip}
                          onPress={() => {
                            triggerHaptic('selection');
                            if (isSelected) {
                              setWorkDays(workDays.filter(d => d !== day));
                            } else {
                              setWorkDays([...workDays, day]);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <BlurView intensity={isSelected ? 40 : 20} tint="dark" style={styles.dayChipBlur}>
                            <LinearGradient
                              colors={isSelected ? [premiumColors.neonViolet + '80', premiumColors.neonMagenta + '40'] as const : [premiumColors.glassDark, premiumColors.glassDark] as const}
                              style={styles.dayChipGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                            </LinearGradient>
                          </BlurView>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.sliderSection}>
                    <View style={styles.sliderHeader}>
                      <View style={styles.sliderIconWrapper}>
                        <Clock size={20} color={premiumColors.neonBlue} strokeWidth={2.5} />
                      </View>
                      <View style={styles.sliderHeaderText}>
                        <Text style={styles.sectionLabel}>Work Hours</Text>
                        <Text style={styles.sliderValue}>{workHours.start}:00 - {workHours.end}:00</Text>
                      </View>
                    </View>
                    <BlurView intensity={30} tint="dark" style={styles.sliderCard}>
                      <View style={styles.timePickerRow}>
                        <View style={styles.timePicker}>
                          <Text style={styles.timeLabel}>Start</Text>
                          <View style={styles.timeButtons}>
                            <TouchableOpacity
                              style={styles.timeButton}
                              onPress={() => {
                                triggerHaptic('light');
                                setWorkHours({ ...workHours, start: Math.max(0, workHours.start - 1) });
                              }}
                            >
                              <Text style={styles.timeButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.timeValue}>{workHours.start.toString().padStart(2, '0')}:00</Text>
                            <TouchableOpacity
                              style={styles.timeButton}
                              onPress={() => {
                                triggerHaptic('light');
                                setWorkHours({ ...workHours, start: Math.min(23, workHours.start + 1) });
                              }}
                            >
                              <Text style={styles.timeButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.timePicker}>
                          <Text style={styles.timeLabel}>End</Text>
                          <View style={styles.timeButtons}>
                            <TouchableOpacity
                              style={styles.timeButton}
                              onPress={() => {
                                triggerHaptic('light');
                                setWorkHours({ ...workHours, end: Math.max(0, workHours.end - 1) });
                              }}
                            >
                              <Text style={styles.timeButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.timeValue}>{workHours.end.toString().padStart(2, '0')}:00</Text>
                            <TouchableOpacity
                              style={styles.timeButton}
                              onPress={() => {
                                triggerHaptic('light');
                                setWorkHours({ ...workHours, end: Math.min(23, workHours.end + 1) });
                              }}
                            >
                              <Text style={styles.timeButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </BlurView>
                  </View>

                  <Text style={styles.sectionLabel}>Urgency Preference</Text>
                  <View style={styles.urgencyGrid}>
                    {[
                      { id: 'asap', label: 'ASAP', icon: '⚡', color: premiumColors.neonAmber },
                      { id: 'flexible', label: 'Flexible', icon: '⏰', color: premiumColors.neonCyan },
                      { id: 'scheduled', label: 'Scheduled', icon: '📅', color: premiumColors.neonViolet },
                    ].map((option) => {
                      const isSelected = urgencyPreference === option.id;
                      return (
                        <TouchableOpacity
                          key={option.id}
                          style={styles.urgencyChip}
                          onPress={() => {
                            triggerHaptic('selection');
                            setUrgencyPreference(option.id);
                          }}
                          activeOpacity={0.8}
                        >
                          <BlurView intensity={isSelected ? 40 : 20} tint="dark" style={styles.urgencyChipBlur}>
                            <LinearGradient
                              colors={isSelected ? [option.color + '60', option.color + '30', 'transparent'] as const : [premiumColors.glassDark, premiumColors.glassDark] as const}
                              style={styles.urgencyChipGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <View style={[styles.urgencyChipContent, isSelected && { borderColor: option.color }]}>
                                <Text style={styles.urgencyIcon}>{option.icon}</Text>
                                <Text style={[styles.urgencyLabel, isSelected && { color: option.color }]}>{option.label}</Text>
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
                    transform: [{ scale: workDays.length > 0 ? ctaPulseAnim : 1 }],
                  }}
                >
                  <TouchableOpacity
                    style={[styles.button, workDays.length === 0 && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={workDays.length === 0}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={workDays.length > 0 ? [premiumColors.neonViolet, premiumColors.neonMagenta] : [premiumColors.glassWhite, premiumColors.glassWhite]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Sparkles size={22} color={workDays.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} strokeWidth={3} fill={workDays.length > 0 ? premiumColors.deepBlack : 'transparent'} />
                      <Text style={[styles.buttonText, workDays.length === 0 && styles.buttonTextDisabled]}>Start My Journey! 🚀</Text>
                      <Crown size={22} color={workDays.length > 0 ? premiumColors.deepBlack : Colors.textSecondary} fill={workDays.length > 0 ? premiumColors.deepBlack : 'transparent'} strokeWidth={3} />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </>
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xs,
    position: 'relative',
  },
  iconGradientBg: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 255, 0.4)',
  },
  title: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    textAlign: 'center',
    letterSpacing: -2,
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
  progressBarContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  progressBarBg: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: 6,
    backgroundColor: premiumColors.glassDark,
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  preferencesScroll: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryChip: {
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  categoryChipBlur: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  categoryChipGradient: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  categoryChipContent: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  categoryChipSelected: {
    borderColor: premiumColors.neonAmber,
    borderWidth: 2,
    backgroundColor: premiumColors.neonAmber + '10',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  categorySelectedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  sliderSection: {
    marginBottom: spacing.xl,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sliderIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  sliderHeaderText: {
    flex: 1,
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
    marginTop: 2,
  },
  sliderCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    overflow: 'hidden',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: premiumColors.glassDark,
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  sliderTrackFill: {
    height: '100%',
    backgroundColor: premiumColors.neonCyan,
    borderRadius: 9999,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  sliderButton: {
    flex: 1,
    height: 48,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sliderButtonSpacer: {
    width: spacing.sm,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dayChip: {
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.sm * 6) / 7,
    height: 60,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  dayChipBlur: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  dayChipGradient: {
    flex: 1,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
  },
  dayTextSelected: {
    color: premiumColors.neonViolet,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timePicker: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  timeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timeButton: {
    width: 40,
    height: 40,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  urgencyGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  urgencyChip: {
    flex: 1,
    height: 80,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  urgencyChipBlur: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  urgencyChipGradient: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  urgencyChipContent: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  urgencyLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  button: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.4,
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
    borderRadius: 9999,
    backgroundColor: premiumColors.glassWhite,
  },
  tutorialDotActive: {
    width: 24,
    backgroundColor: premiumColors.neonCyan,
  },
  tutorialButton: {
    width: '100%',
    borderRadius: 9999,
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
