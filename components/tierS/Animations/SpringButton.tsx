import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle, TextStyle, Platform, Text } from 'react-native';
import { springPresets } from '@/utils/tierS/advancedAnimations';
import { triggerHaptic } from '@/utils/haptics';

interface SpringButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  springConfig?: typeof springPresets[keyof typeof springPresets];
}

export default function SpringButton({
  onPress,
  children,
  style,
  textStyle,
  disabled = false,
  hapticFeedback = true,
  springConfig = springPresets.snappy,
}: SpringButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    if (hapticFeedback && Platform.OS !== 'web') {
      triggerHaptic('light');
    }
    
    Animated.spring(scaleValue, {
      toValue: 0.96,
      tension: springConfig.tension,
      friction: springConfig.friction,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: springConfig.tension,
      friction: springConfig.friction,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => {
        if (!disabled) {
          onPress();
        }
      }}
      disabled={disabled}
    >
      <Animated.View style={[style, animatedStyle, disabled && { opacity: 0.5 }]}>
        {typeof children === 'string' ? <Text style={textStyle}>{children}</Text> : children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
