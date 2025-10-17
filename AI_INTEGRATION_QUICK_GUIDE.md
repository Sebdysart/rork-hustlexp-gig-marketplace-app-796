# AI Learning Integration - Quick Copy-Paste Guide

## ✅ Already Done
- AIProfileProvider added to app
- Profile fetching on home screen
- Match acceptance feedback on task accept

## 🔧 What You Need to Add (Copy-Paste Ready)

### 1. Task Completion Feedback

**File**: Find your task completion/rating screen  
**When**: After user rates and completes a task

```typescript
import { useAILearning } from '@/utils/aiLearningIntegration';
import { useApp } from '@/contexts/AppContext';

// Inside your component
const { currentUser } = useApp();
const { submitTaskCompletion } = useAILearning();

// When task is completed and rated
const handleTaskComplete = async (rating: number) => {
  // Your existing completion logic...
  
  if (currentUser) {
    const actualHours = calculateActualHours(); // Your calculation
    const actualPrice = task.payAmount;
    const predictedHours = parseFloat(task.estimatedDuration || '2');
    
    await submitTaskCompletion(
      currentUser.id,
      task.id,
      rating,              // 1-5 stars
      85,                  // Default match score
      actualHours,
      rating >= 4,         // Pricing was fair if 4+ stars
      predictedHours,
      task.payAmount,      // Predicted price
      actualPrice
    );
    
    console.log('[App] Task completion feedback submitted');
  }
};
```

---

### 2. Task Rejection Feedback

**File**: Task card component or detail screen  
**When**: User dismisses/backs out without accepting

```typescript
import { useAILearning } from '@/utils/aiLearningIntegration';
import { useApp } from '@/contexts/AppContext';

const { currentUser } = useApp();
const { submitMatchRejection } = useAILearning();

// When user rejects/dismisses task
const handleRejectTask = async (reason?: string) => {
  if (currentUser) {
    await submitMatchRejection(
      currentUser.id,
      task.id,
      85,                           // Default match score
      88,                           // Default confidence
      reason || 'not_interested'    // Rejection reason
    );
    
    console.log('[App] Task rejection feedback submitted');
  }
  
  // Your existing rejection logic...
};

// Example with reason picker
const REJECTION_REASONS = [
  { value: 'too_far', label: 'Too far away' },
  { value: 'low_pay', label: 'Pay too low' },
  { value: 'wrong_time', label: 'Bad timing' },
  { value: 'not_interested', label: 'Not interested' },
];
```

---

### 3. Show AI Insights on Task Cards

**File**: Your TaskCard component  
**Add**: Badge showing why AI recommended this task

```typescript
import { useAIProfile } from '@/contexts/AIProfileContext';
import { Brain } from 'lucide-react-native';
import { premiumColors } from '@/constants/designTokens';

// Inside TaskCard component
const { getTaskInsight } = useAIProfile();

const aiInsight = getTaskInsight(task.category, task.payAmount);

// In your render (add this badge)
{aiInsight && (
  <View style={styles.aiInsightBadge}>
    <Brain size={14} color={premiumColors.neonCyan} />
    <Text style={styles.aiInsightText}>{aiInsight}</Text>
  </View>
)}

// Styles to add
const styles = StyleSheet.create({
  aiInsightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonCyan + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  aiInsightText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
});
```

---

### 4. AI-Powered Task Filtering (Optional)

**File**: Where you filter/display task list  
**Add**: Smart pre-filtering based on user preferences

```typescript
import { useAIProfile } from '@/contexts/AIProfileContext';

const { shouldShowTask, aiProfile } = useAIProfile();

// Filter tasks using AI profile
const smartFilteredTasks = useMemo(() => {
  if (!aiProfile) return allTasks; // No profile yet, show all
  
  return allTasks.filter(task => 
    shouldShowTask(task.category, task.payAmount)
  );
}, [allTasks, aiProfile, shouldShowTask]);

// Use smartFilteredTasks instead of allTasks in your render
```

---

### 5. Trade Completion Feedback (If Using Tradesmen Mode)

**File**: Tradesmen job completion screen  
**When**: After trade job is verified

```typescript
import { useAILearning } from '@/utils/aiLearningIntegration';

const { submitTradeCompletion } = useAILearning();

const handleTradeJobComplete = async () => {
  if (currentUser) {
    await submitTradeCompletion(
      currentUser.id,
      task.id,
      actualHours,
      pricingWasFair,
      certificationUsed,    // e.g., "Master Electrician"
      squadSize,            // Number of people on job
      estimatedHours,       // What AI predicted
      actualPrice,
      estimatedPrice        // What AI predicted
    );
    
    console.log('[App] Trade completion feedback submitted');
  }
};
```

---

## Testing Checklist

### After Adding Each Integration:

1. **Task Completion**
   ```
   □ Complete a task
   □ Rate it
   □ Check console for: "[AILearning] Submitting task completion feedback"
   □ Check backend receives POST /api/feedback
   ```

2. **Task Rejection**
   ```
   □ Dismiss a task
   □ Check console for: "[AILearning] Submitting match rejection feedback"
   □ Check backend receives POST /api/feedback
   ```

3. **AI Insights**
   ```
   □ Open task list
   □ Accept/reject 5-10 tasks
   □ Close and reopen app
   □ Look for "Why this task?" badges on task cards
   ```

4. **AI Profile Loading**
   ```
   □ Open app
   □ Check console for: "[Home] Fetching AI profile for user: ..."
   □ Check backend receives GET /api/users/:id/profile/ai
   ```

---

## Quick Backend Check

### Test Your Backend is Working:

```bash
# Health check
curl https://your-replit-url/api/health

# Expected: { "status": "ok", ... }
```

### Check Calibration Dashboard:
Open your app and navigate to `/ai-calibration` to see real-time AI metrics.

---

## Common Issues & Fixes

### Issue: No insights showing up
**Fix**: Submit 5-10 acceptance/rejection feedbacks first. AI needs data to learn.

### Issue: Backend not receiving requests
**Fix**: Check `HUSTLEAI_DEV_URL` in `utils/hustleAI.ts` matches your Replit URL.

### Issue: TypeScript errors
**Fix**: Ensure you have `currentUser` from `useApp()` context.

---

## Implementation Priority

1. ✅ **Task Completion** (CRITICAL - 10 min)
   - Highest learning value
   - Start here!

2. ✅ **Task Rejection** (HIGH - 15 min)
   - Teaches AI user preferences
   - Do this second

3. ✅ **AI Insights** (MEDIUM - 20 min)
   - User-facing benefit
   - Do after submission feedback works

4. ✅ **Smart Filtering** (NICE TO HAVE - 10 min)
   - Subtle UX improvement
   - Do last

---

## Expected Timeline

- **Day 1**: Add completion + rejection feedback (30 min)
- **Day 2-3**: Users generate 50+ feedback entries
- **Day 4**: Add AI insights to task cards (20 min)
- **Day 5+**: AI starts showing meaningful insights

---

## Success Indicators

You'll know it's working when:
- Console shows `[AILearning]` logs
- Backend receives `/api/feedback` requests
- `/ai-calibration` screen shows metrics
- After ~20 tasks, "Why this task?" badges appear
- Match acceptance rate increases over time

---

That's it! Copy-paste the code snippets above into your completion and rejection flows to activate the full AI learning system. 🚀
