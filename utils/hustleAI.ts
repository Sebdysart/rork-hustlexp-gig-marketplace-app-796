/**
 * HUSTLEAI Backend Client
 * Connects to your Replit-hosted AI engine
 */

const HUSTLEAI_DEV_URL = 'https://35e59b08-e7a7-448e-ae3a-4ff316aab102-00-31edtpdmpi4hm.picard.replit.dev/api';
const HUSTLEAI_PROD_URL = process.env.EXPO_PUBLIC_HUSTLEAI_URL || HUSTLEAI_DEV_URL;

const API_BASE_URL = __DEV__ ? HUSTLEAI_DEV_URL : HUSTLEAI_PROD_URL;

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

class HustleAIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    console.log('[HUSTLEAI] Client initialized with base URL:', this.baseURL);
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`[HUSTLEAI] ${method} ${url}`);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[HUSTLEAI] Error ${response.status}:`, errorText);
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('[HUSTLEAI] Response received');
      return data;
    } catch (error) {
      console.error('[HUSTLEAI] Request failed:', error);
      throw error;
    }
  }

  async chat(userId: string, message: string): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>('/agent/chat', 'POST', {
      userId,
      message,
    });
  }

  async parseTask(userId: string, input: string): Promise<TaskParseResponse> {
    return this.makeRequest<TaskParseResponse>('/tasks/parse', 'POST', {
      userId,
      input,
    });
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
    return this.makeRequest('/health');
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
