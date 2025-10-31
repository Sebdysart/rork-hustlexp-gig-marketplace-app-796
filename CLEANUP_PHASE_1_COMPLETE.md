# HustleXP Cleanup - Phase 1 Complete ✅

## Goal
Optimize HustleXP for **Seattle mobile launch**: fast, lean, focused on core "Get Anything Done" marketplace.

---

## ✅ Completed - Root Layout Optimization

### Removed from `app/_layout.tsx`:
- ❌ **TextNodeErrorBoundary** - Bloated error handling wrapper
- ❌ **BackendProvider** - Use lazy-loaded services instead
- ❌ **AppProvider** - Redundant context aggregator (not used anywhere)
- ❌ **PWAInstallPrompt** - Not needed for mobile-first Seattle launch
- ❌ **Test/Admin Screens** - Removed from Stack routing

### Provider Structure Optimized:
**Before**: 9 nested providers (including bloat)
**After**: 5 clean providers
```
QueryClientProvider
└─ GestureHandlerRootView
   └─ ThemeProvider
      └─ SettingsProvider
         └─ NotificationProvider
            └─ UserProvider
               └─ TasksProvider
                  └─ EconomyProvider
```

### Performance Impact:
- **Faster initial load** - Fewer context initializations
- **Smaller bundle** - Removed unused provider code
- **Cleaner architecture** - Clear separation of concerns

---

## ✅ Completed - Context Simplification

### Already Well-Structured:
- **UserContext**: Auth, profile, role switching, leaderboard
- **TasksContext**: Task CRUD, messages, ratings, reports
- **EconomyContext**: XP, GRIT, power-ups, feature unlocks

**AppContext** was just a thin aggregator - removed entirely.

---

## 🟡 Phase 2 Priorities (Next)

### 1. Translation System Simplification
**Current State**: Heavy AI translation system with caching, batching, progress tracking
**Target**: Simple English-only stub OR remove from critical paths

**Files Affected**:
- `contexts/LanguageContext.tsx` (420+ lines)
- `hooks/useTranslatedText.ts`
- `hooks/useChatTranslation.ts`
- All screens using `useTranslatedTexts()` or `translations[X]`

**Strategy**:
- Option A: Replace with stub that returns original English text
- Option B: Remove translation calls from onboarding/core flows

### 2. Remove Tradesmen Mode Features
**Files to Remove/Hide**:
- `/app/tradesmen-*.tsx` (dashboard, onboarding, go-mode, earnings)
- `/app/pro-quests.tsx`
- `/app/pro-squads.tsx`
- `/app/certification-upload.tsx`
- `/app/tool-inventory.tsx`
- `/constants/tradesmen.ts`

**Strategy**: Keep "both" role support, but hide tradesmen-specific screens

### 3. Remove Test/Diagnostic Screens
**Files to Remove**:
- `/app/test-*.tsx` (onboarding, dashboard, translation, backend, phase-1)
- `/app/diagnostic-*.tsx` (center, suite)
- `/app/text-node-*.tsx` (diagnostic, scanner, error-finder)
- `/app/backend-test.tsx`
- `/app/ai-diagnostic.tsx`
- `/app/e2e-onboarding-test.tsx`

### 4. Package.json Optimization
**Move to devDependencies**:
- `jest`, `jest-expo`
- `@testing-library/*`
- `@types/jest`
- `@tanstack/eslint-plugin-query`

**Consider Removing**:
- `expo-av` (not using audio)
- `expo-clipboard` (not critical)
- `expo-device` (not critical)
- `expo-font` (not using custom fonts)
- `expo-localization` (if removing translations)
- `i18n-js` (if removing translations)
- `zustand` (not used, using Context API)
- `nativewind` (not used, using StyleSheet)

### 5. Move Documentation
**Target**: `/docs` folder
- All `.md` files except README.md
- Keep only essential docs in root

---

## 🎯 Expected Impact After Phase 2

### Bundle Size:
- **Current**: ~45MB (estimated with all features)
- **Target**: ~15-20MB (core marketplace only)

### Initial Load Time:
- **Remove**: Translation preloading
- **Remove**: Tradesmen profile checks
- **Remove**: Unused route registrations

### Developer Experience:
- Cleaner file structure
- Faster dev server startup
- Easier to find core code

---

## 📱 Core User Flows to Preserve

### Hustler (Worker) Flow:
1. Onboarding → Choose role
2. Browse nearby tasks
3. Accept task → Chat → Complete → Get paid + XP
4. See level up animation + badges

### Poster Flow:
1. Onboarding → Choose role
2. Post task → Match with worker
3. Chat → Approve completion → Pay + rate

### Gamification:
- XP bar, level ups, badges
- Leaderboard
- Basic power-ups (if time permits)

---

## 🚨 What NOT to Touch

### Keep These Intact:
- ✅ UserContext, TasksContext, EconomyContext
- ✅ Core gamification (XP, levels, badges)
- ✅ Task lifecycle (open → in_progress → completed)
- ✅ Chat/messaging system
- ✅ Location-based task matching
- ✅ Universal AI features (task composer, smart match)

---

## Next Steps

Run Phase 2 cleanup with approval:
1. Simplify/remove translation system
2. Hide/remove tradesmen screens
3. Delete test/diagnostic files
4. Document package.json optimizations
5. Move docs to `/docs` folder

**Estimated Time**: 15-20 minutes
**Risk Level**: Low (preserves core functionality)
