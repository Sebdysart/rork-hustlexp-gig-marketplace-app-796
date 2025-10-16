import { useState, useRef, ReactNode } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronRight, Zap, Target, Trophy, Sparkles, Rocket, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { spacing, typography, borderRadius, premiumColors, neonGlow } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TutorialSlide {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string[];
  glowColor: string;
}

const slides: TutorialSlide[] = [
  {
    icon: <Zap size={64} color={premiumColors.neonCyan} strokeWidth={2.5} />,
    title: 'Instant Match',
    description: 'Get hired in 90 seconds. AI matches you with perfect gigs based on skills, location, and trust score.',
    gradient: [premiumColors.neonCyan, premiumColors.neonBlue],
    glowColor: premiumColors.neonCyan,
  },
  {
    icon: <Target size={64} color={premiumColors.neonMagenta} strokeWidth={2.5} />,
    title: 'Complete Quests',
    description: 'Accept tasks, check in with GPS, upload proof, and get paid instantly. Every quest levels you up.',
    gradient: [premiumColors.neonMagenta, premiumColors.neonViolet],
    glowColor: premiumColors.neonMagenta,
  },
  {
    icon: <Trophy size={64} color={premiumColors.neonAmber} strokeWidth={2.5} />,
    title: 'Earn XP & Rank Up',
    description: 'Gain XP with every task. Unlock badges, power-ups, and climb the leaderboard to legendary status.',
    gradient: [premiumColors.neonAmber, '#FF6B00'],
    glowColor: premiumColors.neonAmber,
  },
  {
    icon: <Shield size={64} color={premiumColors.neonGreen} strokeWidth={2.5} />,
    title: 'Build Trust Score',
    description: 'Your reputation travels with you. ProofLink portfolio shows verified work and boosts your hire rate.',
    gradient: [premiumColors.neonGreen, premiumColors.neonCyan],
    glowColor: premiumColors.neonGreen,
  },
  {
    icon: <Rocket size={64} color={premiumColors.neonViolet} strokeWidth={2.5} />,
    title: 'Ready to Hustle?',
    description: 'Join squads, compete in seasons, and dominate the marketplace. Your adventure starts now.',
    gradient: [premiumColors.neonViolet, premiumColors.neonMagenta],
    glowColor: premiumColors.neonViolet,
  },
];

interface TutorialCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function TutorialCarousel({ onComplete, onSkip }: TutorialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    triggerHaptic('selection');
    
    if (currentIndex === slides.length - 1) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        triggerHaptic('success');
        onComplete();
      }, 200);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
        
        Animated.parallel([
          Animated.spring(fadeAnim, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }

    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSkip = () => {
    triggerHaptic('light');
    onSkip();
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack, premiumColors.charcoal]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <BlurView intensity={20} tint="dark" style={styles.skipBlur}>
          <Text style={styles.skipText}>Skip</Text>
        </BlurView>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: index === currentIndex ? fadeAnim : 0.3,
                  transform: [{ scale: index === currentIndex ? scaleAnim : 0.9 }],
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <Animated.View
                  style={[
                    styles.iconGlow,
                    {
                      shadowColor: slide.glowColor,
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[slide.gradient[0], slide.gradient[1], 'transparent'] as const}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.iconWrapper}>{slide.icon}</View>
                  </LinearGradient>
                </Animated.View>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                index === currentIndex && {
                  backgroundColor: currentSlide.gradient[0],
                  ...neonGlow.subtle,
                  shadowColor: currentSlide.gradient[0],
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={[currentSlide.gradient[0], currentSlide.gradient[1]] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? "Let's Go" : 'Next'}
            </Text>
            {currentIndex === slides.length - 1 ? (
              <Sparkles size={20} color={Colors.text} />
            ) : (
              <ChevronRight size={20} color={Colors.text} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  skipBlur: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  skipText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: spacing.xxxl * 2,
  },
  iconGlow: {
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 0.8,
  },
  iconGradient: {
    width: 180,
    height: 180,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.lg * typography.lineHeights.relaxed,
    maxWidth: 320,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.xxxl,
  },
  pagination: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassWhite,
  },
  dotActive: {
    width: 32,
  },
  nextButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.subtle,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
  },
  nextText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
});
