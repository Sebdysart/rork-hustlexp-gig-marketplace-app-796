import { Platform } from 'react-native';

const API_BASE_URL = 'https://lunch-garden-dycejr.replit.app/api';

export interface MatchFeedback {
  userId: string;
  taskId: string;
  action: 'match_accept' | 'match_reject';
  taskDetails?: {
    matchAccepted: boolean;
    matchScore: number;
    aiConfidence: number;
    rejectionReason?: string;
  };
}

export interface CompletionFeedback {
  userId: string;
  taskId: string;
  action: 'task_complete';
  taskDetails?: {
    rating: number;
    matchScore: number;
    actualScore: number;
    completionTime: number;
    pricingFair: boolean;
    predictedDuration?: number;
    predictedPrice?: number;
    actualPrice?: number;
  };
}

export interface TradeFeedback {
  userId: string;
  taskId: string;
  action: 'trade_complete';
  taskDetails?: {
    completionTime: number;
    pricingFair: boolean;
    certificationUsed?: string;
    squadSize?: number;
    metadata: {
      aiEstimatedDuration?: number;
      actualDuration: number;
      aiEstimatedPrice?: number;
      actualPrice: number;
    };
  };
}

export interface FeedbackResponse {
  success: boolean;
  analysis?: {
    accuracy: number;
    trend: string;
    insights: string[];
    recommendations: string[];
  };
  error?: string;
}

export interface AIUserProfile {
  userId: string;
  totalTasks: number;
  preferredCategories: Array<{ category: string; frequency: number }>;
  priceRange: { min: number; max: number };
  acceptancePatterns: {
    timeOfDay: Array<{ hour: number; frequency: number }>;
    dayOfWeek: Array<{ day: string; frequency: number }>;
  };
  rejectionReasons: Array<{ reason: string; count: number }>;
  averageTaskDuration: number;
  lastActive: string;
  aiInsights: string[];
  recommendedFilters: {
    categories: string[];
    priceMin: number;
    priceMax: number;
    urgency: string[];
  };
}

export interface ExperimentTracking {
  userId: string;
  experimentId: string;
  variant: 'control' | 'test_a' | 'test_b';
  successMetric: string;
  metricValue: number;
  metadata?: Record<string, any>;
}

export interface CalibrationMetric {
  metric: string;
  currentValue: number;
  successRate: number;
  sampleSize: number;
  recommendation: string;
  suggestedValue: number;
  confidence: number;
  shouldUpdate: boolean;
  trend: 'up' | 'down' | 'stable';
}

export class AIFeedbackService {
  private static instance: AIFeedbackService;
  private feedbackQueue: Array<MatchFeedback | CompletionFeedback | TradeFeedback> = [];
  private isProcessing = false;

  private constructor() {
    if (Platform.OS !== 'web') {
      this.startQueueProcessor();
    }
  }

  static getInstance(): AIFeedbackService {
    if (!AIFeedbackService.instance) {
      AIFeedbackService.instance = new AIFeedbackService();
    }
    return AIFeedbackService.instance;
  }

  async submitMatchFeedback(feedback: MatchFeedback): Promise<FeedbackResponse> {
    console.log('[AIFeedback] Submitting match feedback:', JSON.stringify(feedback));
    
    if (!feedback.action) {
      console.error('[AIFeedback] ERROR: Missing action field in feedback!');
      return { success: false, error: 'Missing action field' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AIFeedback] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[AIFeedback] Match feedback response:', data);
      return { success: true, ...data };
    } catch (error) {
      console.error('[AIFeedback] Failed to submit match feedback:', error);
      this.queueFeedback(feedback);
      return { success: false, error: String(error) };
    }
  }

  async submitCompletionFeedback(feedback: CompletionFeedback): Promise<FeedbackResponse> {
    console.log('[AIFeedback] Submitting completion feedback:', JSON.stringify(feedback));
    
    if (!feedback.action) {
      console.error('[AIFeedback] ERROR: Missing action field in feedback!');
      return { success: false, error: 'Missing action field' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AIFeedback] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[AIFeedback] Completion feedback response:', data);
      return { success: true, ...data };
    } catch (error) {
      console.error('[AIFeedback] Failed to submit completion feedback:', error);
      this.queueFeedback(feedback);
      return { success: false, error: String(error) };
    }
  }

