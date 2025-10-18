import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Send, Zap } from 'lucide-react-native';
import { colors } from '@/constants/designTokens';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    type: string;
    data: any;
  }>;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm your Hustle AI assistant. Ask me about tasks nearby, your progress, or anything else!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL || 'https://hustlexp-backend.replit.app'}/api/agent/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'test-user',
            message: userMessage.content,
          }),
        }
      );

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I had trouble understanding that.',
        timestamp: new Date(),
        actions: data.actions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Hustle AI',
          headerStyle: { backgroundColor: colors.surface.elevated },
          headerTintColor: colors.text.primary,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userText : styles.assistantText,
                ]}
              >
                {message.content}
              </Text>
              
              {message.actions && message.actions.length > 0 && (
                <View style={styles.actionsContainer}>
                  {message.actions.map((action, index) => {
                    if (action.type === 'show_tasks' && action.data?.tasks) {
                      return (
                        <View key={index} style={styles.tasksContainer}>
                          <Text style={styles.tasksHeader}>
                            {action.data.totalCount || action.data.tasks.length} Tasks Available
                          </Text>
                          {action.data.tasks.slice(0, 5).map((task: any) => (
                            <View key={task.id} style={styles.taskCard}>
                              <Text style={styles.taskTitle} numberOfLines={1}>
                                {task.title}
                              </Text>
                              <View style={styles.taskDetails}>
                                <Text style={styles.taskCategory}>
                                  {task.category}
                                </Text>
                                {task.price && (
                                  <Text style={styles.taskPrice}>
                                    ${task.price.min}-${task.price.max}
                                  </Text>
                                )}
                                {task.xpValue && (
                                  <View style={styles.xpBadge}>
                                    <Zap size={12} color={colors.accent.gold} />
                                    <Text style={styles.xpText}>
                                      {task.xpValue} XP
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.accent.primary} />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about tasks, progress, etc..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            disabled={!input.trim() || loading}
          >
            <Send size={20} color={input.trim() ? colors.background.primary : colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface.elevated,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: colors.background.primary,
  },
  assistantText: {
    color: colors.text.primary,
  },
  actionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  tasksContainer: {
    gap: 8,
  },
  tasksHeader: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  taskCard: {
    backgroundColor: colors.background.primary,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  taskCategory: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  taskPrice: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.accent.gold,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.accent.gold,
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.surface.elevated,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: colors.text.primary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
});
