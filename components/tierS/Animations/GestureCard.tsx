import React, { useRef } from 'react';
import { Animated, PanResponder, Dimensions, ViewStyle, Platform } from 'react-native';
import { triggerHaptic } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface GestureCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  swipeEnabled?: boolean;
}

export default function GestureCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  style,
  hapticFeedback = true,
  swipeEnabled = true,
}: GestureCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => swipeEnabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return swipeEnabled && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },

      onPanResponderGrant: () => {
        if (hapticFeedback && Platform.OS !== 'web') {
          triggerHaptic('light');
        }
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > SWIPE_THRESHOLD && absDx > absDy) {
          if (dx > 0 && onSwipeRight) {
            if (hapticFeedback && Platform.OS !== 'web') {
              triggerHaptic('medium');
            }
            Animated.spring(pan, {
              toValue: { x: SCREEN_WIDTH, y: 0 },
              useNativeDriver: false,
            }).start(() => {
              onSwipeRight();
              pan.setValue({ x: 0, y: 0 });
            });
          } else if (dx < 0 && onSwipeLeft) {
            if (hapticFeedback && Platform.OS !== 'web') {
              triggerHaptic('medium');
            }
            Animated.spring(pan, {
              toValue: { x: -SCREEN_WIDTH, y: 0 },
              useNativeDriver: false,
            }).start(() => {
              onSwipeLeft();
              pan.setValue({ x: 0, y: 0 });
            });
          } else {
            resetPosition();
          }
        } else if (absDy > SWIPE_THRESHOLD && absDy > absDx) {
          if (dy < 0 && onSwipeUp) {
            if (hapticFeedback && Platform.OS !== 'web') {
              triggerHaptic('medium');
            }
            onSwipeUp();
            resetPosition();
          } else if (dy > 0 && onSwipeDown) {
            if (hapticFeedback && Platform.OS !== 'web') {
              triggerHaptic('medium');
            }
            onSwipeDown();
            resetPosition();
          } else {
            resetPosition();
          }
        } else {
          resetPosition();
        }
      },

      onPanResponderTerminate: () => {
        resetPosition();
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      tension: 120,
      friction: 14,
      useNativeDriver: false,
    }).start();
  };

  const rotateInterpolate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const opacityInterpolate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate: rotateInterpolate },
    ],
    opacity: opacityInterpolate,
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}
