# 🚀 Backend Integration: Connect to HustleXP Frontend

**Date:** January 29, 2025  
**Status:** Frontend 100% Ready - Waiting for Backend  
**Priority:** HIGH - Frontend is production-ready

---

## 📋 Executive Summary

The HustleXP frontend is **100% ready** for backend connection. We need you to implement **9 AI endpoints** + **tier system** + **unified dashboard** to complete the integration.

**Timeline:** 4-6 weeks for full implementation  
**Stack:** Node.js/Express + GPT-4o + PostgreSQL + Redis

---

## 🎯 What We Need From You

### Phase 1: Core AI Endpoints (Week 1-2) 🔴 HIGH PRIORITY

#### 1. Main AI Chat - `POST /api/ai/chat`

**The Brain of the App** - Powers all natural language interactions.

**Request:**
```typescript
{
  userId: string;
  message: string;
  context: {
    screen?: string;              // Current screen
    language?: string;            // User language (en, es, etc.)
    user?: {
      id: string;
      role: 'everyday' | 'tradesman';
      level: number;
      xp: number;
      earnings: number;
      streak: number;
      tasksCompleted: number;
      badges: string[];
      skills: string[];
      location?: { lat: number; lng: number };
    };
    availableTasks?: number;
    activeTasks?: number;
    patterns?: {
      favoriteCategories?: string[];
      preferredWorkTimes?: number[];
      averageTaskValue?: number;
      maxDistance?: number;
      workDaysPerWeek?: number;
    };
    sessionId?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
}
```

**Response:**
```typescript
{
  response: string;                // AI response text
  confidence: number;              // 0-1 confidence score
  suggestions: string[];           // Follow-up suggestions
  actions: Array<{
    id: string;
    type: 'navigate' | 'execute' | 'filter';
    label: string;
    screen?: string;
    params?: any;
    taskId?: string;
    requireConfirmation?: boolean;
    filters?: any;
  }>;
  highlights: Array<{
    elementId: string;
    message: string;
    duration: number;
    position: 'top' | 'bottom' | 'left' | 'right';
  }>;
  metadata: {
    model: string;
    tokens: number;
    processingTime: number;
    cached: boolean;
    language: string;
  };
}
```

**What It Does:**
- Interprets natural language (20+ intent types)
- Executes actions autonomously
- Maintains context across conversation
- Returns structured data + UI actions
- Adapts tone based on user tier (see Tier System below)

**Example Conversations:**

**User:** "Find me cleaning tasks nearby"  
**AI:** "🎯 I found 3 cleaning tasks within 2 miles:
1. Deep Clean 2BR - $75, 3 hours
2. Office Cleaning - $60, 2 hours
3. Post-Party Cleanup - $90, 4 hours

Which one interests you?"  
**Actions:** `[{ type: 'navigate', label: 'View #1', taskId: 'task-123' }]`

---

#### 2. AI Task Parser - `POST /api/ai/task-parse`

**Converts natural language to structured task.**

**Request:**
```typescript
{
  userId: string;
  input: string;  // "I need help moving furniture tomorrow, $100"
  context: {
    userLocation?: { lat: number; lng: number };
    currentTime?: string;
    language?: string;
  };
}
```

**Response:**
```typescript
{
  task: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    pay: {
      amount: number;
      currency: string;
      type: 'fixed' | 'hourly';
      confidence: 'low' | 'medium' | 'high';
    };
    location?: {
      address: string;
      city?: string;
      coordinates?: { lat: number; lng: number };
      verified: boolean;
    };
    deadline?: {
      date: string;
      type: 'flexible' | 'strict';
      urgent: boolean;
    };
    requirements: Array<{
      type: string;
      value: any;
      required: boolean;
    }>;
    estimatedDuration?: string;
    estimatedDistance?: number;
    skills: string[];
    xpReward: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  confidence: 'low' | 'medium' | 'high';
  suggestions: {
    payAdjustment?: {
      suggested: number;
      reasoning: string;
    };
    safetyChecks: string[];
    improvements: string[];
  };
  warnings: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  metadata: {
    processingTime: number;
    model: string;
    language: string;
  };
}
```