  async submitTradeFeedback(feedback: TradeFeedback): Promise<FeedbackResponse> {
    console.log('[AIFeedback] Submitting trade feedback:', JSON.stringify(feedback));
    
    if (!feedback.action) {
      console.error('[AIFeedback] ERROR: Missing action field in feedback!');
      return { success: false, error: 'Missing action field' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AIFeedback] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[AIFeedback] Trade feedback response:', data);
      return { success: true, ...data };
    } catch (error) {
      console.error('[AIFeedback] Failed to submit trade feedback:', error);
      this.queueFeedback(feedback);
      return { success: false, error: String(error) };
    }
  }

  async fetchAIProfile(userId: string, retryCount = 0): Promise<AIUserProfile | null> {
    console.log('[AIFeedback] Fetching AI profile for user:', userId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile/ai`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        if (retryCount < 3) {
          const backoffMs = Math.pow(2, retryCount) * 1000;
          console.log(`[AIFeedback] Rate limited. Retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          return this.fetchAIProfile(userId, retryCount + 1);
        }
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[AIFeedback] AI profile response received:', data);
      
      if (data.success && data.aiProfile) {
        const profile = data.aiProfile;
        const mapped: AIUserProfile = {
          userId: data.userId || userId,
          totalTasks: profile.totalInteractions || 0,
          preferredCategories: Array.isArray(profile.preferredCategories) 
            ? profile.preferredCategories 
            : [],
          priceRange: profile.preferredPriceRange || { min: 20, max: 200 },
          acceptancePatterns: {
            timeOfDay: Array.isArray(profile.preferredHours)
              ? profile.preferredHours.map((hour: number) => ({ hour, frequency: 1 }))
              : [],
            dayOfWeek: [],
          },
          rejectionReasons: [],
          averageTaskDuration: 60,
          lastActive: profile.lastUpdated || new Date().toISOString(),
          aiInsights: Array.isArray(profile.behavioralInsights) 
            ? profile.behavioralInsights 
            : [],
          recommendedFilters: profile.recommendedFilters || {
            categories: [],
            priceMin: 20,
            priceMax: 200,
            urgency: [],
          },
        };
        
        console.log('[AIFeedback] AI profile mapped successfully');
        return mapped;
      }
      
      console.log('[AIFeedback] Using legacy format');
      return data;
    } catch (error) {
      console.error('[AIFeedback] Failed to fetch AI profile:', error);
      return null;
    }
  }

  async trackExperiment(tracking: ExperimentTracking): Promise<{ success: boolean }> {
    console.log('[AIFeedback] Tracking experiment:', tracking);
    
    try {
      const response = await fetch(`${API_BASE_URL}/experiments/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tracking),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[AIFeedback] Experiment tracked:', data);
      return { success: true };
    } catch (error) {
      console.error('[AIFeedback] Failed to track experiment:', error);
      return { success: false };
    }
  }

  async fetchCalibration(metric?: string): Promise<CalibrationMetric[]> {
    console.log('[AIFeedback] Fetching calibration metrics');
    
    try {
      const url = metric 
        ? `${API_BASE_URL}/system/calibration?metric=${metric}`
        : `${API_BASE_URL}/system/calibration`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[AIFeedback] Calibration metrics fetched:', data);
      return data.metrics || [];
    } catch (error) {
      console.error('[AIFeedback] Failed to fetch calibration:', error);
      return [];
    }
  }

  private queueFeedback(feedback: MatchFeedback | CompletionFeedback | TradeFeedback): void {
    this.feedbackQueue.push(feedback);
    console.log(`[AIFeedback] Queued feedback. Queue size: ${this.feedbackQueue.length}`);
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (!this.isProcessing && this.feedbackQueue.length > 0) {
        this.processQueue();
      }
    }, 30000);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.feedbackQueue.length === 0) return;

    this.isProcessing = true;
    console.log(`[AIFeedback] Processing queue with ${this.feedbackQueue.length} items`);

    while (this.feedbackQueue.length > 0) {
      const feedback = this.feedbackQueue[0];
      
      try {
        await fetch(`${API_BASE_URL}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedback),
        });
        
        this.feedbackQueue.shift();
        console.log('[AIFeedback] Queued feedback submitted successfully');
      } catch (error) {
        console.error('[AIFeedback] Failed to process queued feedback:', error);
        break;
      }
    }

    this.isProcessing = false;
  }

  getQueueSize(): number {
    return this.feedbackQueue.length;
  }
}

export const aiFeedbackService = AIFeedbackService.getInstance();
