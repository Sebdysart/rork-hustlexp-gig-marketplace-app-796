import { Task, TaskCategory } from '@/types';
import { hustleAI } from './hustleAI';

export interface SafetyFlag {
  level: 'low' | 'medium' | 'high' | 'critical';
  type: 'location' | 'payment' | 'description' | 'poster_history' | 'timing' | 'personal_info';
  message: string;
  recommendation: string;
}

export interface SafetyScanResult {
  isSafe: boolean;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  flags: SafetyFlag[];
  recommendations: string[];
  shouldBlock: boolean;
}

const RISKY_KEYWORDS = [
  'cash only', 'no questions asked', 'under the table', 'off the books',
  'bring friends', 'isolated area', 'late night', 'vacant property',
  'password', 'social security', 'bank account', 'credit card',
  'no contract', 'no receipt', 'suspicious', 'secret'
];

const SUSPICIOUS_LOCATIONS = [
  'vacant', 'abandoned', 'empty lot', 'construction site late',
  'isolated', 'remote area', 'no one around'
];

export async function scanTaskSafety(task: Task, posterHistory?: {
  tasksPosted: number;
  cancelRate: number;
  avgRating: number;
  strikes: number;
}): Promise<SafetyScanResult> {
  const flags: SafetyFlag[] = [];

  const description = `${task.title} ${task.description}`.toLowerCase();

  RISKY_KEYWORDS.forEach(keyword => {
    if (description.includes(keyword)) {
      flags.push({
        level: keyword.includes('social security') || keyword.includes('bank account') ? 'critical' : 'high',
        type: 'description',
        message: `Contains risky phrase: "${keyword}"`,
        recommendation: 'Review task details carefully. Contact poster for clarification.'
      });
    }
  });

  SUSPICIOUS_LOCATIONS.forEach(keyword => {
    if (task.location.address.toLowerCase().includes(keyword)) {
      flags.push({
        level: 'high',
        type: 'location',
        message: `Potentially unsafe location: "${keyword}"`,
        recommendation: 'Meet in public area first. Share location with a friend.'
      });
    }
  });

  if (task.payAmount > 500) {
    flags.push({
      level: 'medium',
      type: 'payment',
      message: 'High payment amount for category',
      recommendation: 'Verify payment method. Consider milestone payments.'
    });
  }

  if (task.payAmount < 10) {
    flags.push({
      level: 'low',
      type: 'payment',
      message: 'Very low payment amount',
      recommendation: 'Ensure compensation matches effort required.'
    });
  }

  if (posterHistory) {
    if (posterHistory.strikes > 2) {
      flags.push({
        level: 'critical',
        type: 'poster_history',
        message: 'Poster has multiple strikes',
        recommendation: 'This poster has a history of violations. Proceed with extreme caution.'
      });
    }

    if (posterHistory.cancelRate > 0.3 && posterHistory.tasksPosted > 5) {
      flags.push({
        level: 'high',
        type: 'poster_history',
        message: `High cancellation rate: ${Math.round(posterHistory.cancelRate * 100)}%`,
        recommendation: 'Poster frequently cancels. Confirm task before accepting.'
      });
    }

    if (posterHistory.avgRating < 3.0 && posterHistory.tasksPosted > 3) {
      flags.push({
        level: 'medium',
        type: 'poster_history',
        message: `Low average rating: ${posterHistory.avgRating.toFixed(1)}/5`,
        recommendation: 'Review poster profile and previous feedback.'
      });
    }
  }

  if (task.dateTime) {
    const taskDate = new Date(task.dateTime);
    const hour = taskDate.getHours();
    if (hour >= 22 || hour <= 5) {
      flags.push({
        level: 'medium',
        type: 'timing',
        message: 'Late night or early morning task',
        recommendation: 'Ensure adequate safety measures for off-hours work.'
      });
    }
  }

  const criticalFlags = flags.filter(f => f.level === 'critical');
  const highFlags = flags.filter(f => f.level === 'high');
  const mediumFlags = flags.filter(f => f.level === 'medium');

  const shouldBlock = criticalFlags.length > 0 || highFlags.length >= 2;
  
  let overallRisk: 'low' | 'medium' | 'high' | 'critical';
  if (criticalFlags.length > 0) {
    overallRisk = 'critical';
  } else if (highFlags.length >= 2) {
    overallRisk = 'high';
  } else if (highFlags.length > 0 || mediumFlags.length >= 2) {
    overallRisk = 'medium';
  } else {
    overallRisk = 'low';
  }

  const recommendations: string[] = [];
  if (overallRisk === 'critical' || overallRisk === 'high') {
    recommendations.push('🚨 High risk detected. Consider skipping this task.');
    recommendations.push('📍 If proceeding, share your location with someone you trust.');
    recommendations.push('💬 Communicate through the app only.');
  } else if (overallRisk === 'medium') {
    recommendations.push('⚠️ Some concerns detected. Review carefully.');
    recommendations.push('✅ Verify poster identity and payment method.');
  } else {
    recommendations.push('✨ Task appears safe based on automated scan.');
    recommendations.push('👍 Always use in-app messaging and payment.');
  }

  return {
    isSafe: !shouldBlock,
    overallRisk,
    flags,
    recommendations,
    shouldBlock
  };
}

export function getRiskColor(risk: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (risk) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'critical': return '#991B1B';
  }
}

export function getRiskIcon(risk: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (risk) {
    case 'low': return 'shield-check';
    case 'medium': return 'shield-alert';
    case 'high': return 'shield-x';
    case 'critical': return 'shield-ban';
  }
}
