import { api } from '@/utils/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  userId: string;
  message: string;
  context: {
    screen?: string;
    language?: string;
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
    conversationHistory?: ChatMessage[];
  };
}

export interface ChatAction {
  id: string;
  type: 'navigate' | 'execute' | 'filter';
  label: string;
  screen?: string;
  params?: any;
  taskId?: string;
  requireConfirmation?: boolean;
  filters?: any;
}

export interface ChatHighlight {
  elementId: string;
  message: string;
  duration: number;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ChatResponse {
  response: string;
  confidence: number;
  suggestions: string[];
  actions: ChatAction[];
  highlights: ChatHighlight[];
  metadata: {
    model: string;
    tokens: number;
    processingTime: number;
    cached: boolean;
    language: string;
  };
}

export interface TaskParseRequest {
  userId: string;
  input: string;
  context: {
    userLocation?: { lat: number; lng: number };
    currentTime?: string;
    language?: string;
  };
}

export interface ParsedTask {
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
}

export interface TaskParseResponse {
  task: ParsedTask;
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

export interface MatchWorkerRequest {
  taskId: string;
  task: {
    category: string;
    location: { lat: number; lng: number };
    pay: number;
    urgency: 'low' | 'medium' | 'high';
    requirements?: string[];
    deadline?: string;
  };
  limit?: number;
}

export interface WorkerMatch {
  userId: string;
  score: number;
  rank: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  stats: {
    distance: number;
    rating: number;
    tasksCompleted: number;
    categoryExperience: number;
    completionRate: number;
    onTimeRate: number;
    averageRating: number;
  };
  predictions: {
    acceptanceProbability: number;
    completionProbability: number;
    onTimeProbability: number;
    estimatedArrival: string;
    estimatedCompletion: string;
  };
  earnings: {
    taskPay: number;
    potentialBonus: number;
    xpGain: number;
    badgeProgress: Record<string, string>;
  };
}

export interface MatchWorkerResponse {
  matches: WorkerMatch[];
  summary: {
    totalCandidates: number;
    perfectMatches: number;
    goodMatches: number;
    averageDistance: number;
    averageScore: number;
    recommendedWorker: string;
  };
  metadata: {
    processingTime: number;
    model: string;
  };
}

export interface MatchTaskRequest {
  userId: string;
  context: {
    location: { lat: number; lng: number };
    availability: string;
    preferences: {
      categories: string[];
      maxDistance: number;
      minPay: number;
    };
  };
  limit?: number;
}

export interface TaskMatch {
  taskId: string;
  matchScore: number;
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
}

export interface TaskBundle {
  bundleId: string;
  tasks: string[];
  matchScore: number;
  reasoning: string;
  totalEarnings: number;
  totalDistance: number;
  totalTime: string;
  efficiencyGain: number;
  route: Array<{
    taskId: string;
    order: number;
    distance: number;
  }>;
  highlights: string[];
}

export interface MatchTaskResponse {
  recommendations: TaskMatch[];
  bundles: TaskBundle[];
  metadata: {
    processingTime: number;
    totalTasksAnalyzed: number;
  };
}

export interface AnalyzePatternsRequest {
  userId: string;
  timeframe: '7days' | '30days' | '90days';
  includeRecommendations?: boolean;
  analysisTypes?: string[];
}

export interface UserPattern {
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
    avoided: Array<{
      category: string;
      reason: string;
    }>;
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
}

export interface AnalyzePatternsResponse {
  userId: string;
  timeframe: string;
  patterns: UserPattern;
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

export interface RecommendationsRequest {
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
  recommendationType?: 'proactive' | 'reactive';
}

export interface Recommendation {
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
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  bundles: TaskBundle[];
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

export interface FeedbackRequest {
  userId: string;
  feedbackType: 'task_outcome' | 'recommendation' | 'prediction' | 'general';
  data: {
    taskId?: string;
    prediction?: any;
    actual?: any;
    context?: any;
  };
}

export interface FeedbackResponse {
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

export interface VoiceToTaskRequest {
  audioFile: File;
  userId: string;
  language?: string;
}

export interface VoiceToTaskResponse {
  transcript: string;
  confidence: number;
  language: string;
  parsedTask: ParsedTask;
  suggestions: {
    improvements: string[];
    payAdjustment?: {
      suggested: number;
      reasoning: string;
    };
  };
  metadata: {
    processingTime: number;
    audioLength: number;
    model: string;
  };
}

export interface ImageMatchRequest {
  imageFile: File;
  userId: string;
}

export interface ImageMatchResponse {
  imageAnalysis: {
    detectedObjects: Array<{
      object: string;
      confidence: number;
      boundingBox: any;
    }>;
    scene: string;
    complexity: 'easy' | 'medium' | 'hard';
  };
  suggestedCategory: string;
  estimatedTaskDetails: {
    type: string;
    items: string[];
    estimatedWeight: string;
    estimatedPeople: number;
    estimatedTime: string;
    estimatedPay: { min: number; max: number };
  };
  similarTasks: Array<{
    taskId: string;
    similarity: number;
    title: string;
    category: string;
    pay: number;
    image: string;
  }>;
  metadata: {
    processingTime: number;
    model: string;
  };
}

export interface TranslateRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  metadata: {
    processingTime: number;
    model: string;
  };
}

export class AIService {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return api.post<ChatResponse>('/api/agent/chat', request);
  }

  async parseTask(request: TaskParseRequest): Promise<TaskParseResponse> {
    return api.post<TaskParseResponse>('/api/agent/chat', {
      userId: request.userId,
      message: request.input,
      context: request.context
    });
  }

  async matchWorkers(request: MatchWorkerRequest): Promise<MatchWorkerResponse> {
    return api.post<MatchWorkerResponse>('/api/ai/match-task', request);
  }

  async matchTasks(request: MatchTaskRequest): Promise<MatchTaskResponse> {
    return api.get<MatchTaskResponse>(`/api/dashboard/unified/${request.userId}`);
  }

  async analyzePatterns(request: AnalyzePatternsRequest): Promise<AnalyzePatternsResponse> {
    return api.get<AnalyzePatternsResponse>(`/api/dashboard/progress/${request.userId}`);
  }

  async getRecommendations(request: RecommendationsRequest): Promise<RecommendationsResponse> {
    return api.get<RecommendationsResponse>(`/api/dashboard/action-suggestions/${request.userId}`);
  }

  async sendFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    return api.post<FeedbackResponse>('/api/agent/chat', {
      userId: request.userId,
      message: `Feedback: ${JSON.stringify(request.data)}`,
      context: { feedbackType: request.feedbackType }
    });
  }

  async voiceToTask(request: VoiceToTaskRequest): Promise<VoiceToTaskResponse> {
    const formData = new FormData();
    formData.append('audioFile', request.audioFile as any);
    formData.append('userId', request.userId);
    if (request.language) {
      formData.append('language', request.language);
    }
    return api.uploadFile('/api/ai/voice-to-task', formData as any);
  }

  async imageMatch(request: ImageMatchRequest): Promise<ImageMatchResponse> {
    const formData = new FormData();
    formData.append('imageFile', request.imageFile as any);
    formData.append('userId', request.userId);
    return api.uploadFile('/api/ai/image-match', formData as any);
  }

  async translate(request: TranslateRequest): Promise<TranslateResponse> {
    return api.post<TranslateResponse>('/api/ai/translate', request);
  }

  async getTierInfo(userId: string): Promise<any> {
    return api.get<any>(`/api/ai/tier-info/${userId}`);
  }
}

export const aiService = new AIService();
