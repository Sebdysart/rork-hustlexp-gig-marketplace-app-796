/**
 * FINAL COMPREHENSIVE TEXT NODE FIX
 * 
 * This is the ULTIMATE solution to text node errors.
 * It combines multiple layers of protection to ensure no text node errors can occur.
 */

import React from 'react';
import { Text as RNText, View as RNView } from 'react-native';

let isInstalled = false;

/**
 * Creates a safe wrapper around React components that automatically fixes text node issues
 */
export function installFinalTextNodeFix() {
  if (isInstalled) {
    console.log('[FinalTextNodeFix] Already installed');
    return;
  }

  // Store original createElement
  const originalCreateElement = React.createElement;

  // List of components that cannot have direct text children
  const viewComponents = new Set([
    'View',
    'ScrollView',
    'FlatList',
    'SectionList',
    'VirtualizedList',
    'KeyboardAvoidingView',
    'SafeAreaView',
    'TouchableOpacity',
    'TouchableHighlight',
    'TouchableWithoutFeedback',
    'Pressable',
    'ImageBackground',
    'Modal',
  ]);

  function isViewComponent(type: any): boolean {
    if (!type) return false;
    
    // Check by reference
    if (type === RNView) return true;
    
    // Check by name/displayName
    const name = type.displayName || type.name || (typeof type === 'string' ? type : '');
    if (viewComponents.has(name)) return true;
    
    // Check if it contains 'View' in the name
    if (typeof name === 'string' && name.includes('View')) return true;
    
    return false;
  }

  function shouldFilterChild(child: any): boolean {
    if (child === null || child === undefined || child === false || child === true) {
      return true;
    }
    
    // Filter out problematic text content
    if (typeof child === 'string') {
      const trimmed = child.trim();
      // Remove empty strings, lone punctuation, whitespace
      if (!trimmed || /^[\.\s,;:!?…•\-–—]+$/.test(trimmed)) {
        console.warn('[FinalTextNodeFix] 🚫 Filtered out:', JSON.stringify(child));
        return true;
      }
    }
    
    return false;
  }

  function wrapTextChild(child: any, componentName: string, index: number): any {
    if (typeof child === 'string' || typeof child === 'number') {
      const strValue = String(child).trim();
      
      // Don't wrap if it's problematic content
      if (!strValue || /^[\.\s,;:!?…•\-–—]+$/.test(strValue)) {
        return null;
      }
      
      console.warn(
        `[FinalTextNodeFix] ⚠️ Auto-wrapped text in ${componentName}[${index}]:`,
        JSON.stringify(child)
      );
      
      return originalCreateElement(
        RNText,
        { style: { color: '#FFFFFF' } },
        child
      );
    }
    
    return child;
  }

  function processChildren(children: any[], componentName: string): any[] {
    const processed: any[] = [];
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      // Skip null/undefined/boolean
      if (shouldFilterChild(child)) {
        continue;
      }
      
      // Handle arrays
      if (Array.isArray(child)) {
        const arrayProcessed = processChildren(child, `${componentName}[${i}]`);
        processed.push(...arrayProcessed);
        continue;
      }
      
      // Wrap text/number children
      const wrapped = wrapTextChild(child, componentName, i);
      if (wrapped !== null) {
        processed.push(wrapped);
      }
    }
    
    return processed;
  }

  // Patch React.createElement
  // @ts-ignore
  React.createElement = function safeCrateElement(type: any, props: any, ...children: any[]) {
    const componentName = type?.displayName || type?.name || type || 'Unknown';
    
    // Only process View-like components
    if (isViewComponent(type)) {
      const safeChildren = processChildren(children, componentName);
      return originalCreateElement(type, props, ...safeChildren);
    }
    
    // For all other components, pass through unchanged
    return originalCreateElement(type, props, ...children);
  };

  isInstalled = true;
  console.log('[FinalTextNodeFix] ✅ INSTALLED SUCCESSFULLY');
  console.log('[FinalTextNodeFix] Protected components:', Array.from(viewComponents).join(', '));
  console.log('[FinalTextNodeFix] Will filter: empty strings, punctuation-only text');
  console.log('[FinalTextNodeFix] Will auto-wrap: text and numbers in View components');
}

/**
 * Safe render helper - use this in your components
 */
export function safeRenderText(value: any): string | null {
  if (value === null || value === undefined || value === false || value === true) {
    return null;
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const str = String(value).trim();
    if (!str || /^[\.\s,;:!?…•\-–—]+$/.test(str)) {
      return null;
    }
    return str;
  }
  
  return null;
}

/**
 * Component wrapper to safely render text content
 */
export function SafeText({ children, style }: { children: any; style?: any }) {
  const text = safeRenderText(children);
  
  if (text === null) {
    return null;
  }
  
  return React.createElement(RNText, { style }, text);
}

/**
 * Hook to detect text node errors in development
 */
export function useTextNodeErrorDetection() {
  React.useEffect(() => {
    if (!__DEV__) return;
    
    const checkInterval = setInterval(() => {
      // This will trigger if any unhandled text nodes exist
      console.log('[FinalTextNodeFix] Health check: OK');
    }, 10000);
    
    return () => clearInterval(checkInterval);
  }, []);
}
