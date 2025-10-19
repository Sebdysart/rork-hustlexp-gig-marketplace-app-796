import { TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { useRef, ReactNode } from 'react';
import { triggerHaptic } from '@/utils/haptics';

interface AnimatedButtonProps {
  children: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'success';
  scaleValue?: number;
}

export function AnimatedButton({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  haptic = 'medium',
  scaleValue = 0.95,
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    triggerHaptic(haptic);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: scaleValue,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}
