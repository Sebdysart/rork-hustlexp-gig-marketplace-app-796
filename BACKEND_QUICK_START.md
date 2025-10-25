# ⚡ Backend Integration Quick Start

## 🚀 5-Minute Setup

### Step 1: Configure Backend URL (30 seconds)

Create `.env` in project root:
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
EXPO_PUBLIC_WS_URL=wss://your-backend-url.com
```

### Step 2: Use in Any Component (2 minutes)

```typescript
import { useBackend } from '@/contexts/BackendContext';

function MyComponent() {
  const { services, isConnected } = useBackend();
  
  // ✅ You're ready to use all backend features!
  
  const loadTasks = async () => {
    const tasks = await services.task.getTasks();
    console.log('Got tasks:', tasks);
  };
  
  return <Button onPress={loadTasks} title="Load Tasks" />;
}
```

## 📋 Cheat Sheet

### Authentication
```typescript
const { login, logout, signup } = useBackend();

await login('email@example.com', 'password');
await signup({ name, email, password, role, location });
await logout();
```

### Tasks
```typescript
const { services } = useBackend();

// Get all tasks
const tasks = await services.task.getTasks();

// Create task
await services.task.createTask({
  title: "Fix sink",
  category: "plumbing",
  payAmount: 100,
  xpReward: 200,
  location: { lat, lng, address }
});

// Accept & complete
await services.task.acceptTask(taskId);
await services.task.submitCompletion(taskId, photos, notes);
```

### Chat (Real-time)
```typescript
// Send message
await services.chat.sendMessage({
  taskId: 'task-123',
  text: 'Hello!',
  recipientId: 'user-456'
});

// Subscribe to messages
const unsubscribe = services.chat.subscribeToMessages((msg) => {
  console.log('New message:', msg.text);
});
```

### Payments
```typescript
// Create payment
const intent = await services.payment.createPaymentIntent({
  taskId: 'task-123',
  amount: 100
});

// Get wallet
const wallet = await services.payment.getWallet();
console.log('Balance:', wallet.balance);

// Request payout
await services.payment.requestPayout(250);
```

### AI Features
```typescript
// Quality verification
const result = await services.ai.verifyQuality({
  taskId,
  images: ['photo1.jpg', 'photo2.jpg'],
  description: 'Completed repair'
});

// AI Coach
const session = await services.ai.startCoachingSession(taskId);
const guidance = await services.ai.getGuidance(sessionId, { completedSteps: 2 });

// Recommendations
const recs = await services.ai.getRecommendations({
  categories: ['plumbing'],
  maxDistance: 10
});

// Fraud detection
const risk = await services.ai.analyzeFraudRisk(userId);
```

### Analytics
```typescript
// Leaderboard
const leaderboard = await services.analytics.getLeaderboard('xp', 100);

// Performance
const dashboard = await services.analytics.getPerformanceDashboard();

// Market forecasts
const forecasts = await services.analytics.getMarketForecasts();
```

### Disputes
```typescript
// Create dispute
const dispute = await services.dispute.createDispute({
  taskId,
  reason: 'quality_issues',
  description: 'Not completed as agreed',
  evidence: ['photo1.jpg']
});

// Respond
await services.dispute.respondToDispute(disputeId, {
  statement: 'I completed the work',
  evidence: ['proof1.jpg']
});
```

## 🎯 Common Patterns

### Pattern 1: Loading with Backend/Mock Fallback
```typescript
const { services, isConnected } = useBackend();

const loadData = async () => {
  if (isConnected) {
    return await services.task.getTasks();
  } else {
    return MOCK_TASKS; // Fallback
  }
};
```

### Pattern 2: Error Handling
```typescript
try {
  await services.task.createTask(data);
} catch (error: any) {
  if (error.status === 401) {
    // Redirect to login
  } else {
    alert(error.message);
  }
}
```

### Pattern 3: Real-time Updates
```typescript
useEffect(() => {
  const unsubscribe = services.chat.subscribeToMessages((msg) => {
    setMessages(prev => [...prev, msg]);
  });
  
  return () => unsubscribe();
}, []);
```

### Pattern 4: Offline Support
```typescript
const { isConnected } = useBackend();

