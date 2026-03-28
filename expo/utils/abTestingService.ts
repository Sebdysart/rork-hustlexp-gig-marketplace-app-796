import AsyncStorage from '@react-native-async-storage/async-storage';
import { aiFeedbackService, ExperimentTracking } from './aiFeedbackService';

const STORAGE_KEY = 'hustlexp_ab_experiments';

interface UserExperiment {
  experimentId: string;
  variant: 'control' | 'test_a' | 'test_b';
  assignedAt: string;
}

interface ExperimentConfig {
  id: string;
  name: string;
  variants: Array<'control' | 'test_a' | 'test_b'>;
  active: boolean;
}

const ACTIVE_EXPERIMENTS: ExperimentConfig[] = [
  {
    id: 'match_score_threshold_v1',
    name: 'Match Score Threshold',
    variants: ['control', 'test_a'],
    active: true,
  },
  {
    id: 'ai_chat_style_v1',
    name: 'AI Chat Response Style',
    variants: ['control', 'test_a'],
    active: true,
  },
  {
    id: 'pricing_suggestion_v1',
    name: 'AI Pricing Suggestions',
    variants: ['control', 'test_a'],
    active: true,
  },
];

export class ABTestingService {
  private static instance: ABTestingService;
  private userExperiments: Record<string, UserExperiment[]> = {};

  private constructor() {
    this.loadExperiments();
  }

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  private async loadExperiments(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.userExperiments = JSON.parse(stored);
        console.log('[ABTesting] Loaded experiments from storage');
      }
    } catch (error) {
      console.error('[ABTesting] Error loading experiments:', error);
    }
  }

  private async saveExperiments(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.userExperiments));
    } catch (error) {
      console.error('[ABTesting] Error saving experiments:', error);
    }
  }

  async assignVariant(
    userId: string,
    experimentId: string
  ): Promise<'control' | 'test_a' | 'test_b'> {
    const userExps = this.userExperiments[userId] || [];
    const existing = userExps.find(exp => exp.experimentId === experimentId);

    if (existing) {
      console.log(`[ABTesting] User ${userId} already assigned to ${existing.variant} for ${experimentId}`);
      return existing.variant;
    }

    const experiment = ACTIVE_EXPERIMENTS.find(exp => exp.id === experimentId);
    if (!experiment || !experiment.active) {
      console.log(`[ABTesting] Experiment ${experimentId} not active, defaulting to control`);
      return 'control';
    }

    const variant = experiment.variants[Math.floor(Math.random() * experiment.variants.length)];

    const newAssignment: UserExperiment = {
      experimentId,
      variant,
      assignedAt: new Date().toISOString(),
    };

    this.userExperiments[userId] = [...userExps, newAssignment];
    await this.saveExperiments();

    console.log(`[ABTesting] Assigned user ${userId} to ${variant} for ${experimentId}`);
    return variant;
  }

  async getVariant(userId: string, experimentId: string): Promise<'control' | 'test_a' | 'test_b'> {
    const userExps = this.userExperiments[userId] || [];
    const existing = userExps.find(exp => exp.experimentId === experimentId);

    if (existing) {
      return existing.variant;
    }

    return await this.assignVariant(userId, experimentId);
  }

  async trackExperimentOutcome(
    userId: string,
    experimentId: string,
    successMetric: string,
    metricValue: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    const variant = await this.getVariant(userId, experimentId);

    console.log(`[ABTesting] Tracking ${experimentId} outcome for ${userId}: ${successMetric}=${metricValue}`);

    const tracking: ExperimentTracking = {
      userId,
      experimentId,
      variant,
      successMetric,
      metricValue,
      metadata,
    };

    try {
      await aiFeedbackService.trackExperiment(tracking);
      console.log('[ABTesting] Experiment outcome tracked successfully');
    } catch (error) {
      console.error('[ABTesting] Failed to track experiment outcome:', error);
    }
  }

  getMatchScoreThreshold(userId: string): Promise<number> {
    return this.getVariant(userId, 'match_score_threshold_v1').then(variant => {
      switch (variant) {
        case 'test_a':
          return 65;
        case 'control':
        default:
          return 70;
      }
    });
  }

  getChatStyle(userId: string): Promise<'casual' | 'formal'> {
    return this.getVariant(userId, 'ai_chat_style_v1').then(variant => {
      switch (variant) {
        case 'test_a':
          return 'casual';
        case 'control':
        default:
          return 'formal';
      }
    });
  }

  getPricingMultiplier(userId: string): Promise<number> {
    return this.getVariant(userId, 'pricing_suggestion_v1').then(variant => {
      switch (variant) {
        case 'test_a':
          return 1.1;
        case 'control':
        default:
          return 1.0;
      }
    });
  }

  getActiveExperiments(): ExperimentConfig[] {
    return ACTIVE_EXPERIMENTS.filter(exp => exp.active);
  }

  getUserExperiments(userId: string): UserExperiment[] {
    return this.userExperiments[userId] || [];
  }
}

export const abTestingService = ABTestingService.getInstance();
