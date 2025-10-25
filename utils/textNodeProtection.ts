/**
 * Runtime Text Node Protection System
 * 
 * This utility prevents "Unexpected text node: X. A text node cannot be a child of a <View>" errors
 * by intercepting and wrapping bare text nodes in React Native components.
 */

import React from 'react';
import { Text, View } from 'react-native';

const originalCreateElement = React.createElement;
let isPatched = false;



/**
 * Checks if a component type is View-like (can't have text children)
 */
function isViewLikeComponent(type: any): boolean {
  if (typeof type === 'string') return false; // Native HTML elements are fine on web
  
  const viewLikeComponents = [
    View,
    'View',
    'ScrollView', 
    'FlatList',
    'SectionList',
    'KeyboardAvoidingView',
    'SafeAreaView',
    'TouchableOpacity',
    'TouchableHighlight',
    'TouchableWithoutFeedback',
    'Pressable',
  ];
  
  return viewLikeComponents.includes(type) || 
         (type?.displayName && viewLikeComponents.includes(type.displayName)) ||
         (type?.name && viewLikeComponents.includes(type.name));
}

/**
 * Patches React.createElement to automatically protect against text node errors
 */
export function installTextNodeProtection() {
  if (isPatched) {
    console.log('[TextNodeProtection] Already installed');
    return;
  }

  // @ts-ignore
  React.createElement = function patchedCreateElement(type: any, props: any, ...children: any[]) {
    // Only intercept View-like components
    if (isViewLikeComponent(type)) {
      const safeChildren = children.map((child) => {
        // Handle conditional rendering that might produce strings
        if (typeof child === 'string' || typeof child === 'number') {
          const strValue = String(child).trim();
          
          // Block problematic strings
          if (!strValue || /^[\.\s,;:!?…]+$/.test(strValue)) {
            console.warn('[TextNodeProtection] Blocked bare text in View:', JSON.stringify(child));
            return null;
          }
          
          // Auto-wrap in Text
          console.warn('[TextNodeProtection] Auto-wrapping text in View:', JSON.stringify(child));
          return originalCreateElement(Text, null, child);
        }
        
        return child;
      }).filter(c => c !== null);

      return originalCreateElement(type, props, ...safeChildren);
    }

    // For all other components, pass through
    return originalCreateElement(type, props, ...children);
  };

  isPatched = true;
  console.log('[TextNodeProtection] ✅ Runtime protection installed');
}

/**
 * Validates that a value is safe to render as text
 */
export function isSafeText(value: any): boolean {
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
  
  return false;
}

/**
 * Safely renders text content, returning null for problematic values
 */
export function safeText(value: any): string | null {
  if (!isSafeText(value)) {
    return null;
  }
  return String(value);
}
