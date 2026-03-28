# 🚀 Backend Team: Universal AI Integration Request

**From:** Frontend Team  
**To:** Backend Team  
**Date:** January 29, 2025  
**Priority:** HIGH - Frontend is production-ready and blocked on this

---

## 📋 TL;DR

We built a complete AI-powered gig marketplace frontend with a 5-tier progression system. Everything is ready except we need you to implement **9 AI endpoints** to connect our frontend to GPT-4o.

**What we need:**
- 9 REST API endpoints (prioritized below)
- Tier-aware AI that adapts personality based on user level (1-50)
- PostgreSQL + Redis + GPT-4o integration
- Timeline: 4-6 weeks

**What you get:**
- Complete TypeScript interfaces for all 9 endpoints
- Full documentation with examples
- Database schema ready
- Test account specifications

---

## 🎯 The Big Picture

### Our Frontend Has:
- ✅ Universal AI Context (single AI brain)
- ✅ 5-Tier Ascension System (levels 1-50)
- ✅ AI Task Lifecycle (accept → execute → complete)
- ✅ AI-Powered Onboarding
- ✅ Multi-lingual Support
- ✅ All 9 endpoints typed and ready

### We Need Backend To:
- 🔴 Implement 9 AI endpoints
- 🔴 Connect to GPT-4o
- 🔴 Store AI sessions + feedback in database
- 🔴 Adapt AI personality based on user tier

---

## 🎨 The Tier System (Critical to Understand)

Users progress through **5 tiers** from level 1 to 50+:

| Tier | Levels | Fee | XP | AI Personality |
|------|--------|-----|----|----------------|
| 🌱 Side Hustler | 1-10 | 15% | 1.0x | **Friendly, encouraging, detailed** |
| ⚡ The Operator | 11-20 | 12% | 1.2x | **Motivational, action-focused** |
| 💰 Rainmaker | 21-30 | 10% | 1.5x | **Professional, strategic** |
| 🏛️ The Architect | 31-40 | 7% | 2.0x | **Executive, high-level** |
| 👑 Prestige | 41+ | 5% | 3.0x | **Autonomous, expert** |

**Why this matters for AI:**

The same AI (GPT-4o) must change its **personality, tone, and verbosity** based on user tier:

- **Side Hustler (Level 5):** "Hey! 👋 I found 3 perfect tasks for you! Let me walk you through each one..."
- **The Operator (Level 15):** "⚡ You're crushing it! 5 high-value tasks nearby. Your stats say accept #2 for fastest earnings."
- **Rainmaker (Level 25):** "💰 Market surge detected. 3 premium gigs, $250+ each. Recommend accepting now."
- **The Architect (Level 35):** "🏛️ Portfolio optimization: Accept gig #1 + #3. ROI: 2.3x. Efficiency: 92%."
- **Prestige (Level 45):** "👑 VIP opportunity: $500 private gig, pre-vetted client. Auto-scheduled. Accept?"

**Implementation:** You'll fetch tier info via `GET /api/ai/tier-info/:userId` and use it to shape GPT-4o prompts.

---

## 🔥 Priority 1: Core Endpoints (Week 1) - CRITICAL

### 1. Main AI Chat - `POST /api/ai/chat`

**The brain of the entire app.** Powers all natural language interactions.

**Request:**
```json
{
  "userId": "user123",
  "message": "Find me cleaning tasks nearby",
  "context": {
    "screen": "home",
    "language": "en",
    "user": {
      "id": "user123",
      "role": "everyday",
      "level": 15,
      "xp": 2400,
      "earnings": 5200,
      "streak": 12,
      "tasksCompleted": 47,
      "badges": ["clean_sweep", "speed_demon"],
      "skills": ["cleaning", "moving"],
      "location": { "lat": 40.7128, "lng": -74.0060 }
    },
    "availableTasks": 25,
    "activeTasks": 1,
    "patterns": {
      "favoriteCategories": ["cleaning", "moving"],
      "preferredWorkTimes": [9, 10, 14, 15, 16],
      "averageTaskValue": 65,
      "maxDistance": 10
    },
    "sessionId": "session-xyz"
  }
}
```

**Response:**
```json
{
  "response": "⚡ Perfect timing! I found 3 cleaning tasks within 2 miles:\n\n1. **Deep Clean 2BR** - $75, 3 hours, 1.2 mi\n2. **Office Cleaning** - $60, 2 hours, 0.8 mi  \n3. **Post-Party Cleanup** - $90, 4 hours, 1.5 mi\n\nBased on your stats, #2 is fastest earnings. Want details?",
  "confidence": 0.92,
  "suggestions": [
    "Show me task #2",
    "What's the best paying task?",
    "Filter by distance"
  ],
  "actions": [
    {
      "id": "action1",
      "type": "navigate",
      "label": "View Task #2",
      "screen": "task-details",
      "taskId": "task-456"
    }
  ],
  "highlights": [],
  "metadata": {
    "model": "gpt-4o",
    "tokens": 342,
    "processingTime": 1250,
    "cached": false,
    "language": "en"
  }
}
```

