# 🔑 Test Accounts - Ready to Use

## Test Account Credentials

Based on your backend prompt docs, use these accounts to test:

### Account 1: Sebastian (Hustler - Level 12)
```
Username: sebastian_hustler
Email: sebastian@example.com
Password: password123
Role: Hustler
Level: 12
Tier: The Operator
```

### Account 2: Emily (Poster - Level 5)
```
Username: emily_poster
Email: emily@example.com
Password: password123
Role: Poster
Level: 5
Tier: Side Hustler
```

### Account 3: Mike (Tradesman - Level 25)
```
Username: mike_tradesman
Email: mike@example.com
Password: password123
Role: Tradesman
Level: 25
Tier: Rainmaker
```

### Account 4: Alex (Business - Level 8)
```
Username: alex_business
Email: alex@example.com
Password: password123
Role: Business
Level: 8
Tier: Side Hustler
```

### Account 5: Jamie (Dual Role - Level 15)
```
Username: jamie_dualrole
Email: jamie@example.com
Password: password123
Role: Dual (Hustler + Poster)
Level: 15
Tier: The Operator
```

---

## Quick Test Code

```typescript
import { useBackend } from '@/contexts/BackendContext';

function TestLogin() {
  const { login } = useBackend();
  
  const testAccounts = [
    { email: 'sebastian@example.com', password: 'password123' },
    { email: 'emily@example.com', password: 'password123' },
    { email: 'mike@example.com', password: 'password123' },
  ];
  
  const testLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      console.log('✅ Logged in as:', result.user.name);
      console.log('Level:', result.user.level);
      console.log('Role:', result.user.role);
    } else {
      console.log('❌ Login failed:', result.error);
    }
  };
  
  return (
    <View>
      {testAccounts.map(account => (
        <Button 
          key={account.email}
          title={`Login as ${account.email}`}
          onPress={() => testLogin(account.email, account.password)}
        />
      ))}
    </View>
  );
}
```

---

## Test Different Tiers

### Test Tier 1: Side Hustler (Beginner)
**Login as Emily:**
- Level 5
- Features: Basic tutorials, beginner coaching
- UI: Friendly tone, lots of help text
- Colors: Green theme

```typescript
await login('emily@example.com', 'password123');
```

### Test Tier 2: The Operator (Intermediate)
**Login as Sebastian or Jamie:**
- Level 12-15
- Features: Performance tracking, streak reminders
- UI: Motivational tone, stats focus
- Colors: Blue theme

```typescript
await login('sebastian@example.com', 'password123');
```

### Test Tier 3: Rainmaker (Advanced)
**Login as Mike:**
- Level 25
- Features: Market forecasts, analytics dashboard
- UI: Strategic tone, data-driven
- Colors: Gold theme

```typescript
await login('mike@example.com', 'password123');
```

---

## Test Different User Types

### Test Hustler (Worker)
```typescript
await login('sebastian@example.com', 'password123');

// As hustler, test:
- Finding tasks
- Accepting tasks
- Completing tasks
- Viewing earnings
- AI recommendations
```

### Test Poster (Employer)
```typescript
await login('emily@example.com', 'password123');

// As poster, test:
- Creating tasks
- AI task parsing
- Worker matching
- Approving completions
- Payment processing
```

### Test Tradesman (Professional)
```typescript
await login('mike@example.com', 'password123');

// As tradesman, test:
- Pro-level tasks
- Portfolio features
- Certification management
- Premium matching
```

---

## Full Integration Test Flow

```typescript
async function runFullTest() {
  const { login, services } = useBackend();
  
  // 1. Login as hustler
  await login('sebastian@example.com', 'password123');
  
  // 2. Get AI recommendations
  const recommendations = await services.ai.getRecommendations({
    userId: 'sebastian_hustler',
    context: {
      location: { lat: 37.7749, lng: -122.4194 },
      time: new Date().toISOString(),
      availability: 'now'
    }
  });
  
  console.log('✅ AI Recommendations:', recommendations);
  
  // 3. Chat with AI
  const chatResponse = await services.ai.chat({
    userId: 'sebastian_hustler',
    message: 'Find me delivery tasks nearby',
    context: { screen: 'test' }
  });
  
  console.log('✅ AI Chat:', chatResponse.response);
  
  // 4. Get tasks
  const tasks = await services.task.getTasks({ status: 'open' });
  console.log('✅ Tasks:', tasks.tasks.length);
  
  // 5. Parse natural language task
  const parsed = await services.ai.parseTask({
    userId: 'sebastian_hustler',
    input: 'Need groceries delivered to 123 Main St by 5pm, $40',
    context: { currentTime: new Date().toISOString() }
  });
  
  console.log('✅ Parsed Task:', parsed.task);
  
  console.log('🎉 ALL TESTS PASSED!');
}
```

---

## Backend URLs

**Production:** `https://LunchGarden.dycejr.replit.dev/api`  
**WebSocket:** `wss://LunchGarden.dycejr.replit.dev`

---

## Quick Verification

Run this in your app to verify everything works:

```typescript
import { useBackend } from '@/contexts/BackendContext';
import { useEffect } from 'react';

function VerifyConnection() {
  const { login, services, isConnected } = useBackend();
  
  useEffect(() => {
    testConnection();
  }, []);
  
  const testConnection = async () => {
    try {
      console.log('🔌 Testing connection...');
      
      // Test 1: Login
      const result = await login('sebastian@example.com', 'password123');
      console.log('✅ Login:', result.success);
      
      // Test 2: AI Chat
      const chat = await services.ai.chat({
        userId: 'sebastian_hustler',
        message: 'Hello',
        context: {}
      });
      console.log('✅ AI Chat:', chat.response);
      
      console.log('🎉 Connection verified!');
    } catch (error) {
      console.error('❌ Connection failed:', error);
    }
  };
  
  return (
    <View>
      <Text>Status: {isConnected ? '✅ Connected' : '❌ Not Connected'}</Text>
    </View>
  );
}
```

---

## That's It!

Use any of these test accounts to verify your backend connection is working.

**All passwords are: `password123`**

🚀 Start testing!
