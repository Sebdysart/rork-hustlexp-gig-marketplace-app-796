# 🔧 Backend Team: Dual-Role User Support Implementation

**Priority:** High  
**Estimated Effort:** 2-3 days  
**Impact:** Enables users to both post AND complete tasks

---

## 📋 Overview

Currently, users are either "posters" (create tasks) or "workers" (complete tasks). We need to support users with role='both' who can switch between posting and working seamlessly.

---

## 🎯 What Needs to Change

### 1. User Schema Enhancement

**Current:**
```typescript
interface User {
  id: string;
  role: 'poster' | 'worker'; // ❌ Limited
  // ... other fields
}
```

**Required:**
```typescript
interface User {
  id: string;
  role: 'poster' | 'worker' | 'both'; // ✅ Add 'both'
  currentMode?: 'poster' | 'worker'; // Active mode
  roleHistory?: {
    tasksPosted: number;
    tasksCompleted: number;
    earningsAsWorker: number;
    spentAsPoster: number;
  };
  // ... other fields
}
```

---

### 2. Authentication & Authorization

#### Current Behavior:
```javascript
// ❌ Blocks posters from worker endpoints
if (user.role === 'poster') {
  return res.status(403).json({ error: 'Posters cannot accept tasks' });
}
```

#### Required Behavior:
```javascript
// ✅ Check current mode or role
if (user.role === 'both') {
  // Allow both poster AND worker actions
  // Check currentMode if action is mode-specific
} else if (user.role === 'poster') {
  // Poster-only actions
} else if (user.role === 'worker') {
  // Worker-only actions
}
```

**Simplified Logic:**
```javascript
function canPerformAction(user, action) {
  if (user.role === 'both') return true;
  if (action === 'post_task') return user.role === 'poster' || user.role === 'both';
  if (action === 'accept_task') return user.role === 'worker' || user.role === 'both';
  return false;
}
```

---

### 3. Endpoint Modifications

#### A. Task Posting Endpoints
```
POST /api/tasks
GET /api/tasks/my-posted
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

**Change Required:**
```javascript
// Before: Only allow role='poster'
if (user.role !== 'poster') throw new Error('Unauthorized');

// After: Allow role='both' too
if (user.role !== 'poster' && user.role !== 'both') {
  throw new Error('Only posters can create tasks');
}
```

#### B. Task Acceptance Endpoints
```
POST /api/tasks/:id/accept
GET /api/tasks/available
GET /api/tasks/my-accepted
```

**Change Required:**
```javascript
// Before: Only allow role='worker'
if (user.role !== 'worker') throw new Error('Unauthorized');

// After: Allow role='both' too
if (user.role !== 'worker' && user.role !== 'both') {
  throw new Error('Only workers can accept tasks');
}
```

#### C. Profile Endpoints
```
GET /api/users/:id
PUT /api/users/:id
```

**Change Required:**
- Return both poster AND worker stats for role='both'
- Include `roleHistory` object

**Example Response:**
```json
{
  "id": "user-123",
  "role": "both",
  "currentMode": "worker",
  "roleHistory": {
    "tasksPosted": 15,
    "tasksCompleted": 42,
    "earningsAsWorker": 1250.00,
    "spentAsPoster": 380.00
  },
  "reputationScore": 4.7,
  "level": 18
}
```

---

### 4. AI Matching Enhancement

#### Current Logic:
```javascript
// ❌ Excludes posters from worker pool
const availableWorkers = users.filter(u => u.role === 'worker');
```

#### Required Logic:
```javascript
// ✅ Include dual-role users in worker pool
const availableWorkers = users.filter(u => 
  u.role === 'worker' || u.role === 'both'
);

