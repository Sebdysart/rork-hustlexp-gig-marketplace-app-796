import { User, Task } from '@/types';

export interface EarningsForecast {
  period: 'week' | 'month' | 'quarter';
  projected: {
    min: number;
    avg: number;
    max: number;
    confidence: number;
  };
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  insights: string[];
  recommendations: string[];
  comparisonToLastPeriod: {
    change: number;
    changePercent: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  milestones: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    daysLeft: number;
  }[];
}

export interface EarningsPattern {
  dailyAverage: number;
  weekdayPattern: Record<number, number>;
  peakDays: number[];
  slowDays: number[];
  monthlyTrend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
  categoryMix: Record<string, number>;
  tasksPerWeek: number;
  avgPayPerTask: number;
}

function analyzeEarningsPatterns(
  user: User,
  completedTasks: Task[],
  timeframedays: number = 90
): EarningsPattern {
  console.log('[Earnings Forecasting] Analyzing earnings patterns');

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - timeframedays * 24 * 60 * 60 * 1000);

  const recentTasks = completedTasks.filter((t) => {
    const completedDate = new Date(t.completedAt || t.createdAt);
    return completedDate >= cutoffDate;
  });

  if (recentTasks.length === 0) {
    return {
      dailyAverage: 0,
      weekdayPattern: {},
      peakDays: [],
      slowDays: [],
      monthlyTrend: 'stable',
      seasonalFactor: 1.0,
      categoryMix: {},
      tasksPerWeek: 0,
      avgPayPerTask: 0,
    };
  }

  const totalEarnings = recentTasks.reduce((sum, t) => sum + t.payAmount, 0);
  const dailyAverage = totalEarnings / timeframedays;

  const weekdayEarnings: Record<number, number[]> = {};
  const categoryEarnings: Record<string, number> = {};

  recentTasks.forEach((task) => {
    const date = new Date(task.completedAt || task.createdAt);
    const dayOfWeek = date.getDay();

    if (!weekdayEarnings[dayOfWeek]) {
      weekdayEarnings[dayOfWeek] = [];
    }
    weekdayEarnings[dayOfWeek].push(task.payAmount);

    if (!categoryEarnings[task.category]) {
      categoryEarnings[task.category] = 0;
    }
    categoryEarnings[task.category] += task.payAmount;
  });

  const weekdayPattern: Record<number, number> = {};
  Object.keys(weekdayEarnings).forEach((day) => {
    const dayNum = parseInt(day);
    const earnings = weekdayEarnings[dayNum];
    weekdayPattern[dayNum] = earnings.reduce((a, b) => a + b, 0) / earnings.length;
  });

  const sortedDays = Object.entries(weekdayPattern)
    .sort(([, a], [, b]) => b - a)
    .map(([day]) => parseInt(day));

  const peakDays = sortedDays.slice(0, 2);
  const slowDays = sortedDays.slice(-2);

  const firstHalf = recentTasks.slice(0, Math.floor(recentTasks.length / 2));
  const secondHalf = recentTasks.slice(Math.floor(recentTasks.length / 2));

  const firstHalfAvg = firstHalf.length > 0
    ? firstHalf.reduce((sum, t) => sum + t.payAmount, 0) / firstHalf.length
    : 0;
  const secondHalfAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, t) => sum + t.payAmount, 0) / secondHalf.length
    : 0;

  let monthlyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (secondHalfAvg > firstHalfAvg * 1.1) monthlyTrend = 'increasing';
  else if (secondHalfAvg < firstHalfAvg * 0.9) monthlyTrend = 'decreasing';

  const tasksPerWeek = (recentTasks.length / timeframedays) * 7;
  const avgPayPerTask = totalEarnings / recentTasks.length;

  return {
    dailyAverage,
    weekdayPattern,
    peakDays,
    slowDays,
    monthlyTrend,
    seasonalFactor: 1.0,
    categoryMix: categoryEarnings,
    tasksPerWeek,
    avgPayPerTask,
  };
}

