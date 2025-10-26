export type UserRole = 'poster' | 'worker' | 'both';
export type UserMode = 'everyday' | 'tradesmen' | 'business';

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type TaskCategory = 
  | 'cleaning'
  | 'errands'
  | 'delivery'
  | 'moving'
  | 'handyman'
  | 'tech'
  | 'creative'
  | 'other'
  | 'home_repair'
  | 'babysitting'
  | 'pet_care'
  | 'tutoring'
  | 'nursing'
  | 'virtual'
  | 'ai_automation'
  | 'photography'
  | 'data_entry'
  | 'virtual_assistant'
  | 'content_creation'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'carpentry'
  | 'painting'
  | 'landscaping'
  | 'roofing'
  | 'lawn_care'
  | 'grocery_shopping'
  | 'furniture_assembly'
  | 'car_wash'
  | 'event_help'
  | 'packing'
  | 'organizing'
  | 'tech_support'
  | 'meal_prep'
  | 'laundry'
  | 'graphic_design'
  | 'video_editing'
  | 'music_lessons'
  | 'fitness_training'
  | 'massage'
  | 'hair_styling'
  | 'makeup'
  | 'tailoring';

export type PayType = 'fixed' | 'hourly';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  tier?: number;
  progress?: number;
  maxProgress?: number;
  category?: string;
  unlockedAt?: string;
}

export interface UnlockedFeature {
  featureId: string;
  unlockedAt: string;
  level: number;
  viewed: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  gamertag?: string;
  gamertagGeneratedAt?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  bio: string;
  profilePic: string;
  xp: number;
  level: number;
  badges: Badge[];
  badgeProgress?: Record<string, number>;
  showcasedBadges?: string[];
  genreTasksCompleted?: Record<string, number>;
  showcasedTrophies?: string[];
  achievements?: string[];
  tasksCompleted: number;
  speedAccepts?: number;
  maxTasksInDay?: number;
  fastResponseStreak?: number;
  perfectReviewStreak?: number;
  highTrustDays?: number;
  disputes?: number;
  categoryLeaderDays?: number;
  lifetimeGritCoins?: number;
  rankOneDays?: number;
  earnings: number;
  reputationScore: number;
  streaks: {
    current: number;
    longest: number;
    lastTaskDate: string;
  };
  createdAt: string;
  isOnline?: boolean;
  lastSeen?: string;
  isVerified?: boolean;
  verificationBadges?: VerificationBadge[];
  ratings?: Rating[];
  strikes?: Strike[];
  trustScore?: TrustScore;
  proofLinks?: ProofLink[];
  skills?: string[];
  responseTime?: number;
  rehireRate?: number;
  wallet?: {
    grit: number;
    taskCredits: number;
    crowns: number;
  };
  coins?: number;
  prestige?: {
    level: number;
    totalPrestige: number;
    permanentPayoutBoost: number;
  };
  dailyStreak?: {
    count: number;
    lastLoginDate: string;
    freezesUsed: number;
  };
  verifications?: string[];
  subscription?: 'free' | 'pro' | 'elite';
  tradesmanProfile?: {
    isPro: boolean;
    trades: string[];
    primaryTrade?: string;
    certifications: any[];
    tradeXP: Record<string, number>;
    currentBadges: Record<string, string>;
    hourlyRate?: number;
    availableNow: boolean;
    responseTime?: number;
    completedJobs: number;
    toolInventory: string[];
    portfolio: any[];
    businessMetrics: {
      totalEarnings: number;
      repeatClients: number;
      averageJobValue: number;
      onTimeCompletion: number;
    };
  };
  availabilityStatus?: 'offline' | 'online' | 'available_now' | 'busy';
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
  unlockedFeatures?: UnlockedFeature[];
  posterProfile?: {
    trustXP: number;
    totalSpent: number;
    tasksPosted: number;
    avgRating: number;
    badges: string[];
    reliabilityScore: number;
  };
  activeMode?: UserMode;
  modesUnlocked?: UserMode[];
}

