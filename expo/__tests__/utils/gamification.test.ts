import { calculateLevel, getXPForLevel, getXPForNextLevel, getXPProgress, calculateTaskXP, getAvatarForLevel, getRarityColor } from '@/utils/gamification';

describe('Gamification Utils', () => {
  describe('calculateLevel', () => {
    it('should return correct level for XP values', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(400)).toBe(3);
      expect(calculateLevel(900)).toBe(4);
      expect(calculateLevel(10000)).toBe(11);
    });

    it('should handle fractional XP correctly', () => {
      expect(calculateLevel(50)).toBe(1);
      expect(calculateLevel(250)).toBe(2);
    });
  });

  describe('getXPForLevel', () => {
    it('should return correct XP required for each level', () => {
      expect(getXPForLevel(1)).toBe(0);
      expect(getXPForLevel(2)).toBe(100);
      expect(getXPForLevel(3)).toBe(400);
      expect(getXPForLevel(10)).toBe(8100);
    });

    it('should follow quadratic progression', () => {
      const level5XP = getXPForLevel(5);
      const level6XP = getXPForLevel(6);
      expect(level6XP - level5XP).toBeGreaterThan(level5XP - getXPForLevel(4));
    });
  });

  describe('getXPForNextLevel', () => {
    it('should return XP needed for next level', () => {
      expect(getXPForNextLevel(0)).toBe(100);
      expect(getXPForNextLevel(100)).toBe(400);
      expect(getXPForNextLevel(250)).toBe(400);
    });
  });

  describe('getXPProgress', () => {
    it('should return progress percentage between 0 and 1', () => {
      const progress1 = getXPProgress(0);
      expect(progress1).toBeGreaterThanOrEqual(0);
      expect(progress1).toBeLessThanOrEqual(1);

      const progress2 = getXPProgress(50);
      expect(progress2).toBeGreaterThan(0);
      expect(progress2).toBeLessThan(1);
    });

    it('should return 0 when at exact level threshold', () => {
      const progress = getXPProgress(100);
      expect(progress).toBe(0);
    });

    it('should return close to 1 when near next level', () => {
      const progress = getXPProgress(399);
      expect(progress).toBeGreaterThan(0.9);
    });
  });

  describe('calculateTaskXP', () => {
    it('should calculate XP as 2x pay amount', () => {
      expect(calculateTaskXP(50)).toBe(100);
      expect(calculateTaskXP(100)).toBe(200);
      expect(calculateTaskXP(25.50)).toBe(51);
    });

    it('should handle edge cases', () => {
      expect(calculateTaskXP(0)).toBe(0);
      expect(calculateTaskXP(1)).toBe(2);
    });
  });

  describe('getAvatarForLevel', () => {
    it('should return correct avatar for each level range', () => {
      expect(getAvatarForLevel(1)).toBe('🧑');
      expect(getAvatarForLevel(5)).toBe('🥷');
      expect(getAvatarForLevel(10)).toBe('🦸');
      expect(getAvatarForLevel(20)).toBe('🧙');
      expect(getAvatarForLevel(30)).toBe('👑');
      expect(getAvatarForLevel(50)).toBe('⚡');
    });

    it('should handle boundary levels', () => {
      expect(getAvatarForLevel(4)).toBe('🧑');
      expect(getAvatarForLevel(9)).toBe('🥷');
      expect(getAvatarForLevel(19)).toBe('🦸');
    });
  });

  describe('getRarityColor', () => {
    it('should return correct hex color for each rarity', () => {
      expect(getRarityColor('common')).toBe('#9CA3AF');
      expect(getRarityColor('rare')).toBe('#3B82F6');
      expect(getRarityColor('epic')).toBe('#A855F7');
      expect(getRarityColor('legendary')).toBe('#F59E0B');
    });

    it('should return valid hex color format', () => {
      const rarities: ('common' | 'rare' | 'epic' | 'legendary')[] = ['common', 'rare', 'epic', 'legendary'];
      rarities.forEach(rarity => {
        const color = getRarityColor(rarity);
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });
});
