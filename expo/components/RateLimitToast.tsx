import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, Clock } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/colors';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RateLimitToastProps {
  visible: boolean;
  retryAfter?: number;
  onDismiss?: () => void;
}

export default function RateLimitToast({ visible, retryAfter = 60, onDismiss }: RateLimitToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after retry time
      const timer = setTimeout(() => {
        handleDismiss();
      }, retryAfter * 1000);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing.md,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle size={24} color={premiumColors.neonAmber} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Slow Down There!</Text>
            <Text style={styles.message}>
              Too many requests. Using offline mode for {retryAfter}s.
            </Text>
          </View>

          <View style={styles.timeContainer}>
            <Clock size={16} color={premiumColors.neonAmber} />
            <Text style={styles.timeText}>{retryAfter}s</Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  blur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonAmber + '60',
    shadowColor: premiumColors.neonAmber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonAmber + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: premiumColors.neonAmber + '20',
    borderRadius: borderRadius.md,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
});
