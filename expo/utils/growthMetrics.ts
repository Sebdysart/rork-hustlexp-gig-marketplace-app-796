import AsyncStorage from '@react-native-async-storage/async-storage';
import { Analytics } from './analytics';

const COHORTS_KEY = 'hustlexp_cohorts';
const FUNNELS_KEY = 'hustlexp_funnels';

export interface CohortData {
  cohortId: string;
  week: number;
  signupDate: string;
  userIds: string[];
  metrics: {
    signups: number;
    firstTaskCompletions: number;
    day1Retention: number;
    day7Retention: number;
    day30Retention: number;
    avgTasksCompleted: number;
    avgEarnings: number;
    totalRevenue: number;
  };
}

export interface FunnelStage {
  name: string;
  eventType: string;
  users: number;
  dropoff: number;
  conversionRate: number;
}

export interface FunnelAnalysis {
  name: string;
  stages: FunnelStage[];
  totalUsers: number;
  overallConversion: number;
  avgTimeToConvert: number;
  createdAt: string;
}

export interface GrowthMetrics {
  dau: number;
  wau: number;
  mau: number;
  dauWauRatio: number;
  newUsers7d: number;
  newUsers30d: number;
  activeUsers7d: number;
  activeUsers30d: number;
  retentionRate7d: number;
  retentionRate30d: number;
  avgSessionDuration: number;
  avgSessionsPerUser: number;
  churnRate: number;
  growthRate: number;
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: {
    minTasksCompleted?: number;
    maxTasksCompleted?: number;
    minLevel?: number;
    maxLevel?: number;
    role?: string;
    hasCompletedOnboarding?: boolean;
    daysActive?: number;
  };
  userCount: number;
  metrics: {
    avgTasksPerUser: number;
    avgEarnings: number;
    retentionRate: number;
    churnRate: number;
  };
}

export class GrowthMetricsAnalyzer {
  static async calculateGrowthMetrics(): Promise<GrowthMetrics> {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const dauUsers = await Analytics.getUniqueUsers(oneDayAgo, now);
    const wauUsers = await Analytics.getUniqueUsers(sevenDaysAgo, now);
    const mauUsers = await Analytics.getUniqueUsers(thirtyDaysAgo, now);

    const signups7d = await Analytics.getEvents('user_signup', sevenDaysAgo, now);
    const signups30d = await Analytics.getEvents('user_signup', thirtyDaysAgo, now);

    const dau = dauUsers.length;
    const wau = wauUsers.length;
    const mau = mauUsers.length;

    return {
      dau,
      wau,
      mau,
      dauWauRatio: wau > 0 ? dau / wau : 0,
      newUsers7d: signups7d.length,
      newUsers30d: signups30d.length,
      activeUsers7d: wau,
      activeUsers30d: mau,
      retentionRate7d: await this.calculateRetentionRate(7),
      retentionRate30d: await this.calculateRetentionRate(30),
      avgSessionDuration: await this.calculateAvgSessionDuration(),
      avgSessionsPerUser: await this.calculateAvgSessionsPerUser(),
      churnRate: await this.calculateChurnRate(),
      growthRate: await this.calculateGrowthRate(),
    };
  }

  static async calculateRetentionRate(days: number): Promise<number> {
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;
    const signupEvents = await Analytics.getEvents('user_signup', startDate, now);
    
    if (signupEvents.length === 0) return 0;

    const signedUpUsers = new Set(signupEvents.map(e => e.userId).filter(Boolean) as string[]);
    const activeUsers = await Analytics.getUniqueUsers(now - 24 * 60 * 60 * 1000, now);
    
    const retainedCount = activeUsers.filter(userId => signedUpUsers.has(userId)).length;
    return signupEvents.length > 0 ? (retainedCount / signupEvents.length) * 100 : 0;
  }

  static async calculateChurnRate(): Promise<number> {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

    const activeLastMonth = await Analytics.getUniqueUsers(sixtyDaysAgo, thirtyDaysAgo);
    const activeThisMonth = await Analytics.getUniqueUsers(thirtyDaysAgo, now);

    const churned = activeLastMonth.filter(userId => !activeThisMonth.includes(userId)).length;
    return activeLastMonth.length > 0 ? (churned / activeLastMonth.length) * 100 : 0;
  }

