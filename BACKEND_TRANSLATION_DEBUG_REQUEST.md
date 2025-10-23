# 🔴 URGENT: Translation Not Working on Frontend

## Problem Summary
User changes language on mobile app, but the onboarding screen (and other screens) remain in English.

## Current Status
✅ Backend API is working (120 requests/min, tests passing)
✅ Frontend is calling the translation API
✅ Translations are being cached
❌ **THE UI IS NOT UPDATING WITH TRANSLATED TEXT**

## Root Cause Analysis

### What's Happening:
1. User selects Spanish (or any language) in language selector
2. Frontend calls `changeLanguage('es')` 
3. `LanguageContext` clears cache and calls `preloadAllAppTranslations('es')`
4. This sends ~200 strings to backend for translation in batches of 50
5. Backend returns translations
6. **Frontend caches them with keys like `"es:HustleXP"` → `"HustleXP (translated)"`**
7. Components use `useTranslatedTexts()` hook to get translations
8. **Hook checks cache but UI doesn't re-render** ❌

### Why UI Doesn't Update:
The `useTranslatedTexts()` hook in `hooks/useTranslatedText.ts` (line 68-71) maps over texts and checks cache:

```typescript
const translated = texts.map(text => {
  const key = `${currentLanguage}:${text}`;
  return aiTranslationCache[key] || text;  // ⚠️ Returns original if not in cache
});
```

**The problem**: When translations finish loading into cache, React doesn't know the component needs to re-render because:
- The `aiTranslationCache` object reference changes
- But the `useEffect` dependency on `aiTranslationCache` doesn't trigger properly
- The `translatedTexts` state gets stuck with English fallback values

## Diagnosis Steps

### STEP 1: Check Frontend Cache (Mobile App)
I've created a debug screen to check the cache state. Please navigate to:

```
/translation-debug
```

**What to check:**
1. Is "AI Translation" showing as ENABLED?
2. What is "Cache for {language}"? Should be >0 after language change
3. Under "Sample Cache Keys", are there ✅ or ❌?
4. Do the "All Cache Entries" show translations?

### STEP 2: Check Backend Response Format

The backend MUST return this exact format:

```json
POST /api/translate
Body: {
  "text": ["HustleXP", "Your Journey to Legendary Status Starts Here"],
  "targetLanguage": "es",
  "sourceLanguage": "en"
}

Response: {
  "translations": [
    "HustleXP",
    "Tu viaje hacia el estatus legendario comienza aquí"
  ]
}
```

**Critical Requirements:**
- Array order MUST match input order
- Array length MUST match input length
- No extra wrapper objects
- Property name is `translations` (plural)

### STEP 3: Check Backend is Receiving Requests

Add logging to see if backend is receiving translation requests:

```javascript
// Backend API route
console.log('[TRANSLATE] Received request:', {
  textCount: req.body.text.length,
  targetLanguage: req.body.targetLanguage,
  sourceLanguage: req.body.sourceLanguage,
  firstText: req.body.text[0],
});
```

When user changes language to Spanish, you should see:
```
[TRANSLATE] Received request: { textCount: 50, targetLanguage: 'es', sourceLanguage: 'en', firstText: 'HustleXP' }
[TRANSLATE] Received request: { textCount: 50, targetLanguage: 'es', sourceLanguage: 'en', firstText: 'Task Categories' }
...
```

## Expected Behavior Timeline

When user clicks Spanish flag:

| Time | Frontend | Backend |
|------|----------|---------|
| 0ms | Language selector modal opens | - |
| 10ms | User clicks "Español 🇪🇸" | - |
| 15ms | `changeLanguage('es')` called | - |
| 20ms | Cache cleared, `setCurrentLanguage('es')` | - |
| 30ms | UI shows English (fallback) | - |
| 50ms | `preloadAllAppTranslations('es')` starts | - |
| 100ms | Batch 1 (50 texts) sent to backend | Batch 1 received |
| 200ms | - | Backend translates batch 1 |
| 300ms | Batch 1 response received, cached | - |
| 350ms | **UI SHOULD UPDATE WITH SPANISH** ✅ | - |
| 600ms | Batch 2 sent | Batch 2 received |
| 900ms | Batch 2 cached | - |
| 950ms | **UI UPDATES AGAIN** ✅ | - |

**Currently happening**: Steps 1-7 work, but UI never updates (steps 8-9) ❌

## Possible Backend Issues

### Issue 1: Rate Limiting Too Aggressive
If backend returns 429 too quickly, translations never load.

**Check**: Are you seeing 429 errors in backend logs?

**Fix**: Current rate limit is 120 req/min. Each language change sends ~4 batches of 50 texts = 4 requests. Should be fine.

### Issue 2: Translation Response Format Wrong
If response format doesn't match, frontend can't parse it.

**Check**: Log the actual response in backend before sending:
```javascript
console.log('[TRANSLATE] Sending response:', JSON.stringify(response));
```

**Expected**:
```json
{"translations":["HustleXP","Tu viaje...","Mejora tu..."]}
```

**Not this** (wrong property name):
```json
{"translated":["HustleXP","Tu viaje..."]}
```

**Not this** (wrong structure):
```json
{"data":{"translations":["HustleXP","Tu viaje..."]}}
```

### Issue 3: CORS Headers Missing
If API is on different domain, CORS might block.

**Check**: Browser/mobile console for CORS errors

**Fix**: Add headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

## Frontend Code References

The translation flow is handled in these files:

1. **`contexts/LanguageContext.tsx`** (line 112-171)
   - `preloadAllAppTranslations()` - Sends texts to backend
   - Splits texts into batches of 50
   - Calls `aiTranslationService.translate()`

2. **`utils/aiTranslation.ts`** (line 68-129)
   - `translate()` - Makes API call via `hustleAI.translate()`
   - Caches responses with key format: `"${targetLang}:${originalText}"`

3. **`utils/hustleAI.ts`**
   - Should contain the actual `fetch()` call to backend
   - Check this file for the backend URL

4. **`hooks/useTranslatedText.ts`** (line 44-79)
   - `useTranslatedTexts()` - Hook used by onboarding screen
   - Checks cache and returns translated array

## What You Need to Tell Me

After checking backend, please provide:

1. ✅ or ❌ Is backend receiving translation requests?
2. ✅ or ❌ Is backend returning responses in correct format?
3. ✅ or ❌ Are there any errors in backend logs?
4. What does frontend debug screen show? (navigate to `/translation-debug`)
5. Backend API endpoint URL being used
6. Sample backend log output when translation requested

## Quick Test Command

Run this in mobile app console (if you can access it):

```javascript
// Test if backend is reachable
await aiTranslationService.translate(['Hello', 'World'], 'es', 'en');
// Should return: ['Hola', 'Mundo']
```

## Next Steps

1. **Immediate**: Navigate to `/translation-debug` screen and screenshot results
2. **Backend**: Add console logs to see if requests arriving
3. **Backend**: Verify response format matches spec above
4. **Report back**: Share screenshots + logs

The translation system is working at the API level. The issue is either:
- Response format mismatch
- Cache not triggering re-renders (frontend issue)
- Rate limiting blocking requests

We need to see what the debug screen shows to know which one.
