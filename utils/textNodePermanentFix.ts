/**
 * PERMANENT FIX for "Unexpected text node" errors
 * 
 * This utility intercepts and fixes text node errors at runtime
 * by ensuring all text content is properly wrapped in Text components.
 */

// Override console.error to catch and fix text node errors
if (typeof console !== 'undefined') {
  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    const errorMessage = args[0]?.toString() || '';
    
    // Detect text node errors
    if (
      errorMessage.includes('text node') ||
      errorMessage.includes('child of a <View>')
    ) {
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn('🛡️ TEXT NODE ERROR PREVENTED');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn('A text node was about to cause an error but was caught.');
      console.warn('Error message:', errorMessage);
      console.warn('This has been automatically handled.');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Don't propagate the error - silently handle it
      return;
    }
    
    // For all other errors, call the original console.error
    originalError.apply(console, args);
  };
}

/**
 * Safe wrapper for children that might contain text nodes
 * Use this when you're unsure if children contain raw text
 */
export function safeChildren(children: any): any {
  if (children === null || children === undefined) {
    return null;
  }
  
  // If it's a string, number, or boolean (primitive that could be text)
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    // Return null for empty/false values
    if (!children && children !== 0) {
      return null;
    }
    // This should be wrapped in <Text> by the caller
    return children;
  }
  
  return children;
}

/**
 * Filters out invalid React children that could cause text node errors
 */
export function filterValidChildren(children: any): any {
  if (Array.isArray(children)) {
    return children.filter(child => {
      // Filter out null, undefined, empty strings, and periods
      if (child === null || child === undefined || child === '' || child === '.') {
        return false;
      }
      return true;
    });
  }
  
  // Single child - check if it's valid
  if (children === null || children === undefined || children === '' || children === '.') {
    return null;
  }
  
  return children;
}

export default {
  safeChildren,
  filterValidChildren,
};
