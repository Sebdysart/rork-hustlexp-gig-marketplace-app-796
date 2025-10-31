# Context Migration Guide

## Overview
AppContext has been split into three focused contexts for better performance and maintainability:

1. **UserContext** - Authentication, profiles, streaks
2. **TasksContext** - Tasks CRUD, messages, ratings
3. **EconomyContext** - XP, wallet, power-ups, purchases

## Quick Migration

### Before (Old AppContext):
```tsx
import { useApp } from '@/contexts/AppContext';

function MyComponent() {
  const { 
    currentUser, 
    tasks, 
    createTask, 
    completeTask,
    purchasePowerUp 
  } = useApp();
}
```

### After (New Contexts):
```tsx
import { useUser } from '@/contexts/UserContext';
import { useTasks } from '@/contexts/TasksContext';
import { useEconomy } from '@/contexts/EconomyContext';

function MyComponent() {
  const { currentUser } = useUser();
  const { tasks, createTask, completeTask } = useTasks();
  const { purchasePowerUp } = useEconomy();
}
```

## Context API Reference

### UserContext
**Hook:** `useUser()`

**Available:**
- `currentUser` - Current logged-in user
- `users` - All users (for leaderboard, etc.)
- `hasOnboarded` - Onboarding status
- `isLoading` - Loading state
- `completeOnboarding()` - Complete onboarding flow
- `updateUser()` - Update user data
- `signOut()` - Sign out current user
- `switchMode()` - Switch between everyday/business/tradesmen modes
- `fetchRoleStats()` - Get role statistics
- `leaderboard` - Computed leaderboard data
- `addVerificationBadge()` - Add verification badge

### TasksContext
**Hook:** `useTasks()`

**Available:**
- `tasks` - All tasks
- `messages` - All messages
- `ratings` - All ratings
- `reports` - All reports
- `createTask()` - Create new task
- `acceptTask()` - Accept a task
- `completeTask()` - Mark task as complete
- `sendMessage()` - Send message in task chat
- `getTaskMessages()` - Get messages for specific task
- `rateUser()` - Rate a user
- `submitReport()` - Submit a report
- `updateAvailabilityStatus()` - Update availability
- `respondToTaskOffer()` - Respond to HustleAI task offer
- `myTasks` - Current user's posted tasks
- `myAcceptedTasks` - Current user's accepted tasks
- `availableTasks` - All open tasks

### EconomyContext
**Hook:** `useEconomy()`

**Available:**
- `purchases` - All purchases
- `activePowerUps` - Active power-ups by user ID
- `awardXP()` - Award XP to user
- `awardGrit()` - Award GRIT currency
- `processTaskCompletion()` - Process task completion rewards
- `purchasePowerUp()` - Purchase a power-up
- `markFeatureAsViewed()` - Mark feature as viewed

## Common Patterns

### Task Completion with Rewards
```tsx
const { currentUser } = useUser();
const { completeTask } = useTasks();
const { processTaskCompletion } = useEconomy();

const handleComplete = async (taskId: string) => {
  const task = await completeTask(taskId);
  if (task) {
    const rewards = await processTaskCompletion(task);
    console.log('Rewards:', rewards);
  }
};
```

### User Profile Update
```tsx
const { currentUser, updateUser } = useUser();

const handleUpdateProfile = async (newData: Partial<User>) => {
  if (!currentUser) return;
  await updateUser({ ...currentUser, ...newData });
};
```

### Filtered Tasks
```tsx
const { tasks } = useTasks();
const { currentUser } = useUser();

const nearbyTasks = tasks.filter(task => {
  // Your filtering logic
  return task.status === 'open';
});
```

## Removed Contexts

These contexts have been removed as they were unused or over-engineered:
- ❌ SquadContext
- ❌ OfferContext
- ❌ TaskLifecycleContext
- ❌ AnalyticsContext
- ❌ LanguageContext (Translation system removed)
- ❌ AIProfileContext
- ❌ ProductionMonitoringContext
- ❌ NotificationThrottleContext
- ❌ UnifiedAIContext

## Clean Provider Structure

```tsx
<QueryClientProvider>
  <BackendProvider>
    <ThemeProvider>
      <SettingsProvider>
        <NotificationProvider>
          <UserProvider>
            <TasksProvider>
              <EconomyProvider>
                {/* Your app */}
              </EconomyProvider>
            </TasksProvider>
          </UserProvider>
        </NotificationProvider>
      </SettingsProvider>
    </ThemeProvider>
  </BackendProvider>
</QueryClientProvider>
```

## Benefits

✅ **Better Performance** - Only re-render components that need specific data  
✅ **Easier Testing** - Test contexts in isolation  
✅ **Clearer Separation** - Logical grouping of related functionality  
✅ **Smaller Bundle** - Removed unused code  
✅ **Simpler Mental Model** - Know exactly where to find what you need