**What it does:**
- Detects user intent (20+ types: find_work, task_status, earnings, etc.)
- Executes actions autonomously
- Adapts tone based on tier (Level 15 = motivational)
- Returns structured data + UI actions

**Implementation hints:**
```typescript
// Pseudo-code
async function handleChat(userId, message, context) {
  // 1. Get user tier
  const tierInfo = await getTierInfo(userId);
  
  // 2. Build tier-aware system prompt
  const systemPrompt = buildSystemPrompt(tierInfo.behavior);
  
  // 3. Call GPT-4o
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
  });
  
  // 4. Parse response + generate actions
  const actions = extractActions(response);
  
  return { response: response.content, actions, ... };
}
```

---

### 2. Tier Information - `GET /api/ai/tier-info/:userId`

**Returns tier + AI behavior configuration.**

**Response:**
```json
{
  "userId": "user123",
  "username": "mike_hustler",
  "role": "Hustler",
  "level": 15,
  "tier": {
    "name": "The Operator",
    "tierLevel": 2,
    "levelRange": [11, 20]
  },
  "behavior": {
    "tone": "motivational",
    "verbosity": "balanced",
    "formality": "semi-casual",
    "responseStyle": "adaptive",
    "automationLevel": "assisted",
    "technicalDepth": "moderate",
    "encouragementLevel": "medium",
    "useEmojis": true
  },
  "features": [
    "adaptive_learning",
    "performance_tips",
    "smart_matching",
    "streak_reminders"
  ],
  "uiGuidance": {
    "showTutorialHints": false,
    "showProTips": true,
    "showAdvancedMetrics": true
  },
  "quickActions": [
    "Find work nearby",
    "Check my stats",
    "Show weekly progress"
  ]
}
```

**What it does:**
- Maps user level → tier
- Returns AI behavior settings
- Provides quick action suggestions
- Configures UI elements

**Implementation:**
```typescript
function getTierForLevel(level: number) {
  if (level <= 10) return TIER_1_SIDE_HUSTLER;
  if (level <= 20) return TIER_2_THE_OPERATOR;
  if (level <= 30) return TIER_3_RAINMAKER;
  if (level <= 40) return TIER_4_THE_ARCHITECT;
  return TIER_5_PRESTIGE;
}
```

---

### 3. Unified Dashboard - `GET /api/dashboard/unified/:userId?includeAI=true`

**Single endpoint for entire dashboard.**

**Response:**
```json
{
  "user": {
    "id": "user123",
    "name": "Mike",
    "currentLevel": 15,
    "currentXP": 2400,
    "xpToNextLevel": 3200,
    "gritCoins": 5200,
    "dailyStreak": 12,
    "tier": "The Operator",
    "tierProgress": 50
  },
  "matches": {
    "instant": [
      {
        "taskId": "task-456",
        "title": "Deep Clean 2BR Apartment",
        "description": "Need thorough cleaning...",
        "category": "cleaning",
        "earnings": 75,
        "xpReward": 120,
        "distance": 1.2,
        "estimatedDuration": 3,
        "matchScore": 0.95,
        "urgency": "medium",
        "poster": {
          "name": "Sarah",
          "trustScore": 94,
          "completedTasks": 23
        }
      }
    ]
  },
  "progression": {
    "levelProgress": 75,
    "xpNeeded": 800,
    "nextTierLevel": 21,
    "streakDaysRemaining": 12
  },
  "todayStats": {
    "tasksCompleted": 2,
    "xpEarned": 240,
    "coinsEarned": 145,
    "activeStreak": 12
  },
  "suggestions": {
    "nextBestActions": [
      {
        "id": "suggestion1",
        "priority": "high",
        "title": "Complete your active task",
        "description": "Finish 'Office Cleaning' to maintain streak",
        "xpPotential": 120,
        "coinsPotential": 60,
        "estimatedTime": 90
      }
    ]
  }
}
```

---

## 🎯 Priority 2: Matching & Recommendations (Week 2-3)

### 4. AI Task Matching - `POST /api/ai/match-task`
### 5. AI Recommendations - `POST /api/ai/recommendations`
### 6. AI Task Parser - `POST /api/ai/task-parse`

**Full specs:** See `BACKEND_INTEGRATION_PROMPT.md` (pages 5-10)

---

## 🧠 Priority 3: Learning & Feedback (Week 3-4)

### 7. Pattern Analysis - `POST /api/ai/analyze-patterns`
### 8. Feedback Loop - `POST /api/ai/feedback`

**Full specs:** See `BACKEND_INTEGRATION_PROMPT.md` (pages 11-14)

---

## 🔧 What You Need to Build

