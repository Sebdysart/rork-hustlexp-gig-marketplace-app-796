import { User, Task, TrustScore } from '@/types';

export function calculateTrustScore(
  user: User,
  tasks: Task[],
  ratings: any[]
): TrustScore {
  const userTasks = tasks.filter(
    (t) => t.workerId === user.id && t.status === 'completed'
  );

  const completionRate =
    userTasks.length > 0
      ? (userTasks.length / (userTasks.length + (user.strikes?.length || 0))) * 100
      : 100;

  const timelinessScore = calculateTimelinessScore(userTasks);
  const proofQualityScore = calculateProofQualityScore(user);
  const responseSpeedScore = user.responseTime
    ? Math.max(0, 100 - user.responseTime / 60)
    : 80;
  const rehireRate = user.rehireRate || 0;
  const disputesPenalty = (user.strikes?.length || 0) * 10;

  const overall = Math.max(
    0,
    Math.min(
      100,
      (completionRate * 0.25 +
        timelinessScore * 0.2 +
        proofQualityScore * 0.2 +
        responseSpeedScore * 0.15 +
        rehireRate * 0.2 -
        disputesPenalty)
    )
  );

  const tier = getTier(overall);
  const nextMilestone = getNextMilestone(overall, {
    completion: completionRate,
    timeliness: timelinessScore,
    proofQuality: proofQualityScore,
    responseSpeed: responseSpeedScore,
    rehireRate,
  });

  return {
    overall: Math.round(overall),
    completion: Math.round(completionRate),
    timeliness: Math.round(timelinessScore),
    proofQuality: Math.round(proofQualityScore),
    responseSpeed: Math.round(responseSpeedScore),
    rehireRate: Math.round(rehireRate),
    disputes: user.strikes?.length || 0,
    tier,
    nextMilestone,
  };
}

function calculateTimelinessScore(tasks: Task[]): number {
  if (tasks.length === 0) return 100;

  const onTimeCount = tasks.filter((t) => {
    if (!t.completedAt) return false;
    const scheduled = new Date(t.dateTime).getTime();
    const completed = new Date(t.completedAt).getTime();
    const buffer = 30 * 60 * 1000;
    return completed <= scheduled + buffer;
  }).length;

  return (onTimeCount / tasks.length) * 100;
}

function calculateProofQualityScore(user: User): number {
  const proofLinks = user.proofLinks || [];
  if (proofLinks.length === 0) return 50;

  const verifiedCount = proofLinks.filter((p) => p.verified).length;
  const baseScore = (verifiedCount / proofLinks.length) * 100;

  const bonusForVolume = Math.min(20, proofLinks.length * 2);

  return Math.min(100, baseScore + bonusForVolume);
}

function getTier(score: number): TrustScore['tier'] {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'needs_improvement';
}

function getNextMilestone(
  overall: number,
  components: {
    completion: number;
    timeliness: number;
    proofQuality: number;
    responseSpeed: number;
    rehireRate: number;
  }
): TrustScore['nextMilestone'] {
  const gaps = [
    {
      key: 'proofQuality',
      score: components.proofQuality,
      action: 'Upload before/after photos on your last 3 tasks',
      impact: '+4 points',
      potential: (100 - components.proofQuality) * 0.2,
    },
    {
      key: 'responseSpeed',
      score: components.responseSpeed,
      action: 'Respond to messages within 5 minutes',
      impact: '+3 points',
      potential: (100 - components.responseSpeed) * 0.15,
    },
    {
      key: 'timeliness',
      score: components.timeliness,
      action: 'Complete next 2 tasks on time',
      impact: '+5 points',
      potential: (100 - components.timeliness) * 0.2,
    },
    {
      key: 'rehireRate',
      score: components.rehireRate,
      action: 'Get rehired by 2 previous posters',
      impact: '+6 points',
      potential: (100 - components.rehireRate) * 0.2,
    },
  ];

  gaps.sort((a, b) => b.potential - a.potential);

  const best = gaps[0];
  const targetScore = Math.min(100, overall + Math.ceil(best.potential));

  return {
    score: targetScore,
    action: best.action,
    impact: best.impact,
  };
}

export function getTrustScoreColor(tier: TrustScore['tier']): string {
  switch (tier) {
    case 'excellent':
      return '#10B981';
    case 'good':
      return '#3B82F6';
    case 'fair':
      return '#F59E0B';
    case 'needs_improvement':
      return '#EF4444';
  }
}

export function getTrustScoreLabel(tier: TrustScore['tier']): string {
  switch (tier) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'needs_improvement':
      return 'Needs Improvement';
  }
}
