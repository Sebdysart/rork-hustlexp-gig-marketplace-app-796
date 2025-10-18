# Personalized Onboarding for AI Task Matching

## Overview
Enhance the onboarding flow to collect user preferences that enable the AI to find tasks users are more likely to accept.

## Current State
The onboarding currently collects:
- Name, email, password
- Mode selection (Everyday Hustler, Tradesman Pro, Business Poster)
- Trade categories (for tradesmen only)
- AI nudges opt-in

## Recommended Enhancements

### Additional Steps for Workers (Everyday & Tradesmen)

#### Step 4: Task Preferences
**Question: "What tasks interest you?"**
- **UI**: Grid of category chips (multi-select)
- **Categories**: Delivery, Cleaning, Moving, Handyman, Photography, Pet Care, Tech Support, Tutoring, Landscaping, Assembly, Painting, Errands, etc.
- **Data Collected**: `preferredCategories: string[]`
- **AI Use**: Filter and prioritize tasks in these categories

#### Step 5: Price & Distance
**Question: "What's your ideal task profile?"**
- **Price Range Slider**: Min/max ($10-$200+)
  - Default: $20-$100
  - Data: `priceRange: { min: number, max: number }`
- **Max Travel Distance**: Quick select buttons
  - Options: 5 mi, 10 mi, 15 mi (default), 25 mi, 50 mi
  - Data: `maxDistance: number`
- **AI Use**: Only show tasks within price and distance preferences

#### Step 6: Availability
**Question: "When can you hustle?"**
- **Work Days**: Day chips (Mon-Sun, multi-select)
  - Data: `workDays: string[]`
- **Typical Hours**: Time range selector
  - Options: "Mornings (6AM-12PM)", "Afternoons (12PM-6PM)", "Evenings (6PM-12AM)", "Flexible"
  - Data: `workHours: { start: number, end: number }` or `flexible: boolean`
- **Urgency Preference**: 
  - "Flexible - I like planning ahead"
  - "Balanced - Mix of planned & urgent"
  - "Love Rush Jobs - Last-minute is my style 🔥"
  - Data: `urgencyPreference: 'flexible' | 'balanced' | 'urgent'`
- **AI Use**: Prioritize tasks that match user's availability patterns

## Implementation

### 1. Update AppContext
```typescript
interface UserPreferences {
  preferredCategories: string[];
  priceRange: { min: number; max: number };
  maxDistance: number;
  workDays: string[];
  workHours: { start: number; end: number } | { flexible: true };
  urgencyPreference: 'flexible' | 'balanced' | 'urgent';
}

// Add to User type
interface User {
  // ... existing fields
  preferences?: UserPreferences;
}

// Update completeOnboarding signature
completeOnboarding(
  name: string,
  role: UserRole,
  location: Location,
  email?: string,
  password?: string,
  mode?: string,
  trades?: TradeCategory[],
  preferences?: UserPreferences // NEW
): void
```

### 2. Store Preferences
In `contexts/AppContext.tsx`:
```typescript
const completeOnboarding = (..., preferences?: UserPreferences) => {
  const newUser: User = {
    // ... existing user fields
    preferences: preferences || {
      preferredCategories: [],
      priceRange: { min: 20, max: 100 },
      maxDistance: 15,
      workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workHours: { start: 9, end: 17 },
      urgencyPreference: 'balanced',
    },
  };
  
  // Save to AsyncStorage for backend sync
  AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
};
```

### 3. AI Profile Context Enhancement
Update `contexts/AIProfileContext.tsx` to include preferences:
```typescript
const fetchProfile = async (userId: string) => {
  // Fetch AI profile from backend
  const profile = await aiFeedbackService.fetchAIProfile(userId);
  
  // Merge with user's explicit preferences
  const user = await AsyncStorage.getItem('current_user');
  const userData = JSON.parse(user);
  
  return {
    ...profile,
    userPreferences: userData.preferences, // Explicit preferences
  };
};
```

