import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Animated, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Power, 
  Zap, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  X, 
  TrendingUp,
  Navigation,
  Briefcase,
  Star,
  ChevronRight
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors, spacing, typography, borderRadius, neonGlow } from '@/constants/designTokens';
import { TRADES } from '@/constants/tradesmen';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface JobTicket {
  id: string;
  taskId: string;
  title: string;
  description: string;
  category: string;
  pay: number;
  distance: number;
  estimatedTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  skillMatch: number;
  urgency: 'today' | '48h' | 'flexible';
  requiredSkills: string[];
  posterRating: number;
  posterName: string;
}

export default function TradesmenGoMode() {
  const router = useRouter();
  const { currentUser, tasks, users, acceptTask, updateUser } = useApp();
  const [goModeActive, setGoModeActive] = useState<boolean>(false);
  const [jobTickets, setJobTickets] = useState<JobTicket[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (goModeActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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

      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [goModeActive, pulseAnim, glowAnim, scanAnim]);

  useEffect(() => {
    if (goModeActive) {
      searchForJobs();
    }
  }, [goModeActive]);

  const searchForJobs = async () => {
    if (!currentUser?.tradesmanProfile) return;

    setIsSearching(true);
    triggerHaptic('medium');

    await new Promise(resolve => setTimeout(resolve, 1500));

    const profile = currentUser.tradesmanProfile;
    const primaryTrade = profile.primaryTrade || profile.trades[0];

    const matchingTasks = tasks
      .filter(task => {
        if (task.status !== 'open') return false;
        
        const distance = calculateDistance(
          currentUser.location.lat,
          currentUser.location.lng,
          task.location.lat,
          task.location.lng
        );

        return distance <= 25;
      })
      .slice(0, 5);

    const tickets: JobTicket[] = matchingTasks.map(task => {
      const poster = users.find(u => u.id === task.posterId);
      const distance = calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        task.location.lat,
        task.location.lng
      );

      return {
        id: `ticket-${task.id}`,
        taskId: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        pay: task.payAmount,
        distance,
        estimatedTime: task.estimatedDuration || '2-4 hours',
        location: task.location,
        skillMatch: Math.floor(Math.random() * 20) + 80,
        urgency: task.urgency || 'flexible',
        requiredSkills: task.requiredSkills || [],
        posterRating: poster?.reputationScore || 5,
        posterName: poster?.name || 'Client',
      };
    });

    setJobTickets(tickets);
    setIsSearching(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleToggleGoMode = async (value: boolean) => {
    triggerHaptic(value ? 'success' : 'medium');
    setGoModeActive(value);

    if (currentUser?.tradesmanProfile) {
      const updatedUser = {
        ...currentUser,
        tradesmanProfile: {
          ...currentUser.tradesmanProfile,
          availableNow: value,
        },
      };
      await updateUser(updatedUser);
    }

    if (!value) {
      setJobTickets([]);
    }
  };

  const handleAcceptJob = async (ticket: JobTicket) => {
    triggerHaptic('success');
    await acceptTask(ticket.taskId);
    setJobTickets(jobTickets.filter(t => t.id !== ticket.id));
    router.push(`/task-active/${ticket.taskId}` as any);
  };

  const handleDeclineJob = (ticketId: string) => {
    triggerHaptic('light');
    setJobTickets(jobTickets.filter(t => t.id !== ticketId));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'today': return '#FF3B30';
      case '48h': return premiumColors.neonAmber;
      default: return premiumColors.neonCyan;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'today': return 'Urgent';
      case '48h': return 'Soon';
      default: return 'Flexible';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'GO Mode',
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.controlCard}>
          <LinearGradient
            colors={goModeActive 
              ? [premiumColors.neonGreen + '40', 'transparent']
              : [premiumColors.glassDark, 'transparent']
            }
            style={styles.controlGradient}
          >
            <View style={styles.controlHeader}>
              <View style={styles.controlInfo}>
                <View style={styles.controlTitleRow}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Power 
                      size={32} 
                      color={goModeActive ? premiumColors.neonGreen : Colors.textSecondary} 
                    />
                  </Animated.View>
                  <View>
                    <Text style={styles.controlTitle}>GO Mode</Text>
                    <Text style={styles.controlSubtitle}>
                      {goModeActive ? 'Active - Searching for jobs' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
              <Switch
                value={goModeActive}
                onValueChange={handleToggleGoMode}
                trackColor={{ 
                  false: premiumColors.glassDark, 
                  true: premiumColors.neonGreen 
                }}
                thumbColor={Colors.text}
                ios_backgroundColor={premiumColors.glassDark}
              />
            </View>

            {goModeActive && (
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, styles.statusDotActive]} />
                <Text style={styles.statusText}>
                  AI is matching you with nearby jobs
                </Text>
              </View>
            )}
          </LinearGradient>
        </GlassCard>

        {goModeActive && (
          <>
            {isSearching ? (
              <GlassCard style={styles.searchingCard}>
                <Animated.View 
                  style={[
                    styles.searchingIcon,
                    {
                      transform: [{
                        translateY: scanAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 20],
                        }),
                      }],
                    },
                  ]}
                >
                  <Navigation size={48} color={premiumColors.neonCyan} />
                </Animated.View>
                <Text style={styles.searchingText}>Scanning for jobs...</Text>
                <Text style={styles.searchingSubtext}>
                  Looking for matches within 25km
                </Text>
              </GlassCard>
            ) : jobTickets.length > 0 ? (
              <View style={styles.ticketsSection}>
                <View style={styles.ticketsHeader}>
                  <Text style={styles.ticketsTitle}>
                    {jobTickets.length} Job{jobTickets.length !== 1 ? 's' : ''} Found
                  </Text>
                  <TouchableOpacity onPress={searchForJobs} activeOpacity={0.7}>
                    <Text style={styles.refreshText}>Refresh</Text>
                  </TouchableOpacity>
                </View>

                {jobTickets.map((ticket) => (
                  <GlassCard key={ticket.id} style={styles.ticketCard}>
                    <View style={styles.ticketHeader}>
                      <View style={styles.ticketBadges}>
                        <View 
                          style={[
                            styles.urgencyBadge, 
                            { backgroundColor: getUrgencyColor(ticket.urgency) + '30' }
                          ]}
                        >
                          <Text 
                            style={[
                              styles.urgencyText, 
                              { color: getUrgencyColor(ticket.urgency) }
                            ]}
                          >
                            {getUrgencyLabel(ticket.urgency)}
                          </Text>
                        </View>
                        <View style={styles.matchBadge}>
                          <Zap size={12} color={premiumColors.neonAmber} />
                          <Text style={styles.matchText}>{ticket.skillMatch}% Match</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.ticketTitle}>{ticket.title}</Text>
                    <Text style={styles.ticketDescription} numberOfLines={2}>
                      {ticket.description}
                    </Text>

                    <View style={styles.ticketDetails}>
                      <View style={styles.ticketDetail}>
                        <DollarSign size={16} color={premiumColors.neonGreen} />
                        <Text style={styles.ticketDetailText}>${ticket.pay}</Text>
                      </View>
                      <View style={styles.ticketDetail}>
                        <MapPin size={16} color={premiumColors.neonCyan} />
                        <Text style={styles.ticketDetailText}>
                          {ticket.distance.toFixed(1)}km away
                        </Text>
                      </View>
                      <View style={styles.ticketDetail}>
                        <Clock size={16} color={premiumColors.neonAmber} />
                        <Text style={styles.ticketDetailText}>{ticket.estimatedTime}</Text>
                      </View>
                    </View>

                    <View style={styles.posterInfo}>
                      <View style={styles.posterRating}>
                        <Star size={14} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                        <Text style={styles.posterRatingText}>{ticket.posterRating.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.posterName}>{ticket.posterName}</Text>
                    </View>

                    <View style={styles.ticketActions}>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDeclineJob(ticket.id)}
                        activeOpacity={0.7}
                      >
                        <X size={20} color={Colors.textSecondary} />
                        <Text style={styles.declineText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptJob(ticket)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={[premiumColors.neonGreen, '#00CC66']}
                          style={styles.acceptGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <CheckCircle size={20} color={Colors.text} />
                          <Text style={styles.acceptText}>Accept Job</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                ))}
              </View>
            ) : (
              <GlassCard style={styles.emptyCard}>
                <Briefcase size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>No jobs available right now</Text>
                <Text style={styles.emptySubtext}>
                  We&apos;ll notify you when new jobs match your skills
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={searchForJobs}
                  activeOpacity={0.7}
                >
                  <Text style={styles.refreshButtonText}>Search Again</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          </>
        )}

        {!goModeActive && (
          <GlassCard style={styles.infoCard}>
            <Zap size={48} color={premiumColors.neonAmber} />
            <Text style={styles.infoTitle}>How GO Mode Works</Text>
            <View style={styles.infoList}>
              {[
                'Turn on GO Mode to start receiving job offers',
                'AI matches you with nearby jobs based on your skills',
                'Accept or decline jobs instantly',
                'Track your earnings and build your reputation',
              ].map((item, index) => (
                <View key={index} style={styles.infoItem}>
                  <View style={styles.infoBullet} />
                  <Text style={styles.infoText}>{item}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  controlCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  controlGradient: {
    padding: spacing.lg,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlInfo: {
    flex: 1,
  },
  controlTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  controlTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
  },
  controlSubtitle: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.textSecondary,
  },
  statusDotActive: {
    backgroundColor: premiumColors.neonGreen,
    ...neonGlow.green,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: Colors.text,
  },
  searchingCard: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  searchingIcon: {
    marginBottom: spacing.md,
  },
  searchingText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  searchingSubtext: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  ticketsSection: {
    gap: spacing.md,
  },
  ticketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ticketsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  refreshText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: premiumColors.neonCyan,
  },
  ticketCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  urgencyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  urgencyText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: premiumColors.neonAmber + '30',
    borderRadius: borderRadius.full,
  },
  matchText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonAmber,
  },
  ticketTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  ticketDescription: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ticketDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  ticketDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ticketDetailText: {
    fontSize: typography.sizes.sm,
    color: Colors.text,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  posterRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  posterRatingText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: premiumColors.neonAmber,
  },
  posterName: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  ticketActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  declineText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.textSecondary,
  },
  acceptButton: {
    flex: 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...neonGlow.green,
  },
  acceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  acceptText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  emptyCard: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  refreshButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
  },
  infoCard: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  infoTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  infoList: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.neonCyan,
    marginTop: 7,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
