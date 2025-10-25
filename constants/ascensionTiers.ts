export interface AscensionTier {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  xpMultiplier: number;
  platformFee: number;
  priorityMatching: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    gradientStart: string;
    gradientEnd: string;
    accentColor: string;
    glowColor: string;
  };
  effects: {
    particles: boolean;
    confetti: boolean;
    parallax: boolean;
    holographic: boolean;
    animation3D: boolean;
  };
  perks: string[];
  aiCoach: {
    persona: string;
    capabilities: string[];
  };
  exclusiveFeatures: string[];
  unlockCelebration: {
    duration: number;
    stages: number;
    particleCount: number;
  };
}

export const ASCENSION_TIERS: AscensionTier[] = [
  {
    id: 'side_hustler',
    name: 'Side Hustler',
    minLevel: 1,
    maxLevel: 10,
    xpMultiplier: 1.0,
    platformFee: 15,
    priorityMatching: 'Standard',
    theme: {
      primaryColor: '#7C3AED',
      secondaryColor: '#5B21B6',
      gradientStart: '#7C3AED',
      gradientEnd: '#5B21B6',
      accentColor: '#A78BFA',
      glowColor: 'rgba(124, 58, 237, 0.3)',
    },
    effects: {
      particles: false,
      confetti: false,
      parallax: false,
      holographic: false,
      animation3D: false,
    },
    perks: [
      'Access to all basic tasks',
      'Standard XP rates',
      'Basic streak tracking',
      'Community support',
    ],
    aiCoach: {
      persona: 'Friendly Guide',
      capabilities: ['Basic tips', 'Task suggestions', 'Progress tracking'],
    },
    exclusiveFeatures: ['Daily quests', 'Basic badges'],
    unlockCelebration: {
      duration: 5000,
      stages: 3,
      particleCount: 20,
    },
  },
  {
    id: 'the_operator',
    name: 'The Operator',
    minLevel: 11,
    maxLevel: 20,
    xpMultiplier: 1.2,
    platformFee: 12,
    priorityMatching: '2x Priority',
    theme: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#D946EF',
      gradientStart: '#8B5CF6',
      gradientEnd: '#D946EF',
      accentColor: '#F59E0B',
      glowColor: 'rgba(139, 92, 246, 0.4)',
    },
    effects: {
      particles: true,
      confetti: false,
      parallax: false,
      holographic: false,
      animation3D: false,
    },
    perks: [
      '+20% XP Multiplier',
      'Platform fee reduced to 12%',
      '2x Priority in task matching',
      'Animated profile frame',
      'Fee rebate on first 5 tasks',
    ],
    aiCoach: {
      persona: 'Adaptive Guide',
      capabilities: ['Adaptive guidance', 'Performance insights', 'Strategy tips'],
    },
    exclusiveFeatures: ['Priority matching', 'Animated XP bar', 'Gold accents'],
    unlockCelebration: {
      duration: 8000,
      stages: 4,
      particleCount: 40,
    },
  },
  {
    id: 'rainmaker',
    name: 'Rainmaker',
    minLevel: 21,
    maxLevel: 30,
    xpMultiplier: 1.5,
    platformFee: 10,
    priorityMatching: '5x Priority',
    theme: {
      primaryColor: '#F59E0B',
      secondaryColor: '#D946EF',
      gradientStart: '#F59E0B',
      gradientEnd: '#D946EF',
      accentColor: '#FCD34D',
      glowColor: 'rgba(245, 158, 11, 0.5)',
    },
    effects: {
      particles: true,
      confetti: true,
      parallax: true,
      holographic: true,
      animation3D: false,
    },
    perks: [
      '+50% XP Multiplier',
      'Platform fee reduced to 10%',
      '5x Priority matching',
      'Holographic card frames',
      'Premium animated aura',
      'Deals start finding you',
    ],
    aiCoach: {
      persona: 'Personalized Coach',
      capabilities: [
        'Personalized strategies',
        'Market predictions',
        'Earnings optimization',
        'Surge alerts',
      ],
    },
    exclusiveFeatures: [
      'Power-ups shop',
      'Exclusive gigs',
      'Surge alerts',
      'Confetti celebrations',
    ],
    unlockCelebration: {
      duration: 12000,
      stages: 5,
      particleCount: 80,
    },
  },
  {
    id: 'the_architect',
    name: 'The Architect',
    minLevel: 31,
    maxLevel: 40,
    xpMultiplier: 2.0,
    platformFee: 7,
    priorityMatching: '10x Priority',
    theme: {
      primaryColor: '#0F172A',
      secondaryColor: '#F59E0B',
      gradientStart: '#0F172A',
      gradientEnd: '#1E293B',
      accentColor: '#FCD34D',
      glowColor: 'rgba(245, 158, 11, 0.6)',
    },
    effects: {
      particles: true,
      confetti: true,
      parallax: true,
      holographic: true,
      animation3D: true,
    },
    perks: [
      '+100% XP Multiplier (2x)',
      'Platform fee reduced to 7%',
      '10x Priority matching',
      'Elite holographic frame',
      'Custom animation on profile',
      'Designing your empire status',
      'Economy insights dashboard',
    ],
    aiCoach: {
      persona: 'Elite Coach',
      capabilities: [
        'Elite strategies',
        'Market mastery',
        'Premium insights',
        'Exclusive opportunities',
        'Business scaling advice',
      ],
    },
    exclusiveFeatures: [
      'Economy insights',
      'Marketplace voting',
      'Multi-layered particles',
      'Dynamic backgrounds',
      '3D avatar frames',
    ],
    unlockCelebration: {
      duration: 15000,
      stages: 5,
      particleCount: 120,
    },
  },
  {
    id: 'prestige',
    name: 'Prestige',
    minLevel: 41,
    maxLevel: 999,
    xpMultiplier: 3.0,
    platformFee: 5,
    priorityMatching: 'Instant',
    theme: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#F59E0B',
      gradientStart: '#FBBF24',
      gradientEnd: '#F59E0B',
      accentColor: '#FCD34D',
      glowColor: 'rgba(251, 191, 36, 0.8)',
    },
    effects: {
      particles: true,
      confetti: true,
      parallax: true,
      holographic: true,
      animation3D: true,
    },
    perks: [
      '+200% XP Multiplier (3x)',
      'Platform fee reduced to 5%',
      'Instant priority matching',
      'Custom theme selection',
      'Full-screen celebrations',
      'Exclusive sound effects',
      '3D animated avatar',
      'Revenue sharing eligible',
    ],
    aiCoach: {
      persona: 'Custom AI Persona',
      capabilities: [
        'Custom AI personalities',
        'Predictive modeling',
        'VIP opportunities',
        'Private quest access',
        'Revenue optimization',
        'Network effects',
      ],
    },
    exclusiveFeatures: [
      'Invite-only quests',
      'Revenue sharing',
      'Custom animations',
      'Exclusive events',
      'Theme customization',
      'VIP status everywhere',
    ],
    unlockCelebration: {
      duration: 20000,
      stages: 5,
      particleCount: 200,
    },
  },
];

export function getTierForLevel(level: number): AscensionTier {
  return (
    ASCENSION_TIERS.find((tier) => level >= tier.minLevel && level <= tier.maxLevel) ||
    ASCENSION_TIERS[0]
  );
}

export function getNextTier(currentLevel: number): AscensionTier | null {
  const currentTier = getTierForLevel(currentLevel);
  const currentIndex = ASCENSION_TIERS.findIndex((t) => t.id === currentTier.id);
  return currentIndex < ASCENSION_TIERS.length - 1
    ? ASCENSION_TIERS[currentIndex + 1]
    : null;
}

export function getProgressToNextTier(currentLevel: number): number {
  const currentTier = getTierForLevel(currentLevel);
  const progress =
    (currentLevel - currentTier.minLevel) / (currentTier.maxLevel - currentTier.minLevel);
  return Math.max(0, Math.min(1, progress));
}

export function getLevelsUntilNextTier(currentLevel: number): number {
  const nextTier = getNextTier(currentLevel);
  if (!nextTier) return 0;
  return nextTier.minLevel - currentLevel;
}

export function isNearNextTier(currentLevel: number, threshold: number = 0.8): boolean {
  const progress = getProgressToNextTier(currentLevel);
  return progress >= threshold;
}
