import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Sparkles, TrendingUp, MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Task, User } from '@/types';
import { predictTaskMatches, PredictiveMatch } from '@/utils/aiPredictiveMatching';
import { premiumColors, COLORS } from '@/constants/designTokens';

interface AIPerfectMatchesProps {
  availableTasks: Task[];
  currentUser: User;
  completedTasks: Task[];
  acceptedTasks: Task[];
  onAccept?: (taskId: string) => void;
}

export function AIPerfectMatches({
  availableTasks,
  currentUser,
  completedTasks,
  acceptedTasks,
  onAccept,
}: AIPerfectMatchesProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<{ task: Task; prediction: PredictiveMatch }[]>([]);

  const loadMatches = React.useCallback(async () => {
    setLoading(true);
    try {
      const predictions = await predictTaskMatches(
        availableTasks,
        currentUser,
        completedTasks,
        acceptedTasks,
        false
      );

      const topMatches = predictions
        .slice(0, 3)
        .map((pred) => ({
          task: availableTasks.find((t) => t.id === pred.taskId)!,
          prediction: pred,
        }))
        .filter((m) => m.task);

      setMatches(topMatches);
    } catch (error) {
      console.error('[AI Perfect Matches] Error:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [availableTasks, currentUser, completedTasks, acceptedTasks]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return premiumColors.neonGreen;
    if (score >= 80) return premiumColors.neonCyan;
    if (score >= 70) return premiumColors.neonBlue;
    return premiumColors.neonAmber;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Sparkles size={20} color={premiumColors.neonCyan} />
          <Text style={styles.title}>Perfect Matches For You</Text>
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={premiumColors.neonCyan} />
          <Text style={styles.loadingText}>Finding your best matches...</Text>
        </View>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Sparkles size={20} color={premiumColors.neonCyan} />
          <Text style={styles.title}>Perfect Matches For You</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No matches available right now</Text>
          <Text style={styles.emptySubtext}>Check back soon for personalized recommendations!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={20} color={premiumColors.neonCyan} />
          <Text style={styles.title}>Perfect Matches For You</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/ai-coach')}
          style={styles.askAIButton}
        >
          <Text style={styles.askAIText}>Ask AI</Text>
          <ChevronRight size={14} color={premiumColors.neonCyan} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {matches.map(({ task, prediction }) => (
          <TouchableOpacity
            key={task.id}
            style={styles.matchCard}
            onPress={() => router.push(`/task/${task.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.matchHeader}>
              <Text style={styles.matchEmoji}>{getTaskEmoji(task.category)}</Text>
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: getScoreColor(prediction.score) + '20' },
                ]}
              >
                <Sparkles size={10} color={getScoreColor(prediction.score)} />
                <Text style={[styles.scoreText, { color: getScoreColor(prediction.score) }]}>
                  {Math.round(prediction.score)}%
                </Text>
              </View>
            </View>

            <Text style={styles.taskTitle} numberOfLines={2}>
              {task.title}
            </Text>

            <View style={styles.taskDetails}>
              <View style={styles.detail}>
                <DollarSign size={14} color={premiumColors.gritGold} />
                <Text style={styles.detailText}>${task.payAmount}</Text>
              </View>
              <View style={styles.detail}>
                <MapPin size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{task.distance?.toFixed(1)}mi</Text>
              </View>
              <View style={styles.detail}>
                <Clock size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{task.estimatedDuration}h</Text>
              </View>
            </View>

            {prediction.aiInsights.length > 0 && (
              <View style={styles.insight}>
                <TrendingUp size={12} color={premiumColors.neonCyan} />
                <Text style={styles.insightText} numberOfLines={2}>
                  {prediction.aiInsights[0]}
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
              {onAccept && (
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => onAccept(task.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => router.push('/(tabs)/tasks')}
      >
        <Text style={styles.viewAllText}>View All Matches</Text>
        <ChevronRight size={16} color={premiumColors.neonCyan} />
      </TouchableOpacity>
    </View>
  );
}

function getTaskEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    delivery: '📦',
    cleaning: '🧹',
    handyman: '🔨',
    moving: '📦',
    yardwork: '🌱',
    pet: '🐕',
    tech: '💻',
    tutoring: '📚',
    photography: '📸',
    cooking: '👨‍🍳',
    rideshare: '🚗',
    errands: '🛒',
  };
  return emojiMap[category.toLowerCase()] || '📋';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  askAIButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: premiumColors.neonCyan + '10',
    borderRadius: 12,
  },
  askAIText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 12,
  },
  matchCard: {
    width: 240,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchEmoji: {
    fontSize: 24,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
    minHeight: 36,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: premiumColors.neonCyan + '10',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 11,
    color: premiumColors.neonCyan,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
});
