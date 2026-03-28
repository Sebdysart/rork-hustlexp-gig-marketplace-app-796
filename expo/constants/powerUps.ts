import { PowerUp } from '@/types';

export const POWER_UPS: PowerUp[] = [
  {
    id: 'xp-boost-24h',
    name: '2x XP Boost',
    description: 'Double your XP earnings for 24 hours',
    icon: '⚡',
    price: 4.99,
    effect: {
      type: 'xp_boost',
      value: 2,
      duration: 24,
    },
  },
  {
    id: 'earnings-boost-24h',
    name: '1.5x Earnings Boost',
    description: 'Increase your earnings by 50% for 24 hours',
    icon: '💰',
    price: 4.99,
    effect: {
      type: 'earnings_boost',
      value: 1.5,
      duration: 24,
    },
  },
  {
    id: 'streak-freeze',
    name: 'Streak Freeze',
    description: 'Protect your streak for 7 days',
    icon: '🛡️',
    price: 2.99,
    effect: {
      type: 'streak_freeze',
      value: 1,
      duration: 168,
    },
  },
  {
    id: 'priority-listing-7d',
    name: 'Priority Listing',
    description: 'Your tasks appear at the top for 7 days',
    icon: '🚀',
    price: 9.99,
    effect: {
      type: 'priority_listing',
      value: 1,
      duration: 168,
    },
  },
  {
    id: 'xp-boost-7d',
    name: '2x XP Boost (7 Days)',
    description: 'Double your XP earnings for a full week',
    icon: '⚡',
    price: 19.99,
    effect: {
      type: 'xp_boost',
      value: 2,
      duration: 168,
    },
  },
  {
    id: 'earnings-boost-7d',
    name: '1.5x Earnings Boost (7 Days)',
    description: 'Increase your earnings by 50% for a full week',
    icon: '💰',
    price: 19.99,
    effect: {
      type: 'earnings_boost',
      value: 1.5,
      duration: 168,
    },
  },
];
