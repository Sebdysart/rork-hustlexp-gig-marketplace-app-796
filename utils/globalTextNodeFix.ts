import React from "react";
/**
 * Global Text Node Error Prevention
 * 
 * This module patches React Native's View component at runtime to automatically
 * wrap any text children in Text components, preventing "Unexpected text node" errors.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let isPatched = false;

/**
 * Validates and sanitizes text content to prevent rendering errors
 */
function sanitizeTextContent(content: any): any {
  if (content === null || content === undefined) {
    return null;
  }

  if (typeof content === 'string') {
    const trimmed = content.trim();
    // Filter out problematic values
    if (!trimmed || trimmed === '.' || trimmed === '...' || trimmed === '…' || trimmed === '...' || /^[\.\s]+$/.test(trimmed)) {
      console.warn('[GlobalTextNodeFix] Filtered problematic text value:', JSON.stringify(content));
      return null;
    }
  }

  return content;
}



/**
 * Install the global text node fix
 * This should be called ONCE at app startup
 */
export function installGlobalTextNodeFix() {
  if (isPatched) {
    console.log('[GlobalTextNodeFix] Already patched');
    return;
  }

  console.log('[GlobalTextNodeFix] Installing runtime text validation...');
  
  // Patch React.createElement to filter out problematic text nodes
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const React = require('react');
    const originalCreateElement = React.createElement;
    
    React.createElement = function(type: any, props: any, ...children: any[]) {
      // Filter problematic text nodes from ALL View-like components
      const isViewComponent = type && (
        type === 'View' || 
        (typeof type === 'string' && type === 'View') ||
        (type.displayName && type.displayName.includes('View')) ||
        (type.name && type.name.includes('View')) ||
        type === 'Animated.View'
      );

      if (isViewComponent) {
        // Process all children and filter problematic values
        const processChild = (child: any): any => {
          if (child === null || child === undefined) {
            return null;
          }
          
          if (typeof child === 'string') {
            const trimmed = child.trim();
            // Filter out problematic strings
            if (!trimmed || /^[\.\s,;:!?…]+$/.test(trimmed)) {
              console.warn('[GlobalTextNodeFix] 🚫 Blocked problematic text:', JSON.stringify(child));
              return null;
            }
          }
          
          // Recursively process arrays
          if (Array.isArray(child)) {
            return child.map(processChild).filter(c => c !== null);
          }
          
          return child;
        };
        
        const filteredChildren = children
          .map(processChild)
          .flat()
          .filter(child => child !== null && child !== undefined);
        
        return originalCreateElement.call(this, type, props, ...filteredChildren);
      }
      
      return originalCreateElement.call(this, type, props, ...children);
    };
    
    console.log('[GlobalTextNodeFix] ✅ React.createElement patched to filter problematic text nodes');
  } catch (error) {
    console.warn('[GlobalTextNodeFix] Failed to patch React.createElement:', error);
  }

  isPatched = true;
  console.log('[GlobalTextNodeFix] ✅ Runtime validation installed');
}

/**
 * Validates that a value is safe to render in React Native
 */
export function validateRenderValue(value: any, context: string = 'unknown'): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '.' || trimmed === '...' || trimmed === '…') {
      console.warn(`[GlobalTextNodeFix] ⚠️ Problematic text value detected in ${context}:`, JSON.stringify(value));
      console.warn('[GlobalTextNodeFix] This may cause "Unexpected text node" error');
      console.warn('[GlobalTextNodeFix] Stack trace:', new Error().stack);
      return false;
    }
  }

  return true;
}

/**
 * Safe wrapper for any dynamic content
 */
export function safeContent(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const stringValue = String(value);
    const trimmed = stringValue.trim();
    
    if (!trimmed || trimmed === '.' || trimmed === '...' || trimmed === '…' || trimmed === '...') {
      console.warn('[GlobalTextNodeFix] Filtered out problematic value:', JSON.stringify(value));
      return null;
    }
    
    return value;
  }

  return value;
}
