# 🎯 AI SYSTEM - QUICK REFERENCE CARD

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** January 2025

---

## 🚀 QUICK ACCESS

### Import & Use
```typescript
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';
import { AIStatusIndicator } from '@/components/AIStatusIndicator';

function MyComponent() {
  const ai = useUltimateAICoach();
  
  return (
    <>
      <AIStatusIndicator />
      <Button onPress={() => ai.open()}>Ask AI</Button>
    </>
  );
}
```

---

## 📋 COMMON TASKS

### Send Message
```typescript
await ai.sendMessage("How do I earn more?");
```

### Highlight Element
```typescript
ai.highlightElement({
  targetId: 'accept-button',
  message: 'Tap here to accept quest',
  position: 'bottom'
}, 5000);
```

### Start Tutorial
```typescript
ai.startTutorial({
  title: 'How to Accept Quests',
  steps: [
    { message: 'Find a quest', targetId: 'quest-card' },
    { message: 'Tap to view details', targetId: 'view-button' },
    { message: 'Accept the quest', targetId: 'accept-button' }
  ],
  onComplete: () => console.log('Done!'),
});
```

### Check Backend Status
```typescript
if (ai.backendStatus.status === 'online') {
  // Full AI features
} else {
  // Quick response mode
}
```

### Update Context
```typescript
ai.updateContext({
  screen: 'task-detail',
  taskId: '123',
  action: 'viewing'
});
```

---

## 🎨 STATUS INDICATOR

### Colors
- 🟢 **Green** - AI Online (< 3s response)
- 🟡 **Yellow** - AI Slow (> 3s response)
- 🔴 **Red** - AI Offline (mock mode)
- 🔵 **Blue** - Checking...

### Usage
```typescript
<AIStatusIndicator style={{ margin: 10 }} />
```

---

## 🔔 PROACTIVE ALERTS

### Automatic Triggers
1. **Streak Warning** - 2h before expiry
2. **Level Up** - 80%+ progress to next level
3. **Perfect Match** - 95%+ task match score
4. **Earnings Boost** - 3+ high-pay tasks in favorites
5. **Badge Progress** - 80%+ badge completion

