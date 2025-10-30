/**
 * HUSTLEAI Backend Client
 * Connects to your Replit-hosted AI engine
 */

const HUSTLEAI_PROD_URL = process.env.EXPO_PUBLIC_API_URL || 'https://LunchGarden.dycejr.replit.dev';
const HUSTLEAI_DEV_URL = process.env.EXPO_PUBLIC_HUSTLEAI_URL || HUSTLEAI_PROD_URL;

const API_BASE_URL = HUSTLEAI_PROD_URL;

export interface ChatMessage {
  userId: string;
  message: string;
}

export interface ChatResponse {
  response: string;
  actions?: any[];
  suggestions: string[];
  confidence: number;
}

export interface TaskParseRequest {
  userId: string;
  input: string;
}

export interface TaskParseResponse {
  title: string;
  description: string;
  category: string;
  estimatedPay: {
    min: number;
    max: number;
  };
  estimatedDuration: string;
  confidence: 'low' | 'medium' | 'high';
  suggestedSkills: string[];
  safetyNotes?: string;
  xpReward?: number;
}

export interface MatchRequest {
  taskId: string;
  userId?: string;
}

export interface MatchResponse {
  matches: Array<{
    userId: string;
    score: number;
    reasoning: string;
    strengths: string[];
    concerns?: string[];
    estimatedArrival?: string;
  }>;
}

export interface CoachingRequest {
  userId: string;
  context?: string;
}

export interface CoachingResponse {
  strengths: string[];
  improvements: string[];
  nextMilestone: string;
  tips: string[];
}

export interface FeedbackRequest {
  userId: string;
  taskId: string;
  predictionType: 'match_score' | 'pricing' | 'duration' | 'completion';
  predictedValue: number;
  actualValue: number;
  context?: Record<string, any>;
}

export interface FeedbackResponse {
  recorded: boolean;
  accuracy: number;
  insights: string[];
  recommendations: string[];
}

export interface UserProfileAI {
  userId: string;
  preferredCategories: string[];
  avgTaskPrice: number;
  peakActiveHours: number[];
  acceptanceRate: number;
  completionRate: number;
  rejectionReasons: string[];
  recommendations: string[];
}

export interface ExperimentTrackRequest {
  experimentId: string;
  userId: string;
  variant: 'control' | 'test_a' | 'test_b';
  outcome: 'success' | 'failure' | 'neutral';
  metrics: Record<string, number>;
}

export interface CalibrationResponse {
  currentThresholds: Record<string, number>;
  recommendations: Array<{
    threshold: string;
    currentValue: number;
    suggestedValue: number;
    reasoning: string;
    confidence: number;
  }>;
  appliedAt: string;
}

export interface FraudReportRequest {
  userId: string;
  reportedUserId: string;
  fraudType: string;
  description: string;
  evidence: Record<string, any>;
  taskId?: string;
}

export interface FraudReportResponse {
  reportId: string;
  confidence: number;
  matchingPatterns: string[];
  recommendedAction: 'investigate' | 'block' | 'monitor' | 'clear';
  reasoning: string;
}

export interface TradeParseRequest {
  userId: string;
  input: string;
}

export interface TradeParseResponse {
  success: boolean;
  trade: {
    title: string;
    description: string;
    tradeCategory: string;
    jobType: string;
    requiredCertifications: string[];
    requiredTools: string[];
    minimumBadgeLevel: string;
    priceMin: number;
    priceMax: number;
    estimatedHours: number;
    urgency: string;
  };
  confidence: number;
}

export interface TradeMatchResponse {
  taskId: string;
  matches: Array<{
    userId: string;
    matchScore: number;
    certificationMatch: number;
    toolMatch: number;
    experienceLevel: string;
    hourlyRate: number;
    availability: string;
  }>;
  totalMatches: number;
}

export interface SquadSuggestionRequest {
  jobDescription: string;
}

export interface SquadSuggestionResponse {
  requiredTrades: Array<{
    tradeCategory: string;
    role: string;
    estimatedHours: number;
    reasoning: string;
  }>;
  totalEstimatedCost: { min: number; max: number };
  projectTimeline: string;
}

interface RequestQueueItem {
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH';
  body?: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  retryCount: number;
}

