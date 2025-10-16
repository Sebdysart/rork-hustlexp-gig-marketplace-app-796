export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  return getXPForLevel(currentLevel + 1);
}

export function getXPProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const progress = (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
  return Math.max(0, Math.min(1, progress));
}

export function calculateTaskXP(payAmount: number): number {
  return Math.floor(payAmount * 2);
}

export function getAvatarForLevel(level: number): string {
  if (level < 5) return '🧑';
  if (level < 10) return '🥷';
  if (level < 20) return '🦸';
  if (level < 30) return '🧙';
  if (level < 50) return '👑';
  return '⚡';
}

export function getRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  switch (rarity) {
    case 'common':
      return '#9CA3AF';
    case 'rare':
      return '#3B82F6';
    case 'epic':
      return '#A855F7';
    case 'legendary':
      return '#F59E0B';
  }
}