**What It Does:**
- Extracts structured data from natural language
- Suggests market-rate pricing
- Identifies safety risks
- Recommends improvements
- Validates completeness

---

#### 3. Tier Information - `GET /api/ai/tier-info/:userId`

**Returns user tier + AI behavior configuration.**

**Response:**
```typescript
{
  userId: string;
  username: string;
  role: 'Hustler' | 'Poster' | 'Tradesman';
  level: number;
  tier: {
    name: 'Side Hustler' | 'The Operator' | 'Rainmaker' | 'The Architect' | 'Prestige';
    tierLevel: 1 | 2 | 3 | 4 | 5;
    levelRange: [number, number];
  };
  behavior: {
    tone: 'friendly' | 'motivational' | 'professional' | 'executive' | 'autonomous';
    verbosity: 'detailed' | 'balanced' | 'concise' | 'brief' | 'minimal';
    formality: 'casual' | 'semi-casual' | 'professional' | 'executive' | 'expert';
    responseStyle: 'teaching' | 'adaptive' | 'strategic' | 'high-level' | 'autonomous';
    automationLevel: 'guided' | 'assisted' | 'strategic' | 'semi-autonomous' | 'autonomous';
    technicalDepth: 'basic' | 'moderate' | 'advanced' | 'expert' | 'master';
    encouragementLevel: 'high' | 'medium' | 'low' | 'minimal' | 'none';
    useEmojis: boolean;
  };
  features: string[];  // e.g., ['adaptive_learning', 'performance_tips', 'smart_matching']
  uiGuidance: {
    showTutorialHints: boolean;
    showProTips: boolean;
    showAdvancedMetrics: boolean;
  };
  quickActions: string[];  // Tier-specific quick action suggestions
  quickSuggestions: string[];  // Same as quickActions (for compatibility)
}
```

**Tier Definitions:**

| Tier | Levels | Fee | XP | Tone | Features |
|------|--------|-----|----|----|----------|
| **Side Hustler** | 1-10 | 15% | 1.0x | Friendly, encouraging | Basic coaching, step-by-step |
| **The Operator** | 11-20 | 12% | 1.2x | Motivational, action-focused | Performance tracking, insights |
| **Rainmaker** | 21-30 | 10% | 1.5x | Professional, data-driven | Market forecasts, surge alerts |
| **The Architect** | 31-40 | 7% | 2.0x | Executive, high-level | Portfolio management, ROI optimization |
| **Prestige** | 41+ | 5% | 3.0x | Autonomous, expert | Predictive AI, VIP opportunities |

**What It Does:**
- Returns tier-specific AI behavior
- Provides quick action suggestions
- Configures UI elements
- Shapes AI personality

---

### Phase 2: Task Matching & Recommendations (Week 2-3) 🟠 MEDIUM PRIORITY

#### 4. AI Task Matching - `POST /api/ai/match-task`

**Personalized task recommendations.**

**Request:**
```typescript
{
  userId: string;
  context: {
    location: { lat: number; lng: number };
    availability: string;  // "next-3-hours", "today", "this-week"
    preferences: {
      categories: string[];
      maxDistance: number;
      minPay: number;
    };
  };
  limit?: number;  // Default: 10
}
```

**Response:**
```typescript
{
  recommendations: Array<{
    taskId: string;
    matchScore: number;  // 0-1
    reasoning: string;
    task: {
      title: string;
      category: string;
      pay: number;
      distance: number;
      duration: string;
      urgency: 'low' | 'medium' | 'high';
    };
    highlights: string[];
    predictions: {
      successProbability: number;
      earnings: { base: number; potential: number };
      enjoymentScore: number;
      xpGain: number;
    };
  }>;
  bundles: Array<{
    bundleId: string;
    tasks: string[];
    matchScore: number;
    reasoning: string;
    totalEarnings: number;
    totalDistance: number;
    totalTime: string;
    efficiencyGain: number;
    route: Array<{ taskId: string; order: number; distance: number }>;
    highlights: string[];
  }>;
  metadata: {
    processingTime: number;
    totalTasksAnalyzed: number;
  };
}
```

