/**
 * Text Node Error Runtime Detector
 * 
 * This utility provides runtime detection and detailed logging
 * for "Unexpected text node" errors in React Native.
 */

import React from 'react';

export class TextNodeErrorDetector {
  private static errors: {
    componentName: string;
    value: any;
    timestamp: number;
    stack: string;
  }[] = [];

  static detectInChildren(children: React.ReactNode, componentName: string): void {
    if (!__DEV__) return;

    try {
      React.Children.forEach(children, (child) => {
        if (this.isProblematicTextNode(child)) {
          const error = {
            componentName,
            value: child,
            timestamp: Date.now(),
            stack: new Error().stack || 'No stack available',
          };
          
          this.errors.push(error);
          
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('🚨 TEXT NODE ERROR DETECTED');
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error(`Component: ${componentName}`);
          console.error(`Problematic value: "${child}" (type: ${typeof child})`);
          console.error(`Value length: ${String(child).length}`);
          console.error(`Trimmed: "${String(child).trim()}"`);
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('Stack trace:');
          console.error(error.stack);
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('FIX: Wrap this value in a <Text> component');
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
      });
    } catch (error) {
      console.warn('TextNodeErrorDetector failed:', error);
    }
  }

  private static isProblematicTextNode(value: any): boolean {
    if (typeof value === 'string') {
      return true;
    }
    
    if (typeof value === 'number') {
      return true;
    }
    
    return false;
  }

  static getErrorReport(): string {
    if (this.errors.length === 0) {
      return 'No text node errors detected';
    }

    return this.errors
      .map((error, index) => {
        return `
Error #${index + 1}:
  Component: ${error.componentName}
  Value: "${error.value}"
  Type: ${typeof error.value}
  Time: ${new Date(error.timestamp).toLocaleTimeString()}
        `.trim();
      })
      .join('\n\n');
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

/**
 * HOC to wrap components with text node detection
 */
export function withTextNodeDetection<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    if (__DEV__ && 'children' in props) {
      TextNodeErrorDetector.detectInChildren((props as any).children, componentName);
    }
    return React.createElement(Component, props);
  };
  WrappedComponent.displayName = `WithTextNodeDetection(${componentName})`;
  return WrappedComponent;
}

/**
 * Safe wrapper that filters out problematic text nodes
 */
export function safeChildren(children: React.ReactNode): React.ReactNode {
  try {
    return React.Children.map(children, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        if (__DEV__) {
          console.warn(
            `[SafeChildren] Filtered out text node: "${child}". ` +
            `This should be wrapped in <Text>.`
          );
        }
        return null;
      }
      return child;
    });
  } catch (error) {
    console.error('safeChildren failed:', error);
    return children;
  }
}

/**
 * Validates that a value is safe to use as children in a View
 */
export function validateViewChildren(children: React.ReactNode, context: string): void {
  if (!__DEV__) return;
  
  TextNodeErrorDetector.detectInChildren(children, context);
}