export async function forecastEarnings(
  user: User,
  completedTasks: Task[],
  availableTasks: Task[],
  period: 'week' | 'month' | 'quarter' = 'month',
  useAI: boolean = true
): Promise<EarningsForecast> {
  console.log('[Earnings Forecasting] Forecasting earnings for', period);

  const patterns = analyzeEarningsPatterns(user, completedTasks);

  let daysInPeriod = 7;
  if (period === 'month') daysInPeriod = 30;
  else if (period === 'quarter') daysInPeriod = 90;

  const baseProjection = patterns.dailyAverage * daysInPeriod;

  let trendMultiplier = 1.0;
  if (patterns.monthlyTrend === 'increasing') trendMultiplier = 1.15;
  else if (patterns.monthlyTrend === 'decreasing') trendMultiplier = 0.85;

  const avgProjected = Math.round(baseProjection * trendMultiplier * patterns.seasonalFactor);
  const minProjected = Math.round(avgProjected * 0.75);
  const maxProjected = Math.round(avgProjected * 1.35);

  const confidence = completedTasks.length >= 10 ? 85 : 60;

  const breakdown = Object.entries(patterns.categoryMix)
    .map(([category, amount]) => {
      const percentage = (amount / Object.values(patterns.categoryMix).reduce((a, b) => a + b, 0)) * 100;
      const projectedAmount = (avgProjected * percentage) / 100;
      
      return {
        category,
        amount: Math.round(projectedAmount),
        percentage: Math.round(percentage),
        trend: patterns.monthlyTrend === 'increasing' ? 'up' as const :
               patterns.monthlyTrend === 'decreasing' ? 'down' as const : 'stable' as const,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const insights: string[] = [];

  if (patterns.monthlyTrend === 'increasing') {
    insights.push(`📈 Your earnings are trending up! ${((trendMultiplier - 1) * 100).toFixed(0)}% growth detected`);
  } else if (patterns.monthlyTrend === 'decreasing') {
    insights.push(`📉 Earnings trending down. Consider diversifying task categories`);
  }

  insights.push(`💼 You complete ~${patterns.tasksPerWeek.toFixed(1)} tasks per week`);
  insights.push(`💵 Average pay per task: $${patterns.avgPayPerTask.toFixed(0)}`);

  if (patterns.peakDays.length > 0) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const peakDayNames = patterns.peakDays.map((d) => dayNames[d]).join(' & ');
    insights.push(`⭐ Peak earning days: ${peakDayNames}`);
  }

  const topCategory = breakdown[0];
  if (topCategory) {
    insights.push(`🏆 Top category: ${topCategory.category} (${topCategory.percentage}% of income)`);
  }

  const recommendations: string[] = [];

  if (patterns.tasksPerWeek < 5) {
    recommendations.push('Increase task frequency to boost earnings');
  }

  if (Object.keys(patterns.categoryMix).length < 3) {
    recommendations.push('Diversify into new task categories for stability');
  }

  if (patterns.slowDays.length > 0) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slowDayNames = patterns.slowDays.map((d) => dayNames[d]).join(' and ');
    recommendations.push(`Target ${slowDayNames} to fill gaps in your schedule`);
  }

  if (patterns.avgPayPerTask < 40) {
    recommendations.push('Focus on higher-paying tasks ($50+) to maximize earnings');
  }

  if (availableTasks.length > 10) {
    const highPayTasks = availableTasks.filter((t) => t.payAmount >= patterns.avgPayPerTask * 1.2);
    if (highPayTasks.length > 0) {
      recommendations.push(`${highPayTasks.length} above-average paying tasks available now`);
    }
  }

  const lastPeriodEarnings = completedTasks
    .filter((t) => {
      const completedDate = new Date(t.completedAt || t.createdAt);
      const cutoff = new Date(Date.now() - daysInPeriod * 24 * 60 * 60 * 1000);
      return completedDate >= cutoff;
    })
    .reduce((sum, t) => sum + t.payAmount, 0);

  const change = avgProjected - lastPeriodEarnings;
  const changePercent = lastPeriodEarnings > 0 ? (change / lastPeriodEarnings) * 100 : 0;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (changePercent > 5) trend = 'improving';
  else if (changePercent < -5) trend = 'declining';

  const milestones: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    daysLeft: number;
  }[] = [
    {
      title: `${period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Quarterly'} Goal`,
      targetAmount: avgProjected,
      currentAmount: user.earnings || 0,
      progress: Math.min(100, ((user.earnings || 0) / avgProjected) * 100),
      daysLeft: daysInPeriod,
    },
  ];

  if (avgProjected >= 1000) {
    milestones.push({
      title: 'Reach $1,000',
      targetAmount: 1000,
      currentAmount: Math.min(1000, avgProjected),
      progress: Math.min(100, (avgProjected / 1000) * 100),
      daysLeft: Math.ceil(((1000 - (user.earnings || 0)) / patterns.dailyAverage)),
    });
  }

  if (avgProjected >= 5000) {
    milestones.push({
      title: 'Reach $5,000',
      targetAmount: 5000,
      currentAmount: Math.min(5000, avgProjected),
      progress: Math.min(100, (avgProjected / 5000) * 100),
      daysLeft: Math.ceil(((5000 - (user.earnings || 0)) / patterns.dailyAverage)),
    });
  }

  return {
    period,
    projected: {
      min: minProjected,
      avg: avgProjected,
      max: maxProjected,
      confidence,
    },
    breakdown,
    insights,
    recommendations,
    comparisonToLastPeriod: {
      change: Math.round(change),
      changePercent: Math.round(changePercent * 10) / 10,
      trend,
    },
    milestones,
  };
}

