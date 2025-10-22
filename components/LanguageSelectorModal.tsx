import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe, Check, X, Sparkles } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelectorModal({ visible, onClose }: LanguageSelectorModalProps) {
  const { currentLanguage, changeLanguage, availableLanguages, useAITranslation, toggleAITranslation, isLoading, translationProgress } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLanguage);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
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
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, slideAnim, scaleAnim, glowAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleLanguageSelect = async (lang: string) => {
    triggerHaptic('selection');
    setSelectedLang(lang as any);
    await changeLanguage(lang as any);
    
    setTimeout(() => {
      triggerHaptic('success');
      handleClose();
    }, 300);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[premiumColors.deepBlack + 'F0', premiumColors.richBlack + 'F5']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <BlurView intensity={50} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={[premiumColors.glassDark + '80', premiumColors.richBlack + '90']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
                  <LinearGradient
                    colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
                    style={styles.iconGradientBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.iconGlow}>
                      <Globe size={28} color={premiumColors.neonCyan} strokeWidth={2.5} />
                    </View>
                  </LinearGradient>
                </Animated.View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.modalTitle}>Choose Language</Text>
                  {isLoading && translationProgress > 0 ? (
                    <Text style={styles.modalSubtitle}>Translating... {translationProgress}%</Text>
                  ) : (
                    <Text style={styles.modalSubtitle}>Powered by AI Translation</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color={premiumColors.glassWhiteStrong} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {isLoading && translationProgress > 0 && (
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBg}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        { width: `${translationProgress}%` },
                      ]}
                    >
                      <LinearGradient
                        colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </Animated.View>
                  </View>
                  <Text style={styles.progressText}>
                    Translating app to {availableLanguages.find(l => l.code === selectedLang)?.name}...
                  </Text>
                </View>
              )}

              <ScrollView
                style={styles.languagesScroll}
                contentContainerStyle={styles.languagesScrollContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={!isLoading}
              >
                <View style={styles.languagesGrid}>
                  {availableLanguages.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        style={styles.languageCard}
                        onPress={() => handleLanguageSelect(lang.code)}
                        activeOpacity={0.8}
                      >
                        <BlurView
                          intensity={isSelected ? 40 : 20}
                          tint="dark"
                          style={styles.languageCardBlur}
                        >
                          <LinearGradient
                            colors={
                              isSelected
                                ? [premiumColors.neonCyan + '40', premiumColors.neonBlue + '20', 'transparent']
                                : [premiumColors.glassDark + '40', 'transparent']
                            }
                            style={styles.languageCardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <View
                              style={[
                                styles.languageCardContent,
                                isSelected && styles.languageCardSelected,
                              ]}
                            >
                              <Text style={styles.languageFlag}>{lang.flag}</Text>
                              <View style={styles.languageTextContainer}>
                                <Text
                                  style={[
                                    styles.languageName,
                                    isSelected && styles.languageNameSelected,
                                  ]}
                                >
                                  {lang.name}
                                </Text>
                              </View>
                              {isSelected && (
                                <View style={styles.checkBadge}>
                                  <Check size={16} color={premiumColors.neonCyan} strokeWidth={3} />
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

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.aiToggleContainer}
                onPress={() => {
                  triggerHaptic('selection');
                  toggleAITranslation(!useAITranslation);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.aiToggleCheckbox, useAITranslation && styles.aiToggleCheckboxActive]}>
                  {useAITranslation && (
                    <Sparkles size={14} color={premiumColors.deepBlack} fill={premiumColors.deepBlack} />
                  )}
                </View>
                <View style={styles.aiToggleTextContainer}>
                  <Text style={styles.aiToggleTitle}>Enable AI Translation</Text>
                  <Text style={styles.aiToggleSubtitle}>
                    Translate all app content in real-time
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleClose}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.doneButtonGradient}
                  >
                    <Check size={20} color={premiumColors.deepBlack} strokeWidth={3} />
                    <Text style={styles.doneButtonText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  modalBlur: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  modalGradient: {
    borderRadius: borderRadius.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradientBg: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 30,
    shadowOpacity: 0.8,
  },
  iconGlow: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.4)',
  },
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: -0.5,
    textShadowColor: premiumColors.neonCyan + '80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: 2,
    fontStyle: 'italic' as const,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  divider: {
    height: 1,
    backgroundColor: premiumColors.glassWhiteStrong,
    marginHorizontal: spacing.xl,
    opacity: 0.3,
  },
  progressBarContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic' as const,
  },
  languagesScroll: {
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  languagesScrollContent: {
    padding: spacing.lg,
  },
  languagesGrid: {
    gap: spacing.md,
  },
  languageCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  languageCardBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  languageCardGradient: {
    borderRadius: borderRadius.xl,
  },
  languageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(18, 18, 26, 0.4)',
  },
  languageCardSelected: {
    borderColor: premiumColors.neonCyan,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
    ...neonGlow.subtle,
    shadowColor: premiumColors.neonCyan,
    shadowRadius: 20,
    shadowOpacity: 0.6,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  languageNameSelected: {
    color: premiumColors.neonCyan,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    ...neonGlow.subtle,
    shadowColor: premiumColors.neonCyan,
  },
  aiToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: premiumColors.glassWhiteStrong,
    marginBottom: spacing.md,
  },
  aiToggleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiToggleCheckboxActive: {
    backgroundColor: premiumColors.neonCyan,
    borderColor: premiumColors.neonCyan,
  },
  aiToggleTextContainer: {
    flex: 1,
  },
  aiToggleTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  aiToggleSubtitle: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: 2,
  },
  modalFooter: {
    padding: spacing.lg,
  },
  doneButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.cyan,
    shadowRadius: 30,
    shadowOpacity: 0.9,
  },
  doneButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '900' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
});
