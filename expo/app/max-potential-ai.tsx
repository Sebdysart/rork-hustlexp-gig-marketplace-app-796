import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Send, Brain, DollarSign, Zap, TrendingUp, Target, 
  Sparkles, Map as MapIcon, Clock, ArrowRight, Mic, Trophy 
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { maxPotentialAI, AIResponse, AIAction, ProactiveInsight } from '@/utils/maxPotentialAI';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  intent?: string;
  actions?: AIAction[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

export default function MaxPotentialAIScreen() {
  const router = useRouter();
  const { currentUser, availableTasks } = useApp();
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proactiveInsights, setProactiveInsights] = useState<ProactiveInsight[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentUser) {
      initializeAI();
      loadProactiveInsights();
    }
  }, [currentUser]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const initializeAI = async () => {
    if (!currentUser) return;
    await maxPotentialAI.initialize(currentUser.id);

    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      text: `Hey ${currentUser.name}! 👋 I'm your AI assistant. I can help you find work, post tasks, check your stats, optimize your profile, and give you personalized coaching.\n\nWhat would you like to do today?`,
      suggestedFollowUps: ['Find me work', 'Check my stats', 'Optimize my profile'],
      timestamp: new Date().toISOString(),
    };

    setMessages([welcomeMessage]);
  };

  const loadProactiveInsights = async () => {
    if (!currentUser) return;
    const insights = await maxPotentialAI.generateProactiveInsights(currentUser, availableTasks);
    setProactiveInsights(insights);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || !currentUser) return;

    triggerHaptic('light');
    setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response: AIResponse = await maxPotentialAI.chat(
        textToSend,
        currentUser,
        availableTasks
      );

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: response.text,
        intent: response.intent,
        actions: response.actions,
        suggestedFollowUps: response.suggestedFollowUps,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('[MAX AI] Error:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: "I'm having trouble processing that. Can you try rephrasing?",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: AIAction) => {
    triggerHaptic('medium');
    console.log('[MAX AI] Action:', action);

    switch (action.type) {
      case 'navigate':
        if (action.target) {
          router.push(`/${action.target}` as any);
        }
        break;
      case 'show_card':
        break;
      case 'execute':
        break;
      case 'suggest':
        break;
    }
  };

  const handleInsightAction = (insight: ProactiveInsight) => {
    triggerHaptic('medium');
    if (insight.actionLabel) {
      const message = insight.actionLabel.toLowerCase().includes('task') 
        ? 'Find me work'
        : insight.actionLabel;
      handleSend(message);
    }
    setProactiveInsights(prev => prev.filter(i => i.id !== insight.id));
  };

  const renderProactiveInsights = () => {
    if (proactiveInsights.length === 0) return null;

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>🔮 Proactive Insights</Text>
        {proactiveInsights.slice(0, 3).map(insight => (
          <TouchableOpacity
            key={insight.id}
            style={styles.insightCard}
            onPress={() => handleInsightAction(insight)}
            activeOpacity={0.9}
          >
            <GlassCard 
              variant="darkStrong" 
              neonBorder 
              glowColor={
                insight.priority === 'urgent' ? 'neonOrange' :
                insight.priority === 'high' ? 'neonAmber' :
                'neonCyan'
              }
              style={styles.insightCardInner}
            >
              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: 
                    insight.priority === 'urgent' ? premiumColors.neonOrange + '20' :
                    insight.priority === 'high' ? premiumColors.neonAmber + '20' :
                    premiumColors.neonCyan + '20'
                  }
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color:
                      insight.priority === 'urgent' ? premiumColors.neonOrange :
                      insight.priority === 'high' ? premiumColors.neonAmber :
                      premiumColors.neonCyan
                    }
                  ]}>{insight.priority.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.insightMessage}>{insight.message}</Text>
              {insight.actionLabel && (
                <View style={styles.insightAction}>
                  <Text style={styles.insightActionText}>{insight.actionLabel}</Text>
                  <ArrowRight size={16} color={premiumColors.neonCyan} />
                </View>
              )}
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTaskList = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.taskListScroll}
        contentContainerStyle={styles.taskListContent}
      >
        {tasks.map((task, index) => (
          <TouchableOpacity
            key={task.id || index}
            style={styles.taskCard}
            onPress={() => {
              triggerHaptic('light');
              router.push(`/task/${task.id}`);
            }}
            activeOpacity={0.9}
          >
            <GlassCard variant="dark" neonBorder style={styles.taskCardInner}>
              <View style={styles.taskCardHeader}>
                <View style={[
                  styles.matchBadge,
                  { backgroundColor: task.matchScore >= 85 ? premiumColors.neonGreen + '20' : premiumColors.neonCyan + '20' }
                ]}>
                  <Text style={[
                    styles.matchText,
                    { color: task.matchScore >= 85 ? premiumColors.neonGreen : premiumColors.neonCyan }
                  ]}>{task.matchScore}% Match</Text>
                </View>
              </View>
              <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
              <View style={styles.taskMeta}>
                <View style={styles.taskMetaItem}>
                  <DollarSign size={16} color={premiumColors.neonAmber} />
                  <Text style={styles.taskMetaText}>${task.pay}</Text>
                </View>
                <View style={styles.taskMetaItem}>
                  <Zap size={16} color={premiumColors.neonViolet} />
                  <Text style={styles.taskMetaText}>{task.xp} XP</Text>
                </View>
              </View>
              <View style={styles.taskCategory}>
                <Text style={styles.taskCategoryText}>{task.category}</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderStatsCard = (data: any) => {
    return (
      <View style={styles.statsCard}>
        <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.statsCardInner}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <TrendingUp size={24} color={premiumColors.neonCyan} />
              <Text style={styles.statValue}>{data.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statItem}>
              <DollarSign size={24} color={premiumColors.neonAmber} />
              <Text style={styles.statValue}>${data.earnings?.toFixed(0) || 0}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Trophy size={24} color={premiumColors.neonGreen} />
              <Text style={styles.statValue}>{data.tasks}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
          </View>
        </GlassCard>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={styles.messageWrapper}>
        <View style={[styles.messageContainer, isUser ? styles.messageRight : styles.messageLeft]}>
          {!isUser && (
            <Animated.View style={[styles.aiAvatar, { transform: [{ scale: pulseAnim }] }]}>
              <Brain size={24} color={premiumColors.neonViolet} strokeWidth={2} />
            </Animated.View>
          )}

          <View style={{ flex: 1 }}>
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                {item.text}
              </Text>
            </View>

            {item.actions && item.actions.length > 0 && (
              <View style={styles.actionsContainer}>
                {item.actions.map((action, idx) => {
                  if (action.type === 'show_card' && action.target === 'task_list') {
                    return <View key={idx}>{renderTaskList(action.data)}</View>;
                  }
                  if (action.type === 'show_card' && action.target === 'stats_detailed') {
                    return <View key={idx}>{renderStatsCard(action.data)}</View>;
                  }
                  return null;
                })}
              </View>
            )}

            {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {item.suggestedFollowUps.map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionChip}
                    onPress={() => handleSend(suggestion)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorText}>Please log in</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'MAX POTENTIAL AI',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <Animated.View style={[styles.headerIcon, { transform: [{ scale: pulseAnim }] }]}>
            <Brain size={32} color={premiumColors.neonViolet} strokeWidth={2} />
          </Animated.View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>MAX POTENTIAL AI</Text>
            <Text style={styles.headerSubtitle}>Your AI Operating System</Text>
          </View>
          <View style={styles.statusDot} />
        </View>

        {renderProactiveInsights()}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Brain size={64} color={premiumColors.neonViolet} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>MAX POTENTIAL</Text>
              <Text style={styles.emptySubtitle}>
                Ask me anything! I'm here to help you maximize your earnings and efficiency.
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.micButton}
            onPress={() => {
              triggerHaptic('medium');
              console.log('[MAX AI] Voice input');
            }}
            activeOpacity={0.8}
          >
            <Mic size={20} color={premiumColors.neonViolet} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Send size={20} color={input.trim() ? Colors.background : Colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: premiumColors.neonViolet + '20',
    borderWidth: 2,
    borderColor: premiumColors.neonViolet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: premiumColors.neonGreen,
  },
  insightsContainer: {
    padding: 16,
    gap: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  insightCard: {
    marginBottom: 4,
  },
  insightCardInner: {
    padding: 16,
    gap: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800' as const,
  },
  insightMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  insightActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonViolet + '20',
    borderWidth: 2,
    borderColor: premiumColors.neonViolet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  aiBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: Colors.text,
  },
  userMessageText: {
    color: Colors.background,
  },
  actionsContainer: {
    marginTop: 8,
    gap: 12,
  },
  taskListScroll: {
    marginTop: 8,
  },
  taskListContent: {
    gap: 12,
    paddingRight: 16,
  },
  taskCard: {
    width: 260,
  },
  taskCardInner: {
    padding: 16,
    gap: 12,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '800' as const,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 21,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  taskCategory: {
    alignSelf: 'flex-start',
    backgroundColor: premiumColors.neonCyan + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskCategoryText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  statsCard: {
    marginTop: 8,
  },
  statsCardInner: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    backgroundColor: premiumColors.neonCyan + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
    gap: 12,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: premiumColors.neonViolet + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: premiumColors.neonViolet,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
});
