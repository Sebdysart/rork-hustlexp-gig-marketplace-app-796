import { User, Task, TaskCategory } from '@/types';
import { hustleAI } from './hustleAI';

export interface PredictiveMatch {
  taskId: string;
  score: number;
  confidence: number;
  reasoning: string;
  predictions: {
    willAccept: number;
    willComplete: number;
    willEnjoy: number;
    estimatedEarnings: number;
  };
  aiInsights: string[];
  bestTimeToOffer: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserPattern {
  preferredCategories: Map<TaskCategory, number>;
  preferredTimeOfDay: string[];
  preferredPayRange: { min: number; max: number };
  averageTaskDistance: number;
  acceptanceRate: number;
  completionRate: number;
  averageResponseTime: number;
  workingDays: number[];
  peakHours: number[];
  categoryPerformance: Map<TaskCategory, {
    completed: number;
    avgRating: number;
    avgPay: number;
    avgTime: number;
  }>;
}

function analyzeUserPatterns(
  user: User,
  completedTasks: Task[],
  acceptedTasks: Task[]
): UserPattern {
  console.log('[Predictive Matching] Analyzing patterns for:', user.name);

  const categoryCount = new Map<TaskCategory, number>();
  const categoryPerf = new Map<TaskCategory, any>();
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  const payAmounts: number[] = [];
  const distances: number[] = [];

  completedTasks.forEach((task) => {
    categoryCount.set(task.category, (categoryCount.get(task.category) || 0) + 1);
    
    if (!categoryPerf.has(task.category)) {
      categoryPerf.set(task.category, {
        completed: 0,
        avgRating: 0,
        avgPay: 0,
        avgTime: 0,
      });
    }
    
    const perf = categoryPerf.get(task.category);
    perf.completed++;
    perf.avgPay += task.payAmount;
    
    payAmounts.push(task.payAmount);
    
    if (task.distance) {
      distances.push(task.distance);
    }

    if (task.completedAt) {
      const date = new Date(task.completedAt);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
    }
  });

  categoryPerf.forEach((perf, category) => {
    perf.avgPay = perf.avgPay / perf.completed;
  });

  const totalTasks = user.tasksCompleted || completedTasks.length;
  const acceptanceRate = totalTasks > 0 ? completedTasks.length / acceptedTasks.length : 0.5;

  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((x) => x.hour);

  const workingDays = dayCounts
    .map((count, day) => ({ day, count }))
    .filter((x) => x.count > 0)
    .map((x) => x.day);

  const avgDistance = distances.length > 0
    ? distances.reduce((a, b) => a + b, 0) / distances.length
    : 10;

  const minPay = payAmounts.length > 0 ? Math.min(...payAmounts) : 20;
  const maxPay = payAmounts.length > 0 ? Math.max(...payAmounts) : 200;

  return {
    preferredCategories: categoryCount,
    preferredTimeOfDay: peakHours.map((h) => `${h}:00`),
    preferredPayRange: { min: minPay, max: maxPay },
    averageTaskDistance: avgDistance,
    acceptanceRate,
    completionRate: user.reputationScore / 5,
    averageResponseTime: user.responseTime || 300,
    workingDays,
    peakHours,
    categoryPerformance: categoryPerf,
  };
}

function calculateBasePredictiveScore(
  task: Task,
  user: User,
  patterns: UserPattern
): number {
  let score = 50;

  const categoryPreference = patterns.preferredCategories.get(task.category) || 0;
  const maxCategoryCount = Math.max(...Array.from(patterns.preferredCategories.values()), 1);
  score += (categoryPreference / maxCategoryCount) * 20;

  if (task.payAmount >= patterns.preferredPayRange.min && 
      task.payAmount <= patterns.preferredPayRange.max * 1.2) {
    score += 15;
  } else if (task.payAmount > patterns.preferredPayRange.max * 1.2) {
    score += 25;
  } else {
    score -= 10;
  }

  if (task.distance) {
    const distanceRatio = task.distance / patterns.averageTaskDistance;
    if (distanceRatio <= 1) {
      score += 15;
    } else if (distanceRatio <= 1.5) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  const taskDate = task.dateTime ? new Date(task.dateTime) : new Date();
  const taskHour = taskDate.getHours();
  const taskDay = taskDate.getDay();

  if (patterns.peakHours.includes(taskHour)) {
    score += 10;
  }

  if (patterns.workingDays.includes(taskDay)) {
    score += 5;
  }

  const categoryPerf = patterns.categoryPerformance.get(task.category);
  if (categoryPerf && categoryPerf.completed > 0) {
    score += Math.min(categoryPerf.completed, 10);
    score += (categoryPerf.avgRating || 0) * 2;
  }

  return Math.max(0, Math.min(100, score));
}

export async function predictTaskMatches(
  availableTasks: Task[],
  user: User,
  completedTasks: Task[],
  acceptedTasks: Task[],
  useAI: boolean = true
): Promise<PredictiveMatch[]> {
  console.log('[Predictive Matching] Analyzing', availableTasks.length, 'tasks for', user.name);

  const patterns = analyzeUserPatterns(user, completedTasks, acceptedTasks);

  const predictions: PredictiveMatch[] = [];

  for (const task of availableTasks.slice(0, 20)) {
    const baseScore = calculateBasePredictiveScore(task, user, patterns);

    const now = new Date();
    const taskTime = task.dateTime ? new Date(task.dateTime) : now;
    const hoursUntilTask = (taskTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let bestTimeToOffer = 'now';
    if (hoursUntilTask > 24) {
      bestTimeToOffer = '1 day before';
    } else if (hoursUntilTask > 12) {
      bestTimeToOffer = '12 hours before';
    } else if (hoursUntilTask > 4) {
      bestTimeToOffer = '4 hours before';
    }

    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (task.urgency === 'today') urgencyLevel = 'critical';
    else if (task.urgency === '48h') urgencyLevel = 'high';
    else urgencyLevel = 'low';

    const categoryPerf = patterns.categoryPerformance.get(task.category);
    const expectedEarnings = categoryPerf?.avgPay || task.payAmount;

    predictions.push({
      taskId: task.id,
      score: Math.round(baseScore),
      confidence: Math.round(patterns.completionRate * 100),
      reasoning: `${baseScore.toFixed(0)}% match based on your history`,
      predictions: {
        willAccept: baseScore / 100,
        willComplete: patterns.completionRate,
        willEnjoy: baseScore > 70 ? 0.8 : 0.6,
        estimatedEarnings: expectedEarnings,
      },
      aiInsights: [
        categoryPerf ? `You've completed ${categoryPerf.completed} ${task.category} tasks` : 'New category for you',
        `${task.distance ? task.distance.toFixed(1) : '?'} km away (avg: ${patterns.averageTaskDistance.toFixed(1)} km)`,
        `Pays $${task.payAmount} (your range: $${patterns.preferredPayRange.min}-${patterns.preferredPayRange.max})`,
      ],
      bestTimeToOffer,
      urgencyLevel,
    });
  }

  predictions.sort((a, b) => b.score - a.score);

  if (!useAI || predictions.length === 0) {
    return predictions.slice(0, 10);
  }

  try {
    const topPredictions = predictions.slice(0, 5);

    const prompt = `You are an AI task predictor for HustleXP. Enhance these predictions with deep insights.

User Profile:
- Name: ${user.name}
- Level: ${user.level}
- Tasks Completed: ${user.tasksCompleted}
- Rating: ${user.reputationScore.toFixed(1)}⭐
- Preferred Categories: ${Array.from(patterns.preferredCategories.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([cat, count]) => `${cat} (${count})`)
  .join(', ')}
- Preferred Pay: $${patterns.preferredPayRange.min}-${patterns.preferredPayRange.max}
- Avg Distance: ${patterns.averageTaskDistance.toFixed(1)} km

Top Predicted Tasks:
${topPredictions.map((p, i) => {
  const task = availableTasks.find((t) => t.id === p.taskId);
  return `${i + 1}. ${task?.title} - $${task?.payAmount} - ${task?.category} - Score: ${p.score}%`;
}).join('\n')}

For each task, provide:
1. Enhanced reasoning (why this is perfect for them)
2. 3-4 detailed AI insights
3. Predicted acceptance probability (0-1)
4. Predicted completion probability (0-1)
5. Predicted enjoyment (0-1)

Be encouraging and specific. Highlight unique aspects of each task.

Return JSON: {
  predictions: Array<{
    taskId: string,
    reasoning: string,
    insights: string[],
    willAccept: number,
    willComplete: number,
    willEnjoy: number
  }>
}`;

    console.log('[Predictive Matching] Requesting AI enhancement...');

    const response = await hustleAI.chat('system', prompt);
    const aiResult = JSON.parse(response.response);

    console.log('[Predictive Matching] AI enhancement complete');

    aiResult.predictions.forEach((aiPred: any) => {
      const pred = predictions.find((p) => p.taskId === aiPred.taskId);
      if (pred) {
        pred.reasoning = aiPred.reasoning;
        pred.aiInsights = aiPred.insights;
        pred.predictions.willAccept = aiPred.willAccept;
        pred.predictions.willComplete = aiPred.willComplete;
        pred.predictions.willEnjoy = aiPred.willEnjoy;
        pred.confidence = Math.round((aiPred.willAccept + aiPred.willComplete + aiPred.willEnjoy) / 3 * 100);
      }
    });

    return predictions.slice(0, 10);
  } catch (error) {
    console.error('[Predictive Matching] AI enhancement failed, using base predictions:', error);
    return predictions.slice(0, 10);
  }
}

export function getPredictionConfidenceColor(confidence: number): string {
  if (confidence >= 80) return '#00FF88';
  if (confidence >= 60) return '#00D9FF';
  if (confidence >= 40) return '#FFB800';
  return '#FF00A8';
}

export function getPredictionLabel(score: number): string {
  if (score >= 90) return 'Perfect for You';
  if (score >= 80) return 'Highly Recommended';
  if (score >= 70) return 'Great Match';
  if (score >= 60) return 'Good Match';
  if (score >= 50) return 'Worth Considering';
  return 'Not Recommended';
}

export async function explainPrediction(
  task: Task,
  prediction: PredictiveMatch,
  user: User
): Promise<string> {
  try {
    const response = await hustleAI.chat('user', `Why is this task predicted at ${prediction.score}% for me?

Task: ${task.title}
Category: ${task.category}
Pay: $${task.payAmount}
Distance: ${task.distance ? task.distance.toFixed(1) + ' km' : 'Unknown'}

My Profile:
- Level ${user.level}
- ${user.tasksCompleted} tasks completed
- ${user.reputationScore.toFixed(1)}⭐ rating

Explain in 2-3 sentences why this is a good match.`);

    return response.response;
  } catch {
    return prediction.reasoning;
  }
}
