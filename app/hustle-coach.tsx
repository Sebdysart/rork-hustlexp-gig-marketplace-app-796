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
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Send, Bot, Zap, TrendingUp, Award, Target, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { generateText } from '@rork/toolkit-sdk';
import { getRankForLevel } from '@/constants/ranks';
import { premiumColors, neonGlow, borderRadius, typography, spacing } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';

const { width } = Dimensions.get('window');

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
      content: `Hey! 👋 Welcome to HustleXP! I'm your AI coach here to help you get started.\n\nTell me - are you looking to find work, hire someone, or both? Feel free to type in any language!`,
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
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#0A0A0F', '#1A1028', '#0D1128']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <Stack.Screen
            options={{
              headerShown: true,
              title: 'HustleXP AI Coach',
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerTintColor: premiumColors.softWhite,
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 18,
              },
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
                <View style={styles.headerRightContainer}>
                  <View style={styles.aiStatusDot} />
                  <Sparkles size={20} color={premiumColors.neonViolet} />
                </View>
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
              {messages.map((message, index) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant,
                  ]}
                >
                  {message.role === 'assistant' && (
                    <Animated.View 
                      style={[
                        styles.avatarContainer,
                        !settings.reducedMotion && {
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[premiumColors.neonViolet, premiumColors.neonMagenta]}
                        style={styles.avatarGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Bot size={18} color="#FFFFFF" strokeWidth={2.5} />
                      </LinearGradient>
                    </Animated.View>
                  )}
                  
                  <View style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}>
                    {message.role === 'assistant' && (
                      <LinearGradient
                        colors={['rgba(155, 94, 255, 0.15)', 'rgba(0, 255, 255, 0.05)']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
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
                    <Text style={[
                      styles.messageTime,
                      message.role === 'user' ? styles.messageTimeUser : styles.messageTimeAssistant,
                    ]}>
                      {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}

              {isLoading && (
                <View style={[styles.messageRow, styles.messageRowAssistant]}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={[premiumColors.neonViolet, premiumColors.neonMagenta]}
                      style={styles.avatarGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Bot size={18} color="#FFFFFF" strokeWidth={2.5} />
                    </LinearGradient>
                  </View>
                  <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                    <LinearGradient
                      colors={['rgba(155, 94, 255, 0.15)', 'rgba(0, 255, 255, 0.05)']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.typingIndicator}>
                      <Animated.View style={[styles.typingDot, { opacity: glowAnim }]} />
                      <Animated.View style={[styles.typingDot, { opacity: glowAnim }]} />
                      <Animated.View style={[styles.typingDot, { opacity: glowAnim }]} />
                    </View>
                  </View>
                </View>
              )}

              {messages.length === 1 && !isLoading && (
                <View style={styles.quickPromptsContainer}>
                  <Text style={[styles.quickPromptsTitle, { fontSize: settings.fontSize - 1 }]}>Suggested questions:</Text>
                  <View style={styles.quickPromptsGrid}>
                    {quickPrompts.map((prompt, index) => {
                      const IconComponent = prompt.icon;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.quickPromptButton}
                          onPress={() => handleQuickPrompt(prompt.text)}
                          activeOpacity={0.8}
                          accessible={true}
                          accessibilityLabel={`Quick question: ${prompt.text}`}
                        >
                          <LinearGradient
                            colors={[
                              'rgba(155, 94, 255, 0.15)',
                              'rgba(0, 255, 255, 0.05)',
                            ]}
                            style={styles.quickPromptGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <View style={styles.quickPromptIconContainer}>
                              <IconComponent size={16} color={premiumColors.neonCyan} strokeWidth={2.5} />
                            </View>
                            <Text style={[styles.quickPromptText, { fontSize: settings.fontSize - 2 }]}>
                              {prompt.text}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainerOuter}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={80} tint="dark" style={styles.inputContainer}>
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
                      placeholder="Type your message..."
                      placeholderTextColor={settings.highContrast ? '#AAAAAA' : '#8B8B8B'}
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
                      activeOpacity={0.8}
                      accessible={true}
                      accessibilityLabel="Send message"
                    >
                      <LinearGradient
                        colors={
                          input.trim() && !isLoading
                            ? [premiumColors.neonViolet, premiumColors.neonMagenta]
                            : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                        }
                        style={styles.sendButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              ) : (
                <View style={[styles.inputContainer, styles.inputContainerAndroid]}>
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
                      placeholder="Type your message..."
                      placeholderTextColor={settings.highContrast ? '#AAAAAA' : '#8B8B8B'}
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
                      activeOpacity={0.8}
                      accessible={true}
                      accessibilityLabel="Send message"
                    >
                      <LinearGradient
                        colors={
                          input.trim() && !isLoading
                            ? [premiumColors.neonViolet, premiumColors.neonMagenta]
                            : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                        }
                        style={styles.sendButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
    marginLeft: spacing.xs,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: premiumColors.neonGreen,
    ...neonGlow.green,
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
    paddingBottom: spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    ...neonGlow.violet,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBubble: {
    backgroundColor: premiumColors.neonViolet,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(155, 94, 255, 0.2)',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: typography.sizes.base,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  assistantText: {
    color: premiumColors.softWhite,
    fontWeight: '400',
  },
  messageTime: {
    fontSize: 10,
    marginTop: spacing.xs,
    fontWeight: '500',
    opacity: 0.6,
  },
  messageTimeUser: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  messageTimeAssistant: {
    color: premiumColors.softWhite,
  },
  loadingBubble: {
    paddingVertical: spacing.md,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: premiumColors.neonCyan,
  },
  quickPromptsContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  quickPromptsTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: premiumColors.softWhite,
    opacity: 0.5,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickPromptButton: {
    flex: 1,
    minWidth: '47%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  quickPromptGradient: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(155, 94, 255, 0.3)',
    gap: spacing.sm,
    minHeight: 70,
  },
  quickPromptIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPromptText: {
    fontSize: typography.sizes.xs,
    color: premiumColors.softWhite,
    lineHeight: 16,
    fontWeight: typography.weights.medium,
  },
  inputContainerOuter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(155, 94, 255, 0.1)',
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputContainerAndroid: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs + 2,
    paddingRight: spacing.xs + 2,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: premiumColors.neonViolet,
    backgroundColor: 'rgba(155, 94, 255, 0.12)',
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
    paddingTop: spacing.sm + 2,
    lineHeight: 20,
  },
  inputHighContrast: {
    color: '#FFFFFF',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
