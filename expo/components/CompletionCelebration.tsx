import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Zap, Star, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import Confetti from './Confetti';

interface CompletionCelebrationProps {
  visible: boolean;
  onComplete: () => void;
  xpEarned: number;
  moneyEarned: number;
  levelUp?: boolean;
  newLevel?: number;
  badgeEarned?: {
    name: string;
    icon: string;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CompletionCelebration({
  visible,
  onComplete,
  xpEarned,
  moneyEarned,
  levelUp = false,
  newLevel,
  badgeEarned,
}: CompletionCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      
      Animated.sequence([
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
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowConfetti(false);
          onComplete();
        });
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        {showConfetti && <Confetti count={80} duration={3500} />}
        
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
          <LinearGradient
            colors={[premiumColors.neonViolet + '20', premiumColors.neonCyan + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={[premiumColors.neonAmber, premiumColors.neonViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Trophy size={48} color={Colors.text} />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.title}>Quest Completed! 🎉</Text>
            <Text style={styles.subtitle}>Amazing work, adventurer!</Text>

            <View style={styles.rewardsContainer}>
              <View style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <Zap size={20} color={premiumColors.neonCyan} />
                </View>
                <Text style={styles.rewardValue}>+{xpEarned} XP</Text>
              </View>

              <View style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <TrendingUp size={20} color={premiumColors.neonGreen} />
                </View>
                <Text style={styles.rewardValue}>${moneyEarned.toFixed(2)}</Text>
              </View>
            </View>

            {levelUp && newLevel && (
              <View style={styles.levelUpContainer}>
                <LinearGradient
                  colors={[premiumColors.neonAmber + '30', premiumColors.neonViolet + '30']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.levelUpGradient}
                >
                  <Star size={20} color={premiumColors.neonAmber} />
                  <Text style={styles.levelUpText}>
                    Level Up! You're now Level {newLevel}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {badgeEarned && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeIcon}>{badgeEarned.icon}</Text>
                <Text style={styles.badgeText}>
                  New Badge: {badgeEarned.name}
                </Text>
              </View>
            )}

            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>🔥 Keep the streak going!</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  rewardItem: {
    flex: 1,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  levelUpContainer: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  levelUpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  levelUpText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 16,
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  streakContainer: {
    marginTop: 8,
  },
  streakText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
