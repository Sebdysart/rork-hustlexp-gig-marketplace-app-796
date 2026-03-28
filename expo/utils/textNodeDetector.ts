import React from 'react';

const originalCreateElement = React.createElement;

let errorDetected = false;

export function enableTextNodeDetection() {
  if (errorDetected) return;
  
  (React as any).createElement = function(type: any, props: any, ...children: any[]) {
    try {
      const flatChildren = children.flat(Infinity);
      
      const isViewLike = 
        type === 'View' || 
        (typeof type === 'string' && type.toLowerCase().includes('view')) ||
        (typeof type === 'object' && type?.displayName?.includes('View')) ||
        (typeof type === 'function' && type?.name?.includes('View'));

      if (isViewLike) {
        for (let i = 0; i < flatChildren.length; i++) {
          const child = flatChildren[i];
          
          if (typeof child === 'string' && child.trim() !== '') {
            errorDetected = true;
            
            const componentName = 
              (typeof type === 'function' && type.name) ||
              (typeof type === 'object' && type?.displayName) ||
              type?.toString() || 
              'Unknown';
            
            const error = new Error(
              `TEXT NODE DETECTED!\n` +
              `Component: ${componentName}\n` +
              `Text content: "${child}"\n` +
              `Position: child index ${i}\n` +
              `Props: ${JSON.stringify(props, null, 2)}`
            );
            
            console.error('=================================');
            console.error('TEXT NODE ERROR DETECTED!');
            console.error('=================================');
            console.error('Component Type:', componentName);
            console.error('Text Content:', child);
            console.error('Child Index:', i);
            console.error('Props:', props);
            console.error('Stack trace:', error.stack);
            console.error('=================================');
            
            flatChildren[i] = originalCreateElement('Text', { 
              style: { color: 'red', fontWeight: 'bold' } 
            }, `[ERROR: Raw text "${child}" in View]`);
          }
        }
      }
      
      return originalCreateElement(type, props, ...flatChildren);
    } catch (error) {
      console.error('Error in text node detection:', error);
      return originalCreateElement(type, props, ...children);
    }
  };
  
  console.log('✅ Text Node Detection Enabled');
}

export function disableTextNodeDetection() {
  (React as any).createElement = originalCreateElement;
  console.log('❌ Text Node Detection Disabled');
}
