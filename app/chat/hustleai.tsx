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
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Send, Brain, DollarSign, Clock, Zap, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import { useRorkAgent } from '@rork/toolkit-sdk';

import GlassCard from '@/components/GlassCard';

export default function HustleAIChatScreen() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [input, setInput] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  const { messages, error, sendMessage, status } = useRorkAgent({
    tools: {},
  });

  const isLoading = status === 'submitted';

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const messageText = input.trim();
    setInput('');
    await sendMessage(messageText);
    triggerHaptic('light');
  };



  const renderTasksAction = (tasksData: any[]) => {
    if (!tasksData || tasksData.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tasksScrollView}
        contentContainerStyle={styles.tasksScrollContent}
      >
        {tasksData.map((task) => (
          <TouchableOpacity
            key={task.id}
            onPress={() => {
              triggerHaptic('light');
              router.push(`/task/${task.id}`);
            }}
            activeOpacity={0.9}
          >
            <GlassCard variant="dark" neonBorder style={styles.taskCard}>
              <View style={styles.taskCardHeader}>
                <Text style={styles.taskCardTitle} numberOfLines={2}>
                  {task.title}
                </Text>
                <View style={styles.taskCardBadge}>
                  <Text style={styles.taskCardCategory}>{task.category}</Text>
                </View>
              </View>

              <View style={styles.taskCardMeta}>
                <View style={styles.taskCardMetaItem}>
                  <DollarSign size={14} color={premiumColors.neonGreen} />
                  <Text style={styles.taskCardMetaText}>
                    ${task.price?.min || task.payAmount || 0}
                  </Text>
                </View>
                <View style={styles.taskCardMetaItem}>
                  <Zap size={14} color={premiumColors.neonAmber} />
                  <Text style={styles.taskCardMetaText}>{task.xpValue || task.xpReward} XP</Text>
                </View>
                {task.estimatedHours && (
                  <View style={styles.taskCardMetaItem}>
                    <Clock size={14} color={premiumColors.neonCyan} />
                    <Text style={styles.taskCardMetaText}>{task.estimatedHours}h</Text>
                  </View>
                )}
              </View>

              {task.urgency === 'high' && (
                <View style={styles.urgencyBadge}>
                  <Zap size={10} color={premiumColors.neonOrange} fill={premiumColors.neonOrange} />
                  <Text style={styles.urgencyText}>URGENT</Text>
                </View>
              )}

              <TouchableOpacity style={styles.viewTaskButton}>
                <Text style={styles.viewTaskButtonText}>View Details</Text>
                <ChevronRight size={16} color={premiumColors.neonCyan} />
              </TouchableOpacity>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderMessage = ({ item }: { item: typeof messages[0] }) => {
    const isUser = item.role === 'user';

    return (
      <View style={styles.messageWrapper}>
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.messageRight : styles.messageLeft,
          ]}
        >
          {!isUser && (
            <View style={styles.aiAvatar}>
              <Brain size={24} color={premiumColors.neonViolet} strokeWidth={2} />
            </View>
          )}
          
          <View style={{ flex: 1 }}>
            {item.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return (
                    <View
                      key={`${item.id}-${i}`}
                      style={[
                        styles.messageBubble,
                        isUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isUser ? styles.messageTextRight : styles.messageTextLeft,
                        ]}
                      >
                        {part.text}
                      </Text>
                    </View>
                  );

                case 'tool':
                  const toolName = part.toolName;

                  switch (part.state) {
                    case 'input-streaming':
                    case 'input-available':
                      return (
                        <View key={`${item.id}-${i}`} style={styles.toolLoadingContainer}>
                          <ActivityIndicator size="small" color={premiumColors.neonViolet} />
                          <Text style={styles.toolLoadingText}>
                            Searching for tasks...
                          </Text>
                        </View>
                      );

                    case 'output-available':
                      if (toolName === 'show_tasks' && part.output && typeof part.output === 'object') {
                        const outputData = part.output as any;
                        if (outputData.data?.tasks) {
                          return (
                            <View key={`${item.id}-${i}`}>
                              {renderTasksAction(outputData.data.tasks)}
                            </View>
                          );
                        }
                      }
                      return null;

                    case 'output-error':
                      return (
                        <View key={`${item.id}-${i}`} style={styles.errorContainer}>
                          <Text style={styles.errorText}>Error: {part.errorText}</Text>
                        </View>
                      );

                    default:
                      return null;
                  }

                default:
                  return null;
              }
            })}
          </View>

          {isUser && currentUser && (
            <Image source={{ uri: currentUser.profilePic }} style={styles.messageAvatar} />
          )}
        </View>
      </View>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorScreenText}>Please log in</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'HustleAI',
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
          <View style={styles.headerIcon}>
            <Brain size={28} color={premiumColors.neonViolet} strokeWidth={2} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>HustleAI</Text>
            <Text style={styles.headerSubtitle}>Your AI Task Assistant</Text>
          </View>
        </View>

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
              <Text style={styles.emptyTitle}>Welcome to HustleAI!</Text>
              <Text style={styles.emptySubtitle}>
                Ask me to show you tasks nearby, find gigs, or help you with anything!
              </Text>
              <View style={styles.suggestionsContainer}>
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => setInput('show me tasks nearby')}
                >
                  <Text style={styles.suggestionText}>Show tasks nearby</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => setInput('find high-paying gigs')}
                >
                  <Text style={styles.suggestionText}>Find high-paying gigs</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error.message}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask HustleAI anything..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={500}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
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
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  messageBubbleLeft: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: Colors.text,
  },
  messageTextRight: {
    color: Colors.background,
  },
  toolLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  toolLoadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  tasksScrollView: {
    marginTop: 8,
    marginBottom: 8,
  },
  tasksScrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  taskCard: {
    width: 280,
    padding: 16,
  },
  taskCardHeader: {
    marginBottom: 12,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  taskCardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: premiumColors.neonViolet + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonViolet,
  },
  taskCardCategory: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonViolet,
    textTransform: 'uppercase' as const,
  },
  taskCardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  taskCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskCardMetaText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: premiumColors.neonOrange + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonOrange,
    marginBottom: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: premiumColors.neonOrange,
  },
  viewTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan,
  },
  viewTaskButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
  },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorScreenText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: '#EF4444' + '20',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  errorBanner: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#DC2626',
  },
  errorBannerText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600' as const,
    textAlign: 'center',
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
    marginBottom: 32,
  },
  suggestionsContainer: {
    gap: 12,
    width: '100%',
  },
  suggestionButton: {
    backgroundColor: Colors.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: premiumColors.neonViolet + '50',
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
});
