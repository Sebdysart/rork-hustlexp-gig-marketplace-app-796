import React, { createElement } from 'react';
import { View as RNView, Text as RNText, TextStyle } from 'react-native';

/**
 * Runtime Text Node Error Detector
 * 
 * This helps detect when text nodes are incorrectly rendered as children of View.
 * Use this ONLY in development mode to debug the text node error.
 */

let errorLog: Array<{ error: string; stack: string; timestamp: number }> = [];

export function getTextNodeErrors() {
  return errorLog;
}

export function clearTextNodeErrors() {
  errorLog = [];
}

/**
 * Check if a React child contains raw text (string or number)
 */
function hasRawTextChild(children: React.ReactNode): { hasRaw: boolean; value?: unknown } {
  if (typeof children === 'string' && children.trim().length > 0) {
    return { hasRaw: true, value: children };
  }
  if (typeof children === 'number') {
    return { hasRaw: true, value: children };
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      const result = hasRawTextChild(child);
      if (result.hasRaw) return result;
    }
  }
  return { hasRaw: false };
}

/**
 * Patch to log errors without crashing
 * Call this in your app/_layout.tsx during development
 */
export function enableTextNodeErrorLogging() {
  if (!__DEV__) return;
  
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = String(args[0] || '');
    
    if (message.includes('text node') || message.includes('Text node') || message.includes('A text node cannot be a child')) {
      console.log('🔍 Text node error detected!');
      console.log('Error message:', message);
      console.log('Additional args:', args.slice(1));
      console.log('Stack trace:', new Error().stack);
      
      errorLog.push({
        error: message,
        stack: new Error().stack || 'No stack',
        timestamp: Date.now()
      });
    }
    
    originalError.apply(console, args);
  };
  
  console.log('✅ Text node error logging enabled');
}

export default {
  enableTextNodeErrorLogging,
  getTextNodeErrors,
  clearTextNodeErrors
};
