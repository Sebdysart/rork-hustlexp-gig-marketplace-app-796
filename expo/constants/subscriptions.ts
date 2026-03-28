export type SubscriptionTier = 'free' | 'pro' | 'elite';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  billingPeriod: 'month' | 'year';
  icon: string;
  color: string;
  popular?: boolean;
  features: {
    id: string;
    name: string;
    included: boolean;
    value?: string;
  }[];
  benefits: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'month',
    icon: '🆓',
    color: '#6B7280',
    features: [
      { id: 'tasks', name: 'Task Applications', included: true, value: '10/month' },
      { id: 'fee', name: 'Platform Fee', included: true, value: '12.5%' },
      { id: 'boost', name: 'XP Boost', included: false },
      { id: 'analytics', name: 'Advanced Analytics', included: false },
      { id: 'priority', name: 'Priority Support', included: false },
      { id: 'badge', name: 'Pro Badge', included: false },
      { id: 'instant', name: 'Instant Payouts', included: false },
      { id: 'promoted', name: 'Promoted Tasks', included: false },
    ],
    benefits: [
      'Access to all basic features',
      'Standard task visibility',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    billingPeriod: 'month',
    icon: '⚡',
    color: '#00FFFF',
    popular: true,
    features: [
      { id: 'tasks', name: 'Task Applications', included: true, value: 'Unlimited' },
      { id: 'fee', name: 'Platform Fee', included: true, value: '8%' },
      { id: 'boost', name: 'XP Boost', included: true, value: '+25%' },
      { id: 'analytics', name: 'Advanced Analytics', included: true },
      { id: 'priority', name: 'Priority Support', included: true },
      { id: 'badge', name: 'Pro Badge', included: true },
      { id: 'instant', name: 'Instant Payouts', included: true, value: '3 free/month' },
      { id: 'promoted', name: 'Promoted Tasks', included: false },
    ],
    benefits: [
      'Unlimited task applications',
      '35% lower platform fees',
      '25% XP boost on all tasks',
      'Advanced earnings analytics',
      'Priority customer support',
      'Exclusive Pro badge',
      '3 free instant payouts per month',
      'Early access to new features',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 24.99,
    billingPeriod: 'month',
    icon: '👑',
    color: '#FFD700',
    features: [
      { id: 'tasks', name: 'Task Applications', included: true, value: 'Unlimited' },
      { id: 'fee', name: 'Platform Fee', included: true, value: '5%' },
      { id: 'boost', name: 'XP Boost', included: true, value: '+50%' },
      { id: 'analytics', name: 'Advanced Analytics', included: true },
      { id: 'priority', name: 'Priority Support', included: true },
      { id: 'badge', name: 'Elite Badge', included: true },
      { id: 'instant', name: 'Instant Payouts', included: true, value: 'Unlimited' },
      { id: 'promoted', name: 'Promoted Tasks', included: true, value: '5/month' },
    ],
    benefits: [
      'Everything in Pro',
      '60% lower platform fees',
      '50% XP boost on all tasks',
      'Unlimited instant payouts',
      'Dedicated account manager',
      'Exclusive Elite badge',
      '5 promoted task slots per month',
      'Custom profile themes',
      'VIP event invitations',
      'Quarterly bonus rewards',
    ],
  },
];

export const ANNUAL_DISCOUNT = 0.2;

export function getAnnualPrice(monthlyPrice: number): number {
  return Math.round(monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT) * 100) / 100;
}

export function getMonthlyPriceFromAnnual(annualPrice: number): number {
  return Math.round((annualPrice / 12) * 100) / 100;
}

export function getUserSubscription(userId: string): SubscriptionTier {
  return 'free';
}

export function getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find(p => p.id === tier) || SUBSCRIPTION_PLANS[0];
}

export function calculateSavings(monthlyPrice: number): number {
  const annualTotal = monthlyPrice * 12;
  const discountedAnnual = getAnnualPrice(monthlyPrice);
  return Math.round((annualTotal - discountedAnnual) * 100) / 100;
}
