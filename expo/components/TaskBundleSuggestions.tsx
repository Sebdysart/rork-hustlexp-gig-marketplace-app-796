import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { TrendingUp, MapPin, DollarSign, Zap } from 'lucide-react-native';
import { TaskBundle } from '@/utils/aiTaskBundling';
import GlassCard from './GlassCard';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';

interface TaskBundleSuggestionsProps {
  bundles: TaskBundle[];
  onSelectBundle?: (bundle: TaskBundle) => void;
}

export default function TaskBundleSuggestions({ bundles, onSelectBundle }: TaskBundleSuggestionsProps) {
  if (bundles.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <TrendingUp size={20} color={premiumColors.neonCyan} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>💡 Smart Bundling</Text>
          <Text style={styles.subtitle}>Complete nearby tasks together for bonus pay</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {bundles.map((bundle, index) => (
          <TouchableOpacity
            key={bundle.id}
            onPress={() => {
              triggerHaptic('light');
              if (onSelectBundle) {
                onSelectBundle(bundle);
              }
            }}
            activeOpacity={0.8}
          >
            <GlassCard
              variant="darkStrong"
              neonBorder
              glowColor="neonCyan"
              style={styles.bundleCard}
            >
              <View style={styles.bundleHeader}>
                <View style={styles.efficiencyBadge}>
                  <Text style={styles.efficiencyText}>{bundle.efficiencyScore}% Efficient</Text>
                </View>
                {bundle.routeOptimized && (
                  <View style={styles.optimizedBadge}>
                    <Zap size={12} color={premiumColors.neonAmber} />
                    <Text style={styles.optimizedText}>Route Optimized</Text>
                  </View>
                )}
              </View>

              <View style={styles.taskCount}>
                <Text style={styles.taskCountNumber}>{bundle.tasks.length}</Text>
                <Text style={styles.taskCountLabel}>Tasks</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <DollarSign size={16} color={premiumColors.neonCyan} />
                  <Text style={styles.statValue}>${bundle.totalPay}</Text>
                  {bundle.potentialBonus > 0 && (
                    <Text style={styles.bonusText}>+${bundle.potentialBonus}</Text>
                  )}
                </View>
                <View style={styles.stat}>
                  <MapPin size={16} color={premiumColors.neonViolet} />
                  <Text style={styles.statValue}>{bundle.totalDistance.toFixed(1)}mi</Text>
                </View>
              </View>

              <Text style={styles.duration}>{bundle.estimatedDuration}</Text>
              <Text style={styles.reasoning} numberOfLines={2}>{bundle.reasoning}</Text>

              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Bundle</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bundleCard: {
    width: 260,
    padding: 16,
    gap: 12,
    overflow: 'visible',
  },
  bundleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  efficiencyBadge: {
    backgroundColor: premiumColors.neonCyan + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  efficiencyText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
  },
  optimizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  optimizedText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  taskCount: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  taskCountNumber: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: Colors.text,
    lineHeight: 36,
  },
  taskCountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.card + '80',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: premiumColors.neonGreen,
  },
  duration: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  reasoning: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  viewButton: {
    backgroundColor: premiumColors.neonCyan + '20',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
});
