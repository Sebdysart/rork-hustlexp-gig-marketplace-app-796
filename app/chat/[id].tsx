import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Send, Smile, Zap, Sparkles, Check, X, Clock, MapPin, DollarSign, Languages } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { generateText } from '@rork/toolkit-sdk';
import { premiumColors } from '@/constants/designTokens';
import { translateMessage, generateSmartReply, detectSpamOrScam } from '@/utils/aiChatAssistant';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiTranslationService } from '@/utils/aiTranslation';

const QUICK_COMMANDS = [
  { id: '/extend', label: 'Extend Time', icon: '⏰' },
  { id: '/complete', label: 'Mark Complete', icon: '✅' },
  { id: '/help', label: 'Need Help', icon: '🆘' },
  { id: '/thanks', label: 'Thank You!', icon: '🙏' },
];

const EMOJIS = ['👍', '👏', '🔥', '💪', '⭐', '🎉', '😊', '👌'];

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, tasks, users, sendMessage, getTaskMessages, messages: allMessages, respondToTaskOffer } = useApp();
  const [message, setMessage] = useState<string>('');
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [showCommands, setShowCommands] = useState<boolean>(false);
  const [isAIProcessing, setIsAIProcessing] = useState<boolean>(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [showSmartReplies, setShowSmartReplies] = useState<boolean>(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [translatingMessageIds, setTranslatingMessageIds] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  const { currentLanguage, useAITranslation } = useLanguage();

  const isHustleAI = id === 'hustleai';
  const task = useMemo(() => {
    if (isHustleAI) {
      return {
        id: 'hustleai',
        title: 'HustleAI Task Offers',
        category: 'other' as const,
        status: 'open' as const,
        posterId: 'hustleai',
        payAmount: 0,
        xpReward: 0,
        createdAt: new Date().toISOString(),
        description: 'AI-powered task recommendations',
        location: currentUser?.location || { lat: 0, lng: 0, address: '' },
      };
    }
    return tasks.find(t => t.id === id);
  }, [tasks, id, isHustleAI, currentUser]);
  
  const messages = useMemo(() => {
    if (isHustleAI) {
      return allMessages.filter(m => m.isHustleAI && m.senderId === 'hustleai');
    }
    return getTaskMessages(id || '');
  }, [id, getTaskMessages, isHustleAI, allMessages]);
  const otherUserId = useMemo(() => {
    if (isHustleAI) return 'hustleai';
    if (!task || !currentUser) return null;
    return task.posterId === currentUser.id ? task.workerId : task.posterId;
  }, [task, currentUser, isHustleAI]);
  
  const otherUser = useMemo(() => {
    if (isHustleAI) {
      return {
        id: 'hustleai',
        name: 'HustleAI',
        profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=hustleai',
        email: 'ai@hustlexp.com',
        password: '',
        role: 'both' as const,
        location: currentUser?.location || { lat: 0, lng: 0, address: '' },
        bio: 'Your AI task assistant',
        xp: 0,
        level: 99,
        badges: [],
        tasksCompleted: 0,
        earnings: 0,
        reputationScore: 5,
        streaks: { current: 0, longest: 0, lastTaskDate: '' },
        createdAt: new Date().toISOString(),
      };
    }
    return users.find(u => u.id === otherUserId);
  }, [users, otherUserId, isHustleAI, currentUser]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!message.trim() || !id) return;

    const messageText = message.trim();
    
    if (messageText.startsWith('/')) {
      handleCommand(messageText);
    } else {
      await handleCheckSpam(messageText);
      await sendMessage(id, messageText);
      triggerHaptic('light');
    }
    
    setMessage('');
    setShowEmojis(false);
    setShowCommands(false);
    setShowSmartReplies(false);
  };

  const handleCommand = async (command: string) => {
    if (!id) return;

    let responseText = '';
    switch (command) {
      case '/extend':
        responseText = '⏰ Requesting time extension...';
        break;
      case '/complete':
        responseText = '✅ Marking task as complete...';
        break;
      case '/help':
        responseText = '🆘 Requesting assistance...';
        break;
      case '/thanks':
        responseText = '🙏 Thank you for your help!';
        break;
      default:
        responseText = command;
    }
    
    await sendMessage(id, responseText);
    triggerHaptic('medium');
  };

  const handleEmojiPress = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  const handleCommandPress = (command: string) => {
    setMessage(command);
    setShowCommands(false);
  };

  const handleAIClarify = async () => {
    if (!message.trim()) {
      Alert.alert('Need Input', 'Please type a message first, then AI can help clarify it.');
      return;
    }

    setIsAIProcessing(true);
    triggerHaptic('medium');

    try {
      const clarified = await generateText({
        messages: [
          {
            role: 'user',
            content: `Clarify and improve this message for a gig work chat. Make it clear, professional, and friendly:

"${message}"

Return only the improved message, nothing else. Keep it concise (1-3 sentences).`,
          },
        ],
      });

      setMessage(clarified.trim());
      triggerHaptic('success');
    } catch (error) {
      console.error('AI clarification error:', error);
      Alert.alert('AI Error', 'Could not clarify message. Please try again.');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleAISuggestReply = async () => {
    if (messages.length === 0) {
      Alert.alert('No Messages', 'No messages to reply to yet.');
      return;
    }

    setIsAIProcessing(true);
    triggerHaptic('medium');

    try {
      const lastMessage = messages[messages.length - 1];
      const isFromOther = lastMessage.senderId !== currentUser?.id;

      if (!isFromOther) {
        Alert.alert('No Reply Needed', 'The last message is from you.');
        setIsAIProcessing(false);
        return;
      }

      const conversationHistory = messages
        .slice(-5)
        .map((m) => ({
          sender: m.senderId === currentUser?.id ? 'You' : otherUser?.name || 'Other',
          message: m.text,
        }));

      const replies = await generateSmartReply(conversationHistory, {
        taskTitle: task?.title || '',
        taskCategory: task?.category || 'other',
      });

      setSmartReplies(replies);
      setShowSmartReplies(true);
      triggerHaptic('success');
    } catch (error) {
      console.error('AI reply suggestion error:', error);
      Alert.alert('AI Error', 'Could not suggest reply. Please try again.');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!message.trim()) {
      Alert.alert('Need Input', 'Please type a message first.');
      return;
    }

    setIsAIProcessing(true);
    triggerHaptic('medium');

    try {
      const translated = await translateMessage(message, 'es');
      setMessage(translated);
      triggerHaptic('success');
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert('AI Error', 'Could not translate message.');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleCheckSpam = async (messageText: string) => {
    try {
      const result = await detectSpamOrScam(messageText);
      if (result.isSpam || result.isSuspicious) {
        Alert.alert(
          '⚠️ Warning',
          `This message may be ${result.isSpam ? 'spam' : 'suspicious'}.\n\n${result.reasoning}`,
          [
            { text: 'Report', style: 'destructive' },
            { text: 'Ignore', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Spam check error:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleTaskOfferResponse = async (messageId: string, response: 'accepted' | 'declined' | 'snoozed') => {
    await respondToTaskOffer(messageId, response);
    triggerHaptic(response === 'accepted' ? 'success' : 'light');
    
    if (response === 'accepted') {
      const message = messages.find(m => m.id === messageId);
      if (message?.taskOffer?.taskId) {
        router.push(`/task/${message.taskOffer.taskId}`);
      }
    }
  };

  const handleTranslateMessage = async (messageId: string, text: string, isFromOther: boolean) => {
    if (!isFromOther || !useAITranslation || currentLanguage === 'en') return;

    setTranslatingMessageIds(prev => new Set(prev).add(messageId));
    try {
      const translated = await aiTranslationService.translate([text], currentLanguage, 'auto');
      setTranslatedMessages(prev => ({ ...prev, [messageId]: translated[0] }));
    } catch (error) {
      console.error('[Chat] Translation failed:', error);
    } finally {
      setTranslatingMessageIds(prev => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (!useAITranslation || currentLanguage === 'en') return;

    messages.forEach(msg => {
      const isFromOther = msg.senderId !== currentUser?.id;
      if (isFromOther && !translatedMessages[msg.id] && !translatingMessageIds.has(msg.id)) {
        handleTranslateMessage(msg.id, msg.text, true);
      }
    });
  }, [messages, currentLanguage, useAITranslation]);

  const renderMessage = ({ item }: { item: typeof messages[0] }) => {
    const isCurrentUser = item.senderId === currentUser?.id;
    const sender = users.find(u => u.id === item.senderId);
    const isTranslating = translatingMessageIds.has(item.id);
    const translatedText = translatedMessages[item.id];

    if (item.isHustleAI && item.taskOffer) {
      const offer = item.taskOffer;
      const status = item.offerStatus || 'pending';
      
      return (
        <View style={styles.taskOfferContainer}>
          <View style={styles.taskOfferHeader}>
            <Image source={{ uri: otherUser?.profilePic }} style={styles.messageAvatar} />
            <View style={styles.taskOfferHeaderText}>
              <Text style={styles.taskOfferSender}>HustleAI</Text>
              <Text style={styles.taskOfferTime}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
          
          <View style={styles.taskOfferCard}>
            <Text style={styles.taskOfferMessage}>{item.text}</Text>
            
            <View style={styles.taskOfferDetails}>
              <Text style={styles.taskOfferTitle}>{offer.title}</Text>
              
              <View style={styles.taskOfferMeta}>
                <View style={styles.taskOfferMetaItem}>
                  <DollarSign size={16} color={premiumColors.neonGreen} />
                  <Text style={styles.taskOfferMetaText}>${offer.pay}</Text>
                </View>
                <View style={styles.taskOfferMetaItem}>
                  <MapPin size={16} color={premiumColors.neonViolet} />
                  <Text style={styles.taskOfferMetaText}>{offer.distance.toFixed(1)} km</Text>
                </View>
                <View style={styles.taskOfferMetaItem}>
                  <Clock size={16} color={premiumColors.neonCyan} />
                  <Text style={styles.taskOfferMetaText}>{offer.estimatedTime}</Text>
                </View>
              </View>
              
              <View style={styles.skillMatchBadge}>
                <Text style={styles.skillMatchText}>{offer.skillMatch}% skill match</Text>
              </View>
            </View>
            
            {status === 'pending' && (
              <View style={styles.taskOfferActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleTaskOfferResponse(item.id, 'accepted')}
                  activeOpacity={0.8}
                >
                  <Check size={20} color={Colors.text} strokeWidth={3} />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleTaskOfferResponse(item.id, 'declined')}
                  activeOpacity={0.8}
                >
                  <X size={20} color={Colors.textSecondary} strokeWidth={2.5} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.snoozeButton}
                  onPress={() => handleTaskOfferResponse(item.id, 'snoozed')}
                  activeOpacity={0.8}
                >
                  <Clock size={20} color={Colors.textSecondary} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
            
            {status === 'accepted' && (
              <View style={styles.taskOfferStatusBadge}>
                <Check size={16} color={premiumColors.neonGreen} />
                <Text style={[styles.taskOfferStatusText, { color: premiumColors.neonGreen }]}>Accepted</Text>
              </View>
            )}
            
            {status === 'declined' && (
              <View style={styles.taskOfferStatusBadge}>
                <X size={16} color={Colors.textSecondary} />
                <Text style={[styles.taskOfferStatusText, { color: Colors.textSecondary }]}>Declined</Text>
              </View>
            )}
            
            {status === 'snoozed' && (
              <View style={styles.taskOfferStatusBadge}>
                <Clock size={16} color={premiumColors.neonAmber} />
                <Text style={[styles.taskOfferStatusText, { color: premiumColors.neonAmber }]}>Snoozed</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        {!isCurrentUser && (
          <Image source={{ uri: sender?.profilePic }} style={styles.messageAvatar} />
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
          ]}
        >
          <View>
            <Text
              style={[
                styles.messageText,
                isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
              ]}
            >
              {!isCurrentUser && translatedText ? translatedText : item.text}
            </Text>
            {!isCurrentUser && translatedText && (
              <TouchableOpacity
                style={styles.translationBadge}
                onPress={() => {
                  setTranslatedMessages(prev => {
                    const next = { ...prev };
                    delete next[item.id];
                    return next;
                  });
                }}
              >
                <Languages size={10} color={premiumColors.neonCyan} />
                <Text style={styles.translationBadgeText}>Translated</Text>
                <Text style={styles.translationBadgeHint}>Tap to see original</Text>
              </TouchableOpacity>
            )}
            {isTranslating && (
              <View style={styles.translatingBadge}>
                <ActivityIndicator size="small" color={premiumColors.neonCyan} />
                <Text style={styles.translatingText}>Translating...</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.messageTime,
              isCurrentUser ? styles.messageTimeRight : styles.messageTimeLeft,
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
        {isCurrentUser && (
          <Image source={{ uri: sender?.profilePic }} style={styles.messageAvatar} />
        )}
      </View>
    );
  };

  if (!task || !currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: otherUser?.name || 'Chat',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <Zap size={14} color={Colors.accent} />
            <Text style={styles.taskXP}>+{task.xpReward} XP</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {showEmojis && (
          <View style={styles.emojiPicker}>
            {EMOJIS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiButton}
                onPress={() => handleEmojiPress(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showCommands && (
          <View style={styles.commandPicker}>
            {QUICK_COMMANDS.map(cmd => (
              <TouchableOpacity
                key={cmd.id}
                style={styles.commandButton}
                onPress={() => handleCommandPress(cmd.id)}
              >
                <Text style={styles.commandIcon}>{cmd.icon}</Text>
                <Text style={styles.commandLabel}>{cmd.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showSmartReplies && smartReplies.length > 0 && (
          <View style={styles.smartRepliesContainer}>
            <Text style={styles.smartRepliesTitle}>Quick Replies</Text>
            {smartReplies.map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={styles.smartReplyButton}
                onPress={() => {
                  setMessage(reply);
                  setShowSmartReplies(false);
                  triggerHaptic('light');
                }}
              >
                <Text style={styles.smartReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.aiAssistBar}>
          <TouchableOpacity
            style={styles.aiAssistButton}
            onPress={handleAIClarify}
            disabled={isAIProcessing || !message.trim()}
          >
            {isAIProcessing ? (
              <ActivityIndicator size="small" color={premiumColors.neonViolet} />
            ) : (
              <Sparkles size={16} color={premiumColors.neonViolet} />
            )}
            <Text style={styles.aiAssistButtonText}>AI Clarify</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aiAssistButton}
            onPress={handleAISuggestReply}
            disabled={isAIProcessing}
          >
            {isAIProcessing ? (
              <ActivityIndicator size="small" color={premiumColors.neonCyan} />
            ) : (
              <Sparkles size={16} color={premiumColors.neonCyan} />
            )}
            <Text style={styles.aiAssistButtonText}>AI Suggest Reply</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setShowEmojis(!showEmojis);
              setShowCommands(false);
            }}
          >
            <Smile size={24} color={showEmojis ? Colors.accent : Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setShowCommands(!showCommands);
              setShowEmojis(false);
            }}
          >
            <Zap size={24} color={showCommands ? Colors.accent : Colors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={20} color={message.trim() ? Colors.background : Colors.textSecondary} />
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
  taskHeader: {
    backgroundColor: Colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  taskMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  taskXP: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row' as const,
    marginBottom: 16,
    alignItems: 'flex-end' as const,
  },
  messageLeft: {
    justifyContent: 'flex-start' as const,
  },
  messageRight: {
    justifyContent: 'flex-end' as const,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
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
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageTimeLeft: {
    color: Colors.textSecondary,
  },
  messageTimeRight: {
    color: Colors.background,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
  },
  emojiPicker: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    backgroundColor: Colors.card,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  emojiButton: {
    padding: 8,
  },
  emoji: {
    fontSize: 28,
  },
  commandPicker: {
    backgroundColor: Colors.card,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  commandButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  commandIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  commandLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  aiAssistBar: {
    flexDirection: 'row' as const,
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
    gap: 12,
  },
  aiAssistButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  aiAssistButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  smartRepliesContainer: {
    backgroundColor: Colors.card,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  smartRepliesTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  smartReplyButton: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  smartReplyText: {
    fontSize: 14,
    color: Colors.text,
  },
  taskOfferContainer: {
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  taskOfferHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: Colors.surface,
  },
  taskOfferHeaderText: {
    flex: 1,
    marginLeft: 8,
  },
  taskOfferSender: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  taskOfferTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  taskOfferCard: {
    padding: 16,
  },
  taskOfferMessage: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskOfferDetails: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  taskOfferTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  taskOfferMeta: {
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 12,
  },
  taskOfferMetaItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  taskOfferMetaText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  skillMatchBadge: {
    alignSelf: 'flex-start' as const,
    backgroundColor: premiumColors.neonViolet,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillMatchText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  taskOfferActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    backgroundColor: premiumColors.neonGreen,
    paddingVertical: 12,
    borderRadius: 12,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  declineButton: {
    width: 48,
    height: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  snoozeButton: {
    width: 48,
    height: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  taskOfferStatusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  taskOfferStatusText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  translationBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: premiumColors.neonCyan + '15',
  },
  translationBadgeText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  translationBadgeHint: {
    fontSize: 8,
    color: premiumColors.neonCyan,
    opacity: 0.7,
    marginLeft: 4,
  },
  translatingBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginTop: 4,
  },
  translatingText: {
    fontSize: 10,
    color: premiumColors.neonCyan,
    fontStyle: 'italic' as const,
  },
});
