import { api } from '@/utils/api';

export interface VerifyQualityRequest {
  taskId: string;
  images: string[];
  description: string;
}

export interface QualityVerificationResult {
  score: number;
  feedback: string;
  issues: string[];
  approved: boolean;
}

export interface CoachingSession {
  sessionId: string;
  taskId: string;
  currentStep: number;
  totalSteps: number;
  guidance: string;
}

export interface TaskRecommendation {
  taskId: string;
  matchScore: number;
  reasoning: string;
  estimatedEarnings: number;
}

export interface FraudAnalysisResult {
  userId: string;
  riskScore: number;
  flags: string[];
  recommendation: 'approve' | 'review' | 'block';
}

export class AIService {
  async verifyQuality(data: VerifyQualityRequest): Promise<QualityVerificationResult> {
    return api.post<QualityVerificationResult>('/multimodal/verify-quality', data);
  }

  async parseVoiceToTask(audioFile: File): Promise<{
    title: string;
    description: string;
    category: string;
    estimatedPay: number;
  }> {
    return api.uploadFile('/multimodal/voice-to-task', audioFile as any);
  }

  async findSimilarTasks(imageFile: File): Promise<{
    tasks: any[];
    similarity: number[];
  }> {
    return api.uploadFile('/multimodal/image-match', imageFile as any);
  }

  async startCoachingSession(taskId: string): Promise<CoachingSession> {
    return api.post<CoachingSession>('/coach/start-session', { taskId });
  }

  async getGuidance(sessionId: string, currentProgress: {
    completedSteps: number;
    notes?: string;
  }): Promise<{ guidance: string; nextSteps: string[] }> {
    return api.post(`/coach/get-guidance`, { sessionId, ...currentProgress });
  }

  async updateProgress(sessionId: string, progress: {
    step: number;
    completed: boolean;
    timeSpent: number;
  }): Promise<void> {
    await api.post(`/coach/update-progress`, { sessionId, ...progress });
  }

  async endCoachingSession(sessionId: string, feedback?: {
    helpful: boolean;
    rating: number;
    comments?: string;
  }): Promise<void> {
    await api.post(`/coach/end-session`, { sessionId, feedback });
  }

  async getRecommendations(preferences?: {
    categories?: string[];
    priceRange?: { min: number; max: number };
    maxDistance?: number;
  }): Promise<TaskRecommendation[]> {
    return api.post<TaskRecommendation[]>('/recommendations/tasks', preferences);
  }

  async optimizeRoute(taskIds: string[]): Promise<{
    optimizedOrder: string[];
    totalDistance: number;
    estimatedTime: number;
  }> {
    return api.post('/recommendations/route-optimize', { taskIds });
  }

  async forecastEarnings(timeframe: 'day' | 'week' | 'month'): Promise<{
    estimated: number;
    confidence: number;
    factors: string[];
  }> {
    return api.post('/recommendations/earnings-forecast', { timeframe });
  }

  async analyzeFraudRisk(userId: string): Promise<FraudAnalysisResult> {
    return api.post<FraudAnalysisResult>('/fraud/analyze-behavior', { userId });
  }

  async checkVelocity(userId: string): Promise<{
    suspicious: boolean;
    metrics: {
      tasksPerHour: number;
      earningsPerHour: number;
    };
  }> {
    return api.post('/fraud/velocity-check', { userId });
  }

  async analyzeFraudNetwork(userId: string): Promise<{
    connectedUsers: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    return api.post('/fraud/network-analysis', { userId });
  }

  async getPlatformHealth(): Promise<{
    supplyDemandRatio: number;
    activeWorkers: number;
    openTasks: number;
    categoryHealth: Record<string, number>;
  }> {
    return api.post('/platform-health/marketplace');
  }

  async predictChurn(): Promise<{
    atRiskUsers: {
      userId: string;
      churnProbability: number;
      reasons: string[];
    }[];
  }> {
    return api.post('/platform-health/predict-churn');
  }
}

export const aiService = new AIService();
