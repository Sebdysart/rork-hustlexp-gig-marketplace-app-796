import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { hustleAI } from '@/utils/hustleAI';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const STORAGE_KEY = 'hustlexp_ai_coach_history';
const AI_SETTINGS_KEY = 'hustlexp_ai_coach_settings';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AIAction[];
  highlightedElements?: string[];
  proactive?: boolean;
}

export interface AIAction {
  type: 'navigate' | 'highlight' | 'execute' | 'suggest';
  label: string;
  data: any;
  icon?: string;
}

export interface AICoachSettings {
  voiceEnabled: boolean;
  proactiveAlertsEnabled: boolean;
  learningMode: boolean;
  hapticFeedback: boolean;
  autoHighlight: boolean;
}

export interface UserPattern {
  preferredWorkTimes: number[];
  favoriteCategories: string[];
  averageTaskValue: number;
  completionSpeed: 'fast' | 'medium' | 'slow';
  streakConsciousness: 'high' | 'medium' | 'low';
}

export const [UltimateAICoachProvider, useUltimateAICoach] = createContextHook(() => {
  const { currentUser, tasks, availableTasks, myAcceptedTasks } = useApp();
  const { currentLanguage, translateText } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AICoachSettings>({
    voiceEnabled: false,
    proactiveAlertsEnabled: true,
    learningMode: true,
    hapticFeedback: true,
    autoHighlight: true,
  });
  const [currentContext, setCurrentContext] = useState<any>({});
  const [userPatterns, setUserPatterns] = useState<UserPattern | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    loadSettings();
    analyzeUserPatterns();
  }, []);

  useEffect(() => {
    if (currentUser && settings.proactiveAlertsEnabled && settings.learningMode) {
      checkProactiveAlerts();
    }
  }, [currentUser, availableTasks, myAcceptedTasks, settings]);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        setMessages(history.slice(-50));
      }
    } catch (error) {
      console.error('[AICoach] Error loading history:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(AI_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('[AICoach] Error loading settings:', error);
    }
  };

  const saveHistory = async (newMessages: AIMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages.slice(-50)));
    } catch (error) {
      console.error('[AICoach] Error saving history:', error);
    }
  };

  const saveSettings = async (newSettings: AICoachSettings) => {
    try {
      await AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('[AICoach] Error saving settings:', error);
    }
  };

  const analyzeUserPatterns = useCallback(async () => {
    if (!currentUser || !tasks.length) return;

    const completedTasks = tasks.filter(t => t.status === 'completed' && t.workerId === currentUser.id);
    
    if (completedTasks.length === 0) return;

    const categories: Record<string, number> = {};
    let totalValue = 0;
    const workHours: Record<number, number> = {};

    completedTasks.forEach(task => {
      categories[task.category] = (categories[task.category] || 0) + 1;
      totalValue += task.payAmount;
      
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        workHours[hour] = (workHours[hour] || 0) + 1;
      }
    });

    const avgValue = totalValue / completedTasks.length;
    const favoriteCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    const preferredWorkTimes = Object.entries(workHours)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour]) => parseInt(hour));

    const streakConsciousness = currentUser.streaks.current > 7 ? 'high' : 
                                 currentUser.streaks.current > 3 ? 'medium' : 'low';

    setUserPatterns({
      preferredWorkTimes,
      favoriteCategories,
      averageTaskValue: avgValue,
      completionSpeed: currentUser.tasksCompleted > 50 ? 'fast' : 'medium',
      streakConsciousness,
    });
  }, [currentUser, tasks]);

  const checkProactiveAlerts = useCallback(async () => {
    if (!currentUser || !userPatterns) return;

    const streakExpiryHours = 24;
    if (currentUser.streaks.lastTaskDate) {
      const lastTask = new Date(currentUser.streaks.lastTaskDate);
      const now = new Date();
      const hoursSinceLastTask = (now.getTime() - lastTask.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastTask > streakExpiryHours - 2 && currentUser.streaks.current > 0) {
        await sendProactiveAlert('streak_warning', {
          streakCount: currentUser.streaks.current,
          hoursRemaining: Math.max(0, streakExpiryHours - hoursSinceLastTask),
        });
      }
    }

    const matchedTasks = availableTasks.filter(task => {
      if (!userPatterns.favoriteCategories.includes(task.category)) return false;
      if (task.payAmount < userPatterns.averageTaskValue * 0.8) return false;
      return true;
    });

    if (matchedTasks.length > 0 && messages.length === 0) {
      const bestMatch = matchedTasks.sort((a, b) => b.payAmount - a.payAmount)[0];
      await sendProactiveAlert('perfect_match', {
        task: bestMatch,
        matchScore: 95,
      });
    }
  }, [currentUser, userPatterns, availableTasks, messages]);

  const sendProactiveAlert = async (type: string, data: any) => {
    const lastProactive = messages.find(m => m.proactive);
    if (lastProactive) {
      const timeSince = Date.now() - new Date(lastProactive.timestamp).getTime();
      if (timeSince < 60 * 60 * 1000) return;
    }

    let content = '';
    let actions: AIAction[] = [];

    switch (type) {
      case 'streak_warning':
        content = await translateText(
          `⚠️ STREAK ALERT! Your ${data.streakCount}-day streak expires in ${Math.floor(data.hoursRemaining)} hours! Accept any quest to save it.`
        );
        actions = [{
          type: 'navigate',
          label: await translateText('Show Quick Quests'),
          data: { screen: 'home' },
          icon: '⚡',
        }];
        break;

      case 'perfect_match':
        content = await translateText(
          `🎯 Perfect Match! I found a quest that's 95% match for you: "${data.task.title}" - $${data.task.payAmount}`
        );
        actions = [{
          type: 'navigate',
          label: await translateText('View Quest'),
          data: { screen: 'task', id: data.task.id },
          icon: '👀',
        }];
        break;

      case 'earnings_opportunity':
        content = await translateText(
          `💰 Earnings Boost! ${data.count} high-paying quests just posted in your favorite categories!`
        );
        actions = [{
          type: 'navigate',
          label: await translateText('Show Me'),
          data: { screen: 'tasks', filter: 'high-paying' },
          icon: '💎',
        }];
        break;
    }

    if (content) {
      const newMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        actions,
        proactive: true,
      };

      setMessages(prev => {
        const updated = [...prev, newMessage];
        saveHistory(updated);
        return updated;
      });

      if (settings.hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const context = {
      user: currentUser ? {
        level: currentUser.level,
        xp: currentUser.xp,
        earnings: currentUser.earnings,
        streak: currentUser.streaks.current,
        tasksCompleted: currentUser.tasksCompleted,
        activeMode: currentUser.activeMode,
      } : null,
      availableTasks: availableTasks.length,
      activeTasks: myAcceptedTasks.length,
      patterns: userPatterns,
      language: currentLanguage,
    };

    try {
      const response = await hustleAI.chat(
        currentUser?.id || 'guest',
        `${userMessage}\n\nContext: ${JSON.stringify(context)}`
      );

      return response.response;
    } catch (error) {
      console.error('[AICoach] Error generating response:', error);
      return await translateText(
        "I'm here to help! I can guide you through the app, show you the best quests, help you earn more, and answer any questions."
      );
    }
  };

  const parseAIActions = (response: string): AIAction[] => {
    const actions: AIAction[] = [];

    if (response.toLowerCase().includes('show') || response.toLowerCase().includes('navigate')) {
      if (response.toLowerCase().includes('quest') || response.toLowerCase().includes('task')) {
        actions.push({
          type: 'navigate',
          label: 'View Tasks',
          data: { screen: 'tasks' },
          icon: '🎯',
        });
      }
      if (response.toLowerCase().includes('profile')) {
        actions.push({
          type: 'navigate',
          label: 'Open Profile',
          data: { screen: 'profile' },
          icon: '👤',
        });
      }
      if (response.toLowerCase().includes('earnings') || response.toLowerCase().includes('money')) {
        actions.push({
          type: 'navigate',
          label: 'View Earnings',
          data: { screen: 'wallet' },
          icon: '💰',
        });
      }
    }

    return actions;
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      saveHistory(updated);
      return updated;
    });

    setIsLoading(true);

    try {
      const translatedMessage = await translateText(content, 'en');
      let aiResponse = await generateAIResponse(translatedMessage);
      aiResponse = await translateText(aiResponse, currentLanguage);

      const actions = parseAIActions(aiResponse);

      const assistantMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        actions,
      };

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        saveHistory(updated);
        return updated;
      });

      if (settings.hapticFeedback && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('[AICoach] Error sending message:', error);
      
      const errorMessage: AIMessage = {
        id: `ai-error-${Date.now()}`,
        role: 'assistant',
        content: await translateText("Sorry, I'm having trouble right now. Please try again!"),
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => {
        const updated = [...prev, errorMessage];
        saveHistory(updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, translateText, currentUser, userPatterns, settings]);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AICoachSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);

  const highlightElement = useCallback((elementId: string, duration: number = 5000) => {
    setHighlightedElement(elementId);
    
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setTimeout(() => {
      setHighlightedElement(null);
    }, duration);
  }, [settings]);

  const open = useCallback(() => {
    setIsOpen(true);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [settings]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [settings]);

  const updateContext = useCallback((context: any) => {
    setCurrentContext(prev => ({ ...prev, ...context }));
  }, []);

  return useMemo(() => ({
    isOpen,
    open,
    close,
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    settings,
    updateSettings,
    currentContext,
    updateContext,
    userPatterns,
    highlightedElement,
    highlightElement,
  }), [
    isOpen,
    open,
    close,
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    settings,
    updateSettings,
    currentContext,
    updateContext,
    userPatterns,
    highlightedElement,
    highlightElement,
  ]);
});
