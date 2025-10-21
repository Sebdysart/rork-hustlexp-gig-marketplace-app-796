import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <AppProvider>{children}</AppProvider>
    </NotificationProvider>
  </QueryClientProvider>
);

describe('AppContext Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('User Onboarding', () => {
    it('should complete onboarding and create user', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'Test User',
          'worker',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
          'test@example.com'
        );
      });

      expect(result.current.currentUser).toBeDefined();
      expect(result.current.currentUser?.name).toBe('Test User');
      expect(result.current.currentUser?.role).toBe('worker');
      expect(result.current.hasOnboarded).toBe(true);
    });

    it('should set dual role correctly', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'Dual User',
          'both',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
          'dual@example.com',
          undefined,
          'everyday',
          ['plumbing', 'electrical']
        );
      });

      expect(result.current.currentUser?.role).toBe('both');
      expect(result.current.currentUser?.modesUnlocked).toContain('everyday');
      expect(result.current.currentUser?.modesUnlocked).toContain('business');
      expect(result.current.currentUser?.modesUnlocked).toContain('tradesmen');
    });
  });

  describe('Task Management', () => {
    it('should create and accept task', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'Poster',
          'poster',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );
      });

      await act(async () => {
        await result.current.createTask({
          title: 'Test Task',
          description: 'Description',
          category: 'handyman',
          payAmount: 50,
          xpReward: 100,
          location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
        });
      });

      expect(result.current.tasks.length).toBeGreaterThan(0);
      const task = result.current.tasks[0];
      expect(task?.title).toBe('Test Task');
      expect(task?.status).toBe('open');
    });

    it('should complete task and award XP', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'Worker',
          'worker',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );
      });

      await act(async () => {
        await result.current.createTask({
          title: 'Complete Me',
          description: 'Task to complete',
          category: 'handyman',
          payAmount: 50,
          xpReward: 100,
          location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
        });
      });

      const taskId = result.current.tasks[0]?.id || '';

      await act(async () => {
        await result.current.acceptTask(taskId);
      });

      const initialXP = result.current.currentUser?.xp || 0;

      await act(async () => {
        await result.current.completeTask(taskId);
      });

      expect(result.current.currentUser?.xp).toBeGreaterThan(initialXP);
      expect(result.current.currentUser?.tasksCompleted).toBe(1);
    });
  });

  describe('Mode Switching', () => {
    it('should switch between modes', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'Dual User',
          'both',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );
      });

      expect(result.current.currentUser?.activeMode).toBe('everyday');

      await act(async () => {
        await result.current.switchMode('business');
      });

      expect(result.current.currentUser?.activeMode).toBe('business');
    });

    it('should update role when switching modes', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'Worker',
          'worker',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );
      });

      await act(async () => {
        await result.current.switchMode('business');
      });

      expect(result.current.currentUser?.role).toBe('poster');
      expect(result.current.currentUser?.activeMode).toBe('business');
    });
  });

  describe('Messaging', () => {
    it('should send and retrieve messages', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'User',
          'worker',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );
      });

      await act(async () => {
        await result.current.createTask({
          title: 'Task with Messages',
          description: 'Test',
          category: 'handyman',
          payAmount: 50,
          xpReward: 100,
          location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
        });
      });

      const taskId = result.current.tasks[0]?.id || '';

      await act(async () => {
        await result.current.sendMessage(taskId, 'Hello!');
      });

      const messages = result.current.getTaskMessages(taskId);
      expect(messages.length).toBe(1);
      expect(messages[0]?.text).toBe('Hello!');
    });
  });

  describe('Ratings', () => {
    it('should rate user and update reputation', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'User 1',
          'worker',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );
      });

      const user1Id = result.current.currentUser?.id || '';

      await act(async () => {
        await result.current.completeOnboarding(
          'User 2',
          'poster',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );
      });

      await act(async () => {
        await result.current.createTask({
          title: 'Task',
          description: 'Test',
          category: 'handyman',
          payAmount: 50,
          xpReward: 100,
          location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
        });
      });

      const taskId = result.current.tasks[0]?.id || '';

      await act(async () => {
        await result.current.rateUser(user1Id, taskId, 4, 'Great work!');
      });

      expect(result.current.ratings.length).toBe(1);
      expect(result.current.ratings[0]?.score).toBe(4);
    });
  });

  describe('Power-Ups', () => {
    it('should purchase and activate power-up', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await act(async () => {
        await result.current.completeOnboarding(
          'User',
          'worker',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );
      });

      const mockPowerUp = {
        id: 'xp-boost',
        name: 'XP Boost',
        description: 'Double your XP',
        icon: '⚡',
        price: 9.99,
        effect: { type: 'xp_multiplier' as const, value: 2, duration: 24 },
      };

      const response = await act(async () => {
        return await result.current.purchasePowerUp(mockPowerUp);
      });

      expect(response?.success).toBe(true);
      expect(result.current.purchases.length).toBeGreaterThan(0);
    });
  });
});
