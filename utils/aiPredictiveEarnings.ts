import { User, Task, TaskCategory } from '@/types';

export interface EarningsProjection {
  period: 'daily' | 'weekly' | 'monthly';
  projected: number;
  range: {
    min: number;
    max: number;
  };
  breakdown: {
    basePay: number;
    bonuses: number;
    tips: number;
    streakBonus: number;
  };
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface EarningsTrend {
  date: string;
  amount: number;
  tasks: number;
}

export interface CategoryEarnings {
  category: TaskCategory;
  avgPay: number;
  tasksCompleted: number;
  totalEarned: number;
  trending: 'up' | 'down' | 'stable';
}

function getWeekdayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function predictDailyEarnings(
  user: User,
  recentTasks: Task[],
  historicalData?: EarningsTrend[]
): EarningsProjection {
  const completedTasks = recentTasks.filter(t => t.status === 'completed');
  const last7Days = completedTasks.filter(t => {
    const taskDate = new Date(t.completedAt || t.createdAt);
    const daysAgo = (Date.now() - taskDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });

  const avgDailyTasks = last7Days.length / 7;
  const avgPayPerTask = last7Days.length > 0
    ? last7Days.reduce((sum, t) => sum + t.payAmount, 0) / last7Days.length
    : 30;

  const baseProjection = avgDailyTasks * avgPayPerTask;
  
  const today = new Date();
  const isWeekendDay = isWeekend(today);
  const weekendMultiplier = isWeekendDay ? 1.3 : 1.0;
  
  const levelMultiplier = 1 + (user.level / 100);
  const streakMultiplier = user.streaks.current > 7 ? 1.1 : 1.0;

  const basePay = baseProjection * weekendMultiplier * levelMultiplier;
  const bonuses = basePay * 0.08;
  const tips = basePay * 0.05;
  const streakBonus = user.streaks.current > 7 ? basePay * 0.1 : 0;

  const projected = basePay + bonuses + tips + streakBonus;

  const factors: string[] = [];
  if (isWeekendDay) factors.push('🎉 Weekend boost (+30%)');
  if (user.level > 10) factors.push(`📈 Level ${user.level} multiplier`);
  if (user.streaks.current > 7) factors.push(`🔥 ${user.streaks.current}-day streak bonus`);
  if (user.reputationScore > 90) factors.push('⭐ High reputation score');

  const recommendations: string[] = [];
  if (avgDailyTasks < 3) {
    recommendations.push('💡 Complete 3+ tasks daily to increase earnings');
  }
  if (user.streaks.current < 7) {
    recommendations.push('🔥 Build a 7-day streak for bonus earnings');
  }
  if (!isWeekendDay) {
    recommendations.push('📅 Weekend tasks typically pay 30% more');
  }

  return {
    period: 'daily',
    projected: Math.round(projected),
    range: {
      min: Math.round(projected * 0.7),
      max: Math.round(projected * 1.3),
    },
    breakdown: {
      basePay: Math.round(basePay),
      bonuses: Math.round(bonuses),
      tips: Math.round(tips),
      streakBonus: Math.round(streakBonus),
    },
    confidence: last7Days.length >= 5 ? 85 : 65,
    factors,
    recommendations,
  };
}

export function predictWeeklyEarnings(
  user: User,
  recentTasks: Task[],
  historicalData?: EarningsTrend[]
): EarningsProjection {
  const dailyProjection = predictDailyEarnings(user, recentTasks, historicalData);
  
  const weekdayEarnings = dailyProjection.projected * 5;
  const weekendEarnings = dailyProjection.projected * 1.3 * 2;
  const weeklyBase = weekdayEarnings + weekendEarnings;

  const weeklyBonus = weeklyBase * 0.12;
  const tips = weeklyBase * 0.06;
  const streakBonus = user.streaks.current >= 7 ? weeklyBase * 0.15 : 0;

  const projected = weeklyBase + weeklyBonus + tips + streakBonus;

  const factors: string[] = [];
  factors.push('📊 Based on 7-day average');
  factors.push('💰 Includes weekend premium');
  if (user.tradesmanProfile?.isPro) {
    factors.push('🏆 Pro tradesman rate');
  }
  if (user.level > 20) {
    factors.push(`⚡ Level ${user.level} earning power`);
  }

  const recommendations: string[] = [];
  if (projected < 500) {
    recommendations.push('📈 Aim for 15+ tasks this week to reach $500+');
  }
  if (user.streaks.current < 7) {
    recommendations.push('🎯 Complete daily tasks for streak bonus');
  }
  recommendations.push('🔥 Focus on high-paying categories for better returns');

  return {
    period: 'weekly',
    projected: Math.round(projected),
    range: {
      min: Math.round(projected * 0.75),
      max: Math.round(projected * 1.25),
    },
    breakdown: {
      basePay: Math.round(weeklyBase),
      bonuses: Math.round(weeklyBonus),
      tips: Math.round(tips),
      streakBonus: Math.round(streakBonus),
    },
    confidence: recentTasks.length >= 10 ? 80 : 60,
    factors,
    recommendations,
  };
}

export function predictMonthlyEarnings(
  user: User,
  recentTasks: Task[],
  historicalData?: EarningsTrend[]
): EarningsProjection {
  const weeklyProjection = predictWeeklyEarnings(user, recentTasks, historicalData);
  
  const monthlyBase = weeklyProjection.projected * 4.33;
  const monthlyBonus = monthlyBase * 0.1;
  const tips = monthlyBase * 0.07;
  const streakBonus = user.streaks.current >= 30 ? monthlyBase * 0.2 : monthlyBase * 0.1;

  const projected = monthlyBase + monthlyBonus + tips + streakBonus;

  const factors: string[] = [];
  factors.push('📆 4.33-week monthly average');
  factors.push('💎 Premium rates applied');
  if (user.tradesmanProfile?.isPro) {
    factors.push('🔧 Professional tradesman rates');
    factors.push(`💼 ${user.tradesmanProfile.completedJobs} jobs completed`);
  }

  const recommendations: string[] = [];
  if (projected < 2000) {
    recommendations.push('🎯 Target 60+ tasks this month for $2K+');
  }
  if (!user.tradesmanProfile?.isPro) {
    recommendations.push('⚡ Become a Pro Tradesman for higher rates');
  }
  recommendations.push('💰 Focus on categories with highest demand');

  return {
    period: 'monthly',
    projected: Math.round(projected),
    range: {
      min: Math.round(projected * 0.7),
      max: Math.round(projected * 1.3),
    },
    breakdown: {
      basePay: Math.round(monthlyBase),
      bonuses: Math.round(monthlyBonus),
      tips: Math.round(tips),
      streakBonus: Math.round(streakBonus),
    },
    confidence: recentTasks.length >= 20 ? 75 : 55,
    factors,
    recommendations,
  };
}

export function analyzeCategoryEarnings(
  user: User,
  recentTasks: Task[]
): CategoryEarnings[] {
  const categories = new Map<TaskCategory, { total: number; count: number; recent: number[] }>();

  recentTasks.forEach(task => {
    if (task.status !== 'completed') return;
    
    const current = categories.get(task.category) || { total: 0, count: 0, recent: [] };
    current.total += task.payAmount;
    current.count += 1;
    current.recent.push(task.payAmount);
    categories.set(task.category, current);
  });

  const results: CategoryEarnings[] = [];

  categories.forEach((data, category) => {
    const avgPay = data.total / data.count;
    
    let trending: 'up' | 'down' | 'stable' = 'stable';
    if (data.recent.length >= 3) {
      const recentAvg = data.recent.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const olderAvg = data.recent.slice(0, -3).reduce((a, b) => a + b, 0) / (data.recent.length - 3);
      
      if (recentAvg > olderAvg * 1.1) trending = 'up';
      else if (recentAvg < olderAvg * 0.9) trending = 'down';
    }

    results.push({
      category,
      avgPay,
      tasksCompleted: data.count,
      totalEarned: data.total,
      trending,
    });
  });

  return results.sort((a, b) => b.totalEarned - a.totalEarned);
}

export function getEarningsInsights(
  user: User,
  recentTasks: Task[]
): string[] {
  const insights: string[] = [];

  const categoryEarnings = analyzeCategoryEarnings(user, recentTasks);
  if (categoryEarnings.length > 0) {
    const topCategory = categoryEarnings[0];
    insights.push(`💰 Your best category is ${topCategory.category} at $${topCategory.avgPay.toFixed(0)}/task`);
  }

  const completedLast7Days = recentTasks.filter(t => {
    const taskDate = new Date(t.completedAt || t.createdAt);
    const daysAgo = (Date.now() - taskDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7 && t.status === 'completed';
  }).length;

  if (completedLast7Days >= 10) {
    insights.push('🔥 You\'re on fire! Keep this momentum going');
  } else if (completedLast7Days < 3) {
    insights.push('📈 Complete more tasks to increase earnings potential');
  }

  if (user.streaks.current >= 7) {
    insights.push(`⚡ ${user.streaks.current}-day streak is boosting your earnings!`);
  }

  if (user.level >= 20) {
    insights.push('🏆 High-level hustlers earn 20-30% more per task');
  }

  return insights;
}
