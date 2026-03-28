import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Message, Rating, Report } from '@/types';
import { SEED_TASKS } from '@/mocks/seedData';
import { useUser } from './UserContext';
import { hustleAI } from '@/utils/hustleAI';

const STORAGE_KEYS = {
  TASKS: 'hustlexp_tasks',
  MESSAGES: 'hustlexp_messages',
  RATINGS: 'hustlexp_ratings',
  REPORTS: 'hustlexp_reports',
};

let notificationHandler: ((userId: string, type: any, data?: any) => Promise<any>) | undefined;

export function setTasksNotificationHandler(handler: (userId: string, type: any, data?: any) => Promise<any>) {
  notificationHandler = handler;
}

export const [TasksProvider, useTasks] = createContextHook(() => {
  const { currentUser, users, updateUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedTasks, storedMessages, storedRatings, storedReports] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.RATINGS),
        AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
      ]);

      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(SEED_TASKS);
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
      }
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedRatings) setRatings(JSON.parse(storedRatings));
      if (storedReports) setReports(JSON.parse(storedReports));
    } catch (error) {
      console.error('Error loading tasks data:', error);
    }
  };

  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'posterId'>) => {
    if (!currentUser) return;

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: 'open',
      posterId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));

    if (notificationHandler) {
      users.forEach(user => {
        if (user.id !== currentUser.id && user.role !== 'poster') {
          notificationHandler!(user.id, 'quest_new', {
            posterName: currentUser.name,
            taskTitle: newTask.title,
            taskId: newTask.id,
          });
        }
      });
    }
  }, [currentUser, tasks, users]);

  const acceptTask = useCallback(async (taskId: string) => {
    if (!currentUser) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: 'in_progress' as const, workerId: currentUser.id } : t
    );
    setTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));

    hustleAI.trackExperiment({
      experimentId: 'task_acceptance_v1',
      userId: currentUser.id,
      variant: 'control',
      outcome: 'success',
      metrics: {
        taskPrice: task.payAmount,
        xpReward: task.xpReward,
        userLevel: currentUser.level,
      },
    }).catch(err => console.warn('[HUSTLEAI] Failed to track experiment:', err));

    if (notificationHandler) {
      notificationHandler(task.posterId, 'quest_accepted', {
        workerName: currentUser.name,
        taskTitle: task.title,
        taskId: task.id,
      });
    }
  }, [currentUser, tasks]);

  const completeTask = useCallback(async (taskId: string) => {
    if (!currentUser) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const startTime = Date.now();
    
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));

    const completionTime = (Date.now() - startTime) / 60000;
    
    hustleAI.submitFeedback({
      userId: currentUser.id,
      taskId: task.id,
      predictionType: 'completion',
      predictedValue: task.xpReward,
      actualValue: task.xpReward,
      context: {
        category: task.category,
        payAmount: task.payAmount,
        completionTime,
      },
    }).catch(err => console.warn('[HUSTLEAI] Failed to submit feedback:', err));

    if (notificationHandler) {
      notificationHandler(currentUser.id, 'quest_completed', {
        taskTitle: task.title,
        xpReward: task.xpReward,
        taskId: task.id,
      });
    }

    return task;
  }, [currentUser, tasks]);

  const sendMessage = useCallback(async (taskId: string, text: string) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      taskId,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));

    const task = tasks.find(t => t.id === taskId);
    if (task && notificationHandler) {
      const recipientId = task.posterId === currentUser.id ? task.workerId : task.posterId;
      if (recipientId) {
        notificationHandler(recipientId, 'message_new', {
          senderName: currentUser.name,
          taskTitle: task.title,
          taskId: task.id,
        });
      }
    }
  }, [currentUser, messages, tasks]);

  const getTaskMessages = useCallback((taskId: string) => {
    return messages.filter(m => m.taskId === taskId);
  }, [messages]);

  const rateUser = useCallback(async (toUserId: string, taskId: string, score: number, comment?: string) => {
    if (!currentUser) return;

    const newRating: Rating = {
      id: `rating-${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId,
      taskId,
      score,
      comment,
      createdAt: new Date().toISOString(),
    };

    const updatedRatings = [...ratings, newRating];
    setRatings(updatedRatings);

    const targetUser = users.find(u => u.id === toUserId);
    if (targetUser) {
      const userRatings = updatedRatings.filter(r => r.toUserId === toUserId);
      const avgRating = userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length;

      const updatedUser = {
        ...targetUser,
        reputationScore: avgRating,
        ratings: userRatings,
      };

      await updateUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(updatedRatings));
    }
  }, [currentUser, ratings, users, updateUser]);

  const submitReport = useCallback(async (reportedUserId: string, reason: string, description: string, taskId?: string) => {
    if (!currentUser) return;

    const newReport: Report = {
      id: `report-${Date.now()}`,
      reporterId: currentUser.id,
      reportedUserId,
      taskId,
      reason,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updatedReports));

    console.log('Report submitted:', newReport);
  }, [currentUser, reports]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sendHustleAITaskOffers = useCallback(async () => {
    if (!currentUser) return;

    if (currentUser.role === 'poster' || currentUser.activeMode === 'business') {
      console.log('HustleAI: Skipping task offers for Poster Mode');
      return;
    }

    const nearbyTasks = tasks.filter(task => {
      if (task.status !== 'open') return false;
      const distance = calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        task.location.lat,
        task.location.lng
      );
      return distance <= 10;
    }).slice(0, 3);

    if (nearbyTasks.length === 0) {
      console.log('No nearby tasks found');
      return;
    }

    const newMessages: Message[] = [];
    
    for (const task of nearbyTasks) {
      const distance = calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        task.location.lat,
        task.location.lng
      );

      const hustleAIMessage: Message = {
        id: `msg-hustleai-${Date.now()}-${Math.random()}`,
        taskId: `hustleai-${task.id}`,
        senderId: 'hustleai',
        text: `🎯 New Task Match! I found a perfect gig for you nearby.`,
        timestamp: new Date().toISOString(),
        isHustleAI: true,
        taskOffer: {
          taskId: task.id,
          title: task.title,
          pay: task.payAmount,
          distance: distance,
          estimatedTime: task.estimatedDuration || '1-2 hours',
          category: task.category,
          skillMatch: Math.floor(Math.random() * 30) + 70,
        },
        offerStatus: 'pending',
      };

      newMessages.push(hustleAIMessage);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, ...newMessages];
      AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    console.log(`📬 HustleAI sent ${newMessages.length} task offer(s) via DM`);
  }, [currentUser, tasks]);

  const updateAvailabilityStatus = useCallback(async (status: 'offline' | 'online' | 'available_now' | 'busy') => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      availabilityStatus: status,
      currentLocation: status === 'available_now' ? {
        lat: currentUser.location.lat,
        lng: currentUser.location.lng,
        lastUpdated: new Date().toISOString(),
      } : currentUser.currentLocation,
    };

    await updateUser(updatedUser);
    console.log('Availability status updated to:', status);

    if (status === 'available_now') {
      setTimeout(() => {
        sendHustleAITaskOffers();
      }, 100);
    }
  }, [currentUser, updateUser, sendHustleAITaskOffers]);

  const respondToTaskOffer = useCallback(async (messageId: string, response: 'accepted' | 'declined' | 'snoozed') => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.taskOffer) return;

    const updatedMessages = messages.map(m => 
      m.id === messageId ? { ...m, offerStatus: response } : m
    );
    setMessages(updatedMessages);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));

    if (response === 'accepted' && message.taskOffer.taskId) {
      await acceptTask(message.taskOffer.taskId);
    }
  }, [messages, acceptTask]);

  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(t => t.posterId === currentUser.id);
  }, [tasks, currentUser]);

  const myAcceptedTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(t => t.workerId === currentUser.id);
  }, [tasks, currentUser]);

  const availableTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'open');
  }, [tasks]);

  return useMemo(() => ({
    tasks,
    messages,
    ratings,
    reports,
    createTask,
    acceptTask,
    completeTask,
    sendMessage,
    getTaskMessages,
    rateUser,
    submitReport,
    updateAvailabilityStatus,
    respondToTaskOffer,
    myTasks,
    myAcceptedTasks,
    availableTasks,
  }), [
    tasks,
    messages,
    ratings,
    reports,
    createTask,
    acceptTask,
    completeTask,
    sendMessage,
    getTaskMessages,
    rateUser,
    submitReport,
    updateAvailabilityStatus,
    respondToTaskOffer,
    myTasks,
    myAcceptedTasks,
    availableTasks,
  ]);
});
