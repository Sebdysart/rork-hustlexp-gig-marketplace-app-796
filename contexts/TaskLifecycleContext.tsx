import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  TaskProgress, 
  TaskSubtask, 
  TaskCheckpoint, 
  TaskVerification, 
  TaskProof, 
  TaskCompletion,
  ScheduleSlot,
  TaskLifecycleStatus
} from '@/types';

const STORAGE_KEY = 'hustlexp_task_lifecycle';

export const [TaskLifecycleProvider, useTaskLifecycle] = createContextHook(() => {
  const [taskProgresses, setTaskProgresses] = useState<Record<string, TaskProgress>>({});
  const [taskVerifications, setTaskVerifications] = useState<Record<string, TaskVerification>>({});
  const [taskCompletions, setTaskCompletions] = useState<Record<string, TaskCompletion>>({});
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setTaskProgresses(data.taskProgresses || {});
        setTaskVerifications(data.taskVerifications || {});
        setTaskCompletions(data.taskCompletions || {});
      }
    } catch (error) {
      console.error('Error loading task lifecycle data:', error);
    }
  };

  const saveData = async (progresses: Record<string, TaskProgress>, verifications: Record<string, TaskVerification>, completions: Record<string, TaskCompletion>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        taskProgresses: progresses,
        taskVerifications: verifications,
        taskCompletions: completions,
      }));
    } catch (error) {
      console.error('Error saving task lifecycle data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const updated = { ...prev };
        Object.keys(taskProgresses).forEach(taskId => {
          const progress = taskProgresses[taskId];
          if (progress.status === 'active' && progress.startedAt) {
            const elapsed = Math.floor((Date.now() - new Date(progress.startedAt).getTime()) / 1000);
            updated[taskId] = elapsed;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [taskProgresses]);

  const generateSubtasks = useCallback((taskTitle: string, estimatedDuration?: string): TaskSubtask[] => {
    const durationHours = estimatedDuration ? parseFloat(estimatedDuration) : 2;
    
    if (durationHours < 2) {
      return [{
        id: 'subtask-1',
        title: taskTitle,
        completed: false,
      }];
    }

    if (durationHours < 4) {
      return [
        { id: 'subtask-1', title: 'Preparation & Setup', completed: false },
        { id: 'subtask-2', title: 'Main Work', completed: false },
        { id: 'subtask-3', title: 'Cleanup & Finalization', completed: false },
      ];
    }

    return [
      { id: 'subtask-1', title: 'Initial Assessment & Prep', completed: false, estimatedDuration: 30 },
      { id: 'subtask-2', title: 'Phase 1: Core Work', completed: false, estimatedDuration: 60 },
      { id: 'subtask-3', title: 'Phase 2: Detailed Work', completed: false, estimatedDuration: 60 },
      { id: 'subtask-4', title: 'Quality Check', completed: false, estimatedDuration: 20 },
      { id: 'subtask-5', title: 'Final Cleanup', completed: false, estimatedDuration: 30 },
    ];
  }, []);

  const generateCheckpoints = useCallback((estimatedDuration?: string): TaskCheckpoint[] => {
    const durationHours = estimatedDuration ? parseFloat(estimatedDuration) : 2;
    
    if (durationHours < 24) return [];

    const days = Math.ceil(durationHours / 8);
    const checkpoints: TaskCheckpoint[] = [];

    for (let i = 1; i <= days; i++) {
      checkpoints.push({
        id: `checkpoint-${i}`,
        day: i,
        title: `Day ${i} Milestone`,
        completed: false,
      });
    }

    return checkpoints;
  }, []);

  const generateScheduleSlots = useCallback((): ScheduleSlot[] => {
    const now = new Date();
    const slots: ScheduleSlot[] = [];

    const todayAfternoon = new Date(now);
    todayAfternoon.setHours(14, 0, 0, 0);
    if (todayAfternoon > now) {
      slots.push({
        id: 'slot-1',
        startTime: todayAfternoon.toISOString(),
        endTime: new Date(todayAfternoon.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        recommended: true,
        reason: 'Optimal productivity window',
      });
    }

    const tomorrowMorning = new Date(now);
    tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
    tomorrowMorning.setHours(9, 0, 0, 0);
    slots.push({
      id: 'slot-2',
      startTime: tomorrowMorning.toISOString(),
      endTime: new Date(tomorrowMorning.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      recommended: true,
      reason: 'Fresh start to the day',
    });

    const tomorrowAfternoon = new Date(now);
    tomorrowAfternoon.setDate(tomorrowAfternoon.getDate() + 1);
    tomorrowAfternoon.setHours(15, 0, 0, 0);
    slots.push({
      id: 'slot-3',
      startTime: tomorrowAfternoon.toISOString(),
      endTime: new Date(tomorrowAfternoon.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      recommended: false,
    });

    return slots;
  }, []);

  const initializeTaskProgress = useCallback(async (taskId: string, taskTitle: string, estimatedDuration?: string) => {
    const subtasks = generateSubtasks(taskTitle, estimatedDuration);
    const checkpoints = generateCheckpoints(estimatedDuration);

    const progress: TaskProgress = {
      taskId,
      status: 'pending_start',
      subtasks,
      currentSubtaskIndex: 0,
      totalTimeSpent: 0,
      checkpoints,
    };

    const updated = { ...taskProgresses, [taskId]: progress };
    setTaskProgresses(updated);
    await saveData(updated, taskVerifications, taskCompletions);
    
    return progress;
  }, [taskProgresses, taskVerifications, taskCompletions, generateSubtasks, generateCheckpoints]);

  const startTask = useCallback(async (taskId: string) => {
    const progress = taskProgresses[taskId];
    if (!progress) return;

    const updated = {
      ...taskProgresses,
      [taskId]: {
        ...progress,
        status: 'active' as TaskLifecycleStatus,
        startedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
    };

    setTaskProgresses(updated);
    await saveData(updated, taskVerifications, taskCompletions);
  }, [taskProgresses, taskVerifications, taskCompletions]);

  const scheduleTask = useCallback(async (taskId: string, scheduledTime: string) => {
    const progress = taskProgresses[taskId];
    if (!progress) return;

    const updated = {
      ...taskProgresses,
      [taskId]: {
        ...progress,
        status: 'scheduled' as TaskLifecycleStatus,
        scheduledFor: scheduledTime,
      },
    };

    setTaskProgresses(updated);
    await saveData(updated, taskVerifications, taskCompletions);
  }, [taskProgresses, taskVerifications, taskCompletions]);

  const pauseTask = useCallback(async (taskId: string) => {
    const progress = taskProgresses[taskId];
    if (!progress) return;

    const updated = {
      ...taskProgresses,
      [taskId]: {
        ...progress,
        status: 'paused' as TaskLifecycleStatus,
        pausedAt: new Date().toISOString(),
      },
    };

    setTaskProgresses(updated);
    await saveData(updated, taskVerifications, taskCompletions);
  }, [taskProgresses, taskVerifications, taskCompletions]);

  const resumeTask = useCallback(async (taskId: string) => {
    const progress = taskProgresses[taskId];
    if (!progress) return;

    const updated = {
      ...taskProgresses,
      [taskId]: {
        ...progress,
        status: 'active' as TaskLifecycleStatus,
        lastActiveAt: new Date().toISOString(),
        pausedAt: undefined,
      },
    };

    setTaskProgresses(updated);
    await saveData(updated, taskVerifications, taskCompletions);
  }, [taskProgresses, taskVerifications, taskCompletions]);

  const completeSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const progress = taskProgresses[taskId];
    if (!progress) return;

    const updatedSubtasks = progress.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: true, completedAt: new Date().toISOString() } : st
    );

    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const nextIndex = Math.min(completedCount, updatedSubtasks.length - 1);

    const updated = {
      ...taskProgresses,
      [taskId]: {
        ...progress,
        subtasks: updatedSubtasks,
        currentSubtaskIndex: nextIndex,
      },
    };

    setTaskProgresses(updated);
    await saveData(updated, taskVerifications, taskCompletions);
  }, [taskProgresses, taskVerifications, taskCompletions]);

  const completeCheckpoint = useCallback(async (taskId: string, checkpointId: string, notes?: string) => {
    const progress = taskProgresses[taskId];
    if (!progress) return;

    const updatedCheckpoints = progress.checkpoints.map(cp =>
      cp.id === checkpointId ? { ...cp, completed: true, completedAt: new Date().toISOString(), notes } : cp
    );

    const updated = {
      ...taskProgresses,
      [taskId]: {
        ...progress,
        checkpoints: updatedCheckpoints,
      },
    };

    setTaskProgresses(updated);
    await saveData(updated, taskVerifications, taskCompletions);
  }, [taskProgresses, taskVerifications, taskCompletions]);

  const submitVerification = useCallback(async (taskId: string, proofData: TaskProof[]) => {
    const proofType = proofData.length === 1 
      ? proofData[0].type 
      : proofData.every(p => p.type === proofData[0].type) 
        ? proofData[0].type 
        : 'mixed';

    const verification: TaskVerification = {
      taskId,
      proofType,
      proofData,
      aiVerificationStatus: 'pending',
      submittedAt: new Date().toISOString(),
    };

    const updatedVerifications = { ...taskVerifications, [taskId]: verification };
    setTaskVerifications(updatedVerifications);

    const progress = taskProgresses[taskId];
    if (progress) {
      const updatedProgresses = {
        ...taskProgresses,
        [taskId]: {
          ...progress,
          status: 'verification' as TaskLifecycleStatus,
        },
      };
      setTaskProgresses(updatedProgresses);
      await saveData(updatedProgresses, updatedVerifications, taskCompletions);
    }

    setTimeout(async () => {
      const verifiedVerification: TaskVerification = {
        ...verification,
        aiVerificationStatus: 'verifying',
      };
      const updatedVerifications2 = { ...taskVerifications, [taskId]: verifiedVerification };
      setTaskVerifications(updatedVerifications2);
      await saveData(taskProgresses, updatedVerifications2, taskCompletions);
    }, 1500);

    setTimeout(async () => {
      const confidence = 85 + Math.random() * 13;
      const finalVerification: TaskVerification = {
        ...verification,
        aiVerificationStatus: 'verified',
        aiConfidence: confidence,
        aiNotes: confidence > 95 
          ? 'Excellent proof quality. All requirements met.' 
          : 'Good proof quality. Task completion verified.',
        verifiedAt: new Date().toISOString(),
      };
      const updatedVerifications3 = { ...taskVerifications, [taskId]: finalVerification };
      setTaskVerifications(updatedVerifications3);
      await saveData(taskProgresses, updatedVerifications3, taskCompletions);
    }, 4000);

    return verification;
  }, [taskProgresses, taskVerifications, taskCompletions]);

  const completeTaskLifecycle = useCallback(async (
    taskId: string,
    xpGained: number,
    paymentAmount: number,
    posterRating?: number,
    posterReview?: string,
    workerNotes?: string
  ) => {
    const progress = taskProgresses[taskId];
    if (!progress) return;

    const startTime = progress.startedAt ? new Date(progress.startedAt).getTime() : Date.now();
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const totalDuration = `${hours}h ${minutes}m`;

    const allSubtasksCompleted = progress.subtasks.every(st => st.completed);
    const accuracyScore = allSubtasksCompleted ? 98 : 85;

    const completion: TaskCompletion = {
      taskId,
      completedAt: new Date().toISOString(),
      totalDuration,
      accuracyScore,
      xpGained,
      paymentAmount,
      posterRating,
      posterReview,
      workerNotes,
    };

    const updatedCompletions = { ...taskCompletions, [taskId]: completion };
    setTaskCompletions(updatedCompletions);

    const updatedProgresses = {
      ...taskProgresses,
      [taskId]: {
        ...progress,
        status: 'completed' as TaskLifecycleStatus,
      },
    };
    setTaskProgresses(updatedProgresses);

    await saveData(updatedProgresses, taskVerifications, updatedCompletions);

    return completion;
  }, [taskProgresses, taskVerifications, taskCompletions]);

  const getTaskProgress = useCallback((taskId: string) => {
    return taskProgresses[taskId];
  }, [taskProgresses]);

  const getTaskVerification = useCallback((taskId: string) => {
    return taskVerifications[taskId];
  }, [taskVerifications]);

  const getTaskCompletion = useCallback((taskId: string) => {
    return taskCompletions[taskId];
  }, [taskCompletions]);

  const getActiveTimer = useCallback((taskId: string) => {
    return activeTimers[taskId] || 0;
  }, [activeTimers]);

  const getProgressPercentage = useCallback((taskId: string) => {
    const progress = taskProgresses[taskId];
    if (!progress) return 0;

    const completedSubtasks = progress.subtasks.filter(st => st.completed).length;
    return (completedSubtasks / progress.subtasks.length) * 100;
  }, [taskProgresses]);

  return useMemo(() => ({
    taskProgresses,
    taskVerifications,
    taskCompletions,
    initializeTaskProgress,
    startTask,
    scheduleTask,
    pauseTask,
    resumeTask,
    completeSubtask,
    completeCheckpoint,
    submitVerification,
    completeTaskLifecycle,
    getTaskProgress,
    getTaskVerification,
    getTaskCompletion,
    getActiveTimer,
    getProgressPercentage,
    generateScheduleSlots,
  }), [
    taskProgresses,
    taskVerifications,
    taskCompletions,
    initializeTaskProgress,
    startTask,
    scheduleTask,
    pauseTask,
    resumeTask,
    completeSubtask,
    completeCheckpoint,
    submitVerification,
    completeTaskLifecycle,
    getTaskProgress,
    getTaskVerification,
    getTaskCompletion,
    getActiveTimer,
    getProgressPercentage,
    generateScheduleSlots,
  ]);
});
