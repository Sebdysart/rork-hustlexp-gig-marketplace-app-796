import React from 'react';
import { Text, TextProps } from 'react-native';

/**
 * SafeText component - Always ensures text is wrapped in <Text> component
 * Prevents "Unexpected text node" errors in React Native
 * 
 * Usage: Use this instead of bare strings in Views
 * <View>{safeText(someValue)}</View>
 */
export function safeText(value: any, props?: TextProps): React.ReactElement {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <Text {...props}> </Text>;
  }
  
  // Handle numbers
  if (typeof value === 'number') {
    return <Text {...props}>{value}</Text>;
  }
  
  // Handle strings
  if (typeof value === 'string') {
    // Prevent rendering problematic strings
    const trimmed = value.trim();
    if (!trimmed || /^[\.\s,;:!?…]+$/.test(trimmed)) {
      console.warn('[safeText] Blocked problematic value:', JSON.stringify(value));
      return <Text {...props}> </Text>;
    }
    return <Text {...props}>{value}</Text>;
  }
  
  // Handle booleans
  if (typeof value === 'boolean') {
    return <Text {...props}>{value ? 'true' : 'false'}</Text>;
  }
  
  // If it's already a React element, return it
  if (React.isValidElement(value)) {
    return value;
  }
  
  // Fallback: convert to string
  try {
    const stringValue = String(value);
    return <Text {...props}>{stringValue}</Text>;
  } catch (error) {
    console.error('[safeText] Failed to convert value:', value, error);
    return <Text {...props}> </Text>;
  }
}

/**
 * useSafeTranslation - Hook to safely use translations with fallback
 */
export function useSafeTranslation(translations: string[], index: number, fallback: string = ' '): string {
  const value = translations[index];
  
  if (!value || typeof value !== 'string') {
    console.warn(`[useSafeTranslation] Invalid translation at index ${index}:`, value);
    return fallback;
  }
  
  const trimmed = value.trim();
  if (!trimmed || /^[\.\s,;:!?…]+$/.test(trimmed)) {
    console.warn(`[useSafeTranslation] Blocked problematic translation at index ${index}:`, JSON.stringify(value));
    return fallback;
  }
  
  return value;
}
