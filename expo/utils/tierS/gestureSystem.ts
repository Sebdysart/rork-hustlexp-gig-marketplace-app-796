import { Dimensions, PanResponderGestureState } from 'react-native';
import { triggerSensoryFeedback } from './sensoryFeedback';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type GestureDirection = 'left' | 'right' | 'up' | 'down';
export type GestureType = 'swipe' | 'longPress' | 'doubleTap' | 'pinch';

export interface GestureConfig {
  swipeThreshold?: number;
  longPressDuration?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
  hapticFeedback?: boolean;
}

const defaultConfig: GestureConfig = {
  swipeThreshold: SCREEN_WIDTH * 0.25,
  longPressDuration: 500,
  doubleTapDelay: 300,
  pinchThreshold: 0.1,
  hapticFeedback: true,
};

export function detectSwipeDirection(
  gestureState: PanResponderGestureState,
  config: GestureConfig = defaultConfig
): GestureDirection | null {
  const { dx, dy } = gestureState;
  const threshold = config.swipeThreshold || defaultConfig.swipeThreshold!;
  
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx > threshold && absDx > absDy) {
    if (config.hapticFeedback) {
      triggerSensoryFeedback('swipe');
    }
    return dx > 0 ? 'right' : 'left';
  }

  if (absDy > threshold && absDy > absDx) {
    if (config.hapticFeedback) {
      triggerSensoryFeedback('swipe');
    }
    return dy > 0 ? 'down' : 'up';
  }

  return null;
}

export function isSwipeGesture(
  gestureState: PanResponderGestureState,
  config: GestureConfig = defaultConfig
): boolean {
  return detectSwipeDirection(gestureState, config) !== null;
}

export function createLongPressDetector(
  onLongPress: () => void,
  config: GestureConfig = defaultConfig
): () => ReturnType<typeof setTimeout> {
  return () => {
    const timeout = setTimeout(() => {
      if (config.hapticFeedback) {
        triggerSensoryFeedback('longPress');
      }
      onLongPress();
    }, config.longPressDuration || defaultConfig.longPressDuration);

    return timeout;
  };
}

export function createDoubleTapDetector(
  onDoubleTap: () => void,
  config: GestureConfig = defaultConfig
): {
  handleTap: () => void;
  reset: () => void;
} {
  let lastTapTime = 0;
  let tapTimeout: ReturnType<typeof setTimeout> | null = null;

  return {
    handleTap: () => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime;

      if (timeSinceLastTap < (config.doubleTapDelay || defaultConfig.doubleTapDelay!)) {
        if (tapTimeout) {
          clearTimeout(tapTimeout);
          tapTimeout = null;
        }
        
        if (config.hapticFeedback) {
          triggerSensoryFeedback('tap');
        }
        
        onDoubleTap();
        lastTapTime = 0;
      } else {
        lastTapTime = now;
        
        tapTimeout = setTimeout(() => {
          lastTapTime = 0;
        }, config.doubleTapDelay || defaultConfig.doubleTapDelay);
      }
    },
    reset: () => {
      if (tapTimeout) {
        clearTimeout(tapTimeout);
        tapTimeout = null;
      }
      lastTapTime = 0;
    },
  };
}

export function calculateSwipeVelocity(
  gestureState: PanResponderGestureState
): { vx: number; vy: number; magnitude: number } {
  const { vx, vy } = gestureState;
  const magnitude = Math.sqrt(vx * vx + vy * vy);
  
  return { vx, vy, magnitude };
}

export function isQuickSwipe(
  gestureState: PanResponderGestureState,
  velocityThreshold: number = 0.5
): boolean {
  const { magnitude } = calculateSwipeVelocity(gestureState);
  return magnitude > velocityThreshold;
}

export function normalizeGestureDistance(
  distance: number,
  axis: 'horizontal' | 'vertical' = 'horizontal'
): number {
  const screenSize = axis === 'horizontal' ? SCREEN_WIDTH : SCREEN_HEIGHT;
  return distance / screenSize;
}

export function createGestureHandler<T>(
  handlers: {
    onSwipeLeft?: (data?: T) => void;
    onSwipeRight?: (data?: T) => void;
    onSwipeUp?: (data?: T) => void;
    onSwipeDown?: (data?: T) => void;
    onLongPress?: (data?: T) => void;
    onDoubleTap?: (data?: T) => void;
  },
  config: GestureConfig = defaultConfig
) {
  const doubleTapDetector = handlers.onDoubleTap
    ? createDoubleTapDetector(() => handlers.onDoubleTap?.(), config)
    : null;

  let longPressTimeout: ReturnType<typeof setTimeout> | null = null;

  return {
    onPanResponderGrant: (data?: T) => {
      if (handlers.onLongPress) {
        longPressTimeout = setTimeout(() => {
          if (config.hapticFeedback) {
            triggerSensoryFeedback('longPress');
          }
          handlers.onLongPress?.(data);
        }, config.longPressDuration || defaultConfig.longPressDuration);
      }
    },

    onPanResponderRelease: (gestureState: PanResponderGestureState, data?: T) => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        longPressTimeout = null;
      }

      const direction = detectSwipeDirection(gestureState, config);
      
      if (direction) {
        switch (direction) {
          case 'left':
            handlers.onSwipeLeft?.(data);
            break;
          case 'right':
            handlers.onSwipeRight?.(data);
            break;
          case 'up':
            handlers.onSwipeUp?.(data);
            break;
          case 'down':
            handlers.onSwipeDown?.(data);
            break;
        }
      }
    },

    onTap: (data?: T) => {
      if (doubleTapDetector) {
        doubleTapDetector.handleTap();
      }
    },

    cleanup: () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }
      if (doubleTapDetector) {
        doubleTapDetector.reset();
      }
    },
  };
}

export default {
  detectSwipeDirection,
  isSwipeGesture,
  createLongPressDetector,
  createDoubleTapDetector,
  calculateSwipeVelocity,
  isQuickSwipe,
  normalizeGestureDistance,
  createGestureHandler,
};
