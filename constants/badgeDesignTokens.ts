import { BadgeTier } from './badgesManifest';

export interface BadgeTierVisualConfig {
  color: string;
  glowColor: string;
  borderColor: string;
  backgroundColor: string;
  shadowColor: string;
  animationDuration: number;
  hasGlow: boolean;
  hasParticles: boolean;
  hasShimmer: boolean;
  iconScale: number;
  borderWidth: number;
}

export const BADGE_TIER_VISUALS: Record<BadgeTier, BadgeTierVisualConfig> = {
  Common: {
    color: '#9CA3AF',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    borderColor: '#6B7280',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    animationDuration: 0,
    hasGlow: false,
    hasParticles: false,
    hasShimmer: false,
    iconScale: 1,
    borderWidth: 2,
  },
  Uncommon: {
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    borderColor: '#2563EB',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    animationDuration: 400,
    hasGlow: true,
    hasParticles: false,
    hasShimmer: true,
    iconScale: 1.05,
    borderWidth: 2,
  },
  Rare: {
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    borderColor: '#9333EA',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    animationDuration: 600,
    hasGlow: true,
    hasParticles: true,
    hasShimmer: true,
    iconScale: 1.1,
    borderWidth: 3,
  },
  Epic: {
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    borderColor: '#D97706',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    shadowColor: 'rgba(245, 158, 11, 0.5)',
    animationDuration: 1200,
    hasGlow: true,
    hasParticles: true,
    hasShimmer: true,
    iconScale: 1.15,
    borderWidth: 3,
  },
  Legendary: {
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    borderColor: '#DC2626',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    shadowColor: 'rgba(239, 68, 68, 0.6)',
    animationDuration: 1500,
    hasGlow: true,
    hasParticles: true,
    hasShimmer: true,
    iconScale: 1.2,
    borderWidth: 4,
  },
  Mythic: {
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.8)',
    borderColor: '#DB2777',
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    shadowColor: 'rgba(236, 72, 153, 0.7)',
    animationDuration: 2000,
    hasGlow: true,
    hasParticles: true,
    hasShimmer: true,
    iconScale: 1.25,
    borderWidth: 4,
  },
};

export const BADGE_ANIMATION_TIMINGS = {
  unlock: 1200,
  microBurst: 400,
  shimmer: 2000,
  particleDuration: 800,
  glowPulse: 1500,
  evolution: 1800,
};

export const BADGE_SIZES = {
  small: 40,
  medium: 60,
  large: 80,
  xlarge: 120,
};

export const BADGE_GRID_SPACING = {
  compact: 8,
  normal: 12,
  comfortable: 16,
};

export interface BadgeUnlockAnimation {
  type: 'fade' | 'scale' | 'burst' | 'morph' | 'shimmer';
  duration: number;
  delay: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export const BADGE_UNLOCK_ANIMATIONS: Record<BadgeTier, BadgeUnlockAnimation[]> = {
  Common: [
    { type: 'fade', duration: 300, delay: 0, easing: 'ease-in' },
    { type: 'scale', duration: 200, delay: 100, easing: 'ease-out' },
  ],
  Uncommon: [
    { type: 'fade', duration: 400, delay: 0, easing: 'ease-in' },
    { type: 'scale', duration: 300, delay: 100, easing: 'ease-out' },
    { type: 'shimmer', duration: 600, delay: 200, easing: 'ease-in-out' },
  ],
  Rare: [
    { type: 'fade', duration: 500, delay: 0, easing: 'ease-in' },
    { type: 'scale', duration: 400, delay: 100, easing: 'ease-out' },
    { type: 'burst', duration: 600, delay: 300, easing: 'ease-out' },
    { type: 'shimmer', duration: 800, delay: 400, easing: 'ease-in-out' },
  ],
  Epic: [
    { type: 'fade', duration: 600, delay: 0, easing: 'ease-in' },
    { type: 'morph', duration: 800, delay: 200, easing: 'ease-in-out' },
    { type: 'burst', duration: 800, delay: 600, easing: 'ease-out' },
    { type: 'shimmer', duration: 1000, delay: 800, easing: 'ease-in-out' },
  ],
  Legendary: [
    { type: 'fade', duration: 800, delay: 0, easing: 'ease-in' },
    { type: 'morph', duration: 1000, delay: 300, easing: 'ease-in-out' },
    { type: 'burst', duration: 1000, delay: 800, easing: 'ease-out' },
    { type: 'shimmer', duration: 1200, delay: 1000, easing: 'ease-in-out' },
  ],
  Mythic: [
    { type: 'fade', duration: 1000, delay: 0, easing: 'ease-in' },
    { type: 'morph', duration: 1200, delay: 400, easing: 'ease-in-out' },
    { type: 'burst', duration: 1200, delay: 1000, easing: 'ease-out' },
    { type: 'shimmer', duration: 1500, delay: 1200, easing: 'ease-in-out' },
  ],
};

export const BADGE_CATEGORY_COLORS: Record<string, string> = {
  'Skill:Cleaning': '#10B981',
  'Skill:Moving': '#F59E0B',
  'Skill:Handyman': '#EF4444',
  'Skill:Plumbing': '#3B82F6',
  'Skill:Electrical': '#FBBF24',
  'Skill:Childcare': '#EC4899',
  'Skill:Nursing': '#EF4444',
  'Skill:Tutoring': '#8B5CF6',
  'Skill:Digital': '#06B6D4',
  'Skill:SocialMedia': '#F472B6',
  'Skill:Delivery': '#F97316',
  'Skill:Landscaping': '#22C55E',
  Reputation: '#3B82F6',
  Economy: '#10B981',
  Speed: '#F59E0B',
  Community: '#EC4899',
  AI: '#8B5CF6',
  Event: '#F472B6',
  Safety: '#EF4444',
  Creator: '#A855F7',
  Misc: '#6B7280',
};

export function getBadgeTierVisuals(tier: BadgeTier): BadgeTierVisualConfig {
  return BADGE_TIER_VISUALS[tier];
}

export function getBadgeUnlockAnimations(tier: BadgeTier): BadgeUnlockAnimation[] {
  return BADGE_UNLOCK_ANIMATIONS[tier];
}

export function getBadgeCategoryColor(category: string): string {
  return BADGE_CATEGORY_COLORS[category] || '#6B7280';
}
