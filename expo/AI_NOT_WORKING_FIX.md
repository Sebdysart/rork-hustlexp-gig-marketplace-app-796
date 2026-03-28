# 🔧 AI NOT WORKING - QUICK FIX GUIDE

## The Problem
Your AI Coach is showing: *"The AI backend is currently unavailable, but I can still help you navigate the app!"*

This means your **Replit backend is NOT connected** to the mobile app.

---

## 🚨 CRITICAL STEP: Run the Diagnostic First!

**Before anything else, navigate to this screen in your app:**

```
/ai-diagnostic
```

This diagnostic tool will tell you:
- ✅ What's working
- ❌ What's broken
- 🔧 Exactly what to fix

---

## 🎯 The Solution (Step by Step)

### Step 1: Check Your Replit Backend

1. Go to your Replit backend project
2. **Make sure the server is running!**
   - You should see logs like:
     ```
     Server running on port 5000
     All 9 AI endpoints ready
     Database seeded
     ```
3. If it's NOT running:
   - Click the green "Run" button in Replit
   - Wait for it to start

### Step 2: Get the Correct Backend URL

1. In Replit, look at the top of your browser
2. Copy the **exact domain**, for example:
   ```
   https://workspace-dycejr.replit.dev
   ```
   ⚠️ **DO NOT include /api at the end!**

### Step 3: Update Your .env File

1. Open `/mobile/.env` in your project
2. Replace ALL the URLs with your Replit domain:
   ```env
   EXPO_PUBLIC_API_URL=https://workspace-dycejr.replit.dev
   EXPO_PUBLIC_BACKEND_URL=https://workspace-dycejr.replit.dev
   EXPO_PUBLIC_HUSTLEAI_URL=https://workspace-dycejr.replit.dev
   EXPO_PUBLIC_WS_URL=wss://workspace-dycejr.replit.dev
   ```

### Step 4: Restart Your Mobile App

**THIS IS CRITICAL!** The app won't pick up new .env values until you restart.

1. Stop the app completely (Ctrl+C or close the terminal)
2. Start it again:
   ```bash
   npm start
   ```
3. Press `r` in the terminal to reload
4. Or on your device, shake to reload

---

## ✅ How to Verify It's Working

### Test 1: Run the AI Diagnostic

Navigate to `/ai-diagnostic` in your app.

**You should see:**
- ✅ All tests showing green checkmarks
- ✅ "AI IS WORKING!" message at the top
- ✅ AI Chat test shows `Using Mock: NO ✅`

**If you still see:**
- ❌ Red X marks
- ⚠️ "BACKEND NOT CONNECTED" warning
- ⚠️ AI Chat test shows `Using Mock: YES ⚠️`

→ Your backend is still not reachable. Go back to Step 1.

### Test 2: Use the AI Coach

1. Open the AI Coach (purple sparkle button)
2. Type: `hello`
3. Wait 8-15 seconds (real AI takes time)

**You should get:**
- A real, personalized response from GPT-4o
- NOT a fallback message about "backend unavailable"

---

## 🔍 Common Issues

### Issue 1: "Failed to fetch" Error

**Cause:** Your Replit backend is not running or the URL is wrong.

**Fix:**
1. Go to Replit and make sure your server is running
2. Check the URL in your .env matches your Replit domain exactly
3. Restart the mobile app

### Issue 2: "Timeout" Error

**Cause:** The backend is too slow or overloaded.

**Fix:**
1. Check your Replit backend logs for errors
2. Make sure your Replit plan has enough resources
3. Try again in a few seconds

### Issue 3: "Mock responses still showing"

**Cause:** The app is using cached environment variables.

**Fix:**
1. Clear the app completely (force close)
2. Restart the mobile app server
3. Use Shift+R for a fresh reload

### Issue 4: Using Physical Device (iPhone/Android)

**Problem:** `localhost` doesn't work on physical devices.

**Fix:**
1. You MUST use your Replit domain (https://workspace-dycejr.replit.dev)
2. Update .env with the Replit domain
3. Restart the app

---

## 🎯 Quick Checklist

Before asking for help, make sure:

- [ ] Replit backend is running (check the logs)
- [ ] .env file has the correct Replit URL
- [ ] Mobile app was restarted after changing .env
- [ ] Ran the `/ai-diagnostic` test and checked results
- [ ] AI Coach is still showing mock responses

---

## 🚀 Expected Behavior When Working

When everything is connected properly:

1. **AI Coach**: 
   - Real GPT-4o responses
   - 8-15 second response time
   - Personalized to your profile

2. **Task Parsing**: 
   - "I need someone to walk my dog" → Creates a proper task automatically

3. **Smart Matching**: 
   - AI suggests best tasks for you based on your skills/location

4. **Proactive Alerts**: 
   - AI notifies you about perfect task matches
   - Streak warnings
   - Level-up opportunities

---

## 📝 Test Account

If you need to test with a clean account:

```
Username: sebastian_hustler
Password: password123
```

---

## 🆘 Still Not Working?

If after following ALL steps above it's still not working:

1. Run `/ai-diagnostic` and take a screenshot
2. Check your Replit backend logs and copy any errors
3. Share:
   - The diagnostic screenshot
   - Your .env file (without sensitive data)
   - Replit backend logs
   - What platform you're testing on (iOS/Android/Web)

---

## 📖 Related Files

- `/app/ai-diagnostic.tsx` - Diagnostic test page
- `/utils/hustleAI.ts` - AI client that connects to backend
- `/contexts/UltimateAICoachContext.tsx` - AI Coach logic
- `/.env` - Environment configuration

---

**Last updated:** 2025-10-30