class HustleAIClient {
  private baseURL: string;
  private requestQueue: RequestQueueItem[] = [];
  private isProcessingQueue = false;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private lastRequestTime = 0;
  private minRequestInterval = 1000; // Minimum 1 second between requests
  private maxRetries = 3;
  private rateLimitResetTime = 0;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    console.log('[HUSTLEAI] Client initialized with base URL:', this.baseURL);
  }

  private getCacheKey(endpoint: string, method: string, body?: any): string {
    return `${method}:${endpoint}:${body ? JSON.stringify(body) : ''}`;
  }

  private getFromCache(key: string, maxAge: number = 30000): any | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      console.log('[HUSTLEAI] Using cached response');
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.requestCache.set(key, { data, timestamp: Date.now() });
    
    // Clear old cache entries
    if (this.requestCache.size > 50) {
      const oldestKey = Array.from(this.requestCache.keys())[0];
      this.requestCache.delete(oldestKey);
    }
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    
    // If we're in a rate limit period, wait
    if (now < this.rateLimitResetTime) {
      const waitTime = this.rateLimitResetTime - now;
      console.log(`[HUSTLEAI] Rate limited. Waiting ${Math.ceil(waitTime / 1000)}s`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Ensure minimum interval between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' = 'GET',
    body?: any,
    useCache: boolean = true
  ): Promise<T> {
    // Check cache first for GET requests
    if (method === 'GET' && useCache) {
      const cacheKey = this.getCacheKey(endpoint, method, body);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    // Wait for rate limit
    await this.waitForRateLimit();

    const url = `${this.baseURL}${endpoint}`;
    console.log(`[HUSTLEAI] ${method} ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (response.status === 429) {
        // Handle rate limit
        const errorData = await response.json().catch(() => ({}));
        const retryAfter = errorData.retryAfter || 60;
        
        console.warn(`[HUSTLEAI] Rate limit hit. Retry after ${retryAfter}s`);
        this.rateLimitResetTime = Date.now() + (retryAfter * 1000);
        
        throw new Error(
          `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[HUSTLEAI] Error ${response.status}:`, errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[HUSTLEAI] Response received');
      
      // Cache GET requests
      if (method === 'GET' && useCache) {
        const cacheKey = this.getCacheKey(endpoint, method, body);
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('[HUSTLEAI] Request timeout after 8s');
          throw new Error('TIMEOUT');
        }
        if (error.message.includes('Rate limit')) {
          throw error; // Re-throw rate limit errors
        }
        if (error.message.includes('Failed to fetch')) {
          console.warn('[HUSTLEAI] Backend not reachable');
          throw new Error('BACKEND_OFFLINE');
        }
      }
      throw error;
    }
  }

  async chat(userId: string, message: string): Promise<ChatResponse> {
    const MAX_MESSAGE_LENGTH = 1000;
    
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
    }
    
    try {
      return await this.makeRequest<ChatResponse>('/api/agent/chat', 'POST', {
        userId,
        message,
      }, false); // Don't cache chat responses
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      
      if (errorMsg === 'TIMEOUT' || error?.name === 'AbortError') {
        console.log('[HUSTLEAI] ⚡ Quick response mode (backend slow)');
        return this.mockChat(message);
      }
      
      if (errorMsg === 'BACKEND_OFFLINE') {
        console.log('[HUSTLEAI] 🔌 Offline mode (backend unavailable)');
        return this.mockChat(message);
      }
      
      if (errorMsg.includes('Rate limit')) {
        console.warn('[HUSTLEAI] Rate limited, using mock response');
        return {
          response: "I'm getting a lot of requests right now! Let me help you with a quick response. What would you like to do?",
          suggestions: ['Find tasks', 'Post a task', 'Check my profile'],
          confidence: 60,
        };
      }
      
      console.warn('[HUSTLEAI] Falling back to mock chat response:', errorMsg);
      return this.mockChat(message);
    }
  }

  private mockChat(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
      return {
        response: "I'm here to help! Try saying things like 'Find me delivery gigs' or 'Need someone to walk my dog tomorrow'.",
        suggestions: ['Find gigs near me', 'Post a new task', 'Check my earnings'],
        confidence: 90,
      };
    }
    
    if (lowerMessage.includes('earn') || lowerMessage.includes('money')) {
      return {
        response: "Want to earn more? Complete more tasks to level up and unlock higher-paying gigs. Your trust score and completion rate also help you get matched faster!",
        suggestions: ['View available tasks', 'Check my stats', 'Level up tips'],
        confidence: 85,
      };
    }
    
    return {
      response: "I understand you're asking about: " + message + ". The AI backend is currently unavailable, but I can still help you navigate the app!",
      suggestions: ['Browse tasks', 'Post a gig', 'View profile'],
      confidence: 70,
    };
  }

  async parseTask(userId: string, input: string): Promise<TaskParseResponse> {
    try {
      const response = await this.makeRequest<any>('/tasks/parse', 'POST', {
        userId,
        input,
      }, false); // Don't cache task parsing
      
      if (response.success && response.task) {
        return {
          title: response.task.title,
          description: response.task.description || input,
          category: response.task.category,
          estimatedPay: {
            min: response.task.priceMin || 20,
            max: response.task.priceMax || 50,
          },
          estimatedDuration: response.task.duration || '1-2 hours',
          confidence: (response.task.confidence || 'medium') as 'low' | 'medium' | 'high',
          suggestedSkills: response.task.skills || [],
          safetyNotes: response.task.safetyNotes,
          xpReward: response.task.xpValue || 50,
        };
      }
      
      return response as TaskParseResponse;
    } catch (error: any) {
      if (error?.message?.includes('Rate limit')) {
        console.warn('[HUSTLEAI] Rate limited, using smart parsing');
      } else {
        console.warn('[HUSTLEAI] Falling back to mock task parsing');
      }
      return this.mockParseTask(input);
    }
  }

  private mockParseTask(input: string): TaskParseResponse {
    const lowerInput = input.toLowerCase();
    
    let category = 'other';
    let min = 20;
    let max = 50;
    let duration = '1-2 hours';
    let skills = ['General'];
    
    if (lowerInput.includes('dog') || lowerInput.includes('pet')) {
      category = 'pet_care';
      min = 15;
      max = 30;
      skills = ['Pet Care', 'Responsibility'];
    } else if (lowerInput.includes('clean')) {
      category = 'cleaning';
      min = 25;
      max = 60;
      duration = '2-4 hours';
      skills = ['Cleaning', 'Attention to Detail'];
    } else if (lowerInput.includes('move') || lowerInput.includes('furniture')) {
      category = 'moving';
      min = 50;
      max = 150;
      duration = '3-5 hours';
      skills = ['Physical Strength', 'Lifting'];
    } else if (lowerInput.includes('deliver')) {
      category = 'delivery';
      min = 10;
      max = 40;
      duration = '30min-1 hour';
      skills = ['Driving', 'Time Management'];
    } else if (lowerInput.includes('tutor') || lowerInput.includes('teach')) {
      category = 'tutoring';
      min = 30;
      max = 80;
      skills = ['Teaching', 'Communication'];
    } else if (lowerInput.includes('repair') || lowerInput.includes('fix')) {
      category = 'home_repair';
      min = 40;
      max = 120;
      duration = '1-3 hours';
      skills = ['Handyman', 'Problem Solving'];
    }
    
    return {
      title: input.slice(0, 60),
      description: `Looking for help with: ${input}`,
      category,
      estimatedPay: { min, max },
      estimatedDuration: duration,
      confidence: 'medium',
      suggestedSkills: skills,
      safetyNotes: 'Review details and communicate with the hustler before accepting.',
      xpReward: Math.floor((min + max) / 2),
    };
  }

  async getMatches(taskId: string): Promise<MatchResponse> {
    return this.makeRequest<MatchResponse>(`/tasks/${taskId}/matches`);
  }

  async getCoaching(userId: string, context?: string): Promise<CoachingResponse> {
    return this.makeRequest<CoachingResponse>(`/users/${userId}/coaching`, 'POST', {
      context,
    });
  }

  async getSuggestions(userId: string): Promise<any> {
    return this.makeRequest(`/users/${userId}/suggestions`);
  }

  async getAnalytics(userId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    return this.makeRequest(`/users/${userId}/analytics?period=${period}`);
  }

  async generateContent(type: 'title' | 'description' | 'quest', context: any): Promise<any> {
    return this.makeRequest('/content/generate', 'POST', {
      type,
      context,
    });
  }

  async detectFraud(context: any): Promise<any> {
    return this.makeRequest('/fraud/detect', 'POST', context);
  }

  async checkHealth(): Promise<{ status: string; version: string }> {
    return this.makeRequest('/api/health');
  }

  async submitFeedback(feedback: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      const backendFeedback = {
        userId: feedback.userId,
        taskId: feedback.taskId,
        action: feedback.predictionType,
        taskDetails: {
          predictionType: feedback.predictionType,
          predictedValue: feedback.predictedValue,
          actualValue: feedback.actualValue,
          ...feedback.context,
        },
      };
      
      console.log('[HUSTLEAI] Submitting feedback:', JSON.stringify(backendFeedback));
      return await this.makeRequest<FeedbackResponse>('/feedback', 'POST', backendFeedback);
    } catch (error) {
      console.warn('[HUSTLEAI] Feedback submission failed:', error);
      return {
        recorded: false,
        accuracy: 0,
        insights: [],
        recommendations: [],
      };
    }
  }

  async getUserProfileAI(userId: string): Promise<UserProfileAI> {
    try {
      return await this.makeRequest<UserProfileAI>(`/users/${userId}/profile/ai`);
    } catch (error) {
      console.warn('[HUSTLEAI] Failed to fetch AI profile:', error);
      return {
        userId,
        preferredCategories: [],
        avgTaskPrice: 0,
        peakActiveHours: [],
        acceptanceRate: 0,
        completionRate: 0,
        rejectionReasons: [],
        recommendations: [],
      };
    }
  }

  async trackExperiment(data: ExperimentTrackRequest): Promise<{ success: boolean }> {
    try {
      return await this.makeRequest<{ success: boolean }>('/experiments/track', 'POST', data);
    } catch (error) {
      console.warn('[HUSTLEAI] Experiment tracking failed:', error);
      return { success: false };
    }
  }

  async getSystemCalibration(): Promise<CalibrationResponse> {
    try {
      return await this.makeRequest<CalibrationResponse>('/system/calibration');
    } catch (error) {
      console.warn('[HUSTLEAI] Failed to get system calibration:', error);
      return {
        currentThresholds: {},
        recommendations: [],
        appliedAt: new Date().toISOString(),
      };
    }
  }

  async reportFraud(report: FraudReportRequest): Promise<FraudReportResponse> {
    try {
      return await this.makeRequest<FraudReportResponse>('/fraud/report', 'POST', report);
    } catch (error) {
      console.warn('[HUSTLEAI] Fraud report submission failed:', error);
      return {
        reportId: `report-${Date.now()}`,
        confidence: 0,
        matchingPatterns: [],
        recommendedAction: 'monitor',
        reasoning: 'Report submitted but AI analysis unavailable',
      };
    }
  }

  async parseTrade(userId: string, input: string): Promise<TradeParseResponse> {
    try {
      return await this.makeRequest<TradeParseResponse>('/trades/parse', 'POST', {
        userId,
        input,
      });
    } catch (error) {
      console.warn('[HUSTLEAI] Trade parsing failed:', error);
      throw error;
    }
  }

  async getTradeMatches(tradeId: string): Promise<TradeMatchResponse> {
    try {
      return await this.makeRequest<TradeMatchResponse>(`/trades/${tradeId}/matches`);
    } catch (error) {
      console.warn('[HUSTLEAI] Trade matching failed:', error);
      throw error;
    }
  }

  async suggestSquad(jobDescription: string): Promise<SquadSuggestionResponse> {
    try {
      return await this.makeRequest<SquadSuggestionResponse>('/trades/squad/suggest', 'POST', {
        jobDescription,
      });
    } catch (error) {
      console.warn('[HUSTLEAI] Squad suggestion failed:', error);
      throw error;
    }
  }

  async getTradeProgressionOptimization(userId: string): Promise<any> {
    try {
      return await this.makeRequest(`/trades/${userId}/optimize`);
    } catch (error) {
      console.warn('[HUSTLEAI] Trade progression optimization failed:', error);
      throw error;
    }
  }

  async getDynamicTradePricing(params: {
    tradeCategory: string;
    jobType: string;
    badgeLevel: string;
    isPeakHour?: boolean;
    isEmergency?: boolean;
  }): Promise<any> {
    try {
      return await this.makeRequest('/trades/pricing', 'POST', params);
    } catch (error) {
      console.warn('[HUSTLEAI] Dynamic pricing failed:', error);
      throw error;
    }
  }

  async translate(
    params: {
      text: string | string[];
      targetLanguage: string;
      sourceLanguage?: string;
      context?: string;
      includeQualityScore?: boolean;
    },
    retries = 3
  ): Promise<{ translations: string[]; qualityScores?: any[]; detectedLanguages?: string[] }> {
    const textsArray = Array.isArray(params.text) ? params.text : [params.text];
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.makeRequest<{ 
          translations: string[];
          qualityScores?: any[];
          detectedLanguages?: string[];
        }>('/api/translate', 'POST', {
          text: textsArray,
          targetLanguage: params.targetLanguage,
          sourceLanguage: params.sourceLanguage || 'en',
          context: params.context || 'HustleXP mobile app',
          includeQualityScore: params.includeQualityScore || false,
        });
        
        return response;
      } catch (error: any) {
        const errorStr = error?.message || String(error);
        
        if (errorStr.includes('429') || errorStr.includes('Rate limit')) {
          const retryAfterMatch = errorStr.match(/retry.*?(\d+)\s*second/i);
          const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : Math.pow(2, attempt) * 5;
          
          if (attempt < retries - 1) {
            console.log(`[HUSTLEAI] Rate limited. Retrying in ${retryAfter}s (attempt ${attempt + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            continue;
          }
          
          console.error('[HUSTLEAI] Rate limit exceeded after all retries');
          throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
        }
        
        if (attempt === retries - 1) {
          console.warn('[HUSTLEAI] Translation failed after all retries, returning original text');
          return { translations: textsArray };
        }
        
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.log(`[HUSTLEAI] Translation attempt ${attempt + 1} failed, retrying in ${backoffMs}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    
    return { translations: textsArray };
  }

  async translateAuto(
    params: {
      text: string | string[];
      targetLanguage: string;
      context?: string;
      includeQualityScore?: boolean;
    },
    retries = 3
  ): Promise<{ translations: string[]; detectedLanguages: string[]; qualityScores?: any[] }> {
    const textsArray = Array.isArray(params.text) ? params.text : [params.text];
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.makeRequest<{ 
          translations: string[];
          detectedLanguages: string[];
          qualityScores?: any[];
        }>('/api/translate/auto', 'POST', {
          text: textsArray,
          targetLanguage: params.targetLanguage,
          context: params.context || 'HustleXP mobile app',
          includeQualityScore: params.includeQualityScore || false,
        });
        
        return response;
      } catch (error: any) {
        console.warn('[HUSTLEAI] Auto-detect translation failed, falling back to standard translate');
        const fallback = await this.translate({ ...params, sourceLanguage: 'en' }, retries);
        return {
          translations: fallback.translations,
          detectedLanguages: textsArray.map(() => 'en'),
          qualityScores: fallback.qualityScores,
        };
      }
    }
    
    return {
      translations: textsArray,
      detectedLanguages: textsArray.map(() => 'en'),
    };
  }

  async detectLanguage(text: string | string[]): Promise<{ detectedLanguages: string[] }> {
    const textsArray = Array.isArray(text) ? text : [text];
    
    try {
      const response = await this.makeRequest<{ detectedLanguages: string[] }>(
        '/api/translate/detect',
        'POST',
        { text: textsArray }
      );
      return response;
    } catch (error) {
      console.warn('[HUSTLEAI] Language detection failed');
      return { detectedLanguages: textsArray.map(() => 'en') };
    }
  }
}

export const hustleAI = new HustleAIClient();

export async function generateText(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<string> {
  const userMessage = params.messages[params.messages.length - 1];
  
  if (userMessage.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  const response = await hustleAI.chat('system', userMessage.content);
  return response.response;
}

export async function generateObject<T>(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  schema: any;
}): Promise<T> {
  const userMessage = params.messages[params.messages.length - 1];
  
  if (userMessage.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  const response = await hustleAI.chat('system', userMessage.content);
  
  try {
    return JSON.parse(response.response) as T;
  } catch {
    console.warn('[HUSTLEAI] Could not parse response as JSON, returning wrapped object');
    return { data: response.response } as T;
  }
}

export default hustleAI;
