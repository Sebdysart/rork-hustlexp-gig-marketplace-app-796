import { api } from '@/utils/api';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  profilePic: string;
  rank: number;
  score: number;
}

export interface PerformanceDashboard {
  totalTasks: number;
  completionRate: number;
  averageRating: number;
  totalEarnings: number;
  skillProgression: Record<string, number>;
  recentAchievements: string[];
}

export interface MarketForecast {
  category: string;
  predictedDemand: number;
  suggestedPricing: { min: number; max: number };
  reasoning: string;
}

export class AnalyticsService {
  async getLeaderboard(type: 'xp' | 'earnings' | 'tasks' | 'trust', limit: number = 100): Promise<LeaderboardEntry[]> {
    return api.get<LeaderboardEntry[]>('/analytics/leaderboard', { type, limit });
  }

  async getPerformanceDashboard(userId?: string): Promise<PerformanceDashboard> {
    return api.get<PerformanceDashboard>('/analytics/performance', userId ? { userId } : undefined);
  }

  async getSkillProgression(userId?: string): Promise<Record<string, {
    level: number;
    xp: number;
    nextLevelXP: number;
    tasksCompleted: number;
  }>> {
    return api.get('/analytics/skills', userId ? { userId } : undefined);
  }

  async getMarketForecasts(): Promise<MarketForecast[]> {
    return api.get<MarketForecast[]>('/analytics/forecasts');
  }

  async getEarningsInsights(timeframe: 'week' | 'month' | 'year'): Promise<{
    total: number;
    byCategory: Record<string, number>;
    trend: 'up' | 'down' | 'stable';
    projection: number;
  }> {
    return api.get('/analytics/earnings', { timeframe });
  }
}

export const analyticsService = new AnalyticsService();
