# 🚨 Translation Issue - Complete Diagnosis

## Problem
Onboarding screen and other screens remain in English when user selects Spanish (or any other language).

## System Architecture

```
User clicks language → LanguageContext → aiTranslationService → hustleAI → Backend API
                                                                                    ↓
User sees English ← Component doesn't re-render ← Cache doesn't update ← Response wrong?
```

## Backend Connection Details

**Backend URL**: `https://lunch-garden-dycejr.replit.app/api`
**Translation Endpoint**: `POST /api/translate`

### Request Format
```json
{
  "text": ["HustleXP", "Your Journey to Legendary Status..."],
  "targetLanguage": "es",
  "sourceLanguage": "en",
  "context": "mobile app UI"
}
```

### Expected Response Format
```json
{
  "translations": ["HustleXP", "Tu viaje hacia el estatus..."]
}
```

## Current Flow (Step-by-Step)

### ✅ What's Working

1. **Language Selector Opens** (`components/LanguageSelectorModal.tsx`)
   - User clicks globe icon
   - Modal shows 12 languages

2. **Language Selection** (`contexts/LanguageContext.tsx:229`)
   ```typescript
   const changeLanguage = async (lang: LanguageCode) => {
     setIsLoading(true);
     setCurrentLanguage(lang);  // ✅ State updates
     i18n.locale = lang;
     await AsyncStorage.setItem(STORAGE_KEY, lang);  // ✅ Persisted
     setAITranslationCache({});  // ✅ Cache cleared
     await preloadAllAppTranslations(lang);  // ✅ Preload starts
   }
   ```

3. **Batch Translation Requests** (`contexts/LanguageContext.tsx:112-171`)
   - Splits ~200 texts into batches of 50
   - Sends 4 requests to backend (50 texts each)
   - Waits 500ms between batches

4. **API Call** (`utils/hustleAI.ts:553-604`)
   - Calls `POST https://lunch-garden-dycejr.replit.app/api/translate`
   - Has retry logic (3 attempts)
   - Has exponential backoff
   - Returns `{ translations: string[] }`

5. **Cache Storage** (`utils/aiTranslation.ts:88-129`)
   - Stores translations as: `"es:HustleXP" → "HustleXP (translated)"`
   - Saves to AsyncStorage
   - Updates `aiTranslationCache` state in LanguageContext

### ❌ What's NOT Working

6. **Component Re-render** (`app/onboarding.tsx:210` + `hooks/useTranslatedText.ts:44-79`)
   
   The `onboarding.tsx` screen uses this:
   ```typescript
   const translations = useTranslatedTexts(translationKeys);
   ```

   The hook checks cache:
   ```typescript
   const translated = texts.map(text => {
     const key = `${currentLanguage}:${text}`;
     return aiTranslationCache[key] || text;  // Returns English if not cached
   });
   ```

   **The Problem**: 
   - When cache updates, `useEffect` in `useTranslatedTexts` should trigger
   - But the dependency `aiTranslationCache` is an object reference
   - React doesn't deep-compare objects, only checks reference equality
   - So the component doesn't know to re-render

## Root Cause

The `useEffect` in `hooks/useTranslatedText.ts` line 50-76 has `aiTranslationCache` as a dependency:

```typescript
useEffect(() => {
  // ... translation logic
}, [texts, currentLanguage, useAITranslation, aiTranslationCache, translatedTexts]);
```

When `LanguageContext` updates cache via:
```typescript
setAITranslationCache(prev => ({ ...prev, ...newCache }));
```

This creates a NEW object reference, which SHOULD trigger the `useEffect`. 

**BUT**: The `useEffect` also has `translatedTexts` as a dependency (line 76), creating a dependency cycle:
1. Cache updates → `useEffect` runs
2. `useEffect` calls `setTranslatedTexts(translated)`
3. `translatedTexts` state changes → `useEffect` runs again
4. But `translated` is same values → doesn't update → **infinite loop prevention kicks in**

## The Fix (Choose One)

### Option A: Force Re-render in Hook (Safest)

Edit `hooks/useTranslatedText.ts` line 50:

```typescript
useEffect(() => {
  if (!useAITranslation || currentLanguage === 'en') {
    if (JSON.stringify(translatedTexts) !== JSON.stringify(texts)) {
      setTranslatedTexts(texts);
    }
    return;
  }

  const textsKey = JSON.stringify(texts);
  const hasChanged = prevTextsRef.current !== textsKey || prevLangRef.current !== currentLanguage;
  
  // CHANGE THIS: Always check cache, even if not "changed"
  // This ensures updates when cache fills in
  prevTextsRef.current = textsKey;
  prevLangRef.current = currentLanguage;

  const translated = texts.map(text => {
    const key = `${currentLanguage}:${text}`;
    return aiTranslationCache[key] || text;
  });

  // ALWAYS update if different
  if (JSON.stringify(translatedTexts) !== JSON.stringify(translated)) {
    setTranslatedTexts(translated);
  }
}, [texts, currentLanguage, useAITranslation, aiTranslationCache]); // Remove translatedTexts!
```

### Option B: Use Cache Size as Trigger

Add this to `contexts/LanguageContext.tsx`:

```typescript
const [cacheVersion, setCacheVersion] = useState(0);

// In preloadAllAppTranslations, after each batch:
setAITranslationCache(prev => ({ ...prev, ...newCache }));
setCacheVersion(v => v + 1); // Increment version
```

Then in `useTranslatedTexts`:
```typescript
useEffect(() => {
  // ... same logic
}, [texts, currentLanguage, cacheVersion]); // Use version instead of cache object
```

### Option C: Context Re-architecture (Most Complex)

Create a separate `TranslationContext` that provides a `useTranslation()` hook returning the latest translations directly, bypassing the hook's state management.

## Testing the Fix

### Step 1: Add Debug Logging

Add to `hooks/useTranslatedText.ts` line 70:

```typescript
const translated = texts.map(text => {
  const key = `${currentLanguage}:${text}`;
  const result = aiTranslationCache[key] || text;
  
  // DEBUG LOG
  if (texts[0] === 'HustleXP') {
    console.log('[useTranslatedTexts] HustleXP translation:', {
      key,
      cached: !!aiTranslationCache[key],
      result: result.slice(0, 20),
    });
  }
  
  return result;
});
```

### Step 2: Navigate to Debug Screen

Open the app and navigate to:
```
/translation-debug
```

This shows you:
- Current language
- Cache status
- Sample translations
- Whether keys exist in cache

### Step 3: Change Language

1. Click globe icon
2. Select "Español 🇪🇸"
3. Wait for loading to finish (progress bar at top)
4. Check debug screen again

**Expected After Fix**:
- Cache for es: >150 entries
- Sample cache keys all show ✅
- Onboarding screen shows Spanish text

## Quick Backend Test

To verify backend is working, test the endpoint directly:

```bash
curl -X POST https://lunch-garden-dycejr.replit.app/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": ["HustleXP", "Level Up Your Hustle"],
    "targetLanguage": "es",
    "sourceLanguage": "en"
  }'
```

Expected response:
```json
{
  "translations": ["HustleXP", "Mejora tu Trabajo"]
}
```

If this fails, backend is the issue.
If this succeeds, frontend caching/re-render is the issue.

## Implementation Plan

**I recommend Option A** because it:
- Requires minimal code changes
- Doesn't break existing code
- Fixes the dependency cycle
- Is easy to test

Would you like me to implement Option A now?
