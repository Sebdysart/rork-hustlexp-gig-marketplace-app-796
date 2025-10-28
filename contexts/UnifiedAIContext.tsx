import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { hustleAI } from '@/utils/hustleAI';
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

      const contextString = JSON.stringify(fullContext);
      const response = await hustleAI.chat(
        currentUser?.id || 'guest',
        `${userInput}\n\nContext: ${contextString}`
      );

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

  return {
    messages,
    isProcessing,
    settings,
    context,
    backendStatus,
    sendMessage,
    addMessage,
    addSystemMessage,
    clearHistory,
    updateSettings,
    updateContext,
    getMessagesForContext,
    triggerHaptic: triggerHapticIfEnabled,
  };
});
