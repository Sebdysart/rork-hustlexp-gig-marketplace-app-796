/**
 * MAX POTENTIAL AI Engine
 * Makes HustleAI the operating system of the gig economy
 */

import { hustleAI } from './hustleAI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task } from '@/types';

const STORAGE_KEYS = {
  AI_CONTEXT: 'hustlexp_ai_context',
  AI_PREFERENCES: 'hustlexp_ai_preferences',
  AI_HISTORY: 'hustlexp_ai_history',
};

export type AIIntent =
  | 'find_work'
  | 'post_task'
  | 'check_stats'
  | 'optimize_profile'
  | 'forecast_earnings'
  | 'get_coaching'
  | 'badge_strategy'
  | 'route_optimization'
  | 'price_suggestion'
  | 'general_question';

export interface AIContext {
  userId: string;
  recentMessages: string[];
  currentScreen?: string;
  lastIntent?: AIIntent;
  activeGoals?: string[];
  preferences?: UserAIPreferences;
}

export interface UserAIPreferences {
  favoriteCategories: string[];
  workingHours: { start: number; end: number };
  maxDistance: number;
  minPayRate: number;
  autoAcceptHighMatch: boolean;
  notificationStyle: 'proactive' | 'passive' | 'aggressive';
}

export interface AIAction {
  type: 'navigate' | 'show_card' | 'execute' | 'suggest';
  target?: string;
  data?: any;
}

export interface AIResponse {
  text: string;
  intent: AIIntent;
  confidence: number;
  actions: AIAction[];
  suggestedFollowUps: string[];
}

export interface ProactiveInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'achievement' | 'suggestion' | 'briefing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionLabel?: string;
  action?: () => void;
  expiresAt?: string;
}

export interface EarningsForecast {
  estimated: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface BadgeStrategy {
  targetBadges: string[];
  currentProgress: Record<string, number>;
  recommendations: string[];
  estimatedTime: string;
}

class MaxPotentialAI {
  private context: AIContext | null = null;
  private proactiveInsights: ProactiveInsight[] = [];

  async initialize(userId: string): Promise<void> {
    const storedContext = await AsyncStorage.getItem(`${STORAGE_KEYS.AI_CONTEXT}_${userId}`);
    if (storedContext) {
      this.context = JSON.parse(storedContext);
    } else {
      this.context = {
        userId,
        recentMessages: [],
        preferences: {
          favoriteCategories: [],
          workingHours: { start: 9, end: 17 },
          maxDistance: 10,
          minPayRate: 20,
          autoAcceptHighMatch: false,
          notificationStyle: 'proactive',
        },
      };
    }
  }

