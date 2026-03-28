# Text Node Error Fix Guide

## The Problem

You're getting the error: **"Unexpected text node: . A text node cannot be a child of a <View>."**

This is a common React Native error that occurs when you try to render plain text (strings or numbers) directly inside a `<View>` component without wrapping it in a `<Text>` component.

## Why This Happens

In React Native (unlike React for web), **ALL** text content MUST be wrapped in a `<Text>` component. You cannot put plain text, strings, numbers, or template literals directly inside Views, Touchables, or any other non-Text components.

## Common Causes

### 1. Plain Text in View
```tsx
// ❌ WRONG
<View>Hello World</View>

// ✅ CORRECT
<View>
  <Text>Hello World</Text>
</View>
```

### 2. Variables Containing Strings/Numbers
```tsx
const userName = "John";

// ❌ WRONG
<View>{userName}</View>

// ✅ CORRECT
<View>
  <Text>{userName}</Text>
</View>
```

### 3. Conditional Rendering Returning Text
```tsx
// ❌ WRONG
<View>
  {isLoading && "Loading..."}
</View>

// ✅ CORRECT
<View>
  {isLoading && <Text>Loading...</Text>}
</View>
```

### 4. Template Literals
```tsx
const score = 100;

// ❌ WRONG
<View>{`Score: ${score}`}</View>

// ✅ CORRECT
<View>
  <Text>{`Score: ${score}`}</Text>
</View>
```

### 5. Numbers
```tsx
const count = 5;

// ❌ WRONG
<View>{count}</View>

// ✅ CORRECT
<View>
  <Text>{count}</Text>
</View>
```

### 6. Whitespace Between Tags
```tsx
// ❌ WRONG - The newline is considered a text node!
<View>
  
</View>

// ✅ CORRECT
<View></View>
```

## How to Find the Error

Since the error message doesn't always tell you the exact location, I've added enhanced error logging to your app:

1. **Check the console** - The new error logger will output detailed information including:
   - The exact error message
   - A stack trace showing where the error occurred
   - Timestamp of when it happened

2. **Use the Text Error Scanner** - Navigate to `/text-error-scanner` in your app to run a diagnostic scan

3. **Check Error Logs** - Look in the console for messages like:
   ```
   🔍 Text node error detected!
   Error message: ...
   Stack trace: ...
   ```

## Quick Fixes

### For Dynamic Content
If you have variables that might contain text:
```tsx
// Before
<View>{someVariable}</View>

// After  
<View>
  <Text>{someVariable}</Text>
</View>
```

### For Conditional Text
```tsx
// Before
<View>{condition && "Some text"}</View>

// After
<View>{condition && <Text>Some text</Text>}</View>
```

### For Lists/Arrays
```tsx
// Before
<View>
  {items.map(item => item.name)}
</View>

// After
<View>
  {items.map(item => <Text key={item.id}>{item.name}</Text>)}
</View>
```

## Prevention Tips

1. **Always use Text** - When in doubt, wrap it in `<Text>`
2. **Check translations** - Translation strings must be wrapped in Text
3. **Review conditionals** - Any conditional that might return a string needs Text
4. **Watch for whitespace** - Remove newlines between View tags if they're empty
5. **Test thoroughly** - Navigate through all screens after making changes

## Tools Added to Help You

1. **Enhanced Error Logging** (`utils/textNodeDetectorRuntime.ts`)
   - Automatically logs text node errors with detailed stack traces
   - Active in development mode only

2. **Error Guidelines** (`utils/findTextNodeErrors.ts`)
   - Reference guide for common patterns
   - Examples of correct vs incorrect usage

3. **Color Fixes** (`constants/designTokens.ts`)
   - Added missing colors: `white`, `lightGray`, `electricBlue`, `hotPink`
   - This fixes the TypeScript errors in `text-error-scanner.tsx`

## What to Do Next

1. **Run your app** - The enhanced error logging is now active
2. **Navigate to the screen** where the error occurs
3. **Check the console** for detailed error information
4. **Find the exact line** in the stack trace
5. **Wrap the text** in a `<Text>` component
6. **Test again** to make sure the error is gone

## Example Stack Trace

When the error occurs, you'll see something like:
```
🔍 Text node error detected!
Error message: A text node cannot be a child of a <View>
Stack trace:
    at Component (app/(tabs)/home.tsx:225:12)
    at View (View.tsx:34:5)
    ...
```

This tells you the error is in `app/(tabs)/home.tsx` at line 225.

## Still Having Issues?

If the error persists:

1. **Check all your recent changes** - The error might be in code you just added
2. **Look for dynamic content** - Especially translation strings or user data
3. **Search for template literals** - Look for `{`...`}` patterns
4. **Review conditional rendering** - Check all `&&` and ternary operators
5. **Use the diagnostic tools** - Navigate to `/diagnostic-center` in the app

## Remember

In React Native:
- ✅ `<Text>Hello</Text>` 
- ❌ `<View>Hello</View>`

**Every piece of text needs a Text wrapper!**