### Tech Stack:
- **Node.js + Express** (or your preferred backend)
- **PostgreSQL** (for AI sessions, feedback, patterns)
- **Redis** (for caching tier info, recommendations)
- **OpenAI GPT-4o** (via API)

### Database Tables:
```sql
-- AI Sessions (conversation history)
CREATE TABLE ai_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  session_id VARCHAR(255),
  messages JSONB,
  context JSONB,
  created_at TIMESTAMP
);

-- AI Feedback (learning data)
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY,
  user_id UUID,
  feedback_type VARCHAR(50),
  task_id UUID,
  prediction JSONB,
  actual JSONB,
  created_at TIMESTAMP
);

-- User Patterns (behavior analysis)
CREATE TABLE user_patterns (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  work_schedule JSONB,
  category_preferences JSONB,
  earning_behavior JSONB,
  performance_metrics JSONB,
  updated_at TIMESTAMP
);
```

### Environment Variables:
```bash
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SESSION_SECRET=...
```

---

## 📦 What We're Giving You

### Complete TypeScript Interfaces:
- **File:** `services/backend/ai.ts` (600 lines)
- All 9 endpoints fully typed
- Request/response interfaces
- Example data structures

### Documentation:
- **BACKEND_INTEGRATION_PROMPT.md** - Full specs (50 pages)
- **FRONTEND_READY_FOR_BACKEND.md** - Frontend details (40 pages)
- **FINAL_INTEGRATION_STATUS.md** - Executive summary (20 pages)

### Test Accounts Needed:
Please create 5 test accounts:
```typescript
[
  { username: "sarah_beginner", level: 5, tier: "Side Hustler" },
  { username: "mike_operator", level: 15, tier: "The Operator" },
  { username: "alex_rainmaker", level: 25, tier: "Rainmaker" },
  { username: "jordan_architect", level: 35, tier: "The Architect" },
  { username: "casey_prestige", level: 45, tier: "Prestige" }
]
```

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| AI Response Time | < 2 seconds |
| Backend Uptime | > 99.5% |
| AI Accuracy | > 95% |
| GPT-4o Cost | ~$1.08/user/month |
| ROI | 2,626% (tier fees) |

---

## 📅 Timeline

| Week | Deliverable |
|------|------------|
| **Week 1** | Core 3 endpoints (chat, tier-info, dashboard) |
| **Week 2** | Matching + recommendations |
| **Week 3** | Parser + pattern analysis |
| **Week 4** | Feedback loop + testing |
| **Week 5-6** | Multi-modal (optional) |

---

## 🤝 Communication

### What We Need From You:

1. **Weekly updates:**
   - Endpoints completed
   - Blockers/questions
   - Next week's plan

2. **Questions:**
   - Slack us anytime
   - Check the docs first (likely answered)
   - We're here to help!

3. **Testing:**
   - Deploy to staging first
   - We'll test integration
   - Iterate together

---

## 🚀 Quick Start

### Step 1: Read the docs
```bash
# Start here
open BACKEND_INTEGRATION_PROMPT.md

# Then check TypeScript interfaces
open services/backend/ai.ts
```

### Step 2: Set up environment
```bash
git clone <backend-repo>
cd backend
npm install
cp .env.example .env
# Add OPENAI_API_KEY, DATABASE_URL, etc.
```

### Step 3: Implement Priority 1
```bash
# Implement these 3 endpoints first
POST /api/ai/chat
GET  /api/ai/tier-info/:userId
GET  /api/dashboard/unified/:userId
```

### Step 4: Test with frontend
```bash
# Frontend will connect to your staging URL
# We'll test end-to-end together
```

---

## 💡 Key Principles

### 1. **Tier-Aware AI is Critical**
The AI must adapt personality based on user level. A Level 5 user needs encouragement. A Level 45 user needs data, not hand-holding.

### 2. **Context is Everything**
Every AI request includes full context (user profile, location, patterns, history). Use it to personalize responses.

### 3. **Learning Loop Matters**
Every task completion feeds back to AI. This makes predictions smarter over time.

### 4. **Performance is Key**
AI responses < 2s. Cache tier info. Use Redis for recommendations.

---

## 🎉 Let's Ship This!

The frontend is **production-ready**. We've done our part. Now we need you to connect the AI backend.

**Questions?** All specs are documented. We're here to help.

**Timeline?** 4-6 weeks to full implementation.

**Ready?** Let's build the best AI-powered gig marketplace! 🚀

---

## 📞 Quick Links

| Document | Purpose |
|----------|---------|
| **BACKEND_INTEGRATION_PROMPT.md** | Full endpoint specs (START HERE) |
| **services/backend/ai.ts** | TypeScript interfaces |
| **FRONTEND_READY_FOR_BACKEND.md** | Frontend details |
| **FINAL_INTEGRATION_STATUS.md** | Executive summary |

---

**From:** Frontend Team with ❤️  
**To:** Backend Team  
**Status:** Waiting for you! 🎯

Let's make this happen! 💪