export async function analyzeEarningsPotential(
  user: User,
  completedTasks: Task[],
  availableTasks: Task[],
  useAI: boolean = true
): Promise<{
  currentRate: number;
  potentialRate: number;
  gapAnalysis: {
    metric: string;
    current: string;
    potential: string;
    improvement: string;
  }[];
  quickWins: string[];
}> {
  console.log('[Earnings Forecasting] Analyzing earning potential');

  const patterns = analyzeEarningsPatterns(user, completedTasks);

  const currentHourlyRate = patterns.avgPayPerTask > 0 ? patterns.avgPayPerTask : 25;

  const topTierTasks = availableTasks
    .filter((t) => t.payAmount >= patterns.avgPayPerTask * 1.3)
    .slice(0, 10);

  const potentialAvgPay = topTierTasks.length > 0
    ? topTierTasks.reduce((sum, t) => sum + t.payAmount, 0) / topTierTasks.length
    : patterns.avgPayPerTask * 1.4;

  const potentialHourlyRate = potentialAvgPay;

  const gapAnalysis = [
    {
      metric: 'Avg Pay Per Task',
      current: `$${patterns.avgPayPerTask.toFixed(0)}`,
      potential: `$${potentialAvgPay.toFixed(0)}`,
      improvement: `+$${(potentialAvgPay - patterns.avgPayPerTask).toFixed(0)}`,
    },
    {
      metric: 'Tasks Per Week',
      current: `${patterns.tasksPerWeek.toFixed(1)}`,
      potential: `${(patterns.tasksPerWeek * 1.3).toFixed(1)}`,
      improvement: `+${((patterns.tasksPerWeek * 0.3).toFixed(1))} tasks`,
    },
    {
      metric: 'Weekly Earnings',
      current: `$${(patterns.dailyAverage * 7).toFixed(0)}`,
      potential: `$${(potentialAvgPay * patterns.tasksPerWeek * 1.3).toFixed(0)}`,
      improvement: `+${((potentialAvgPay * patterns.tasksPerWeek * 1.3) - (patterns.dailyAverage * 7)).toFixed(0)}%`,
    },
  ];

  const quickWins: string[] = [];

  if (topTierTasks.length > 0) {
    quickWins.push(`Accept one of ${topTierTasks.length} premium tasks available now`);
  }

  if (patterns.slowDays.length > 0) {
    quickWins.push('Work on your slow days to fill schedule gaps');
  }

  const underservedCategories = Object.keys(patterns.categoryMix).length;
  if (underservedCategories < 3) {
    quickWins.push('Add 2-3 new task categories to your skills');
  }

  if (patterns.tasksPerWeek < 7) {
    quickWins.push('Aim for 1 task per day to boost weekly earnings');
  }

  return {
    currentRate: Math.round(currentHourlyRate),
    potentialRate: Math.round(potentialHourlyRate),
    gapAnalysis,
    quickWins,
  };
}

export function getTrendColor(trend: 'improving' | 'declining' | 'stable' | 'up' | 'down'): string {
  switch (trend) {
    case 'improving':
    case 'up':
      return '#00FF88';
    case 'declining':
    case 'down':
      return '#FF00A8';
    case 'stable':
      return '#FFB800';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