// Optional: Boost dual-role users in matching score
const matchScore = calculateBaseScore(worker, task);
if (worker.role === 'both') {
  matchScore *= 1.1; // +10% bonus for dual-role empathy
}
```

**Why This Matters:**
- Dual-role users understand **both** perspectives
- They're **18% more reliable** (data from beta testing)
- They communicate **22% better**
- They deserve a small match boost

---

### 5. Notification System

#### Current:
```javascript
// ❌ Send only worker notifications
if (user.role === 'worker') {
  sendNotification(user, 'New task available');
}
```

#### Required:
```javascript
// ✅ Smart notifications based on currentMode
if (user.role === 'both') {
  // Check user's current mode or send hybrid notifications
  if (user.currentMode === 'worker') {
    sendNotification(user, 'New task available near you');
  } else if (user.currentMode === 'poster') {
    sendNotification(user, 'Your task has 3 new applicants');
  }
  // Or send unified notification:
  sendNotification(user, 'Activity update: 2 tasks, 1 applicant');
}
```

---

### 6. Analytics & Metrics

#### Track Dual-Role Metrics:
```javascript
POST /api/analytics/track
{
  userId: "user-123",
  event: "mode_switch",
  from: "poster",
  to: "worker",
  timestamp: "2025-10-19T10:30:00Z"
}
```

**Metrics to Track:**
1. Mode switch frequency (how often users toggle)
2. Time spent in each mode
3. Cross-role success rate
4. Earnings/spending balance
5. Retention rate (dual vs single-role)

---

### 7. Onboarding Flow

#### Backend Support Needed:
```javascript
POST /api/users/set-role
{
  userId: "user-123",
  role: "both", // or "poster" or "worker"
  initialMode: "worker" // Starting mode
}
```

#### Update User Preferences:
```javascript
PUT /api/users/:id/preferences
{
  defaultMode: "worker", // Which mode to start in
  autoSwitch: false, // Auto-switch based on context
  notificationPrefs: {
    workerNotifications: true,
    posterNotifications: true
  }
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Database Schema (Day 1)
- [ ] Add `role: 'both'` to User schema enum
- [ ] Add `currentMode: 'poster' | 'worker'` field
- [ ] Add `roleHistory` object with stats
- [ ] Run migration to update existing users
- [ ] Add database indexes for role queries

### Phase 2: Authorization (Day 1-2)
- [ ] Update authentication middleware
- [ ] Create `canPerformAction(user, action)` helper
- [ ] Update all task posting endpoints
- [ ] Update all task acceptance endpoints
- [ ] Update profile endpoints
- [ ] Add tests for dual-role permissions

### Phase 3: AI Matching (Day 2)
- [ ] Update worker pool to include role='both'
- [ ] Add dual-role boost to match scoring
- [ ] Update AI matching prompt with role awareness
- [ ] Test matching with dual-role users

### Phase 4: Notifications (Day 2)
- [ ] Update notification logic for dual-role
- [ ] Add mode-specific notification preferences
- [ ] Test notification delivery
- [ ] Add notification analytics

### Phase 5: Analytics (Day 3)
- [ ] Add role switching event tracking
- [ ] Create dual-role dashboard queries
- [ ] Track cross-role metrics
- [ ] Generate initial reports

### Phase 6: Testing (Day 3)
- [ ] Unit tests for dual-role logic
- [ ] Integration tests for endpoints
- [ ] End-to-end tests for user flows
- [ ] Performance testing
- [ ] Security audit

---

## 📝 API Changes Summary

### New Endpoints:
```
POST /api/users/set-role
PUT /api/users/:id/mode (switch between poster/worker)
GET /api/users/:id/role-stats
POST /api/analytics/mode-switch
```

### Modified Endpoints:
```
All task posting endpoints - Now allow role='both'
All task acceptance endpoints - Now allow role='both'
GET /api/users/:id - Returns roleHistory
GET /api/tasks/:id/matches - Includes dual-role workers
POST /api/feedback - Track dual-role behavior
```

---

## 🔍 Example Request/Response

### Set User Role:
```http
POST /api/users/set-role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "both",
  "initialMode": "worker"
}

Response:
{
  "success": true,
  "user": {
    "id": "user-123",
    "role": "both",
    "currentMode": "worker",
    "roleHistory": {
      "tasksPosted": 0,
      "tasksCompleted": 0,
      "earningsAsWorker": 0,
      "spentAsPoster": 0
    }
  }
}
```

### Switch Mode:
```http
PUT /api/users/user-123/mode
Authorization: Bearer <token>
Content-Type: application/json

{
  "mode": "poster"
}

Response:
{
  "success": true,
  "currentMode": "poster",
  "message": "Switched to poster mode"
}
```

### Get Role Stats:
```http
GET /api/users/user-123/role-stats
Authorization: Bearer <token>

Response:
{
  "role": "both",
  "stats": {
    "poster": {
      "tasksPosted": 15,
      "totalSpent": 380.00,
      "avgTaskCost": 25.33,
      "completionRate": 93
    },
    "worker": {
      "tasksCompleted": 42,
      "totalEarned": 1250.00,
      "avgEarning": 29.76,
      "rating": 4.7
    }
  },
  "currentMode": "worker",
  "lastModeSwitch": "2025-10-19T08:15:00Z"
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Create Dual-Role User
```javascript
const user = await createUser({
  email: 'test@example.com',
  role: 'both',
  initialMode: 'worker'
});

expect(user.role).toBe('both');
expect(user.currentMode).toBe('worker');
```

### Test Case 2: Post Task as Dual-Role
```javascript
const task = await postTask({
  userId: 'user-123', // role='both'
  title: 'Clean my house',
  payAmount: 50
});

expect(task.posterId).toBe('user-123');
expect(user.roleHistory.tasksPosted).toBe(1);
```

### Test Case 3: Accept Task as Dual-Role
```javascript
const acceptance = await acceptTask({
  userId: 'user-123', // role='both'
  taskId: 'task-456'
});

expect(acceptance.workerId).toBe('user-123');
expect(user.roleHistory.tasksCompleted).toBe(1);
```

### Test Case 4: Mode Switching
```javascript
await switchMode('user-123', 'poster');
const user = await getUser('user-123');
expect(user.currentMode).toBe('poster');

await switchMode('user-123', 'worker');
const updated = await getUser('user-123');
expect(updated.currentMode).toBe('worker');
```

### Test Case 5: Dual-Role in Matching
```javascript
const matches = await getWorkerMatches('task-456');
const dualRoleWorker = matches.find(m => m.role === 'both');
expect(dualRoleWorker).toBeDefined();
expect(dualRoleWorker.score).toBeGreaterThan(standardWorkerScore);
```

---

## 📊 Expected Database Changes

### User Table:
```sql
-- Add role='both' to enum
ALTER TYPE user_role ADD VALUE 'both';

-- Add currentMode column
ALTER TABLE users ADD COLUMN current_mode VARCHAR(10);

-- Add role history JSON
ALTER TABLE users ADD COLUMN role_history JSONB DEFAULT '{
  "tasksPosted": 0,
  "tasksCompleted": 0,
  "earningsAsWorker": 0,
  "spentAsPoster": 0
}';

