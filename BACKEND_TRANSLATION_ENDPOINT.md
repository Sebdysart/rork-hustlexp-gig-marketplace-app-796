# Backend Translation Endpoint Fix

## Issue
The frontend is receiving this error when calling `/api/translate`:
```json
{
  "error": "Validation error",
  "details": [{"field": "text", "message": "Required"}]
}
```

## Current Frontend Request
The frontend is making this request (from `utils/hustleAI.ts` line 561):
```typescript
POST /api/translate
Content-Type: application/json

{
  "text": ["Tasks", "Profile", "Settings"],  // Array of strings
  "targetLanguage": "es",                     // Target language code
  "sourceLanguage": "en",                     // Source language (optional)
  "context": "mobile app UI"                  // Context (optional)
}
```

## Backend Verification Needed

Please verify the following in your backend:

### 1. Route Registration
Check that the `/api/translate` endpoint is properly registered in `server/routes.ts`:
```typescript
app.post('/api/translate', async (req, res) => {
  // Translation logic here
});
```

### 2. Request Body Validation
Check the validation schema for the translate endpoint. It should:
- Accept `text` as an **array of strings** (not a single string)
- Make `text` a **required** field
- Accept `targetLanguage` as a **required** string
- Accept `sourceLanguage` as an **optional** string (default: 'en')
- Accept `context` as an **optional** string

Example validation:
```typescript
const { text, targetLanguage, sourceLanguage = 'en', context } = req.body;

if (!text || !Array.isArray(text) || text.length === 0) {
  return res.status(400).json({
    error: 'Validation error',
    details: [{ field: 'text', message: 'Must be a non-empty array of strings' }]
  });
}

if (!targetLanguage) {
  return res.status(400).json({
    error: 'Validation error',
    details: [{ field: 'targetLanguage', message: 'Required' }]
  });
}
```

### 3. Test the Endpoint

Run this test to verify it works:
```bash
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": ["Tasks", "Profile", "Settings"],
    "targetLanguage": "es"
  }'
```

Expected response:
```json
{
  "translations": ["Tareas", "Perfil", "Configuración"]
}
```

### 4. Common Issues to Check

1. **CORS**: Ensure CORS is enabled for your frontend domain
2. **Body Parser**: Ensure `express.json()` middleware is configured
3. **Route Prefix**: Confirm the route is `/api/translate` not just `/translate`
4. **Content-Type**: Ensure the endpoint accepts `application/json`

### 5. Logging for Debugging

Add this logging to your endpoint:
```typescript
app.post('/api/translate', async (req, res) => {
  console.log('[TRANSLATE] Request body:', JSON.stringify(req.body));
  console.log('[TRANSLATE] Headers:', req.headers['content-type']);
  
  // ... rest of the code
});
```

## Expected Backend Response

The endpoint should return:
```typescript
{
  "translations": string[]  // Array of translated strings, same length as input
}
```

## Test Cases to Verify

1. **Basic translation**:
   - Input: `["Tasks", "Profile"]` → Output: `["Tareas", "Perfil"]` (Spanish)

2. **Empty array validation**:
   - Input: `[]` → Error: `400 Bad Request`

3. **Missing text field**:
   - Input: `{"targetLanguage": "es"}` → Error: `400 Bad Request`

4. **Placeholder preservation**:
   - Input: `["Welcome {name}"]` → Output: `["Bienvenido {name}"]`

5. **Brand name protection**:
   - Input: `["HustleXP is great"]` → Output: `["HustleXP es genial"]` (HustleXP not translated)

## Quick Fix Summary

If the endpoint doesn't exist or is broken, here's what to implement:

1. Add route handler in `server/routes.ts`
2. Use the translation service from `server/ai/translation.ts`
3. Return proper response format: `{ translations: string[] }`
4. Add error handling with fallback to original text
5. Enable caching in the database (translation_cache table)

---

After fixing, run the comprehensive test suite:
```bash
chmod +x test_translation.sh
./test_translation.sh
```

This should show 20/20 tests passing.
