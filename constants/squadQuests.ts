export interface SquadQuest {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredMembers: number;
  totalSlots: number;
  filledSlots: number;
  payPerMember: number;
  xpPerMember: number;
  bonusXP: number;
  duration: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
  startTime?: string;
  icon: string;
}

export const SQUAD_QUESTS: SquadQuest[] = [
  {
    id: 'sq-1',
    title: 'Community Garden Cleanup',
    description: 'Help clean up and organize the community garden. Tasks include weeding, planting, and general maintenance.',
    category: 'Outdoor',
    requiredMembers: 4,
    totalSlots: 4,
    filledSlots: 2,
    payPerMember: 45,
    xpPerMember: 80,
    bonusXP: 50,
    duration: '3 hours',
    location: {
      address: '123 Garden St, San Francisco, CA',
      lat: 37.7749,
      lng: -122.4194,
    },
    difficulty: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    icon: '🌱',
  },
  {
    id: 'sq-2',
    title: 'Moving Day Squad',
    description: 'Help a family move to their new home. Heavy lifting required. Truck provided.',
    category: 'Moving',
    requiredMembers: 3,
    totalSlots: 3,
    filledSlots: 1,
    payPerMember: 60,
    xpPerMember: 100,
    bonusXP: 75,
    duration: '4 hours',
    location: {
      address: '456 Oak Ave, San Francisco, CA',
      lat: 37.7849,
      lng: -122.4094,
    },
    difficulty: 'hard',
    status: 'open',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    icon: '📦',
  },
  {
    id: 'sq-3',
    title: 'Event Setup Team',
    description: 'Set up tables, chairs, and decorations for a community event. Fun and social!',
    category: 'Events',
    requiredMembers: 5,
    totalSlots: 5,
    filledSlots: 3,
    payPerMember: 35,
    xpPerMember: 60,
    bonusXP: 40,
    duration: '2 hours',
    location: {
      address: '789 Event Plaza, San Francisco, CA',
      lat: 37.7649,
      lng: -122.4294,
    },
    difficulty: 'easy',
    status: 'open',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    icon: '🎉',
  },
  {
    id: 'sq-4',
    title: 'Warehouse Organization',
    description: 'Organize inventory in a local warehouse. Sorting, labeling, and stacking.',
    category: 'Warehouse',
    requiredMembers: 6,
    totalSlots: 6,
    filledSlots: 4,
    payPerMember: 50,
    xpPerMember: 90,
    bonusXP: 60,
    duration: '5 hours',
    location: {
      address: '321 Industrial Rd, San Francisco, CA',
      lat: 37.7549,
      lng: -122.3994,
    },
    difficulty: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    icon: '📋',
  },
  {
    id: 'sq-5',
    title: 'Beach Cleanup Crew',
    description: 'Join a squad to clean up the beach. Make an impact while earning together!',
    category: 'Environmental',
    requiredMembers: 8,
    totalSlots: 8,
    filledSlots: 6,
    payPerMember: 30,
    xpPerMember: 70,
    bonusXP: 100,
    duration: '3 hours',
    location: {
      address: 'Ocean Beach, San Francisco, CA',
      lat: 37.7594,
      lng: -122.5107,
    },
    difficulty: 'easy',
    status: 'open',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    icon: '🏖️',
  },
];

export function getSquadQuestDifficulty(difficulty: SquadQuest['difficulty']): {
  color: string;
  label: string;
} {
  switch (difficulty) {
    case 'easy':
      return { color: '#10B981', label: 'Easy' };
    case 'medium':
      return { color: '#F59E0B', label: 'Medium' };
    case 'hard':
      return { color: '#EF4444', label: 'Hard' };
  }
}

export function calculateSquadQuestRewards(quest: SquadQuest): {
  totalPay: number;
  totalXP: number;
  payPerMember: number;
  xpPerMember: number;
} {
  return {
    totalPay: quest.payPerMember * quest.requiredMembers,
    totalXP: (quest.xpPerMember * quest.requiredMembers) + quest.bonusXP,
    payPerMember: quest.payPerMember,
    xpPerMember: quest.xpPerMember + (quest.bonusXP / quest.requiredMembers),
  };
}
