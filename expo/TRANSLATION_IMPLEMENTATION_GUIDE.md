# Complete App Translation Implementation Guide

## Overview
This guide provides step-by-step instructions to translate EVERY page and component in the HustleXP app. Follow this systematically to ensure 100% translation coverage.

## Translation Approach

### Option 1: Using `useTranslatedTexts` (Recommended for Pages with Multiple Strings)

```typescript
import { useTranslatedTexts } from '@/hooks/useTranslatedText';

export default function MyScreen() {
  const translationKeys = [
    'Welcome to HustleXP',
    'Start your journey',
    'Complete tasks',
    'Earn rewards',
  ];
  const translations = useTranslatedTexts(translationKeys);

  return (
    <View>
      <Text>{translations[0]}</Text>
      <Text>{translations[1]}</Text>
      <Button title={translations[2]} />
    </View>
  );
}
```

### Option 2: Using `<T>` Component (For Simple Cases)

```typescript
import T from '@/components/T';

export default function MyScreen() {
  return (
    <View>
      <T style={styles.title}>Welcome to HustleXP</T>
      <T style={styles.subtitle}>Start your journey</T>
    </View>
  );
}
```

### Option 3: Using `useTranslatedText` (Single String)

```typescript
import { useTranslatedText } from '@/hooks/useTranslatedText';

export default function MyComponent() {
  const welcomeText = useTranslatedText('Welcome!');
  return <Text>{welcomeText}</Text>;
}
```

## Files Requiring Translation

### ✅ Already Translated
- app/onboarding.tsx
- app/welcome-tutorial.tsx

### 📱 Tab Screens (PRIORITY 1)
- [ ] app/(tabs)/home.tsx
- [ ] app/(tabs)/tasks.tsx
- [ ] app/(tabs)/quests.tsx
- [ ] app/(tabs)/wallet.tsx
- [ ] app/(tabs)/profile.tsx
- [ ] app/(tabs)/leaderboard.tsx
- [ ] app/(tabs)/roadmap.tsx
- [ ] app/(tabs)/chat.tsx

### 🤖 AI Features (PRIORITY 1)
- [ ] app/hustle-coach.tsx
- [ ] app/ai-coach.tsx
- [ ] app/ai-task-creator.tsx
- [ ] app/ai-foreman.tsx
- [ ] app/chat/hustleai.tsx
- [ ] app/ai-settings.tsx
- [ ] app/ai-calibration.tsx

### 📋 Task Lifecycle (PRIORITY 1)
- [ ] app/post-task.tsx
- [ ] app/task-accept/[id].tsx
- [ ] app/task-active/[id].tsx
- [ ] app/task-complete/[id].tsx
- [ ] app/task-verify/[id].tsx
- [ ] app/task-verification-result/[id].tsx
- [ ] app/task/[id].tsx

### 🏆 Gamification Screens
- [ ] app/badge-library.tsx
- [ ] app/trophy-room.tsx
- [ ] app/progressive-badges.tsx
- [ ] app/skill-tree.tsx
- [ ] app/seasons.tsx
- [ ] app/daily-quests.tsx
- [ ] app/progress.tsx

### 👥 Squad & Social Features
- [ ] app/squads.tsx
- [ ] app/squad-quests.tsx
- [ ] app/pro-squads.tsx
- [ ] app/create-squad.tsx
- [ ] app/squad/[id].tsx
- [ ] app/leaderboard.tsx

### 🛒 Marketplace & Shop
- [ ] app/shop.tsx
- [ ] app/offers/new.tsx
- [ ] app/offers/index.tsx
- [ ] app/instant-match.tsx
- [ ] app/adventure-map.tsx

### 🔧 Tradesmen Features
- [ ] app/tradesmen-dashboard.tsx
- [ ] app/tradesmen-onboarding.tsx
- [ ] app/tradesmen-go-mode.tsx
- [ ] app/tradesmen-earnings.tsx
- [ ] app/tool-inventory.tsx
- [ ] app/certification-upload.tsx

