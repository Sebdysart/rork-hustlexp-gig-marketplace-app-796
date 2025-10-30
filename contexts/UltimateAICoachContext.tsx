import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { hustleAI } from '@/utils/hustleAI';
import { backendHealth, type HealthStatus } from '@/utils/backendHealth';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import type { HighlightConfig } from '@/components/AIHighlightOverlay';
import type { Tutorial } from '@/components/AITutorialSystem';

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
  const appContext = useApp();
  const langContext = useLanguage();
  
  const appContextRef = useRef<any>(null);
  const langContextRef = useRef<any>(null);

  useEffect(() => {
    if (appContext) {
      appContextRef.current = appContext;
    }
  }, [appContext]);

  useEffect(() => {
    if (langContext) {
      langContextRef.current = langContext;
    }
  }, [langContext]);

  const currentUserId = appContextRef.current?.currentUser?.id || null;
  const currentUser = appContextRef.current?.currentUser || null;
  const tasks = appContextRef.current?.tasks || [];
  const availableTasks = appContextRef.current?.availableTasks || [];
  const myAcceptedTasks = appContextRef.current?.myAcceptedTasks || [];
  const currentLanguage = langContextRef.current?.currentLanguage || 'en';
  const translateText = useCallback(
    async (text: string) => langContextRef.current?.translateText ? langContextRef.current.translateText(text) : text,
    []
  );
  
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
  const [highlightConfig, setHighlightConfig] = useState<HighlightConfig | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [backendStatus, setBackendStatus] = useState<HealthStatus>(backendHealth.getStatus());
  const proactiveCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastProactiveCheck = useRef<number>(0);
  const sendProactiveAlertRef = useRef<((type: string, data: any) => Promise<void>) | null>(null);

  useEffect(() => {
    loadHistory();
    loadSettings();
    
    backendHealth.initialize();
    const unsubscribe = backendHealth.subscribe(status => {
      setBackendStatus(status);
      console.log('[AICoach] Backend status:', status.message);
    });
    
    return () => {
      unsubscribe();
      backendHealth.stop();
    };
  }, []);

  const userPatternsRef = useRef<UserPattern | null>(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    userPatternsRef.current = userPatterns;
  }, [userPatterns]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const currentSettings = settingsRef.current;
    if (!currentUserId || !currentSettings.proactiveAlertsEnabled || !currentSettings.learningMode) {
      if (proactiveCheckInterval.current) {
        clearInterval(proactiveCheckInterval.current);
        proactiveCheckInterval.current = null;
      }
      return;
    }

    const runProactiveChecks = async () => {
      const user = appContextRef.current?.currentUser;
      const tasks = appContextRef.current?.availableTasks || [];
      if (!user || !tasks || !sendProactiveAlertRef.current) return;

      console.log('[AICoach] Checking proactive alerts...');

      // 1. Streak Warning (2 hours before expiry)
      const streakExpiryHours = 24;
      if (user.streaks?.lastTaskDate && user.streaks?.current > 0) {
        const lastTask = new Date(user.streaks.lastTaskDate);
        const now = new Date();
        const hoursSinceLastTask = (now.getTime() - lastTask.getTime()) / (1000 * 60 * 60);
        const hoursRemaining = streakExpiryHours - hoursSinceLastTask;

        if (hoursRemaining <= 2 && hoursRemaining > 0) {
          await sendProactiveAlertRef.current('streak_warning', {
            streakCount: user.streaks.current,
            hoursRemaining,
          });
        }
      }

      // 2. Level Up Progress (80%+ to next level)
      if (user.nextLevelXP && user.xp) {
        const xpProgress = (user.xp / user.nextLevelXP) * 100;
        if (xpProgress >= 80 && xpProgress < 100) {
          const xpNeeded = user.nextLevelXP - user.xp;
          await sendProactiveAlertRef.current('level_up_soon', {
            currentLevel: user.level,
            nextLevel: user.level + 1,
            xpNeeded,
            progress: Math.round(xpProgress),
          });
        }
      }

      // 3. Perfect Task Matches (95%+ match score)
      const patterns = userPatternsRef.current;
      if (patterns && patterns.favoriteCategories.length > 0) {
        const matchedTasks = tasks.filter((task: any) => {
          let score = 0;
          if (patterns.favoriteCategories.includes(task.category)) score += 40;
          if (task.payAmount >= patterns.averageTaskValue * 0.9) score += 30;
          if (task.payAmount >= patterns.averageTaskValue * 1.2) score += 10;
          const taskHour = new Date().getHours();
          if (patterns.preferredWorkTimes.includes(taskHour)) score += 20;
          return score >= 70;
        });

        if (matchedTasks.length > 0) {
          const bestMatch = matchedTasks.sort((a: any, b: any) => b.payAmount - a.payAmount)[0];
          const payDiff = ((bestMatch.payAmount - patterns.averageTaskValue) / patterns.averageTaskValue) * 100;
          await sendProactiveAlertRef.current('perfect_match', {
            task: bestMatch,
            matchScore: 95,
            payDiff: Math.round(payDiff),
          });
        }
      }
    };

    // Only run checks on mount, not on every dependency change
    const hasRun = lastProactiveCheck.current > 0;
    if (!hasRun) {
      runProactiveChecks();
      lastProactiveCheck.current = Date.now();
    }

    // Start proactive polling every 30 minutes
    if (!proactiveCheckInterval.current) {
      proactiveCheckInterval.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastCheck = now - lastProactiveCheck.current;

        if (timeSinceLastCheck >= 30 * 60 * 1000) {
          console.log('[AICoach] Running scheduled proactive check...');
          lastProactiveCheck.current = now;
          runProactiveChecks();
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      if (proactiveCheckInterval.current) {
        clearInterval(proactiveCheckInterval.current);
        proactiveCheckInterval.current = null;
      }
    };
  }, [currentUserId]);

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

  useEffect(() => {
    const analyzePatterns = async () => {
      const user = appContextRef.current?.currentUser;
      const allTasks = appContextRef.current?.tasks || [];
      if (!user || !allTasks || allTasks.length === 0) return;

      const completedTasks = allTasks.filter((t: any) => t.status === 'completed' && t.workerId === user.id);
      
      if (completedTasks.length === 0) return;

      const categories: Record<string, number> = {};
      let totalValue = 0;
      const workHours: Record<number, number> = {};

      completedTasks.forEach((task: any) => {
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

      const streakConsciousness = user.streaks.current > 7 ? 'high' : 
                                   user.streaks.current > 3 ? 'medium' : 'low';

      setUserPatterns({
        preferredWorkTimes,
        favoriteCategories,
        averageTaskValue: avgValue,
        completionSpeed: user.tasksCompleted > 50 ? 'fast' : 'medium',
        streakConsciousness,
      });
    };

    if (currentUserId) {
      analyzePatterns();
    }
  }, [currentUserId]);



  const sendProactiveAlert = useCallback(async (type: string, data: any) => {
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
          `🎯 Perfect Match! I found a quest that's 95% match for you: "${data.task.title}" - ${data.task.payAmount}`
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
          `💰 Earnings Boost! ${data.count} high-paying quests (avg ${data.avgPay}) in your favorite categories: ${data.categories.join(', ')}!`
        );
        actions = [{
          type: 'navigate',
          label: await translateText('Show Me'),
          data: { screen: 'tasks', filter: 'high-paying' },
          icon: '💎',
        }];
        break;

      case 'level_up_soon':
        content = await translateText(
          `🎉 You're ${data.progress}% to Level ${data.nextLevel}! Just ${data.xpNeeded} XP needed. Complete 1 more quest to level up!`
        );
        actions = [{
          type: 'navigate',
          label: await translateText('Show Tasks'),
          data: { screen: 'home' },
          icon: '⚡',
        }];
        break;

      case 'badge_progress':
        content = await translateText(
          `🏆 Badge Alert! "${data.badgeName}" is ${data.progress}% complete. Just ${data.remaining}% more!`
        );
        actions = [{
          type: 'navigate',
          label: await translateText('View Badges'),
          data: { screen: 'badge-library' },
          icon: '🎖️',
        }];
        break;
    }

    setMessages(prev => {
      const lastProactive = prev.find(m => m.proactive);
      if (lastProactive) {
        const timeSince = Date.now() - new Date(lastProactive.timestamp).getTime();
        if (timeSince < 60 * 60 * 1000) return prev;
      }

      if (!content) return prev;

      const newMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        actions,
        proactive: true,
      };

      const updated = [...prev, newMessage];
      saveHistory(updated);

      const currentSettings = settingsRef.current;
      if (currentSettings.hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      return updated;
    });
  }, [translateText]);

  useEffect(() => {
    sendProactiveAlertRef.current = sendProactiveAlert;
  }, [sendProactiveAlert]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const context = {
      user: currentUser ? {
        id: currentUser.id,
        role: currentUser.role,
        level: currentUser.level,
        xp: currentUser.xp,
        earnings: currentUser.earnings,
        streak: currentUser.streaks?.current || 0,
        tasksCompleted: currentUser.tasksCompleted,
        activeMode: currentUser.activeMode,
        badges: currentUser.badges || [],
        skills: currentUser.skills || [],
        location: currentUser.location,
      } : null,
      screen: 'ai-coach',
      availableTasks: availableTasks.length,
      activeTasks: myAcceptedTasks.length,
      patterns: userPatterns,
      language: currentLanguage,
    };

    try {
      console.log('[AICoach] Sending message to backend AI:', {
        userId: currentUser?.id,
        messagePreview: userMessage.slice(0, 50),
        contextKeys: Object.keys(context),
      });

      const response = await hustleAI.chat(
        currentUser?.id || 'guest',
        userMessage
      );

      console.log('[AICoach] Backend AI response received:', {
        responsePreview: response.response.slice(0, 100),
        confidence: response.confidence,
        hasSuggestions: (response.suggestions?.length || 0) > 0,
      });

      return response.response;
    } catch (error: any) {
      console.error('[AICoach] Error generating response:', {
        error: error?.message || String(error),
        userId: currentUser?.id,
      });
      
      // Provide helpful fallback based on message intent
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('task') || lowerMessage.includes('quest') || lowerMessage.includes('gig')) {
        return await translateText(
          "Want to earn more? Complete more tasks to level up and unlock higher-paying gigs. Your trust score and completion rate also help you get matched faster!"
        );
      }
      if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        return await translateText(
          "I'm here to help! I can guide you through the app, show you the best quests, help you earn more, and answer any questions. Try asking 'show me nearby tasks' or 'how do I level up'."
        );
      }
      
      return await translateText(
        "I'm here to help! Try asking me about tasks nearby, your progress, or how to earn more. The AI backend is having trouble right now, but I can still help navigate the app!"
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
      const translatedMessage = content;
      let aiResponse = await generateAIResponse(translatedMessage);
      aiResponse = await translateText(aiResponse);

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

  const highlightElement = useCallback((config: HighlightConfig, duration?: number) => {
    setHighlightConfig(config);
    
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (duration) {
      setTimeout(() => {
        setHighlightConfig(null);
      }, duration);
    }
  }, [settings]);

  const dismissHighlight = useCallback(() => {
    setHighlightConfig(null);
  }, []);

  const startTutorial = useCallback((tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [settings]);

  const dismissTutorial = useCallback(() => {
    setActiveTutorial(null);
    setHighlightConfig(null);
  }, []);

  const navigateWithFilters = useCallback(async (screen: string, filters?: any) => {
    console.log('[AICoach] Navigating to', screen, 'with filters:', filters);
    
    const aiMessage: AIMessage = {
      id: `ai-nav-${Date.now()}`,
      role: 'assistant',
      content: await translateText(
        filters 
          ? `Navigating to ${screen} with filters applied...`
          : `Opening ${screen}...`
      ),
      timestamp: new Date().toISOString(),
      actions: [{
        type: 'navigate',
        label: await translateText('Open'),
        data: { screen, filters },
        icon: '🎯',
      }],
    };

    setMessages(prev => {
      const updated = [...prev, aiMessage];
      saveHistory(updated);
      return updated;
    });

    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [settings, translateText]);

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
    setCurrentContext((prev: any) => ({ ...prev, ...context }));
  }, []);

  const proactiveAlerts = useMemo(() => 
    messages.filter(m => m.proactive),
    [messages]
  );

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
    highlightConfig,
    highlightElement,
    dismissHighlight,
    activeTutorial,
    startTutorial,
    dismissTutorial,
    navigateWithFilters,
    backendStatus,
    proactiveAlerts,
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
    highlightConfig,
    highlightElement,
    dismissHighlight,
    activeTutorial,
    startTutorial,
    dismissTutorial,
    navigateWithFilters,
    backendStatus,
    proactiveAlerts,
  ]);
});
