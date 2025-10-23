import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Sparkles, Send, Loader, Zap, MessageCircle, Brain, Globe } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { hustleAI } from '@/utils/hustleAI';
import Colors from '@/constants/colors';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import Confetti from '@/components/Confetti';
import { triggerHaptic } from '@/utils/haptics';
import { UserRole, UserMode } from '@/types';
import { TradeCategory } from '@/constants/tradesmen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface ExtractedData {
  name?: string;
  intent?: 'worker' | 'poster' | 'both';
  categories?: string[];
  trades?: TradeCategory[];
  priceRange?: [number, number];
  availability?: string[];
  language?: string;
  mode?: UserMode;
  email?: string;
}

export default function AIOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! 👋 I'm your HustleXP coach. Tell me about yourself - what brings you here today? Feel free to type in any language you're comfortable with!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [conversationStage, setConversationStage] = useState<
    'intro' | 'gathering' | 'confirming' | 'complete'
  >('intro');
  const [showConfetti, setShowConfetti] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const detectLanguageFromText = async (text: string): Promise<string> => {
    try {
      const result = await hustleAI.detectLanguage(text);
      return result.detectedLanguages[0] || 'en';
    } catch (error) {
      console.warn('[AI_ONBOARDING] Language detection failed:', error);
      return 'en';
    }
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === 'en') return text;
    
    try {
      const result = await hustleAI.translate({
        text: [text],
        targetLanguage: targetLang,
        sourceLanguage: 'en',
        context: 'HustleXP onboarding conversation',
      });
      return result.translations[0] || text;
    } catch (error) {
      console.warn('[AI_ONBOARDING] Translation failed:', error);
      return text;
    }
  };

  const extractInfoFromConversation = async (userMessage: string): Promise<Partial<ExtractedData>> => {
    const extracted: Partial<ExtractedData> = {};
    const lowerMessage = userMessage.toLowerCase();

    // Detect language
    const lang = await detectLanguageFromText(userMessage);
    if (lang !== 'en') {
      extracted.language = lang;
      setDetectedLanguage(lang);
    }

    // Extract name
    const nameMatch = userMessage.match(/(?:i'm|i am|my name is|call me)\s+([a-z]+)/i);
    if (nameMatch) {
      extracted.name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    }

    // Extract intent
    if (lowerMessage.includes('find work') || lowerMessage.includes('earn money') || lowerMessage.includes('get gigs')) {
      extracted.intent = 'worker';
    } else if (lowerMessage.includes('hire') || lowerMessage.includes('post') || lowerMessage.includes('need workers')) {
      extracted.intent = 'poster';
    } else if (lowerMessage.includes('both') || (lowerMessage.includes('work') && lowerMessage.includes('hire'))) {
      extracted.intent = 'both';
    }

    // Extract categories/skills
    const categories: string[] = [];
    if (lowerMessage.includes('clean')) categories.push('Cleaning');
    if (lowerMessage.includes('deliver') || lowerMessage.includes('driver')) categories.push('Delivery');
    if (lowerMessage.includes('move') || lowerMessage.includes('furniture')) categories.push('Moving');
    if (lowerMessage.includes('pet') || lowerMessage.includes('dog')) categories.push('Pet Care');
    if (lowerMessage.includes('tutor') || lowerMessage.includes('teach')) categories.push('Tutoring');
    if (lowerMessage.includes('repair') || lowerMessage.includes('fix')) categories.push('Home Repair');
    if (categories.length > 0) {
      extracted.categories = categories;
    }

    // Extract trades
    const trades: TradeCategory[] = [];
    if (lowerMessage.includes('plumb')) trades.push('plumbing');
    if (lowerMessage.includes('electric')) trades.push('electrical');
    if (lowerMessage.includes('carpent') || lowerMessage.includes('wood')) trades.push('carpentry');
    if (lowerMessage.includes('paint')) trades.push('painting');
    if (lowerMessage.includes('hvac') || lowerMessage.includes('ac') || lowerMessage.includes('heat')) trades.push('hvac');
    if (trades.length > 0) {
      extracted.trades = trades;
    }

    // Detect mode preference
    if (trades.length > 0) {
      extracted.mode = 'tradesmen';
    } else if (extracted.intent === 'poster') {
      extracted.mode = 'business';
    } else {
      extracted.mode = 'everyday';
    }

    return extracted;
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const currentData = { ...extractedData };
    const newData = await extractInfoFromConversation(userMessage);
    const mergedData = { ...currentData, ...newData };
    setExtractedData(mergedData);

    // Build context for AI
    const context = `
Current onboarding stage: ${conversationStage}
Extracted data so far: ${JSON.stringify(mergedData)}
User's latest message: ${userMessage}
Detected language: ${detectedLanguage}

You are HustleXP's friendly onboarding coach. Guide the user naturally through onboarding.
- If you detect a language other than English, acknowledge it positively and continue in English (translation happens separately)
- Ask one question at a time
- Be conversational and encouraging
- Extract: name, intent (worker/poster/both), skills/categories, trades (if applicable)
- When you have enough info, summarize and ask for confirmation
`;

    try {
      const response = await hustleAI.chat('ai-onboarding', context);
      let aiMessage = response.response;

      // Translate response if user prefers another language
      if (detectedLanguage !== 'en') {
        aiMessage = await translateText(aiMessage, detectedLanguage);
      }

      // Determine next stage
      const hasName = !!mergedData.name;
      const hasIntent = !!mergedData.intent;
      const hasCategories = (mergedData.categories?.length || 0) > 0 || (mergedData.trades?.length || 0) > 0;

      if (conversationStage === 'intro' && hasName) {
        setConversationStage('gathering');
      } else if (conversationStage === 'gathering' && hasName && hasIntent && hasCategories) {
        setConversationStage('confirming');
        
        // Generate confirmation message
        const confirmMsg = await generateConfirmationMessage(mergedData);
        return confirmMsg;
      }

      return aiMessage;
    } catch (error) {
      console.error('[AI_ONBOARDING] Error generating response:', error);
      return "I'm having trouble connecting right now. Could you tell me your name and what you're looking to do on HustleXP?";
    }
  };

  const generateConfirmationMessage = async (data: ExtractedData): Promise<string> => {
    const name = data.name || 'there';
    const intentText = data.intent === 'worker' ? 'find work and earn money' : 
                       data.intent === 'poster' ? 'hire workers for your projects' : 
                       'both work and hire others';
    
    const skillsText = data.trades && data.trades.length > 0 
      ? `skilled trades (${data.trades.join(', ')})`
      : data.categories && data.categories.length > 0
      ? `categories like ${data.categories.join(', ')}`
      : 'various tasks';

    let message = `Perfect, ${name}! 🎯 Let me confirm what I understood:\n\n`;
    message += `✓ You want to ${intentText}\n`;
    message += `✓ Interested in ${skillsText}\n`;
    if (data.mode) {
      const modeText = data.mode === 'tradesmen' ? '⚡ Tradesman Pro' : 
                       data.mode === 'business' ? '🏢 Business Poster' : 
                       '💪 Everyday Hustler';
      message += `✓ Starting as ${modeText}\n`;
    }
    message += `\nType "yes" to get started, or tell me what to change!`;

    if (detectedLanguage !== 'en') {
      message = await translateText(message, detectedLanguage);
    }

    return message;
  };

  const completeOnboardingWithData = async () => {
    if (!extractedData.name) {
      console.error('[AI_ONBOARDING] Cannot complete - missing name');
      return;
    }

    const role: UserRole = 
      extractedData.intent === 'both' ? 'both' :
      extractedData.intent === 'poster' ? 'poster' : 'worker';

    const mode: UserMode = extractedData.mode || 'everyday';
    const trades = extractedData.trades || [];

    setShowConfetti(true);
    triggerHaptic('success');

    await completeOnboarding(
      extractedData.name,
      role,
      {
        lat: 37.7749,
        lng: -122.4194,
        address: 'San Francisco, CA',
      },
      extractedData.email,
      undefined, // password (will be generated)
      mode,
      trades
    );

    setTimeout(() => {
      router.replace('/welcome-tutorial?fromOnboarding=true');
    }, 500);
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    triggerHaptic('light');

    // Add user message
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);

    setIsProcessing(true);

    try {
      // Check for confirmation
      const lowerMessage = userMessage.toLowerCase();
      if (conversationStage === 'confirming') {
        if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || 
            lowerMessage.includes('correct') || lowerMessage.includes('right') ||
            lowerMessage === 'ok' || lowerMessage === 'yep' || lowerMessage === 'yeah') {
          
          const completeMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: await translateText(
              "🎉 Awesome! Let's get you set up. Creating your account now...",
              detectedLanguage
            ),
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, completeMessage]);
          
          setTimeout(() => {
            completeOnboardingWithData();
          }, 1000);
          
          setIsProcessing(false);
          return;
        }
      }

      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage);

      const newAssistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error('[AI_ONBOARDING] Error processing message:', error);
      
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble processing that. Could you rephrase?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const isLastMessage = index === messages.length - 1;

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: isLastMessage ? slideAnim : 0 }],
          },
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[premiumColors.neonCyan, premiumColors.neonMagenta]}
              style={styles.avatar}
            >
              <Brain size={20} color={Colors.background} />
            </LinearGradient>
          </View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <BlurView intensity={isUser ? 30 : 40} tint="dark" style={styles.messageBlur}>
            <LinearGradient
              colors={
                isUser
                  ? [premiumColors.neonCyan + '40', premiumColors.neonBlue + '20']
                  : [premiumColors.glassDark + '80', premiumColors.glassDark + '60']
              }
              style={styles.messageGradient}
            >
              <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                {message.content}
              </Text>
            </LinearGradient>
          </BlurView>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack, '#1A1A2E']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {showConfetti && <Confetti />}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Sparkles size={24} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
            <Text style={styles.headerTitle}>HustleXP AI Coach</Text>
          </View>
          {detectedLanguage !== 'en' && (
            <View style={styles.languageBadge}>
              <Globe size={14} color={premiumColors.neonGreen} />
              <Text style={styles.languageText}>{detectedLanguage.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          
          {isProcessing && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <Loader size={16} color={premiumColors.neonCyan} />
                <Text style={styles.typingText}>AI is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.md }]}>
          <BlurView intensity={60} tint="dark" style={styles.inputBlur}>
            <View style={styles.inputWrapper}>
              <MessageCircle size={20} color={premiumColors.glassWhiteStrong} />
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor={premiumColors.glassWhiteStrong}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline
                maxLength={500}
                editable={!isProcessing}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!input.trim() || isProcessing) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!input.trim() || isProcessing}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    input.trim() && !isProcessing
                      ? [premiumColors.neonCyan, premiumColors.neonBlue]
                      : [premiumColors.glassWhite, premiumColors.glassWhite]
                  }
                  style={styles.sendButtonGradient}
                >
                  <Send size={18} color={input.trim() && !isProcessing ? Colors.background : premiumColors.glassWhiteStrong} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: premiumColors.neonGreen + '20',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 15,
    shadowOpacity: 0.8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  userBubble: {
    marginLeft: 'auto',
  },
  assistantBubble: {
    marginRight: 'auto',
  },
  messageBlur: {
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  messageGradient: {
    padding: spacing.md,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.text,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.xl,
    marginLeft: 44,
  },
  typingText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    fontStyle: 'italic' as const,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: premiumColors.deepBlack + 'F0',
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  inputBlur: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
