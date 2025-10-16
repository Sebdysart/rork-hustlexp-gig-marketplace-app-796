export type BadgeAnalyticsEvent =
  | 'badge_viewed'
  | 'badge_unlocked'
  | 'badge_share'
  | 'badge_progress_updated'
  | 'trophy_unlocked'
  | 'badge_detail_opened'
  | 'badge_case_opened'
  | 'trophy_room_opened';

export interface BadgeAnalyticsPayload {
  event: BadgeAnalyticsEvent;
  badgeId?: string;
  trophyId?: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export function trackBadgeEvent(payload: BadgeAnalyticsPayload): void {
  console.log('[Badge Analytics]', payload.event, payload);
}

export function trackBadgeViewed(badgeId: string, userId: string): void {
  trackBadgeEvent({
    event: 'badge_viewed',
    badgeId,
    userId,
    timestamp: new Date(),
  });
}

export function trackBadgeUnlocked(badgeId: string, userId: string, metadata?: Record<string, any>): void {
  trackBadgeEvent({
    event: 'badge_unlocked',
    badgeId,
    userId,
    timestamp: new Date(),
    metadata,
  });
}

export function trackBadgeShare(badgeId: string, userId: string, platform?: string): void {
  trackBadgeEvent({
    event: 'badge_share',
    badgeId,
    userId,
    timestamp: new Date(),
    metadata: { platform },
  });
}

export function trackBadgeProgressUpdated(badgeId: string, userId: string, progress: number): void {
  trackBadgeEvent({
    event: 'badge_progress_updated',
    badgeId,
    userId,
    timestamp: new Date(),
    metadata: { progress },
  });
}

export function trackTrophyUnlocked(trophyId: string, userId: string): void {
  trackBadgeEvent({
    event: 'trophy_unlocked',
    trophyId,
    userId,
    timestamp: new Date(),
  });
}

export function trackBadgeDetailOpened(badgeId: string, userId: string): void {
  trackBadgeEvent({
    event: 'badge_detail_opened',
    badgeId,
    userId,
    timestamp: new Date(),
  });
}

export function trackBadgeCaseOpened(userId: string): void {
  trackBadgeEvent({
    event: 'badge_case_opened',
    userId,
    timestamp: new Date(),
  });
}

export function trackTrophyRoomOpened(userId: string): void {
  trackBadgeEvent({
    event: 'trophy_room_opened',
    userId,
    timestamp: new Date(),
  });
}
