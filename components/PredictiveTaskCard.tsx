import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { TrendingUp, Sparkles, Clock, DollarSign, MapPin, Target } from 'lucide-react-native';
import { PredictiveMatch } from '@/utils/aiPredictiveMatching';
import { Task } from '@/types';
import { premiumColors } from '@/constants/designTokens';
import { useRouter } from 'expo-router';

interface PredictiveTaskCardProps {
  task: Task;
  prediction: PredictiveMatch;
  onAccept?: (taskId: string) => void;
}

export function PredictiveTaskCard({ task, prediction, onAccept }: PredictiveTaskCardProps) {
  const router = useRouter();
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    router.push(`/task/${task.id}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return premiumColors.neonGreen;
    if (score >= 80) return premiumColors.neonCyan;
    if (score >= 70) return premiumColors.neonBlue;
    if (score >= 60) return premiumColors.neonAmber;
    return premiumColors.neonMagenta;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Great';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#FF0033';
      case 'high': return '#FF6B00';
      case 'medium': return '#FFB800';
      default: return '#888';
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <View style={[styles.scoreBar, { backgroundColor: getScoreColor(prediction.score) }]}>
          <Sparkles size={14} color="#000" />
          <Text style={styles.scoreText}>{prediction.score}% {getScoreLabel(prediction.score)}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
            
            {prediction.urgencyLevel !== 'low' && (
              <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(prediction.urgencyLevel) }]}>
                <Clock size={12} color="#FFF" />
                <Text style={styles.urgencyText}>{prediction.urgencyLevel.toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <DollarSign size={16} color={premiumColors.gritGold} />
              <Text style={styles.statText}>${task.payAmount}</Text>
            </View>

            {task.distance && (
              <View style={styles.stat}>
                <MapPin size={16} color={premiumColors.neonCyan} />
                <Text style={styles.statText}>{task.distance.toFixed(1)} km</Text>
              </View>
            )}

            <View style={styles.stat}>
              <Target size={16} color={premiumColors.neonViolet} />
              <Text style={styles.statText}>{task.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.predictions}>
            <Text style={styles.sectionTitle}>AI Predictions</Text>
            
            <View style={styles.predictionRow}>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>Will Accept</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${prediction.predictions.willAccept * 100}%`,
                        backgroundColor: premiumColors.neonGreen 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.predictionValue}>
                  {Math.round(prediction.predictions.willAccept * 100)}%
                </Text>
              </View>

              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>Will Complete</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${prediction.predictions.willComplete * 100}%`,
                        backgroundColor: premiumColors.neonCyan 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.predictionValue}>
                  {Math.round(prediction.predictions.willComplete * 100)}%
                </Text>
              </View>

              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>Will Enjoy</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${prediction.predictions.willEnjoy * 100}%`,
                        backgroundColor: premiumColors.neonViolet 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.predictionValue}>
                  {Math.round(prediction.predictions.willEnjoy * 100)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.insights}>
            <Text style={styles.sectionTitle}>
              <TrendingUp size={14} color={premiumColors.neonCyan} /> Why This Task?
            </Text>
            <Text style={styles.reasoning}>{prediction.reasoning}</Text>
            
            {prediction.aiInsights.slice(0, 3).map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <View style={styles.insightDot} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>

          {onAccept && (
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: getScoreColor(prediction.score) }]}
              onPress={() => onAccept(task.id)}
            >
              <Text style={styles.acceptButtonText}>Accept Task</Text>
              <Sparkles size={18} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  touchable: {
    width: '100%',
  },
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 24,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  predictions: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: premiumColors.neonCyan,
    marginBottom: 10,
  },
  predictionRow: {
    gap: 12,
  },
  predictionItem: {
    gap: 4,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  predictionValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'right',
  },
  insights: {
    gap: 8,
  },
  reasoning: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  insightDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: premiumColors.neonCyan,
    marginTop: 6,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
