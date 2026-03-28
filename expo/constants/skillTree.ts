export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  requiredLevel: number;
  requiredSkills: string[];
  cost: number;
  effect: {
    type: 'xp_boost' | 'earnings_boost' | 'task_visibility' | 'response_time' | 'trust_boost' | 'streak_protection';
    value: number;
  };
  category: 'efficiency' | 'earnings' | 'reputation' | 'social';
}

export const SKILL_TREE: SkillNode[] = [
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: '+5% XP from all tasks',
    icon: '📚',
    tier: 1,
    requiredLevel: 5,
    requiredSkills: [],
    cost: 100,
    effect: {
      type: 'xp_boost',
      value: 1.05,
    },
    category: 'efficiency',
  },
  {
    id: 'fast_fingers',
    name: 'Fast Fingers',
    description: '+10% faster response time bonus',
    icon: '⚡',
    tier: 1,
    requiredLevel: 5,
    requiredSkills: [],
    cost: 100,
    effect: {
      type: 'response_time',
      value: 1.1,
    },
    category: 'social',
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: '+3% earnings from all tasks',
    icon: '💰',
    tier: 1,
    requiredLevel: 5,
    requiredSkills: [],
    cost: 100,
    effect: {
      type: 'earnings_boost',
      value: 1.03,
    },
    category: 'earnings',
  },
  {
    id: 'reputation_builder',
    name: 'Reputation Builder',
    description: '+5% trust score growth',
    icon: '⭐',
    tier: 1,
    requiredLevel: 5,
    requiredSkills: [],
    cost: 100,
    effect: {
      type: 'trust_boost',
      value: 1.05,
    },
    category: 'reputation',
  },
  {
    id: 'xp_master',
    name: 'XP Master',
    description: '+10% XP from all tasks',
    icon: '🎯',
    tier: 2,
    requiredLevel: 15,
    requiredSkills: ['quick_learner'],
    cost: 250,
    effect: {
      type: 'xp_boost',
      value: 1.1,
    },
    category: 'efficiency',
  },
  {
    id: 'lightning_response',
    name: 'Lightning Response',
    description: '+20% faster response time bonus',
    icon: '⚡',
    tier: 2,
    requiredLevel: 15,
    requiredSkills: ['fast_fingers'],
    cost: 250,
    effect: {
      type: 'response_time',
      value: 1.2,
    },
    category: 'social',
  },
  {
    id: 'money_magnet',
    name: 'Money Magnet',
    description: '+7% earnings from all tasks',
    icon: '💵',
    tier: 2,
    requiredLevel: 15,
    requiredSkills: ['penny_pincher'],
    cost: 250,
    effect: {
      type: 'earnings_boost',
      value: 1.07,
    },
    category: 'earnings',
  },
  {
    id: 'trust_expert',
    name: 'Trust Expert',
    description: '+10% trust score growth',
    icon: '🏆',
    tier: 2,
    requiredLevel: 15,
    requiredSkills: ['reputation_builder'],
    cost: 250,
    effect: {
      type: 'trust_boost',
      value: 1.1,
    },
    category: 'reputation',
  },
  {
    id: 'xp_legend',
    name: 'XP Legend',
    description: '+15% XP from all tasks',
    icon: '👑',
    tier: 3,
    requiredLevel: 30,
    requiredSkills: ['xp_master'],
    cost: 500,
    effect: {
      type: 'xp_boost',
      value: 1.15,
    },
    category: 'efficiency',
  },
  {
    id: 'instant_responder',
    name: 'Instant Responder',
    description: '+30% faster response time bonus',
    icon: '🚀',
    tier: 3,
    requiredLevel: 30,
    requiredSkills: ['lightning_response'],
    cost: 500,
    effect: {
      type: 'response_time',
      value: 1.3,
    },
    category: 'social',
  },
  {
    id: 'wealth_builder',
    name: 'Wealth Builder',
    description: '+12% earnings from all tasks',
    icon: '💎',
    tier: 3,
    requiredLevel: 30,
    requiredSkills: ['money_magnet'],
    cost: 500,
    effect: {
      type: 'earnings_boost',
      value: 1.12,
    },
    category: 'earnings',
  },
  {
    id: 'trust_master',
    name: 'Trust Master',
    description: '+15% trust score growth',
    icon: '🌟',
    tier: 3,
    requiredLevel: 30,
    requiredSkills: ['trust_expert'],
    cost: 500,
    effect: {
      type: 'trust_boost',
      value: 1.15,
    },
    category: 'reputation',
  },
  {
    id: 'task_radar',
    name: 'Task Radar',
    description: 'See 50% more available tasks',
    icon: '📡',
    tier: 2,
    requiredLevel: 20,
    requiredSkills: ['quick_learner', 'fast_fingers'],
    cost: 300,
    effect: {
      type: 'task_visibility',
      value: 1.5,
    },
    category: 'efficiency',
  },
  {
    id: 'streak_guardian',
    name: 'Streak Guardian',
    description: 'Automatic 1-day streak protection',
    icon: '🛡️',
    tier: 2,
    requiredLevel: 20,
    requiredSkills: ['reputation_builder'],
    cost: 300,
    effect: {
      type: 'streak_protection',
      value: 1,
    },
    category: 'reputation',
  },
];

export function getUnlockedSkills(level: number, xp: number): SkillNode[] {
  return SKILL_TREE.filter(skill => level >= skill.requiredLevel && xp >= skill.cost);
}

export function canUnlockSkill(
  skill: SkillNode,
  level: number,
  xp: number,
  unlockedSkillIds: string[]
): boolean {
  if (level < skill.requiredLevel) return false;
  if (xp < skill.cost) return false;
  
  for (const requiredId of skill.requiredSkills) {
    if (!unlockedSkillIds.includes(requiredId)) {
      return false;
    }
  }
  
  return true;
}

export function getSkillsByCategory(category: SkillNode['category']): SkillNode[] {
  return SKILL_TREE.filter(skill => skill.category === category);
}

export function calculateTotalBoost(
  unlockedSkills: string[],
  boostType: SkillNode['effect']['type']
): number {
  let totalBoost = 1;
  
  for (const skillId of unlockedSkills) {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (skill && skill.effect.type === boostType) {
      totalBoost *= skill.effect.value;
    }
  }
  
  return totalBoost;
}
