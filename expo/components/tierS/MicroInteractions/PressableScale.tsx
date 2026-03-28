import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle } from 'react-native';
import { useSensory } from '@/hooks/useSensory';

interface PressableScaleProps {
  onPress: () => void;
  children: React.ReactNode;
  scaleValue?: number;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

export default function PressableScale({
  onPress,
  children,
  scaleValue = 0.96,
  style,
  disabled = false,
  hapticFeedback = true,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const sensory = useSensory();

  const handlePressIn = () => {
    if (disabled) return;
    
    if (hapticFeedback) {
      sensory.tap();
    }

    Animated.spring(scale, {
      toValue: scaleValue,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    Animated.spring(scale, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
