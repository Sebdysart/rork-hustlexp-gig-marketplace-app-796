import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Send, TrendingUp, Shield, Zap, DollarSign, Calendar, Target, Award, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import Colors from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  component?: 'stats' | 'chart' | 'comparison' | 'forecast' | 'suggestion';
  data?: any;
}

export default function ConversationalAnalyticsScreen() {
  const { currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "🚀 YOU'RE ON FIRE THIS WEEK!",
      timestamp: new Date().toISOString(),
      component: 'stats',
      data: {
        insights: [
          { icon: '✅', text: 'Trust score hit 96 - your highest ever!', change: '+11' },
          { icon: '✅', text: 'Earnings up 51% vs last week', change: '$924' },
          { icon: '✅', text: 'Response time down to 8min', change: '-10min' },
        ],
        improvement: { icon: '🎯', text: 'Try accepting tasks earlier on Saturdays', impact: '+40% earnings' },
      },
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [shimmerAnim]);

  if (!currentUser) return null;

  const quickQuestions = [
    { id: '1', text: "What's my best earning day?", icon: '💰' },
    { id: '2', text: 'Why did my matches drop?', icon: '📉' },
    { id: '3', text: 'Am I improving?', icon: '📈' },
    { id: '4', text: 'Compare me to top performers', icon: '🏆' },
  ];

  const handleQuickQuestion = (question: string) => {
    triggerHaptic('light');
    setInputText(question);
    setTimeout(() => handleSend(question), 100);
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    triggerHaptic('medium');
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      setMessages(prev => [...prev, aiResponse]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 500);
  };

  const generateAIResponse = (question: string): Message => {
    const q = question.toLowerCase();

    if (q.includes('best') && q.includes('day')) {
      return {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: "Saturdays! You average $220 vs $140 on weekdays.",
        timestamp: new Date().toISOString(),
        component: 'chart',
        data: {
          chartType: 'bar',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          values: [120, 145, 138, 142, 165, 220, 180],
          highlight: 5,
        },
      };
    }

    if (q.includes('matches') && q.includes('drop')) {
      return {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: "Your response time increased to 18 minutes (was 8). Hustlers who respond under 10 min get 3x more matches.",
        timestamp: new Date().toISOString(),
        component: 'suggestion',
        data: {
          problem: 'Response Time: 18min → 8min',
          solution: 'Enable instant notifications',
          impact: '+3x more matches',
        },
      };
    }

    if (q.includes('improv')) {
      return {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: "YES! 🚀\n\n• Trust score: 85 → 96 (+11)\n• Completion rate: 94% → 99% (+5%)\n• Avg earnings per task: $45 → $68 (+51%)\n\nYou're in the TOP 5% of your tier!",
        timestamp: new Date().toISOString(),
        component: 'stats',
        data: {
          metrics: [
            { label: 'Trust Score', from: 85, to: 96, change: '+11' },
            { label: 'Completion Rate', from: '94%', to: '99%', change: '+5%' },
            { label: 'Avg Earnings', from: '$45', to: '$68', change: '+51%' },
          ],
        },
      };
    }

    if (q.includes('compare') || q.includes('top')) {
      return {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: "Here's how you stack up against top 10% performers:",
        timestamp: new Date().toISOString(),
        component: 'comparison',
        data: {
          metrics: [
            { name: 'Earnings/Week', you: '$924', top: '$1,240', diff: '-$316', better: false },
            { name: 'Trust Score', you: '96', top: '94', diff: '+2', better: true },
            { name: 'Response Time', you: '8min', top: '12min', diff: '4min faster', better: true },
          ],
          action: {
            title: 'To Reach Top 10%',
            steps: [
              'Complete 3 more tasks per week',
              'Target higher-paying categories',
              'Accept weekend surge pricing',
            ],
            impact: '+$316/week = +$1,344/month',
          },
        },
      };
    }

    return {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: "I'm analyzing your data... Try asking about your best earning days, improvements, or comparisons to top performers!",
      timestamp: new Date().toISOString(),
    };
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Analytics AI',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '800' as const },
        }}
      />
      
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal, premiumColors.richBlack]}
        style={styles.gradient}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introSection}>
            <Animated.View 
              style={[
                styles.brainIcon,
                {
                  transform: [{
                    scale: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  }],
                },
              ]}
            >
              <LinearGradient
                colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
                style={styles.brainGradient}
              >
                <Brain size={32} color={Colors.text} />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.introTitle}>Your AI Analytics Assistant</Text>
            <Text style={styles.introSubtitle}>Ask me anything about your performance</Text>
          </View>

          <View style={styles.quickQuestionsSection}>
            <Text style={styles.quickQuestionsTitle}>Quick Questions</Text>
            <View style={styles.quickQuestions}>
              {quickQuestions.map((q) => (
                <TouchableOpacity
                  key={q.id}
                  style={styles.quickQuestion}
                  onPress={() => handleQuickQuestion(q.text)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickQuestionIcon}>{q.icon}</Text>
                  <Text style={styles.quickQuestionText}>{q.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.messagesSection}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </View>
        </ScrollView>

        <View style={[styles.inputSection, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask about your stats..."
              placeholderTextColor={Colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() ? [premiumColors.neonViolet, premiumColors.neonCyan] : [Colors.textSecondary, Colors.textSecondary]}
                style={styles.sendButtonGradient}
              >
                <Send size={20} color={Colors.text} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  if (message.type === 'user') {
    return (
      <View style={styles.userMessageContainer}>
        <View style={styles.userBubble}>
          <Text style={styles.userMessageText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiMessageContainer}>
      <View style={styles.aiBubble}>
        <Text style={styles.aiMessageText}>{message.content}</Text>
        {message.component && renderComponent(message.component, message.data)}
      </View>
    </View>
  );
}

function renderComponent(type: string, data: any) {
  switch (type) {
    case 'stats':
      return <StatsComponent data={data} />;
    case 'chart':
      return <ChartComponent data={data} />;
    case 'comparison':
      return <ComparisonComponent data={data} />;
    case 'suggestion':
      return <SuggestionComponent data={data} />;
    default:
      return null;
  }
}

function StatsComponent({ data }: { data: any }) {
  if (data.insights) {
    return (
      <View style={styles.statsComponent}>
        <Text style={styles.statsTitle}>Key Wins:</Text>
        {data.insights.map((insight: any, index: number) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statIcon}>{insight.icon}</Text>
            <Text style={styles.statText}>{insight.text}</Text>
            {insight.change && (
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>{insight.change}</Text>
              </View>
            )}
          </View>
        ))}
        {data.improvement && (
          <View style={styles.improvementCard}>
            <Text style={styles.improvementIcon}>{data.improvement.icon}</Text>
            <View style={styles.improvementContent}>
              <Text style={styles.improvementTitle}>One Thing to Improve:</Text>
              <Text style={styles.improvementText}>{data.improvement.text}</Text>
              <Text style={styles.improvementImpact}>{data.improvement.impact}</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  if (data.metrics) {
    return (
      <View style={styles.statsComponent}>
        {data.metrics.map((metric: any, index: number) => (
          <View key={index} style={styles.metricRow}>
            <Text style={styles.metricLabel}>{metric.label}:</Text>
            <View style={styles.metricValues}>
              <Text style={styles.metricFrom}>{metric.from}</Text>
              <Text style={styles.metricArrow}>→</Text>
              <Text style={styles.metricTo}>{metric.to}</Text>
              <View style={styles.metricChangeBadge}>
                <Text style={styles.metricChangeText}>{metric.change}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

function ChartComponent({ data }: { data: any }) {
  return (
    <View style={styles.chartComponent}>
      <View style={styles.chartBars}>
        {data.days.map((day: string, index: number) => {
          const maxValue = Math.max(...data.values);
          const height = (data.values[index] / maxValue) * 100;
          const isHighlight = index === data.highlight;
          
          return (
            <View key={index} style={styles.chartBar}>
              <View style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBarFill,
                    { 
                      height: `${height}%`,
                      backgroundColor: isHighlight ? premiumColors.neonAmber : premiumColors.neonCyan,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{day}</Text>
              <Text style={[styles.chartValue, isHighlight && styles.chartValueHighlight]}>
                ${data.values[index]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ComparisonComponent({ data }: { data: any }) {
  return (
    <View style={styles.comparisonComponent}>
      <View style={styles.comparisonTable}>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonHeaderText}>Metric</Text>
          <Text style={styles.comparisonHeaderText}>You</Text>
          <Text style={styles.comparisonHeaderText}>Top 10%</Text>
        </View>
        {data.metrics.map((metric: any, index: number) => (
          <View key={index} style={styles.comparisonRow}>
            <Text style={styles.comparisonMetric}>{metric.name}</Text>
            <Text style={styles.comparisonValue}>{metric.you}</Text>
            <View style={styles.comparisonTopValue}>
              <Text style={styles.comparisonValue}>{metric.top}</Text>
              <View style={[styles.comparisonDiff, { backgroundColor: metric.better ? premiumColors.neonGreen + '20' : premiumColors.neonAmber + '20' }]}>
                <Text style={[styles.comparisonDiffText, { color: metric.better ? premiumColors.neonGreen : premiumColors.neonAmber }]}>
                  {metric.diff}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      {data.action && (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>{data.action.title}:</Text>
          {data.action.steps.map((step: string, index: number) => (
            <View key={index} style={styles.actionStep}>
              <Text style={styles.actionBullet}>•</Text>
              <Text style={styles.actionStepText}>{step}</Text>
            </View>
          ))}
          <View style={styles.actionImpact}>
            <Target size={16} color={premiumColors.neonAmber} />
            <Text style={styles.actionImpactText}>{data.action.impact}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function SuggestionComponent({ data }: { data: any }) {
  return (
    <View style={styles.suggestionComponent}>
      <View style={styles.suggestionProblem}>
        <Text style={styles.suggestionLabel}>Problem:</Text>
        <Text style={styles.suggestionText}>{data.problem}</Text>
      </View>
      <View style={styles.suggestionSolution}>
        <Text style={styles.suggestionLabel}>Solution:</Text>
        <Text style={styles.suggestionText}>{data.solution}</Text>
      </View>
      <View style={styles.suggestionImpact}>
        <Zap size={16} color={premiumColors.neonAmber} />
        <Text style={styles.suggestionImpactText}>{data.impact}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  brainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  brainGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  introSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  quickQuestionsSection: {
    marginBottom: 24,
  },
  quickQuestionsTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  quickQuestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: premiumColors.richBlack,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  quickQuestionIcon: {
    fontSize: 16,
  },
  quickQuestionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  messagesSection: {
    gap: 12,
    marginBottom: 24,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: premiumColors.neonViolet + '40',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  aiBubble: {
    backgroundColor: premiumColors.richBlack,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
    gap: 12,
  },
  aiMessageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  statsComponent: {
    gap: 12,
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 18,
  },
  statText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  statBadge: {
    backgroundColor: premiumColors.neonGreen + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  improvementCard: {
    flexDirection: 'row',
    backgroundColor: premiumColors.neonAmber + '15',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '30',
  },
  improvementIcon: {
    fontSize: 24,
  },
  improvementContent: {
    flex: 1,
    gap: 4,
  },
  improvementTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  improvementText: {
    fontSize: 13,
    color: Colors.text,
  },
  improvementImpact: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonAmber,
  },
  metricRow: {
    gap: 8,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricFrom: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  metricArrow: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  metricTo: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  metricChangeBadge: {
    backgroundColor: premiumColors.neonGreen + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  chartComponent: {
    marginTop: 8,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    gap: 4,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartBarContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  chartValueHighlight: {
    color: premiumColors.neonAmber,
  },
  comparisonComponent: {
    gap: 12,
    marginTop: 8,
  },
  comparisonTable: {
    backgroundColor: premiumColors.richBlack + 'CC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  comparisonHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonMetric: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  comparisonValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  comparisonTopValue: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  comparisonDiff: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  comparisonDiffText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  actionCard: {
    backgroundColor: premiumColors.neonViolet + '15',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonViolet + '30',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  actionStep: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBullet: {
    fontSize: 13,
    color: Colors.text,
  },
  actionStepText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  actionImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: premiumColors.neonAmber + '20',
    padding: 8,
    borderRadius: 8,
  },
  actionImpactText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  suggestionComponent: {
    gap: 12,
    marginTop: 8,
  },
  suggestionProblem: {
    gap: 4,
  },
  suggestionSolution: {
    gap: 4,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
  },
  suggestionImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: premiumColors.neonAmber + '20',
    padding: 8,
    borderRadius: 8,
  },
  suggestionImpactText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  inputSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: premiumColors.richBlack,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: premiumColors.charcoal,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
