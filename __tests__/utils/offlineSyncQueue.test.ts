import { offlineSyncQueue, SyncAction, QueuedAction } from '@/utils/offlineSyncQueue';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

jest.mock('@/utils/errorTracking', () => ({
  errorTracker: {
    logError: jest.fn(),
  },
}));

describe('OfflineSyncQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Queue Management', () => {
    it('should add action to queue', async () => {
      const actionId = await offlineSyncQueue.addAction(
        'create_task',
        { title: 'Test Task', payAmount: 50 },
        false
      );

      expect(actionId).toBeDefined();
      expect(actionId).toMatch(/^sync-/);
      expect(offlineSyncQueue.getQueueCount()).toBeGreaterThan(0);
    });

    it('should set correct priority for actions', async () => {
      await offlineSyncQueue.clearQueue();

      await offlineSyncQueue.addAction('update_profile', {}, false);
      await offlineSyncQueue.addAction('complete_task', {}, false);
      await offlineSyncQueue.addAction('send_message', {}, false);

      const queue = offlineSyncQueue.getQueue();
      const completeTaskAction = queue.find(a => a.action === 'complete_task');
      const updateProfileAction = queue.find(a => a.action === 'update_profile');

      expect(completeTaskAction?.priority).toBe('high');
      expect(updateProfileAction?.priority).toBe('low');
    });

    it('should remove action from queue', async () => {
      await offlineSyncQueue.clearQueue();
      
      const actionId = await offlineSyncQueue.addAction(
        'create_task',
        { title: 'Test' },
        false
      );

      const initialCount = offlineSyncQueue.getQueueCount();
      await offlineSyncQueue.removeAction(actionId);
      const finalCount = offlineSyncQueue.getQueueCount();

      expect(finalCount).toBe(initialCount - 1);
    });

    it('should clear entire queue', async () => {
      await offlineSyncQueue.addAction('create_task', {}, false);
      await offlineSyncQueue.addAction('send_message', {}, false);

      await offlineSyncQueue.clearQueue();

      expect(offlineSyncQueue.getQueueCount()).toBe(0);
    });
  });

  describe('Queue Listeners', () => {
    it('should notify listeners on queue changes', async () => {
      const listener = jest.fn();
      const unsubscribe = offlineSyncQueue.onQueueChange(listener);

      await offlineSyncQueue.addAction('create_task', {}, false);

      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('should stop notifying after unsubscribe', async () => {
      const listener = jest.fn();
      const unsubscribe = offlineSyncQueue.onQueueChange(listener);

      listener.mockClear();
      unsubscribe();

      await offlineSyncQueue.addAction('send_message', {}, false);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Network Status', () => {
    it('should track network status', () => {
      const isOnline = offlineSyncQueue.isNetworkOnline();
      expect(typeof isOnline).toBe('boolean');
    });
  });

  describe('Action Types', () => {
    const actionTypes: SyncAction[] = [
      'create_task',
      'accept_task',
      'complete_task',
      'send_message',
      'rate_user',
      'update_profile',
      'purchase_powerup',
      'switch_mode',
    ];

    actionTypes.forEach(actionType => {
      it(`should support ${actionType} action`, async () => {
        const actionId = await offlineSyncQueue.addAction(
          actionType,
          { test: 'data' },
          false
        );

        const queue = offlineSyncQueue.getQueue();
        const action = queue.find(a => a.id === actionId);

        expect(action).toBeDefined();
        expect(action?.action).toBe(actionType);
      });
    });
  });

  describe('Retry Logic', () => {
    it('should track retry count in queued action', async () => {
      const actionId = await offlineSyncQueue.addAction(
        'create_task',
        {},
        false
      );

      const queue = offlineSyncQueue.getQueue();
      const action = queue.find(a => a.id === actionId);

      expect(action?.retries).toBe(0);
    });
  });

  describe('Queue Persistence', () => {
    it('should persist timestamp for actions', async () => {
      const beforeTime = new Date().toISOString();
      
      const actionId = await offlineSyncQueue.addAction(
        'send_message',
        {},
        false
      );

      const afterTime = new Date().toISOString();
      const queue = offlineSyncQueue.getQueue();
      const action = queue.find(a => a.id === actionId);

      expect(action?.timestamp).toBeDefined();
      expect(action?.timestamp >= beforeTime).toBe(true);
      expect(action?.timestamp <= afterTime).toBe(true);
    });
  });
});
