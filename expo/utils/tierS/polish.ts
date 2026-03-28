import { Animated, Easing } from 'react-native';

export function createSmoothScrollInterpolation(
  scrollY: Animated.Value,
  inputRange: number[],
  outputRange: number[]
): Animated.AnimatedInterpolation<number> {
  return scrollY.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
}

export function createInputFocusAnimation(
  isFocused: boolean,
  borderColor: Animated.Value,
  scale: Animated.Value
): Animated.CompositeAnimation {
  return Animated.parallel([
    Animated.timing(borderColor, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }),
    Animated.spring(scale, {
      toValue: isFocused ? 1.02 : 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }),
  ]);
}

export function createFormValidationFeedback(
  isValid: boolean,
  shakeAnimation: Animated.Value
): Animated.CompositeAnimation {
  if (!isValid) {
    return Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
  }

  return Animated.spring(shakeAnimation, {
    toValue: 0,
    tension: 300,
    friction: 20,
    useNativeDriver: true,
  });
}

export function createToastSwipeDismiss(
  translateX: Animated.Value,
  onDismiss: () => void
): {
  onSwipe: (gestureX: number) => void;
  onRelease: () => void;
} {
  const threshold = 100;

  return {
    onSwipe: (gestureX: number) => {
      translateX.setValue(gestureX);
    },
    onRelease: () => {
      translateX.stopAnimation((value) => {
        if (Math.abs(value) > threshold) {
          Animated.timing(translateX, {
            toValue: value > 0 ? 500 : -500,
            duration: 200,
            useNativeDriver: true,
          }).start(onDismiss);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            tension: 300,
            friction: 20,
            useNativeDriver: true,
          }).start();
        }
      });
    },
  };
}

export function createModalTransitionFromTrigger(
  triggerPosition: { x: number; y: number },
  scale: Animated.Value,
  translateX: Animated.Value,
  translateY: Animated.Value,
  opacity: Animated.Value
): Animated.CompositeAnimation {
  return Animated.parallel([
    Animated.spring(scale, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }),
    Animated.spring(translateX, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }),
    Animated.spring(translateY, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }),
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }),
  ]);
}

export function createLoadingStateTransition(
  isLoading: boolean,
  opacity: Animated.Value,
  scale: Animated.Value
): Animated.CompositeAnimation {
  if (isLoading) {
    return Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 150,
        useNativeDriver: true,
      }),
    ]);
  }

  return Animated.parallel([
    Animated.spring(opacity, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }),
    Animated.spring(scale, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }),
  ]);
}

export function createSuccessConfirmation(
  scale: Animated.Value,
  checkmarkScale: Animated.Value
): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.spring(scale, {
      toValue: 1.1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }),
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]),
  ]);
}

export function createErrorRecoveryFlow(
  shakeAnimation: Animated.Value,
  opacity: Animated.Value,
  onRetry: () => void
): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]),
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      delay: 2000,
      useNativeDriver: true,
    }),
  ]);
}

export function interpolateColor(
  animatedValue: Animated.Value,
  inputRange: number[],
  colors: string[]
): Animated.AnimatedInterpolation<string> {
  return animatedValue.interpolate({
    inputRange,
    outputRange: colors,
  });
}

export function createStaggeredListAnimation(
  items: number,
  staggerDelay: number = 50
): Animated.Value[] {
  const animations: Animated.Value[] = [];
  
  for (let i = 0; i < items; i++) {
    const animation = new Animated.Value(0);
    
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      delay: i * staggerDelay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    
    animations.push(animation);
  }
  
  return animations;
}

export default {
  createSmoothScrollInterpolation,
  createInputFocusAnimation,
  createFormValidationFeedback,
  createToastSwipeDismiss,
  createModalTransitionFromTrigger,
  createLoadingStateTransition,
  createSuccessConfirmation,
  createErrorRecoveryFlow,
  interpolateColor,
  createStaggeredListAnimation,
};
