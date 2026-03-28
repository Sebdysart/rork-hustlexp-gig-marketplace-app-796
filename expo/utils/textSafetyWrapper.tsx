/**
 * Text Safety Wrapper for React Native
 * 
 * This utility ensures that ALL text content is safely wrapped in <Text> components
 * to prevent the "Unexpected text node" error.
 */

import React, { ReactNode } from 'react';
import { Text, View, ViewProps, TextProps } from 'react-native';

/**
 * Safe View Component - Automatically wraps any text children in <Text>
 * Use this instead of <View> when you're unsure if children contain text
 */
export function SafeView({ children, ...props }: ViewProps) {
  return (
    <View {...props}>
      {React.Children.map(children, (child) => {
        // If child is a string, number, or looks like text, wrap it
        if (typeof child === 'string' || typeof child === 'number') {
          // Skip empty strings, dots, and whitespace
          const stringValue = String(child).trim();
          if (!stringValue || stringValue === '.' || stringValue === '...' || stringValue === '…') {
            return null;
          }
          return <Text>{child}</Text>;
        }
        return child;
      })}
    </View>
  );
}

/**
 * Safe Text Component - Filters out problematic text values
 */
export function SafeText({ children, ...props }: TextProps) {
  // Filter children to remove problematic values
  const safeChildren = React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      const trimmed = child.trim();
      // Return null for empty, dots, or whitespace-only strings
      if (!trimmed || trimmed === '.' || trimmed === '...' || trimmed === '…') {
        return '\u00A0'; // Non-breaking space
      }
      return child;
    }
    return child;
  });

  return <Text {...props}>{safeChildren}</Text>;
}

/**
 * Wrap any unknown value safely for rendering
 */
export function safeRender(value: any): ReactNode {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const stringValue = String(value).trim();
    if (!stringValue || stringValue === '.' || stringValue === '...' || stringValue === '…') {
      return null;
    }
    return <Text>{value}</Text>;
  }
  
  if (React.isValidElement(value)) {
    return value;
  }
  
  return null;
}

/**
 * Safe conditional text renderer
 * Use: {condition && safeConditionalText('Message')}
 * Instead of: {condition && 'Message'}
 */
export function safeConditionalText(text: string | number): ReactNode {
  const stringValue = String(text).trim();
  if (!stringValue || stringValue === '.' || stringValue === '...' || stringValue === '…') {
    return null;
  }
  return <Text>{text}</Text>;
}
