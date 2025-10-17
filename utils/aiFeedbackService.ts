import { Platform } from 'react-native';

const API_BASE_URL = 'https://35e59b08-e7a7-448e-ae3a-4ff316aab102-00-31edtpdmpi4hm.picard.replit.dev/api';

export interface MatchFeedback {
  userId: string;
  taskId: string;
  feedbackType: 'match';
  matchAccepted: boolean;
  matchScore: number;
  aiConfidence: number;
  rejectionReason?: string;
}

export interface CompletionFeedback {
  userId: string;
  taskId: string;
  feedbackType: 'completion';
  rating: number;
  matchScore: number;
  actualScore: number;
  completionTime: number;
  pricingFair: boolean;
  predictedDuration?: number;
  predictedPrice?: number;
  actualPrice?: number;
}

export interface TradeFeedback {
  userId: string;
  taskId: string;
  feedbackType: 'trade_completion';
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
    console.log('[AIFeedback] Submitting match feedback:', feedback);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
    console.log('[AIFeedback] Submitting completion feedback:', feedback);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
    console.log('[AIFeedback] Submitting trade feedback:', feedback);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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

  async fetchAIProfile(userId: string): Promise<AIUserProfile | null> {
    console.log('[AIFeedback] Fetching AI profile for user:', userId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile/ai`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[AIFeedback] AI profile fetched:', data);
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
