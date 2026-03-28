import { AccessibilityInfo, Platform } from 'react-native';

export interface A11yConfig {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  boldTextEnabled: boolean;
  highContrastEnabled: boolean;
}

export async function getAccessibilityConfig(): Promise<A11yConfig> {
  if (Platform.OS === 'web') {
    return {
      screenReaderEnabled: false,
      reduceMotionEnabled: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      boldTextEnabled: false,
      highContrastEnabled: window.matchMedia('(prefers-contrast: high)').matches,
    };
  }

  const [screenReader, reduceMotion, boldText] = await Promise.all([
    AccessibilityInfo.isScreenReaderEnabled(),
    AccessibilityInfo.isReduceMotionEnabled().catch(() => false),
    AccessibilityInfo.isBoldTextEnabled().catch(() => false),
  ]);

  return {
    screenReaderEnabled: screenReader,
    reduceMotionEnabled: reduceMotion,
    boldTextEnabled: boldText,
    highContrastEnabled: false,
  };
}

export function getAccessibleLabel(
  label: string,
  hint?: string,
  value?: string
): { accessibilityLabel: string; accessibilityHint?: string } {
  return {
    accessibilityLabel: value ? `${label}, ${value}` : label,
    accessibilityHint: hint,
  };
}

export function getAccessibleRole(
  element: 'button' | 'link' | 'text' | 'header' | 'image' | 'list'
): string {
  const roleMap = {
    button: 'button',
    link: 'link',
    text: 'text',
    header: 'header',
    image: 'image',
    list: 'list',
  };

  return roleMap[element];
}

export function shouldReduceAnimations(a11yConfig: A11yConfig): boolean {
  return a11yConfig.reduceMotionEnabled;
}

export function getFontScale(a11yConfig: A11yConfig): number {
  return a11yConfig.boldTextEnabled ? 1.1 : 1.0;
}

export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const toLinear = (c: number) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function isWCAGCompliant(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = level === 'AAA' ? 7 : 4.5;

  return ratio >= threshold;
}

export function getHighContrastColor(
  color: string,
  isDarkMode: boolean
): string {
  if (isDarkMode) {
    return '#FFFFFF';
  }
  return '#000000';
}

export function announceForScreenReader(message: string): void {
  if (Platform.OS !== 'web') {
    AccessibilityInfo.announceForAccessibility(message);
  }
}

export function setAccessibilityFocus(reactTag: number): void {
  if (Platform.OS !== 'web') {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }
}

export interface KeyboardNavigationConfig {
  focusable: boolean;
  accessibilityRole: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
}

export function createKeyboardNavigable(
  label: string,
  role: 'button' | 'link' | 'text' | 'header' = 'button',
  options?: {
    hint?: string;
    disabled?: boolean;
    selected?: boolean;
  }
): KeyboardNavigationConfig {
  return {
    focusable: true,
    accessibilityRole: getAccessibleRole(role),
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityState: {
      disabled: options?.disabled || false,
      selected: options?.selected || false,
    },
  };
}

export function getMinimumTouchableSize(): { width: number; height: number } {
  return { width: 44, height: 44 };
}

export function ensureTouchableArea(
  width: number,
  height: number
): { width: number; height: number; padding: number } {
  const minSize = getMinimumTouchableSize();
  const paddingX = Math.max(0, (minSize.width - width) / 2);
  const paddingY = Math.max(0, (minSize.height - height) / 2);

  return {
    width: Math.max(width, minSize.width),
    height: Math.max(height, minSize.height),
    padding: Math.max(paddingX, paddingY),
  };
}

export default {
  getAccessibilityConfig,
  getAccessibleLabel,
  getAccessibleRole,
  shouldReduceAnimations,
  getFontScale,
  getContrastRatio,
  isWCAGCompliant,
  getHighContrastColor,
  announceForScreenReader,
  setAccessibilityFocus,
  createKeyboardNavigable,
  getMinimumTouchableSize,
  ensureTouchableArea,
};
