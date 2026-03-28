# 🚀 PHASE 4 QUICK START GUIDE

Get Phase 4 (Voice Mode & Action Execution) up and running in minutes!

---

## 📦 WHAT'S INCLUDED

✅ **VoiceAIControl.tsx** - Full voice input component  
✅ **AIActionConfirmation.tsx** - Action confirmation dialogs  
✅ **PHASE_4_COMPLETE.md** - Comprehensive documentation

---

## ⚡ 5-MINUTE INTEGRATION

### Step 1: Add Voice Mode to UltimateAICoach

```typescript
// In components/UltimateAICoach.tsx
import { VoiceAIControl } from '@/components/VoiceAIControl';

export function UltimateAICoach() {
  const {
    isOpen,
    settings,
    sendMessage,
  } = useUltimateAICoach();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoiceInput = async (transcript: string) => {
    setIsListening(false);
    await sendMessage(transcript);
  };

  return (
    <Modal visible={isOpen}>
      {/* Existing chat UI */}
      
      {/* Add Voice Control at the bottom */}
      <VoiceAIControl
        isOpen={isOpen}
        onVoiceInput={handleVoiceInput}
        onSpeakResponse={(text) => {
          // Optional: Implement TTS here
          setIsSpeaking(true);
          // After speaking: setIsSpeaking(false);
        }}
        isListening={isListening}
        isSpeaking={isSpeaking}
        settings={{
          voiceEnabled: settings.voiceEnabled,
          hapticFeedback: settings.hapticFeedback,
        }}
      />
    </Modal>
  );
}
```

### Step 2: Add Action Confirmation to Context

```typescript
// In contexts/UltimateAICoachContext.tsx
import { AIActionRequest } from '@/components/AIActionConfirmation';

export const [UltimateAICoachProvider, useUltimateAICoach] = createContextHook(() => {
  // ... existing code ...

  const [pendingAction, setPendingAction] = useState<AIActionRequest | null>(null);

  const proposeAction = useCallback((action: AIActionRequest) => {
    setPendingAction(action);
  }, []);

  const executeAction = useCallback(async (action: AIActionRequest) => {
    try {
      switch (action.type) {
        case 'accept-task':
          // TODO: Wire up actual task acceptance
          console.log('Accepting task:', action.data);
          break;
        case 'send-message':
          // TODO: Wire up messaging
          console.log('Sending message:', action.data);
          break;
        case 'navigate':
          // TODO: Wire up navigation
          router.push(action.data.screen);
          break;
        case 'create-offer':
          // TODO: Wire up offer creation
          console.log('Creating offer:', action.data);
          break;
        case 'bundle-tasks':
          // TODO: Wire up bundling
          console.log('Bundling tasks:', action.data);
          break;
      }
    } catch (error) {
      console.error('[AI] Action execution failed:', error);
      throw error;
    }
  }, [router]);

  return {
    // ... existing exports ...
    pendingAction,
    proposeAction,
    executeAction,
  };
});
```

### Step 3: Add Action Confirmation Modal to UI

```typescript
// In components/UltimateAICoach.tsx
import { AIActionConfirmation } from '@/components/AIActionConfirmation';

export function UltimateAICoach() {
  const {
    pendingAction,
    executeAction,
    proposeAction,
  } = useUltimateAICoach();

  return (
    <>
      {/* Existing chat UI */}

      {/* Add Action Confirmation Modal */}
      <AIActionConfirmation
        action={pendingAction}
        onConfirm={executeAction}
        onCancel={() => proposeAction(null)}
        onEdit={(action) => {
          // Optional: Open edit modal
          console.log('Edit action:', action);
        }}
      />
    </>
  );
}
```

### Step 4: Enable Voice in Settings

```typescript
// In app/settings.tsx or AI settings screen
<View>
  <Text>Voice Mode</Text>
  <Switch
    value={settings.voiceEnabled}
    onValueChange={(enabled) => {
      updateSettings({ ...settings, voiceEnabled: enabled });
    }}
  />
</View>
```

### Step 5: Test It!

```typescript
// Test voice input
// 1. Enable voice mode in settings
// 2. Open AI chat
// 3. Tap microphone button
// 4. Speak: "Show me tasks near me"
// 5. AI should transcribe and respond

// Test action confirmation
// In your AI message handler, propose an action:
proposeAction({
  id: 'test-action',
  type: 'accept-task',
  title: 'Accept Delivery Quest',
  description: 'Deliver groceries to 123 Oak St',
  data: { taskId: '123' },
  risk: 'low',
  benefits: ['$95 payment', '0.8 miles away'],
  warnings: ['Must complete within 2 hours'],
});
```

---

## 🎯 COMMON USE CASES

### Use Case 1: Voice-Activated Task Search

```typescript
// User says: "Find me delivery tasks under $50"
// In AI message handler:

const handleVoiceCommand = async (transcript: string) => {
  await sendMessage(transcript);
  
  // AI analyzes intent
  if (containsIntent(transcript, 'find tasks')) {
    const filters = extractFilters(transcript);
    
    // Navigate to tasks with filters
    router.push({
      pathname: '/tasks',
      params: filters,
    });
  }
};
```

### Use Case 2: Quick Task Acceptance

