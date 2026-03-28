export interface AppTheme {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    gradient: string[];
  };
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const THEMES: AppTheme[] = [
  {
    id: 'default',
    name: 'Classic Hustle',
    description: 'The original HustleXP experience',
    unlockLevel: 1,
    icon: '🎨',
    rarity: 'common',
    colors: {
      primary: '#8B5CF6',
      secondary: '#6366F1',
      background: '#F9FAFB',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#8B5CF6', '#6366F1'],
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Hustle',
    description: 'Dark mode with deep purple accents',
    unlockLevel: 10,
    icon: '🌙',
    rarity: 'rare',
    colors: {
      primary: '#A78BFA',
      secondary: '#818CF8',
      background: '#0F172A',
      card: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: '#334155',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      gradient: ['#6366F1', '#8B5CF6'],
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Grind',
    description: 'Warm orange and pink tones',
    unlockLevel: 25,
    icon: '🌅',
    rarity: 'epic',
    colors: {
      primary: '#F97316',
      secondary: '#EC4899',
      background: '#FFF7ED',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#78350F',
      border: '#FDBA74',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#F97316', '#EC4899'],
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Cool blue and teal vibes',
    unlockLevel: 50,
    icon: '🌊',
    rarity: 'epic',
    colors: {
      primary: '#0EA5E9',
      secondary: '#14B8A6',
      background: '#F0F9FF',
      card: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#0369A1',
      border: '#BAE6FD',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#0EA5E9', '#14B8A6'],
    },
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Cyberpunk-inspired neon glow',
    unlockLevel: 75,
    icon: '⚡',
    rarity: 'legendary',
    colors: {
      primary: '#FF00FF',
      secondary: '#00FFFF',
      background: '#0A0A0A',
      card: '#1A1A1A',
      text: '#FFFFFF',
      textSecondary: '#A0A0A0',
      border: '#333333',
      success: '#00FF00',
      warning: '#FFFF00',
      error: '#FF0000',
      gradient: ['#FF00FF', '#00FFFF'],
    },
  },
  {
    id: 'gold',
    name: 'Golden Empire',
    description: 'Luxurious gold and black theme',
    unlockLevel: 100,
    icon: '👑',
    rarity: 'legendary',
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      background: '#1A1A1A',
      card: '#2A2A2A',
      text: '#FFD700',
      textSecondary: '#D4AF37',
      border: '#4A4A4A',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#FFD700', '#FFA500'],
    },
  },
];

export function getUnlockedThemes(level: number): AppTheme[] {
  return THEMES.filter(theme => level >= theme.unlockLevel);
}

export function getThemeById(id: string): AppTheme {
  return THEMES.find(theme => theme.id === id) || THEMES[0];
}

export function getNextThemeUnlock(level: number): AppTheme | null {
  const locked = THEMES.filter(theme => level < theme.unlockLevel);
  return locked.length > 0 ? locked[0] : null;
}