  static async calculateGrowthRate(): Promise<number> {
    const now = Date.now();
    const thisWeekStart = now - 7 * 24 * 60 * 60 * 1000;
    const lastWeekStart = now - 14 * 24 * 60 * 60 * 1000;

    const thisWeekSignups = await Analytics.getEvents('user_signup', thisWeekStart, now);
    const lastWeekSignups = await Analytics.getEvents('user_signup', lastWeekStart, thisWeekStart);

    if (lastWeekSignups.length === 0) return 0;
    
    return ((thisWeekSignups.length - lastWeekSignups.length) / lastWeekSignups.length) * 100;
  }

  static async calculateAvgSessionDuration(): Promise<number> {
    const sessions = await Analytics.getEvents('session_start');
    const sessionEnds = await Analytics.getEvents('session_end');

    if (sessions.length === 0) return 0;

    const sessionMap = new Map<string, number>();
    sessions.forEach(s => {
      if (s.sessionId) sessionMap.set(s.sessionId, s.timestamp);
    });

    let totalDuration = 0;
    let completedSessions = 0;

    sessionEnds.forEach(e => {
      if (e.sessionId && sessionMap.has(e.sessionId)) {
        const startTime = sessionMap.get(e.sessionId)!;
        totalDuration += e.timestamp - startTime;
        completedSessions++;
      }
    });

    return completedSessions > 0 ? totalDuration / completedSessions / 1000 / 60 : 0;
  }

  static async calculateAvgSessionsPerUser(): Promise<number> {
    const sessions = await Analytics.getEvents('session_start');
    if (sessions.length === 0) return 0;

    const userSessions = new Map<string, number>();
    sessions.forEach(s => {
      if (s.userId) {
        userSessions.set(s.userId, (userSessions.get(s.userId) || 0) + 1);
      }
    });

    const totalSessions = Array.from(userSessions.values()).reduce((a, b) => a + b, 0);
    return userSessions.size > 0 ? totalSessions / userSessions.size : 0;
  }

  static async createCohort(weekOffset: number = 0): Promise<CohortData> {
    const now = Date.now();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    const cohortStart = now - (weekOffset + 1) * weekInMs;
    const cohortEnd = now - weekOffset * weekInMs;

    const signupEvents = await Analytics.getEvents('user_signup', cohortStart, cohortEnd);
    const userIds = signupEvents.map(e => e.userId).filter(Boolean) as string[];

    const cohortId = `cohort_w${weekOffset}_${new Date(cohortStart).toISOString().split('T')[0]}`;

    const day1Users = await this.getUsersActiveOnDay(userIds, cohortEnd, cohortEnd + 24 * 60 * 60 * 1000);
    const day7Users = await this.getUsersActiveOnDay(userIds, cohortEnd + 6 * 24 * 60 * 60 * 1000, cohortEnd + 7 * 24 * 60 * 60 * 1000);
    const day30Users = await this.getUsersActiveOnDay(userIds, cohortEnd + 29 * 24 * 60 * 60 * 1000, cohortEnd + 30 * 24 * 60 * 60 * 1000);

    const firstTaskCompletions = await this.getFirstTaskCompletions(userIds, cohortEnd);

    return {
      cohortId,
      week: weekOffset,
      signupDate: new Date(cohortStart).toISOString(),
      userIds,
      metrics: {
        signups: userIds.length,
        firstTaskCompletions,
        day1Retention: userIds.length > 0 ? (day1Users.length / userIds.length) * 100 : 0,
        day7Retention: userIds.length > 0 ? (day7Users.length / userIds.length) * 100 : 0,
        day30Retention: userIds.length > 0 ? (day30Users.length / userIds.length) * 100 : 0,
        avgTasksCompleted: 0,
        avgEarnings: 0,
        totalRevenue: 0,
      },
    };
  }

  static async getUsersActiveOnDay(userIds: string[], startTime: number, endTime: number): Promise<string[]> {
    const events = await Analytics.getEvents(undefined, startTime, endTime);
    const activeUsers = new Set<string>();
    
    events.forEach(event => {
      if (event.userId && userIds.includes(event.userId)) {
        activeUsers.add(event.userId);
      }
    });

    return Array.from(activeUsers);
  }

  static async getFirstTaskCompletions(userIds: string[], afterTime: number): Promise<number> {
    const taskEvents = await Analytics.getEvents('first_task_completed', afterTime);
    return taskEvents.filter(e => e.userId && userIds.includes(e.userId)).length;
  }

