import { api } from '@/utils/api';

export interface MaxPotentialDashboardResponse {
  user: {
    id: string;
    name: string;
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
    gritCoins: number;
    trustScore: number;
    tier: string;
    tierProgress: number;
    dailyStreak: number;
    completionRate: number;
    totalTasksCompleted: number;
    avatar: string;
    badges: string[];
  };
  matches: {
    instant: Array<{
      taskId: string;
      title: string;
      description: string;
      earnings: number;
      xpReward: number;
      matchScore: number;
      distance: number;
      category: string;
      estimatedDuration: number;
      urgency: 'low' | 'medium' | 'high';
      poster: {
        name: string;
        trustScore: number;
        completedTasks: number;
      };
    }>;
    nearPerfect: Array<{
      taskId: string;
      title: string;
      description: string;
      earnings: number;
      xpReward: number;
      matchScore: number;
      distance: number;
      category: string;
      estimatedDuration: number;
      urgency: 'low' | 'medium' | 'high';
      poster: {
        name: string;
        trustScore: number;
        completedTasks: number;
      };
    }>;
  };
  progression: {
    currentTier: string;
    nextTier: string;
    xpToNextTier: number;
    percentToNextTier: number;
    unlockedFeatures: string[];
    nextFeatures: string[];
    prestigeLevel: number;
  };
  todayStats: {
    tasksCompleted: number;
    xpEarned: number;
    coinsEarned: number;
    activeStreak: number;
    perfectDays: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'task_completed' | 'level_up' | 'badge_earned' | 'tier_upgraded';
    title: string;
    description: string;
    timestamp: string;
    xpGained?: number;
    coinsGained?: number;
    badge?: string;
  }>;
  suggestions: {
    nextBestActions: Array<{
      type: 'task' | 'quest' | 'skill' | 'social';
      title: string;
      description: string;
      xpPotential: number;
      coinsPotential: number;
      priority: 'high' | 'medium' | 'low';
      estimatedTime: number;
    }>;
    personalizedTips: string[];
  };
}

export interface TaskFeedResponse {
  feed: {
    topMatches: Array<{
      taskId: string;
      title: string;
      description: string;
      earnings: number;
      xpReward: number;
      matchScore: number;
      matchReason: string[];
      distance: number;
      location: string;
      category: string;
      subcategory: string;
      estimatedDuration: number;
      urgency: 'low' | 'medium' | 'high';
      requiredSkills: string[];
      preferredSkills: string[];
      poster: {
        id: string;
        name: string;
        avatar: string;
        trustScore: number;
        completedTasks: number;
        rating: number;
      };
      postedAt: string;
      expiresAt: string;
      applicants: number;
      maxApplicants: number;
    }>;
    excellentMatches: Array<{
      taskId: string;
      title: string;
      description: string;
      earnings: number;
      xpReward: number;
      matchScore: number;
      matchReason: string[];
      distance: number;
      location: string;
      category: string;
      subcategory: string;
      estimatedDuration: number;
      urgency: 'low' | 'medium' | 'high';
      requiredSkills: string[];
      preferredSkills: string[];
      poster: {
        id: string;
        name: string;
        avatar: string;
        trustScore: number;
        completedTasks: number;
        rating: number;
      };
      postedAt: string;
      expiresAt: string;
      applicants: number;
      maxApplicants: number;
    }>;
    goodMatches: Array<{
      taskId: string;
      title: string;
      description: string;
      earnings: number;
      xpReward: number;
      matchScore: number;
      matchReason: string[];
      distance: number;
      location: string;
      category: string;
      subcategory: string;
      estimatedDuration: number;
      urgency: 'low' | 'medium' | 'high';
      requiredSkills: string[];
      preferredSkills: string[];
      poster: {
        id: string;
        name: string;
        avatar: string;
        trustScore: number;
        completedTasks: number;
        rating: number;
      };
      postedAt: string;
      expiresAt: string;
      applicants: number;
      maxApplicants: number;
    }>;
    otherTasks: Array<{
      taskId: string;
      title: string;
      description: string;
      earnings: number;
      xpReward: number;
      matchScore: number;
      distance: number;
      location: string;
      category: string;
      subcategory: string;
      estimatedDuration: number;
      urgency: 'low' | 'medium' | 'high';
      poster: {
        id: string;
        name: string;
        avatar: string;
        trustScore: number;
        completedTasks: number;
        rating: number;
      };
      postedAt: string;
      expiresAt: string;
      applicants: number;
      maxApplicants: number;
    }>;
  };
  summary: {
    totalAvailable: number;
    matchQualityDistribution: {
      instant: number;
      excellent: number;
      good: number;
      other: number;
    };
    avgEarnings: number;
    avgMatchScore: number;
  };
  filters: {
    categories: string[];
    earningsRange: { min: number; max: number };
    distanceRange: { min: number; max: number };
  };
  total: number;
  page: number;
  limit: number;
}