**What It Does:**
- Ranks tasks by match score (skills, location, history)
- Identifies task bundles for efficiency
- Calculates earnings potential
- Optimizes routes
- Predicts success probability

---

#### 5. Pattern Analysis - `POST /api/ai/analyze-patterns`

**Analyzes user behavior over time.**

**Request:**
```typescript
{
  userId: string;
  timeframe: '7days' | '30days' | '90days';
  includeRecommendations?: boolean;
  analysisTypes?: string[];  // ['work_schedule', 'earnings', 'performance']
}
```

**Response:**
```typescript
{
  userId: string;
  timeframe: string;
  patterns: {
    workSchedule: {
      daysPerWeek: number;
      hoursPerDay: number;
      peakDays: string[];
      peakHours: number[];
      avoidHours: number[];
      consistency: number;
      weekendWorker: boolean;
    };
    categoryPreferences: {
      top: Array<{
        category: string;
        percentage: number;
        count: number;
        avgPay: number;
        satisfaction: number;
      }>;
      avoided: Array<{ category: string; reason: string }>;
    };
    earningBehavior: {
      averageTaskValue: number;
      minAcceptedPay: number;
      maxAcceptedPay: number;
      sweetSpot: { min: number; max: number };
      weeklyEarnings: number;
      monthlyProjection: number;
      trend: 'increasing' | 'stable' | 'decreasing';
      growthRate: number;
    };
    distancePreference: {
      average: number;
      maximum: number;
      preferred: { min: number; max: number };
      maxWilling: number;
    };
    performanceMetrics: {
      completionRate: number;
      onTimeRate: number;
      acceptanceRate: number;
      averageRating: number;
      responseTime: string;
      reliability: 'excellent' | 'good' | 'fair' | 'poor';
    };
    streakBehavior: {
      longestStreak: number;
      currentStreak: number;
      streakConsciousness: 'high' | 'medium' | 'low';
      streakSaves: number;
      averageBreakReason: string;
    };
  };
  predictions: {
    likelyToWorkToday: number;
    bestTimeToNotify: string;
    estimatedEarningsThisWeek: number;
    estimatedEarningsThisMonth: number;
    streakRisk: {
      level: 'low' | 'medium' | 'high';
      expiresIn: string;
      recommendation: string;
    };
    levelUp: {
      currentLevel: number;
      currentXP: number;
      nextLevel: number;
      xpNeeded: number;
      estimatedTime: string;
      projectedDate: string;
    };
  };
  insights: Array<{
    type: 'strength' | 'opportunity' | 'warning';
    title: string;
    description: string;
    impact: 'positive' | 'neutral' | 'negative' | 'high' | 'medium' | 'low';
    actionable?: boolean;
  }>;
  recommendations: string[];
  alerts: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    message: string;
    action: any;
    timing: string;
  }>;
  metadata: {
    processingTime: number;
    dataPoints: number;
    confidence: number;
    model: string;
  };
}
```

**What It Does:**
- Identifies work patterns
- Predicts best work times
- Forecasts earnings
- Detects streak risks
- Generates insights

---

#### 6. AI Recommendations - `POST /api/ai/recommendations`

**Proactive suggestions based on context.**

**Request:**
```typescript
{
  userId: string;
  context: {
    location: { lat: number; lng: number };
    time: string;
    availability: string;
    currentStreak?: number;
    currentLevel?: number;
    currentXP?: number;
  };
  preferences?: {
    categories?: string[];
    maxDistance?: number;
    minPay?: number;
  };
  recommendationType?: 'proactive' | 'reactive';  // Default: 'proactive'
}
```

**Response:**
```typescript
{
  recommendations: Array<{
    id: string;
    type: 'perfect-match' | 'streak-save' | 'level-up' | 'earnings-boost';
    priority: 'low' | 'medium' | 'high';
    taskId?: string;
    matchScore?: number;
    title: string;
    description: string;
    reasoning?: string[];
    highlights?: Record<string, string>;
    tasks?: Array<{ id: string; title: string; pay: number; duration: string }>;
    benefits?: string[];
    action: {
      label: string;
      type: 'navigate' | 'filter' | 'execute';
      screen?: string;
      params?: any;
      filters?: any;
    };
    urgency?: 'low' | 'medium' | 'high';
    expiresIn?: string;
  }>;
  bundles: Array<{ /* Same as match-task bundles */ }>;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    action: any;
  }>;
  metadata: {
    processingTime: number;
    recommendationsGenerated: number;
    bundlesAnalyzed: number;
    confidence: number;
  };
}
```