### Frequency
- Max 1 alert per hour
- Checks every 5 minutes
- Smart timing (won't spam)

---

## 🎯 API REFERENCE

### Properties
```typescript
ai.isOpen: boolean              // AI modal visible
ai.messages: AIMessage[]        // Chat history
ai.isLoading: boolean           // AI processing
ai.settings: AICoachSettings    // User preferences
ai.backendStatus: HealthStatus  // Backend health
ai.userPatterns: UserPattern    // User behavior
```

### Methods
```typescript
ai.open()                                    // Open AI chat
ai.close()                                   // Close AI chat
ai.sendMessage(text)                         // Send message
ai.clearHistory()                            // Clear chat history
ai.updateSettings(settings)                  // Update preferences
ai.updateContext(context)                    // Update AI context
ai.highlightElement(config, duration)        // Highlight UI
ai.dismissHighlight()                        // Remove highlight
ai.startTutorial(tutorial)                   // Start tutorial
ai.dismissTutorial()                         // End tutorial
ai.navigateWithFilters(screen, filters)      // Navigate with AI
```

---

## ⚙️ SETTINGS

### Available Options
```typescript
{
  voiceEnabled: boolean,              // Voice input on/off
  proactiveAlertsEnabled: boolean,    // Auto-alerts on/off
  learningMode: boolean,              // Pattern learning on/off
  hapticFeedback: boolean,            // Vibration on/off
  autoHighlight: boolean              // Auto-highlight on/off
}
```

### Update Settings
```typescript
await ai.updateSettings({
  proactiveAlertsEnabled: false  // Disable alerts
});
```

---

## 🐛 TROUBLESHOOTING

### AI Not Responding
**Check:** Backend status indicator  
**Fix:** Status turns red = offline mode activated (normal)

### Timeout After 8 Seconds
**Cause:** Backend slow/offline  
**Result:** Mock AI response (by design)  
**Action:** No action needed (automatic fallback)

### No Proactive Alerts
**Check:** Settings → `proactiveAlertsEnabled`  
**Check:** Settings → `learningMode`  
**Note:** Max 1 alert per hour

### Highlights Not Showing
**Check:** Element has correct `testID` prop  
**Check:** `autoHighlight` setting enabled  
**Fix:** Call `dismissHighlight()` to reset

---

## 📊 BACKEND STATUS

### Health Check
- **Frequency:** Every 5 minutes
- **Timeout:** 5 seconds
- **Retry:** Automatic on fail
- **Persistence:** Cached in AsyncStorage

### Status Types
```typescript
'online'    // < 3s response, full features
'degraded'  // > 3s response, working but slow  
'offline'   // No response, mock mode
'checking'  // Health check in progress
```

---

## 🎭 OFFLINE vs ONLINE MODE

### Offline Mode (Mock AI)
- ✅ Pattern analysis
- ✅ Proactive alerts
- ✅ Visual guidance
- ✅ Quick responses
- ✅ Settings & history
- ❌ Advanced NLP
- ❌ ML matching
- ❌ Personalized coaching

### Online Mode (Full AI)
- ✅ All offline features +
- ✅ Natural language understanding
- ✅ Smart task parsing
- ✅ ML-powered matching
- ✅ Personalized tips
- ✅ Learning from feedback

---

## 📈 PERFORMANCE

### Response Times
- **Online:** < 3s (target)
- **Degraded:** 3-8s
- **Timeout:** 8s → fallback
- **Offline:** Instant (mock)

### Resource Usage
- **Memory:** ~5MB
- **Storage:** ~1MB (history + cache)
- **Battery:** Negligible
- **Network:** Only when sending messages

---

## 🔐 PRIVACY

### Data Stored Locally
- Chat history (last 50 messages)
- User preferences
- Pattern analysis
- Backend health cache

### Data Sent to Backend (When Online)
- User message content
- User ID
- Context (level, XP, patterns)
- NOT sensitive data

---

## 📝 LOGS

### Console Output
```
[AICoach] Backend status: ✅ AI Online
[AICoach] Checking proactive alerts...
[AICoach] Running scheduled proactive check...
[HUSTLEAI] POST https://...
[HUSTLEAI] Response received
[Health] Checking backend...
```

### Enable Debug Mode
```typescript
// Add to utils/hustleAI.ts
console.log('[DEBUG]', ...);
```

---

## 🎯 BEST PRACTICES

### DO
- ✅ Check backend status before critical operations
- ✅ Use context updates to help AI understand state
- ✅ Show status indicator to users
- ✅ Handle both online and offline modes
- ✅ Test with backend down

### DON'T
- ❌ Assume backend is always available
- ❌ Block UI while waiting for AI
- ❌ Show raw errors to users
- ❌ Rely solely on AI for critical features
- ❌ Spam with too many context updates

---

## 📚 FULL DOCUMENTATION

- `AI_SYSTEM_COMPLETE_SUMMARY.md` - Overview
- `UNIVERSAL_AI_ARCHITECTURE.md` - Architecture
- `AI_INTEGRATION_STATUS_FINAL.md` - Complete status
- `PHASE_5_PRODUCTION_HARDENING.md` - Reliability

---

## 🚨 SUPPORT

### Common Questions

**Q: Is backend required?**  
A: No, app works 100% without backend in mock mode.

**Q: How do I improve AI responses?**  
A: Ensure backend is running at correct URL in `.env`

**Q: Can I disable AI?**  
A: Yes, but proactive features are valuable. Consider keeping enabled.

**Q: Where is data stored?**  
A: AsyncStorage locally. Backend only when online.

---

**Status: ✅ READY**  
**Support: Check full docs for details**
