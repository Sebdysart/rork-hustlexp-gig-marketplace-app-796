export function getTimeOfDayTheme(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getSeasonalTheme(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth();
  
  if (month >= 2 && month < 5) return 'spring';
  if (month >= 5 && month < 8) return 'summer';
  if (month >= 8 && month < 11) return 'fall';
  return 'winter';
}

export function getBackgroundGradientForTime(): string[] {
  const timeTheme = getTimeOfDayTheme();
  
  switch (timeTheme) {
    case 'morning':
      return ['#FF9A8B', '#FF6A88', '#FF99AC'];
    case 'afternoon':
      return ['#4FACFE', '#00F2FE'];
    case 'evening':
      return ['#FA709A', '#FEE140'];
    case 'night':
      return ['#0F2027', '#203A43', '#2C5364'];
    default:
      return ['#0D0D0F', '#1A1A1A'];
  }
}

export function getAnimationComplexityForLevel(level: number): 'simple' | 'moderate' | 'complex' {
  if (level < 10) return 'simple';
  if (level < 50) return 'moderate';
  return 'complex';
}

export function getCelebrationIntensityForStreak(streak: number): 'minimal' | 'standard' | 'epic' {
  if (streak < 7) return 'minimal';
  if (streak < 30) return 'standard';
  return 'epic';
}

export function shouldReduceAnimationsForBattery(batteryLevel: number): boolean {
  return batteryLevel < 0.2;
}

export function getImageLoadingStrategy(networkSpeed: string): 'progressive' | 'immediate' | 'placeholder' {
  switch (networkSpeed) {
    case 'slow-2g':
    case '2g':
      return 'placeholder';
    case '3g':
      return 'progressive';
    default:
      return 'immediate';
  }
}

export function getAnimationDurationMultiplier(
  userLevel: number,
  batteryLevel: number,
  isLowEndDevice: boolean
): number {
  let multiplier = 1.0;
  
  if (isLowEndDevice) multiplier *= 0.7;
  
  if (batteryLevel < 0.2) multiplier *= 0.5;
  
  if (userLevel > 50) multiplier *= 1.2;
  
  return multiplier;
}

export function getParticleCountForDevice(isLowEndDevice: boolean): number {
  return isLowEndDevice ? 20 : 50;
}

export function shouldUseGPUAcceleration(isLowEndDevice: boolean): boolean {
  return !isLowEndDevice;
}

export interface ContextualConfig {
  timeTheme: 'morning' | 'afternoon' | 'evening' | 'night';
  seasonTheme: 'spring' | 'summer' | 'fall' | 'winter';
  animationComplexity: 'simple' | 'moderate' | 'complex';
  celebrationIntensity: 'minimal' | 'standard' | 'epic';
  backgroundGradient: string[];
  durationMultiplier: number;
  particleCount: number;
  useGPUAcceleration: boolean;
}

export function getContextualConfig(
  userLevel: number,
  streak: number,
  batteryLevel: number,
  isLowEndDevice: boolean
): ContextualConfig {
  return {
    timeTheme: getTimeOfDayTheme(),
    seasonTheme: getSeasonalTheme(),
    animationComplexity: getAnimationComplexityForLevel(userLevel),
    celebrationIntensity: getCelebrationIntensityForStreak(streak),
    backgroundGradient: getBackgroundGradientForTime(),
    durationMultiplier: getAnimationDurationMultiplier(userLevel, batteryLevel, isLowEndDevice),
    particleCount: getParticleCountForDevice(isLowEndDevice),
    useGPUAcceleration: shouldUseGPUAcceleration(isLowEndDevice),
  };
}

export default {
  getTimeOfDayTheme,
  getSeasonalTheme,
  getBackgroundGradientForTime,
  getAnimationComplexityForLevel,
  getCelebrationIntensityForStreak,
  shouldReduceAnimationsForBattery,
  getImageLoadingStrategy,
  getAnimationDurationMultiplier,
  getParticleCountForDevice,
  shouldUseGPUAcceleration,
  getContextualConfig,
};