**What It Does:**
- Proactively suggests opportunities
- Identifies streak-saving tasks
- Recommends level-up paths
- Bundles tasks for efficiency
- Time-sensitive alerts

---

### Phase 3: Learning & Feedback (Week 3-4) 🟡 STANDARD PRIORITY

#### 7. Feedback Loop - `POST /api/ai/feedback`

**AI learns from task outcomes.**

**Request:**
```typescript
{
  userId: string;
  feedbackType: 'task_outcome' | 'recommendation' | 'prediction' | 'general';
  data: {
    taskId?: string;
    prediction?: any;  // What AI predicted
    actual?: any;      // What actually happened
    context?: any;
  };
}
```

**Response:**
```typescript
{
  recorded: boolean;
  feedbackId: string;
  analysis: {
    predictionAccuracy: any;
    modelPerformance: {
      overallAccuracy: number;
      userSpecificAccuracy: number;
      improvementSinceLastWeek: number;
    };
    learnings: Array<{
      pattern: string;
      insight: string;
      action: string;
    }>;
  };
  recommendations: string[];
  profileUpdates: {
    patterns: any;
    predictions: any;
  };
  metadata: {
    processingTime: number;
    model: string;
    confidence: number;
  };
}
```

**What It Does:**
- Tracks prediction accuracy
- Updates user patterns
- Improves future recommendations
- Identifies learning opportunities

---

### Phase 4: Unified Dashboard (Week 4) 🟢 STANDARD PRIORITY

#### 8. Unified Dashboard - `GET /api/dashboard/unified/:userId`

**Single endpoint for entire dashboard.**

**Query Params:**
- `?includeAI=true` - Include AI insights (default: true)

**Response:**
```typescript
{
  user: {
    id: string;
    name: string;
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
    gritCoins: number;
    dailyStreak: number;
    tier: string;  // 'Side Hustler', 'The Operator', etc.
    tierProgress: number;  // 0-100
  };
  matches: {
    instant: Array<{
      taskId: string;
      title: string;
      description: string;
      category: string;
      earnings: number;
      xpReward: number;
      distance: number;
      estimatedDuration: number;
      matchScore: number;
      urgency: 'low' | 'medium' | 'high';
      poster: {
        name: string;
        trustScore: number;
        completedTasks: number;
      };
    }>;
    recommended: Array<{ /* Same structure */ }>;
  };
  progression: {
    levelProgress: number;  // 0-100
    xpNeeded: number;
    nextTierLevel: number;
    streakDaysRemaining: number;
  };
  todayStats: {
    tasksCompleted: number;
    xpEarned: number;
    coinsEarned: number;
    activeStreak: number;
  };
  recentActivity: Array<{
    type: 'task_completed' | 'level_up' | 'badge_earned' | 'streak_milestone';
    timestamp: string;
    data: any;
  }>;
  suggestions: {
    nextBestActions: Array<{
      id: string;
      priority: 'low' | 'medium' | 'high';
      title: string;
      description: string;
      action: any;
      xpPotential: number;
      coinsPotential: number;
      estimatedTime: number;
    }>;
  };
}
```

**What It Does:**
- Provides all dashboard data in one call
- Includes AI-matched tasks
- Shows progression metrics
- Suggests next actions

---

### Phase 5: Multi-Modal AI (Week 5-6) 🔵 LOW PRIORITY (Optional)

#### 9. Voice to Task - `POST /api/ai/voice-to-task`

**Multipart form data with audio file.**

**Response:**
```typescript
{
  transcript: string;
  confidence: number;
  language: string;
  parsedTask: { /* Same as task-parse */ };
  suggestions: {
    improvements: string[];
    payAdjustment?: { suggested: number; reasoning: string };
  };
  metadata: {
    processingTime: number;
    audioLength: number;
    model: string;
  };
}
```

