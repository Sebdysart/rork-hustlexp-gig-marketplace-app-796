import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Platform, Animated, Switch } from 'react-native';
import { useState, useMemo, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, TrendingUp, Map, Zap, Search, Bookmark, Trophy, Users, Flame, Brain, Wand2, Briefcase, Mic, Lightbulb, Power, Plus } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';
import Colors from '@/constants/colors';
import { TaskCardSkeleton, StatCardSkeleton } from '@/components/SkeletonLoader';

import FloatingHUD from '@/components/FloatingHUD';
import { triggerHaptic } from '@/utils/haptics';
import GlassCard from '@/components/GlassCard';
import { premiumColors } from '@/constants/designTokens';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import UnifiedModeSwitcher from '@/components/UnifiedModeSwitcher';
import FloatingChatIcon from '@/components/FloatingChatIcon';
import InviteFriendsWidget from '@/components/InviteFriendsWidget';
import SocialProofBanner from '@/components/SocialProofBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 768;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}



export default function HomeScreen() {
  const { currentUser, availableTasks, myTasks, updateAvailabilityStatus } = useApp();
  const { settings, canAcceptMoreQuests, getRemainingQuests } = useSettings();
  const { fetchProfile } = useAIProfile();
  const { translateText } = useLanguage();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  const translationKeys = [
    'Morning', 'Afternoon', 'Evening',
    'nearby gig', 'nearby gigs', 'hiring now',
    'Your quests are live', 'Ready to hustle?',
    'What do you need done today?', 'Tell me or type your task, and I\'ll create it for you',
    'Type your task here...', 'Inspire me with trending tasks',
    'Quest Command Center', 'Manage your missions & find adventurers',
    'Active', 'In Progress', 'Completed',
    'AI Task Creator', 'Tell me what you need', 'Manual Post',
    'Your Active Quests', 'View All', 'No Active Quests',
    'Create your first quest using AI or manual posting',
    'Open', 'Quests', 'Rating', 'Streak',
    'Quick Access', 'Watchlist', 'Seasons', 'Squad Quests', 'Streak Savers',
    'AI Coach', 'Get personalized insights & recommendations',
    'Go Available Mode', 'You\'re visible to posters nearby', 'You\'re offline',
    'You\'re all set! Check Messages for task offers 💬'
  ];
  const translations = useTranslatedTexts(translationKeys);

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (settings.reducedMotion) {
      shimmerAnim.setValue(0.5);
      pulseAnim.setValue(1);
      glowAnim.setValue(0.5);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (isAvailable) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
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
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [shimmerAnim, pulseAnim, glowAnim, isAvailable, settings.reducedMotion]);

  const onRefresh = () => {
    triggerHaptic('light');
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };



  useEffect(() => {
    if (currentUser) {
      console.log('[Home] Fetching AI profile for user:', currentUser.id);
      fetchProfile(currentUser.id);
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [currentUser, fetchProfile]);

  const handleStreakPress = () => {
    triggerHaptic('success');
    console.log('Streak pressed');
  };

  const isWorker = currentUser?.role === 'worker' || currentUser?.role === 'both';
  const isPoster = currentUser?.role === 'poster';

  const toggleAvailability = async () => {
    if (!currentUser) return;
    triggerHaptic('medium');
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    if (newStatus) {
      await updateAvailabilityStatus('available_now');
      console.log('Availability ON - HustleAI will send task offers');
    } else {
      await updateAvailabilityStatus('offline');
      console.log('Availability OFF');
    }
  };

  const nearbyGigs = useMemo(() => {
    if (!isWorker || !currentUser) return [];
    return availableTasks.filter(task => {
      const distance = calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        task.location.lat,
        task.location.lng
      );
      return distance <= 10;
    }).slice(0, 5);
  }, [availableTasks, currentUser, isWorker]);



  const hiringNowCount = useMemo(() => {
    return availableTasks.filter(t => {
      const createdTime = new Date(t.createdAt).getTime();
      const now = Date.now();
      return now - createdTime < 2 * 60 * 60 * 1000;
    }).length;
  }, [availableTasks]);

  if (!currentUser) {
    return null;
  }

  const getMissionCopy = () => {
    const hour = new Date().getHours();
    const greetingKey = hour < 12 ? translations[0] : hour < 18 ? translations[1] : translations[2];
    
    if (isWorker && nearbyGigs.length > 0) {
      const gigText = nearbyGigs.length > 1 ? translations[4] : translations[3];
      return `${greetingKey}, ${currentUser.name}. ${nearbyGigs.length} ${gigText} ${translations[5]}.`;
    }
    if (isPoster && myTasks.filter(t => t.status === 'open').length > 0) {
      return `${greetingKey}, ${currentUser.name}. ${translations[6]}.`;
    }
    return `${greetingKey}, ${currentUser.name}. ${translations[7]}`;
  };

  const getBackgroundGradient = (): [string, string, ...string[]] => {
    const level = currentUser.level;
    if (level >= 100) return [premiumColors.deepBlack, premiumColors.charcoal, '#3E1F4E'];
    if (level >= 50) return [premiumColors.deepBlack, premiumColors.charcoal, '#2E1F3E'];
    if (level >= 25) return [premiumColors.deepBlack, premiumColors.charcoal, '#2E1F2E'];
    if (level >= 10) return [premiumColors.deepBlack, premiumColors.charcoal, '#1F1B2E'];
    return [premiumColors.deepBlack, premiumColors.charcoal, premiumColors.richBlack];
  };

  if (isPoster) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={getBackgroundGradient()}
          style={styles.gradient}
        >
          <FloatingHUD 
            currentXP={currentUser.xp} 
            level={currentUser.level} 
            streakCount={currentUser.streaks.current}
            onStreakPress={handleStreakPress}
          />
          
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.select({ ios: 120, android: 90, default: 90 }) }]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
            }
          >
            <View style={styles.modeSwitcherContainer}>
              <UnifiedModeSwitcher compact />
            </View>

            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.missionCopy}>{getMissionCopy()}</Text>
                {hiringNowCount > 0 && (
                  <View style={styles.urgencyBadge}>
                    <Zap size={14} color={Colors.accent} />
                    <Text style={styles.urgencyText}>{hiringNowCount} hiring now</Text>
                  </View>
                )}
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => {
                    triggerHaptic('medium');
                    router.push('/search');
                  }}
                >
                  <Search size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.aiPromptSection}>
              <View style={styles.aiOrbContainer}>
                <Animated.View
                  style={[
                    styles.aiOrb,
                    {
                      transform: [{
                        scale: shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1],
                        }),
                      }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiOrbGradient}
                  >
                    <Brain size={32} color={Colors.text} strokeWidth={2} />
                  </LinearGradient>
                </Animated.View>
              </View>

              <Text style={styles.aiPromptTitle}>{translations[8]}</Text>
              <Text style={styles.aiPromptSubtitle}>{translations[9]}</Text>

              <View style={styles.aiInputRow}>
                <TouchableOpacity
                  style={styles.micButton}
                  onPress={() => {
                    triggerHaptic('medium');
                    console.log('Voice input');
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[premiumColors.neonViolet, premiumColors.neonViolet + 'CC']}
                    style={styles.micButtonGradient}
                  >
                    <Mic size={24} color={Colors.text} strokeWidth={2.5} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.textInputButton}
                  onPress={() => {
                    triggerHaptic('medium');
                    router.push('/ai-task-creator');
                  }}
                  activeOpacity={0.9}
                >
                  <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.textInputCard}>
                    <Text style={styles.textInputPlaceholder}>{translations[10]}</Text>
                    <Wand2 size={20} color={premiumColors.neonCyan} strokeWidth={2} />
                  </GlassCard>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.inspireMeButton}
                onPress={() => {
                  triggerHaptic('light');
                  console.log('Inspire me');
                }}
                activeOpacity={0.8}
              >
                <Lightbulb size={16} color={premiumColors.neonAmber} />
                <Text style={styles.inspireMeText}>{translations[11]}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.posterHeroSection}>
              <LinearGradient
                colors={[premiumColors.neonCyan + '25', premiumColors.neonViolet + '15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.posterHeroGradient}
              >
                <View style={styles.posterHeroContent}>
                  <View style={styles.posterHeroHeader}>
                    <View style={styles.posterHeroIcon}>
                      <Briefcase size={32} color={premiumColors.neonCyan} strokeWidth={2.5} />
                    </View>
                    <View style={styles.posterHeroText}>
                      <Text style={styles.posterHeroTitle}>{translations[12]}</Text>
                      <Text style={styles.posterHeroSubtitle}>{translations[13]}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.posterStatsGrid}>
                    <View style={styles.posterStatItem}>
                      <Text style={styles.posterStatValue}>{myTasks.filter(t => t.status === 'open').length}</Text>
                      <Text style={styles.posterStatLabel}>{translations[14]}</Text>
                    </View>
                    <View style={styles.posterStatDivider} />
                    <View style={styles.posterStatItem}>
                      <Text style={styles.posterStatValue}>{myTasks.filter(t => t.status === 'in_progress').length}</Text>
                      <Text style={styles.posterStatLabel}>{translations[15]}</Text>
                    </View>
                    <View style={styles.posterStatDivider} />
                    <View style={styles.posterStatItem}>
                      <Text style={styles.posterStatValue}>{myTasks.filter(t => t.status === 'completed').length}</Text>
                      <Text style={styles.posterStatLabel}>{translations[16]}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.posterActionsRow}>
              <TouchableOpacity
                style={styles.posterPrimaryAction}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/ai-task-creator');
                }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[premiumColors.neonViolet, premiumColors.neonViolet + 'CC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.posterPrimaryActionGradient}
                >
                  <Wand2 size={24} color={Colors.text} strokeWidth={2.5} />
                  <View style={styles.posterActionText}>
                    <Text style={styles.posterActionTitle}>{translations[17]}</Text>
                    <Text style={styles.posterActionSubtitle}>{translations[18]}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.posterSecondaryAction}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/post-task');
                }}
                activeOpacity={0.9}
              >
                <GlassCard variant="dark" neonBorder glowColor="neonCyan" style={styles.posterSecondaryActionCard}>
                  <Plus size={28} color={premiumColors.neonCyan} strokeWidth={2.5} />
                  <Text style={styles.posterSecondaryActionText}>{translations[19]}</Text>
                </GlassCard>
              </TouchableOpacity>
            </View>

            <View style={styles.posterQuestsSection}>
              <View style={styles.posterQuestsHeader}>
                <Text style={styles.posterQuestsTitle}>{translations[20]}</Text>
                {myTasks.length > 0 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => {
                      triggerHaptic('light');
                      router.push('/(tabs)/tasks');
                    }}
                  >
                    <Text style={styles.viewAllText}>{translations[21]}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isLoading ? (
                <View style={styles.posterQuestsList}>
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                </View>
              ) : myTasks.length > 0 ? (
                <View style={styles.posterQuestsList}>
                  {myTasks.slice(0, 3).map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.posterQuestCard}
                      onPress={() => {
                        triggerHaptic('light');
                        router.push(`/task/${task.id}`);
                      }}
                      activeOpacity={0.8}
                    >
                      <GlassCard variant="dark" style={styles.posterQuestCardInner}>
                        <View style={styles.posterQuestCardHeader}>
                          <View style={[
                            styles.posterQuestStatus,
                            { backgroundColor: task.status === 'open' ? premiumColors.neonCyan + '20' : task.status === 'in_progress' ? premiumColors.neonAmber + '20' : premiumColors.neonGreen + '20' }
                          ]}>
                            <View style={[
                              styles.posterQuestStatusDot,
                              { backgroundColor: task.status === 'open' ? premiumColors.neonCyan : task.status === 'in_progress' ? premiumColors.neonAmber : premiumColors.neonGreen }
                            ]} />
                            <Text style={[
                              styles.posterQuestStatusText,
                              { color: task.status === 'open' ? premiumColors.neonCyan : task.status === 'in_progress' ? premiumColors.neonAmber : premiumColors.neonGreen }
                            ]}>
                              {task.status === 'open' ? translations[23] : task.status === 'in_progress' ? translations[15] : translations[16]}
                            </Text>
                          </View>
                          <Text style={styles.posterQuestPay}>${task.payAmount}</Text>
                        </View>
                        <Text style={styles.posterQuestTitle} numberOfLines={1}>{task.title}</Text>
                        <Text style={styles.posterQuestCategory}>{task.category}</Text>
                      </GlassCard>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <GlassCard variant="dark" style={styles.posterEmptyState}>
                  <View style={styles.posterEmptyIcon}>
                    <Sparkles size={48} color={premiumColors.neonCyan} strokeWidth={1.5} />
                  </View>
                  <Text style={styles.posterEmptyTitle}>{translations[22]}</Text>
                  <Text style={styles.posterEmptyText}>{translations[23]}</Text>
                </GlassCard>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getBackgroundGradient()}
        style={styles.gradient}
      >
        <FloatingHUD 
          currentXP={currentUser.xp} 
          level={currentUser.level} 
          streakCount={currentUser.streaks.current}
          onStreakPress={handleStreakPress}
        />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.select({ ios: 120, android: 90, default: 90 }) }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
        >
          <View style={styles.modeSwitcherContainer}>
              <UnifiedModeSwitcher compact />
            </View>

            <InviteFriendsWidget userId={currentUser.id} userName={currentUser.name} variant="compact" />
            
            <SocialProofBanner compact />



            <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.missionCopy}>{getMissionCopy()}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/search');
                }}
                accessible
                accessibilityLabel="Search for tasks"
                accessibilityHint="Opens search screen"
                accessibilityRole="button"
              >
                <Search size={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/adventure-map');
                }}
                accessible
                accessibilityLabel="View adventure map"
                accessibilityHint="Opens map with nearby tasks"
                accessibilityRole="button"
              >
                <Map size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View style={[styles.availabilityCard, { transform: [{ scale: pulseAnim }] }]}>
            <GlassCard variant="darkStrong" neonBorder glowColor={isAvailable ? "neonGreen" : "neonCyan"} style={styles.availabilityCardInner}>
              <LinearGradient
                colors={isAvailable ? [premiumColors.neonGreen + '25', premiumColors.neonCyan + '15'] : [premiumColors.neonCyan + '15', premiumColors.neonViolet + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.availabilityGradient}
              >
                <View style={styles.availabilityHeader}>
                  <View style={styles.availabilityLeft}>
                    <Animated.View style={[
                      styles.availabilityIcon,
                      {
                        backgroundColor: isAvailable ? premiumColors.neonGreen + '30' : premiumColors.neonCyan + '20',
                        opacity: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      }
                    ]}>
                      <Power size={28} color={isAvailable ? premiumColors.neonGreen : premiumColors.neonCyan} strokeWidth={2.5} />
                    </Animated.View>
                    <View style={styles.availabilityTextContainer}>
                      <Text style={styles.availabilityTitle}>{translations[34]}</Text>
                      <View style={styles.availabilityStatus}>
                        <View style={[styles.statusDot, { backgroundColor: isAvailable ? premiumColors.neonGreen : Colors.textSecondary }]} />
                        <Text style={[styles.statusText, { color: isAvailable ? premiumColors.neonGreen : Colors.textSecondary }]}>
                          {isAvailable ? translations[35] : translations[36]}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Switch
                    value={isAvailable}
                    onValueChange={toggleAvailability}
                    trackColor={{ false: Colors.textSecondary + '40', true: premiumColors.neonGreen + '60' }}
                    thumbColor={isAvailable ? premiumColors.neonGreen : Colors.textSecondary}
                    ios_backgroundColor={Colors.textSecondary + '40'}
                  />
                </View>

                {isAvailable && (
                  <Animated.View style={[styles.hustleAIBubble, {
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }]}>
                    <Brain size={20} color={premiumColors.neonViolet} />
                    <Text style={styles.hustleAIText}>{translations[37]}</Text>
                  </Animated.View>
                )}
              </LinearGradient>
            </GlassCard>
          </Animated.View>



          <View 
            style={[styles.statsRow, isTablet && styles.statsRowTablet]}
            accessible
            accessibilityLabel="Your stats"
          >
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <View accessible accessibilityLabel={`${currentUser.tasksCompleted} quests completed`}>
                  <GlassCard variant="dark" style={styles.statCard}>
                    <TrendingUp size={24} color={premiumColors.neonCyan} />
                    <Text style={styles.statValue}>{currentUser.tasksCompleted}</Text>
                    <Text style={styles.statLabel}>{translations[24]}</Text>
                  </GlassCard>
                </View>
                <View accessible accessibilityLabel={`${currentUser.reputationScore.toFixed(1)} star rating`}>
                  <GlassCard variant="dark" style={styles.statCard}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <Text style={styles.statValue}>{currentUser.reputationScore.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>{translations[25]}</Text>
                  </GlassCard>
                </View>
                <View accessible accessibilityLabel={`${currentUser.streaks.current} day streak`}>
                  <GlassCard variant="dark" style={styles.statCard}>
                    <Text style={styles.statIcon}>🔥</Text>
                    <Text style={styles.statValue}>{currentUser.streaks.current}</Text>
                    <Text style={styles.statLabel}>{translations[26]}</Text>
                  </GlassCard>
                </View>
              </>
            )}
          </View>

          <View style={styles.quickAccessSection}>
            <Text style={styles.quickAccessTitle}>{translations[27]}</Text>
            <View style={styles.quickAccessGrid}>
              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/watchlist');
                }}
                accessible
                accessibilityLabel="View watchlist"
                accessibilityHint="View saved tasks"
                accessibilityRole="button"
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: premiumColors.neonAmber + '20' }]}>
                  <Bookmark size={20} color={premiumColors.neonAmber} />
                </View>
                <Text style={styles.quickAccessLabel}>{translations[28]}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/seasons');
                }}
                accessible
                accessibilityLabel="View seasons"
                accessibilityHint="Check current season and rewards"
                accessibilityRole="button"
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: premiumColors.neonViolet + '20' }]}>
                  <Trophy size={20} color={premiumColors.neonViolet} />
                </View>
                <Text style={styles.quickAccessLabel}>{translations[29]}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/squad-quests');
                }}
                accessible
                accessibilityLabel="View squad quests"
                accessibilityHint="Check team challenges"
                accessibilityRole="button"
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: premiumColors.neonCyan + '20' }]}>
                  <Users size={20} color={premiumColors.neonCyan} />
                </View>
                <Text style={styles.quickAccessLabel}>{translations[30]}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => {
                  triggerHaptic('medium');
                  router.push('/streak-savers');
                }}
                accessible
                accessibilityLabel="View streak savers"
                accessibilityHint="Protect your daily streak"
                accessibilityRole="button"
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: premiumColors.neonGreen + '20' }]}>
                  <Flame size={20} color={premiumColors.neonGreen} />
                </View>
                <Text style={styles.quickAccessLabel}>{translations[31]}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.aiCoachBanner}
            onPress={() => {
              triggerHaptic('medium');
              router.push('/ai-coach');
            }}
            activeOpacity={0.9}
          >
            <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.aiCoachCard}>
              <LinearGradient
                colors={[premiumColors.neonViolet + '20', premiumColors.neonCyan + '20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiCoachGradient}
              >
                <View style={styles.aiCoachContent}>
                  <Brain size={32} color={premiumColors.neonViolet} />
                  <View style={styles.aiCoachText}>
                    <Text style={styles.aiCoachTitle}>{translations[32]}</Text>
                    <Text style={styles.aiCoachSubtitle}>{translations[33]}</Text>
                  </View>
                  <Sparkles size={24} color={premiumColors.neonCyan} />
                </View>
              </LinearGradient>
            </GlassCard>
          </TouchableOpacity>

          <LiveActivityFeed />
        </ScrollView>

        <FloatingChatIcon isAvailable={isAvailable} hasNewMessage={isAvailable && nearbyGigs.length > 0} />
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
    backgroundColor: premiumColors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
    gap: 8,
  },
  missionCopy: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 24,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: premiumColors.neonViolet + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: premiumColors.neonViolet,
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: premiumColors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: premiumColors.neonCyan,
  },
  availabilityCard: {
    marginBottom: 24,
  },
  availabilityCardInner: {
    overflow: 'visible',
  },
  availabilityGradient: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  availabilityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
  },
  availabilityTextContainer: {
    flex: 1,
    gap: 6,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  availabilityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  hustleAIBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: premiumColors.neonViolet + '15',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: premiumColors.neonViolet + '30',
  },
  hustleAIText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 20,
  },
  taskOffersSection: {
    marginBottom: 24,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  offersBadge: {
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  offersBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  taskOfferCard: {
    padding: 16,
    gap: 14,
    overflow: 'visible',
  },
  taskOfferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskOfferLeft: {
    flex: 1,
    gap: 8,
  },
  taskOfferTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  taskOfferMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  taskOfferMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskOfferMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  taskOfferRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  taskOfferPay: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
  },
  skillMatchBadge: {
    backgroundColor: premiumColors.neonCyan + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  skillMatchText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  taskOfferActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  declineButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.textSecondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.textSecondary + '40',
  },
  snoozeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.textSecondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.textSecondary + '40',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statsRowTablet: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  statCard: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statIcon: {
    fontSize: 28,
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  aiCoachBanner: {
    marginBottom: 24,
  },
  aiCoachCard: {
    overflow: 'visible',
  },
  aiCoachGradient: {
    padding: 20,
    borderRadius: 16,
  },
  aiCoachContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiCoachText: {
    flex: 1,
    gap: 4,
  },
  aiCoachTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  aiCoachSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  aiPromptSection: {
    marginBottom: 32,
    alignItems: 'center',
    paddingVertical: 20,
  },
  aiOrbContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  aiOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: premiumColors.neonViolet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  aiOrbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiPromptTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  aiPromptSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  aiInputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  micButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputButton: {
    flex: 1,
  },
  textInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    height: 64,
  },
  textInputPlaceholder: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  inspireMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: premiumColors.neonAmber + '15',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '30',
  },
  inspireMeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonAmber,
  },
  posterHeroSection: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  posterHeroGradient: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: premiumColors.neonCyan + '40',
  },
  posterHeroContent: {
    gap: 20,
  },
  posterHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  posterHeroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: premiumColors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
  },
  posterHeroText: {
    flex: 1,
    gap: 4,
  },
  posterHeroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  posterHeroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  posterStatsGrid: {
    flexDirection: 'row',
    backgroundColor: premiumColors.richBlack + '80',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  posterStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  posterStatValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: premiumColors.neonCyan,
  },
  posterStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  posterStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  posterActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  posterPrimaryAction: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  posterPrimaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  posterActionText: {
    flex: 1,
    gap: 2,
  },
  posterActionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  posterActionSubtitle: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.8,
  },
  posterSecondaryAction: {
    flex: 1,
  },
  posterSecondaryActionCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: '100%',
  },
  posterSecondaryActionText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  posterQuestsSection: {
    gap: 16,
  },
  posterQuestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posterQuestsTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  posterQuestsList: {
    gap: 12,
  },
  posterQuestCard: {
    borderRadius: 16,
  },
  posterQuestCardInner: {
    padding: 16,
    gap: 12,
  },
  posterQuestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posterQuestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  posterQuestStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  posterQuestStatusText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
  },
  posterQuestPay: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
  },
  posterQuestTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  posterQuestCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  posterEmptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  posterEmptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: premiumColors.neonCyan + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '30',
  },
  posterEmptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  posterEmptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modeSwitcherContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },


});
