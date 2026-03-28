import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Sparkles, Zap, Globe } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import LanguageSelectorModal from '@/components/LanguageSelectorModal';
import AutoTranslate from '@/components/AutoTranslate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingTranslatedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const { currentLanguage, translationProgress, isLoading: isTranslating } = useLanguage();
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const handleContinue = () => {
    if (name.trim() && email.trim() && password.trim()) {
      triggerHaptic('success');
      
      completeOnboarding(
        name,
        'worker',
        {
          lat: 37.7749,
          lng: -122.4194,
          address: 'San Francisco, CA',
        },
        email,
        password,
        'everyday'
      );
      
      router.replace('/welcome');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0C', '#12121A', '#1A1A2E', '#1F1F3A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <TouchableOpacity
        style={[styles.languageButton, { top: insets.top + 10, right: spacing.lg }]}
        onPress={() => {
          triggerHaptic('selection');
          setShowLanguageModal(true);
        }}
        activeOpacity={0.8}
      >
        <BlurView intensity={40} tint="dark" style={styles.languageButtonBlur}>
          <LinearGradient
            colors={[premiumColors.neonCyan + '40', premiumColors.neonBlue + '20', 'transparent']}
            style={styles.languageButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Globe size={20} color={premiumColors.neonCyan} strokeWidth={2.5} />
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>

      <LanguageSelectorModal
        visible={showLanguageModal}
        onClose={() => {
          triggerHaptic('light');
          setShowLanguageModal(false);
        }}
      />

      {isTranslating && (
        <View style={styles.translationOverlay}>
          <BlurView intensity={50} tint="dark" style={styles.translationBlur}>
            <AutoTranslate style={styles.translationText}>Translating...</AutoTranslate>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${translationProgress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{translationProgress}%</Text>
          </BlurView>
        </View>
      )}

      <View style={[styles.content, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 20 }]}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
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
          <AutoTranslate style={styles.subtitle}>Your Journey to Legendary Status Starts Here</AutoTranslate>
          
          <View style={styles.tagline}>
            <Sparkles size={16} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
            <AutoTranslate style={styles.taglineText}>Level Up Your Hustle</AutoTranslate>
            <Sparkles size={16} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
          </View>
        </Animated.View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <AutoTranslate style={styles.label}>Your Name</AutoTranslate>
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
                />
              </View>
            </BlurView>
          </View>

          <View style={styles.inputGroup}>
            <AutoTranslate style={styles.label}>Email Address</AutoTranslate>
            <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconBg}>
                  <Sparkles size={18} color={premiumColors.neonCyan} strokeWidth={2.5} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor={premiumColors.glassWhiteStrong}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </BlurView>
          </View>

          <View style={styles.inputGroup}>
            <AutoTranslate style={styles.label}>Create Password</AutoTranslate>
            <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconBg}>
                  <Sparkles size={18} color={premiumColors.neonCyan} strokeWidth={2.5} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Make it epic!"
                  placeholderTextColor={premiumColors.glassWhiteStrong}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </BlurView>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (!name.trim() || !email.trim() || !password.trim()) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!name.trim() || !email.trim() || !password.trim()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              name.trim() && email.trim() && password.trim()
                ? [premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]
                : [premiumColors.glassWhite, premiumColors.glassWhite]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Zap
              size={24}
              color={name.trim() && email.trim() && password.trim() ? premiumColors.deepBlack : Colors.textSecondary}
              strokeWidth={3}
              fill={name.trim() && email.trim() && password.trim() ? premiumColors.deepBlack : 'transparent'}
            />
            <AutoTranslate
              style={[styles.buttonText, (!name.trim() || !email.trim() || !password.trim()) && styles.buttonTextDisabled]}
            >
              Let's Hustle
            </AutoTranslate>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.debugInfo}>
          Current Language: {currentLanguage} | Translation: {isTranslating ? 'Loading' : 'Ready'} | Progress: {translationProgress}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
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
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  form: {
    gap: spacing.md,
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
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  button: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 1,
    marginTop: spacing.lg,
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
  languageButton: {
    position: 'absolute',
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  languageButtonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '60',
  },
  languageButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  translationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  translationBlur: {
    padding: spacing.xxl,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    alignItems: 'center',
    minWidth: 250,
  },
  translationText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: 200,
    height: 8,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: premiumColors.neonCyan,
    borderRadius: borderRadius.full,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  debugInfo: {
    fontSize: 11,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    marginTop: spacing.md,
    opacity: 0.5,
  },
});
