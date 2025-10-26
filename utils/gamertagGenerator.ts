const ADJECTIVES = [
  'SHADOW', 'TURBO', 'BLAZING', 'PHANTOM', 'STEEL', 'ELECTRIC', 'QUANTUM',
  'COSMIC', 'STORM', 'IRON', 'NEON', 'CYBER', 'ATOMIC', 'SAVAGE', 'ROGUE',
  'LEGEND', 'TITAN', 'DEMON', 'GHOST', 'THUNDER', 'VIPER', 'DRAGON', 'WOLF',
  'HAWK', 'EAGLE', 'LION', 'BEAR', 'TIGER', 'SHARK', 'FALCON', 'RAPID',
  'FLASH', 'SONIC', 'NITRO', 'ULTRA', 'MEGA', 'HYPER', 'APEX', 'PRIME',
  'ELITE', 'MASTER', 'SUPREME', 'ROYAL', 'IMPERIAL', 'DIVINE', 'MYTHIC',
  'CHAOS', 'VOID', 'DARK', 'BRIGHT', 'SILVER', 'GOLD', 'PLATINUM', 'CRYSTAL'
];

const NOUNS = [
  'PHOENIX', 'REAPER', 'HUNTER', 'WARRIOR', 'KNIGHT', 'SAMURAI', 'NINJA',
  'STRIKER', 'SLAYER', 'CRUSHER', 'BLADE', 'BULLET', 'ROCKET', 'COMET',
  'METEOR', 'STAR', 'MOON', 'SUN', 'STORM', 'LIGHTNING', 'THUNDER', 'BOLT',
  'FLAME', 'BLAZE', 'INFERNO', 'FROST', 'GLACIER', 'AVALANCHE', 'QUAKE',
  'HURRICANE', 'TYPHOON', 'TEMPEST', 'CYCLONE', 'VORTEX', 'PULSE', 'WAVE',
  'FORGE', 'HAMMER', 'ANVIL', 'STEEL', 'IRON', 'TITAN', 'COLOSSUS', 'GIANT',
  'BEAST', 'SAVAGE', 'PREDATOR', 'ALPHA', 'OMEGA', 'NEXUS', 'ZENITH', 'APEX'
];

export function generateGamertag(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 100);
  
  return `${adjective}_${noun}_${number}`;
}

export function getUserDisplayName(
  user: { name: string; gamertag?: string },
  context: 'public' | 'accepted_task'
): string {
  if (context === 'public' && user.gamertag) {
    return user.gamertag;
  }
  
  if (context === 'accepted_task') {
    return user.name;
  }
  
  return user.gamertag || user.name;
}

export function getGamertagColor(gamertag: string): string {
  const hash = gamertag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colors = [
    '#7C3AED', '#D946EF', '#F59E0B', '#10B981', '#3B82F6',
    '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];
  
  return colors[Math.abs(hash) % colors.length];
}
