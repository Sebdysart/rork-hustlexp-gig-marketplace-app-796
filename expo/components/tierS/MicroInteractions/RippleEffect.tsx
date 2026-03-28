import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle, StyleSheet } from 'react-native';

interface RippleEffectProps {
  onPress: () => void;
  children: React.ReactNode;
  rippleColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function RippleEffect({
  onPress,
  children,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  style,
  disabled = false,
}: RippleEffectProps) {
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;

    rippleScale.setValue(0);
    rippleOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress} disabled={disabled}>
      <Animated.View style={[style, { position: 'relative' as const, overflow: 'hidden' as const }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: rippleColor,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
              borderRadius: 9999,
            },
          ]}
        />
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
