import { User, Task, TaskCategory, UserRole } from '@/types';
import { BADGES } from '@/constants/badges';

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Dakota', 'Phoenix', 'Skyler', 'Rowan', 'Kai', 'Finley', 'Reese', 'Charlie', 'Blake', 'Drew'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const LOCATIONS = [
  { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
  { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
  { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
  { lat: 41.8781, lng: -87.6298, address: 'Chicago, IL' },
  { lat: 29.7604, lng: -95.3698, address: 'Houston, TX' },
  { lat: 33.4484, lng: -112.0740, address: 'Phoenix, AZ' },
  { lat: 39.7392, lng: -104.9903, address: 'Denver, CO' },
  { lat: 47.6062, lng: -122.3321, address: 'Seattle, WA' },
  { lat: 25.7617, lng: -80.1918, address: 'Miami, FL' },
  { lat: 42.3601, lng: -71.0589, address: 'Boston, MA' },
];

const BIOS = [
  'Ready to hustle and level up! 💪',
  'Quest master seeking new adventures',
  'Grinding XP one task at a time',
  'Professional problem solver',
  'Always up for a challenge',
  'Making the world a better place, one gig at a time',
  'Legendary hustler in training',
  'Your friendly neighborhood helper',
  'Chasing that next level',
  'Building my empire one quest at a time',
];

const TASK_TITLES = [
  'Epic Clean Quest',
  'Delivery Mission',
  'Errand Adventure',
  'Moving Expedition',
  'Handyman Challenge',
  'Tech Support Quest',
  'Creative Commission',
  'Garden Restoration',
  'Pet Care Mission',
  'Grocery Run Quest',
];

const TASK_DESCRIPTIONS = [
  'Seeking a brave warrior to vanquish the dust bunnies!',
  'Transport precious cargo across the realm.',
  'Embark on a quest to gather supplies.',
  'Join forces to relocate treasures.',
  'Use your crafting skills to repair items.',
  'Debug the mystical machines.',
  'Craft a masterpiece with your talents.',
  'Restore the garden to its former glory.',
  'Care for my loyal companion while I\'m away.',
  'Gather provisions from the market.',
];

function generateUser(index: number): User {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const roles: UserRole[] = ['poster', 'worker', 'both'];
  const role = roles[index % 3];
  const xp = Math.floor(Math.random() * 5000) + 100;
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const tasksCompleted = Math.floor(Math.random() * 50);
  
  const userBadges = [];
  if (tasksCompleted > 0) userBadges.push(BADGES[0]);
  if (tasksCompleted >= 10) userBadges.push(BADGES[5]);
  if (level >= 10) userBadges.push(BADGES[4]);
  if (tasksCompleted >= 25) userBadges.push(BADGES[1]);
  if (level >= 5) userBadges.push(BADGES[2]);

  const showcasedBadges = userBadges.length > 0 
    ? userBadges.slice(0, Math.min(3, userBadges.length)).map(b => b.id)
    : [];

  const isOnline = Math.random() > 0.5;
  
  return {
    id: `user-${index + 1}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hustlexp.com`,
    password: 'password123',
    role,
    name: `${firstName} ${lastName}`,
    location: LOCATIONS[index % LOCATIONS.length],
    bio: BIOS[index % BIOS.length],
    profilePic: `https://i.pravatar.cc/150?img=${index + 1}`,
    xp,
    level,
    badges: userBadges,
    showcasedBadges,
    tasksCompleted,
    earnings: tasksCompleted * 45,
    reputationScore: Math.min(5, 3 + (tasksCompleted / 20)),
    streaks: {
      current: Math.floor(Math.random() * 10),
      longest: Math.floor(Math.random() * 20),
      lastTaskDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    isOnline,
    lastSeen: isOnline ? new Date().toISOString() : new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    wallet: {
      grit: Math.floor(Math.random() * 1000),
      taskCredits: Math.floor(Math.random() * 10),
      crowns: Math.floor(Math.random() * 5),
    },
    dailyStreak: {
      count: Math.floor(Math.random() * 10),
      lastLoginDate: new Date().toISOString(),
      freezesUsed: 0,
    },
    prestige: {
      level: 0,
      totalPrestige: 0,
      permanentPayoutBoost: 0,
    },
  };
}

function generateTask(index: number, users: User[]): Task {
  const categories: TaskCategory[] = ['cleaning', 'errands', 'delivery', 'moving', 'handyman', 'tech', 'creative'];
  const category = categories[index % categories.length];
  const payAmount = Math.floor(Math.random() * 150) + 25;
  const xpReward = payAmount * 2;
  const statuses = ['open', 'open', 'open', 'in_progress', 'completed'];
  const status = statuses[index % statuses.length] as 'open' | 'in_progress' | 'completed';
  
  const poster = users.find(u => u.role === 'poster' || u.role === 'both');
  let worker: User | undefined;
  
  if (status !== 'open') {
    if (index < 5 && users.length > 0) {
      worker = users[0];
    } else {
      worker = users.find(u => (u.role === 'worker' || u.role === 'both') && u.id !== poster?.id);
    }
  }

  return {
    id: `task-${index + 1}`,
    title: TASK_TITLES[index % TASK_TITLES.length],
    description: TASK_DESCRIPTIONS[index % TASK_DESCRIPTIONS.length],
    category,
    dateTime: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: LOCATIONS[index % LOCATIONS.length],
    payType: index % 3 === 0 ? 'hourly' : 'fixed',
    payAmount,
    extras: index % 2 === 0 ? ['Tools provided', 'Parking available'] : [],
    status,
    posterId: poster?.id || 'user-1',
    workerId: worker?.id,
    xpReward,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
  };
}

export function generateSeedData() {
  const users: User[] = [];
  for (let i = 0; i < 50; i++) {
    users.push(generateUser(i));
  }

  const tasks: Task[] = [];
  for (let i = 0; i < 100; i++) {
    tasks.push(generateTask(i, users));
  }

  return { users, tasks };
}

export const { users: SEED_USERS, tasks: SEED_TASKS } = generateSeedData();
