# Quick Fix Checklist for Text Node Errors

## Immediate Actions

When you see "A text node cannot be a child of a <View>":

### Step 1: Check Recent Changes
- [ ] Review files you've edited in the last session
- [ ] Look for any new Views or conditional rendering
- [ ] Check if you added any translation strings

### Step 2: Common Problem Areas
Check these locations in order of likelihood:

- [ ] **Conditional rendering** - Any `{condition && "text"}` patterns
- [ ] **Template literals** - Any `{`text ${variable}`}` directly in Views
- [ ] **Translation strings** - Especially if using `t[index]` or similar
- [ ] **Number displays** - Any `{count}`, `{price}`, etc in Views
- [ ] **Empty Views** - Views with just whitespace between tags

### Step 3: Use Built-in Tools

1. **Check Console**
   ```
   Look for: 🔍 Text node error detected!
   This will show the exact file and line number
   ```

2. **Run Error Scanner**
   - Navigate to `/text-error-scanner` in the app
   - Press "Run Scan"
   - Review the results

3. **View Error Logs**
   - Navigate to `/diagnostic-center`
   - Check for recent errors

## Fast Pattern Search

### Search Your Code for These Patterns:

1. **View with curly braces** (might contain text):
   ```tsx
   <View>{
   ```

2. **Conditional text**:
   ```tsx
   && "
   && '
   ```

3. **Template literals in Views**:
   ```tsx
   <View>{`
   ```

4. **Bare variables** (check if they're strings/numbers):
   ```tsx
   <View>{variableName}
   ```

## Quick Fix Templates

### Fix #1: Simple Text
```tsx
// Find this:
<View>Some text</View>

// Replace with:
<View><Text>Some text</Text></View>
```

### Fix #2: Variable
```tsx
// Find this:
<View>{userName}</View>

// Replace with:
<View><Text>{userName}</Text></View>
```

### Fix #3: Conditional
```tsx
// Find this:
<View>{isActive && "Active"}</View>

// Replace with:
<View>{isActive && <Text>Active</Text>}</View>
```

### Fix #4: Template Literal
```tsx
// Find this:
<View>{`${count} items`}</View>

// Replace with:
<View><Text>{`${count} items`}</Text></View>
```

### Fix #5: Number
```tsx
// Find this:
<View>{price}</View>

// Replace with:
<View><Text>{price}</Text></View>
```

## Verification Steps

After fixing:

- [ ] Save all files
- [ ] Restart the development server if needed
- [ ] Navigate to the screen that had the error
- [ ] Verify the error is gone
- [ ] Check console for any new errors
- [ ] Test all affected screens

## Prevention Checklist

For future development:

- [ ] Always import Text when creating new components:
      ```tsx
      import { View, Text } from 'react-native';
      ```

- [ ] Use this pattern for any dynamic content:
      ```tsx
      <View>
        <Text>{dynamicContent}</Text>
      </View>
      ```

- [ ] For conditional rendering, always wrap text:
      ```tsx
      {condition && <Text>Text here</Text>}
      ```

- [ ] Review code before committing:
      - Search for `<View>{` patterns
      - Check all new conditional rendering
      - Verify all translation strings are wrapped

## Still Not Fixed?

If the error persists after following this checklist:

1. **Clear and restart**:
   ```bash
   # Stop the dev server
   # Clear cache
   # Restart
   ```

2. **Check imports**:
   - Make sure Text is imported from 'react-native'
   - Verify you're not accidentally using a web-only component

3. **Use the diagnostic tools**:
   - Navigate to `/error-finder`
   - Run comprehensive scan
   - Review all reported issues

4. **Check the error log file**:
   - The enhanced logging saves errors to memory
   - Use `getTextNodeErrors()` to retrieve them programmatically

## Most Common Mistake

**The #1 cause** of this error is conditional rendering:

```tsx
// This is the MOST COMMON mistake:
<View>
  {loading && "Loading..."}  // ❌ WRONG
</View>

// Always do this instead:
<View>
  {loading && <Text>Loading...</Text>}  // ✅ CORRECT
</View>
```

Remember: **Every string, number, or text content MUST be wrapped in `<Text>`!**

## Resources

- Full guide: `TEXT_NODE_ERROR_FIX_GUIDE.md`
- Code patterns: `utils/findTextNodeErrors.ts`
- Runtime detection: `utils/textNodeDetectorRuntime.ts`
- In-app diagnostics: `/diagnostic-center`
