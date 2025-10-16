import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, TrendingUp, Target, Lightbulb, Send, Brain } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { analyzeUserProgress, getPersonalizedRecommendations, generateDailyQuestSuggestions } from '@/utils/aiRecommendations';
import { generateText } from '@rork/toolkit-sdk';

export default function AICoachScreen() {
  const { currentUser, availableTasks } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [dailyQuests, setDailyQuests] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleAnalyze = async () => {
    if (!currentUser) return;

    setIsAnalyzing(true);
    triggerHaptic('medium');

    try {
      const [progressAnalysis, taskRecs, questSuggestions] = await Promise.all([
        analyzeUserProgress(currentUser),
        getPersonalizedRecommendations(currentUser, availableTasks, true),
        generateDailyQuestSuggestions(currentUser, []),
      ]);

      setAnalysis(progressAnalysis);
      setRecommendations(taskRecs);
      setDailyQuests(questSuggestions);
      triggerHaptic('success');
    } catch (error) {
      console.error('AI Coach analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !currentUser) return;

    setIsAsking(true);
    triggerHaptic('medium');

    try {
      const response = await generateText({
        messages: [
          {
            role: 'user',
            content: `You are an AI coach for HustleXP, a gamified gig economy app. Answer this user's question:

User Profile:
- Level ${currentUser.level}
- ${currentUser.tasksCompleted} tasks completed
- ${currentUser.reputationScore.toFixed(1)}⭐ rating
- $${currentUser.earnings} earned
- ${currentUser.streaks.current} day streak

Question: "${question}"

Provide a helpful, encouraging answer (2-3 sentences). Be specific and actionable.`,
          },
        ],
      });

      setAnswer(response.trim());
      triggerHaptic('success');
    } catch (error) {
      console.error('AI question error:', error);
      setAnswer('Sorry, I could not process your question. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI Coach',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Brain size={40} color={premiumColors.neonViolet} />
            <Text style={styles.headerTitle}>Your AI Coach</Text>
            <Text style={styles.headerSubtitle}>Personalized insights and recommendations</Text>
          </View>

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            <LinearGradient
              colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.analyzeGradient}
            >
              {isAnalyzing ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <Sparkles size={20} color={Colors.text} />
              )}
              <Text style={styles.analyzeText}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze My Progress'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {analysis && (
            <>
              <GlassCard variant="dark" style={styles.section}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={20} color={premiumColors.neonGreen} />
                  <Text style={styles.sectionTitle}>Your Strengths</Text>
                </View>
                {analysis.strengths.map((strength: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>✓</Text>
                    <Text style={styles.listText}>{strength}</Text>
                  </View>
                ))}
              </GlassCard>

              <GlassCard variant="dark" style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Target size={20} color={premiumColors.neonAmber} />
                  <Text style={styles.sectionTitle}>Areas to Improve</Text>
                </View>
                {analysis.improvements.map((improvement: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>→</Text>
                    <Text style={styles.listText}>{improvement}</Text>
                  </View>
                ))}
              </GlassCard>

              <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.milestoneCard}>
                <Text style={styles.milestoneLabel}>Next Milestone</Text>
                <Text style={styles.milestoneText}>{analysis.nextMilestone}</Text>
              </GlassCard>

              <GlassCard variant="dark" style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Lightbulb size={20} color={premiumColors.neonCyan} />
                  <Text style={styles.sectionTitle}>Pro Tips</Text>
                </View>
                {analysis.tips.map((tip: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>💡</Text>
                    <Text style={styles.listText}>{tip}</Text>
                  </View>
                ))}
              </GlassCard>
            </>
          )}

          {recommendations.length > 0 && (
            <GlassCard variant="dark" style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sparkles size={20} color={premiumColors.neonViolet} />
                <Text style={styles.sectionTitle}>Recommended Tasks</Text>
              </View>
              {recommendations.slice(0, 3).map((rec, index) => {
                const task = availableTasks.find((t) => t.id === rec.taskId);
                if (!task) return null;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.recommendationCard}
                    onPress={() => {
                      triggerHaptic('medium');
                      router.push(`/task/${task.id}`);
                    }}
                  >
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationTitle}>{task.title}</Text>
                      <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>{rec.score}%</Text>
                      </View>
                    </View>
                    <Text style={styles.recommendationReason}>{rec.reasoning}</Text>
                    <View style={styles.recommendationFooter}>
                      <Text style={styles.recommendationPay}>${rec.estimatedEarnings}</Text>
                      <Text style={styles.recommendationTime}>{rec.estimatedTime}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </GlassCard>
          )}

          {dailyQuests.length > 0 && (
            <GlassCard variant="dark" style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color={premiumColors.neonAmber} />
                <Text style={styles.sectionTitle}>Daily Quest Suggestions</Text>
              </View>
              {dailyQuests.map((quest, index) => (
                <View key={index} style={styles.questCard}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>
                  <View style={styles.questFooter}>
                    <Text style={styles.questCategory}>{quest.category}</Text>
                    <Text style={styles.questXP}>+{quest.xp} XP</Text>
                  </View>
                </View>
              ))}
            </GlassCard>
          )}

          <GlassCard variant="dark" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={20} color={premiumColors.neonGreen} />
              <Text style={styles.sectionTitle}>Ask Your Coach</Text>
            </View>
            <TextInput
              style={styles.questionInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask me anything about HustleXP..."
              placeholderTextColor={Colors.textSecondary}
              multiline
            />
            <TouchableOpacity
              style={styles.askButton}
              onPress={handleAskQuestion}
              disabled={isAsking || !question.trim()}
            >
              {isAsking ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <Send size={18} color={Colors.text} />
              )}
              <Text style={styles.askButtonText}>
                {isAsking ? 'Thinking...' : 'Ask'}
              </Text>
            </TouchableOpacity>
            {answer && (
              <View style={styles.answerCard}>
                <Text style={styles.answerText}>{answer}</Text>
              </View>
            )}
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  analyzeText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  section: {
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  bullet: {
    fontSize: 16,
    color: premiumColors.neonCyan,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  milestoneCard: {
    marginBottom: 20,
    padding: 24,
    alignItems: 'center',
  },
  milestoneLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  milestoneText: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scoreBadge: {
    backgroundColor: premiumColors.neonViolet + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonViolet,
  },
  recommendationReason: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationPay: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  recommendationTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  questCard: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  questDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  questXP: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  questionInput: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: premiumColors.neonGreen + '30',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen,
  },
  askButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  answerCard: {
    backgroundColor: premiumColors.neonViolet + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: premiumColors.neonViolet + '40',
  },
  answerText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
});