#### 10. Image Match - `POST /api/ai/image-match`

**Analyze images for task recommendations.**

---

## 🗄️ Database Schema

### Required Tables:

```sql
-- AI Sessions
CREATE TABLE ai_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  messages JSONB,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Feedback
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  feedback_type VARCHAR(50),
  task_id UUID REFERENCES tasks(id),
  prediction JSONB,
  actual JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Patterns
CREATE TABLE user_patterns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  work_schedule JSONB,
  category_preferences JSONB,
  earning_behavior JSONB,
  distance_preference JSONB,
  performance_metrics JSONB,
  streak_behavior JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Recommendations Cache
CREATE TABLE ai_recommendations_cache (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  recommendations JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentication

All endpoints require **session authentication**:

```typescript
// Frontend sends requests with credentials
fetch('/api/ai/chat', {
  method: 'POST',
  credentials: 'include',  // Sends session cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, message, context })
});
```

Backend validates session and extracts `userId` from session.

---

## 🎨 Tier-Aware AI Behavior

Your AI must adapt responses based on user tier:

### Implementation:

```typescript
// 1. Get user tier
const tierInfo = await getTierInfo(userId);

// 2. Adjust prompt based on tier
const systemPrompt = buildSystemPrompt(tierInfo.behavior);

// 3. Generate response with tier-specific personality
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ],
});
```

### Example System Prompts by Tier:

**Side Hustler (1-10):**
```
You are a friendly AI coach helping a beginner. Use encouraging language, 
emojis, and detailed explanations. Break down tasks step-by-step.
```

**The Operator (11-20):**
```
You are a motivational AI coach for an active hustler. Focus on performance 
metrics, efficiency tips, and goal achievement. Use action-oriented language.
```

**Rainmaker (21-30):**
```
You are a strategic AI advisor for an experienced professional. Provide 
data-driven insights, market analysis, and revenue optimization strategies.
```

**The Architect (31-40):**
```
You are an executive AI consultant. Use high-level strategic language, 
focus on ROI, portfolio management, and business scaling.
```

**Prestige (41+):**
```
You are an autonomous AI partner for an expert. Provide predictive intelligence,
VIP opportunities, and assume high expertise. Be concise and data-focused.
```

---

## 🚀 Quick Start Guide

### 1. Environment Setup

```bash
# Clone backend repo
git clone <your-backend-repo>
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### 2. Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hustlexp

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# Session
SESSION_SECRET=your-secret-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8081
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test Endpoints

```bash
# Test AI chat
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "userId": "user123",
    "message": "Find me work nearby",
    "context": { "screen": "home", "language": "en" }
  }'
```

---

## 📊 Success Metrics

### Performance Targets:

| Endpoint | Response Time | Success Rate |
|----------|---------------|--------------|
| /ai/chat | < 2s | 99.5% |
| /ai/task-parse | < 3s | 98% |
| /ai/match-task | < 4s | 99% |
| /ai/analyze-patterns | < 5s | 98% |
| /ai/recommendations | < 3s | 99% |
| /ai/tier-info | < 500ms | 99.9% |
| /dashboard/unified | < 2s | 99.5% |

### Cost Targets:

- **GPT-4o:** ~$1.08 per user/month
- **ROI:** 2,626% (based on tier fee reductions)

---

## 🧪 Test Accounts

Please create **5 test accounts** representing each tier:

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

## 📞 Communication

### Status Updates:

Please provide weekly updates on:
1. Endpoints completed
2. Blockers or questions
3. Next week's plan

### Questions?

- Review `services/backend/ai.ts` for complete TypeScript interfaces
- Check `FRONTEND_READY_FOR_BACKEND.md` for frontend details
- All types are production-ready

---

## 🎉 Let's Ship It!

The frontend is waiting. Let's build this! 🚀

**Timeline:**
- **Week 1-2:** Core AI + Tier System
- **Week 3:** Matching + Recommendations
- **Week 4:** Learning + Dashboard
- **Week 5-6:** Multi-modal (optional)

**Questions?** Ping me anytime. Let's make this happen! 💪
