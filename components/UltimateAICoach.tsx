import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, X, Send, Mic, Settings as SettingsIcon, Trash2, Check, MapPin, MessageCircle, DollarSign } from 'lucide-react-native';
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { COLORS } from '@/constants/designTokens';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 60;
const CHAT_WIDTH = SCREEN_WIDTH - 40;
const CHAT_HEIGHT = SCREEN_HEIGHT * 0.7;

export default function UltimateAICoach() {
  const { isOpen, open, close, messages, isLoading, sendMessage, clearHistory, settings, updateSettings, currentContext } = useUltimateAICoach();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [actionConfirm, setActionConfirm] = useState<any>(null);
  
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - BUTTON_SIZE - 20, y: SCREEN_HEIGHT - 200 })).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });

        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();

        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          open();
        }

        const finalX = Math.max(0, Math.min(SCREEN_WIDTH - BUTTON_SIZE, (pan.x as any)._value));
        const finalY = Math.max(60, Math.min(SCREEN_HEIGHT - BUTTON_SIZE - 100, (pan.y as any)._value));

        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  }, [inputText, sendMessage]);

  const handleActionPress = useCallback((action: any) => {
    if (action.type === 'execute') {
      // Show confirmation for execute actions
      setActionConfirm(action);
    } else if (action.type === 'navigate' && action.data?.screen) {
      close();
      
      // Smart navigation with parameters
      if (action.data.id) {
        router.push(`/${action.data.screen}/${action.data.id}` as any);
      } else {
        router.push(`/${action.data.screen}` as any);
      }
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [close, router]);

  const executeAction = useCallback((action: any) => {
    // Execute the action and close confirmation
    if (action.data?.callback) {
      action.data.callback();
    }
    
    setActionConfirm(null);
    
    // Show success message
    sendMessage(`✅ ${action.label} completed!`);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [sendMessage]);

  const renderContextActions = useCallback(() => {
    if (!currentContext.screen) return null;

    const actions = [];

    // Task Detail screen actions
    if (currentContext.screen === 'task-detail' && currentContext.canAccept) {
      actions.push(
        <TouchableOpacity
          key="accept-task"
          style={styles.contextActionButton}
          onPress={() => handleActionPress({
            type: 'execute',
            label: 'Accept This Quest',
            icon: <Check color="#FFF" size={18} />,
            data: { action: 'accept_task', taskId: currentContext.taskId },
          })}
        >
          <Check color="#FFF" size={18} />
          <Text style={styles.contextActionText}>Accept Quest</Text>
        </TouchableOpacity>
      );
    }

    // Home screen actions
    if (currentContext.screen === 'home' && currentContext.availableTasks > 0) {
      actions.push(
        <TouchableOpacity
          key="view-nearby"
          style={styles.contextActionButton}
          onPress={() => handleActionPress({
            type: 'navigate',
            label: 'View Nearby Quests',
            data: { screen: 'tasks' },
          })}
        >
          <MapPin color="#FFF" size={18} />
          <Text style={styles.contextActionText}>Nearby ({currentContext.availableTasks})</Text>
        </TouchableOpacity>
      );
    }

    // General earnings action
    if (currentContext.userXP) {
      actions.push(
        <TouchableOpacity
          key="view-earnings"
          style={styles.contextActionButton}
          onPress={() => handleActionPress({
            type: 'navigate',
            label: 'View Earnings',
            data: { screen: 'wallet' },
          })}
        >
          <DollarSign color="#FFF" size={18} />
          <Text style={styles.contextActionText}>Earnings</Text>
        </TouchableOpacity>
      );
    }

    if (actions.length === 0) return null;

    return (
      <View style={styles.contextActionsBar}>
        <Text style={styles.contextLabel}>Quick Actions:</Text>
        <View style={styles.contextActions}>
          {actions.map((action) => action)}
        </View>
      </View>
    );
  }, [currentContext, handleActionPress]);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(138, 43, 226, 0.3)', 'rgba(138, 43, 226, 0.8)'],
  });

  const hiddenScreens = ['/', '/index', '/welcome', '/onboarding', '/ai-onboarding', '/sign-in'];
  const shouldHide = hiddenScreens.includes(pathname);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <Animated.View
        style={[
          styles.floatingButton,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: pulseAnim },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[styles.glow, { backgroundColor: glowColor }]} />
        <LinearGradient
          colors={['#8A2BE2', '#9D4EDD', '#C77DFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Sparkles color="#FFF" size={28} strokeWidth={2.5} />
        </LinearGradient>
        
        {messages.filter(m => !m.proactive).length === 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>!</Text>
          </View>
        )}
      </Animated.View>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={close}
          />
          
          <View style={styles.chatContainer}>
            <BlurView intensity={80} tint="dark" style={styles.chatBlur}>
              <LinearGradient
                colors={['rgba(18, 18, 18, 0.95)', 'rgba(30, 30, 30, 0.95)']}
                style={styles.chatGradient}
              >
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <View style={styles.aiAvatar}>
                      <Sparkles color={COLORS.accent} size={24} />
                    </View>
                    <View>
                      <Text style={styles.headerTitle}>{t('ai_coach.ai_coach_title')}</Text>
                      <Text style={styles.headerSubtitle}>{t('ai_coach.ai_coach_subtitle')}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.headerActions}>
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={() => setShowSettings(!showSettings)}
                    >
                      <SettingsIcon color={COLORS.textSecondary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={close}
                    >
                      <X color={COLORS.textSecondary} size={24} />
                    </TouchableOpacity>
                  </View>
                </View>

                {showSettings && (
                  <View style={styles.settingsPanel}>
                    <TouchableOpacity
                      style={styles.settingItem}
                      onPress={() => updateSettings({ proactiveAlertsEnabled: !settings.proactiveAlertsEnabled })}
                    >
                      <Text style={styles.settingLabel}>{t('ai_coach.proactive_alerts')}</Text>
                      <View style={[styles.toggle, settings.proactiveAlertsEnabled && styles.toggleActive]} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.settingItem}
                      onPress={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
                    >
                      <Text style={styles.settingLabel}>{t('ai_coach.haptic_feedback')}</Text>
                      <View style={[styles.toggle, settings.hapticFeedback && styles.toggleActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.settingItem}
                      onPress={() => updateSettings({ autoHighlight: !settings.autoHighlight })}
                    >
                      <Text style={styles.settingLabel}>{t('ai_coach.auto_highlight')}</Text>
                      <View style={[styles.toggle, settings.autoHighlight && styles.toggleActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.settingItem, styles.dangerItem]}
                      onPress={clearHistory}
                    >
                      <Trash2 color="#FF4444" size={18} />
                      <Text style={styles.dangerLabel}>{t('ai_coach.clear_history')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <ScrollView 
                  style={styles.messagesContainer}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.length === 0 && (
                    <View style={styles.emptyState}>
                      <Sparkles color={COLORS.accent} size={48} />
                      <Text style={styles.emptyTitle}>{t('ai_coach.ai_coach_welcome')}</Text>
                      <Text style={styles.emptySubtitle}>{t('ai_coach.ai_coach_welcome_subtitle')}</Text>
                      
                      <View style={styles.quickActions}>
                        <TouchableOpacity
                          style={styles.quickActionButton}
                          onPress={() => sendMessage(t('ai_coach.show_best_quests'))}
                        >
                          <Text style={styles.quickActionText}>🎯 {t('ai_coach.show_best_quests')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.quickActionButton}
                          onPress={() => sendMessage(t('ai_coach.how_to_earn_more'))}
                        >
                          <Text style={styles.quickActionText}>💰 {t('ai_coach.how_to_earn_more')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.quickActionButton}
                          onPress={() => sendMessage(t('ai_coach.whats_my_progress'))}
                        >
                          <Text style={styles.quickActionText}>📊 {t('ai_coach.whats_my_progress')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {messages.map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.messageBubble,
                        message.role === 'user' ? styles.userBubble : styles.aiBubble,
                        message.proactive && styles.proactiveBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          message.role === 'user' && styles.userText,
                        ]}
                      >
                        {message.content}
                      </Text>

                      {message.actions && message.actions.length > 0 && (
                        <View style={styles.actionsContainer}>
                          {message.actions.map((action, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.actionButton}
                              onPress={() => handleActionPress(action)}
                            >
                              <Text style={styles.actionIcon}>{action.icon}</Text>
                              <Text style={styles.actionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}

                  {isLoading && (
                    <View style={[styles.messageBubble, styles.aiBubble]}>
                      <View style={styles.typingIndicator}>
                        <View style={[styles.typingDot, { animationDelay: '0ms' as any }]} />
                        <View style={[styles.typingDot, { animationDelay: '150ms' as any }]} />
                        <View style={[styles.typingDot, { animationDelay: '300ms' as any }]} />
                      </View>
                    </View>
                  )}
                </ScrollView>

                {renderContextActions()}

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('ai_coach.ask_ai_anything')}
                    placeholderTextColor={COLORS.textSecondary}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSend}
                    multiline
                    maxLength={500}
                  />
                  
                  <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || isLoading}
                  >
                    <LinearGradient
                      colors={inputText.trim() ? ['#8A2BE2', '#9D4EDD'] : ['#333', '#444']}
                      style={styles.sendGradient}
                    >
                      <Send color="#FFF" size={20} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        visible={actionConfirm !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActionConfirm(null)}
      >
        <View style={styles.confirmContainer}>
          <TouchableOpacity 
            style={styles.confirmBackdrop} 
            activeOpacity={1} 
            onPress={() => setActionConfirm(null)}
          />
          
          <BlurView intensity={80} tint="dark" style={styles.confirmCard}>
            <View style={styles.confirmContent}>
              <Text style={styles.confirmTitle}>Confirm Action</Text>
              <Text style={styles.confirmMessage}>
                {actionConfirm?.label}
              </Text>
              
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={() => setActionConfirm(null)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.confirmButton, styles.executeButton]}
                  onPress={() => executeAction(actionConfirm)}
                >
                  <LinearGradient
                    colors={['#8A2BE2', '#9D4EDD']}
                    style={styles.executeGradient}
                  >
                    <Text style={styles.executeText}>Confirm</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 9999,
  },
  glow: {
    position: 'absolute',
    width: BUTTON_SIZE + 20,
    height: BUTTON_SIZE + 20,
    borderRadius: (BUTTON_SIZE + 20) / 2,
    top: -10,
    left: -10,
  },
  buttonGradient: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  chatContainer: {
    height: CHAT_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  chatBlur: {
    flex: 1,
  },
  chatGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsPanel: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  toggleActive: {
    backgroundColor: COLORS.accent,
  },
  dangerItem: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  dangerLabel: {
    fontSize: 14,
    color: '#FF4444',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  quickActions: {
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
  quickActionButton: {
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  quickActionText: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '85%',
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  proactiveBubble: {
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  userText: {
    color: '#FFF',
  },
  actionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.4)',
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600' as const,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
    opacity: 0.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextActionsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  contextActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contextActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(138, 43, 226, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.5)',
  },
  contextActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  confirmContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  confirmCard: {
    width: SCREEN_WIDTH - 64,
    borderRadius: 20,
    overflow: 'hidden',
  },
  confirmContent: {
    padding: 24,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  executeButton: {
    overflow: 'hidden',
  },
  executeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  executeText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
});
