# 🚀 PHASE 3 QUICK START GUIDE

## What You Got

**Phase 3: Visual Guidance System** - AI can now visually guide users through the app with highlights, arrows, and multi-step tutorials.

---

## 🎯 Key Methods

### 1. Highlight Any Element
```typescript
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';

const aiCoach = useUltimateAICoach();

// Highlight with full control
aiCoach.highlightElement({
  elementId: 'my-button',
  position: { x: 20, y: 400, width: 350, height: 60 },
  message: 'Tap here to continue!',
  arrowDirection: 'up', // 'up' | 'down' | 'left' | 'right'
  onTap: () => handleButtonPress(),
  allowDismiss: true, // User can tap background to dismiss
}, 5000); // Optional: auto-dismiss after 5 seconds
```

### 2. Start Multi-Step Tutorial
```typescript
aiCoach.startTutorial({
  id: 'onboarding-tutorial',
  title: 'Welcome to HustleXP!',
  steps: [
    {
      id: 'step-1',
      position: { x: 20, y: 100, width: 350, height: 120 },
      message: 'This is a quest card. Tap to view details!',
      arrowDirection: 'down',
      xpReward: 10,
    },
    {
      id: 'step-2',
      position: { x: 20, y: 500, width: 350, height: 60 },
      message: 'Tap here to accept your first quest!',
      arrowDirection: 'up',
      action: async () => {
        await acceptQuest();
      },
      xpReward: 25,
    },
    {
      id: 'step-3',
      message: 'Great! You're ready to start earning!',
      xpReward: 15,
    },
  ],
  onComplete: (xpEarned) => {
    console.log(`Tutorial complete! +${xpEarned} XP`);
    showSuccessToast(`You earned ${xpEarned} XP!`);
  },
  onSkip: () => {
    console.log('User skipped tutorial');
  },
});
```

### 3. Smart Navigation with Filters
```typescript
// Navigate to a screen with pre-applied filters
await aiCoach.navigateWithFilters('tasks', {
  category: 'delivery',
  maxDistance: 5,
  minPay: 50,
});
```

### 4. Dismiss Active Guidance
```typescript
// Dismiss current highlight
aiCoach.dismissHighlight();

// Dismiss active tutorial
aiCoach.dismissTutorial();
```

---

## 🎨 Arrow Directions

The arrow automatically positions the tooltip:

- **`'up'`**: Arrow points up, tooltip below element
- **`'down'`**: Arrow points down, tooltip above element
- **`'left'`**: Arrow points left, tooltip to the right
- **`'right'`**: Arrow points right, tooltip to the left

The system auto-prevents tooltips from going off-screen!

---

## 💡 Common Use Cases

### New User Onboarding
```typescript
useEffect(() => {
  if (isFirstTime) {
    aiCoach.startTutorial(getOnboardingTutorial());
  }
}, [isFirstTime]);
```

### Feature Discovery
```typescript
// Highlight new feature
aiCoach.highlightElement({
  elementId: 'new-feature-button',
  position: getButtonPosition(),
  message: 'NEW! Try our instant match feature!',
  arrowDirection: 'down',
}, 10000);
```

### AI-Driven Help
```typescript
// User: "How do I accept a quest?"
// AI automatically starts tutorial
aiCoach.startTutorial(questAcceptanceTutorial);
```

### Screen-Specific Guidance
```typescript
useEffect(() => {
  aiCoach.updateContext({
    screen: 'task-detail',
    taskId: id,
    canAccept: true,
  });
  
  if (showHint) {
    aiCoach.highlightElement({
      elementId: 'accept-button',
      position: acceptButtonPosition,
      message: 'This quest pays 23% above average!',
      arrowDirection: 'up',
    });
  }
}, [id, showHint]);
```

---

## 🎯 Pro Tips

1. **Use XP Rewards**: Users love earning XP for completing tutorials
2. **Keep Steps Short**: 3-5 steps is ideal for mobile
3. **Allow Skipping**: Users appreciate the option to skip
4. **Test Positions**: Element positions vary by device/orientation
5. **Add Actions**: Let steps execute real actions (accept quest, apply filter, etc.)
6. **Combine with AI**: Let AI proactively suggest tutorials when users are stuck

---

## 🔥 Advanced Example: AI-Triggered Tutorial

```typescript
// In your AI response handler
if (userAsksForHelp('how to filter quests')) {
  aiCoach.sendMessage(
    "Great question! Let me show you with a quick tutorial."
  );
  
  setTimeout(() => {
    aiCoach.startTutorial({
      id: 'filter-tutorial',
      title: 'How to Filter Quests',
      steps: [
        {
          id: 'open-filters',
          position: getFilterButtonPosition(),
          message: 'First, tap the filter icon',
          arrowDirection: 'down',
          xpReward: 10,
        },
        {
          id: 'select-category',
          position: getCategoryDropdownPosition(),
          message: 'Choose your preferred category',
          xpReward: 10,
        },
        {
          id: 'set-distance',
          position: getDistanceSliderPosition(),
          message: 'Set your maximum distance',
          xpReward: 10,
        },
        {
          id: 'apply',
          position: getApplyButtonPosition(),
          message: 'Tap Apply to see filtered results!',
          arrowDirection: 'up',
          action: async () => {
            await applyFilters();
          },
          xpReward: 20,
        },
      ],
      onComplete: (xp) => {
        aiCoach.sendMessage(
          `🎉 Tutorial complete! You earned ${xp} XP. Now you know how to find the perfect quests!`
        );
      },
    });
  }, 500);
}
```

---

## 📊 What's Next?

**Phase 4: Voice Mode & Advanced Actions** (Coming Next)
- Voice-activated AI (long-press to speak)
- Action execution with confirmation modals
- Predictive suggestions based on patterns
- Smart negotiations
- Route optimization

---

**Questions?** Check `PHASE_3_COMPLETE.md` for full documentation!