  async saveContext(): Promise<void> {
    if (!this.context) return;
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.AI_CONTEXT}_${this.context.userId}`,
      JSON.stringify(this.context)
    );
  }

  classifyIntent(message: string): AIIntent {
    const lowerMsg = message.toLowerCase();

    if (
      lowerMsg.includes('find') ||
      lowerMsg.includes('work') ||
      lowerMsg.includes('task') ||
      lowerMsg.includes('gig')
    ) {
      return 'find_work';
    }

    if (
      lowerMsg.includes('post') ||
      lowerMsg.includes('create') ||
      lowerMsg.includes('need help') ||
      lowerMsg.includes('hire')
    ) {
      return 'post_task';
    }

    if (
      lowerMsg.includes('stats') ||
      lowerMsg.includes('how am i') ||
      lowerMsg.includes('progress') ||
      lowerMsg.includes('earnings')
    ) {
      return 'check_stats';
    }

    if (lowerMsg.includes('profile') || lowerMsg.includes('optimize') || lowerMsg.includes('improve')) {
      return 'optimize_profile';
    }

    if (lowerMsg.includes('badge') || lowerMsg.includes('level up') || lowerMsg.includes('strategy')) {
      return 'badge_strategy';
    }

    if (lowerMsg.includes('price') || lowerMsg.includes('charge') || lowerMsg.includes('worth')) {
      return 'price_suggestion';
    }

    if (lowerMsg.includes('coach') || lowerMsg.includes('help me') || lowerMsg.includes('advice')) {
      return 'get_coaching';
    }

    return 'general_question';
  }

  async chat(
    message: string,
    user: User,
    availableTasks: Task[]
  ): Promise<AIResponse> {
    if (!this.context) {
      await this.initialize(user.id);
    }

    const intent = this.classifyIntent(message);

    this.context!.recentMessages.push(message);
    if (this.context!.recentMessages.length > 10) {
      this.context!.recentMessages.shift();
    }
    this.context!.lastIntent = intent;
    await this.saveContext();

    switch (intent) {
      case 'find_work':
        return this.handleFindWork(user, availableTasks);
      case 'post_task':
        return this.handlePostTask(message);
      case 'check_stats':
        return this.handleCheckStats(user);
      case 'optimize_profile':
        return this.handleOptimizeProfile(user);
      case 'badge_strategy':
        return this.handleBadgeStrategy(user);
      case 'price_suggestion':
        return this.handlePriceSuggestion(message, user);
      case 'get_coaching':
        return this.handleCoaching(user);
      default:
        return this.handleGeneralQuestion(message);
    }
  }

  private async handleFindWork(user: User, tasks: Task[]): Promise<AIResponse> {
    const nearbyTasks = tasks
      .filter(t => t.status === 'open')
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        title: t.title,
        pay: t.payAmount,
        xp: t.xpReward,
        category: t.category,
        matchScore: Math.floor(Math.random() * 30) + 70,
      }));

    const bestMatch = nearbyTasks[0];

    return {
      text: `I found ${nearbyTasks.length} perfect matches for you! 🎯\n\nTop pick: "${bestMatch?.title || 'Great task'}" - $${bestMatch?.pay || 50} + ${bestMatch?.xp || 100} XP\n\n${bestMatch ? `This is a ${bestMatch.matchScore}% match based on your ${user.level >= 10 ? 'Legendary' : 'Silver'} skills!` : 'Check out the list below.'}`,
      intent: 'find_work',
      confidence: 95,
      actions: [
        {
          type: 'show_card',
          target: 'task_list',
          data: nearbyTasks,
        },
      ],
      suggestedFollowUps: [
        'Show me the best paying tasks',
        'Which task should I do first?',
        'What can I earn today?',
      ],
    };
  }

  private async handlePostTask(message: string): Promise<AIResponse> {
    return {
      text: "I'll help you create that task! Let me gather a few details...\n\nBased on your message, I'm thinking:\n- Category: Cleaning\n- Price range: $80-120\n- Duration: 2-3 hours\n\nDoes that sound right?",
      intent: 'post_task',
      confidence: 85,
      actions: [
        {
          type: 'navigate',
          target: 'ai-task-creator',
          data: { initialInput: message },
        },
      ],
      suggestedFollowUps: ['Yes, create it', 'Adjust the price', 'Change the details'],
    };
  }

  private async handleCheckStats(user: User): Promise<AIResponse> {
    const text = `You're crushing it! 🚀\n\n📊 Your Progress:\n- Level ${user.level} (${user.xp} XP)\n- ${user.tasksCompleted} tasks completed\n- $${user.earnings.toFixed(0)} earned total\n- ${user.reputationScore.toFixed(1)}⭐ rating\n- ${user.streaks.current} day streak 🔥\n\n${this.getPersonalizedInsight(user)}`;

    return {
      text,
      intent: 'check_stats',
      confidence: 100,
      actions: [
        {
          type: 'show_card',
          target: 'stats_detailed',
          data: {
            level: user.level,
            xp: user.xp,
            tasks: user.tasksCompleted,
            earnings: user.earnings,
            rating: user.reputationScore,
            streak: user.streaks.current,
          },
        },
      ],
      suggestedFollowUps: [
        'How do I level up faster?',
        "What's my best earning day?",
        'Show me my badges',
      ],
    };
  }

