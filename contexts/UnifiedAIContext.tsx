import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { hustleAI } from '@/utils/hustleAI';
import { aiService } from '@/services/backend/ai';
import type {
  ChatRequest,
  TaskParseRequest,
  AnalyzePatternsRequest,
  RecommendationsRequest,
  FeedbackRequest,
} from '@/services/backend/ai';
import { backendHealth, type HealthStatus } from '@/utils/backendHealth';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const STORAGE_KEY = 'hustlexp_unified_ai_history';
const AI_SETTINGS_KEY = 'hustlexp_unified_ai_settings';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
  actions?: AIAction[];
  uiComponents?: any[];
  metadata?: Record<string, any>;
}

export interface AIAction {
  type: 'navigate' | 'highlight' | 'execute' | 'suggest';
  label: string;
  data: any;
  icon?: string;
}

export interface AISettings {
  voiceEnabled: boolean;
  proactiveAlertsEnabled: boolean;
  hapticFeedback: boolean;
  autoTranslate: boolean;
}

export interface AIContext {
  screen?: string;
  step?: string;
  userProfile?: any;
  taskContext?: any;
  [key: string]: any;
}

export const [UnifiedAIProvider, useUnifiedAI] = createContextHook(() => {
  const useBackend = process.env.EXPO_PUBLIC_ENABLE_AI_FEATURES === 'true';
  
  let appContext: any = null;
  let langContext: any = null;

  try {
    appContext = useApp();
  } catch {
    console.log('[UnifiedAI] AppContext not available (OK during onboarding)');
  }

  try {
    langContext = useLanguage();
  } catch {
    console.log('[UnifiedAI] LanguageContext not available');
  }
  
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<AISettings>({
    voiceEnabled: false,
    proactiveAlertsEnabled: true,
    hapticFeedback: true,
    autoTranslate: false,
  });
  const [context, setContext] = useState<AIContext>({});
  const [backendStatus, setBackendStatus] = useState<HealthStatus>(backendHealth.getStatus());
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    loadHistory();
    loadSettings();
    
    backendHealth.initialize();
    const unsubscribe = backendHealth.subscribe(status => {
      setBackendStatus(status);
    });
    
    return () => {
      unsubscribe();
      backendHealth.stop();
    };
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        setMessages(history.slice(-100));
      }
    } catch (error) {
      console.error('[UnifiedAI] Error loading history:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(AI_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('[UnifiedAI] Error loading settings:', error);
    }
  };

  const saveHistory = async (newMessages: AIMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages.slice(-100)));
    } catch (error) {
      console.error('[UnifiedAI] Error saving history:', error);
    }
  };

  const saveSettings = async (newSettings: AISettings) => {
    try {
      await AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('[UnifiedAI] Error saving settings:', error);
    }
  };

  const triggerHapticIfEnabled = useCallback((type: 'light' | 'medium' | 'success') => {
    if (!settings.hapticFeedback || Platform.OS === 'web') return;
    
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  }, [settings.hapticFeedback]);

  const addMessage = useCallback((message: Omit<AIMessage, 'id' | 'timestamp'>) => {
    const newMessage: AIMessage = {
      ...message,
      id: `${message.role}-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      saveHistory(updated);
      return updated;
    });

    return newMessage;
  }, []);

  const sendMessage = useCallback(async (userInput: string, messageContext?: AIContext) => {
    if (!userInput.trim() || isProcessing) return;

    addMessage({
      role: 'user',
      content: userInput.trim(),
      context: messageContext?.screen,
    });

    triggerHapticIfEnabled('light');
    setIsProcessing(true);

    try {
      const currentUser = appContext?.currentUser;
      const availableTasks = appContext?.availableTasks || [];
      const myAcceptedTasks = appContext?.myAcceptedTasks || [];
      const currentLanguage = langContext?.currentLanguage || 'en';
      const translateTextFn = langContext?.translateText || ((text: string) => Promise.resolve(text));

      const fullContext = {
        ...context,
        ...messageContext,
        user: currentUser ? {
          id: currentUser.id,
          level: currentUser.level,
          xp: currentUser.xp,
          role: currentUser.role,
          mode: currentUser.activeMode,
        } : null,
        availableTasks: availableTasks.length,
        activeTasks: myAcceptedTasks.length,
        language: currentLanguage,
        sessionId: sessionId.current,
      };

      let response;
      
      if (useBackend && backendStatus.status === 'online') {
        const chatRequest: ChatRequest = {
          userId: currentUser?.id || 'guest',
          message: userInput,
          context: {
            screen: messageContext?.screen,
            language: currentLanguage,
            user: currentUser ? {
              id: currentUser.id,
              role: currentUser.role as 'everyday' | 'tradesman',
              level: currentUser.level,
              xp: currentUser.xp,
              earnings: currentUser.earnings || 0,
              streak: currentUser.streak || 0,
              tasksCompleted: currentUser.tasksCompleted || 0,
              badges: currentUser.badges || [],
              skills: currentUser.skills || [],
              location: currentUser.location,
            } : undefined,
            availableTasks: availableTasks.length,
            activeTasks: myAcceptedTasks.length,
            sessionId: sessionId.current,
          },
        };
        response = await aiService.chat(chatRequest);
      } else {
        const contextString = JSON.stringify(fullContext);
        response = await hustleAI.chat(
          currentUser?.id || 'guest',
          `${userInput}\n\nContext: ${contextString}`
        );
      }

      let aiContent = response.response;
      
      if (settings.autoTranslate && currentLanguage !== 'en') {
        aiContent = await translateTextFn(aiContent);
      }

      const assistantMessage = addMessage({
        role: 'assistant',
        content: aiContent,
        context: messageContext?.screen,
        actions: response.actions,
        metadata: {
          confidence: response.confidence,
          suggestions: response.suggestions,
        },
      });

      triggerHapticIfEnabled('success');
      return assistantMessage;
    } catch (error: any) {
      console.error('[UnifiedAI] Error in sendMessage:', error);
      
      const translateTextFn = langContext?.translateText || ((text: string) => Promise.resolve(text));
      const errorContent = error?.message?.includes('Rate limit')
        ? await translateTextFn("I'm getting a lot of requests right now. Please wait a moment and try again.")
        : await translateTextFn("I'm having trouble right now. Please try again in a moment.");
      
      addMessage({
        role: 'assistant',
        content: errorContent,
        context: messageContext?.screen,
        metadata: { error: true },
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    addMessage,
    context,
    appContext,
    langContext,
    settings.autoTranslate,
    triggerHapticIfEnabled,
    useBackend,
    backendStatus.status,
  ]);

  const addSystemMessage = useCallback((content: string, messageContext?: AIContext, uiComponents?: any[]) => {
    return addMessage({
      role: 'assistant',
      content,
      context: messageContext?.screen,
      uiComponents,
      metadata: { system: true },
    });
  }, [addMessage]);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
    triggerHapticIfEnabled('medium');
  }, [triggerHapticIfEnabled]);

  const updateSettings = useCallback(async (newSettings: Partial<AISettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);

  const updateContext = useCallback((newContext: Partial<AIContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  }, []);

  const getMessagesForContext = useCallback((contextScreen?: string) => {
    if (!contextScreen) return messages;
    return messages.filter(m => m.context === contextScreen);
  }, [messages]);

  const parseTaskFromText = useCallback(async (text: string, userLocation?: { lat: number; lng: number }) => {
    const currentUser = appContext?.currentUser;
    const currentLanguage = langContext?.currentLanguage || 'en';
    
    if (!useBackend || backendStatus.status !== 'online') {
      throw new Error('Backend AI required for task parsing');
    }

    const request: TaskParseRequest = {
      userId: currentUser?.id || 'guest',
      input: text,
      context: {
        userLocation,
        currentTime: new Date().toISOString(),
        language: currentLanguage,
      },
    };

    return aiService.parseTask(request);
  }, [appContext, langContext, useBackend, backendStatus.status]);

  const getTaskRecommendations = useCallback(async () => {
    const currentUser = appContext?.currentUser;
    
    if (!useBackend || backendStatus.status !== 'online') {
      return null;
    }

    if (!currentUser?.location) {
      console.log('[UnifiedAI] No user location available');
      return null;
    }

    const request: RecommendationsRequest = {
      userId: currentUser.id,
      context: {
        location: currentUser.location,
        time: new Date().toISOString(),
        availability: 'next-3-hours',
        currentStreak: currentUser.streak,
        currentLevel: currentUser.level,
        currentXP: currentUser.xp,
      },
      recommendationType: 'proactive',
    };

    return aiService.getRecommendations(request);
  }, [appContext, useBackend, backendStatus.status]);

  const analyzeUserPatterns = useCallback(async (timeframe: '7days' | '30days' | '90days' = '30days') => {
    const currentUser = appContext?.currentUser;
    
    if (!useBackend || backendStatus.status !== 'online' || !currentUser) {
      return null;
    }

    const request: AnalyzePatternsRequest = {
      userId: currentUser.id,
      timeframe,
      includeRecommendations: true,
    };

    return aiService.analyzePatterns(request);
  }, [appContext, useBackend, backendStatus.status]);

  const sendTaskFeedback = useCallback(async (taskId: string, prediction: any, actual: any) => {
    const currentUser = appContext?.currentUser;
    
    if (!useBackend || backendStatus.status !== 'online' || !currentUser) {
      return;
    }

    const request: FeedbackRequest = {
      userId: currentUser.id,
      feedbackType: 'task_outcome',
      data: {
        taskId,
        prediction,
        actual,
      },
    };

    return aiService.sendFeedback(request);
  }, [appContext, useBackend, backendStatus.status]);

  return {
    messages,
    isProcessing,
    settings,
    context,
    backendStatus,
    useBackend,
    sendMessage,
    addMessage,
    addSystemMessage,
    clearHistory,
    updateSettings,
    updateContext,
    getMessagesForContext,
    triggerHaptic: triggerHapticIfEnabled,
    parseTaskFromText,
    getTaskRecommendations,
    analyzeUserPatterns,
    sendTaskFeedback,
    aiService,
  };
});
