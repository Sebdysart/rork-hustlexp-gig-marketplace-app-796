import React from 'react';
import { Text, View } from 'react-native';

let isFixed = false;
const originalCreateElement = React.createElement;

export function applyTextNodeFix() {
  if (isFixed) {
    console.log('[TextNodeFixer] Already applied');
    return;
  }

  console.log('[TextNodeFixer] Installing comprehensive text node fix...');

  React.createElement = function (type: any, props: any, ...children: any[]): any {
    try {
      const flatChildren = flattenChildren(children);
      const safeChildren: any[] = [];

      const isViewLike = checkIfViewLike(type);

      for (let i = 0; i < flatChildren.length; i++) {
        const child = flatChildren[i];

        if (isViewLike && isProblematicText(child)) {
          console.warn(
            '[TextNodeFixer] 🔧 Auto-fixing text node:',
            `"${child}"`,
            'in component:',
            getComponentName(type)
          );
          
          safeChildren.push(
            originalCreateElement(
              Text,
              { style: { color: 'inherit' } },
              child
            )
          );
        } else {
          safeChildren.push(child);
        }
      }

      return originalCreateElement(type, props, ...safeChildren);
    } catch (error) {
      console.error('[TextNodeFixer] Error in createElement wrapper:', error);
      return originalCreateElement(type, props, ...children);
    }
  };

  Object.assign(React.createElement, originalCreateElement);

  isFixed = true;
  console.log('[TextNodeFixer] ✅ Text node fix installed successfully');
}

function flattenChildren(children: any[]): any[] {
  const result: any[] = [];

  function flatten(item: any) {
    if (Array.isArray(item)) {
      item.forEach(flatten);
    } else if (item !== null && item !== undefined && item !== false) {
      result.push(item);
    }
  }

  children.forEach(flatten);
  return result;
}

function checkIfViewLike(type: any): boolean {
  if (!type) return false;

  if (type === View) return true;
  if (type === 'View') return true;
  
  if (type === Text) return false;
  if (type === 'Text') return false;

  const name = getComponentName(type);
  const viewPattern = /view|container|wrapper|box|layout|panel|section/i;
  const textPattern = /text|label|title|heading|paragraph/i;

  if (textPattern.test(name)) return false;
  if (viewPattern.test(name)) return true;

  return false;
}

function isProblematicText(child: any): boolean {
  if (typeof child !== 'string' && typeof child !== 'number') {
    return false;
  }

  if (typeof child === 'number') {
    return true;
  }

  const str = String(child);
  const trimmed = str.trim();

  if (!trimmed) return false;

  return true;
}

function getComponentName(type: any): string {
  if (typeof type === 'string') return type;
  if (typeof type === 'function') return type.name || type.displayName || 'Component';
  if (type && typeof type === 'object') return type.displayName || 'Component';
  return 'Unknown';
}

export function resetTextNodeFix() {
  if (!isFixed) return;
  
  React.createElement = originalCreateElement;
  isFixed = false;
  console.log('[TextNodeFixer] ❌ Text node fix removed');
}