export interface VerificationBadge {
  id: string;
  type: 'id' | 'email' | 'phone' | 'background';
  verifiedAt: string;
}

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  taskId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface Strike {
  id: string;
  userId: string;
  reason: string;
  reportId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dateTime?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  payType?: PayType;
  payAmount: number;
  extras?: string[];
  status: TaskStatus;
  posterId: string;
  workerId?: string;
  xpReward: number;
  createdAt: string;
  completedAt?: string;
  urgency?: 'today' | '48h' | 'flexible';
  proofRequired?: boolean;
  distance?: number;
  aiTags?: string[];
  rewardClaimed?: boolean;
  estimatedDuration?: string;
  requiredSkills?: string[];
}

export interface Message {
  id: string;
  taskId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isHustleAI?: boolean;
  taskOffer?: {
    taskId: string;
    title: string;
    pay: number;
    distance: number;
    estimatedTime: string;
    category: string;
    skillMatch: number;
  };
  offerStatus?: 'pending' | 'accepted' | 'declined' | 'snoozed';
}

export type NotificationType = 'quest_new' | 'quest_accepted' | 'quest_completed' | 'message_new' | 'level_up' | 'badge_earned' | 'feature_unlocked';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  profilePic: string;
  xp: number;
  level: number;
  tasksCompleted: number;
  rank: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  taskId?: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  effect: {
    type: 'xp_boost' | 'earnings_boost' | 'streak_freeze' | 'priority_listing';
    value: number;
    duration?: number;
  };
}

export interface Purchase {
  id: string;
  userId: string;
  powerUpId: string;
  price: number;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ActivePowerUp {
  powerUpId: string;
  activatedAt: string;
  expiresAt: string;
}

export interface TrustScore {
  overall: number;
  completion: number;
  timeliness: number;
  proofQuality: number;
  responseSpeed: number;
  rehireRate: number;
  disputes: number;
  tier: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  nextMilestone?: {
    score: number;
    action: string;
    impact: string;
  };
}

export interface ProofLink {
  id: string;
  userId: string;
  taskId?: string;
  category: TaskCategory;
  type: 'photo' | 'video' | 'receipt';
  url: string;
  thumbnail?: string;
  tags: string[];
  verified: boolean;
  createdAt: string;
  description?: string;
}

export interface WalletData {
  available: number;
  pending: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
  weeklyHistory: number[];
  grit: number;
  taskCredits: number;
  crowns: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  expiresAt: string;
}

export type QuestType = 'daily' | 'weekly' | 'seasonal' | 'ai';
export type QuestCategory = 'engagement' | 'completion' | 'social' | 'streak' | 'skill';

export interface Quest {
  id: string;
  type: QuestType;
  category: QuestCategory;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  rewards: {
    grit?: number;
    taskCredits?: number;
    xp?: number;
    badge?: string;
  };
  expiresAt: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  completedAt?: string;
}

export type SquadStatus = 'recruiting' | 'active' | 'on_project' | 'inactive';
export type SquadMemberRole = 'leader' | 'co_leader' | 'member';
export type SquadInviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface SquadMember {
  userId: string;
  role: SquadMemberRole;
  trade?: string;
  joinedAt: string;
  contribution: {
    tasksCompleted: number;
    xpEarned: number;
    earningsGenerated: number;
  };
}

export interface SquadInvite {
  id: string;
  squadId: string;
  inviterId: string;
  inviteeId: string;
  status: SquadInviteStatus;
  message?: string;
  createdAt: string;
  expiresAt: string;
}

export interface SquadBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  xpRequired: number;
  color: string;
  unlockedAt?: string;
}

export interface Squad {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: SquadMember[];
  status: SquadStatus;
  maxMembers: number;
  requiredTrades?: string[];
  emblem: {
    icon: string;
    color: string;
    pattern: string;
  };
  stats: {
    totalEarnings: number;
    totalXP: number;
    tasksCompleted: number;
    averageRating: number;
    projectsCompleted: number;
  };
  badges: SquadBadge[];
  currentProject?: {
    taskId: string;
    title: string;
    location: { lat: number; lng: number; address: string };
    startedAt: string;
    estimatedCompletion: string;
  };
  createdAt: string;
  avatar?: string;
  isPublic: boolean;
  tags: string[];
}