### 4. Task Filtering Logic
Update `utils/aiMatching.ts`:
```typescript
export function filterTasksByPreferences(
  tasks: Task[],
  preferences: UserPreferences
): Task[] {
  return tasks.filter(task => {
    // Category match
    if (preferences.preferredCategories.length > 0) {
      if (!preferences.preferredCategories.includes(task.category)) {
        return false;
      }
    }
    
    // Price range
    const taskPrice = task.price?.max || task.payAmount || 0;
    if (taskPrice < preferences.priceRange.min || taskPrice > preferences.priceRange.max) {
      return false;
    }
    
    // Distance (calculate from user location)
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      task.location.lat,
      task.location.lng
    );
    if (distance > preferences.maxDistance) {
      return false;
    }
    
    // Urgency match
    if (preferences.urgencyPreference === 'urgent' && task.urgency !== 'high') {
      return false; // User wants rush jobs only
    }
    if (preferences.urgencyPreference === 'flexible' && task.urgency === 'high') {
      return false; // User avoids rush jobs
    }
    
    return true;
  });
}
```

### 5. Backend Integration
When onboarding completes, send preferences to backend:
```typescript
// In completeOnboarding
if (preferences) {
  fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
}
```

Backend should store and use these preferences for:
- **Task Recommendations**: AI chat should filter based on preferences
- **Push Notifications**: Only notify about relevant tasks
- **Smart Matching**: Prioritize matches that align with preferences
- **Learning**: Track when users accept/reject tasks outside preferences to adjust

## AI Chat Integration

### When user asks "show me tasks nearby"
Backend AI should:
1. Fetch user's explicit preferences
2. Query tasks matching those preferences
3. Apply AI learning layer on top (based on acceptance history)
4. Return filtered, personalized task list

### Example Response Structure
```json
{
  "response": "Found 8 tasks matching your preferences (Delivery, Moving within 15 miles, $20-$100):",
  "actions": [{
    "type": "show_tasks",
    "data": {
      "tasks": [...],
      "filteredBy": {
        "categories": ["Delivery", "Moving"],
        "priceRange": { "min": 20, "max": 100 },
        "maxDistance": 15,
        "matchReason": "Based on your preferences and past activity"
      }
    }
  }]
}
```

## User Settings
Add "Preferences" section in settings where users can update:
- Task categories
- Price range
- Max distance
- Availability schedule
- Urgency style

This allows users to adjust over time as their needs change.

## Benefits

### For Users
- ✅ **See relevant tasks immediately** - No scrolling through irrelevant gigs
- ✅ **Save time** - AI pre-filters based on what you like
- ✅ **Better matches** - Tasks align with your schedule and style
- ✅ **Higher acceptance rate** - More likely to accept suggested tasks

### For Platform
- ✅ **Reduced friction** - Users find tasks faster
- ✅ **Higher engagement** - Personalized experience keeps users active
- ✅ **Better AI training** - Explicit preferences + implicit behavior = smarter AI
- ✅ **Fewer failed matches** - Tasks go to workers who actually want them

### For AI Engine
- ✅ **Baseline preferences** - Don't have to guess from zero data
- ✅ **Faster learning** - Combine explicit + implicit signals
- ✅ **Better recommendations** - Understand user intent beyond just history
- ✅ **Explain decisions** - "This task matches your Delivery preference and $50 sweet spot"

## Implementation Priority

### Phase 1: Core Preferences (MVP)
1. Add Steps 4-6 to onboarding
2. Store preferences in AppContext + AsyncStorage
3. Basic task filtering in home screen
4. Send to backend on signup

### Phase 2: AI Integration
1. Backend reads preferences for AI chat queries
2. AI response includes "filtered by preferences" context
3. Push notifications respect preferences

### Phase 3: Settings & Refinement
1. Add preferences editor in settings
2. Show insights: "You accepted 15/20 Delivery tasks - want to adjust preferences?"
3. A/B test: Show preference-filtered vs all tasks

## Technical Notes

- **Privacy**: Make it clear preferences are used for personalization, not sold
- **Defaults**: Provide sensible defaults if users skip preference steps
- **Flexibility**: Don't be too restrictive - show some out-of-preference tasks
- **Updates**: Preferences should be editable any time in settings
- **Backend**: Store preferences in user profile table with timestamp
- **Learning**: Track when users accept tasks outside preferences (signals evolving interests)

## Next Steps

1. **Add preference collection UI** to onboarding (Steps 4-6)
2. **Store in user object** and sync to backend
3. **Update AI chat backend** to filter by preferences
4. **Add preference editor** to settings screen
5. **Track metrics**: 
   - % of tasks shown that match preferences
   - Acceptance rate for matched vs unmatched tasks
   - User satisfaction with personalization

---

**Bottom Line**: Personalized onboarding helps AI find tasks users actually want, reducing the "show me tasks nearby → asks again → infinite loop" problem by understanding user preferences from day one.
