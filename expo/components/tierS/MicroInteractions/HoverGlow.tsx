import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle, StyleSheet } from 'react-native';

interface HoverGlowProps {
  onPress?: () => void;
  children: React.ReactNode;
  glowColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function HoverGlow({
  onPress,
  children,
  glowColor = '#00FFFF',
  style,
  disabled = false,
}: HoverGlowProps) {
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    Animated.timing(glowOpacity, {
      toValue: 0.3,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    Animated.timing(glowOpacity, {
      toValue: 0,
      duration: 150,
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
      <Animated.View style={[style, { position: 'relative' as const }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: glowColor,
              opacity: glowOpacity,
              borderRadius: (style as any)?.borderRadius || 12,
            },
          ]}
        />
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