export interface WorkroomStatus {
  taskId: string;
  status: 'on_the_way' | 'on_site' | 'in_progress' | 'proof_ready' | 'completed';
  checkInTime?: string;
  checkOutTime?: string;
  gpsLocation?: { lat: number; lng: number };
  proofPhotos?: string[];
  notes?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  taskId: string;
  addedAt: string;
  originalPay: number;
  notifyOnPriceChange: boolean;
}

export interface PriceAlert {
  id: string;
  userId: string;
  taskId: string;
  originalPay: number;
  newPay: number;
  changePercent: number;
  createdAt: string;
  read: boolean;
}

export type TaskLifecycleStatus = 'pending_start' | 'scheduled' | 'active' | 'paused' | 'verification' | 'completed' | 'disputed';

export interface TaskSubtask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  estimatedDuration?: number;
}

export interface TaskProgress {
  taskId: string;
  status: TaskLifecycleStatus;
  startedAt?: string;
  scheduledFor?: string;
  subtasks: TaskSubtask[];
  currentSubtaskIndex: number;
  totalTimeSpent: number;
  lastActiveAt?: string;
  pausedAt?: string;
  checkpoints: TaskCheckpoint[];
}

export interface TaskCheckpoint {
  id: string;
  day: number;
  title: string;
  completed: boolean;
  completedAt?: string;
  partialPayout?: number;
  notes?: string;
}

export interface TaskVerification {
  taskId: string;
  proofType: 'photo' | 'video' | 'text' | 'mixed';
  proofData: TaskProof[];
  aiVerificationStatus: 'pending' | 'verifying' | 'verified' | 'rejected';
  aiConfidence?: number;
  aiNotes?: string;
  submittedAt: string;
  verifiedAt?: string;
}

export interface TaskProof {
  id: string;
  type: 'photo' | 'video' | 'text';
  url?: string;
  text?: string;
  thumbnail?: string;
  timestamp: string;
}

export interface TaskCompletion {
  taskId: string;
  completedAt: string;
  totalDuration: string;
  accuracyScore: number;
  xpGained: number;
  paymentAmount: number;
  bonusXP?: number;
  bonusPayment?: number;
  posterRating?: number;
  posterReview?: string;
  workerNotes?: string;
}

export interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  recommended: boolean;
  reason?: string;
}

export type OfferTierId = 'starter' | 'standard' | 'pro' | `custom_${string}`;

export interface OfferAddOn {
  id: string;
  name: string;
  priceUsd: number;
}

export interface OfferTier {
  id: OfferTierId;
  name: string;
  priceUsd: number;
  deliveryDays: number;
  revisions: number;
  scope: string;
  addOns?: OfferAddOn[];
}

export interface OfferMedia {
  id: string;
  type: 'image' | 'video';
  uri: string;
  cover?: boolean;
}

export interface OfferAvailability {
  day: number;
  start: string;
  end: string;
}

export type OfferStatus = 'draft' | 'published' | 'paused';

export interface OfferDraft {
  offerId: string;
  userId: string;
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  tags: string[];
  tiers: OfferTier[];
  media: OfferMedia[];
  baseZip: string;
  radiusMiles: number;
  onsite: boolean;
  availability?: OfferAvailability[];
  status: OfferStatus;
  kycTierAtPublish?: 'Basic' | 'Verified' | 'Pro';
  promoText?: string;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  matchCount?: number;
}

export interface OfferLimits {
  maxActiveOffers: number;
  maxMedia: number;
  maxRadiusMiles: number;
  canAddRushDelivery: boolean;
  canAddAddOns: boolean;
  platformFeePercent: number;
}

export interface ModeStats {
  everyday: number;
  tradesmen: number;
  business: number;
  totalSwitches: number;
  preferredMode: UserMode;
}

export interface RoleStats {
  isDualRole: boolean;
  totalEarnings: number;
  totalSpent: number;
  tasksCompleted: number;
  tasksPosted: number;
  modeStats?: ModeStats;
  lastModeSwitch?: string;
}
