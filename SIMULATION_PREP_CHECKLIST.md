# 🚀 HustleXP Simulation Preparation Checklist

## ✅ COMPLETED

### 1. **Critical Bug Fixes**
- ✅ Fixed `useApp()` undefined error in `app/index.tsx`
- ✅ Changed to `useUser()` hook directly for better context isolation
- ✅ Verified provider chain in `app/_layout.tsx` is correct

### 2. **Context Architecture**
- ✅ Root Layout Provider Chain (Correct Order):
  1. QueryClientProvider (React Query - top level)
  2. GestureHandlerRootView
  3. ThemeProvider
  4. SettingsProvider
  5. NotificationProvider
  6. UserProvider
  7. TasksProvider
  8. EconomyProvider
  9. AppProvider (combines all above)
- ✅ All contexts use `@nkzw/create-context-hook` for type safety

---

## 🔲 TO-DO: Pre-Simulation Setup

### **Phase 1: Environment Configuration** (15 min)

#### A. Create `.env` file
Copy `.env.example` → `.env` and fill in:
```bash
# Already configured (from .env):
EXPO_PUBLIC_ENABLE_AI_FEATURES=true
EXPO_PUBLIC_API_URL=https://workspace-dycejr.replit.dev
EXPO_PUBLIC_BACKEND_URL=https://workspace-dycejr.replit.dev
EXPO_PUBLIC_HUSTLEAI_URL=https://workspace-dycejr.replit.dev
EXPO_PUBLIC_WS_URL=wss://workspace-dycejr.replit.dev

# Add these if available:
FLY_API_KEY=xxx
NEON_DATABASE_URL=postgresql://xxx
UPSTASH_REDIS_REST_URL=https://xxx
UPSTASH_REDIS_REST_TOKEN=xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
FIREBASE_API_KEY=xxx
```

#### B. Verify all services are active
- [ ] Fly.io account created
- [ ] Neon PostgreSQL database created
- [ ] Upstash Redis instance created
- [ ] Cloudflare R2 bucket created
- [ ] Firebase project configured
- [ ] Stripe Connect account setup

---

### **Phase 2: Database Seeding** (10 min)

#### A. Verify seed data is loading
Current seed data generates:
- ✅ 50 users (from `mocks/seedData.ts`)
- ✅ 100 tasks (mixed: open, in_progress, completed)
- ✅ Seattle locations (lat: 47.6062, lng: -122.3321)

#### B. Test seed data loading:
```bash
# Run app and check console logs
bun start

# Should see:
# ✅ "Loading user data..."
# ✅ Users loaded from AsyncStorage or generated
```

#### C. Expand seed data to 200 tasks (optional):
Edit `mocks/seedData.ts` line 167:
```typescript
// Change from:
for (let i = 0; i < 100; i++) {

// To:
for (let i = 0; i < 200; i++) {
```

---

### **Phase 3: UI/UX Polish Pass** (30 min)

#### A. Key Screens to Verify

**Welcome/Index Screen** (`app/index.tsx`)
- ✅ Fixed context hook error
- [ ] Test particle animations load
- [ ] Test "Start Your Journey" button navigation

**Onboarding** (`app/ai-onboarding.tsx`)
- [ ] Verify AI onboarding flow works
- [ ] Test role selection (Poster/Worker/Both)
- [ ] Test Seattle location assignment

**Home Feed** (`app/(tabs)/home.tsx`)
- [ ] Verify task feed loads with seed data
- [ ] Test scroll performance (should be smooth)
- [ ] Check if XP bar displays correctly

**Profile** (`app/(tabs)/profile-max.tsx`)
- [ ] Verify user stats display
- [ ] Test badge showcase
- [ ] Check XP/Level calculations

**Leaderboard** (`app/(tabs)/leaderboard.tsx`)
- [ ] Verify top 100 users sort by XP
- [ ] Check Seattle-only filter (if enabled)

#### B. Universal AI Branding
Add "Powered by HustleXP AI" indicator to:
- [ ] AI Task Composer (`app/ai-task-creator.tsx`)
- [ ] Smart Match Scoring (task detail screens)
- [ ] AI Coach suggestions

---

### **Phase 4: Performance Testing** (20 min)

#### A. Bundle Size Check
```bash
# Build and check size
expo export --platform ios

# Target: < 5 MB
# Current: Unknown - needs measurement
```

#### B. Load Time Test
- [ ] Cold start: < 2s (first launch)
- [ ] Warm start: < 1s (subsequent launches)

#### C. Feed Scroll Performance
- [ ] Open home feed with 100+ tasks
- [ ] Scroll rapidly - should maintain 60fps
- [ ] No lag or jank

