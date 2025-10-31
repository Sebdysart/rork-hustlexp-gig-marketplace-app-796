# HustleXP Context Architecture

## Overview
The app state is now split into **focused, single-responsibility contexts** for better maintainability and performance.

## Context Structure

### 1. **UserContext** - Authentication & User Management
**Location:** `contexts/UserContext.tsx`

**Responsibilities:**
- Current user state
- All users in the system
- Onboarding flow
- Sign in/out
- User profile updates
- Mode switching (everyday/business/tradesmen)
- Verification badges
- Leaderboard data

**Key Methods:**
```ts
const {
  currentUser,
  users,
  hasOnboarded,
  isLoading,
  completeOnboarding,
  updateUser,
  signOut,
  switchMode,
  fetchRoleStats,
  leaderboard,
  addVerificationBadge,
} = useUser();
```

---

### 2. **TasksContext** - Task Management & Chat
**Location:** `contexts/TasksContext.tsx`

**Responsibilities:**
- Tasks CRUD operations
- Task acceptance/completion
- Chat messages
- Ratings & reviews
- Reports
- Availability status
- HustleAI task offers

**Key Methods:**
```ts
const {
  tasks,
  messages,
  ratings,
  reports,
  createTask,
  acceptTask,
  completeTask,
  sendMessage,
  getTaskMessages,
  rateUser,
  submitReport,
  updateAvailabilityStatus,
  respondToTaskOffer,
  myTasks,
  myAcceptedTasks,
  availableTasks,
} = useTasks();
```

---

### 3. **EconomyContext** - XP, Grit, Power-Ups
**Location:** `contexts/EconomyContext.tsx`

**Responsibilities:**
- XP & Level calculations
- GRIT currency management
- Power-up purchases
- Feature unlocks
- Task completion rewards
- Commission calculations

**Key Methods:**
```ts
const {
  purchases,
  activePowerUps,
  awardXP,
  awardGrit,
  processTaskCompletion,
  purchasePowerUp,
  markFeatureAsViewed,
} = useEconomy();
```

---

### 4. **AppContext** - Compatibility Wrapper ⚠️ DEPRECATED
**Location:** `contexts/AppContext.tsx`

**Purpose:** Combines UserContext + TasksContext + EconomyContext for backward compatibility.

**Usage:**
```ts
// Old way (still works but deprecated)
const { currentUser, tasks, awardXP } = useApp();

// ✅ New way (recommended)
const { currentUser } = useUser();
const { tasks } = useTasks();
const { awardXP } = useEconomy();
```

**Migration Status:**
- ⚠️ AppContext is a thin wrapper that merges all three contexts
- ✅ No functionality is lost
- ✅ Existing code continues to work without changes
- 🔧 New code should use specific contexts

---

## Provider Hierarchy

```tsx
<QueryClientProvider>
  <BackendProvider>
    <ThemeProvider>
      <SettingsProvider>
        <NotificationProvider>
          <UserProvider>
            <TasksProvider>
              <EconomyProvider>
                <AppProvider> {/* Compatibility wrapper */}
                  <App />
                </AppProvider>
              </EconomyProvider>
            </TasksProvider>
          </UserProvider>
        </NotificationProvider>
      </SettingsProvider>
    </ThemeProvider>
  </BackendProvider>
</QueryClientProvider>
```

---

## Benefits of New Architecture

### 🚀 Performance
- Contexts only re-render when their specific data changes
- No massive context re-renders when unrelated data updates
- Better React optimization opportunities

### 🧹 Cleaner Code
- Each context has a clear, single responsibility
- Easier to understand and maintain
- Less coupling between features

### 🧪 Testability
- Test user logic independently
- Mock only what you need
- Simpler test setup

### 📦 Bundle Size
- Can lazy-load economy features for non-gamified users
- Tree-shaking works better with focused contexts

---

## Migration Guide (Optional)

### Migrating a Screen from `useApp()` to Specific Contexts

**Before:**
```tsx
import { useApp } from '@/contexts/AppContext';

export default function TaskScreen() {
  const { 
    currentUser, 
    tasks, 
    acceptTask, 
    awardXP 
  } = useApp();
  
  // ...
}
```

**After:**
```tsx
import { useUser } from '@/contexts/UserContext';
import { useTasks } from '@/contexts/TasksContext';
import { useEconomy } from '@/contexts/EconomyContext';

export default function TaskScreen() {
  const { currentUser } = useUser();
  const { tasks, acceptTask } = useTasks();
  const { awardXP } = useEconomy();
  
  // Same functionality, better performance!
}
```

---

## When to Use Which Context

| Feature | Context to Use |
|---------|----------------|
| User profile, auth, mode switching | `useUser()` |
| Tasks, chat, ratings, reports | `useTasks()` |
| XP, GRIT, power-ups, unlocks | `useEconomy()` |
| Need multiple (legacy code) | `useApp()` |

---

## Notes for Seattle Launch

- ✅ All existing code continues to work
- ✅ No breaking changes
- ✅ AppContext wrapper ensures compatibility
- 🎯 Focus on core features, not context refactoring
- 📝 New features can adopt new pattern gradually
