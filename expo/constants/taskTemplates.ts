import { TaskCategory } from '@/types';

export interface TaskTemplate {
  title: string;
  description: string;
  category: TaskCategory;
  suggestedPay: number;
  xpReward: number;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    title: 'Epic Clean Quest',
    description: 'Seeking a brave warrior to vanquish the dust bunnies and restore order to my dwelling!',
    category: 'cleaning',
    suggestedPay: 50,
    xpReward: 100,
  },
  {
    title: 'Delivery Mission',
    description: 'Transport precious cargo across the realm to its destination.',
    category: 'delivery',
    suggestedPay: 30,
    xpReward: 75,
  },
  {
    title: 'Food Delivery Sprint',
    description: 'Deliver delicious meals while they\'re hot! Speed and care required.',
    category: 'food_delivery',
    suggestedPay: 25,
    xpReward: 60,
  },
  {
    title: 'Errand Adventure',
    description: 'Embark on a quest to gather supplies from various merchants.',
    category: 'errands',
    suggestedPay: 25,
    xpReward: 60,
  },
  {
    title: 'Moving Expedition',
    description: 'Join forces to relocate treasures to a new stronghold.',
    category: 'moving',
    suggestedPay: 100,
    xpReward: 200,
  },
  {
    title: 'Handyman Challenge',
    description: 'Use your crafting skills to repair and restore items.',
    category: 'handyman',
    suggestedPay: 75,
    xpReward: 150,
  },
  {
    title: 'Tech Support Quest',
    description: 'Debug the mystical machines and restore their power.',
    category: 'tech',
    suggestedPay: 60,
    xpReward: 120,
  },
  {
    title: 'Creative Commission',
    description: 'Craft a masterpiece using your artistic talents.',
    category: 'creative',
    suggestedPay: 80,
    xpReward: 160,
  },
];
