import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ProgressiveBadge, getBadgeProgress } from '@/constants/badgeProgression';
import { User } from '@/types';

interface ProgressiveBadgeCardProps {
  badge: ProgressiveBadge;
  user: User;
  onPress?: () => void;
}

export default function ProgressiveBadgeCard({ badge, user, onPress }: ProgressiveBadgeCardProps) {
  const { currentTier, progress, nextTier } = getBadgeProgress(user, badge.id);
  const currentBadgeTier = badge.tiers.find(t => t.tier === currentTier);
  const isLocked = currentTier === 0;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isLocked && styles.lockedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          currentBadgeTier
            ? [currentBadgeTier.color + '30', currentBadgeTier.color + '10']
            : [Colors.card, Colors.card]
        }
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={[styles.icon, isLocked && styles.lockedIcon]}>
              {currentBadgeTier ? currentBadgeTier.icon : '🔒'}
            </Text>
            {currentTier > 0 && (
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: currentBadgeTier?.color || Colors.accent },
                ]}
              >
                <Text style={styles.tierText}>T{currentTier}</Text>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, isLocked && styles.lockedText]} numberOfLines={1}>
              {currentBadgeTier ? currentBadgeTier.name : badge.baseName}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {badge.category.toUpperCase()}
            </Text>
          </View>
        </View>

        {nextTier && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <TrendingUp size={12} color={Colors.textSecondary} />
              <Text style={styles.progressLabel}>
                Next: {nextTier.name}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[nextTier.color, nextTier.color + '80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
          </View>
        )}

        {!nextTier && currentTier > 0 && (
          <View style={styles.maxedOut}>
            <Text style={styles.maxedOutText}>✨ MAX TIER ✨</Text>
          </View>
        )}

        {isLocked && (
          <View style={styles.lockedOverlay}>
            <Lock size={20} color={Colors.textSecondary} />
            <Text style={styles.lockedLabel}>Locked</Text>
          </View>
        )}

        <View style={styles.tierIndicators}>
          {badge.tiers.map((tier) => (
            <View
              key={tier.tier}
              style={[
                styles.tierDot,
                tier.tier <= currentTier && {
                  backgroundColor: tier.color,
                  borderColor: tier.color,
                },
                tier.tier === currentTier && styles.currentTierDot,
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  lockedContainer: {
    opacity: 0.7,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    backgroundColor: Colors.card,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  tierBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#000',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  lockedText: {
    color: Colors.textSecondary,
  },
  category: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.card,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'right',
  },
  maxedOut: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.accent + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  maxedOutText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.accent,
    letterSpacing: 1,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tierIndicators: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    justifyContent: 'center',
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.card,
  },
  currentTierDot: {
    transform: [{ scale: 1.3 }],
  },
});
