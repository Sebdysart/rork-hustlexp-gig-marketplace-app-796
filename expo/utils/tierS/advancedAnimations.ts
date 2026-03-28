import { Animated, Easing } from 'react-native';

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
  velocity?: number;
}

export interface TimingConfig {
  duration?: number;
  easing?: (value: number) => number;
  delay?: number;
}

export const springPresets = {
  gentle: { tension: 120, friction: 14, mass: 1 },
  bouncy: { tension: 180, friction: 12, mass: 1 },
  snappy: { tension: 300, friction: 20, mass: 1 },
  slow: { tension: 80, friction: 10, mass: 1 },
  wobbly: { tension: 180, friction: 8, mass: 1 },
} as const;

export const timingPresets = {
  fast: { duration: 150, easing: Easing.out(Easing.ease) },
  normal: { duration: 250, easing: Easing.out(Easing.ease) },
  slow: { duration: 350, easing: Easing.out(Easing.ease) },
  elastic: { duration: 600, easing: Easing.elastic(1) },
  bounce: { duration: 400, easing: Easing.bounce },
} as const;

export function createSpringAnimation(
  value: Animated.Value,
  toValue: number,
  config: SpringConfig = springPresets.gentle
): Animated.CompositeAnimation {
  return Animated.spring(value, {
    toValue,
    tension: config.tension || 120,
    friction: config.friction || 14,
    mass: config.mass || 1,
    velocity: config.velocity || 0,
    useNativeDriver: true,
  });
}

export function createTimingAnimation(
  value: Animated.Value,
  toValue: number,
  config: TimingConfig = timingPresets.normal
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    duration: config.duration || 250,
    easing: config.easing || Easing.out(Easing.ease),
    delay: config.delay || 0,
    useNativeDriver: true,
  });
}

export function createSequenceAnimation(
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation {
  return Animated.sequence(animations);
}

export function createParallelAnimation(
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation {
  return Animated.parallel(animations);
}

export function createStaggerAnimation(
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 50
): Animated.CompositeAnimation {
  return Animated.stagger(staggerDelay, animations);
}

export function createLoopAnimation(
  animation: Animated.CompositeAnimation,
  iterations: number = -1
): Animated.CompositeAnimation {
  return Animated.loop(animation, { iterations });
}

export function createPressAnimation(
  scaleValue: Animated.Value,
  pressed: boolean
): Animated.CompositeAnimation {
  return createSpringAnimation(
    scaleValue,
    pressed ? 0.96 : 1,
    springPresets.snappy
  );
}

export function createFloatAnimation(
  translateY: Animated.Value,
  distance: number = -8,
  duration: number = 3000
): Animated.CompositeAnimation {
  return createLoopAnimation(
    createSequenceAnimation([
      createTimingAnimation(translateY, distance, { duration, easing: Easing.inOut(Easing.ease) }),
      createTimingAnimation(translateY, 0, { duration, easing: Easing.inOut(Easing.ease) }),
    ])
  );
}

export function createPulseAnimation(
  scaleValue: Animated.Value,
  minScale: number = 1,
  maxScale: number = 1.05,
  duration: number = 2000
): Animated.CompositeAnimation {
  return createLoopAnimation(
    createSequenceAnimation([
      createTimingAnimation(scaleValue, maxScale, { duration, easing: Easing.inOut(Easing.ease) }),
      createTimingAnimation(scaleValue, minScale, { duration, easing: Easing.inOut(Easing.ease) }),
    ])
  );
}

export function createShakeAnimation(
  translateX: Animated.Value,
  distance: number = 10,
  iterations: number = 3
): Animated.CompositeAnimation {
  const animations: Animated.CompositeAnimation[] = [];
  
  for (let i = 0; i < iterations; i++) {
    animations.push(
      createTimingAnimation(translateX, distance, { duration: 50, easing: Easing.linear })
    );
    animations.push(
      createTimingAnimation(translateX, -distance, { duration: 50, easing: Easing.linear })
    );
  }
  
  animations.push(
    createTimingAnimation(translateX, 0, { duration: 50, easing: Easing.linear })
  );
  
  return createSequenceAnimation(animations);
}

export function createFadeAnimation(
  opacity: Animated.Value,
  toValue: number,
  duration: number = 250
): Animated.CompositeAnimation {
  return createTimingAnimation(opacity, toValue, { duration, easing: Easing.inOut(Easing.ease) });
}

export function createSlideAnimation(
  translateValue: Animated.Value,
  toValue: number,
  config: TimingConfig = timingPresets.normal
): Animated.CompositeAnimation {
  return createTimingAnimation(translateValue, toValue, config);
}

export function createScaleAnimation(
  scaleValue: Animated.Value,
  toValue: number,
  config: SpringConfig = springPresets.gentle
): Animated.CompositeAnimation {
  return createSpringAnimation(scaleValue, toValue, config);
}

export function createRotateAnimation(
  rotateValue: Animated.Value,
  toValue: number,
  duration: number = 300
): Animated.CompositeAnimation {
  return createTimingAnimation(rotateValue, toValue, { duration, easing: Easing.linear });
}

export function createMorphAnimation(
  values: Animated.Value[],
  toValues: number[],
  config: SpringConfig = springPresets.gentle
): Animated.CompositeAnimation {
  const animations = values.map((value, index) =>
    createSpringAnimation(value, toValues[index], config)
  );
  return createParallelAnimation(animations);
}

export function createBounceEntranceAnimation(
  translateY: Animated.Value,
  scale: Animated.Value,
  opacity: Animated.Value
): Animated.CompositeAnimation {
  return createParallelAnimation([
    createSpringAnimation(translateY, 0, springPresets.bouncy),
    createSpringAnimation(scale, 1, springPresets.bouncy),
    createTimingAnimation(opacity, 1, timingPresets.fast),
  ]);
}

export function createSuccessAnimation(
  scale: Animated.Value,
  rotation: Animated.Value
): Animated.CompositeAnimation {
  return createSequenceAnimation([
    createParallelAnimation([
      createSpringAnimation(scale, 1.2, springPresets.bouncy),
      createRotateAnimation(rotation, 360, 400),
    ]),
    createSpringAnimation(scale, 1, springPresets.gentle),
  ]);
}

export const interpolateConfig = {
  pressScale: (value: Animated.Value) => ({
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  }),
  
  rotation: (value: Animated.Value, degrees: number = 360) => ({
    transform: [
      {
        rotate: value.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${degrees}deg`],
        }),
      },
    ],
  }),
  
  translation: (value: Animated.Value, distance: number) => ({
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  }),
  
  fadeIn: (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  }),
};

export function startAnimation(
  animation: Animated.CompositeAnimation,
  callback?: (result: Animated.EndResult) => void
): void {
  animation.start(callback);
}

export function stopAnimation(value: Animated.Value): void {
  value.stopAnimation();
}

export function resetAnimation(value: Animated.Value, toValue: number = 0): void {
  value.setValue(toValue);
}

export default {
  springPresets,
  timingPresets,
  createSpringAnimation,
  createTimingAnimation,
  createSequenceAnimation,
  createParallelAnimation,
  createStaggerAnimation,
  createLoopAnimation,
  createPressAnimation,
  createFloatAnimation,
  createPulseAnimation,
  createShakeAnimation,
  createFadeAnimation,
  createSlideAnimation,
  createScaleAnimation,
  createRotateAnimation,
  createMorphAnimation,
  createBounceEntranceAnimation,
  createSuccessAnimation,
  interpolateConfig,
  startAnimation,
  stopAnimation,
  resetAnimation,
};
