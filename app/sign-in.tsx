import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Zap, Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp, Star, Shield, Users, DollarSign, Award } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useSensory } from '@/hooks/useSensory';
import { spacing, typography, borderRadius, premiumColors, neonGlow } from '@/constants/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ParticleIcon = ({ type }: { type: number }) => {
  const icons = [Sparkles, Star, Zap, Award];
  const colors = [premiumColors.neonCyan, premiumColors.neonMagenta, premiumColors.neonAmber, premiumColors.neonGreen];
  const Icon = icons[type % icons.length];
  const color = colors[type % colors.length];
  return <Icon size={10 + (type % 8)} color={color} />;
};

export default function SignInScreen() {
  const router = useRouter();
  const { users, updateUser } = useApp();
  const insets = useSafeAreaInsets();
  const sensory = useSensory();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(80)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const statsTickerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const particleAnims = useRef(
    Array.from({ length: 25 }, () => ({
      translateY: new Animated.Value(SCREEN_HEIGHT + 100),
      translateX: new Animated.Value((Math.random() - 0.5) * SCREEN_WIDTH),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 35,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(statsTickerAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    particleAnims.forEach((animSet, index) => {
      const startDelay = index * 150;
      const duration = 5000 + Math.random() * 3000;
      const startX = (Math.random() - 0.5) * SCREEN_WIDTH;

      Animated.loop(
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.parallel([
            Animated.timing(animSet.translateY, {
              toValue: -200,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(animSet.translateX, {
              toValue: startX + (Math.random() - 0.5) * 150,
              duration,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(animSet.opacity, {
                toValue: 0.7,
                duration: duration * 0.15,
                useNativeDriver: true,
              }),
              Animated.timing(animSet.opacity, {
                toValue: 0,
                duration: duration * 0.85,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.spring(animSet.scale, {
                toValue: 1,
                tension: 80,
                friction: 6,
                useNativeDriver: true,
              }),
              Animated.timing(animSet.scale, {
                toValue: 0.3,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(animSet.rotate, {
              toValue: 360 + Math.random() * 180,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(animSet.translateY, { toValue: SCREEN_HEIGHT + 100, duration: 0, useNativeDriver: true }),
            Animated.timing(animSet.translateX, { toValue: startX, duration: 0, useNativeDriver: true }),
            Animated.timing(animSet.opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(animSet.scale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
            Animated.timing(animSet.rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    });
  }, [fadeAnim, slideAnim, glowAnim, logoRotate, logoScale, statsTickerAnim, pulseAnim, particleAnims]);

  const handleButtonPressIn = useCallback(() => {
    sensory.tap();
    Animated.spring(buttonScale, {
      toValue: 0.94,
      tension: 250,
      friction: 15,
      useNativeDriver: true,
    }).start();
  }, [buttonScale, sensory]);

  const handleButtonPressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      tension: 250,
      friction: 15,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const handleStartHustle = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      sensory.error();
      return;
    }

    setIsLoading(true);
    setError('');
    sensory.buttonPress();

    await new Promise(resolve => setTimeout(resolve, 800));

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (existingUser) {
      if (!password.trim()) {
        setError('Password required for existing account');
        setIsLoading(false);
        sensory.error();
        return;
      }

      if (existingUser.password !== password) {
        setError('Incorrect password');
        setIsLoading(false);
        sensory.error();
        return;
      }

      sensory.success();
      
      const updatedUser = {
        ...existingUser,
        isOnline: true,
        lastSeen: new Date().toISOString(),
      };
      
      await updateUser(updatedUser);
      router.replace('/(tabs)/home');
    } else {
      sensory.success();
      router.push(`/ai-onboarding?email=${encodeURIComponent(email.trim())}`);
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const statsTranslateX = statsTickerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_WIDTH],
  });

  const liveStats = [
    { icon: Users, text: '47K+ Hustlers Active', color: premiumColors.neonCyan },
    { icon: DollarSign, text: '$2.3M Earned This Week', color: premiumColors.neonGreen },
    { icon: Award, text: '12K Tasks Today', color: premiumColors.neonAmber },
    { icon: Zap, text: 'Avg $85/task', color: premiumColors.neonMagenta },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050507', '#0A0A0F', '#0D0D14', '#0F0F18']}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.3, 0.7, 1]}
      />

      <View style={styles.gradientOverlay}>
        <LinearGradient
          colors={[premiumColors.neonCyan + '15', 'transparent', premiumColors.neonMagenta + '15']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {particleAnims.map((animSet, index) => {
        const rotationDeg = animSet.rotate.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX: animSet.translateX },
                  { translateY: animSet.translateY },
                  { scale: animSet.scale },
                  { rotate: rotationDeg },
                ],
                opacity: animSet.opacity,
              },
            ]}
          >
            <ParticleIcon type={index} />
          </Animated.View>
        );
      })}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }],
              paddingTop: insets.top + 40, 
              paddingBottom: Math.max(insets.bottom + 20, 20)
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.liveStatsContainer}>
              <Animated.View style={[styles.liveStatsTicker, { transform: [{ translateX: statsTranslateX }] }]}>
                {[...liveStats, ...liveStats].map((stat, index) => (
                  <View key={index} style={styles.liveStatItem}>
                    <View style={[styles.liveStatIcon, { backgroundColor: stat.color + '20', borderColor: stat.color + '50' }]}>
                      <stat.icon size={12} color={stat.color} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.liveStatText}>{stat.text}</Text>
                  </View>
                ))}
              </Animated.View>
            </View>

            <Animated.View 
              style={[
                styles.iconContainer, 
                { 
                  opacity: glowOpacity,
                  transform: [
                    { scale: Animated.multiply(logoScale, pulseAnim) },
                    { rotate: logoRotation },
                  ]
                }
              ]}
            >
              <Animated.View style={[styles.iconGlowRing, { transform: [{ scale: glowScale }] }]}>
                <LinearGradient
                  colors={[premiumColors.neonCyan + '40', premiumColors.neonMagenta + '40', premiumColors.neonCyan + '40']}
                  style={styles.iconGlowRingInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>
              
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
                style={styles.iconGradientBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <BlurView intensity={50} tint="dark" style={styles.iconBlur}>
                  <View style={styles.iconGlow}>
                    <Zap size={54} color={premiumColors.neonCyan} strokeWidth={3.5} />
                  </View>
                </BlurView>
              </LinearGradient>
            </Animated.View>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Welcome Back, Hustler</Text>
              <Text style={styles.subtitle}>Your journey starts here</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: premiumColors.neonGreen + '20' }]}>
                  <TrendingUp size={16} color={premiumColors.neonGreen} strokeWidth={2.5} />
                </View>
                <Text style={styles.statText}>Level Up</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: premiumColors.neonAmber + '20' }]}>
                  <Star size={16} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} strokeWidth={2.5} />
                </View>
                <Text style={styles.statText}>Earn Rewards</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: premiumColors.neonMagenta + '20' }]}>
                  <Sparkles size={16} color={premiumColors.neonMagenta} strokeWidth={2.5} />
                </View>
                <Text style={styles.statText}>Get Paid</Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                <View style={styles.inputWrapper}>
                  <View style={[styles.inputIconContainer, { backgroundColor: premiumColors.neonCyan + '20' }]}>
                    <Mail size={20} color={premiumColors.neonCyan} strokeWidth={2.5} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor={premiumColors.glassWhiteStrong}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    onFocus={() => sensory.tap()}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    autoComplete="email"
                  />
                </View>
              </BlurView>
            </View>

            {email.trim() && users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputIconContainer, { backgroundColor: premiumColors.neonCyan + '20' }]}>
                      <Lock size={20} color={premiumColors.neonCyan} strokeWidth={2.5} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={premiumColors.glassWhiteStrong}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setError('');
                      }}
                      onFocus={() => sensory.tap()}
                      secureTextEntry={!showPassword}
                      returnKeyType="go"
                      onSubmitEditing={handleStartHustle}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setShowPassword(!showPassword);
                        sensory.tap();
                      }}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={premiumColors.glassWhiteStrong} strokeWidth={2.5} />
                      ) : (
                        <Eye size={20} color={premiumColors.glassWhiteStrong} strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            )}

            {error ? (
              <Animated.View style={styles.errorContainer}>
                <BlurView intensity={50} tint="dark" style={styles.errorBlur}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </BlurView>
              </Animated.View>
            ) : null}

            <View style={styles.securityNote}>
              <Shield size={15} color={premiumColors.neonGreen} strokeWidth={2.5} />
              <Text style={styles.securityText}>256-bit encrypted - Your data is secure</Text>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.button, (!email.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleStartHustle}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={!email.trim() || isLoading}
                activeOpacity={0.95}
              >
                <LinearGradient
                  colors={email.trim() && !isLoading ? 
                    [premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta, premiumColors.neonCyan] : 
                    ['#2A2A2D', '#1F1F22', '#1A1A1D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  locations={[0, 0.4, 0.7, 1]}
                  style={styles.buttonGradient}
                >
                  {!isLoading && <Sparkles size={24} color={email.trim() ? premiumColors.deepBlack : premiumColors.glassWhiteStrong} strokeWidth={3} />}
                  <Text style={[styles.buttonText, (!email.trim() || isLoading) && styles.buttonTextDisabled]}>
                    {isLoading ? 'Loading...' : 'Start Your Hustle'}
                  </Text>
                  {!isLoading && email.trim() && <Zap size={24} color={premiumColors.deepBlack} strokeWidth={3} fill={premiumColors.deepBlack} />}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>How it works</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.infoText}>
              Enter your email to get started. We will sign you in if you have an account, or guide you through creating one!
            </Text>

            {(email.trim() && users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())) ? (
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => sensory.tap()}
              >
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    zIndex: 1,
  },
  keyboardView: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  liveStatsContainer: {
    width: SCREEN_WIDTH,
    height: 32,
    marginLeft: -spacing.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  liveStatsTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  liveStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: premiumColors.glassDark + '80',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  liveStatIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  liveStatText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  iconGlowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -20,
    left: -20,
    zIndex: -1,
  },
  iconGlowRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  iconGradientBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 0.8,
  },
  iconBlur: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: premiumColors.glassDark + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -1.2,
    textShadowColor: premiumColors.neonCyan + '40',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: typography.sizes.lg * 1.4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    backgroundColor: premiumColors.glassDark + 'CC',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: premiumColors.glassWhite,
  },
  statText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 2,
    height: 22,
    backgroundColor: premiumColors.glassWhiteStrong,
    borderRadius: 1,
  },
  form: {
    gap: spacing.lg,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    marginLeft: spacing.sm,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  inputBlur: {
    borderRadius: borderRadius.xl + 2,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: premiumColors.glassWhiteStrong,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg - 2,
  },
  inputIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1.5,
    borderColor: premiumColors.glassWhite,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.lg + 1,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
    paddingVertical: spacing.xs,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  errorContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  errorBlur: {
    paddingHorizontal: spacing.lg + spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.xl,
    borderWidth: 2.5,
    borderColor: '#FF3B3080',
  },
  errorText: {
    fontSize: typography.sizes.base + 1,
    fontWeight: typography.weights.bold,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  securityText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: premiumColors.glassWhiteStrong,
    letterSpacing: 0.3,
  },
  button: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.cyan,
    shadowRadius: 30,
    shadowOpacity: 1,
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.xl + 4,
    paddingHorizontal: spacing.xxxl + spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md + 2,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.8,
    textShadowColor: premiumColors.neonCyan + '40',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonTextDisabled: {
    color: premiumColors.glassWhiteStrong,
    textShadowColor: 'transparent',
  },
  footer: {
    gap: spacing.md + 2,
    paddingTop: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: premiumColors.glassWhite,
  },
  dividerText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: premiumColors.glassWhiteStrong,
    letterSpacing: 0.5,
  },
  forgotPassword: {
    alignSelf: 'center',
    paddingVertical: spacing.sm + 2,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonCyan,
    textDecorationLine: 'underline' as const,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.medium,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * 1.6,
    paddingHorizontal: spacing.lg,
    letterSpacing: 0.2,
  },
});
