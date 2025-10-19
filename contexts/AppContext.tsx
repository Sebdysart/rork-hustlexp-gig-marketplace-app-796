import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task, Message, UserRole, UserMode, Rating, Report, Purchase, PowerUp, ActivePowerUp, UnlockedFeature } from '@/types';
import { SEED_USERS, SEED_TASKS } from '@/mocks/seedData';
import { calculateLevel } from '@/utils/gamification';
import { checkDailyStreak, updateUserStreak } from '@/utils/dailyStreak';
import { GRIT_REWARDS } from '@/constants/economy';
import { useNotifications } from './NotificationContext';
import { hustleAI } from '@/utils/hustleAI';

const STORAGE_KEYS = {
  CURRENT_USER: 'hustlexp_current_user',
  USERS: 'hustlexp_users',
  TASKS: 'hustlexp_tasks',
  MESSAGES: 'hustlexp_messages',
  HAS_ONBOARDED: 'hustlexp_has_onboarded',
  RATINGS: 'hustlexp_ratings',
  REPORTS: 'hustlexp_reports',
  PURCHASES: 'hustlexp_purchases',
  ACTIVE_POWERUPS: 'hustlexp_active_powerups',
};

const COMMISSION_RATE = 0.125;

export const [AppProvider, useApp] = createContextHook(() => {
  let addNotification: ((userId: string, type: any, data?: any) => Promise<any>) | undefined;
  
  try {
    const notificationContext = useNotifications();
    addNotification = notificationContext.addNotification;
  } catch (error) {
    console.warn('NotificationContext not available yet');
    addNotification = async () => null;
  }
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<Record<string, ActivePowerUp[]>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      checkAndUpdateStreak();
    }
  }, [currentUser?.id]);

  const loadData = async () => {
    try {
      const [storedUser, storedUsers, storedTasks, storedMessages, storedOnboarded, storedRatings, storedReports, storedPurchases, storedActivePowerUps] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
        AsyncStorage.getItem(STORAGE_KEYS.USERS),
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.RATINGS),
        AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
        AsyncStorage.getItem(STORAGE_KEYS.PURCHASES),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_POWERUPS),
      ]);

      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(SEED_USERS);
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      }
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(SEED_TASKS);
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
      }
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedOnboarded) setHasOnboarded(JSON.parse(storedOnboarded));
      if (storedRatings) setRatings(JSON.parse(storedRatings));
      if (storedReports) setReports(JSON.parse(storedReports));
      if (storedPurchases) setPurchases(JSON.parse(storedPurchases));
      if (storedActivePowerUps) setActivePowerUps(JSON.parse(storedActivePowerUps));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndUpdateStreak = useCallback(async () => {
    if (!currentUser) return;

    const streakResult = checkDailyStreak(currentUser);
    
    if (streakResult.isNewDay) {
      const updatedUser = updateUserStreak(currentUser, streakResult);
      await updateUser(updatedUser);

      if (streakResult.gritReward > 0 && addNotification) {
        addNotification(currentUser.id, 'quest_completed', {
          taskTitle: 'Daily Login',
          xpReward: 0,
          message: streakResult.message,
        });
      }
    }
  }, [currentUser]);

  const completeOnboarding = useCallback(async (name: string, role: UserRole, location: { lat: number; lng: number; address: string }, email?: string, password?: string, mode?: UserMode, trades?: string[]) => {
    const initialMode = mode || (role === 'poster' ? 'business' : 'everyday');
    const modesUnlocked: UserMode[] = [initialMode];
    
    if (role === 'both') {
      modesUnlocked.push('everyday', 'business');
      if (trades && trades.length > 0) {
        modesUnlocked.push('tradesmen');
      }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email || `${name.toLowerCase().replace(/\s/g, '.')}@hustlexp.com`,
      password: password || 'password123',
      role,
      name,
      location,
      bio: 'Ready to hustle! 💪',
      profilePic: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      xp: 0,
      level: 1,
      badges: [],
      tasksCompleted: 0,
      earnings: 0,
      reputationScore: 5,
      streaks: {
        current: 0,
        longest: 0,
        lastTaskDate: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      isOnline: true,
      lastSeen: new Date().toISOString(),
      wallet: {
        grit: 0,
        taskCredits: 0,
        crowns: 0,
      },
      dailyStreak: {
        count: 0,
        lastLoginDate: new Date().toISOString(),
        freezesUsed: 0,
      },
      prestige: {
        level: 0,
        totalPrestige: 0,
        permanentPayoutBoost: 0,
      },
      activeMode: initialMode,
      modesUnlocked,
      tradesmanProfile: (mode === 'tradesmen' || role === 'both') && trades ? {
        isPro: true,
        trades: trades,
        primaryTrade: trades[0],
        certifications: [],
        tradeXP: {},
        currentBadges: {},
        availableNow: false,
        completedJobs: 0,
        toolInventory: [],
        portfolio: [],
        businessMetrics: {
          totalEarnings: 0,
          repeatClients: 0,
          averageJobValue: 0,
          onTimeCompletion: 100,
        },
      } : undefined,
      posterProfile: (mode === 'business' || role === 'both' || role === 'poster') ? {
        trustXP: 0,
        totalSpent: 0,
        tasksPosted: 0,
        avgRating: 5,
        badges: [],
        reliabilityScore: 100,
      } : undefined,
    };

    setCurrentUser(newUser);
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setHasOnboarded(true);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser)),
      AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers)),
      AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, JSON.stringify(true)),
    ]);
  }, [users]);

  const updateUser = useCallback(async (updatedUser: User) => {
    const isCurrentUser = currentUser?.id === updatedUser.id;
    
    if (isCurrentUser) {
      setCurrentUser(updatedUser);
    }
    
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);

    const promises = [AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers))];
    
    if (isCurrentUser) {
      promises.push(AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser)));
    }

    await Promise.all(promises);
  }, [users, currentUser]);

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

    if (addNotification) {
      users.forEach(user => {
        if (user.id !== currentUser.id && user.role !== 'poster') {
          addNotification(user.id, 'quest_new', {
            posterName: currentUser.name,
            taskTitle: newTask.title,
            taskId: newTask.id,
          });
        }
      });
    }
  }, [currentUser, tasks, users, addNotification]);

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

    if (addNotification) {
      addNotification(task.posterId, 'quest_accepted', {
        workerName: currentUser.name,
        taskTitle: task.title,
        taskId: task.id,
      });
    }
  }, [currentUser, tasks, addNotification]);

  const checkAndUnlockFeatures = useCallback(async (newLevel: number, oldLevel: number) => {
    if (!currentUser) return;

    const gamificationFeatures = [
      { id: 'shop', name: 'Power-Up Shop', unlockLevel: 10 },
      { id: 'progressive-badges', name: 'Progressive Badges', unlockLevel: 10 },
      { id: 'seasons', name: 'Seasons', unlockLevel: 10 },
      { id: 'squads', name: 'Squads', unlockLevel: 25 },
      { id: 'squad-quests', name: 'Squad Quests', unlockLevel: 25 },
      { id: 'trophy-room', name: 'Trophy Room', unlockLevel: 25 },
      { id: 'skill-tree', name: 'Skill Tree', unlockLevel: 50 },
      { id: 'adventure-map', name: 'Adventure Map', unlockLevel: 50 },
    ];

    const unlockedFeatures = currentUser.unlockedFeatures || [];
    const newlyUnlocked: UnlockedFeature[] = [];

    for (const feature of gamificationFeatures) {
      if (newLevel >= feature.unlockLevel && oldLevel < feature.unlockLevel) {
        const alreadyUnlocked = unlockedFeatures.some(f => f.featureId === feature.id);
        if (!alreadyUnlocked) {
          const unlockedFeature: UnlockedFeature = {
            featureId: feature.id,
            unlockedAt: new Date().toISOString(),
            level: newLevel,
            viewed: false,
          };
          newlyUnlocked.push(unlockedFeature);

          if (addNotification) {
            addNotification(currentUser.id, 'feature_unlocked', {
              featureName: feature.name,
              featureId: feature.id,
              level: newLevel,
            });
          }
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      const updatedUser: User = {
        ...currentUser,
        unlockedFeatures: [...unlockedFeatures, ...newlyUnlocked],
      };
      await updateUser(updatedUser);
    }
  }, [currentUser, addNotification, updateUser]);

  const completeTask = useCallback(async (taskId: string) => {
    if (!currentUser) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const startTime = Date.now();
    
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);

    const userPowerUps = activePowerUps[currentUser.id] || [];
    const xpBoost = userPowerUps.find(p => p.powerUpId.includes('xp'));
    const earningsBoost = userPowerUps.find(p => p.powerUpId.includes('earnings'));

    const xpMultiplier = xpBoost ? 2 : 1;
    const earningsMultiplier = earningsBoost ? 1.5 : 1;

    const commission = task.payAmount * COMMISSION_RATE;
    const netEarnings = task.payAmount - commission;

    const oldLevel = currentUser.level;
    const newXP = currentUser.xp + (task.xpReward * xpMultiplier);
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;

    const gritReward = GRIT_REWARDS.TASK_COMPLETION_BASE + (task.xpReward / 2);
    const currentGrit = currentUser.wallet?.grit || 0;

    const updatedUser: User = {
      ...currentUser,
      xp: newXP,
      level: newLevel,
      tasksCompleted: currentUser.tasksCompleted + 1,
      earnings: currentUser.earnings + (netEarnings * earningsMultiplier),
      wallet: {
        grit: currentGrit + gritReward,
        taskCredits: currentUser.wallet?.taskCredits || 0,
        crowns: currentUser.wallet?.crowns || 0,
      },
    };

    await updateUser(updatedUser);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));

    const completionTime = (Date.now() - startTime) / 60000;
    
    hustleAI.submitFeedback({
      userId: currentUser.id,
      taskId: task.id,
      predictionType: 'completion',
      predictedValue: task.xpReward,
      actualValue: task.xpReward * xpMultiplier,
      context: {
        category: task.category,
        payAmount: task.payAmount,
        completionTime,
        hadPowerUps: xpBoost !== undefined || earningsBoost !== undefined,
      },
    }).catch(err => console.warn('[HUSTLEAI] Failed to submit feedback:', err));

    if (addNotification) {
      addNotification(currentUser.id, 'quest_completed', {
        taskTitle: task.title,
        xpReward: task.xpReward * xpMultiplier,
        taskId: task.id,
      });

      if (leveledUp) {
        addNotification(currentUser.id, 'level_up', {
          newLevel,
        });
        await checkAndUnlockFeatures(newLevel, oldLevel);
      }
    } else if (leveledUp) {
      await checkAndUnlockFeatures(newLevel, oldLevel);
    }

    console.log(`Task completed. Commission: ${commission.toFixed(2)}, Net earnings: ${netEarnings.toFixed(2)}`);
    console.log(`[HUSTLEAI] Feedback submitted for task completion`);

    return { leveledUp, newLevel };
  }, [currentUser, tasks, updateUser, addNotification, activePowerUps, checkAndUnlockFeatures]);

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
    if (task && addNotification) {
      const recipientId = task.posterId === currentUser.id ? task.workerId : task.posterId;
      if (recipientId) {
        addNotification(recipientId, 'message_new', {
          senderName: currentUser.name,
          taskTitle: task.title,
          taskId: task.id,
        });
      }
    }
  }, [currentUser, messages, tasks, addNotification]);

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

      const updatedUser: User = {
        ...targetUser,
        reputationScore: avgRating,
        ratings: userRatings,
      };

      const updatedUsers = users.map(u => u.id === toUserId ? updatedUser : u);
      setUsers(updatedUsers);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(updatedRatings)),
        AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers)),
      ]);

      if (currentUser.id === toUserId) {
        setCurrentUser(updatedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      }
    }
  }, [currentUser, ratings, users]);

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

  const addVerificationBadge = useCallback(async (userId: string, type: 'id' | 'email' | 'phone' | 'background') => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const newBadge = {
      id: `verification-${Date.now()}`,
      type,
      verifiedAt: new Date().toISOString(),
    };

    const existingBadges = targetUser.verificationBadges || [];
    const alreadyVerified = existingBadges.some(b => b.type === type);

    if (alreadyVerified) {
      console.log('User already has this verification badge');
      return;
    }

    const updatedUser: User = {
      ...targetUser,
      verificationBadges: [...existingBadges, newBadge],
      isVerified: true,
    };

    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
    setUsers(updatedUsers);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }

    console.log('Verification badge added:', newBadge);
  }, [users, currentUser]);

  const updateAvailabilityStatus = useCallback(async (status: 'offline' | 'online' | 'available_now' | 'busy') => {
    if (!currentUser) return;

    const updatedUser: User = {
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
      sendHustleAITaskOffers();
    }
  }, [currentUser, updateUser]);

  const sendHustleAITaskOffers = useCallback(async () => {
    if (!currentUser) return;

    // Only send task offers to workers/hustlers, NOT posters
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

    const updatedMessages = [...messages, ...newMessages];
    setMessages(updatedMessages);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));

    console.log(`📬 HustleAI sent ${newMessages.length} task offer(s) via DM`);
  }, [currentUser, tasks, messages]);

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

  const purchasePowerUp = useCallback(async (powerUp: PowerUp) => {
    if (!currentUser) return { success: false, error: 'No user logged in' };

    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`,
      userId: currentUser.id,
      powerUpId: powerUp.id,
      price: powerUp.price,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      console.log('Processing Stripe payment for:', powerUp.name);
      console.log('Amount:', powerUp.price);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const completedPurchase: Purchase = {
        ...newPurchase,
        status: 'completed',
        stripePaymentId: `pi_test_${Date.now()}`,
      };

      const updatedPurchases = [...purchases, completedPurchase];
      setPurchases(updatedPurchases);
      await AsyncStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updatedPurchases));

      const activatedAt = new Date().toISOString();
      const expiresAt = powerUp.effect.duration
        ? new Date(Date.now() + powerUp.effect.duration * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const newActivePowerUp: ActivePowerUp = {
        powerUpId: powerUp.id,
        activatedAt,
        expiresAt,
      };

      const userActivePowerUps = activePowerUps[currentUser.id] || [];
      const updatedActivePowerUps = {
        ...activePowerUps,
        [currentUser.id]: [...userActivePowerUps, newActivePowerUp],
      };

      setActivePowerUps(updatedActivePowerUps);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_POWERUPS, JSON.stringify(updatedActivePowerUps));

      console.log('Power-up activated:', powerUp.name);
      return { success: true };
    } catch (error) {
      console.error('Purchase failed:', error);
      const failedPurchase: Purchase = {
        ...newPurchase,
        status: 'failed',
      };
      const updatedPurchases = [...purchases, failedPurchase];
      setPurchases(updatedPurchases);
      await AsyncStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updatedPurchases));

      return { success: false, error: 'Payment failed' };
    }
  }, [currentUser, purchases, activePowerUps]);

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

  const leaderboard = useMemo(() => {
    return [...users]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 100)
      .map((user, index) => ({
        userId: user.id,
        name: user.name,
        profilePic: user.profilePic,
        xp: user.xp,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
        rank: index + 1,
      }));
  }, [users]);

  const signOut = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }, []);

  const markFeatureAsViewed = useCallback(async (featureId: string) => {
    if (!currentUser) return;

    const unlockedFeatures = currentUser.unlockedFeatures || [];
    const updatedFeatures = unlockedFeatures.map(f =>
      f.featureId === featureId ? { ...f, viewed: true } : f
    );

    const updatedUser: User = {
      ...currentUser,
      unlockedFeatures: updatedFeatures,
    };

    await updateUser(updatedUser);
  }, [currentUser, updateUser]);

  const switchMode = useCallback(async (mode: UserMode) => {
    if (!currentUser) return;

    const modesUnlocked = currentUser.modesUnlocked || [currentUser.activeMode || 'everyday'];
    if (!modesUnlocked.includes(mode)) {
      modesUnlocked.push(mode);
    }

    let updatedRole: UserRole = currentUser.role;
    if (mode === 'business') {
      updatedRole = 'poster';
    } else if (mode === 'everyday' || mode === 'tradesmen') {
      updatedRole = currentUser.role === 'poster' ? 'both' : 'worker';
    }

    const updatedUser: User = {
      ...currentUser,
      activeMode: mode,
      modesUnlocked,
      role: updatedRole,
    };

    await updateUser(updatedUser);
    console.log(`Switched to ${mode} mode`);
  }, [currentUser, updateUser]);

  return useMemo(() => ({
    currentUser,
    users,
    tasks,
    messages,
    hasOnboarded,
    isLoading,
    ratings,
    reports,
    purchases,
    activePowerUps,
    completeOnboarding,
    updateUser,
    createTask,
    acceptTask,
    completeTask,
    sendMessage,
    getTaskMessages,
    rateUser,
    submitReport,
    addVerificationBadge,
    purchasePowerUp,
    updateAvailabilityStatus,
    respondToTaskOffer,
    signOut,
    myTasks,
    myAcceptedTasks,
    availableTasks,
    leaderboard,
    markFeatureAsViewed,
    switchMode,
  }), [
    currentUser,
    users,
    tasks,
    messages,
    hasOnboarded,
    isLoading,
    ratings,
    reports,
    purchases,
    activePowerUps,
    completeOnboarding,
    updateUser,
    createTask,
    acceptTask,
    completeTask,
    sendMessage,
    getTaskMessages,
    rateUser,
    submitReport,
    addVerificationBadge,
    purchasePowerUp,
    updateAvailabilityStatus,
    respondToTaskOffer,
    signOut,
    myTasks,
    myAcceptedTasks,
    availableTasks,
    leaderboard,
    markFeatureAsViewed,
    switchMode,
  ]);
});