export interface ProgressSummaryResponse {
  period: string;
  summary: {
    totalXP: number;
    xpGrowth: number;
    tasksCompleted: number;
    tasksGrowth: number;
    coinsEarned: number;
    coinsGrowth: number;
    avgDailyXP: number;
    peakDay: {
      date: string;
      xp: number;
    };
  };
  progression: {
    levelsGained: number;
    badgesEarned: string[];
    skillsImproved: Array<{
      skill: string;
      before: number;
      after: number;
      growth: number;
    }>;
    milestones: Array<{
      type: string;
      title: string;
      achievedAt: string;
    }>;
  };
  chartData: {
    xpByDay: Array<{
      date: string;
      xp: number;
      tasks: number;
    }>;
    xpByType: Array<{
      type: string;
      xp: number;
      percentage: number;
    }>;
  };
  breakdown: {
    byCategory: Array<{
      category: string;
      tasks: number;
      xp: number;
      earnings: number;
    }>;
    byDifficulty: Array<{
      difficulty: string;
      tasks: number;
      xp: number;
      successRate: number;
    }>;
  };
}

export interface NextTierResponse {
  currentTier: {
    name: string;
    level: number;
    minXP: number;
    features: string[];
    perks: string[];
  };
  nextTier: {
    name: string;
    level: number;
    minXP: number;
    features: string[];
    perks: string[];
  };
  progress: {
    currentXP: number;
    xpRequired: number;
    xpRemaining: number;
    percentComplete: number;
    estimatedDays: number;
  };
  upgradePreviews: Array<{
    feature: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export interface TierClaimResponse {
  success: boolean;
  newTier: {
    name: string;
    level: number;
    features: string[];
    perks: string[];
  };
  rewards: {
    gritCoins: number;
    badges: string[];
    xpBonus: number;
  };
  celebration: {
    message: string;
    animation: string;
    duration: number;
  };
}

export class MaxPotentialService {
  async getDashboard(useMock: boolean = false): Promise<MaxPotentialDashboardResponse> {
    const params = useMock ? { mock: 'true' } : {};
    return api.get<MaxPotentialDashboardResponse>('/max-potential/dashboard', params);
  }

  async getTaskFeed(
    page: number = 1,
    limit: number = 20,
    filters?: {
      category?: string;
      minEarnings?: number;
      maxDistance?: number;
    },
    useMock: boolean = false
  ): Promise<TaskFeedResponse> {
    const params = {
      page: String(page),
      limit: String(limit),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.minEarnings && { minEarnings: String(filters.minEarnings) }),
      ...(filters?.maxDistance && { maxDistance: String(filters.maxDistance) }),
      ...(useMock && { mock: 'true' }),
    };
    return api.get<TaskFeedResponse>('/max-potential/task-feed', params);
  }

  async getProgressSummary(
    period: string = 'week',
    includeChartData: boolean = true,
    useMock: boolean = false
  ): Promise<ProgressSummaryResponse> {
    const params = {
      period,
      includeChartData: String(includeChartData),
      ...(useMock && { mock: 'true' }),
    };
    return api.get<ProgressSummaryResponse>('/max-potential/progress-summary', params);
  }

  async getNextTier(useMock: boolean = false): Promise<NextTierResponse> {
    const params = useMock ? { mock: 'true' } : {};
    return api.get<NextTierResponse>('/progression/next-tier', params);
  }

  async claimTier(useMock: boolean = false): Promise<TierClaimResponse> {
    const params = useMock ? { mock: 'true' } : {};
    return api.post<TierClaimResponse>('/progression/tier-claim', params);
  }
}

export const maxPotentialService = new MaxPotentialService();
