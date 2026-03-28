# Backend Translation Rate Limit Fix

## Issue
The translation endpoint is rate limiting too aggressively, causing errors after just a few translation requests (429 errors with "Rate limit exceeded. Please try again in 45 seconds").

## Required Backend Changes

### 1. Increase Translation Rate Limit

**File**: `server/middleware/rateLimit.ts` (or wherever rate limiting is configured)

**Current behavior**: ~5 requests/minute
**Required behavior**: At least 60 requests/minute per user

```typescript
// Update the translation endpoint rate limit
export const translationRateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute (previously 5-10)
  message: 'Too many translation requests. Please try again in a moment.',
  keyGenerator: (req: Request) => {
    // Rate limit per user/IP
    return req.body?.userId || req.ip;
  },
  skip: (req: Request) => {
    // Don't rate limit small batch requests (<= 10 texts)
    return req.body?.text?.length <= 10;
  }
};
```

### 2. Add Batch-Friendly Rate Limiting

Instead of counting each API call, count the number of texts being translated:

```typescript
export const translationRateLimitByTexts = {
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 texts per minute total
  keyGenerator: (req: Request) => req.body?.userId || req.ip,
  handler: (req: Request, res: Response) => {
    const textsCount = req.body?.text?.length || 1;
    const retryAfter = 30; // seconds
    res.status(429).json({
      error: 'Translation rate limit exceeded',
      message: `Too many texts translated. You can translate up to 200 texts per minute.`,
      retryAfter,
      textsTranslated: textsCount,
      limit: 200
    });
  },
  // Count by number of texts, not requests
  cost: (req: Request) => req.body?.text?.length || 1
};
```

### 3. Apply Rate Limit to Translation Endpoint

**File**: `server/routes.ts`

```typescript
// Before (too restrictive):
router.post('/translate', rateLimiter, translateHandler);

// After (more permissive):
router.post('/translate', translationRateLimitByTexts, translateHandler);
```

### 4. Add Rate Limit Headers

Add headers to help clients understand rate limits:

```typescript
export function addRateLimitHeaders(res: Response, limit: number, remaining: number, resetTime: number) {
  res.set({
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetTime),
  });
}
```

## Why This Fix Is Needed

1. **Batch Translations**: When user changes language, the app translates all visible task cards at once (10-20 texts)
2. **Real-time Chat**: Chat translation happens continuously as messages arrive
3. **User Experience**: Current limit blocks users after viewing just 2-3 tasks
4. **Cost**: With caching, 90% of requests are free (cached), so higher limits are safe

## Expected Behavior After Fix

- ✅ Users can translate 60+ tasks per minute
- ✅ Chat messages translate in real-time without blocking
- ✅ Rate limit only triggers for abuse (200+ texts/minute)
- ✅ Cached translations don't count against rate limit
- ✅ Small batches (<10 texts) bypass rate limit entirely

## Testing

After implementing these changes, test with:

```bash
# Test rapid translation requests (should succeed)
for i in {1..20}; do
  curl -X POST http://localhost:5000/api/translate \
    -H "Content-Type: application/json" \
    -d "{\"text\": [\"Test $i\"], \"targetLanguage\": \"es\"}"
  echo ""
done

# Test batch translation (should succeed)
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5",
             "Task 6", "Task 7", "Task 8", "Task 9", "Task 10"],
    "targetLanguage": "es"
  }'
```

## Priority: HIGH

This is blocking core app functionality. Users cannot switch languages without immediate rate limiting.
