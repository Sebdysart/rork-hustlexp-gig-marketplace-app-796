/**
 * Safe rendering utilities to prevent "Unexpected text node" errors
 */

import React from 'react';
import { Text } from 'react-native';

/**
 * Checks if a value is a problematic text node that would cause rendering errors
 */
export function isProblematicTextNode(value: any): boolean {
  if (value === null || value === undefined || value === false || value === true) {
    return false; // These are filtered out by React
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    // Check for empty, spaces, dots, or punctuation-only strings
    if (
      !trimmed ||
      trimmed === '.' ||
      trimmed === '..' ||
      trimmed === '...' ||
      trimmed === '\u2026' ||
      /^[\.\s,;:!?]*$/.test(trimmed)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes children to prevent text node errors
 */
export function sanitizeChildren(children: any): any {
  if (children === null || children === undefined || children === false || children === true) {
    return null;
  }

  if (typeof children === 'string') {
    if (isProblematicTextNode(children)) {
      return null;
    }
    // Wrap lone strings in Text component
    return React.createElement(Text, null, children);
  }

  if (typeof children === 'number') {
    return React.createElement(Text, null, String(children));
  }

  if (Array.isArray(children)) {
    return children.map(sanitizeChildren).filter(child => child !== null);
  }

  if (React.isValidElement(children)) {
    return children;
  }

  return null;
}

/**
 * Validates that children don't contain problematic text nodes
 */
export function validateChildren(children: any, componentName: string = 'Component'): void {
  if (__DEV__) {
    const check = (child: any, path: string = '') => {
      if (child === null || child === undefined || typeof child === 'boolean') {
        return;
      }

      if (typeof child === 'string' || typeof child === 'number') {
        const str = String(child);
        if (isProblematicTextNode(str)) {
          console.warn(
            `[TextNodeValidator] ${componentName}${path}: Found problematic text node: "${str}". ` +
            `This may cause "Unexpected text node" errors. Wrap in <Text> component.`
          );
        } else {
          console.warn(
            `[TextNodeValidator] ${componentName}${path}: Found unwrapped text: "${str}". ` +
            `All text must be wrapped in <Text> component in React Native.`
          );
        }
        return;
      }

      if (Array.isArray(child)) {
        child.forEach((c, i) => check(c, `${path}[${i}]`));
        return;
      }

      if (React.isValidElement(child)) {
        if (child.props && child.props.children) {
          check(child.props.children, `${path}>${child.type}`);
        }
      }
    };

    check(children);
  }
}