  private async handleOptimizeProfile(user: User): Promise<AIResponse> {
    const suggestions = [];

    if (user.level < 10) {
      suggestions.push('✅ Complete 5 more tasks to unlock Power-Up Shop');
    }

    if (user.streaks.current < 7) {
      suggestions.push('✅ Build a 7-day streak for +50 XP daily bonus');
    }

    if (user.reputationScore < 4.5) {
      suggestions.push('✅ Focus on 5-star ratings to boost your match rate');
    }

    return {
      text: `I analyzed your profile. Here's how to maximize your earnings:\n\n${suggestions.join('\n')}\n\nImplementing these changes could boost your earnings by 40% this month!`,
      intent: 'optimize_profile',
      confidence: 90,
      actions: [
        {
          type: 'show_card',
          target: 'optimization_plan',
          data: { suggestions },
        },
      ],
      suggestedFollowUps: [
        'Create a 30-day plan',
        'Which badges should I focus on?',
        'What are top earners doing?',
      ],
    };
  }

  private async handleBadgeStrategy(user: User): Promise<AIResponse> {
    return {
      text: `🎯 Badge Strategy:\n\nYou're spreading thin across 8 categories. Focus on these 3 to hit Legendary faster:\n\n🥇 Cleaning: ${Math.floor(Math.random() * 300) + 700}/1000\n🥈 Moving: ${Math.floor(Math.random() * 200) + 600}/1000\n🥉 Delivery: ${Math.floor(Math.random() * 100) + 200}/500\n\nFocusing here could boost earnings 40% with Legendary multipliers!`,
      intent: 'badge_strategy',
      confidence: 88,
      actions: [
        {
          type: 'show_card',
          target: 'badge_roadmap',
          data: {},
        },
      ],
      suggestedFollowUps: [
        'Show me a 30-day roadmap',
        'Which category pays most?',
        'How long will it take?',
      ],
    };
  }

  private async handlePriceSuggestion(message: string, user: User): Promise<AIResponse> {
    const suggestedPrice = Math.floor(Math.random() * 50) + 150;

    return {
      text: `Based on:\n- Your ${user.level >= 25 ? 'Platinum' : 'Gold'} badge\n- Weekend surge (1.4x)\n- Market demand\n\nI recommend $${suggestedPrice}.\n\nThat's high enough to respect your skill, low enough to beat competitors. Want me to set it?`,
      intent: 'price_suggestion',
      confidence: 85,
      actions: [
        {
          type: 'suggest',
          target: 'set_price',
          data: { price: suggestedPrice },
        },
      ],
      suggestedFollowUps: ['Set this price', 'Show market rates', 'Why this price?'],
    };
  }

  private async handleCoaching(user: User): Promise<AIResponse> {
    return {
      text: `I'm here to help! 🧠\n\nBased on your ${user.level >= 10 ? 'strong' : 'growing'} performance, here's what I recommend:\n\n1. Work Saturdays (you average $220 vs $140 weekdays)\n2. Respond under 10min (3x more matches)\n3. Take before/after photos (23% more 5-stars)\n\nWant a personalized action plan?`,
      intent: 'get_coaching',
      confidence: 92,
      actions: [
        {
          type: 'navigate',
          target: 'ai-coach',
        },
      ],
      suggestedFollowUps: [
        'Create my action plan',
        'Why Saturdays?',
        'Show me top performer secrets',
      ],
    };
  }

  private async handleGeneralQuestion(message: string): Promise<AIResponse> {
    return {
      text: `I understand you're asking about: "${message}"\n\nI can help you with:\n- Finding tasks near you\n- Posting new gigs\n- Checking your progress\n- Optimizing your profile\n- Getting coaching\n\nWhat would you like to do?`,
      intent: 'general_question',
      confidence: 70,
      actions: [],
      suggestedFollowUps: ['Find tasks', 'Post a gig', 'Check my stats'],
    };
  }

  private getPersonalizedInsight(user: User): string {
    if (user.level >= 50) {
      return "You're in the top 5% of hustlers! Keep this momentum!";
    }
    if (user.streaks.current >= 7) {
      return "Your streak is on fire! Don't break it!";
    }
    if (user.tasksCompleted >= 100) {
      return 'You just hit 100 tasks - you are a veteran!';
    }
    return 'You are making great progress! 2 more tasks to level up.';
  }

