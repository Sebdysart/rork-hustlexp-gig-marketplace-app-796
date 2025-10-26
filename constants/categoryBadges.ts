export type CategoryBadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';

export interface CategoryBadge {
  category: string;
  displayName: string;
  tiers: {
    tier: CategoryBadgeTier;
    requirement: number;
    name: string;
    icon: string;
    color: string;
    glowColor: string;
    animation: 'none' | 'shine' | 'glow' | 'holographic' | 'rainbow';
    particles: boolean;
    sound: boolean;
  }[];
}

export const CATEGORY_BADGES: CategoryBadge[] = [
  {
    category: 'cleaning',
    displayName: 'Cleaning',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        name: 'Cleaning Starter',
        icon: '🧹',
        color: '#CD7F32',
        glowColor: 'rgba(205, 127, 50, 0.3)',
        animation: 'none',
        particles: false,
        sound: false,
      },
      {
        tier: 'silver',
        requirement: 50,
        name: 'Reliable Cleaner',
        icon: '🧽',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.4)',
        animation: 'shine',
        particles: false,
        sound: false,
      },
      {
        tier: 'gold',
        requirement: 150,
        name: 'Master Cleaner',
        icon: '✨',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        animation: 'glow',
        particles: true,
        sound: false,
      },
      {
        tier: 'platinum',
        requirement: 500,
        name: 'Elite Cleaner',
        icon: '💎',
        color: '#E5E4E2',
        glowColor: 'rgba(229, 228, 226, 0.6)',
        animation: 'holographic',
        particles: true,
        sound: true,
      },
      {
        tier: 'legendary',
        requirement: 1000,
        name: 'Cleaning Legend',
        icon: '👑',
        color: '#B9F2FF',
        glowColor: 'rgba(185, 242, 255, 0.8)',
        animation: 'rainbow',
        particles: true,
        sound: true,
      },
    ],
  },
  {
    category: 'delivery',
    displayName: 'Delivery',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        name: 'Delivery Starter',
        icon: '📦',
        color: '#CD7F32',
        glowColor: 'rgba(205, 127, 50, 0.3)',
        animation: 'none',
        particles: false,
        sound: false,
      },
      {
        tier: 'silver',
        requirement: 50,
        name: 'Reliable Runner',
        icon: '🏃',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.4)',
        animation: 'shine',
        particles: false,
        sound: false,
      },
      {
        tier: 'gold',
        requirement: 150,
        name: 'Speed Demon',
        icon: '⚡',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        animation: 'glow',
        particles: true,
        sound: false,
      },
      {
        tier: 'platinum',
        requirement: 500,
        name: 'Elite Courier',
        icon: '💎',
        color: '#E5E4E2',
        glowColor: 'rgba(229, 228, 226, 0.6)',
        animation: 'holographic',
        particles: true,
        sound: true,
      },
      {
        tier: 'legendary',
        requirement: 1000,
        name: 'Delivery Legend',
        icon: '👑',
        color: '#B9F2FF',
        glowColor: 'rgba(185, 242, 255, 0.8)',
        animation: 'rainbow',
        particles: true,
        sound: true,
      },
    ],
  },
  {
    category: 'moving',
    displayName: 'Moving',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        name: 'Moving Novice',
        icon: '📦',
        color: '#CD7F32',
        glowColor: 'rgba(205, 127, 50, 0.3)',
        animation: 'none',
        particles: false,
        sound: false,
      },
      {
        tier: 'silver',
        requirement: 50,
        name: 'Strong Mover',
        icon: '💪',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.4)',
        animation: 'shine',
        particles: false,
        sound: false,
      },
      {
        tier: 'gold',
        requirement: 150,
        name: 'Moving Master',
        icon: '🚚',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        animation: 'glow',
        particles: true,
        sound: false,
      },
      {
        tier: 'platinum',
        requirement: 500,
        name: 'Elite Lifter',
        icon: '💎',
        color: '#E5E4E2',
        glowColor: 'rgba(229, 228, 226, 0.6)',
        animation: 'holographic',
        particles: true,
        sound: true,
      },
      {
        tier: 'legendary',
        requirement: 1000,
        name: 'Moving Legend',
        icon: '👑',
        color: '#B9F2FF',
        glowColor: 'rgba(185, 242, 255, 0.8)',
        animation: 'rainbow',
        particles: true,
        sound: true,
      },
    ],
  },
  {
    category: 'handyman',
    displayName: 'Handyman',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        name: 'Fix-It Beginner',
        icon: '🔨',
        color: '#CD7F32',
        glowColor: 'rgba(205, 127, 50, 0.3)',
        animation: 'none',
        particles: false,
        sound: false,
      },
      {
        tier: 'silver',
        requirement: 50,
        name: 'Reliable Repairman',
        icon: '🔧',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.4)',
        animation: 'shine',
        particles: false,
        sound: false,
      },
      {
        tier: 'gold',
        requirement: 150,
        name: 'Master Craftsman',
        icon: '⚙️',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        animation: 'glow',
        particles: true,
        sound: false,
      },
      {
        tier: 'platinum',
        requirement: 500,
        name: 'Elite Specialist',
        icon: '💎',
        color: '#E5E4E2',
        glowColor: 'rgba(229, 228, 226, 0.6)',
        animation: 'holographic',
        particles: true,
        sound: true,
      },
      {
        tier: 'legendary',
        requirement: 1000,
        name: 'Handyman Legend',
        icon: '👑',
        color: '#B9F2FF',
        glowColor: 'rgba(185, 242, 255, 0.8)',
        animation: 'rainbow',
        particles: true,
        sound: true,
      },
    ],
  },
  {
    category: 'tech',
    displayName: 'Tech Support',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        name: 'Tech Helper',
        icon: '💻',
        color: '#CD7F32',
        glowColor: 'rgba(205, 127, 50, 0.3)',
        animation: 'none',
        particles: false,
        sound: false,
      },
      {
        tier: 'silver',
        requirement: 50,
        name: 'IT Specialist',
        icon: '🖥️',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.4)',
        animation: 'shine',
        particles: false,
        sound: false,
      },
      {
        tier: 'gold',
        requirement: 150,
        name: 'Tech Master',
        icon: '⚡',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        animation: 'glow',
        particles: true,
        sound: false,
      },
      {
        tier: 'platinum',
        requirement: 500,
        name: 'Tech Wizard',
        icon: '💎',
        color: '#E5E4E2',
        glowColor: 'rgba(229, 228, 226, 0.6)',
        animation: 'holographic',
        particles: true,
        sound: true,
      },
      {
        tier: 'legendary',
        requirement: 1000,
        name: 'Tech Legend',
        icon: '👑',
        color: '#B9F2FF',
        glowColor: 'rgba(185, 242, 255, 0.8)',
        animation: 'rainbow',
        particles: true,
        sound: true,
      },
    ],
  },
  {
    category: 'errands',
    displayName: 'Errands',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        name: 'Errand Runner',
        icon: '🏃',
        color: '#CD7F32',
        glowColor: 'rgba(205, 127, 50, 0.3)',
        animation: 'none',
        particles: false,
        sound: false,
      },
      {
        tier: 'silver',
        requirement: 50,
        name: 'Task Master',
        icon: '📋',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.4)',
        animation: 'shine',
        particles: false,
        sound: false,
      },
      {
        tier: 'gold',
        requirement: 150,
        name: 'Efficiency Expert',
        icon: '⚡',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        animation: 'glow',
        particles: true,
        sound: false,
      },
      {
        tier: 'platinum',
        requirement: 500,
        name: 'Errand Emperor',
        icon: '💎',
        color: '#E5E4E2',
        glowColor: 'rgba(229, 228, 226, 0.6)',
        animation: 'holographic',
        particles: true,
        sound: true,
      },
      {
        tier: 'legendary',
        requirement: 1000,
        name: 'Errand Legend',
        icon: '👑',
        color: '#B9F2FF',
        glowColor: 'rgba(185, 242, 255, 0.8)',
        animation: 'rainbow',
        particles: true,
        sound: true,
      },
    ],
  },
  {
    category: 'creative',
    displayName: 'Creative Work',
    tiers: [
      {
        tier: 'bronze',
        requirement: 10,
        name: 'Creative Novice',
        icon: '🎨',
        color: '#CD7F32',
        glowColor: 'rgba(205, 127, 50, 0.3)',
        animation: 'none',
        particles: false,
        sound: false,
      },
      {
        tier: 'silver',
        requirement: 50,
        name: 'Artist',
        icon: '🖌️',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.4)',
        animation: 'shine',
        particles: false,
        sound: false,
      },
      {
        tier: 'gold',
        requirement: 150,
        name: 'Master Creator',
        icon: '✨',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        animation: 'glow',
        particles: true,
        sound: false,
      },
      {
        tier: 'platinum',
        requirement: 500,
        name: 'Elite Designer',
        icon: '💎',
        color: '#E5E4E2',
        glowColor: 'rgba(229, 228, 226, 0.6)',
        animation: 'holographic',
        particles: true,
        sound: true,
      },
      {
        tier: 'legendary',
        requirement: 1000,
        name: 'Creative Legend',
        icon: '👑',
        color: '#B9F2FF',
        glowColor: 'rgba(185, 242, 255, 0.8)',
        animation: 'rainbow',
        particles: true,
        sound: true,
      },
    ],
  },
];

export function getCategoryBadge(category: string, completedTasks: number) {
  const categoryBadge = CATEGORY_BADGES.find(b => b.category === category);
  if (!categoryBadge) return null;

  let currentTier = null;
  let nextTier = categoryBadge.tiers[0];
  
  for (let i = categoryBadge.tiers.length - 1; i >= 0; i--) {
    if (completedTasks >= categoryBadge.tiers[i].requirement) {
      currentTier = categoryBadge.tiers[i];
      nextTier = categoryBadge.tiers[i + 1] || null;
      break;
    }
  }

  const progress = nextTier 
    ? Math.min((completedTasks / nextTier.requirement) * 100, 100)
    : 100;

  return {
    category: categoryBadge.displayName,
    currentTier,
    nextTier,
    progress,
    completedTasks,
  };
}

export function getAllCategoryBadges(genreTasksCompleted: Record<string, number>) {
  return CATEGORY_BADGES.map(categoryBadge => {
    const completedTasks = genreTasksCompleted[categoryBadge.category] || 0;
    return getCategoryBadge(categoryBadge.category, completedTasks);
  }).filter(badge => badge !== null && (badge.currentTier || badge.completedTasks > 0));
}
