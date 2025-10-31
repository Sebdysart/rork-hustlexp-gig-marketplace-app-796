import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, UserMode, RoleStats, ModeStats } from '@/types';
import { SEED_USERS } from '@/mocks/seedData';
import { generateGamertag } from '@/utils/gamertagGenerator';
import { checkDailyStreak, updateUserStreak } from '@/utils/dailyStreak';

const STORAGE_KEYS = {
  CURRENT_USER: 'hustlexp_current_user',
  USERS: 'hustlexp_users',
  HAS_ONBOARDED: 'hustlexp_has_onboarded',
  MODE_STATS: 'hustlexp_mode_stats',
  LAST_MODE_SWITCH: 'hustlexp_last_mode_switch',
};

export const [UserProvider, useUser] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const hasCheckedStreakRef = useRef(false);
  const lastCheckedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedUser, storedUsers, storedOnboarded] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
        AsyncStorage.getItem(STORAGE_KEYS.USERS),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
      ]);

      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(SEED_USERS);
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      }
      if (storedOnboarded) setHasOnboarded(JSON.parse(storedOnboarded));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (!currentUser) return;
    
    if (currentUser.id !== lastCheckedUserIdRef.current) {
      lastCheckedUserIdRef.current = currentUser.id;
      hasCheckedStreakRef.current = false;
    }

    if (!hasCheckedStreakRef.current) {
      hasCheckedStreakRef.current = true;
      
      const checkStreak = async () => {
        const user = currentUser;
        const streakResult = checkDailyStreak(user);
        
        if (streakResult.isNewDay) {
          const updatedUser = updateUserStreak(user, streakResult);
          
          setUsers(prevUsers => {
            const updated = prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
            AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
            return updated;
          });
          
          setCurrentUser(updatedUser);
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
      };
      
      checkStreak();
    }
  }, [currentUser?.id]);

  const completeOnboarding = useCallback(async (
    name: string, 
    role: UserRole, 
    location: { lat: number; lng: number; address: string }, 
    email?: string, 
    password?: string, 
    mode?: UserMode, 
    trades?: string[]
  ) => {
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
      gamertag: generateGamertag(),
      gamertagGeneratedAt: new Date().toISOString(),
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

  const signOut = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }, []);

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

    const currentMode = currentUser.activeMode || 'everyday';
    const now = Date.now();
    
    try {
      const storedLastSwitch = await AsyncStorage.getItem(STORAGE_KEYS.LAST_MODE_SWITCH);
      const storedModeStats = await AsyncStorage.getItem(STORAGE_KEYS.MODE_STATS);
      
      const lastSwitchTime = storedLastSwitch ? parseInt(storedLastSwitch, 10) : now;
      const modeStats: ModeStats = storedModeStats ? JSON.parse(storedModeStats) : {
        everyday: 0,
        tradesmen: 0,
        business: 0,
        totalSwitches: 0,
        preferredMode: currentMode,
      };

      if (currentMode !== mode) {
        const timeElapsed = (now - lastSwitchTime) / (1000 * 60 * 60);
        modeStats[currentMode] += timeElapsed;
        modeStats.totalSwitches += 1;

        const modeEntries = Object.entries(modeStats)
          .filter(([key]) => key !== 'totalSwitches' && key !== 'preferredMode');
        
        const maxMode = modeEntries.reduce((max, [key, value]) => {
          const maxKey = max as UserMode;
          return (value as number) > modeStats[maxKey] ? (key as UserMode) : maxKey;
        }, currentMode as UserMode);
        modeStats.preferredMode = maxMode;

        await AsyncStorage.setItem(STORAGE_KEYS.MODE_STATS, JSON.stringify(modeStats));
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_MODE_SWITCH, now.toString());
        
        console.log(`Mode switch tracked: ${currentMode} -> ${mode}, time: ${timeElapsed.toFixed(2)}h`);
      }
    } catch (error) {
      console.error('Error tracking mode switch:', error);
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

  const fetchRoleStats = useCallback(async (userId?: string): Promise<RoleStats | null> => {
    try {
      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return null;

      const targetUser = users.find(u => u.id === targetUserId) || currentUser;
      if (!targetUser) return null;

      const isDualRole = targetUser.role === 'both' || 
        (!!targetUser.tradesmanProfile && !!targetUser.posterProfile);

      const totalEarnings = targetUser.tradesmanProfile?.businessMetrics.totalEarnings || targetUser.earnings || 0;
      const totalSpent = targetUser.posterProfile?.totalSpent || 0;

      const storedModeStats = await AsyncStorage.getItem(STORAGE_KEYS.MODE_STATS);
      const storedLastSwitch = await AsyncStorage.getItem(STORAGE_KEYS.LAST_MODE_SWITCH);

      let modeStats: ModeStats | undefined;
      if (storedModeStats) {
        modeStats = JSON.parse(storedModeStats);
      }

      const roleStats: RoleStats = {
        isDualRole,
        totalEarnings,
        totalSpent,
        tasksCompleted: targetUser.tasksCompleted,
        tasksPosted: targetUser.posterProfile?.tasksPosted || 0,
        modeStats,
        lastModeSwitch: storedLastSwitch || undefined,
      };

      return roleStats;
    } catch (error) {
      console.error('Error fetching role stats:', error);
      return null;
    }
  }, [currentUser, users]);

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

    await updateUser(updatedUser);
    console.log('Verification badge added:', newBadge);
  }, [users, updateUser]);

  return useMemo(() => ({
    currentUser,
    users,
    hasOnboarded,
    isLoading,
    completeOnboarding,
    updateUser,
    signOut,
    switchMode,
    fetchRoleStats,
    leaderboard,
    addVerificationBadge,
  }), [
    currentUser,
    users,
    hasOnboarded,
    isLoading,
    completeOnboarding,
    updateUser,
    signOut,
    switchMode,
    fetchRoleStats,
    leaderboard,
    addVerificationBadge,
  ]);
});
