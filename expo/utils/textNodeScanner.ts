/**
 * Runtime scanner to detect text node errors
 * This will log any instances where text is rendered outside of <Text> components
 */

import React from 'react';
import { View as RNView } from 'react-native';

let isPatched = false;
const detectedIssues: { component: string; value: any; stack: string }[] = [];

export function enableTextNodeScanning() {
  if (isPatched) {
    console.log('[TextNodeScanner] Already enabled');
    return;
  }

  console.log('[TextNodeScanner] 🔍 Enabling runtime text node scanning...');

  const OriginalView = RNView as any;
  const OriginalViewRender = OriginalView.prototype?.render;

  // Intercept View rendering
  if (OriginalViewRender) {
    RNView.prototype.render = function(this: any) {
      const result = OriginalViewRender.call(this);
      
      if (result && result.props && result.props.children) {
        scanChildren(result.props.children, 'View');
      }
      
      return result;
    };
  }

  isPatched = true;
  console.log('[TextNodeScanner] ✅ Text node scanning enabled');
}

function scanChildren(children: any, parentComponent: string) {
  if (children === null || children === undefined || typeof children === 'boolean') {
    return;
  }

  if (typeof children === 'string') {
    const trimmed = children.trim();
    if (trimmed && trimmed !== '') {
      const stack = new Error().stack || '';
      detectedIssues.push({
        component: parentComponent,
        value: children,
        stack
      });
      
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🚨 TEXT NODE ERROR DETECTED BY SCANNER');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error(`Parent: <${parentComponent}>`);
      console.error(`Text Value: "${children}"`);
      console.error(`Trimmed: "${trimmed}"`);
      console.error('Stack:', stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    return;
  }

  if (typeof children === 'number') {
    const stack = new Error().stack || '';
    detectedIssues.push({
      component: parentComponent,
      value: children,
      stack
    });
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🚨 NUMBER NODE ERROR DETECTED BY SCANNER');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`Parent: <${parentComponent}>`);
    console.error(`Number Value: ${children}`);
    console.error('Stack:', stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  if (Array.isArray(children)) {
    children.forEach(child => scanChildren(child, parentComponent));
    return;
  }

  if (React.isValidElement(children)) {
    const elementType = typeof children.type === 'string' 
      ? children.type 
      : (children.type as any)?.displayName || (children.type as any)?.name || 'Unknown';
    
    if (children.props && (children.props as any).children) {
      scanChildren((children.props as any).children, elementType);
    }
  }
}

export function getDetectedIssues() {
  return detectedIssues;
}

export function clearDetectedIssues() {
  detectedIssues.length = 0;
}

export function getIssuesReport() {
  if (detectedIssues.length === 0) {
    return 'No text node issues detected';
  }

  return `Found ${detectedIssues.length} text node issue(s):\n\n` +
    detectedIssues.map((issue, i) => 
      `${i + 1}. <${issue.component}> contains: "${issue.value}"`
    ).join('\n');
}
