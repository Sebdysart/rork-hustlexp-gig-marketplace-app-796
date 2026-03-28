import { Badge } from '@/constants/badgesManifest';

export interface FraudCheckResult {
  isSuspicious: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
  requiresManualReview: boolean;
}

export function checkBadgeUnlockFraud(
  badge: Badge,
  userStats: {
    tasksCompleted: number;
    accountAge: number;
    recentActivitySpike: boolean;
    previousFlags: number;
  }
): FraudCheckResult {
  if (badge.is_verification_required) {
    return {
      isSuspicious: false,
      severity: 'low',
      requiresManualReview: true,
    };
  }

  if (userStats.recentActivitySpike && (badge.tier === 'Epic' || badge.tier === 'Legendary' || badge.tier === 'Mythic')) {
    return {
      isSuspicious: true,
      reason: 'Unusual activity spike detected for high-value badge',
      severity: 'high',
      requiresManualReview: true,
    };
  }

  if (userStats.accountAge < 7 && badge.tier === 'Legendary') {
    return {
      isSuspicious: true,
      reason: 'Account too new for Legendary badge',
      severity: 'medium',
      requiresManualReview: true,
    };
  }

  if (userStats.previousFlags > 2) {
    return {
      isSuspicious: true,
      reason: 'Multiple previous fraud flags',
      severity: 'high',
      requiresManualReview: true,
    };
  }

  return {
    isSuspicious: false,
    severity: 'low',
    requiresManualReview: false,
  };
}

export function detectRateLimitViolation(
  userId: string,
  recentBadgeUnlocks: { badgeId: string; timestamp: Date }[]
): boolean {
  const last24Hours = recentBadgeUnlocks.filter(
    unlock => Date.now() - unlock.timestamp.getTime() < 24 * 60 * 60 * 1000
  );

  return last24Hours.length > 20;
}

export function createModerationTicket(
  userId: string,
  badgeId: string,
  reason: string,
  severity: 'low' | 'medium' | 'high'
): void {
  console.log('[Moderation Ticket Created]', {
    userId,
    badgeId,
    reason,
    severity,
    timestamp: new Date(),
  });
}

export function flagSuspiciousActivity(
  userId: string,
  activityType: string,
  details: Record<string, any>
): void {
  console.log('[Suspicious Activity Flagged]', {
    userId,
    activityType,
    details,
    timestamp: new Date(),
  });
}
