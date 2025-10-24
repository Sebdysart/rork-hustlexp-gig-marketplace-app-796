import React from 'react';
import { View as RNView, ViewProps } from 'react-native';

/**
 * Text Node Diagnostic Utility
 * 
 * This utility helps identify and prevent "Unexpected text node" errors in React Native.
 * 
 * Common causes:
 * 1. String/number values as direct children of View
 * 2. Conditional expressions returning strings: {condition && "text"}
 * 3. Template literals: {`${value}`}
 * 4. Empty strings or whitespace
 * 5. Translation functions returning strings directly
 * 
 * Solution: Always wrap text in <Text> components
 */

export const TextNodeErrors = {
  DIRECT_STRING: 'Direct string as child of View',
  CONDITIONAL_STRING: 'Conditional expression returning string',
  TEMPLATE_LITERAL: 'Template literal as child',
  EMPTY_STRING: 'Empty string or whitespace',
  TRANSLATION: 'Translation function returning unwrapped text',
} as const;

/**
 * Safe wrapper for conditional text rendering
 * Usage: {condition && safeText("Hello")}
 */
export function safeText(text: string | number | null | undefined): null {
  if (text !== null && text !== undefined && text !== '') {
    console.error('[TEXT NODE ERROR] Attempted to render unwrapped text:', text);
    console.error('Always wrap text in <Text> components in React Native');
  }
  return null;
}

/**
 * Check if a value is a text node that needs wrapping
 */
export function isTextNode(value: any): boolean {
  return typeof value === 'string' || typeof value === 'number';
}

/**
 * Diagnostic function to validate component children
 */
export function validateChildren(children: any, componentName: string): void {
  if (__DEV__) {
    React.Children.forEach(children, (child) => {
      if (isTextNode(child)) {
        console.error(
          `[TEXT NODE ERROR] in ${componentName}: Found unwrapped text node "${child}". ` +
          `Wrap it in <Text> component.`
        );
      }
    });
  }
}

/**
 * Safe View component that prevents text node errors
 */
export function SafeView({ children, ...props }: ViewProps) {
  if (__DEV__) {
    validateChildren(children, 'View');
  }
  
  return React.createElement(RNView, props, children);
}

/**
 * Common patterns and their fixes:
 * 
 * ❌ BAD:
 * <View>
 *   {user.name}
 * </View>
 * 
 * ✅ GOOD:
 * <View>
 *   <Text>{user.name}</Text>
 * </View>
 * 
 * ❌ BAD:
 * <View>
 *   {count > 0 && "Items available"}
 * </View>
 * 
 * ✅ GOOD:
 * <View>
 *   {count > 0 && <Text>Items available</Text>}
 * </View>
 * 
 * ❌ BAD:
 * <View>
 *   {translations[key]}
 * </View>
 * 
 * ✅ GOOD:
 * <View>
 *   <Text>{translations[key]}</Text>
 * </View>
 * 
 * ❌ BAD:
 * <View>
 *   {badge > 9 ? '9+' : badge}
 * </View>
 * 
 * ✅ GOOD:
 * <View>
 *   <Text>{badge > 9 ? '9+' : badge}</Text>
 * </View>
 */
