# Phase 1 Testing Guide

## 🎯 How to Run Tests

### Option 1: In-App Testing (Recommended)
1. Navigate to `/test-phase-1` in your app
2. Tap "Run All Tests" button
3. Watch the automated tests execute
4. Review results in real-time

### Option 2: Direct Navigation
Add this to any screen:
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/test-phase-1');
```

### Option 3: Add to Navigation
Add a test button to your home screen or profile:
```typescript
<TouchableOpacity onPress={() => router.push('/test-phase-1')}>
  <Text>Run Phase 1 Tests</Text>
</TouchableOpacity>
```

## 📊 What Gets Tested

### 1. Context Awareness ✓
- AI knows current screen without asking
- User data is accessible
- Context updates work correctly

### 2. Message Persistence ✓
- Messages save to AsyncStorage
- Messages persist across restarts
- Message IDs are formatted correctly

### 3. Proactive Alerts ✓
- Alerts are throttled (1 per hour)
- Settings control alert behavior
- Haptic feedback works

### 4. Highlight System ✓
- UI elements can be highlighted
- Highlights auto-dismiss
- Duration timers work correctly

### 5. Settings Management ✓
- Settings persist to storage
- Settings updates apply immediately
- All settings toggles work

### 6. Backend Health ✓
- Backend status is monitored
- Health checks run periodically
- Fallback behavior works

## ✅ Success Criteria

All 6 tests must pass:
- ✓ Context Awareness
- ✓ Message Persistence  
- ✓ Proactive Alerts
- ✓ Highlight System
- ✓ Settings Management
- ✓ Backend Health

## 🚀 After Tests Pass

Once all tests show ✅, you're ready for:
- **Phase 2**: Visual Guidance System (UI highlighting)
- **Phase 3**: Tutorial System (step-by-step guidance)
- **Phase 4**: Voice Control (voice commands)
- **Phase 5**: Production Hardening (final polish)

## 🐛 If Tests Fail

Check the error messages for:
1. **Context errors**: Make sure UltimateAICoachContext is wrapped around app
2. **Storage errors**: Check AsyncStorage permissions
3. **Backend errors**: Verify backend URL in .env file
4. **Type errors**: Ensure all TypeScript types are correct

## 📱 Test Results Display

The test screen shows:
- Real-time progress bar
- Individual test status icons
- Step-by-step execution
- Detailed error messages
- Overall completion status

## 🎨 UI Features

- Dark theme optimized design
- Color-coded status indicators
- Animated test execution
- Auto-run mode available
- Manual test triggering

## Next Steps

After successful testing:
1. ✅ Verify all 6 tests pass
2. 📸 Take screenshots of results
3. 🚀 Ready for Phase 2 implementation
4. 📝 Review Phase 2 documentation

---

**Phase 1 Status**: Ready for Testing  
**Last Updated**: 2025-01-27