#### D. Memory Usage
- [ ] Run app for 5 minutes
- [ ] Navigate between tabs
- [ ] Check for memory leaks (Expo Dev Tools)
- [ ] Target: < 150 MB RAM

---

### **Phase 5: Simulation Flow Test** (30 min)

#### **User Journey Simulation**

**1. New User Flow**
- [ ] Launch app → See welcome screen
- [ ] Tap "Start Your Journey"
- [ ] Complete AI onboarding (name, role, location)
- [ ] Land on home feed with populated tasks

**2. Task Discovery Flow**
- [ ] Browse 100+ tasks in feed
- [ ] Filter by category (cleaning, delivery, etc.)
- [ ] Tap task → See details + match score
- [ ] Apply to task

**3. XP & Gamification Flow**
- [ ] Complete a task (simulate)
- [ ] See XP gain animation + confetti
- [ ] Check profile → verify XP increase
- [ ] Check leaderboard → verify ranking

**4. AI Features Flow**
- [ ] Open AI Task Creator
- [ ] Type: "Need help moving boxes Saturday"
- [ ] Verify AI generates structured task
- [ ] Check auto-pricing suggestion

**5. Multi-Mode Flow**
- [ ] Sign up as "Both" role
- [ ] Switch between Worker → Business modes
- [ ] Verify UI changes (post task vs. browse tasks)

---

### **Phase 6: Stress Test** (15 min)

#### A. High-Load Scenarios
- [ ] Scroll through 200+ tasks rapidly
- [ ] Open 10+ task details consecutively
- [ ] Switch between tabs quickly (10x)
- [ ] Simulate 5 XP gains in a row

#### B. Network Conditions
- [ ] Test on WiFi (normal)
- [ ] Test on slow 3G (if available)
- [ ] Test offline mode (AsyncStorage fallback)

#### C. Device Compatibility
- [ ] iOS (iPhone SE/11/14 Pro)
- [ ] Android (Pixel 3/5/7)
- [ ] Web (Chrome/Safari)

---

### **Phase 7: Final Verification** (10 min)

#### Pre-Launch Checklist
- [ ] No console errors on app load
- [ ] All seed data loads correctly
- [ ] All navigation routes work
- [ ] XP system calculates correctly
- [ ] AI features display "Powered by HustleXP AI"
- [ ] Leaderboard shows top 100 users
- [ ] Profile stats match reality
- [ ] No crashes during 10-minute session

---

## 🎯 Ready for Simulation Criteria

✅ **You're ready when:**
1. App launches without errors
2. 100+ tasks display in feed
3. Onboarding → Home flow works end-to-end
4. XP system + animations working
5. No major performance issues (< 2s load, smooth scrolling)
6. AI branding visible in key areas

---

## 🚨 Known Issues / Technical Debt

### High Priority
- [ ] Backend API integration (Replit backend needs testing)
- [ ] WebSocket chat connection (real-time)
- [ ] Stripe payment flow (sandbox mode)

### Medium Priority
- [ ] Push notifications setup (Firebase)
- [ ] Image upload to Cloudflare R2
- [ ] Offline sync queue

### Low Priority
- [ ] Analytics tracking (PostHog/Amplitude)
- [ ] A/B testing framework
- [ ] Advanced AI features (predictive matching)

---

## 📊 Simulation Success Metrics

### Baseline Targets
- **Users**: 100 seed users
- **Tasks**: 200 seed tasks
- **XP Range**: 100-5000 per user
- **Leaderboard**: Top 100 ranked by XP
- **Match Scores**: 60-95% (AI calculated)

### Performance Targets
- **Load Time**: < 2s
- **Bundle Size**: < 5 MB
- **RAM Usage**: < 150 MB
- **FPS**: 60fps (smooth animations)

---

## 🎬 Next Steps

1. ✅ Fix critical errors → **DONE**
2. 🔲 Run `bun start` and test basic flow
3. 🔲 Expand seed data to 200 tasks (optional)
4. 🔲 Test AI Task Creator with real prompts
5. 🔲 Verify Seattle location filters work
6. 🔲 Record demo video for media kit
7. 🔲 Create QR code for Pike Place booth

---

## 💬 Need Help?

**Common Issues:**
- "Cannot destructure useApp()" → Use specific context hooks (`useUser`, `useTasks`, etc.)
- "Seed data not loading" → Clear AsyncStorage: `AsyncStorage.clear()`
- "AI features not working" → Check `.env` has `EXPO_PUBLIC_ENABLE_AI_FEATURES=true`
- "Slow performance" → Reduce seed data or disable animations

---

**Status**: 🟢 READY FOR SIMULATION TESTING
**Last Updated**: 2025-01-31
