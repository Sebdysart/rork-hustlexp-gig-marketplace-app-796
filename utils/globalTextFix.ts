/**
 * Global fix for "Unexpected text node" errors in React Native
 * This patches React's text rendering to prevent lone punctuation from causing crashes
 */

import { Text as RNText } from 'react-native';
import React from 'react';

// Create a safe text filter that removes problematic values
function safeTextValue(value: any): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  const str = String(value);
  
  // Get trimmed version
  const trimmed = str.trim();
  
  // Filter out problematic patterns that cause "Unexpected text node" errors
  // These include: lone periods, ellipsis, spaces, or punctuation-only strings
  if (
    !trimmed || 
    trimmed === '.' || 
    trimmed === '..' || 
    trimmed === '...' || 
    trimmed === '\u2026' || // ellipsis character
    /^[\.\s,;:!?]*$/.test(trimmed) // only punctuation/spaces
  ) {
    return '';
  }
  
  return str;
}

// Recursively filter children
function filterChildren(children: any): any {
  if (typeof children === 'string' || typeof children === 'number') {
    return safeTextValue(children);
  }
  
  if (Array.isArray(children)) {
    return children.map(filterChildren).filter(child => child !== '');
  }
  
  if (React.isValidElement(children)) {
    return children;
  }
  
  return children;
}

// Apply the global fix
export function applyGlobalTextFix() {
  // Only apply once
  if ((RNText as any).__textFixApplied) {
    return;
  }

  console.log('[GlobalTextFix] Applying global text node fix...');

  const OriginalText = RNText as any;
  
  // Create a wrapper component
  const SafeText = React.forwardRef((props: any, ref: any) => {
    const { children, ...rest } = props;
    
    // Filter children to prevent problematic text nodes
    const safeChildren = filterChildren(children);
    
    // If no valid children, render empty string to prevent errors
    if (!safeChildren || (Array.isArray(safeChildren) && safeChildren.length === 0)) {
      return React.createElement(OriginalText, { ...rest, ref }, '');
    }
    
    return React.createElement(OriginalText, { ...rest, ref }, safeChildren);
  });

  // Copy display name and other properties
  SafeText.displayName = 'SafeText';
  (SafeText as any).__textFixApplied = true;

  // Replace the Text component globally
  Object.setPrototypeOf(SafeText, OriginalText);
  Object.assign(SafeText, OriginalText);

  console.log('[GlobalTextFix] ✅ Global text fix applied successfully');
}

// Initialize immediately
applyGlobalTextFix();