### ⚙️ Settings & Profile
- [ ] app/settings.tsx
- [ ] app/notification-settings.tsx
- [ ] app/accessibility-settings.tsx
- [ ] app/wellbeing-settings.tsx
- [ ] app/user/[id].tsx
- [ ] app/portfolio.tsx

### 🔐 Verification & Trust
- [ ] app/verification.tsx
- [ ] app/kyc-verification.tsx
- [ ] app/trust-center.tsx
- [ ] app/disputes.tsx
- [ ] app/prooflink.tsx

### 💎 Premium Features
- [ ] app/pro.tsx
- [ ] app/referrals.tsx
- [ ] app/themes.tsx

### 🔍 Utility Screens
- [ ] app/search.tsx
- [ ] app/streak-savers.tsx
- [ ] app/watchlist.tsx
- [ ] app/roadmap.tsx
- [ ] app/poster-dashboard.tsx
- [ ] app/workroom/[id].tsx
- [ ] app/sign-in.tsx
- [ ] app/welcome.tsx

### 🧩 Shared Components (IMPORTANT!)
- [ ] components/TaskCard.tsx
- [ ] components/QuestCard.tsx
- [ ] components/XPBar.tsx
- [ ] components/LevelBadge.tsx
- [ ] components/EvolvingAvatar.tsx
- [ ] components/FloatingHUD.tsx
- [ ] components/NotificationToast.tsx
- [ ] components/NotificationCenter.tsx
- [ ] components/PowerUpInventory.tsx
- [ ] components/GlassCard.tsx
- [ ] components/NeonButton.tsx
- [ ] components/CircularProgress.tsx
- [ ] components/TutorialCarousel.tsx
- [ ] components/GritCoin.tsx
- [ ] components/XPAura.tsx
- [ ] components/InteractiveBadgeShowcase.tsx
- [ ] components/RoleSwitcher.tsx
- [ ] components/LeaderboardContent.tsx
- [ ] components/QuestsContent.tsx
- [ ] components/LiveActivityFeed.tsx
- [ ] components/TradeBadgeShowcase.tsx
- [ ] components/AvailabilityToggle.tsx
- [ ] components/PanicButton.tsx
- [ ] components/CompletionCelebration.tsx
- [ ] components/ProgressiveBadgeCard.tsx
- [ ] components/UnifiedProfile.tsx
- [ ] components/ShareButton.tsx
- [ ] components/TrophyShowcase.tsx
- [ ] components/FeatureUnlockAnimation.tsx
- [ ] components/HustleAIAssistant.tsx
- [ ] components/ModeSwitcher.tsx
- [ ] components/UnifiedModeSwitcher.tsx
- [ ] components/FloatingChatIcon.tsx
- [ ] components/TaskBundleSuggestions.tsx
- [ ] components/SkeletonLoader.tsx
- [ ] components/AnimatedButton.tsx
- [ ] components/AnimatedEmptyState.tsx
- [ ] components/StaggeredList.tsx
- [ ] components/ParallaxScrollView.tsx
- [ ] components/PullToRefreshSpinner.tsx
- [ ] components/PageTransition.tsx
- [ ] components/RoleStatsCard.tsx
- [ ] components/ViralShareModal.tsx
- [ ] components/ShareableAchievementCard.tsx
- [ ] components/SocialProofBanner.tsx
- [ ] components/InviteFriendsWidget.tsx

## Step-by-Step Implementation

### Step 1: Identify All Static Text
Go through each file and identify all hardcoded English strings in:
- `<Text>` components
- Button titles
- Placeholder text
- Alert messages
- Modal headers
- Form labels
- Navigation titles
- Error messages
- Success messages
- Tooltips

### Step 2: Extract Translation Keys
Create an array of all unique strings that need translation:

```typescript
const translationKeys = [
  'Home',
  'Welcome back!',
  'Your active tasks',
  'Complete now',
  'View all',
  // ... all other strings
];
```

### Step 3: Import Translation Hook
```typescript
import { useTranslatedTexts } from '@/hooks/useTranslatedText';
```

