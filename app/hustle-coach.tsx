import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@rork/toolkit-sdk';
import { getRankForLevel } from '@/constants/ranks';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function HustleCoach() {
  const router = useRouter();
  const { currentUser, myAcceptedTasks, availableTasks } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey ${currentUser?.name || 'Hustler'}! 👋 I'm your AI Hustle Coach. I'm here to help you level up faster, earn more, and dominate the leaderboards!\n\nAsk me anything about:\n• Best tasks to take based on your skills\n• Tips to increase your XP and earnings\n• How to improve your trust score\n• Strategies to maintain streaks\n• Power-ups recommendations`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const generateCoachResponse = async (userMessage: string): Promise<string> => {
    if (!currentUser) return "I need you to be logged in to give personalized advice!";

    const rank = getRankForLevel(currentUser.level);
    const context = `
User Profile:
- Name: ${currentUser.name}
- Level: ${currentUser.level}
- Rank: ${rank.name}
- XP: ${currentUser.xp}
- Tasks Completed: ${currentUser.tasksCompleted}
- Earnings: $${currentUser.earnings.toFixed(2)}
- Trust Score: ${currentUser.reputationScore}/5
- Current Streak: ${currentUser.streaks.current} days
- Active Tasks: ${myAcceptedTasks.length}
- Available Tasks Nearby: ${availableTasks.length}

You are an enthusiastic AI Hustle Coach helping users maximize their gig economy success. 
Be motivating, specific, and actionable. Use emojis occasionally. Keep responses under 150 words.
Focus on: task selection, XP optimization, earnings growth, trust building, and streak maintenance.

User Question: ${userMessage}
`;

    try {
      const response = await generateText(context);
      return response;
    } catch (error) {
      console.error('Coach AI error:', error);
      return "Oops! I'm having trouble thinking right now. Try asking me again in a moment! 🤔";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await generateCoachResponse(userMessage.content);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const quickPrompts = [
    "How can I level up faster?",
    "Best tasks for me right now?",
    "Tips to increase earnings?",
    "How to improve trust score?",
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'AI Hustle Coach',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.coachIcon}>
                  <Sparkles size={16} color="#8B5CF6" />
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userText : styles.assistantText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}

          {messages.length === 1 && (
            <View style={styles.quickPromptsContainer}>
              <Text style={styles.quickPromptsTitle}>Quick Questions:</Text>
              {quickPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPromptButton}
                  onPress={() => handleQuickPrompt(prompt)}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach anything..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send size={20} color={input.trim() && !isLoading ? '#FFFFFF' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B5CF6',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  coachIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#1F2937',
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
    marginLeft: 8,
  },
  quickPromptsContainer: {
    marginTop: 16,
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 12,
  },
  quickPromptButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickPromptText: {
    fontSize: 14,
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
    color: '#1F2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
