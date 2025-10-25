/**
 * SafeText Component
 * 
 * A drop-in replacement for React Native's Text component that automatically
 * filters out problematic text values (empty strings, whitespace, punctuation-only)
 */

import React from 'react';
import { Text, TextProps } from 'react-native';

interface SafeTextProps extends TextProps {
  children?: React.ReactNode;
  fallback?: string;
}

/**
 * Validates if a value is safe to render as text
 */
function isSafeValue(value: any): boolean {
  if (value === null || value === undefined || value === false || value === true) {
    return false;
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const strValue = String(value).trim();
    // Block empty strings and punctuation-only strings
    if (!strValue || /^[\.\s,;:!?…]+$/.test(strValue)) {
      return false;
    }
    return true;
  }
  
  // For React elements, assume they're safe
  if (React.isValidElement(value)) {
    return true;
  }
  
  return false;
}

/**
 * Recursively sanitizes children to remove problematic text nodes
 */
function sanitizeChildren(children: React.ReactNode): React.ReactNode {
  if (!children) return null;
  
  if (Array.isArray(children)) {
    const sanitized = children.map(sanitizeChildren).filter(child => child !== null && child !== undefined);
    return sanitized.length > 0 ? sanitized : null;
  }
  
  if (!isSafeValue(children)) {
    return null;
  }
  
  return children;
}

/**
 * SafeText component that filters out problematic text values
 * 
 * Usage:
 * ```tsx
 * <SafeText>{someValue}</SafeText>
 * <SafeText fallback="No data">{possiblyEmptyValue}</SafeText>
 * ```
 */
export function SafeText({ children, fallback, ...props }: SafeTextProps) {
  const sanitized = sanitizeChildren(children);
  
  // If no valid content and no fallback, return null
  if (!sanitized && !fallback) {
    return null;
  }
  
  // Use fallback if content is invalid
  const content = sanitized || fallback;
  
  if (!content) {
    return null;
  }
  
  return <Text {...props}>{content}</Text>;
}

/**
 * Hook to safely get text content
 */
export function useSafeText(value: any, fallback: string = ''): string {
  if (!isSafeValue(value)) {
    return fallback;
  }
  return String(value);
}

export default SafeText;