  static async analyzeFunnel(funnelName: string, stageEvents: string[]): Promise<FunnelAnalysis> {
    const stages: FunnelStage[] = [];
    let previousUsers = new Set<string>();
    let firstStageUsers = 0;

    for (let i = 0; i < stageEvents.length; i++) {
      const events = await Analytics.getEvents(stageEvents[i] as any);
      const stageUsers = new Set(events.map(e => e.userId).filter(Boolean) as string[]);
      
      if (i === 0) {
        firstStageUsers = stageUsers.size;
        previousUsers = stageUsers;
      }

      const usersInStage = i === 0 ? stageUsers.size : Array.from(stageUsers).filter(u => previousUsers.has(u)).length;
      const dropoff = i > 0 ? previousUsers.size - usersInStage : 0;
      const conversionRate = firstStageUsers > 0 ? (usersInStage / firstStageUsers) * 100 : 0;

      stages.push({
        name: stageEvents[i],
        eventType: stageEvents[i],
        users: usersInStage,
        dropoff,
        conversionRate,
      });

      if (i > 0) {
        previousUsers = new Set(Array.from(stageUsers).filter(u => previousUsers.has(u)));
      } else {
        previousUsers = stageUsers;
      }
    }

    const finalUsers = stages[stages.length - 1]?.users || 0;
    const overallConversion = firstStageUsers > 0 ? (finalUsers / firstStageUsers) * 100 : 0;

    return {
      name: funnelName,
      stages,
      totalUsers: firstStageUsers,
      overallConversion,
      avgTimeToConvert: await this.calculateAvgTimeToConvert(stageEvents),
      createdAt: new Date().toISOString(),
    };
  }

  static async calculateAvgTimeToConvert(stageEvents: string[]): Promise<number> {
    if (stageEvents.length < 2) return 0;

    const firstEvents = await Analytics.getEvents(stageEvents[0] as any);
    const lastEvents = await Analytics.getEvents(stageEvents[stageEvents.length - 1] as any);

    const firstEventMap = new Map<string, number>();
    firstEvents.forEach(e => {
      if (e.userId) firstEventMap.set(e.userId, e.timestamp);
    });

    let totalTime = 0;
    let conversions = 0;

    lastEvents.forEach(e => {
      if (e.userId && firstEventMap.has(e.userId)) {
        totalTime += e.timestamp - firstEventMap.get(e.userId)!;
        conversions++;
      }
    });

    return conversions > 0 ? totalTime / conversions / 1000 / 60 : 0;
  }

  static async getOnboardingFunnel(): Promise<FunnelAnalysis> {
    return this.analyzeFunnel('Onboarding', [
      'user_signup',
      'onboarding_start',
      'onboarding_complete',
    ]);
  }

  static async getFirstTaskFunnel(): Promise<FunnelAnalysis> {
    return this.analyzeFunnel('First Task', [
      'onboarding_complete',
      'task_viewed',
      'task_accepted',
      'first_task_completed',
    ]);
  }

  static async getEngagementFunnel(): Promise<FunnelAnalysis> {
    return this.analyzeFunnel('User Engagement', [
      'app_open',
      'task_search',
      'task_viewed',
      'task_accepted',
      'task_completed',
    ]);
  }

  static async saveCohort(cohort: CohortData): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(COHORTS_KEY);
      const cohorts: CohortData[] = stored ? JSON.parse(stored) : [];
      
      const existingIndex = cohorts.findIndex(c => c.cohortId === cohort.cohortId);
      if (existingIndex >= 0) {
        cohorts[existingIndex] = cohort;
      } else {
        cohorts.push(cohort);
      }

      await AsyncStorage.setItem(COHORTS_KEY, JSON.stringify(cohorts));
      console.log('[GrowthMetrics] Cohort saved:', cohort.cohortId);
    } catch (error) {
      console.error('[GrowthMetrics] Save cohort error:', error);
    }
  }

  static async getCohorts(): Promise<CohortData[]> {
    try {
      const stored = await AsyncStorage.getItem(COHORTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[GrowthMetrics] Get cohorts error:', error);
      return [];
    }
  }

  static async saveFunnel(funnel: FunnelAnalysis): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(FUNNELS_KEY);
      const funnels: FunnelAnalysis[] = stored ? JSON.parse(stored) : [];
      
      funnels.push(funnel);

      if (funnels.length > 50) {
        funnels.splice(0, funnels.length - 50);
      }

      await AsyncStorage.setItem(FUNNELS_KEY, JSON.stringify(funnels));
      console.log('[GrowthMetrics] Funnel saved:', funnel.name);
    } catch (error) {
      console.error('[GrowthMetrics] Save funnel error:', error);
    }
  }

  static async getFunnels(): Promise<FunnelAnalysis[]> {
    try {
      const stored = await AsyncStorage.getItem(FUNNELS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[GrowthMetrics] Get funnels error:', error);
      return [];
    }
  }
}
