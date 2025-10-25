import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/utils/api';
import { wsService, WebSocketMessage } from '@/services/websocket';
import { authService } from '@/services/backend/auth';
import { taskService } from '@/services/backend/tasks';
import { chatService } from '@/services/backend/chat';
import { paymentService } from '@/services/backend/payments';
import { aiService } from '@/services/backend/ai';
import { disputeService } from '@/services/backend/disputes';
import { analyticsService } from '@/services/backend/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'hustlexp_auth_token';
const SESSION_KEY = 'hustlexp_session_id';

export const [BackendProvider, useBackend] = createContextHook(() => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const connectWebSocket = useCallback((userId: string) => {
    try {
      wsService.connect(userId);
      
      const unsubscribe = wsService.subscribe((message: WebSocketMessage) => {
        console.log('[Backend] WebSocket message:', message.type);
      });

      setWsConnected(true);
      
      return unsubscribe;
    } catch (error) {
      console.error('[Backend] WebSocket connection error:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('[Backend] Logout error:', error);
    } finally {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(SESSION_KEY);
      
      api.clearAuthToken();
      wsService.disconnect();
      
      setIsAuthenticated(false);
      setCurrentUserId(null);
      setIsConnected(false);
      setWsConnected(false);
    }
  }, []);

  const initializeBackend = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        api.setAuthToken(token);
        setIsAuthenticated(true);
        
        try {
          const user = await authService.getCurrentUser();
          setCurrentUserId(user.id);
          connectWebSocket(user.id);
          setIsConnected(true);
        } catch (error) {
          console.error('[Backend] Failed to get current user:', error);
          await logout();
        }
      }
    } catch (error) {
      console.error('[Backend] Initialization error:', error);
    }
  }, [connectWebSocket, logout]);

  useEffect(() => {
    initializeBackend();
  }, [initializeBackend]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(SESSION_KEY, response.sessionId);
      
      api.setAuthToken(response.token);
      setIsAuthenticated(true);
      setCurrentUserId(response.user.id);
      setIsConnected(true);
      
      connectWebSocket(response.user.id);
      
      return { success: true, user: response.user };
    } catch (error: any) {
      console.error('[Backend] Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  }, [connectWebSocket]);

  const signup = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    role: any;
    location: { lat: number; lng: number; address: string };
    mode?: any;
    trades?: string[];
  }) => {
    try {
      const response = await authService.signup(data);
      
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(SESSION_KEY, response.sessionId);
      
      api.setAuthToken(response.token);
      setIsAuthenticated(true);
      setCurrentUserId(response.user.id);
      setIsConnected(true);
      
      connectWebSocket(response.user.id);
      
      return { success: true, user: response.user };
    } catch (error: any) {
      console.error('[Backend] Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Signup failed' 
      };
    }
  }, [connectWebSocket]);

  return useMemo(() => ({
    isConnected,
    isAuthenticated,
    currentUserId,
    wsConnected,
    
    login,
    signup,
    logout,
    
    services: {
      auth: authService,
      task: taskService,
      chat: chatService,
      payment: paymentService,
      ai: aiService,
      dispute: disputeService,
      analytics: analyticsService,
    },
    
    ws: wsService,
  }), [isConnected, isAuthenticated, currentUserId, wsConnected, login, signup, logout]);
});