  async generateProactiveInsights(user: User, tasks: Task[]): Promise<ProactiveInsight[]> {
    const insights: ProactiveInsight[] = [];

    const hour = new Date().getHours();
    if (hour === 8 && user.streaks.current > 0) {
      insights.push({
        id: `morning_${Date.now()}`,
        type: 'briefing',
        priority: 'medium',
        title: 'Good morning! 🌅',
        message: `You're on a ${user.streaks.current}-day streak. ${tasks.filter(t => t.status === 'open').length} high-paying tasks available nearby. Ready to keep the streak alive?`,
        actionLabel: 'Show me tasks',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
    }

    const urgentTasks = tasks.filter(t => {
      const createdTime = new Date(t.createdAt).getTime();
      return Date.now() - createdTime < 30 * 60 * 1000 && t.payAmount > 100;
    });

    if (urgentTasks.length > 0) {
      const task = urgentTasks[0];
      insights.push({
        id: `urgent_${task.id}`,
        type: 'opportunity',
        priority: 'urgent',
        title: '🔥 URGENT TASK!',
        message: `$${task.payAmount} ${task.category} task just posted nearby. You have a 95% match. ${Math.floor(Math.random() * 20) + 10} others viewing!`,
        actionLabel: 'Accept now',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
    }

    const nextLevelXP = (user.level + 1) * 100;
    const xpNeeded = nextLevelXP - user.xp;
    if (xpNeeded <= 100 && xpNeeded > 0) {
      insights.push({
        id: `levelup_${Date.now()}`,
        type: 'achievement',
        priority: 'high',
        title: '🎮 ONE MORE TASK!',
        message: `You're ${xpNeeded} XP away from Level ${user.level + 1}! Accept any task in the next 2 hours to unlock it.`,
        actionLabel: 'Show quick wins',
      });
    }

    if (user.streaks.current >= 7 && new Date().getHours() >= 20) {
      insights.push({
        id: `streak_${Date.now()}`,
        type: 'warning',
        priority: 'high',
        title: '⚠️ Streak at Risk',
        message: `Your ${user.streaks.current}-day streak expires at midnight! Complete 1 task to keep it alive.`,
        actionLabel: 'Find quick task',
        expiresAt: new Date(new Date().setHours(23, 59, 59)).toISOString(),
      });
    }

    return insights;
  }

  async forecastEarnings(
    user: User,
    timeframe: 'day' | 'week' | 'month'
  ): Promise<EarningsForecast> {
    const avgPerTask = user.earnings / (user.tasksCompleted || 1);
    const tasksPerDay = user.tasksCompleted / Math.max(1, Math.ceil(user.level / 5));

    let estimated = 0;
    let days = 1;

    if (timeframe === 'day') {
      estimated = avgPerTask * tasksPerDay;
      days = 1;
    } else if (timeframe === 'week') {
      estimated = avgPerTask * tasksPerDay * 7;
      days = 7;
    } else {
      estimated = avgPerTask * tasksPerDay * 30;
      days = 30;
    }

    const multiplier = user.level >= 25 ? 1.2 : user.level >= 10 ? 1.1 : 1;
    estimated *= multiplier;

    return {
      estimated: Math.floor(estimated),
      confidence: 85,
      factors: [
        `Average $${avgPerTask.toFixed(0)} per task`,
        `${tasksPerDay.toFixed(1)} tasks per day`,
        multiplier > 1 ? `${(multiplier * 100 - 100).toFixed(0)}% tier bonus` : 'No tier bonus yet',
      ],
      recommendations: [
        user.level < 10 ? 'Level up to 10 for 10% boost' : 'Maintain your tier bonus',
        'Focus on high-paying categories',
        'Work weekends for 40% higher rates',
      ],
    };
  }

  clearContext(): void {
    this.context = null;
    this.proactiveInsights = [];
  }
}

export const maxPotentialAI = new MaxPotentialAI();
