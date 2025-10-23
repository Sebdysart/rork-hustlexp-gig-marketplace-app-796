import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Clock, MapPin, DollarSign, Zap, Shield, CheckCircle, AlertCircle, Brain } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';



export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, tasks, messages, users } = useApp();
  
  const translationKeys = [
    'Task Tickets', 'Active Conversations', 'Just now', 'ago', 'h', 'd', 'NEW', 'URGENT',
    'Safety', 'Please log in', 'Sign in to view your task conversations',
    'No Active Tickets', 'Task conversations appear here when you accept or post a quest',
    'Task Offers', 'HustleAI Task Recommendations', 'Your AI task assistant'
  ];
  const translations = useTranslatedTexts(translationKeys);

  const conversations = useMemo(() => {
    if (!currentUser) return [];

    const hustleAIMessages = messages.filter(m => m.isHustleAI && m.senderId === 'hustleai');
    const hustleAIConversations = currentUser.activeMode !== 'business' ? [{
      task: {
        id: 'hustleai',
        title: 'Task Offers',
        category: 'other' as const,
        status: 'open' as const,
        posterId: 'hustleai',
        payAmount: 0,
        xpReward: 0,
        createdAt: new Date().toISOString(),
        description: 'HustleAI Task Recommendations',
        location: currentUser.location,
      },
      lastMessage: hustleAIMessages[hustleAIMessages.length - 1],
      unreadCount: hustleAIMessages.filter(m => m.offerStatus === 'pending').length,
      otherUser: {
        id: 'hustleai',
        name: 'HustleAI',
        profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=hustleai',
        email: 'ai@hustlexp.com',
        password: '',
        role: 'both' as const,
        location: currentUser.location,
        bio: 'Your AI task assistant',
        xp: 0,
        level: 99,
        badges: [],
        tasksCompleted: 0,
        earnings: 0,
        reputationScore: 5,
        streaks: { current: 0, longest: 0, lastTaskDate: '' },
        createdAt: new Date().toISOString(),
      },
    }] : [];

    const userTasks = tasks.filter(
      t => t.posterId === currentUser.id || t.workerId === currentUser.id
    );

    const taskConversations = userTasks.map(task => {
      const taskMessages = messages.filter(m => m.taskId === task.id && !m.isHustleAI);
      const lastMessage = taskMessages[taskMessages.length - 1];
      const unreadCount = taskMessages.filter(
        m => m.senderId !== currentUser.id
      ).length;

      const otherUserId = task.posterId === currentUser.id ? task.workerId : task.posterId;
      const otherUser = users.find(u => u.id === otherUserId);

      return {
        task,
        lastMessage,
        unreadCount,
        otherUser,
      };
    }).filter(c => c.otherUser);

    return [...hustleAIConversations, ...taskConversations];
  }, [currentUser, tasks, messages, users]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return translations[2];
    if (hours < 24) return `${hours}${translations[4]} ${translations[3]}`;
    return `${Math.floor(hours / 24)}${translations[5]} ${translations[3]}`;
  };

  const renderConversation = ({ item }: { item: typeof conversations[0] }) => {
    const isHustleAI = item.otherUser?.id === 'hustleai';
    const isWorker = !isHustleAI && 'workerId' in item.task && currentUser?.id === item.task.workerId;
    const isPoster = currentUser?.id === item.task.posterId;
    const statusColor = 
      isHustleAI ? premiumColors.neonViolet :
      item.task.status === 'in_progress' ? premiumColors.neonCyan :
      item.task.status === 'completed' ? premiumColors.neonGreen :
      Colors.textSecondary;

    return (
      <TouchableOpacity
        onPress={() => {
          triggerHaptic('light');
          if (item.task.id === 'hustleai') {
            router.push('/chat/hustleai');
          } else {
            router.push(`/chat/${item.task.id}`);
          }
        }}
        activeOpacity={0.9}
        testID={`chat-${item.task.id}`}
      >
        <GlassCard 
          variant="dark" 
          neonBorder 
          glowColor={isHustleAI ? 'neonViolet' : item.task.status === 'in_progress' ? 'neonCyan' : undefined}
          style={styles.chatCard}
        >
          <View style={styles.chatHeader}>
            <View style={styles.avatarContainer}>
              {isHustleAI ? (
                <View style={[styles.avatar, styles.aiAvatar]}>
                  <Brain size={32} color={premiumColors.neonViolet} strokeWidth={2} />
                </View>
              ) : (
                <Image source={{ uri: item.otherUser?.profilePic }} style={styles.avatar} />
              )}
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatNameRow}>
                <Text style={styles.chatName}>{item.otherUser?.name}</Text>
                {isHustleAI && item.unreadCount > 0 && (
                  <View style={styles.urgentBadge}>
                    <Zap size={10} color={premiumColors.neonViolet} fill={premiumColors.neonViolet} />
                    <Text style={[styles.urgentText, { color: premiumColors.neonViolet }]}>{item.unreadCount} {translations[6]}</Text>
                  </View>
                )}
                {!isHustleAI && 'urgency' in item.task && item.task.urgency === 'today' && (
                  <View style={styles.urgentBadge}>
                    <Zap size={10} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                    <Text style={styles.urgentText}>{translations[7]}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.taskTitle} numberOfLines={1}>{item.task.title}</Text>
              {!isHustleAI && (
                <View style={styles.taskMeta}>
                  <View style={styles.metaItem}>
                    <DollarSign size={12} color={premiumColors.neonGreen} />
                    <Text style={styles.metaText}>${item.task.payAmount}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MapPin size={12} color={premiumColors.neonViolet} />
                    <Text style={styles.metaText}>{item.task.location.address.split(',')[0]}</Text>
                  </View>
                </View>
              )}
            </View>
            <View style={styles.chatMeta}>
              {item.task.status === 'in_progress' && (
                <View style={styles.statusBadge}>
                  <Clock size={14} color={premiumColors.neonCyan} />
                </View>
              )}
              {item.task.status === 'completed' && (
                <View style={styles.statusBadge}>
                  <CheckCircle size={14} color={premiumColors.neonGreen} />
                </View>
              )}
              {item.task.status === 'cancelled' && (
                <View style={styles.statusBadge}>
                  <AlertCircle size={14} color={premiumColors.neonOrange} />
                </View>
              )}
            </View>
          </View>
          <View style={styles.chatFooter}>
            {item.lastMessage && (
              <View style={[
                styles.lastMessageContainer,
                isWorker && styles.workerMessage,
                isPoster && styles.posterMessage,
              ]}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage.text}
                </Text>
              </View>
            )}
            {item.lastMessage && (
              <Text style={styles.timestamp}>{formatTime(item.lastMessage.timestamp)}</Text>
            )}
          </View>
          {item.task.status === 'in_progress' && isWorker && (
            <TouchableOpacity
              style={styles.panicButton}
              onPress={(e) => {
                e.stopPropagation();
                triggerHaptic('warning');
                router.push(`/chat/${item.task.id}?panic=true`);
              }}
            >
              <Shield size={16} color="#fff" />
              <Text style={styles.panicText}>{translations[8]}</Text>
            </TouchableOpacity>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </GlassCard>
      </TouchableOpacity>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MessageCircle size={64} color={premiumColors.neonCyan} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyText}>{translations[9]}</Text>
        <Text style={styles.emptySubtext}>{translations[10]}</Text>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient 
          colors={[premiumColors.deepBlack, '#0A0A0F', premiumColors.deepBlack]} 
          style={styles.gradient}
        >
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 40 }]}>
            <Text style={styles.headerTitle}>{translations[0]}</Text>
            <Text style={styles.headerSubtitle}>{translations[1]}</Text>
          </View>
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MessageCircle size={64} color={premiumColors.neonCyan} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyText}>{translations[11]}</Text>
            <Text style={styles.emptySubtext}>
              {translations[12]}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={[premiumColors.deepBlack, '#0A0A0F', premiumColors.deepBlack]} 
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 40 }]}>
          <Text style={styles.headerTitle}>{translations[0]}</Text>
          <Text style={styles.headerSubtitle}>{translations[1]}</Text>
        </View>
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={item => item.task.id}
          contentContainerStyle={styles.listContent}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: -1,
    textShadowColor: premiumColors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  chatCard: {
    padding: 20,
    position: 'relative',
    overflow: 'visible',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
  },
  chatInfo: {
    flex: 1,
    gap: 6,
  },
  chatNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber,
  },
  urgentText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
    letterSpacing: 0.5,
  },
  taskTitle: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: premiumColors.glassWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatFooter: {
    gap: 8,
  },
  lastMessageContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: premiumColors.glassWhite,
  },
  workerMessage: {
    backgroundColor: premiumColors.neonGreen + '20',
    borderLeftWidth: 4,
    borderLeftColor: premiumColors.neonGreen,
    shadowColor: premiumColors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  posterMessage: {
    backgroundColor: premiumColors.neonCyan + '20',
    borderLeftWidth: 4,
    borderLeftColor: premiumColors.neonCyan,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  panicButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  aiAvatar: {
    backgroundColor: premiumColors.neonViolet + '20',
    borderColor: premiumColors.neonViolet,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panicText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
  },
  unreadBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: premiumColors.neonAmber,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
  },
  unreadText: {
    color: premiumColors.deepBlack,
    fontSize: 12,
    fontWeight: '900' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: premiumColors.deepBlack,
    padding: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: premiumColors.neonCyan + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '30',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
});
