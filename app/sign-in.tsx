import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Zap, Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp, Star, Shield } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { spacing, typography, borderRadius, premiumColors, neonGlow } from '@/constants/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SignInScreen() {
  const router = useRouter();
  const { users, updateUser } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

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

    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 400),
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
  }, [fadeAnim, slideAnim, glowAnim, particleAnims]);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      triggerHaptic('error');
      return;
    }

    setIsLoading(true);
    setError('');
    triggerHaptic('medium');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      setError('No account found with this email');
      setIsLoading(false);
      triggerHaptic('error');
      return;
    }

    if (user.password !== password) {
      setError('Incorrect password');
      setIsLoading(false);
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');
    
    const updatedUser = {
      ...user,
      isOnline: true,
      lastSeen: new Date().toISOString(),
    };
    
    await updateUser(updatedUser);
    
    router.replace('/(tabs)/home');
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack, premiumColors.charcoal]}
        style={StyleSheet.absoluteFill}
      />

      {particleAnims.map((anim, index) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_HEIGHT, -100],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, 0.6, 0.6, 0],
        });
        const left = (index * SCREEN_WIDTH) / 8;

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left,
                transform: [{ translateY }],
                opacity,
              },
            ]}
          >
            <Sparkles size={12} color={premiumColors.neonCyan} />
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
                paddingTop: insets.top + 20, 
                paddingBottom: Math.max(insets.bottom + 20, 20)
              }
            ]}
          >
            <View style={styles.header}>
              <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
                <LinearGradient
                  colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
                  style={styles.iconGradientBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <BlurView intensity={40} tint="dark" style={styles.iconBlur}>
                    <View style={styles.iconGlow}>
                      <Zap size={48} color={premiumColors.neonCyan} strokeWidth={3} />
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
                  <View style={styles.statIconBg}>
                    <TrendingUp size={14} color={premiumColors.neonGreen} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.statText}>Level Up</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIconBg}>
                    <Star size={14} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.statText}>Earn Rewards</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIconBg}>
                    <Sparkles size={14} color={premiumColors.neonMagenta} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.statText}>Get Paid</Text>
                </View>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <Mail size={18} color={premiumColors.neonCyan} strokeWidth={2} />
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
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      autoComplete="email"
                    />
                  </View>
                </BlurView>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <Lock size={18} color={premiumColors.neonCyan} strokeWidth={2} />
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
                      secureTextEntry={!showPassword}
                      returnKeyType="go"
                      onSubmitEditing={handleSignIn}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setShowPassword(!showPassword);
                        triggerHaptic('light');
                      }}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={premiumColors.glassWhiteStrong} strokeWidth={2} />
                      ) : (
                        <Eye size={18} color={premiumColors.glassWhiteStrong} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>

              {error ? (
                <Animated.View style={styles.errorContainer}>
                  <BlurView intensity={40} tint="dark" style={styles.errorBlur}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </BlurView>
                </Animated.View>
              ) : null}

              <View style={styles.securityNote}>
                <Shield size={14} color={premiumColors.neonGreen} strokeWidth={2} />
                <Text style={styles.securityText}>256-bit encrypted • Your data is secure</Text>
              </View>

              <TouchableOpacity
                style={[styles.button, (!email.trim() || !password.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={!email.trim() || !password.trim() || isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={email.trim() && password.trim() && !isLoading ? [premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta] : ['#2D2D2D', '#1A1A1A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {!isLoading && <Zap size={22} color={email.trim() && password.trim() ? premiumColors.deepBlack : premiumColors.glassWhiteStrong} strokeWidth={2.5} />}
                  <Text style={[styles.buttonText, (!email.trim() || !password.trim() || isLoading) && styles.buttonTextDisabled]}>
                    {isLoading ? 'Loading...' : 'Sign In'}
                  </Text>
                  {!isLoading && email.trim() && password.trim() && <Sparkles size={20} color={premiumColors.deepBlack} strokeWidth={2.5} />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>New to HustleXP?</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  triggerHaptic('success');
                  router.push('/ai-onboarding');
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.secondaryButtonGradient}
                >
                  <Sparkles size={22} color={premiumColors.deepBlack} strokeWidth={2.5} />
                  <Text style={styles.secondaryButtonText}>Start Your Hustle</Text>
                  <Zap size={22} color={premiumColors.deepBlack} strokeWidth={2.5} fill={premiumColors.deepBlack} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => {
                  triggerHaptic('light');
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
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
  particle: {
    position: 'absolute',
    zIndex: 0,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  iconGradientBg: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 30,
  },
  iconBlur: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconGlow: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    lineHeight: typography.sizes.lg * 1.4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  statText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1.5,
    height: 20,
    backgroundColor: premiumColors.glassWhiteStrong,
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  inputBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
    paddingVertical: spacing.xs,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  errorContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  errorBlur: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: '#FF3B3080',
  },
  errorText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  securityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: premiumColors.glassWhiteStrong,
  },
  securityDot: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: premiumColors.glassWhiteStrong,
    marginHorizontal: spacing.xs / 2,
  },
  button: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.cyan,
    shadowRadius: 25,
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 1,
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
    color: premiumColors.glassWhiteStrong,
  },
  footer: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: premiumColors.glassWhite,
  },
  dividerText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: premiumColors.glassWhiteStrong,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.cyan,
    shadowRadius: 30,
    shadowOpacity: 0.8,
  },
  secondaryButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
  forgotPassword: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: premiumColors.neonCyan,
    textDecorationLine: 'underline' as const,
  },
});
