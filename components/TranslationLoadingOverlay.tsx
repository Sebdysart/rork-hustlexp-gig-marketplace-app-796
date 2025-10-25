import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Globe } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { premiumColors, spacing, borderRadius, typography, neonGlow } from '@/constants/designTokens';

export function TranslationLoadingOverlay() {
  const { isLoading, translationProgress, currentLanguage, availableLanguages } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fadeAnim, pulseAnim, rotateAnim]);

  if (!isLoading) return null;

  const selectedLang = availableLanguages.find(l => l.code === currentLanguage);
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal transparent visible={isLoading} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[premiumColors.deepBlack + 'E6', premiumColors.richBlack + 'E6']}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, { transform: [{ rotate }, { scale: pulseAnim }] }]}>
            <LinearGradient
              colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Globe size={48} color={premiumColors.deepBlack} strokeWidth={2.5} />
            </LinearGradient>
          </Animated.View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {selectedLang ? `Translating to ${selectedLang.flag} ${selectedLang.name}` : 'Translating...'}
            </Text>
            <Text style={styles.subtitle}>
              Optimizing your experience...
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${translationProgress}%`,
                  }
                ]}
              >
                <LinearGradient
                  colors={[premiumColors.neonCyan, premiumColors.neonMagenta]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </View>
            <Text style={styles.progressText}>{translationProgress}%</Text>
          </View>

          <View style={styles.sparkles}>
            <Sparkles size={20} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
            <Text style={styles.tipText}>AI-powered translation</Text>
            <Sparkles size={20} color={premiumColors.neonMagenta} fill={premiumColors.neonMagenta} />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 50,
    shadowOpacity: 1,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center' as const,
    opacity: 0.8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
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
    fontSize: typography.sizes.sm,
    color: premiumColors.neonCyan,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  sparkles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  tipText: {
    fontSize: typography.sizes.sm,
    color: premiumColors.glassWhiteStrong,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
});

export default TranslationLoadingOverlay;
