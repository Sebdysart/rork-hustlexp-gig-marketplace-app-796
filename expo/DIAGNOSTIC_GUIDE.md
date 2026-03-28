# React Native "Unexpected Text Node" Error - Diagnostic Guide

## Root Cause
This error occurs when text content (including `.`, `,`, whitespace, or strings) appears as a direct child of a `<View>` without being wrapped in a `<Text>` component.

## Common Causes

### 1. **Stray Punctuation After JSX**
```tsx
// ❌ WRONG - Period creates text node
{condition && <Component />}.

// ✅ CORRECT
{condition && <Component />}
```

### 2. **Conditional Rendering Returning Undefined**
```tsx
// ❌ WRONG - Can return undefined which becomes empty text node
{data?.map(item => <Component key={item.id} />)}

// ✅ CORRECT
{data && data.map(item => <Component key={item.id} />)}
{(data || []).map(item => <Component key={item.id} />)}
```

### 3. **Ternary with Improper Fallback**
```tsx
// ❌ WRONG - Empty string creates text node
{condition ? <Component /> : ''}

// ✅ CORRECT
{condition ? <Component /> : null}
{condition && <Component />}
```

### 4. **Template Literals with Whitespace**
```tsx
// ❌ WRONG - Whitespace creates text node
<View>
  {`
    ${someValue}
  `}
</View>

// ✅ CORRECT
<View>
  <Text>{someValue}</Text>
</View>
```

### 5. **Accidental String Return**
```tsx
// ❌ WRONG - Function returns string instead of JSX
{items.map(item => item.name)}

// ✅ CORRECT
{items.map(item => <Text key={item.id}>{item.name}</Text>)}
```

## How to Find the Error

### Method 1: Check Browser Console (Web)
1. Open browser DevTools (F12)
2. Look for the full error stack trace
3. Find the component name in the stack

### Method 2: Check Terminal/Metro Bundler
1. Look at terminal where Metro is running
2. Find the component stack trace
3. Identify the file and line number

### Method 3: Binary Search
1. Comment out half of your JSX
2. If error persists, it's in the other half
3. Repeat until you find the problematic line

### Method 4: Add Defensive Checks
Add null checks around suspicious code:

```tsx
// Wrap conditional renders
{data && data.length > 0 && (
  <View>
    {data.map(item => <Component key={item.id} />)}
  </View>
)}

// Instead of optional chaining that might return undefined
{translations[0] || 'Default Text'}
```

## Quick Fixes to Try

### Fix 1: Check Translation Arrays
```tsx
// ❌ Might cause issue if translation is undefined
<Text>{translations[999]}</Text>

// ✅ Safe
<Text>{translations[999] || 'Fallback'}</Text>
```

### Fix 2: Check Map Functions
```tsx
// ❌ Might create text nodes
{items.map(item => (
  <>
    <Component />
  </>
))}

// ✅ Safer
{(items || []).map(item => (
  <Component key={item.id} />
))}
```

### Fix 3: Check Conditional Rendering
```tsx
// ❌ Can create issues
{showComponent && <Component />}
{condition ? <A /> : <B />}

// ✅ Explicit null handling
{showComponent === true && <Component />}
{condition ? <A /> : null}
```

## Prevention Strategies

### 1. Enable ESLint Rules
```json
{
  "react/jsx-no-undef": "error",
  "react/jsx-uses-react": "error",
  "react/jsx-uses-vars": "error"
}
```

### 2. TypeScript Strict Mode
Helps catch potential undefined returns

### 3. Code Review Checklist
- [ ] All conditionals end with explicit `null` or JSX
- [ ] No stray punctuation after closing braces `}`
- [ ] All text wrapped in `<Text>` components
- [ ] Array maps have proper key props
- [ ] No empty strings `''` in JSX

## Emergency Fix
If you can't find the issue, try this nuclear option:

```tsx
// Wrap everything in error boundaries
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Still Can't Find It?

1. **Clear cache**: `npx expo start -c`
2. **Reinstall**: Delete `node_modules` and reinstall
3. **Check recent changes**: Git diff your recent changes
4. **Revert**: Go back to last working commit
