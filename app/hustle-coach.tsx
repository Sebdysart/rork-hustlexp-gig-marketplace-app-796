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
  Animated,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Bot, Zap, TrendingUp, Award, Target } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { generateText } from '@rork/toolkit-sdk';
import { getRankForLevel } from '@/constants/ranks';
import { premiumColors, neonGlow, borderRadius, typography, spacing } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function HustleCoach() {
  const router = useRouter();
  const { currentUser, myAcceptedTasks, availableTasks } = useApp();
  const { settings } = useSettings();
  const { isDark } = useTheme();
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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!settings.reducedMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [settings.reducedMotion]);

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

    triggerHaptic('light');

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
    triggerHaptic('success');
  };

  const quickPrompts = [
    { text: "How can I level up faster?", icon: TrendingUp },
    { text: "Best tasks for me right now?", icon: Target },
    { text: "Tips to increase earnings?", icon: Zap },
    { text: "How to improve trust score?", icon: Award },
  ];

  const handleQuickPrompt = (prompt: string) => {
    triggerHaptic('light');
    setInput(prompt);
  };

  const handleOptOut = () => {
    triggerHaptic('medium');
    router.push('/wellbeing-settings');
  };

  if (!settings.aiNudgesEnabled) {
    return (
      <View style={[styles.container, { backgroundColor: premiumColors.deepBlack }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'AI Hustle Coach',
            headerStyle: {
              backgroundColor: premiumColors.richBlack,
            },
            headerTintColor: premiumColors.softWhite,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={premiumColors.softWhite} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.optOutContainer}>
          <Bot size={64} color={premiumColors.neonViolet} />
          <Text style={styles.optOutTitle}>AI Coach is Disabled</Text>
          <Text style={styles.optOutDescription}>
            You&apos;ve opted out of AI coaching. Enable it in Wellbeing Settings to get personalized guidance.
          </Text>
          <TouchableOpacity
            style={styles.optOutButton}
            onPress={() => router.push('/wellbeing-settings')}
            accessible={true}
            accessibilityLabel="Go to Wellbeing Settings"
          >
            <Text style={styles.optOutButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: premiumColors.deepBlack }}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack, '#0A1128']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <Stack.Screen
            options={{
              headerShown: true,
              title: 'AI Hustle Coach',
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerTintColor: premiumColors.softWhite,
              headerLeft: () => (
                <TouchableOpacity 
                  onPress={() => router.back()} 
                  style={styles.backButton}
                  accessible={true}
                  accessibilityLabel="Go back"
                >
                  <ArrowLeft size={24} color={premiumColors.softWhite} />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity 
                  onPress={handleOptOut} 
                  style={styles.optOutHeaderButton}
                  accessible={true}
                  accessibilityLabel="Wellbeing Settings"
                >
                  <Text style={styles.optOutHeaderText}>Settings</Text>
                </TouchableOpacity>
              ),
            }}
          />

          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            {messages.length === 1 && (
              <View style={styles.personalizedTipContainer}>
                <LinearGradient
                  colors={['rgba(155, 94, 255, 0.2)', 'rgba(0, 255, 255, 0.2)']}
                  style={styles.personalizedTipGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Zap size={20} color={premiumColors.neonCyan} />
                  <Text style={styles.personalizedTipText}>
                    {currentUser?.streaks.current && currentUser.streaks.current >= 3
                      ? `${currentUser.name}, your ${currentUser.streaks.current}-day streak is 🔥! Aim for 7 for a badge!`
                      : `${currentUser?.name}, complete 3 tasks today to start your streak! +50 XP bonus`}
                  </Text>
                </LinearGradient>
              </View>
            )}

            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message, index) => (
                <Animated.View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                    !settings.reducedMotion && index === messages.length - 1 && {
                      opacity: 1,
                    },
                  ]}
                >
                  {message.role === 'assistant' && (
                    <Animated.View 
                      style={[
                        styles.coachIcon,
                        !settings.reducedMotion && {
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[premiumColors.neonViolet, premiumColors.neonMagenta]}
                        style={styles.coachIconGradient}
                      >
                        <Bot size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </Animated.View>
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      message.role === 'user' ? styles.userText : styles.assistantText,
                      { fontSize: settings.fontSize },
                    ]}
                    accessible={true}
                    accessibilityLabel={`${message.role === 'user' ? 'You' : 'Coach'}: ${message.content}`}
                  >
                    {message.content}
                  </Text>
                </Animated.View>
              ))}

              {isLoading && (
                <View style={[styles.messageBubble, styles.assistantBubble]}>
                  <View style={styles.coachIcon}>
                    <LinearGradient
                      colors={[premiumColors.neonViolet, premiumColors.neonMagenta]}
                      style={styles.coachIconGradient}
                    >
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <Text style={[styles.loadingText, { fontSize: settings.fontSize }]}>Thinking...</Text>
                </View>
              )}

              {messages.length === 1 && (
                <View style={styles.quickPromptsContainer}>
                  <Text style={[styles.quickPromptsTitle, { fontSize: settings.fontSize }]}>Quick Questions:</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickPromptsScroll}
                    contentContainerStyle={styles.quickPromptsScrollContent}
                  >
                    {quickPrompts.map((prompt, index) => {
                      const IconComponent = prompt.icon;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.quickPromptButton}
                          onPress={() => handleQuickPrompt(prompt.text)}
                          accessible={true}
                          accessibilityLabel={`Quick question: ${prompt.text}`}
                        >
                          <LinearGradient
                            colors={[
                              'rgba(255, 255, 255, 0.05)',
                              'rgba(255, 255, 255, 0.02)',
                            ]}
                            style={styles.quickPromptGradient}
                          >
                            <IconComponent size={18} color={premiumColors.neonCyan} />
                            <Text style={[styles.quickPromptText, { fontSize: settings.fontSize - 1 }]}>
                              {prompt.text}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  isInputFocused && styles.inputWrapperFocused,
                  settings.highContrast && styles.inputWrapperHighContrast,
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    { fontSize: settings.fontSize },
                    settings.highContrast && styles.inputHighContrast,
                  ]}
                  value={input}
                  onChangeText={setInput}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Ask your coach anything..."
                  placeholderTextColor={settings.highContrast ? '#AAAAAA' : '#6B7280'}
                  multiline
                  maxLength={500}
                  editable={!isLoading}
                  accessible={true}
                  accessibilityLabel="Message input field"
                  accessibilityHint="Type your question for the AI coach"
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!input.trim() || isLoading) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!input.trim() || isLoading}
                  accessible={true}
                  accessibilityLabel="Send message"
                >
                  <LinearGradient
                    colors={
                      input.trim() && !isLoading
                        ? [premiumColors.neonViolet, premiumColors.neonMagenta]
                        : ['#374151', '#1F2937']
                    }
                    style={styles.sendButtonGradient}
                  >
                    <Send size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: spacing.sm,
  },
  optOutHeaderButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  optOutHeaderText: {
    color: premiumColors.neonCyan,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  optOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  optOutTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: premiumColors.softWhite,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  optOutDescription: {
    fontSize: typography.sizes.base,
    color: premiumColors.softWhite,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  optOutButton: {
    backgroundColor: premiumColors.neonViolet,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...neonGlow.violet,
  },
  optOutButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  keyboardView: {
    flex: 1,
  },
  personalizedTipContainer: {
    padding: spacing.lg,
  },
  personalizedTipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    gap: spacing.sm,
  },
  personalizedTipText: {
    flex: 1,
    color: premiumColors.softWhite,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: premiumColors.neonViolet,
    ...neonGlow.violet,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  coachIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  coachIconGradient: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: typography.sizes.base,
    lineHeight: 22,
    flex: 1,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: premiumColors.softWhite,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: premiumColors.softWhite,
    opacity: 0.6,
    marginLeft: spacing.sm,
  },
  quickPromptsContainer: {
    marginTop: spacing.lg,
  },
  quickPromptsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: premiumColors.softWhite,
    opacity: 0.7,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  quickPromptsScroll: {
    flexGrow: 0,
  },
  quickPromptsScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  quickPromptButton: {
    marginRight: spacing.sm,
  },
  quickPromptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    gap: spacing.sm,
    minWidth: 180,
  },
  quickPromptText: {
    fontSize: typography.sizes.sm,
    color: premiumColors.softWhite,
    flex: 1,
  },
  inputContainer: {
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: spacing.lg,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: premiumColors.neonCyan,
    ...neonGlow.cyan,
  },
  inputWrapperHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    maxHeight: 100,
    marginRight: spacing.sm,
    color: premiumColors.softWhite,
    paddingTop: spacing.sm,
  },
  inputHighContrast: {
    color: '#FFFFFF',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
