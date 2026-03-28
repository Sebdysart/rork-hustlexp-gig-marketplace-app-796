import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, ChevronRight, Brain, Sparkles, Zap } from 'lucide-react-native';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import Colors from '@/constants/colors';
import { User, Task } from '@/types';
import { hustleAI } from '@/utils/hustleAI';

export interface PerformanceInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'trend';
  title: string;
  description: string;
  metric?: string;
  change?: string;
  actionable?: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AIPerformanceInsightsProps {
  user: User;
  completedTasks: Task[];
  onActionPress?: (insight: PerformanceInsight) => void;
}

export default function AIPerformanceInsights({ user, completedTasks, onActionPress }: AIPerformanceInsightsProps) {
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      shimmerLoop.stop();
      pulseLoop.stop();
    };
  }, [shimmerAnim, pulseAnim]);

  useEffect(() => {
    generateInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, completedTasks]);

  const generateInsights = async () => {
    setIsLoading(true);

    try {
      const recentTasks = completedTasks.slice(-30);
      const lastWeekTasks = completedTasks.filter((task) => {
        if (!task.completedAt) return false;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(task.completedAt) >= weekAgo;
      });

      const categoryCount: { [key: string]: number } = {};
      recentTasks.forEach((task) => {
        categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
      });

      const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];


      const weeklyEarnings = lastWeekTasks.reduce((sum, t) => sum + t.payAmount, 0);
      const prevWeekTasks = completedTasks.filter((task) => {
        if (!task.completedAt) return false;
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const completedDate = new Date(task.completedAt);
        return completedDate >= twoWeeksAgo && completedDate < weekAgo;
      });
      const prevWeekEarnings = prevWeekTasks.reduce((sum, t) => sum + t.payAmount, 0);

      const earningsChange = prevWeekEarnings > 0
        ? ((weeklyEarnings - prevWeekEarnings) / prevWeekEarnings) * 100
        : 0;

      const baseInsights: PerformanceInsight[] = [];

      if (topCategory) {
        baseInsights.push({
          type: 'strength',
          title: `${topCategory[0]} Expert`,
          description: `You've completed ${topCategory[1]} ${topCategory[0]} tasks recently. You're building strong category expertise!`,
          metric: `${topCategory[1]} tasks`,
          priority: 'medium',
          actionable: true,
        });
      }

      if (earningsChange > 0) {
        baseInsights.push({
          type: 'trend',
          title: 'Earnings Growing',
          description: `Your weekly earnings increased by ${earningsChange.toFixed(0)}% compared to last week!`,
          metric: `$${weeklyEarnings.toFixed(0)}`,
          change: `+${earningsChange.toFixed(0)}%`,
          priority: 'high',
          actionable: false,
        });
      } else if (earningsChange < -10) {
        baseInsights.push({
          type: 'opportunity',
          title: 'Earnings Dip',
          description: 'Your earnings dropped this week. Consider accepting higher-paying tasks or increasing your availability.',
          metric: `$${weeklyEarnings.toFixed(0)}`,
          change: `${earningsChange.toFixed(0)}%`,
          priority: 'high',
          actionable: true,
        });
      }

      if (user.reputationScore >= 4.5) {
        baseInsights.push({
          type: 'strength',
          title: 'Stellar Reputation',
          description: `Your ${user.reputationScore.toFixed(1)}⭐ rating puts you in the top 10% of hustlers. Keep up the great work!`,
          metric: `${user.reputationScore.toFixed(1)}⭐`,
          priority: 'low',
          actionable: false,
        });
      }

      if (user.responseTime && user.responseTime < 600) {
        baseInsights.push({
          type: 'strength',
          title: 'Lightning Fast',
          description: `Your ${Math.floor(user.responseTime / 60)} minute response time is exceptional. This helps you win more tasks!`,
          metric: `${Math.floor(user.responseTime / 60)}m`,
          priority: 'medium',
          actionable: false,
        });
      } else if (user.responseTime && user.responseTime > 1800) {
        baseInsights.push({
          type: 'weakness',
          title: 'Slow Response Time',
          description: 'Your response time averages 30+ minutes. Faster responses can increase acceptance rates by 40%.',
          metric: `${Math.floor(user.responseTime / 60)}m`,
          priority: 'critical',
          actionable: true,
        });
      }

      const incompleteTasks = recentTasks.filter((t) => t.status === 'cancelled').length;
      if (incompleteTasks > 2) {
        baseInsights.push({
          type: 'weakness',
          title: 'Completion Issues',
          description: `You have ${incompleteTasks} incomplete tasks recently. Focus on reliable completion to boost your reputation.`,
          metric: `${incompleteTasks} incomplete`,
          priority: 'critical',
          actionable: true,
        });
      }

      const categoriesWorked = Object.keys(categoryCount).length;
      if (categoriesWorked >= 5) {
        baseInsights.push({
          type: 'strength',
          title: 'Versatile Hustler',
          description: `You've worked in ${categoriesWorked} different categories. Versatility opens more opportunities!`,
          metric: `${categoriesWorked} categories`,
          priority: 'medium',
          actionable: false,
        });
      } else if (categoriesWorked <= 2) {
        baseInsights.push({
          type: 'opportunity',
          title: 'Expand Your Skills',
          description: 'You mainly work in 1-2 categories. Trying new categories could increase your earning potential by 30%.',
          metric: `${categoriesWorked} categories`,
          priority: 'medium',
          actionable: true,
        });
      }

      if (user.streaks.current >= 7) {
        baseInsights.push({
          type: 'strength',
          title: 'On Fire! 🔥',
          description: `${user.streaks.current} day streak! You're building amazing momentum. Don't break it now!`,
          metric: `${user.streaks.current} days`,
          priority: 'high',
          actionable: false,
        });
      }

      const similarUsersComparison = await getAIComparison(user, baseInsights, recentTasks);
      if (similarUsersComparison) {
        baseInsights.unshift(similarUsersComparison);
      }

      setInsights(baseInsights.slice(0, 6));
    } catch (error) {
      console.error('[AI Performance Insights] Error generating insights:', error);
      setInsights([
        {
          type: 'trend',
          title: 'Keep Hustling',
          description: 'Complete more tasks to unlock AI-powered performance insights!',
          priority: 'low',
          actionable: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIComparison = async (user: User, insights: PerformanceInsight[], recentTasks: Task[]): Promise<PerformanceInsight | null> => {
    try {
      const prompt = `You are analyzing performance for a HustleXP user. Provide ONE key insight comparing them to similar users.

User: ${user.name}
Level: ${user.level}
Tasks Completed: ${user.tasksCompleted}
Rating: ${user.reputationScore.toFixed(1)}⭐
Current Streak: ${user.streaks.current} days
Response Time: ${user.responseTime ? Math.floor(user.responseTime / 60) : '?'} minutes

Recent Performance:
${insights.map((i) => `- ${i.title}: ${i.description}`).join('\n')}

Compare this user to similar Level ${user.level} hustlers. What's ONE key area where they excel or could improve?

Return JSON: {
  "type": "trend" | "strength" | "weakness" | "opportunity",
  "title": "Short title (max 4 words)",
  "description": "One sentence insight with specific comparison",
  "metric": "Brief metric (e.g. 'Top 15%')",
  "priority": "low" | "medium" | "high" | "critical"
}`;

      console.log('[AI Performance Insights] Requesting AI comparison...');
      const response = await hustleAI.chat('system', prompt);
      const aiResult = JSON.parse(response.response);

      console.log('[AI Performance Insights] AI comparison complete');
      return {
        ...aiResult,
        actionable: aiResult.type === 'opportunity' || aiResult.type === 'weakness',
      };
    } catch (error) {
      console.error('[AI Performance Insights] AI comparison failed:', error);
      return null;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return Award;
      case 'weakness': return AlertCircle;
      case 'opportunity': return Target;
      case 'trend': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return premiumColors.neonGreen;
      case 'weakness': return premiumColors.neonMagenta;
      case 'opportunity': return premiumColors.neonAmber;
      case 'trend': return premiumColors.neonCyan;
      default: return premiumColors.neonViolet;
    }
  };



  if (isLoading) {
    return (
      <GlassCard variant="dark" style={styles.loadingCard}>
        <Animated.View
          style={[
            styles.loadingContent,
            {
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ]}
        >
          <Brain size={32} color={premiumColors.neonViolet} />
          <Text style={styles.loadingText}>AI analyzing your performance...</Text>
        </Animated.View>
      </GlassCard>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Brain size={24} color={premiumColors.neonViolet} />
          </Animated.View>
          <Text style={styles.headerTitle}>AI Performance Insights</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            setShowDetails(!showDetails);
          }}
          style={styles.expandButton}
        >
          <Text style={styles.expandText}>{showDetails ? 'Collapse' : 'See All'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.insightsContainer}>
        {(showDetails ? insights : insights.slice(0, 3)).map((insight, index) => {
          const Icon = getInsightIcon(insight.type);
          const color = getInsightColor(insight.type);

          return (
            <TouchableOpacity
              key={index}
              style={styles.insightCard}
              onPress={() => {
                triggerHaptic('light');
                if (insight.actionable && onActionPress) {
                  onActionPress(insight);
                }
              }}
              activeOpacity={insight.actionable ? 0.7 : 1}
            >
              <GlassCard variant="dark" style={styles.insightCardInner}>
                <LinearGradient
                  colors={[color + '15', color + '05']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.insightGradient}
                >
                  <View style={styles.insightHeader}>
                    <View style={[styles.insightIconContainer, { backgroundColor: color + '30' }]}>
                      <Icon size={20} color={color} />
                    </View>
                    <View style={styles.insightTitleContainer}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      {insight.metric && (
                        <Text style={[styles.insightMetric, { color }]}>{insight.metric}</Text>
                      )}
                    </View>
                    {insight.change && (
                      <View style={[styles.changeIndicator, { backgroundColor: insight.change.startsWith('+') ? premiumColors.neonGreen + '30' : premiumColors.neonMagenta + '30' }]}>
                        {insight.change.startsWith('+') ? (
                          <TrendingUp size={14} color={premiumColors.neonGreen} />
                        ) : (
                          <TrendingDown size={14} color={premiumColors.neonMagenta} />
                        )}
                        <Text style={[styles.changeText, { color: insight.change.startsWith('+') ? premiumColors.neonGreen : premiumColors.neonMagenta }]}>
                          {insight.change}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.insightDescription}>{insight.description}</Text>

                  {insight.actionable && (
                    <View style={styles.actionRow}>
                      <Zap size={14} color={premiumColors.neonAmber} />
                      <Text style={styles.actionText}>Tap for suggestions</Text>
                      <ChevronRight size={14} color={premiumColors.neonAmber} />
                    </View>
                  )}

                  {insight.priority === 'critical' && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>HIGH PRIORITY</Text>
                    </View>
                  )}
                </LinearGradient>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </View>

      {insights.length > 3 && !showDetails && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => {
            triggerHaptic('medium');
            setShowDetails(true);
          }}
        >
          <Text style={styles.viewAllText}>View {insights.length - 3} More Insights</Text>
          <ChevronRight size={16} color={premiumColors.neonViolet} />
        </TouchableOpacity>
      )}

      <GlassCard variant="darkStrong" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Sparkles size={20} color={premiumColors.neonCyan} />
          <Text style={styles.summaryTitle}>Weekly Summary</Text>
        </View>
        <Text style={styles.summaryText}>
          You&apos;re performing well in your top categories. Focus on maintaining your response time and exploring new opportunities to maximize earnings.
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  expandButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonViolet,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    marginBottom: 0,
  },
  insightCardInner: {
    overflow: 'hidden',
  },
  insightGradient: {
    padding: 16,
    gap: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitleContainer: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  insightMetric: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonAmber,
    flex: 1,
  },
  priorityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: premiumColors.neonMagenta + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: premiumColors.neonMagenta + '50',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: premiumColors.neonMagenta,
    letterSpacing: 0.5,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: premiumColors.neonViolet + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonViolet + '30',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonViolet,
  },
  summaryCard: {
    padding: 16,
    gap: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  loadingCard: {
    padding: 32,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
