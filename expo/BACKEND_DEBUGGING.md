# Backend Connection Debugging

## Issue
AI Coach showing "The AI backend is currently unavailable" even though backend is running.

## Root Cause
The app is making requests to the correct endpoint now (`/api/agent/chat`), but the health check at `/api/health` is failing, causing the app to think the backend is offline.

## URLs Being Used
```
EXPO_PUBLIC_API_URL=https://LunchGarden.dycejr.replit.dev
```

## Endpoints Being Called
1. Health Check: `https://LunchGarden.dycejr.replit.dev/api/health`
2. AI Chat: `https://LunchGarden.dycejr.replit.dev/api/agent/chat`

## What Was Fixed
1. ✅ Removed duplicate `/api` from hustleAI base URL (line 6)
2. ✅ Added `/api` prefix to `/agent/chat` endpoint (line 349)
3. ✅ Added `/api` prefix to `/health` endpoint (line 529)

## Testing Steps
1. Open the app
2. Click the purple sparkle AI Coach button
3. Type "hello" or "easy tasks near me?"
4. Check console logs for:
   - `[HUSTLEAI] Client initialized with base URL: https://LunchGarden.dycejr.replit.dev`
   - `[HUSTLEAI] POST https://LunchGarden.dycejr.replit.dev/api/agent/chat`
   - `[HUSTLEAI] Response received`

## Expected Behavior
✅ Green dot = Backend online
✅ Real AI responses from GPT-4o
✅ No "backend unavailable" message

## If Still Not Working
Check these URLs in a browser:
1. https://LunchGarden.dycejr.replit.dev/api/health
   - Should return: `{"status":"ok","version":"1.0.0"}`
2. https://LunchGarden.dycejr.replit.dev
   - Should show backend is running

## Console Commands to Test
```bash
# Test health endpoint
curl https://LunchGarden.dycejr.replit.dev/api/health

# Test chat endpoint
curl -X POST https://LunchGarden.dycejr.replit.dev/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"hello"}'
```

## Next Steps
1. Clear the app cache (close and reopen)
2. Check the console logs for connection attempts
3. Verify the Replit backend is actually running
4. Check if there are any CORS errors in the console
