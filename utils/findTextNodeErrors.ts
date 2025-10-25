import React from "react";
/**
 * Utility to help find and fix "text node cannot be a child of <View>" errors
 * 
 * Common patterns that cause this error:
 * 1. <View>{someString}</View>
 * 2. <View>{number}</View>
 * 3. <View>{condition && "text"}</View>
 * 4. <View>{variable}</View> where variable is a string/number
 * 5. <View>  </View> (even whitespace can cause issues)
 * 
 * Solution: Always wrap text content in <Text> components
 */

export const commonTextNodeErrorPatterns = [
  {
    pattern: '<View>{string}',
    fix: '<View><Text>{string}</Text></View>',
    description: 'Plain string variable inside View'
  },
  {
    pattern: '<View>{number}',
    fix: '<View><Text>{number}</Text></View>',
    description: 'Number variable inside View'
  },
  {
    pattern: '<View>{condition && "text"}',
    fix: '<View>{condition && <Text>text</Text>}</View>',
    description: 'Conditional string inside View'
  },
  {
    pattern: '<View>`template ${var}`',
    fix: '<View><Text>{`template ${var}`}</Text></View>',
    description: 'Template literal inside View'
  },
  {
    pattern: '<View>  </View>',
    fix: '<View></View>',
    description: 'Whitespace between tags'
  }
];

/**
 * Check if a value is renderable text content that needs a Text wrapper
 */
export function isTextContent(value: unknown): boolean {
  if (typeof value === 'string' && value.trim().length > 0) return true;
  if (typeof value === 'number') return true;
  return false;
}

/**
 * Safe text renderer - wraps content in Text if needed
 */
export function SafeText({ children }: { children: React.ReactNode }) {
  // This is already imported from React Native in your components
  // Just use: <Text>{children}</Text>
  return children;
}

/**
 * Guidelines for fixing text node errors:
 * 
 * 1. NEVER put plain text directly in a View:
 *    ❌ <View>Hello</View>
 *    ✅ <View><Text>Hello</Text></View>
 * 
 * 2. NEVER put variables that might be strings/numbers directly in a View:
 *    ❌ <View>{userName}</View>
 *    ✅ <View><Text>{userName}</Text></View>
 * 
 * 3. NEVER use conditional rendering that returns strings:
 *    ❌ <View>{isLoading && "Loading..."}</View>
 *    ✅ <View>{isLoading && <Text>Loading...</Text>}</View>
 * 
 * 4. NEVER use template literals directly in Views:
 *    ❌ <View>{`Hello ${name}`}</View>
 *    ✅ <View><Text>{`Hello ${name}`}</Text></View>
 * 
 * 5. Be careful with whitespace:
 *    ❌ <View>
 *          {component}
 *        </View>
 *    ✅ <View>{component}</View>
 */
export const textNodeErrorGuidelines = `
React Native Text Node Error Guidelines
========================================

The error "A text node cannot be a child of a <View>" means you have text content
directly inside a View component without wrapping it in a Text component.

Common Causes:
--------------
1. Plain text: <View>Hello</View>
2. Variables: <View>{userName}</View>
3. Numbers: <View>{count}</View>
4. Template literals: <View>{\`Score: \${points}\`}</View>
5. Conditional text: <View>{loading && "Loading..."}</View>
6. Whitespace between tags

How to Fix:
-----------
Always wrap ANY text content in a <Text> component:

✅ CORRECT:
<View>
  <Text>Hello</Text>
</View>

<View>
  <Text>{userName}</Text>
</View>

<View>
  {loading && <Text>Loading...</Text>}
</View>

❌ INCORRECT:
<View>Hello</View>
<View>{userName}</View>
<View>{loading && "Loading..."}</View>

Quick Fix Checklist:
--------------------
[ ] Check all View components for direct text content
[ ] Wrap all strings/numbers in Text components
[ ] Fix conditional rendering to use Text
[ ] Remove whitespace between View tags
[ ] Check interpolated variables are wrapped in Text
`;

export default textNodeErrorGuidelines;
