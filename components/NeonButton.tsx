import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {
  premiumColors,
  borderRadius,
  typography,
  spacing,
  neonGlow,
} from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'cyan' | 'magenta' | 'amber' | 'violet' | 'green';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  animated?: boolean;
}

export default function NeonButton({
  title,
  onPress,
  variant = 'cyan',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
  animated = true,
}: NeonButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated && !disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1.3,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, disabled, glowAnim]);

  const handlePressIn = () => {
    if (!disabled) {
      triggerHaptic('light');
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (!disabled) {
      triggerHaptic('medium');
      onPress();
    }
  };

  const colorMap = {
    cyan: premiumColors.neonCyan,
    magenta: premiumColors.neonMagenta,
    amber: premiumColors.neonAmber,
    violet: premiumColors.neonViolet,
    green: premiumColors.neonGreen,
  };

  const glowMap = {
    cyan: neonGlow.cyan,
    magenta: neonGlow.magenta,
    amber: neonGlow.amber,
    violet: neonGlow.violet,
    green: neonGlow.green,
  };

  const sizeStyles = {
    small: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      fontSize: typography.sizes.sm,
    },
    medium: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      fontSize: typography.sizes.md,
    },
    large: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xxl,
      fontSize: typography.sizes.lg,
    },
  };

  const color = colorMap[variant];
  const glow = glowMap[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && { width: '100%' },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        accessibilityHint={disabled ? 'Button is disabled' : 'Double tap to activate'}
        style={[
          styles.button,
          {
            backgroundColor: color,
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            ...glow,
          },
          style,
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyle.fontSize,
              color: variant === 'amber' ? premiumColors.deepBlack : '#FFFFFF',
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  text: {
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
