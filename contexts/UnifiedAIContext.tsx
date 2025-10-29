import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';
import { aiService } from '@/services/backend/ai';
import { backendHealth } from '@/utils/backendHealth';
import type {
  ChatRequest,
  ChatResponse,
  TaskParseRequest,
  TaskParseResponse,
  MatchTaskRequest,
  MatchTaskResponse,
  AnalyzePatternsRequest,
  AnalyzePatternsResponse,
  RecommendationsRequest,
  RecommendationsResponse,
  FeedbackRequest,
} from '@/services/backend/ai';

interface UnifiedAIState {
  isBackendOnline: boolean;
  lastHealthCheck: Date | null;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
}

export const [UnifiedAIProvider, useUnifiedAI] = createContextHook(() => {
  const appContext = useApp();
  const [state, setState] = useState<UnifiedAIState>({
    isBackendOnline: false,
    lastHealthCheck: null,
    conversationHistory: [],
  });

  const checkHealthStatus = useCallback(async () => {
    const status = await backendHealth.checkHealth();
    setState((prev) => ({
      ...prev,
      isBackendOnline: status.status === 'online',
      lastHealthCheck: new Date(),
    }));
  }, []);

  useEffect(() => {
    checkHealthStatus();
    const interval = setInterval(checkHealthStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkHealthStatus]);

  const sendMessage = useCallback(
    async (message: string, context?: any): Promise<ChatResponse> => {
      const { currentUser } = appContext;
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const request: ChatRequest = {
        userId: currentUser.id,
        message,
        context: {
          screen: context?.screen,
          language: context?.language || 'en',
          user: {
            id: currentUser.id,
            role: currentUser.role,
            level: currentUser.level || 1,
            xp: currentUser.xp || 0,
            earnings: currentUser.earnings || 0,
            streak: currentUser.streaks?.current || 0,
            tasksCompleted: currentUser.tasksCompleted || 0,
            badges: currentUser.badges || [],
            skills: currentUser.skills || [],
            location: currentUser.location,
          },
          conversationHistory: state.conversationHistory,
          ...context,
        },
      };

      try {
        const response = await aiService.chat(request);

        setState((prev) => ({
          ...prev,
          conversationHistory: [
            ...prev.conversationHistory.slice(-10),
            { role: 'user', content: message },
            { role: 'assistant', content: response.response },
          ],
        }));

        return response;
      } catch (error) {
        console.error('UnifiedAI chat error:', error);
        return {
          response: "I'm having trouble connecting right now. Please try again.",
          confidence: 0,
          suggestions: [],
          actions: [],
          highlights: [],
          metadata: {
            model: 'fallback',
            tokens: 0,
            processingTime: 0,
            cached: false,
            language: 'en',
          },
        };
      }
    },
    [appContext, state.conversationHistory]
  );

  const parseTaskFromText = useCallback(
    async (text: string, context?: any): Promise<TaskParseResponse | null> => {
      const { currentUser } = appContext;
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const request: TaskParseRequest = {
        userId: currentUser.id,
        input: text,
        context: {
          userLocation: currentUser.location,
          currentTime: new Date().toISOString(),
          language: context?.language || 'en',
        },
      };

      try {
        return await aiService.parseTask(request);
      } catch (error) {
        console.error('Task parsing error:', error);
        return null;
      }
    },
    [appContext]
  );

  const getTaskRecommendations = useCallback(
    async (context?: any): Promise<MatchTaskResponse | null> => {
      const { currentUser } = appContext;
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      if (!currentUser.location) {
        console.warn('User location not available for recommendations');
        return null;
      }

      const request: MatchTaskRequest = {
        userId: currentUser.id,
        context: {
          location: currentUser.location,
          availability: context?.availability || 'now',
          preferences: {
            categories: currentUser.skills || [],
            maxDistance: context?.maxDistance || 10,
            minPay: context?.minPay || 0,
          },
        },
        limit: context?.limit || 10,
      };

      try {
        return await aiService.matchTasks(request);
      } catch (error) {
        console.error('Task recommendations error:', error);
        return null;
      }
    },
    [appContext]
  );

  const analyzeUserPatterns = useCallback(
    async (
      timeframe: '7days' | '30days' | '90days' = '30days'
    ): Promise<AnalyzePatternsResponse | null> => {
      const { currentUser } = appContext;
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const request: AnalyzePatternsRequest = {
        userId: currentUser.id,
        timeframe,
        includeRecommendations: true,
      };

      try {
        return await aiService.analyzePatterns(request);
      } catch (error) {
        console.error('Pattern analysis error:', error);
        return null;
      }
    },
    [appContext]
  );

  const getProactiveRecommendations = useCallback(
    async (context?: any): Promise<RecommendationsResponse | null> => {
      const { currentUser } = appContext;
      if (!currentUser?.id || !currentUser.location) {
        return null;
      }

      const request: RecommendationsRequest = {
        userId: currentUser.id,
        context: {
          location: currentUser.location,
          time: new Date().toISOString(),
          availability: context?.availability || 'now',
          currentStreak: currentUser.streaks?.current,
          currentLevel: currentUser.level,
          currentXP: currentUser.xp,
        },
        recommendationType: 'proactive',
      };

      try {
        return await aiService.getRecommendations(request);
      } catch (error) {
        console.error('Proactive recommendations error:', error);
        return null;
      }
    },
    [appContext]
  );

  const sendTaskFeedback = useCallback(
    async (
      taskId: string,
      outcome: any,
      prediction: any
    ): Promise<boolean> => {
      const { currentUser } = appContext;
      if (!currentUser?.id) {
        return false;
      }

      const request: FeedbackRequest = {
        userId: currentUser.id,
        feedbackType: 'task_outcome',
        data: {
          taskId,
          prediction,
          actual: outcome,
        },
      };

      try {
        await aiService.sendFeedback(request);
        return true;
      } catch (error) {
        console.error('Feedback error:', error);
        return false;
      }
    },
    [appContext]
  );

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, conversationHistory: [] }));
  }, []);

  return {
    isBackendOnline: state.isBackendOnline,
    lastHealthCheck: state.lastHealthCheck,
    conversationHistory: state.conversationHistory,
    sendMessage,
    parseTaskFromText,
    getTaskRecommendations,
    analyzeUserPatterns,
    getProactiveRecommendations,
    sendTaskFeedback,
    clearHistory,
    refreshHealth: checkHealthStatus,
  };
});
