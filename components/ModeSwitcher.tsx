import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Zap, Wrench, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { UserMode } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from './GlassCard';

interface ModeSwitcherProps {
  currentMode: UserMode;
  modesUnlocked: UserMode[];
  onModeChange: (mode: UserMode) => void;
}

export default function ModeSwitcher({ currentMode, modesUnlocked, onModeChange }: ModeSwitcherProps) {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const getInitialPosition = () => {
    if (currentMode === 'business') return 0;
    if (currentMode === 'everyday') return 1;
    return 2;
  };
  const slideAnim = useRef(new Animated.Value(getInitialPosition())).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleSwitch = (mode: UserMode) => {
    if (isAnimating || mode === currentMode) return;
    if (!modesUnlocked.includes(mode)) {
      console.log(`Mode ${mode} is locked`);
      return;
    }

    triggerHaptic('medium');
    setIsAnimating(true);

    let toValue: number;
    if (mode === 'business') {
      toValue = 0;
    } else if (mode === 'everyday') {
      toValue = 1;
    } else {
      toValue = 2;
    }

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      setIsAnimating(false);
      onModeChange(mode);
    });
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 110, 220],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const getModeLabel = (mode: UserMode): string => {
    if (mode === 'business') return '📋 Quest Giver';
    if (mode === 'everyday') return '⚡ Hustler';
    return '🔧 Tradesman';
  };

  const getModeColor = (mode: UserMode): string => {
    if (mode === 'business') return premiumColors.neonMagenta;
    if (mode === 'everyday') return premiumColors.neonCyan;
    return premiumColors.neonAmber;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Active Mode</Text>
        <View style={[styles.badge, { borderColor: getModeColor(currentMode) + '40' }]}>
          <Text style={styles.badgeText}>{getModeLabel(currentMode)}</Text>
        </View>
      </View>
      
      <GlassCard variant="dark" neonBorder glowColor={currentMode === 'business' ? 'neonMagenta' : currentMode === 'everyday' ? 'neonCyan' : 'neonAmber'}>
        <View style={styles.switchContainer}>
          <LinearGradient
            colors={[
              Colors.card + '80',
              Colors.surface + '60',
            ]}
            style={styles.track}
          >
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSwitch('business')}
                disabled={!modesUnlocked.includes('business')}
                activeOpacity={0.8}
              >
                <Briefcase 
                  size={20} 
                  color={currentMode === 'business' ? Colors.text : modesUnlocked.includes('business') ? Colors.textSecondary : Colors.textSecondary + '40'} 
                  strokeWidth={currentMode === 'business' ? 2.5 : 2}
                />
                <Text style={[styles.optionText, currentMode === 'business' && styles.optionTextActive, !modesUnlocked.includes('business') && styles.optionTextLocked]}>
                  Poster
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSwitch('everyday')}
                disabled={!modesUnlocked.includes('everyday')}
                activeOpacity={0.8}
              >
                <Zap 
                  size={20} 
                  color={currentMode === 'everyday' ? Colors.text : modesUnlocked.includes('everyday') ? Colors.textSecondary : Colors.textSecondary + '40'}
                  fill={currentMode === 'everyday' ? premiumColors.neonCyan : 'transparent'}
                  strokeWidth={currentMode === 'everyday' ? 2.5 : 2}
                />
                <Text style={[styles.optionText, currentMode === 'everyday' && styles.optionTextActive, !modesUnlocked.includes('everyday') && styles.optionTextLocked]}>
                  Hustler
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSwitch('tradesmen')}
                disabled={!modesUnlocked.includes('tradesmen')}
                activeOpacity={0.8}
              >
                <Wrench 
                  size={20} 
                  color={currentMode === 'tradesmen' ? Colors.text : modesUnlocked.includes('tradesmen') ? Colors.textSecondary : Colors.textSecondary + '40'}
                  strokeWidth={currentMode === 'tradesmen' ? 2.5 : 2}
                />
                <Text style={[styles.optionText, currentMode === 'tradesmen' && styles.optionTextActive, !modesUnlocked.includes('tradesmen') && styles.optionTextLocked]}>
                  Tradesman
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.thumb,
                {
                  transform: [{ translateX }, { scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={
                  currentMode === 'business'
                    ? [premiumColors.neonMagenta, premiumColors.neonMagenta + 'CC']
                    : currentMode === 'everyday'
                    ? [premiumColors.neonCyan, premiumColors.neonCyan + 'CC']
                    : [premiumColors.neonAmber, premiumColors.neonAmber + 'CC']
                }
                style={styles.thumbGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  {currentMode === 'business' ? (
                    <Briefcase size={24} color={Colors.text} strokeWidth={2.5} />
                  ) : currentMode === 'everyday' ? (
                    <Zap size={24} color={Colors.text} fill={Colors.text} strokeWidth={2.5} />
                  ) : (
                    <Wrench size={24} color={Colors.text} strokeWidth={2.5} />
                  )}
                </Animated.View>
              </LinearGradient>

              <Animated.View
                style={[
                  styles.glow,
                  {
                    opacity: glowOpacity,
                    backgroundColor: getModeColor(currentMode),
                  },
                ]}
              />
            </Animated.View>
          </LinearGradient>
        </View>
      </GlassCard>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={[
            styles.infoDot,
            { backgroundColor: getModeColor(currentMode) }
          ]} />
          <Text style={styles.description}>
            {currentMode === 'business' 
              ? 'Post quests, manage tasks, and find skilled adventurers' 
              : currentMode === 'everyday'
              ? 'Accept quests, complete tasks, and earn XP & rewards'
              : 'Professional tradesman with verified skills, certifications, and portfolio'}
          </Text>
        </View>
        
        {modesUnlocked.length < 3 && (
          <View style={styles.unlockHint}>
            <Sparkles size={14} color={premiumColors.neonAmber} />
            <Text style={styles.unlockText}>
              Unlock more modes as you level up and complete quests!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  switchContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  track: {
    height: 80,
    borderRadius: 20,
    padding: 5,
    position: 'relative',
  },
  optionsContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  option: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  optionTextLocked: {
    opacity: 0.4,
  },
  thumb: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 110,
    height: 70,
    borderRadius: 16,
    overflow: 'visible',
  },
  thumbGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 28,
    zIndex: -1,
  },
  infoCard: {
    backgroundColor: Colors.card + '60',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  description: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  unlockHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '20',
  },
  unlockText: {
    flex: 1,
    fontSize: 12,
    color: premiumColors.neonAmber,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
});
