import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, Trophy, Target, Sparkles, TrendingUp, Users, Star, Gift, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import Confetti from '@/components/Confetti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();

  const [showConfetti, setShowConfetti] = useState(true);
  const hasRedirectedRef = useRef(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setShowConfetti(false), 4000);
  }, [fadeAnim, scaleAnim, slideAnim]);

  if (!currentUser) {
    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace('/onboarding');
    }
    return null;
  }

  const getModeContent = () => {
    switch (currentUser.activeMode) {
      case 'business':
        return {
          title: 'Welcome, Business Poster! 🏢',
          subtitle: 'You are all set to post tasks and hire top talent',
          icon: <Gift size={64} color={premiumColors.neonMagenta} strokeWidth={2} />,
          features: [
            { icon: <Sparkles size={24} color={premiumColors.neonCyan} />, title: 'AI Smart Matching', description: 'Get matched with the best workers instantly' },
            { icon: <Target size={24} color={premiumColors.neonAmber} />, title: 'Post Your First Task', description: 'Create a task in seconds with AI assistance' },
            { icon: <Users size={24} color={premiumColors.neonMagenta} />, title: 'Track Progress', description: 'Monitor work with real-time updates and GPS' },
          ],
        };
      case 'tradesmen':
        return {
          title: 'Welcome, Tradesman Pro! ⚡',
          subtitle: 'Your journey to mastery begins now',
          icon: <Trophy size={64} color={premiumColors.neonBlue} strokeWidth={2} />,
          features: [
            { icon: <Star size={24} color={premiumColors.neonAmber} />, title: 'Earn Trade Badges', description: 'Progress from Copper to Diamond in your trades' },
            { icon: <TrendingUp size={24} color={premiumColors.neonGreen} />, title: 'Premium Jobs', description: 'Access higher-paying skilled trade projects' },
            { icon: <Users size={24} color={premiumColors.neonCyan} />, title: 'Form Squads', description: 'Team up for larger projects and bigger payouts' },
          ],
        };
      default:
        return {
          title: 'Welcome, Everyday Hustler! 💪',
          subtitle: 'Your adventure to legendary status starts now',
          icon: <Zap size={64} color={premiumColors.neonCyan} strokeWidth={2} fill={premiumColors.neonCyan} />,
          features: [
            { icon: <Zap size={24} color={premiumColors.neonCyan} />, title: 'Complete Quick Gigs', description: 'Simple tasks, errands, and fast cash' },
            { icon: <Trophy size={24} color={premiumColors.neonAmber} />, title: 'Level Up Fast', description: 'Earn XP, unlock badges, climb the leaderboard' },
            { icon: <Target size={24} color={premiumColors.neonMagenta} />, title: 'Daily Quests', description: 'Complete challenges for bonus rewards' },
          ],
        };
    }
  };

  const content = getModeContent();

  const quickStartGuides = [
    {
      id: 1,
      title: 'Your Profile',
      description: 'View your stats, level, and badges',
      icon: <Star size={20} color={premiumColors.neonAmber} />,
      route: '/(tabs)/profile',
    },
    {
      id: 2,
      title: currentUser.activeMode === 'business' ? 'Post a Task' : 'Browse Tasks',
      description: currentUser.activeMode === 'business' ? 'Create your first job posting' : 'Find gigs near you',
      icon: <Target size={20} color={premiumColors.neonCyan} />,
      route: currentUser.activeMode === 'business' ? '/post-task' : '/(tabs)/tasks',
    },
    {
      id: 3,
      title: 'Quests',
      description: 'Complete challenges for rewards',
      icon: <Sparkles size={20} color={premiumColors.neonMagenta} />,
      route: '/(tabs)/quests',
    },
    {
      id: 4,
      title: 'Leaderboard',
      description: 'See where you rank',
      icon: <Trophy size={20} color={premiumColors.neonGreen} />,
      route: '/(tabs)/leaderboard',
    },
  ];

  const handleGetStarted = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack, '#1A1A2E']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {showConfetti && <Confetti />}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + 120 }]}
      >
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[premiumColors.neonCyan + '40', premiumColors.neonMagenta + '40']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {content.icon}
            </LinearGradient>
          </View>

          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          <View style={styles.userCard}>
            <BlurView intensity={40} tint="dark" style={styles.userCardBlur}>
              <View style={styles.userInfo}>
                <View style={styles.profilePic}>
                  <Text style={styles.profileInitial}>{currentUser.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{currentUser.name}</Text>
                  <View style={styles.levelBadge}>
                    <Zap size={14} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                    <Text style={styles.levelText}>Level {currentUser.level}</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.featuresSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.sectionTitle}>✨ What You Can Do</Text>
          {content.features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <BlurView intensity={30} tint="dark" style={styles.featureBlur}>
                <LinearGradient
                  colors={[premiumColors.glassDark + '80', 'transparent']}
                  style={styles.featureGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.featureIconContainer}>{feature.icon}</View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </View>
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.quickStartSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.sectionTitle}>🚀 Quick Start Guide</Text>
          <View style={styles.quickStartGrid}>
            {quickStartGuides.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                style={styles.quickStartCard}
                onPress={() => router.push(guide.route as any)}
                activeOpacity={0.8}
              >
                <BlurView intensity={25} tint="dark" style={styles.quickStartBlur}>
                  <View style={styles.quickStartIconBg}>{guide.icon}</View>
                  <Text style={styles.quickStartTitle}>{guide.title}</Text>
                  <Text style={styles.quickStartDescription}>{guide.description}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.tipCard}>
          <BlurView intensity={40} tint="dark" style={styles.tipBlur}>
            <LinearGradient
              colors={[premiumColors.neonCyan + '20', premiumColors.neonMagenta + '10']}
              style={styles.tipGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Sparkles size={24} color={premiumColors.neonCyan} />
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>💡 Pro Tip</Text>
                <Text style={styles.tipText}>
                  Complete your first task today to unlock the Daily Quest system and earn bonus XP
                </Text>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted} activeOpacity={0.9}>
          <LinearGradient
            colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.getStartedGradient}
          >
            <Text style={styles.getStartedText}>Start Hustling! 🚀</Text>
            <ArrowRight size={24} color={premiumColors.deepBlack} strokeWidth={3} />
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  userCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  userCardBlur: {
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
    padding: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: premiumColors.neonCyan + '30',
    borderWidth: 3,
    borderColor: premiumColors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 20,
    shadowOpacity: 0.8,
  },
  profileInitial: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: premiumColors.neonCyan,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: premiumColors.neonCyan,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  featuresSection: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.lg,
  },
  featureCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  featureBlur: {
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  featureGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 18,
  },
  quickStartSection: {
    marginBottom: spacing.xxl,
  },
  quickStartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickStartCard: {
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  quickStartBlur: {
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  quickStartIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quickStartTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  quickStartDescription: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: 15,
  },
  tipCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  tipBlur: {
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
  },
  tipGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: premiumColors.deepBlack + 'F0',
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  getStartedButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 1,
  },
  getStartedGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
});
