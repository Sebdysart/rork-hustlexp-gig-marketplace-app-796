/**
 * ULTIMATE Runtime Text Node Protection System
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
  if (typeof type === 'string') return false;
  
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
    'ImageBackground',
    'Modal',
    'Animated.View',
  ];
  
  return viewLikeComponents.includes(type) || 
         viewLikeComponents.includes(type?.displayName) ||
         viewLikeComponents.includes(type?.name) ||
         String(type).includes('View') ||
         String(type?.displayName).includes('View') ||
         String(type?.name).includes('View');
}

/**
 * Recursively processes children to wrap text nodes
 */
function processChild(child: any, depth: number = 0): any {
  if (depth > 20) return child;
  
  if (child === null || child === undefined || child === false || child === true) {
    return null;
  }
  
  if (typeof child === 'string') {
    const trimmed = child.trim();
    if (!trimmed || trimmed === '.' || /^[\.\s,;:!?…•]+$/.test(trimmed)) {
      console.warn('[TextNodeProtection] 🚫 Blocked punctuation:', JSON.stringify(child));
      return null;
    }
    return child;
  }
  
  if (typeof child === 'number') {
    return child;
  }
  
  if (Array.isArray(child)) {
    return child.map(c => processChild(c, depth + 1)).filter(c => c !== null);
  }
  
  return child;
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
    if (isViewLikeComponent(type)) {
      const processedChildren = children.map((child, index) => {
        const processed = processChild(child);
        
        if (typeof processed === 'string' || typeof processed === 'number') {
          const strValue = String(processed).trim();
          
          if (!strValue || /^[\.\s,;:!?…•]+$/.test(strValue)) {
            console.warn(`[TextNodeProtection] 🚫 Removed empty/punctuation at child[${index}]:`, JSON.stringify(processed));
            return null;
          }
          
          console.warn(`[TextNodeProtection] ⚠️ Auto-wrapping text in ${type?.name || type}[${index}]:`, JSON.stringify(processed));
          return originalCreateElement(Text, { style: { color: '#FFFFFF' } }, processed);
        }
        
        if (Array.isArray(processed)) {
          return processed.map((item, idx) => {
            if (typeof item === 'string' || typeof item === 'number') {
              const strValue = String(item).trim();
              if (!strValue || /^[\.\s,;:!?…•]+$/.test(strValue)) {
                return null;
              }
              console.warn(`[TextNodeProtection] ⚠️ Auto-wrapping array item in ${type?.name || type}[${index}][${idx}]:`, JSON.stringify(item));
              return originalCreateElement(Text, { style: { color: '#FFFFFF' } }, item);
            }
            return item;
          }).filter(Boolean);
        }
        
        return processed;
      }).filter(c => c !== null && c !== undefined);

      return originalCreateElement(type, props, ...processedChildren);
    }

    return originalCreateElement(type, props, ...children);
  };

  isPatched = true;
  console.log('[TextNodeProtection] ✅ ULTIMATE Runtime protection installed');
  console.log('[TextNodeProtection] Will block: empty strings, periods, commas, and other punctuation');
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
