export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
    hero: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const elevation = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  low: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  high: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const glassmorphism = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  darkStrong: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
  },
} as const;

export const neonGlow = {
  cyan: {
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  magenta: {
    shadowColor: '#FF00A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  amber: {
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  violet: {
    shadowColor: '#9B5EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  green: {
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  blue: {
    shadowColor: '#5271FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  subtle: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const transitions = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
} as const;

export const premiumColors = {
  neonCyan: '#00FFFF',
  neonMagenta: '#FF00A8',
  neonAmber: '#FFB800',
  neonViolet: '#9B5EFF',
  neonGreen: '#00FF88',
  neonBlue: '#5271FF',
  neonPurple: '#A855F7',
  neonOrange: '#FF6B35',
  deepBlack: '#0D0D0F',
  richBlack: '#121212',
  charcoal: '#1A1A1A',
  softWhite: '#F8F9FA',
  glassWhite: 'rgba(255, 255, 255, 0.1)',
  glassWhiteStrong: 'rgba(255, 255, 255, 0.2)',
  glassWhiteMedium: 'rgba(255, 255, 255, 0.15)',
  glassDark: 'rgba(0, 0, 0, 0.4)',
  glassDarkStrong: 'rgba(0, 0, 0, 0.6)',
  gritGold: '#FFD700',
  gritGoldDark: '#FFA500',
  gritGoldLight: '#FFED4E',
} as const;

export const gradients = {
  xpBar: ['#5271FF', '#9B5EFF', '#FF00A8'],
  levelUp: ['#FFD700', '#FF6B35', '#FF00A8'],
  background: {
    level1: ['#0D0D0F', '#1A1A1A'],
    level10: ['#0D0D0F', '#1A1A1A', '#1F1B2E'],
    level25: ['#0D0D0F', '#1A1A1A', '#2E1F2E'],
    level50: ['#0D0D0F', '#1A1A1A', '#2E1F3E'],
    level100: ['#0D0D0F', '#1A1A1A', '#3E1F4E'],
  },
  card: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'],
  gritCoin: ['#FFD700', '#FFA500', '#FF8C00'],
  verified: ['#00FF88', '#00FFFF'],
  premium: ['#FFD700', '#FF00A8', '#9B5EFF'],
} as const;

export const animations = {
  pulse: {
    duration: 2000,
    easing: 'ease-in-out' as const,
  },
  float: {
    duration: 3000,
    easing: 'ease-in-out' as const,
  },
  shimmer: {
    duration: 1500,
    easing: 'linear' as const,
  },
  bounce: {
    duration: 600,
    easing: 'ease-out' as const,
  },
} as const;

export const COLORS = {
  primary: '#9B5EFF',
  secondary: '#00FFFF',
  accent: '#FFB800',
  background: '#0D0D0F',
  surface: '#1A1A1A',
  card: '#252525',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  success: '#00FF88',
  error: '#FF00A8',
  warning: '#FFB800',
  info: '#00FFFF',
  border: 'rgba(255, 255, 255, 0.1)',
  white: '#FFFFFF',
  lightGray: '#D1D5DB',
  electricBlue: '#5271FF',
  hotPink: '#FF00A8',
  legendary: '#FFB800',
  
  rarity: {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B',
  },

  light: {
    text: '#000',
    background: '#fff',
    tint: '#6B46C1',
    tabIconDefault: '#ccc',
    tabIconSelected: '#6B46C1',
  },
} as const;

export const colors = {
  background: {
    primary: COLORS.background,
    secondary: COLORS.surface,
    tertiary: COLORS.card,
  },
  text: {
    primary: COLORS.text,
    secondary: COLORS.textSecondary,
    tertiary: '#6B7280',
  },
  accent: {
    cyan: COLORS.secondary,
    magenta: COLORS.error,
  },
  border: {
    primary: COLORS.border,
  },
  success: COLORS.success,
  error: COLORS.error,
} as const;

export default COLORS;
