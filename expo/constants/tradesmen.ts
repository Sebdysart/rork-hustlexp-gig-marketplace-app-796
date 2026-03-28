export type TradeCategory = 
  | 'electrician'
  | 'plumber'
  | 'hvac'
  | 'mechanic'
  | 'landscaper'
  | 'carpenter'
  | 'painter'
  | 'roofer'
  | 'mason'
  | 'welder';

export type TradeBadgeLevel = 'copper' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface TradeBadge {
  id: string;
  trade: TradeCategory;
  level: TradeBadgeLevel;
  name: string;
  description: string;
  xpRequired: number;
  icon: string;
  color: string;
  metalTexture: string;
  unlockEffects: string[];
  animationType: 'forge' | 'spark' | 'glow' | 'rotate';
}

export interface TradeInfo {
  id: TradeCategory;
  name: string;
  icon: string;
  description: string;
  baseHourlyRate: number;
  badges: TradeBadge[];
  requiredCertifications?: string[];
  toolsRequired?: string[];
  color: string;
}

export const TRADE_BADGE_PROGRESSIONS: Record<TradeCategory, TradeBadge[]> = {
  electrician: [
    {
      id: 'elec_copper',
      trade: 'electrician',
      level: 'copper',
      name: 'Copper Wire',
      description: 'Starting your electrical journey',
      xpRequired: 0,
      icon: '⚡',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Access to basic electrical tasks'],
      animationType: 'spark',
    },
    {
      id: 'elec_silver',
      trade: 'electrician',
      level: 'silver',
      name: 'Silver Circuit',
      description: 'Proven electrical skills',
      xpRequired: 1000,
      icon: '⚡',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Access to intermediate tasks', '+10% XP bonus'],
      animationType: 'spark',
    },
    {
      id: 'elec_gold',
      trade: 'electrician',
      level: 'gold',
      name: 'Gold Conductor',
      description: 'Master electrician status',
      xpRequired: 5000,
      icon: '⚡',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Access to Pro Power tasks', '+25% XP bonus', 'Priority listings'],
      animationType: 'glow',
    },
    {
      id: 'elec_platinum',
      trade: 'electrician',
      level: 'platinum',
      name: 'Platinum Grid',
      description: 'Elite electrical engineer',
      xpRequired: 15000,
      icon: '⚡',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Highest-paying tasks', '+50% XP bonus', 'Auto-priority booking'],
      animationType: 'forge',
    },
    {
      id: 'elec_diamond',
      trade: 'electrician',
      level: 'diamond',
      name: 'Diamond Voltage',
      description: 'Legendary electrical mastery',
      xpRequired: 50000,
      icon: '⚡',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Exclusive enterprise contracts', '+100% XP bonus', 'Squad leader status'],
      animationType: 'forge',
    },
  ],
  plumber: [
    {
      id: 'plumb_copper',
      trade: 'plumber',
      level: 'copper',
      name: 'Pipe Novice',
      description: 'Learning the flow',
      xpRequired: 0,
      icon: '🔧',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Access to basic plumbing tasks'],
      animationType: 'rotate',
    },
    {
      id: 'plumb_silver',
      trade: 'plumber',
      level: 'silver',
      name: 'Pipe Master',
      description: 'Skilled in all pipe systems',
      xpRequired: 1000,
      icon: '🔧',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Premium listings', '+10% XP bonus'],
      animationType: 'rotate',
    },
    {
      id: 'plumb_gold',
      trade: 'plumber',
      level: 'gold',
      name: 'Flow Engineer',
      description: 'Expert plumbing engineer',
      xpRequired: 5000,
      icon: '🔧',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Advanced task filters', '+25% XP bonus', 'Priority search'],
      animationType: 'glow',
    },
    {
      id: 'plumb_platinum',
      trade: 'plumber',
      level: 'platinum',
      name: 'Hydro Chief',
      description: 'Master of water systems',
      xpRequired: 15000,
      icon: '🔧',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Commercial contracts', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'plumb_diamond',
      trade: 'plumber',
      level: 'diamond',
      name: 'Aqua Legend',
      description: 'Legendary plumbing mastery',
      xpRequired: 50000,
      icon: '🔧',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Enterprise systems', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
  hvac: [
    {
      id: 'hvac_copper',
      trade: 'hvac',
      level: 'copper',
      name: 'Air Apprentice',
      description: 'Starting climate control',
      xpRequired: 0,
      icon: '❄️',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Basic HVAC tasks'],
      animationType: 'glow',
    },
    {
      id: 'hvac_silver',
      trade: 'hvac',
      level: 'silver',
      name: 'Cool Tech',
      description: 'Skilled climate technician',
      xpRequired: 1000,
      icon: '❄️',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Auto-priority bookings', '+10% XP bonus'],
      animationType: 'glow',
    },
    {
      id: 'hvac_gold',
      trade: 'hvac',
      level: 'gold',
      name: 'Thermal Chief',
      description: 'Master HVAC engineer',
      xpRequired: 5000,
      icon: '❄️',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Commercial systems', '+25% XP bonus', 'Instant booking priority'],
      animationType: 'spark',
    },
    {
      id: 'hvac_platinum',
      trade: 'hvac',
      level: 'platinum',
      name: 'Climate Commander',
      description: 'Elite climate control expert',
      xpRequired: 15000,
      icon: '❄️',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Industrial contracts', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'hvac_diamond',
      trade: 'hvac',
      level: 'diamond',
      name: 'Atmosphere Architect',
      description: 'Legendary HVAC mastery',
      xpRequired: 50000,
      icon: '❄️',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Enterprise climate systems', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
  mechanic: [
    {
      id: 'mech_copper',
      trade: 'mechanic',
      level: 'copper',
      name: 'Wrench Rookie',
      description: 'Starting your mechanic journey',
      xpRequired: 0,
      icon: '🔩',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Basic auto repair tasks'],
      animationType: 'rotate',
    },
    {
      id: 'mech_silver',
      trade: 'mechanic',
      level: 'silver',
      name: 'Garage Pro',
      description: 'Skilled automotive technician',
      xpRequired: 1000,
      icon: '🔩',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Boosted search ranking', '+10% XP bonus'],
      animationType: 'rotate',
    },
    {
      id: 'mech_gold',
      trade: 'mechanic',
      level: 'gold',
      name: 'Auto Chief',
      description: 'Master mechanic status',
      xpRequired: 5000,
      icon: '🔩',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Advanced diagnostics', '+25% XP bonus', 'Top search results'],
      animationType: 'spark',
    },
    {
      id: 'mech_platinum',
      trade: 'mechanic',
      level: 'platinum',
      name: 'Engine Virtuoso',
      description: 'Elite automotive engineer',
      xpRequired: 15000,
      icon: '🔩',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Performance tuning', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'mech_diamond',
      trade: 'mechanic',
      level: 'diamond',
      name: 'Motor Legend',
      description: 'Legendary mechanic mastery',
      xpRequired: 50000,
      icon: '🔩',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Exotic vehicle specialist', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
  landscaper: [
    {
      id: 'land_copper',
      trade: 'landscaper',
      level: 'copper',
      name: 'Grass Grunt',
      description: 'Starting outdoor work',
      xpRequired: 0,
      icon: '🌱',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Basic landscaping tasks'],
      animationType: 'glow',
    },
    {
      id: 'land_silver',
      trade: 'landscaper',
      level: 'silver',
      name: 'Garden Guru',
      description: 'Skilled landscaper',
      xpRequired: 1000,
      icon: '🌱',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Squad Projects access', '+10% XP bonus'],
      animationType: 'glow',
    },
    {
      id: 'land_gold',
      trade: 'landscaper',
      level: 'gold',
      name: 'Eco Expert',
      description: 'Master landscaper',
      xpRequired: 5000,
      icon: '🌱',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Multi-hustler yard tasks', '+25% XP bonus', 'Design projects'],
      animationType: 'spark',
    },
    {
      id: 'land_platinum',
      trade: 'landscaper',
      level: 'platinum',
      name: 'Nature Architect',
      description: 'Elite landscape designer',
      xpRequired: 15000,
      icon: '🌱',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Commercial landscaping', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'land_diamond',
      trade: 'landscaper',
      level: 'diamond',
      name: 'Eden Creator',
      description: 'Legendary landscape mastery',
      xpRequired: 50000,
      icon: '🌱',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Estate design', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
  carpenter: [
    {
      id: 'carp_copper',
      trade: 'carpenter',
      level: 'copper',
      name: 'Wood Apprentice',
      description: 'Learning the craft',
      xpRequired: 0,
      icon: '🪚',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Basic carpentry tasks'],
      animationType: 'rotate',
    },
    {
      id: 'carp_silver',
      trade: 'carpenter',
      level: 'silver',
      name: 'Frame Master',
      description: 'Skilled carpenter',
      xpRequired: 1000,
      icon: '🪚',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Custom builds', '+10% XP bonus'],
      animationType: 'rotate',
    },
    {
      id: 'carp_gold',
      trade: 'carpenter',
      level: 'gold',
      name: 'Timber Chief',
      description: 'Master carpenter',
      xpRequired: 5000,
      icon: '🪚',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Fine woodworking', '+25% XP bonus'],
      animationType: 'spark',
    },
    {
      id: 'carp_platinum',
      trade: 'carpenter',
      level: 'platinum',
      name: 'Craft Virtuoso',
      description: 'Elite woodworker',
      xpRequired: 15000,
      icon: '🪚',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Custom furniture', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'carp_diamond',
      trade: 'carpenter',
      level: 'diamond',
      name: 'Wood Legend',
      description: 'Legendary carpentry mastery',
      xpRequired: 50000,
      icon: '🪚',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Architectural millwork', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
  painter: [
    {
      id: 'paint_copper',
      trade: 'painter',
      level: 'copper',
      name: 'Brush Beginner',
      description: 'Starting to paint',
      xpRequired: 0,
      icon: '🎨',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Basic painting tasks'],
      animationType: 'glow',
    },
    {
      id: 'paint_silver',
      trade: 'painter',
      level: 'silver',
      name: 'Color Craftsman',
      description: 'Skilled painter',
      xpRequired: 1000,
      icon: '🎨',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Interior/exterior work', '+10% XP bonus'],
      animationType: 'glow',
    },
    {
      id: 'paint_gold',
      trade: 'painter',
      level: 'gold',
      name: 'Finish Master',
      description: 'Master painter',
      xpRequired: 5000,
      icon: '🎨',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Specialty finishes', '+25% XP bonus'],
      animationType: 'spark',
    },
    {
      id: 'paint_platinum',
      trade: 'painter',
      level: 'platinum',
      name: 'Coating Virtuoso',
      description: 'Elite painting specialist',
      xpRequired: 15000,
      icon: '🎨',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Commercial projects', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'paint_diamond',
      trade: 'painter',
      level: 'diamond',
      name: 'Pigment Legend',
      description: 'Legendary painting mastery',
      xpRequired: 50000,
      icon: '🎨',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Restoration work', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
  roofer: [
    {
      id: 'roof_copper',
      trade: 'roofer',
      level: 'copper',
      name: 'Shingle Starter',
      description: 'Learning roofing basics',
      xpRequired: 0,
      icon: '🏠',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Basic roofing tasks'],
      animationType: 'rotate',
    },
    {
      id: 'roof_silver',
      trade: 'roofer',
      level: 'silver',
      name: 'Peak Pro',
      description: 'Skilled roofer',
      xpRequired: 1000,
      icon: '🏠',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Repair & replacement', '+10% XP bonus'],
      animationType: 'rotate',
    },
    {
      id: 'roof_gold',
      trade: 'roofer',
      level: 'gold',
      name: 'Ridge Master',
      description: 'Master roofer',
      xpRequired: 5000,
      icon: '🏠',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Commercial roofing', '+25% XP bonus'],
      animationType: 'spark',
    },
    {
      id: 'roof_platinum',
      trade: 'roofer',
      level: 'platinum',
      name: 'Summit Chief',
      description: 'Elite roofing specialist',
      xpRequired: 15000,
      icon: '🏠',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Industrial roofing', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'roof_diamond',
      trade: 'roofer',
      level: 'diamond',
      name: 'Apex Legend',
      description: 'Legendary roofing mastery',
      xpRequired: 50000,
      icon: '🏠',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Specialty systems', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
  mason: [
    {
      id: 'mason_copper',
      trade: 'mason',
      level: 'copper',
      name: 'Brick Beginner',
      description: 'Starting masonry work',
      xpRequired: 0,
      icon: '🧱',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Basic masonry tasks'],
      animationType: 'rotate',
    },
    {
      id: 'mason_silver',
      trade: 'mason',
      level: 'silver',
      name: 'Stone Craftsman',
      description: 'Skilled mason',
      xpRequired: 1000,
      icon: '🧱',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['Stonework & brick', '+10% XP bonus'],
      animationType: 'rotate',
    },
    {
      id: 'mason_gold',
      trade: 'mason',
      level: 'gold',
      name: 'Foundation Master',
      description: 'Master mason',
      xpRequired: 5000,
      icon: '🧱',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Structural work', '+25% XP bonus'],
      animationType: 'spark',
    },
    {
      id: 'mason_platinum',
      trade: 'mason',
      level: 'platinum',
      name: 'Mortar Virtuoso',
      description: 'Elite masonry specialist',
      xpRequired: 15000,
      icon: '🧱',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Commercial construction', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'mason_diamond',
      trade: 'mason',
      level: 'diamond',
      name: 'Stone Legend',
      description: 'Legendary masonry mastery',
      xpRequired: 50000,
      icon: '🧱',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Architectural masonry', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
  welder: [
    {
      id: 'weld_copper',
      trade: 'welder',
      level: 'copper',
      name: 'Arc Apprentice',
      description: 'Learning to weld',
      xpRequired: 0,
      icon: '🔥',
      color: '#B87333',
      metalTexture: 'copper',
      unlockEffects: ['Basic welding tasks'],
      animationType: 'spark',
    },
    {
      id: 'weld_silver',
      trade: 'welder',
      level: 'silver',
      name: 'Torch Tech',
      description: 'Skilled welder',
      xpRequired: 1000,
      icon: '🔥',
      color: '#C0C0C0',
      metalTexture: 'silver',
      unlockEffects: ['MIG/TIG welding', '+10% XP bonus'],
      animationType: 'spark',
    },
    {
      id: 'weld_gold',
      trade: 'welder',
      level: 'gold',
      name: 'Fusion Master',
      description: 'Master welder',
      xpRequired: 5000,
      icon: '🔥',
      color: '#FFD700',
      metalTexture: 'gold',
      unlockEffects: ['Specialty welding', '+25% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'weld_platinum',
      trade: 'welder',
      level: 'platinum',
      name: 'Metal Virtuoso',
      description: 'Elite welding specialist',
      xpRequired: 15000,
      icon: '🔥',
      color: '#E5E4E2',
      metalTexture: 'platinum',
      unlockEffects: ['Industrial welding', '+50% XP bonus'],
      animationType: 'forge',
    },
    {
      id: 'weld_diamond',
      trade: 'welder',
      level: 'diamond',
      name: 'Forge Legend',
      description: 'Legendary welding mastery',
      xpRequired: 50000,
      icon: '🔥',
      color: '#B9F2FF',
      metalTexture: 'diamond',
      unlockEffects: ['Exotic metal fabrication', '+100% XP bonus'],
      animationType: 'forge',
    },
  ],
};

export const TRADES: TradeInfo[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    icon: '⚡',
    description: 'Electrical installation, repair, and maintenance',
    baseHourlyRate: 75,
    badges: TRADE_BADGE_PROGRESSIONS.electrician,
    requiredCertifications: ['Journeyman License', 'Master Electrician'],
    toolsRequired: ['Multimeter', 'Wire strippers', 'Voltage tester'],
    color: '#FFD700',
  },
  {
    id: 'plumber',
    name: 'Plumber',
    icon: '🔧',
    description: 'Plumbing installation, repair, and maintenance',
    baseHourlyRate: 70,
    badges: TRADE_BADGE_PROGRESSIONS.plumber,
    requiredCertifications: ['Plumbing License'],
    toolsRequired: ['Pipe wrench', 'Torch', 'Snake'],
    color: '#4A90E2',
  },
  {
    id: 'hvac',
    name: 'HVAC Technician',
    icon: '❄️',
    description: 'Heating, ventilation, and air conditioning',
    baseHourlyRate: 80,
    badges: TRADE_BADGE_PROGRESSIONS.hvac,
    requiredCertifications: ['EPA 608 Certification', 'HVAC License'],
    toolsRequired: ['Manifold gauge', 'Vacuum pump', 'Recovery machine'],
    color: '#00CED1',
  },
  {
    id: 'mechanic',
    name: 'Mechanic',
    icon: '🔩',
    description: 'Automotive repair and maintenance',
    baseHourlyRate: 65,
    badges: TRADE_BADGE_PROGRESSIONS.mechanic,
    requiredCertifications: ['ASE Certification'],
    toolsRequired: ['Socket set', 'Diagnostic scanner', 'Jack stands'],
    color: '#FF6B6B',
  },
  {
    id: 'landscaper',
    name: 'Landscaper',
    icon: '🌱',
    description: 'Landscape design, installation, and maintenance',
    baseHourlyRate: 50,
    badges: TRADE_BADGE_PROGRESSIONS.landscaper,
    toolsRequired: ['Mower', 'Trimmer', 'Blower'],
    color: '#4CAF50',
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    icon: '🪚',
    description: 'Woodworking, framing, and finish carpentry',
    baseHourlyRate: 60,
    badges: TRADE_BADGE_PROGRESSIONS.carpenter,
    toolsRequired: ['Circular saw', 'Level', 'Nail gun'],
    color: '#8B4513',
  },
  {
    id: 'painter',
    name: 'Painter',
    icon: '🎨',
    description: 'Interior and exterior painting',
    baseHourlyRate: 45,
    badges: TRADE_BADGE_PROGRESSIONS.painter,
    toolsRequired: ['Brushes', 'Rollers', 'Sprayer'],
    color: '#9C27B0',
  },
  {
    id: 'roofer',
    name: 'Roofer',
    icon: '🏠',
    description: 'Roof installation, repair, and maintenance',
    baseHourlyRate: 55,
    badges: TRADE_BADGE_PROGRESSIONS.roofer,
    toolsRequired: ['Nail gun', 'Harness', 'Shingle cutter'],
    color: '#795548',
  },
  {
    id: 'mason',
    name: 'Mason',
    icon: '🧱',
    description: 'Brick, stone, and concrete work',
    baseHourlyRate: 65,
    badges: TRADE_BADGE_PROGRESSIONS.mason,
    toolsRequired: ['Trowel', 'Level', 'Mixer'],
    color: '#607D8B',
  },
  {
    id: 'welder',
    name: 'Welder',
    icon: '🔥',
    description: 'Metal fabrication and welding',
    baseHourlyRate: 70,
    badges: TRADE_BADGE_PROGRESSIONS.welder,
    requiredCertifications: ['AWS Certification'],
    toolsRequired: ['Welding machine', 'Helmet', 'Grinder'],
    color: '#FF9800',
  },
];

export interface CertificationDocument {
  id: string;
  type: 'license' | 'certification' | 'insurance' | 'bond';
  name: string;
  issuer: string;
  number: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl?: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface TradesmanProfile {
  userId: string;
  isPro: boolean;
  trades: TradeCategory[];
  primaryTrade: TradeCategory;
  certifications: CertificationDocument[];
  tradeXP: Record<TradeCategory, number>;
  currentBadges: Record<TradeCategory, TradeBadgeLevel>;
  hourlyRate: number;
  availableNow: boolean;
  responseTime: number;
  completedJobs: number;
  rating: number;
  toolInventory: string[];
  portfolio: PortfolioItem[];
  businessMetrics: {
    totalEarnings: number;
    repeatClients: number;
    averageJobValue: number;
    onTimeCompletion: number;
  };
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  trade: TradeCategory;
  beforeImages: string[];
  afterImages: string[];
  completedAt: string;
  clientReview?: {
    rating: number;
    comment: string;
    clientName: string;
  };
  tags: string[];
}

export interface ProSquad {
  id: string;
  name: string;
  members: {
    userId: string;
    trade: TradeCategory;
    role: 'leader' | 'member';
  }[];
  emblem: {
    trades: TradeCategory[];
    level: number;
    color: string;
  };
  stats: {
    projectsCompleted: number;
    totalXP: number;
    rating: number;
  };
  activeProject?: {
    taskId: string;
    location: { lat: number; lng: number };
    members: { userId: string; status: 'active' | 'idle' | 'offline' }[];
  };
}

export interface ProQuest {
  id: string;
  title: string;
  description: string;
  trade?: TradeCategory;
  requirements: {
    type: 'complete_jobs' | 'earn_rating' | 'form_squad' | 'earn_xp';
    target: number;
    current: number;
  }[];
  rewards: {
    xp: number;
    hustleCoins: number;
    badge?: string;
    unlocks?: string[];
  };
  expiresAt?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

export const PRO_QUESTS: ProQuest[] = [
  {
    id: 'elec_master_5',
    title: 'Electrical Excellence',
    description: 'Complete 5 high-rated electrical jobs',
    trade: 'electrician',
    requirements: [
      { type: 'complete_jobs', target: 5, current: 0 },
      { type: 'earn_rating', target: 4.5, current: 0 },
    ],
    rewards: {
      xp: 500,
      hustleCoins: 1000,
      badge: 'elec_silver',
      unlocks: ['Intermediate electrical tasks'],
    },
    difficulty: 'medium',
  },
  {
    id: 'squad_formation',
    title: 'Squad Up',
    description: 'Form a Pro Squad for a 3-person project',
    requirements: [
      { type: 'form_squad', target: 1, current: 0 },
      { type: 'complete_jobs', target: 1, current: 0 },
    ],
    rewards: {
      xp: 750,
      hustleCoins: 1500,
      unlocks: ['Squad Projects', 'Squad chat'],
    },
    difficulty: 'hard',
  },
  {
    id: 'hvac_specialist',
    title: 'Climate Control Master',
    description: 'Complete 10 HVAC installations with perfect ratings',
    trade: 'hvac',
    requirements: [
      { type: 'complete_jobs', target: 10, current: 0 },
      { type: 'earn_rating', target: 5.0, current: 0 },
    ],
    rewards: {
      xp: 1000,
      hustleCoins: 2500,
      badge: 'hvac_gold',
      unlocks: ['Commercial HVAC contracts'],
    },
    difficulty: 'hard',
  },
  {
    id: 'multi_trade',
    title: 'Jack of All Trades',
    description: 'Earn badges in 3 different trades',
    requirements: [
      { type: 'earn_xp', target: 3000, current: 0 },
    ],
    rewards: {
      xp: 2000,
      hustleCoins: 5000,
      unlocks: ['Multi-trade discount', 'Cross-trade bonuses'],
    },
    difficulty: 'legendary',
  },
];

export const PRO_SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free Hustler',
    price: 0,
    features: [
      'Basic task access',
      'Standard listings',
      'Community support',
    ],
    limitations: {
      maxActiveJobs: 3,
      commissionRate: 0.15,
    },
  },
  pro: {
    name: 'Tradesmen Pro',
    price: 9.99,
    features: [
      'Priority listings',
      'Pro-only job board',
      'Squad creation access',
      'Badge evolution speed boost',
      'HustleCoin cashback (5%)',
      'Advanced analytics',
      'Custom portfolio',
      'Verified badge',
    ],
    limitations: {
      maxActiveJobs: 10,
      commissionRate: 0.10,
    },
  },
  elite: {
    name: 'Elite Pro',
    price: 29.99,
    features: [
      'All Pro features',
      'Zero commission on first 5 jobs/month',
      'Featured listings',
      'Priority support',
      'HustleCoin cashback (10%)',
      'Enterprise contracts access',
      'Squad leader perks',
      'Custom branding',
    ],
    limitations: {
      maxActiveJobs: -1,
      commissionRate: 0.05,
    },
  },
};