```typescript
// When AI recommends a task
const recommendTask = (task: Task) => {
  proposeAction({
    id: `accept-${task.id}`,
    type: 'accept-task',
    title: 'Accept This Quest?',
    description: task.title,
    data: { taskId: task.id },
    risk: calculateRisk(task),
    benefits: [
      `💰 $${task.payAmount}`,
      `📍 ${task.distance}mi away`,
      `⭐ ${task.posterRating}⭐ poster`,
    ],
    warnings: task.warnings,
    preview: <TaskCard task={task} />,
  });
};
```

### Use Case 3: Smart Bundle Suggestion

```typescript
// AI detects 3 nearby tasks
const suggestBundle = (tasks: Task[]) => {
  const totalPay = tasks.reduce((sum, t) => sum + t.payAmount, 0);
  const totalDistance = calculateRouteDistance(tasks);
  const efficiencyBonus = calculateBonus(tasks.length);

  proposeAction({
    id: 'bundle-tasks',
    type: 'bundle-tasks',
    title: 'Smart Bundle Opportunity',
    description: `Complete ${tasks.length} tasks in one trip`,
    data: { taskIds: tasks.map(t => t.id) },
    risk: 'low',
    benefits: [
      `💰 $${totalPay} total earnings`,
      `📍 ${totalDistance}mi total distance`,
      `⚡ +${efficiencyBonus}% efficiency bonus`,
      `⏱️ Save ${estimateTimeSaved(tasks)} minutes`,
    ],
    preview: <BundleRouteMap tasks={tasks} />,
  });
};
```

---

## 🔧 TROUBLESHOOTING

### Voice Not Working?

**Web:**
- Check microphone permissions in browser
- Ensure HTTPS (required for MediaRecorder)
- Try different browser (Chrome/Edge recommended)

**Native:**
- Check app permissions in Settings
- Restart app after granting permissions
- Check expo-av installation: `bun expo install expo-av`

### Action Confirmation Not Showing?

- Verify `pendingAction` state is set
- Check that `AIActionConfirmation` is rendered
- Ensure `action` prop is not null
- Check modal visibility in React DevTools

### TypeScript Errors?

- Make sure COLORS is imported from `@/constants/designTokens`
- Verify AIActionRequest interface is exported
- Check that all required props are passed

---

## 📱 DEMO SCREENS TO BUILD

To showcase Phase 4, create these demo screens:

### 1. Voice Demo Screen (`app/voice-demo.tsx`)
```typescript
export default function VoiceDemoScreen() {
  const [transcript, setTranscript] = useState('');
  
  return (
    <View>
      <Text>Say something!</Text>
      <VoiceAIControl
        isOpen={true}
        onVoiceInput={(text) => setTranscript(text)}
        onSpeakResponse={() => {}}
        isListening={false}
        isSpeaking={false}
        settings={{ voiceEnabled: true, hapticFeedback: true }}
      />
      {transcript && <Text>You said: {transcript}</Text>}
    </View>
  );
}
```

### 2. Action Demo Screen (`app/action-demo.tsx`)
```typescript
export default function ActionDemoScreen() {
  const [action, setAction] = useState<AIActionRequest | null>(null);

  const showExampleAction = () => {
    setAction({
      id: 'demo',
      type: 'accept-task',
      title: 'Demo Action',
      description: 'This is a test action',
      data: {},
      risk: 'low',
      benefits: ['Example benefit 1', 'Example benefit 2'],
    });
  };

  return (
    <View>
      <Button title="Show Action" onPress={showExampleAction} />
      <AIActionConfirmation
        action={action}
        onConfirm={async () => {
          console.log('Confirmed!');
        }}
        onCancel={() => setAction(null)}
      />
    </View>
  );
}
```

---

## ✅ INTEGRATION CHECKLIST

- [ ] Add VoiceAIControl to UltimateAICoach component
- [ ] Add voice state (isListening, isSpeaking) to context
- [ ] Add handleVoiceInput callback
- [ ] Add pendingAction state to context
- [ ] Add proposeAction and executeAction methods
- [ ] Add AIActionConfirmation to UI
- [ ] Wire up action handlers (accept, message, navigate, etc.)
- [ ] Add voice toggle to settings
- [ ] Test voice input on web
- [ ] Test voice input on mobile
- [ ] Test action confirmations
- [ ] Test all 6 action types
- [ ] Add analytics tracking
- [ ] Add error tracking

---

## 🚀 WHAT'S NEXT

After basic integration, enhance with:

1. **Text-to-Speech**: Speak AI responses
2. **Pattern Analysis**: Learn user behavior
3. **Proactive Suggestions**: "You usually work Mondays..."
4. **Smart Bundling**: Auto-detect route opportunities
5. **Negotiation AI**: Suggest counter-offers
6. **Voice Shortcuts**: "Hey HustleXP, show my stats"

---

## 📚 RESOURCES

- **PHASE_4_COMPLETE.md**: Full documentation
- **UNIVERSAL_AI_ARCHITECTURE.md**: AI system overview
- **VoiceAIControl.tsx**: Voice component source
- **AIActionConfirmation.tsx**: Action dialog source

---

**Need Help?** Check the comprehensive docs or test with the demo screens!

Happy building! 🎉