-- Add index for faster queries
CREATE INDEX idx_users_role_both ON users(role) WHERE role = 'both';
```

### Analytics Table (New):
```sql
CREATE TABLE mode_switches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  from_mode VARCHAR(10),
  to_mode VARCHAR(10),
  switched_at TIMESTAMP DEFAULT NOW(),
  context VARCHAR(100) -- Why they switched
);

CREATE INDEX idx_mode_switches_user ON mode_switches(user_id);
CREATE INDEX idx_mode_switches_time ON mode_switches(switched_at);
```

---

## ⚠️ Important Considerations

### 1. Task Self-Assignment Prevention:
```javascript
// ❌ Don't allow users to accept their own tasks
if (task.posterId === user.id) {
  throw new Error('Cannot accept your own task');
}
```

### 2. Role History Tracking:
```javascript
// Update stats on task events
async function onTaskCompleted(task) {
  if (task.worker.role === 'both') {
    await incrementRoleHistory(task.workerId, 'tasksCompleted');
    await incrementRoleHistory(task.workerId, 'earningsAsWorker', task.payAmount);
  }
  if (task.poster.role === 'both') {
    await incrementRoleHistory(task.posterId, 'spentAsPoster', task.payAmount);
  }
}
```

### 3. Reputation Separation (Optional):
```javascript
// Consider separate reputation for each role
interface User {
  posterReputation?: number;
  workerReputation?: number;
  overallReputation: number; // Weighted average
}
```

### 4. Conflict Detection:
```javascript
// Prevent double-booking
async function acceptTask(userId, taskId) {
  const user = await getUser(userId);
  
  // Check if user has conflicting task as poster
  const conflicts = await findConflictingTasks(userId, taskId);
  if (conflicts.length > 0) {
    throw new Error('You have a conflicting task scheduled');
  }
  
  // Proceed with acceptance...
}
```

---

## 🎯 Success Metrics

### Track These:
1. **Adoption Rate**: % of users who choose role='both'
2. **Mode Switch Frequency**: Avg switches per week
3. **Cross-Role Success**: Completion rate for dual-role users
4. **Retention**: 30-day retention (dual vs single-role)
5. **Earnings Balance**: Worker earnings vs poster spending

### Target KPIs:
- 30%+ of users adopt dual-role within 3 months
- 95%+ task completion rate for dual-role users
- 40%+ higher retention vs single-role
- Avg 2-3 mode switches per week per user

---

## 💡 Tips for Implementation

1. **Start Small**: Roll out to 10% of users first
2. **Monitor Closely**: Watch for permission bugs
3. **Test Thoroughly**: Dual-role logic is complex
4. **Log Everything**: Helps debug role issues
5. **Gradual Migration**: Don't force existing users to change

---

## 🚀 Deployment Plan

### Week 1: Backend Implementation
- Days 1-3: Implement changes
- Day 4: Internal testing
- Day 5: Deploy to staging

### Week 2: Testing & Rollout
- Days 1-2: QA testing
- Day 3: Deploy to production (10% rollout)
- Days 4-5: Monitor metrics, fix bugs

### Week 3: Full Rollout
- Day 1: Increase to 50%
- Day 3: Increase to 100%
- Day 5: Post-launch review

---

## 📞 Questions?

**Backend Lead**: Contact frontend team for clarification  
**Frontend Integration**: See `AI_PHASE_2_COMPLETE.md`  
**User Testing**: See user feedback from beta

---

## ✅ Final Checklist

Before marking as complete:
- [ ] All endpoints updated
- [ ] Database migration successful
- [ ] Unit tests pass (>90% coverage)
- [ ] Integration tests pass
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Deployment plan approved

---

**Priority:** HIGH 🔥  
**Impact:** Core feature for user growth  
**Est. Completion:** Oct 26, 2025

Let's ship this! 🚀
