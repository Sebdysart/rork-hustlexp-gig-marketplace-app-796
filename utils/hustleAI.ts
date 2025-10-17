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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[HUSTLEAI] Error ${response.status}:`, errorText);
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('[HUSTLEAI] Response received');
      return data;
    } catch (error) {
      console.warn('[HUSTLEAI] Backend unavailable, using mock response');
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - backend not responding');
        }
        if (error.message.includes('Failed to fetch')) {
          console.warn('[HUSTLEAI] Replit backend not reachable - ensure it is published and running');
          throw new Error('Backend unavailable');
        }
      }
      throw error;
    }
  }

  async chat(userId: string, message: string): Promise<ChatResponse> {
    try {
      return await this.makeRequest<ChatResponse>('/agent/chat', 'POST', {
        userId,
        message,
      });
    } catch (error) {
      console.warn('[HUSTLEAI] Falling back to mock chat response');
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
      return await this.makeRequest<TaskParseResponse>('/tasks/parse', 'POST', {
        userId,
        input,
      });
    } catch (error) {
      console.warn('[HUSTLEAI] Falling back to mock task parsing');
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
