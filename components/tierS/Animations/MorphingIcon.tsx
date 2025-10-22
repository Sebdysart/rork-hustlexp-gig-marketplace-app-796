import React, { useRef, useEffect } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { createMorphAnimation, springPresets } from '@/utils/tierS/advancedAnimations';

interface MorphingIconProps {
  children: React.ReactNode;
  morphTo?: React.ReactNode;
  trigger?: boolean;
  duration?: number;
  style?: ViewStyle;
}

export default function MorphingIcon({
  children,
  morphTo,
  trigger = false,
  style,
}: MorphingIconProps) {
  const opacity1 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger && morphTo) {
      createMorphAnimation(
        [opacity1, opacity2, scale1, scale2],
        [0, 1, 0, 1],
        springPresets.snappy
      ).start();
    } else {
      createMorphAnimation(
        [opacity1, opacity2, scale1, scale2],
        [1, 0, 1, 0],
        springPresets.snappy
      ).start();
    }
  }, [trigger, morphTo, opacity1, opacity2, scale1, scale2]);

  return (
    <>
      <Animated.View
        style={[
          style,
          {
            opacity: opacity1,
            transform: [{ scale: scale1 }],
            position: 'absolute' as const,
          },
        ]}
      >
        {children}
      </Animated.View>
      {morphTo && (
        <Animated.View
          style={[
            style,
            {
              opacity: opacity2,
              transform: [{ scale: scale2 }],
            },
          ]}
        >
          {morphTo}
        </Animated.View>
      )}
    </>
  );
}
