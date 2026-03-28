import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import EvolvingAvatar from '@/components/EvolvingAvatar';

interface LevelBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
}

export default function LevelBadge({ level, size = 'medium' }: LevelBadgeProps) {
  const sizeMap = {
    small: { container: 40, avatar: 36, level: 10 },
    medium: { container: 60, avatar: 56, level: 12 },
    large: { container: 80, avatar: 76, level: 14 },
  };

  const dimensions = sizeMap[size];

  return (
    <View 
      style={[styles.container, { width: dimensions.container, height: dimensions.container }]}
      accessible={true}
      accessibilityLabel={`Level ${level} badge`}
      accessibilityRole="image"
    >
      <View style={styles.avatarContainer}>
        <EvolvingAvatar level={level} size={dimensions.avatar} />
      </View>
      <View style={styles.levelBadge}>
        <LinearGradient
          colors={[Colors.accent, Colors.warning]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelGradient}
        >
          <Text style={[styles.levelText, { fontSize: dimensions.level }]}>{level}</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  levelGradient: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelText: {
    fontWeight: 'bold' as const,
    color: Colors.background,
    textAlign: 'center',
  },
});
