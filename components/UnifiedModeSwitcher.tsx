import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Hammer, Wrench, Building2, X, Sparkles, Check } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { UserMode } from '@/types';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';

interface ModeSwitcherProps {
  compact?: boolean;
}

export default function UnifiedModeSwitcher({ compact = false }: ModeSwitcherProps) {
  const { currentUser, switchMode } = useApp();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  const activeMode = currentUser?.activeMode || 'everyday';

  useEffect(() => {
    if (showModal) {
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal, modalAnim]);

  const getModeConfig = (mode: UserMode) => {
    switch (mode) {
      case 'everyday':
        return {
          icon: Hammer,
          title: 'Everyday Hustler',
          subtitle: 'Quick gigs & side hustles',
          gradient: [premiumColors.neonAmber, '#FF6B00'] as const,
          color: premiumColors.neonAmber,
        };
      case 'tradesmen':
        return {
          icon: Wrench,
          title: 'Tradesman Pro',
          subtitle: 'Professional trade work',
          gradient: [premiumColors.neonBlue, premiumColors.neonCyan] as const,
          color: premiumColors.neonBlue,
        };
      case 'business':
        return {
          icon: Building2,
          title: 'Business Poster',
          subtitle: 'Post jobs & hire workers',
          gradient: [premiumColors.neonMagenta, premiumColors.neonViolet] as const,
          color: premiumColors.neonMagenta,
        };
    }
  };

  const currentConfig = getModeConfig(activeMode);
  const IconComponent = currentConfig.icon;

  const handleModePress = () => {
    triggerHaptic('selection');
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
    setShowModal(true);
  };

  const handleSelectMode = async (mode: UserMode) => {
    if (mode === activeMode) {
      setShowModal(false);
      return;
    }

    triggerHaptic('success');
    setSelectedMode(mode);
    
    setTimeout(async () => {
      await switchMode(mode);
      setShowModal(false);
      setSelectedMode(null);
    }, 500);
  };

  if (compact) {
    return (
      <>
        <TouchableOpacity onPress={handleModePress} activeOpacity={0.8}>
          <Animated.View style={[styles.compactButton, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={currentConfig.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.compactGradient}
            >
              <IconComponent size={18} color={premiumColors.deepBlack} strokeWidth={2.5} />
              <Text style={styles.compactText}>{currentConfig.title}</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
        {renderModal()}
      </>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={handleModePress} activeOpacity={0.85}>
        <Animated.View style={[styles.modeButton, { transform: [{ scale: scaleAnim }] }]}>
          <BlurView intensity={30} tint="dark" style={styles.modeBlur}>
            <LinearGradient
              colors={[currentConfig.gradient[0] + '40', currentConfig.gradient[1] + '20', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeGradient}
            >
              <View style={[styles.modeIconContainer, { backgroundColor: currentConfig.color + '20' }]}>
                <IconComponent size={24} color={currentConfig.color} strokeWidth={2.5} />
              </View>
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>{currentConfig.title}</Text>
                <Text style={styles.modeSubtitle}>{currentConfig.subtitle}</Text>
              </View>
              <Sparkles size={20} color={currentConfig.color} strokeWidth={2} />
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
      {renderModal()}
    </>
  );

  function renderModal() {
    const modalScale = modalAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    });

    return (
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowModal(false)}
          />
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: modalAnim,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <LinearGradient
              colors={[premiumColors.deepBlack, premiumColors.richBlack]}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Switch Mode</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                  <X size={24} color={Colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <View style={styles.modesContainer}>
                {(['everyday', 'tradesmen', 'business'] as UserMode[]).map((mode) => {
                  const config = getModeConfig(mode);
                  const ModeIcon = config.icon;
                  const isActive = activeMode === mode;
                  const isSelected = selectedMode === mode;
                  const isUnlocked = true;

                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => handleSelectMode(mode)}
                      activeOpacity={0.8}
                      style={styles.modeOption}
                    >
                      <BlurView 
                        intensity={isActive || isSelected ? 40 : 20} 
                        tint="dark" 
                        style={styles.modeOptionBlur}
                      >
                        <LinearGradient
                          colors={
                            isActive || isSelected
                              ? [config.gradient[0] + '60', config.gradient[1] + '40', 'transparent']
                              : ['transparent', 'transparent']
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.modeOptionGradient}
                        >
                          <View 
                            style={[
                              styles.modeOptionContent,
                              (isActive || isSelected) && styles.modeOptionActive,
                              !isUnlocked && styles.modeOptionLocked,
                            ]}
                          >
                            <View style={[styles.modeOptionIcon, { backgroundColor: config.color + '20' }]}>
                              <ModeIcon 
                                size={32} 
                                color={isUnlocked ? config.color : premiumColors.glassWhite} 
                                strokeWidth={2.5} 
                              />
                            </View>
                            <View style={styles.modeOptionText}>
                              <Text style={[styles.modeOptionTitle, !isUnlocked && styles.modeOptionTitleLocked]}>
                                {config.title}
                              </Text>
                              <Text style={styles.modeOptionSubtitle}>{config.subtitle}</Text>
                            </View>
                            {isActive && (
                              <View style={[styles.activeBadge, { backgroundColor: config.color }]}>
                                <Check size={16} color={premiumColors.deepBlack} strokeWidth={3} />
                              </View>
                            )}
                            {isSelected && (
                              <View style={styles.loadingIndicator}>
                                <Sparkles size={20} color={config.color} fill={config.color} strokeWidth={2} />
                              </View>
                            )}

                          </View>
                        </LinearGradient>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalHint}>
                Switch between modes anytime to access different features
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  compactButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  compactText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.3,
  },
  modeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modeBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  modeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  modeSubtitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    ...neonGlow.cyan,
    shadowRadius: 40,
    shadowOpacity: 0.6,
  },
  modalGradient: {
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  modesContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  modeOption: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modeOptionBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modeOptionGradient: {
    borderRadius: borderRadius.xl,
  },
  modeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
    borderRadius: borderRadius.xl,
    position: 'relative',
  },
  modeOptionActive: {
    borderColor: premiumColors.neonCyan,
    borderWidth: 2.5,
    ...neonGlow.subtle,
    shadowColor: premiumColors.neonCyan,
  },
  modeOptionLocked: {
    opacity: 0.5,
  },
  modeOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  modeOptionText: {
    flex: 1,
  },
  modeOptionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  modeOptionTitleLocked: {
    color: premiumColors.glassWhiteStrong,
  },
  modeOptionSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: 4,
  },
  activeBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
  },
  loadingIndicator: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lockedText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  modalHint: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
});
