export interface KYCTier {
  id: string;
  name: string;
  level: number;
  icon: string;
  color: string;
  description: string;
  benefits: string[];
  requirements: KYCRequirement[];
  maxTaskValue: number;
  trustScoreBonus: number;
  badgeIcon: string;
}

export interface KYCRequirement {
  id: string;
  name: string;
  description: string;
  icon: string;
  completed: boolean;
  required: boolean;
}

export const KYC_TIERS: KYCTier[] = [
  {
    id: 'unverified',
    name: 'Unverified',
    level: 0,
    icon: '👤',
    color: '#6B7280',
    description: 'Basic account with limited access',
    benefits: [
      'Browse available tasks',
      'View user profiles',
      'Access to community features',
    ],
    requirements: [],
    maxTaskValue: 0,
    trustScoreBonus: 0,
    badgeIcon: '🔒',
  },
  {
    id: 'lite',
    name: 'Lite Verified',
    level: 1,
    icon: '✉️',
    color: '#10B981',
    description: 'Email and phone verified - ready to start hustling',
    benefits: [
      'Accept tasks up to $50',
      'Post unlimited tasks',
      'Send and receive messages',
      'Earn XP and badges',
      '+10 Trust Score',
    ],
    requirements: [
      {
        id: 'email',
        name: 'Email Verification',
        description: 'Verify your email address',
        icon: '📧',
        completed: false,
        required: true,
      },
      {
        id: 'phone',
        name: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        icon: '📱',
        completed: false,
        required: true,
      },
    ],
    maxTaskValue: 50,
    trustScoreBonus: 10,
    badgeIcon: '✅',
  },
  {
    id: 'standard',
    name: 'Standard Verified',
    level: 2,
    icon: '🆔',
    color: '#3B82F6',
    description: 'ID verified - trusted member of the community',
    benefits: [
      'Accept tasks up to $200',
      'Priority in search results',
      'Verified badge on profile',
      'Access to premium tasks',
      '+25 Trust Score',
      'Lower platform fees (10%)',
    ],
    requirements: [
      {
        id: 'email',
        name: 'Email Verification',
        description: 'Verify your email address',
        icon: '📧',
        completed: false,
        required: true,
      },
      {
        id: 'phone',
        name: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        icon: '📱',
        completed: false,
        required: true,
      },
      {
        id: 'id',
        name: 'Government ID',
        description: 'Upload a valid government-issued ID',
        icon: '🪪',
        completed: false,
        required: true,
      },
      {
        id: 'selfie',
        name: 'Selfie Verification',
        description: 'Take a selfie to match your ID',
        icon: '🤳',
        completed: false,
        required: true,
      },
    ],
    maxTaskValue: 200,
    trustScoreBonus: 25,
    badgeIcon: '🔷',
  },
  {
    id: 'premium',
    name: 'Premium Verified',
    level: 3,
    icon: '⭐',
    color: '#F59E0B',
    description: 'Background checked - elite hustler status',
    benefits: [
      'Accept tasks up to $1,000',
      'Featured in search results',
      'Premium badge on profile',
      'Access to high-value tasks',
      '+50 Trust Score',
      'Lowest platform fees (8%)',
      'Priority customer support',
      'Early access to new features',
    ],
    requirements: [
      {
        id: 'email',
        name: 'Email Verification',
        description: 'Verify your email address',
        icon: '📧',
        completed: false,
        required: true,
      },
      {
        id: 'phone',
        name: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        icon: '📱',
        completed: false,
        required: true,
      },
      {
        id: 'id',
        name: 'Government ID',
        description: 'Upload a valid government-issued ID',
        icon: '🪪',
        completed: false,
        required: true,
      },
      {
        id: 'selfie',
        name: 'Selfie Verification',
        description: 'Take a selfie to match your ID',
        icon: '🤳',
        completed: false,
        required: true,
      },
      {
        id: 'background',
        name: 'Background Check',
        description: 'Complete a third-party background check',
        icon: '🔍',
        completed: false,
        required: true,
      },
      {
        id: 'address',
        name: 'Address Verification',
        description: 'Verify your residential address',
        icon: '🏠',
        completed: false,
        required: true,
      },
    ],
    maxTaskValue: 1000,
    trustScoreBonus: 50,
    badgeIcon: '⭐',
  },
  {
    id: 'elite',
    name: 'Elite Verified',
    level: 4,
    icon: '👑',
    color: '#8B5CF6',
    description: 'Fully verified - legendary status unlocked',
    benefits: [
      'Unlimited task value',
      'Top placement in all searches',
      'Elite badge with glow effect',
      'Access to exclusive tasks',
      '+100 Trust Score',
      'No platform fees',
      'Dedicated account manager',
      'Custom profile themes',
      'Invitation to exclusive events',
    ],
    requirements: [
      {
        id: 'email',
        name: 'Email Verification',
        description: 'Verify your email address',
        icon: '📧',
        completed: false,
        required: true,
      },
      {
        id: 'phone',
        name: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        icon: '📱',
        completed: false,
        required: true,
      },
      {
        id: 'id',
        name: 'Government ID',
        description: 'Upload a valid government-issued ID',
        icon: '🪪',
        completed: false,
        required: true,
      },
      {
        id: 'selfie',
        name: 'Selfie Verification',
        description: 'Take a selfie to match your ID',
        icon: '🤳',
        completed: false,
        required: true,
      },
      {
        id: 'background',
        name: 'Background Check',
        description: 'Complete a third-party background check',
        icon: '🔍',
        completed: false,
        required: true,
      },
      {
        id: 'address',
        name: 'Address Verification',
        description: 'Verify your residential address',
        icon: '🏠',
        completed: false,
        required: true,
      },
      {
        id: 'business',
        name: 'Business License',
        description: 'Upload business license or professional certification',
        icon: '📜',
        completed: false,
        required: false,
      },
      {
        id: 'insurance',
        name: 'Insurance Proof',
        description: 'Provide proof of liability insurance',
        icon: '🛡️',
        completed: false,
        required: false,
      },
    ],
    maxTaskValue: Infinity,
    trustScoreBonus: 100,
    badgeIcon: '👑',
  },
];

export function getUserKYCTier(verifications: string[]): KYCTier {
  const completedSet = new Set(verifications);
  
  for (let i = KYC_TIERS.length - 1; i >= 0; i--) {
    const tier = KYC_TIERS[i];
    const requiredChecks = tier.requirements.filter(r => r.required);
    const allRequiredCompleted = requiredChecks.every(r => completedSet.has(r.id));
    
    if (allRequiredCompleted) {
      return tier;
    }
  }
  
  return KYC_TIERS[0];
}

export function getNextKYCTier(currentTier: KYCTier): KYCTier | null {
  const currentIndex = KYC_TIERS.findIndex(t => t.id === currentTier.id);
  if (currentIndex === -1 || currentIndex === KYC_TIERS.length - 1) {
    return null;
  }
  return KYC_TIERS[currentIndex + 1];
}

export function getKYCProgress(verifications: string[], targetTier: KYCTier): number {
  const requiredChecks = targetTier.requirements.filter(r => r.required);
  if (requiredChecks.length === 0) return 100;
  
  const completedSet = new Set(verifications);
  const completed = requiredChecks.filter(r => completedSet.has(r.id)).length;
  
  return (completed / requiredChecks.length) * 100;
}
