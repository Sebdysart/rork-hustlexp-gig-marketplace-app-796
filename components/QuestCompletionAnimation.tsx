import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Sparkles } from 'lucide-react-native';

import { Quest } from '@/types';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import Confetti from './Confetti';

interface QuestCompletionAnimationProps {
  visible: boolean;
  quest: Quest | null;
  streakMultiplier: number;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function QuestCompletionAnimation({
  visible,
  quest,
  streakMultiplier,
  onClose,
}: QuestCompletionAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && quest) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      glowAnim.setValue(0);
    }
  }, [visible, quest]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!quest) return null;

  const adjustedGrit = quest.rewards.grit
    ? Math.round(quest.rewards.grit * streakMultiplier)
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {visible && <Confetti />}

        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <View style={styles.card}>
            <LinearGradient
              colors={[
                premiumColors.neonCyan + '20',
                premiumColors.neonPurple + '20',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <Animated.View
              style={[
                styles.glowCircle,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonPurple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glowGradient}
              />
            </Animated.View>

            <View style={styles.iconContainer}>
              <CheckCircle2 color={premiumColors.neonGreen} size={64} />
            </View>

            <Text style={styles.title}>Quest Complete!</Text>
            <Text style={styles.questTitle}>{quest.title}</Text>

            <View style={styles.rewardsContainer}>
              <Sparkles color={premiumColors.neonCyan} size={20} />
              <Text style={styles.rewardsTitle}>Rewards Earned</Text>
            </View>

            <View style={styles.rewardsList}>
              {adjustedGrit > 0 && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>⚡</Text>
                  <Text style={styles.rewardText}>
                    +{adjustedGrit} Grit
                    {streakMultiplier > 1 && (
                      <Text style={styles.multiplierText}>
                        {' '}
                        (x{streakMultiplier})
                      </Text>
                    )}
                  </Text>
                </View>
              )}
              {quest.rewards.taskCredits && quest.rewards.taskCredits > 0 && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>💵</Text>
                  <Text style={styles.rewardText}>
                    +${quest.rewards.taskCredits} Task Credits
                  </Text>
                </View>
              )}
              {quest.rewards.xp && quest.rewards.xp > 0 && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>✨</Text>
                  <Text style={styles.rewardText}>+{quest.rewards.xp} XP</Text>
                </View>
              )}
              {quest.rewards.badge && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>🏆</Text>
                  <Text style={styles.rewardText}>
                    New Badge: {quest.rewards.badge}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  iconContainer: {
    zIndex: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    zIndex: 2,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
    textAlign: 'center',
    zIndex: 2,
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    zIndex: 2,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  rewardsList: {
    width: '100%',
    gap: 12,
    zIndex: 2,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: premiumColors.glassWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rewardIcon: {
    fontSize: 24,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  multiplierText: {
    color: premiumColors.neonPurple,
    fontWeight: '700' as const,
  },
});
