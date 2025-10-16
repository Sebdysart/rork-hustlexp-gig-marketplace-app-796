import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { spacing } from '@/constants/designTokens';
import { getXPProgress, getXPForNextLevel } from '@/utils/gamification';

interface XPBarProps {
  currentXP: number;
  level: number;
  showLabel?: boolean;
}

export default function XPBar({ currentXP, level, showLabel = true }: XPBarProps) {
  const progress = getXPProgress(currentXP);
  const nextLevelXP = getXPForNextLevel(currentXP);

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={`Level ${level}. ${currentXP} out of ${nextLevelXP} experience points. ${Math.round(progress * 100)} percent complete.`}
    >
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Level {level}</Text>
          <Text style={styles.xpText}>{currentXP} / {nextLevelXP} XP</Text>
        </View>
      )}
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  xpText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  barContainer: {
    width: '100%',
  },
  barBackground: {
    height: 12,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
});