### Step 4: Use Translations
```typescript
const translations = useTranslatedTexts(translationKeys);

// Then replace static text with array indices
<Text>{translations[0]}</Text> // 'Home'
<Text>{translations[1]}</Text> // 'Welcome back!'
```

### Step 5: Test Language Switching
After implementing translations:
1. Open the globe icon in the app
2. Switch to Spanish/French/etc
3. Verify all text changes on the screen
4. Check that layout doesn't break with longer translations

## Common Patterns

### Pattern 1: Screen Headers
```typescript
const keys = ['Screen Title', 'Subtitle description'];
const trans = useTranslatedTexts(keys);

<Stack.Screen options={{ title: trans[0] }} />
```

### Pattern 2: Lists with Dynamic Data
```typescript
const staticKeys = ['No items', 'Load more', 'Refresh'];
const trans = useTranslatedTexts(staticKeys);

{items.length === 0 ? (
  <Text>{trans[0]}</Text>
) : (
  // render items
)}
```

### Pattern 3: Form Fields
```typescript
const formKeys = [
  'Name',
  'Enter your name',
  'Email',
  'Enter your email',
  'Submit',
  'Cancel',
];
const trans = useTranslatedTexts(formKeys);

<TextInput placeholder={trans[1]} />
<Button title={trans[4]} />
```

### Pattern 4: Dynamic Content with Template Strings
```typescript
// For dynamic content, translate the template parts
const keys = [
  'You have', // index 0
  'tasks remaining', // index 1
];
const trans = useTranslatedTexts(keys);

// Then combine: "You have {count} tasks remaining"
<Text>{trans[0]} {count} {trans[1]}</Text>
```

## Translation Coverage Checklist

For each file, ensure you've translated:
- [ ] Page title/header
- [ ] All section headers
- [ ] All button labels
- [ ] All form labels and placeholders
- [ ] All toast/alert messages
- [ ] All empty state messages
- [ ] All error messages
- [ ] All navigation labels
- [ ] All tooltips/hints
- [ ] All modal titles and descriptions

## Testing Checklist

After translating each screen:
- [ ] Switch to Spanish - verify all text changes
- [ ] Switch to French - verify all text changes
- [ ] Switch to Portuguese - verify all text changes
- [ ] Check that UI doesn't break (longer text)
- [ ] Check that icons/emojis remain visible
- [ ] Test all interactions (buttons, forms, etc.)
- [ ] Verify dynamic content translates properly

## Performance Tips

1. **Batch translations**: Use `useTranslatedTexts` with array of keys rather than multiple `useTranslatedText` calls
2. **Memoize expensive computations**: Use `useMemo` for filtered/sorted lists
3. **Avoid translating dynamic data**: Only translate static UI text, not user-generated content

## Common Pitfalls to Avoid

❌ **Don't do this:**
```typescript
// Translating in render function
<Text>{translateText('Hello')}</Text>
```

✅ **Do this instead:**
```typescript
// Pre-translate at component level
const trans = useTranslatedTexts(['Hello']);
<Text>{trans[0]}</Text>
```

❌ **Don't translate:**
- User names
- Task descriptions (unless system-generated)
- Chat messages
- User-generated content
- API data (translate on backend if needed)

✅ **Do translate:**
- UI labels
- Button text
- Form placeholders
- Error messages
- System messages
- Navigation items
- Screen headers

## Progress Tracking

Keep track of your translation progress:

```
Total Files: ~200
Completed: 2 (onboarding.tsx, welcome-tutorial.tsx)
Remaining: ~198

Priority 1 (Core User Flows): 15 files
Priority 2 (Secondary Features): 40 files
Priority 3 (Admin/Settings): 30 files
Priority 4 (Components): 50 files
```

## Need Help?

If you encounter issues:
1. Check existing translated files for patterns
2. Reference hooks/useTranslatedText.ts for hook usage
3. Check contexts/LanguageContext.tsx for language switching
4. Look at components/T.tsx for simple component usage

## Final Notes

- This is a marathon, not a sprint - translate systematically
- Test each screen after translating
- Keep translation keys descriptive and consistent
- Document any special cases or complex translations
- Update this checklist as you complete files
