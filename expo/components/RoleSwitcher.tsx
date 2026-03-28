import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Zap, Wrench } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { UserRole } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from './GlassCard';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const getInitialPosition = () => {
    if (currentRole === 'poster') return 0;
    if (currentRole === 'worker') return 1;
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

  const handleSwitch = () => {
    if (isAnimating) return;

    triggerHaptic('medium');
    setIsAnimating(true);

    let newRole: UserRole;
    let toValue: number;
    
    if (currentRole === 'poster') {
      newRole = 'worker';
      toValue = 1;
    } else if (currentRole === 'worker') {
      newRole = 'both';
      toValue = 2;
    } else {
      newRole = 'poster';
      toValue = 0;
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
      onRoleChange(newRole);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Active Role</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {currentRole === 'poster' ? '📋 Quest Giver' : currentRole === 'worker' ? '⚡ Adventurer' : '🔧 Tradesman Pro'}
          </Text>
        </View>
      </View>
      
      <GlassCard variant="dark" neonBorder glowColor={currentRole === 'poster' ? 'neonCyan' : 'neonViolet'}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={handleSwitch}
          disabled={isAnimating}
        >
          <View style={styles.switchContainer}>
            <LinearGradient
              colors={[
                Colors.card + '80',
                Colors.surface + '60',
              ]}
              style={styles.track}
            >
              <View style={styles.optionsContainer}>
                <View style={styles.option}>
                  <Briefcase 
                    size={20} 
                    color={currentRole === 'poster' ? Colors.text : Colors.textSecondary} 
                    strokeWidth={currentRole === 'poster' ? 2.5 : 2}
                  />
                  <Text style={[styles.optionText, currentRole === 'poster' && styles.optionTextActive]}>
                    Poster
                  </Text>
                </View>
                
                <View style={styles.option}>
                  <Zap 
                    size={20} 
                    color={currentRole === 'worker' ? Colors.text : Colors.textSecondary}
                    fill={currentRole === 'worker' ? premiumColors.neonViolet : 'transparent'}
                    strokeWidth={currentRole === 'worker' ? 2.5 : 2}
                  />
                  <Text style={[styles.optionText, currentRole === 'worker' && styles.optionTextActive]}>
                    Worker
                  </Text>
                </View>
                
                <View style={styles.option}>
                  <Wrench 
                    size={20} 
                    color={currentRole === 'both' ? Colors.text : Colors.textSecondary}
                    strokeWidth={currentRole === 'both' ? 2.5 : 2}
                  />
                  <Text style={[styles.optionText, currentRole === 'both' && styles.optionTextActive]}>
                    Tradesman
                  </Text>
                </View>
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
                    currentRole === 'poster'
                      ? [premiumColors.neonCyan, premiumColors.neonCyan + 'CC']
                      : currentRole === 'worker'
                      ? [premiumColors.neonViolet, premiumColors.neonViolet + 'CC']
                      : ['#FFD700', '#FFA500']
                  }
                  style={styles.thumbGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    {currentRole === 'poster' ? (
                      <Briefcase size={24} color={Colors.text} strokeWidth={2.5} />
                    ) : currentRole === 'worker' ? (
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
                      backgroundColor: currentRole === 'poster' ? premiumColors.neonCyan : currentRole === 'worker' ? premiumColors.neonViolet : '#FFD700',
                    },
                  ]}
                />
              </Animated.View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </GlassCard>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={[
            styles.infoDot,
            { backgroundColor: currentRole === 'poster' ? premiumColors.neonCyan : currentRole === 'worker' ? premiumColors.neonViolet : '#FFD700' }
          ]} />
          <Text style={styles.description}>
            {currentRole === 'poster' 
              ? 'Post quests, manage tasks, and find skilled adventurers' 
              : currentRole === 'worker'
              ? 'Accept quests, complete tasks, and earn XP & rewards'
              : 'Professional tradesman with verified skills, certifications, and portfolio'}
          </Text>
        </View>
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
    borderColor: premiumColors.neonCyan + '30',
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
});
