import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Send, 
  Sparkles, 
  FileText, 
  DollarSign, 
  Wrench, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors, spacing, typography, borderRadius, neonGlow } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { generateText } from '@rork/toolkit-sdk';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'quote' | 'invoice' | 'reminder' | 'suggestion';
  data?: any;
}

const QUICK_ACTIONS = [
  { id: 'quote', label: 'Generate Quote', icon: DollarSign, prompt: 'Help me create a quote for a job' },
  { id: 'invoice', label: 'Create Invoice', icon: FileText, prompt: 'Help me create an invoice' },
  { id: 'materials', label: 'Material List', icon: Wrench, prompt: 'Suggest materials I need for this job' },
  { id: 'schedule', label: 'Schedule Help', icon: Calendar, prompt: 'Help me plan my schedule' },
];

export default function AIForeman() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey there! I'm your AI Foreman. I'm here to help you with quotes, invoices, material lists, scheduling, and any questions about your jobs. What can I help you with today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    triggerHaptic('light');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const context = currentUser?.tradesmanProfile 
        ? `User is a ${currentUser.tradesmanProfile.primaryTrade} with ${currentUser.tradesmanProfile.completedJobs} completed jobs.`
        : '';

      const systemPrompt = `You are an AI Foreman assistant for tradespeople. You help with:
- Generating professional quotes and estimates
- Creating invoices
- Suggesting material lists and quantities
- Providing scheduling advice
- Answering trade-specific questions
- Offering business tips

${context}

Be concise, professional, and helpful. Use specific numbers and details when relevant.`;

      const response = await generateText({
        messages: [
          { role: 'user', content: systemPrompt },
          ...messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content: messageText },
        ],
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Foreman error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    triggerHaptic('medium');
    handleSendMessage(action.prompt);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Sparkles size={20} color={premiumColors.neonAmber} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {!isUser && (
            <LinearGradient
              colors={[premiumColors.neonAmber + '20', 'transparent']}
              style={styles.bubbleGradient}
            />
          )}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'AI Foreman',
          headerShown: true,
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
        }} 
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerCard}>
            <GlassCard style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Sparkles size={32} color={premiumColors.neonAmber} />
              </View>
              <Text style={styles.headerTitle}>AI Foreman</Text>
              <Text style={styles.headerSubtitle}>
                Your 24/7 business assistant
              </Text>
            </GlassCard>
          </View>

          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.7}
                >
                  <GlassCard style={styles.quickActionCard}>
                    <action.icon size={24} color={premiumColors.neonCyan} />
                    <Text style={styles.quickActionText}>{action.label}</Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.messagesContainer}>
            {messages.map(renderMessage)}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.assistantAvatar}>
                  <Sparkles size={20} color={premiumColors.neonAmber} />
                </View>
                <View style={styles.loadingBubble}>
                  <View style={styles.loadingDots}>
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.inputContainer}>
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything..."
              placeholderTextColor={Colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={inputText.trim() 
                  ? [premiumColors.neonCyan, premiumColors.neonBlue]
                  : [premiumColors.glassDark, premiumColors.glassDark]
                }
                style={styles.sendGradient}
              >
                <Send size={20} color={inputText.trim() ? Colors.text : Colors.textSecondary} />
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.neonAmber + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  quickActionsContainer: {
    marginBottom: spacing.lg,
  },
  quickActionsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionButton: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
  },
  quickActionCard: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  messagesContainer: {
    gap: spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.neonAmber + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  userBubble: {
    backgroundColor: premiumColors.neonCyan + '30',
    borderWidth: 1,
    borderColor: premiumColors.neonCyan,
  },
  assistantBubble: {
    backgroundColor: premiumColors.glassDark,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  bubbleGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  messageText: {
    fontSize: typography.sizes.base,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  userMessageTime: {
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loadingBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: premiumColors.glassDark,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.neonAmber,
  },
  inputContainer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  sendButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
