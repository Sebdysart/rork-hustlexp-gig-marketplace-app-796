# Backend Connection Fix - Complete Guide

## Summary of Issues

Your app has **two AI systems** running:
1. **Basic Rork AI** (toolkit SDK) - Currently active
2. **Your comprehensive backend AI** (LunchGarden.dycejr.replit.dev) - Not connected

## What Was Fixed

### 1. API Endpoints Updated (`services/backend/ai.ts`)
Changed all endpoints to match your backend:

```typescript
// BEFORE (wrong)
api.post('/ai/chat', ...)

// AFTER (correct)
api.post('/agent/chat', ...)
```

### 2. Endpoint Mappings
- `/ai/chat` → `/agent/chat` ✅
- `/ai/task-parse` → `/agent/chat` ✅
- `/ai/match-task` → `/dashboard/unified/:userId` ✅
- `/ai/analyze-patterns` → `/dashboard/progress/:userId` ✅
- `/ai/recommendations` → `/dashboard/action-suggestions/:userId` ✅
- `/ai/feedback` → `/agent/chat` ✅
- Added: `/ai/tier-info/:userId` ✅

## What Still Needs To Be Done

### 1. Replace Rork AI Chat with Backend AI

**File:** `app/chat/hustleai.tsx`

Currently uses:
```typescript
const { messages, sendMessage } = useRorkAgent({ tools: {} });
```

Should use:
```typescript
const { sendMessage } = useUnifiedAI();
```

### 2. Add Backend Authentication

Your backend requires session cookies. The API client already has `credentials: 'include'` but users need to be logged in.

**Check if login is working:**
- Does the app call your backend's login endpoint?
- Are session cookies being stored?

### 3. Test Backend Connection

Run this test:
```bash
# From your backend
curl -X POST https://LunchGarden.dycejr.replit.dev/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"Hello"}'
```

Expected: Should get a GPT-4 response

### 4. Update Availability Toggle Text

The text is hardcoded. Should fetch from tier system:

**Current (hardcoded):**
```typescript
<Text>{isAvailable ? "You're visible to nearby posters" : 'Get instant gig offers'}</Text>
```

**Should be (tier-aware):**
```typescript
const { tierInfo } = useUnifiedAI();
<Text>{isAvailable ? tierInfo.availabilityDescription : 'Get instant gig offers'}</Text>
```

## Backend Requirements

Your backend must support these endpoints:

### Required Endpoints
1. `POST /api/auth/login` - Session-based auth
2. `POST /api/agent/chat` - Main AI chat
3. `GET /api/ai/tier-info/:userId` - Tier system
4. `GET /api/dashboard/unified/:userId` - Dashboard data
5. `GET /api/dashboard/action-suggestions/:userId` - AI suggestions
6. `GET /api/dashboard/progress/:userId` - Progress analytics

### Test Accounts
According to your docs, these should exist:
- `sebastian_hustler` / `password123` (Level 12, Tier 2)
- `emily_poster` / `password123` (Level 5, Tier 1)
- `mike_tradesman` / `password123` (Level 25, Tier 3)

## Next Steps

1. ✅ **Fixed:** API endpoints now point to correct backend paths
2. 🔄 **TODO:** Replace Rork AI chat with your backend AI
3. 🔄 **TODO:** Verify backend authentication is working
4. 🔄 **TODO:** Test with real backend (is it running?)
5. 🔄 **TODO:** Make availability toggle tier-aware

## Testing Checklist

- [ ] Backend is running at `https://LunchGarden.dycejr.replit.dev`
- [ ] Can login with test account
- [ ] `/api/agent/chat` responds with GPT-4
- [ ] `/api/ai/tier-info/:userId` returns tier data
- [ ] Frontend shows tier-specific text
- [ ] Availability toggle shows tier-appropriate description
- [ ] Chat uses your backend AI (not Rork SDK)

## The Key Issue

**You're paying for a comprehensive backend AI but the app is using the free Rork AI toolkit.**

The fix is simple:
1. ✅ API endpoints fixed (just did this)
2. Replace `useRorkAgent` with `useUnifiedAI` in chat
3. Verify backend is running
4. Test!

Your backend is production-ready with GPT-4o, tier system, and smart matching. The frontend just needs to call it instead of the basic Rork AI.