if (isConnected) {
  const data = await services.task.getTasks();
  await AsyncStorage.setItem('cache', JSON.stringify(data));
} else {
  const cache = await AsyncStorage.getItem('cache');
  const data = JSON.parse(cache || '[]');
}
```

## 🔍 Status Check

```typescript
const { isConnected, isAuthenticated, wsConnected } = useBackend();

console.log({
  api: isConnected ? '✅' : '❌',
  auth: isAuthenticated ? '✅' : '❌', 
  websocket: wsConnected ? '✅' : '❌'
});
```

## 🧪 Quick Test

```typescript
// Test all systems
const testBackend = async () => {
  const { services } = useBackend();
  
  const tasks = await services.task.getTasks();
  console.log('✅ Tasks API');
  
  const wallet = await services.payment.getWallet();
  console.log('✅ Payments API');
  
  const health = await services.ai.getPlatformHealth();
  console.log('✅ AI API');
  
  console.log('🎉 All systems operational!');
};
```

## 📦 All Available Services

```typescript
const { services } = useBackend();

services.auth       // Authentication
services.task       // Task management
services.chat       // Real-time chat
services.payment    // Stripe & escrow
services.ai         // All AI features
services.dispute    // Dispute resolution
services.analytics  // Leaderboards & stats
```

## 🎨 Integration Examples

### Example 1: Task Creation Screen
```typescript
import { useBackend } from '@/contexts/BackendContext';

export default function PostTask() {
  const { services } = useBackend();
  const [title, setTitle] = useState('');
  
  const handleSubmit = async () => {
    await services.task.createTask({
      title,
      description: '...',
      category: 'cleaning',
      payAmount: 50,
      xpReward: 100,
      location: { lat: 40, lng: -74, address: 'NYC' }
    });
    
    alert('Task posted!');
  };
  
  return (
    <View>
      <TextInput value={title} onChangeText={setTitle} />
      <Button onPress={handleSubmit} title="Post" />
    </View>
  );
}
```

### Example 2: Real-Time Chat
```typescript
import { useBackend } from '@/contexts/BackendContext';

export default function Chat({ taskId }: { taskId: string }) {
  const { services } = useBackend();
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Load history
    services.chat.getTaskMessages(taskId).then(setMessages);
    
    // Subscribe to new messages
    const unsubscribe = services.chat.subscribeToMessages((msg) => {
      if (msg.taskId === taskId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    
    return unsubscribe;
  }, [taskId]);
  
  const sendMessage = async (text: string) => {
    await services.chat.sendMessage({
      taskId,
      text,
      recipientId: 'other-user'
    });
  };
  
  return <View>{/* Render messages */}</View>;
}
```

### Example 3: AI Quality Verification
```typescript
import { useBackend } from '@/contexts/BackendContext';

export default function VerifyTask({ taskId }: { taskId: string }) {
  const { services } = useBackend();
  
  const verifyCompletion = async (photos: string[]) => {
    const result = await services.ai.verifyQuality({
      taskId,
      images: photos,
      description: 'Plumbing repair completed'
    });
    
    if (result.approved) {
      alert(`✅ Quality Score: ${result.score}%\n${result.feedback}`);
      await services.task.approveCompletion(taskId);
    } else {
      alert(`❌ Issues found:\n${result.issues.join('\n')}`);
    }
  };
  
  return <Button onPress={() => verifyCompletion(photos)} title="Verify" />;
}
```

## 🚨 Troubleshooting

**Problem:** Connection fails
```typescript
// Check your .env file
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);

// Test connection
const { isConnected } = useBackend();
console.log('Connected:', isConnected);
```

**Problem:** 401 Unauthorized
```typescript
// User needs to login again
const { logout } = useBackend();
await logout();
router.push('/sign-in');
```

**Problem:** WebSocket disconnects
```typescript
// It will auto-reconnect!
// Check status:
const { wsConnected } = useBackend();
console.log('WS Status:', wsConnected);
```

## 🎯 That's It!

You're now connected to:
- ✅ 48 API endpoints
- ✅ Real-time WebSocket
- ✅ 14 GPT-4o AI features
- ✅ Stripe payments
- ✅ Fraud detection
- ✅ Analytics & leaderboards
- ✅ Dispute resolution

**Start building! 🚀**
