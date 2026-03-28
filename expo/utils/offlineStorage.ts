import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, User } from '@/types';

const OFFLINE_KEYS = {
  CACHED_TASKS: 'hustlexp_offline_tasks',
  CACHED_USERS: 'hustlexp_offline_users',
  PENDING_ACTIONS: 'hustlexp_pending_actions',
  LAST_SYNC: 'hustlexp_last_sync',
};

export type PendingAction = {
  id: string;
  type: 'create_task' | 'accept_task' | 'complete_task' | 'send_message';
  data: any;
  timestamp: string;
};

export const cacheTasksForOffline = async (tasks: Task[]) => {
  try {
    await AsyncStorage.setItem(OFFLINE_KEYS.CACHED_TASKS, JSON.stringify(tasks));
    await AsyncStorage.setItem(OFFLINE_KEYS.LAST_SYNC, new Date().toISOString());
    console.log('Tasks cached for offline use');
  } catch (error) {
    console.error('Error caching tasks:', error);
  }
};

export const getCachedTasks = async (): Promise<Task[]> => {
  try {
    const cached = await AsyncStorage.getItem(OFFLINE_KEYS.CACHED_TASKS);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error getting cached tasks:', error);
    return [];
  }
};

export const cacheUsersForOffline = async (users: User[]) => {
  try {
    await AsyncStorage.setItem(OFFLINE_KEYS.CACHED_USERS, JSON.stringify(users));
    console.log('Users cached for offline use');
  } catch (error) {
    console.error('Error caching users:', error);
  }
};

export const getCachedUsers = async (): Promise<User[]> => {
  try {
    const cached = await AsyncStorage.getItem(OFFLINE_KEYS.CACHED_USERS);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error getting cached users:', error);
    return [];
  }
};

export const addPendingAction = async (action: Omit<PendingAction, 'id' | 'timestamp'>) => {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_KEYS.PENDING_ACTIONS);
    const actions: PendingAction[] = existing ? JSON.parse(existing) : [];
    
    const newAction: PendingAction = {
      ...action,
      id: `action-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    actions.push(newAction);
    await AsyncStorage.setItem(OFFLINE_KEYS.PENDING_ACTIONS, JSON.stringify(actions));
    console.log('Pending action added:', newAction.type);
  } catch (error) {
    console.error('Error adding pending action:', error);
  }
};

export const getPendingActions = async (): Promise<PendingAction[]> => {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_KEYS.PENDING_ACTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
};

export const clearPendingActions = async () => {
  try {
    await AsyncStorage.removeItem(OFFLINE_KEYS.PENDING_ACTIONS);
    console.log('Pending actions cleared');
  } catch (error) {
    console.error('Error clearing pending actions:', error);
  }
};

export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(OFFLINE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};
