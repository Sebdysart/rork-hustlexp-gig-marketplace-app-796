import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Crown, TrendingUp, Flame, Star, Award } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { premiumColors } from '@/constants/designTokens';

const { width } = Dimensions.get('window');

type TimePeriod = 'daily' | 'weekly' | 'allTime';

const NEON_ORANGE = '#FF6B35';

interface ListItemAnimations {
  [key: string]: Animated.Value;
}

export default function LeaderboardContent() {
  const { leaderboard, currentUser } = useApp();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const listItemAnims = useRef<ListItemAnimations>({}).current;

  useEffect(() => {
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 400),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000 + index * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [shimmerAnim, floatAnim, particleAnims]);

  const currentUserRank = leaderboard.findIndex(entry => entry.userId === currentUser?.id) + 1;

  const getRankColor = (rank: number) => {
    if (rank === 1) return Colors.accent;
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return Colors.textSecondary;
  };

  const renderParticles = (color: string) => (
    <View style={styles.particleContainer}>
      {particleAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              backgroundColor: color,
              left: `${(index * 20) % 100}%`,
              opacity: anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.6, 0],
              }),
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }),
                },
                {
                  scale: anim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0.5],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <>
      <View style={styles.subHeader}>
        <Animated.View
          style={{
            transform: [
              {
                scale: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.15],
                }),
              },
              {
                rotateZ: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg'],
                }),
              },
            ],
          }}
        >
          <Crown size={40} color={premiumColors.neonAmber} strokeWidth={2.5} />
        </Animated.View>
        <Text style={styles.subHeaderTitle}>Elite Leaderboard</Text>
        <Text style={styles.subHeaderSubtitle}>Compete. Dominate. Rise.</Text>

        <View style={styles.filterContainer}>
          {(['daily', 'weekly', 'allTime'] as TimePeriod[]).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setTimePeriod(period)}
              style={[
                styles.filterButton,
                timePeriod === period && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  timePeriod === period && styles.filterTextActive,
                ]}
              >
                {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'All-Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {currentUserRank > 0 && (
          <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.yourRankCard}>
            <View style={styles.yourRankContent}>
              <View style={styles.yourRankLeft}>
                <Text style={styles.yourRankLabel}>Your Rank</Text>
                <Text style={styles.yourRankNumber}>#{currentUserRank}</Text>
              </View>
              <View style={styles.yourRankRight}>
                <View style={styles.yourRankStat}>
                  <Zap size={16} color={premiumColors.neonCyan} />
                  <Text style={styles.yourRankStatText}>{currentUser?.xp || 0} XP</Text>
                </View>
                {currentUserRank <= 10 && (
                  <View style={styles.topTenBadge}>
                    <Star size={12} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                    <Text style={styles.topTenText}>TOP 10</Text>
                  </View>
                )}
              </View>
            </View>
          </GlassCard>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.podiumContainer}>
          {leaderboard.slice(0, 3).length === 3 && (
            <View style={styles.podium}>
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry) => {
                const actualRank = entry.rank;
                const podiumHeight = actualRank === 1 ? 140 : actualRank === 2 ? 100 : 80;
                const glowColor = actualRank === 1 ? premiumColors.neonAmber : actualRank === 2 ? '#C0C0C0' : '#CD7F32';
                const gradientColors: [string, string] = actualRank === 1
                  ? [premiumColors.neonAmber + '30', premiumColors.neonAmber + '10']
                  : actualRank === 2
                  ? ['#C0C0C040', '#C0C0C020']
                  : ['#CD7F3240', '#CD7F3220'];

                return (
                  <TouchableOpacity
                    key={entry.userId}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/user/${entry.userId}`)}
                  >
                    <Animated.View
                      style={[
                        styles.podiumItem,
                        {
                          transform: [
                            {
                              translateY: floatAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, actualRank === 1 ? -8 : -4],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <View style={styles.podiumTop}>
                        {actualRank === 1 && renderParticles(premiumColors.neonAmber)}
                        <View
                          style={[
                            styles.podiumAvatarContainer,
                            {
                              borderColor: glowColor,
                              shadowColor: glowColor,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: actualRank === 1 ? 20 : 12,
                              elevation: actualRank === 1 ? 12 : 8,
                            },
                          ]}
                        >
                          <Image source={{ uri: entry.profilePic }} style={styles.podiumAvatar} />
                          <View style={[styles.podiumRankBadge, { backgroundColor: glowColor }]}>
                            <Text style={styles.podiumRankText}>{actualRank}</Text>
                          </View>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>{entry.name}</Text>
                        <View style={styles.podiumStats}>
                          <View style={styles.podiumStat}>
                            <Zap size={14} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                            <Text style={styles.podiumStatText}>{entry.xp}</Text>
                          </View>
                          <View style={styles.podiumStat}>
                            <Flame size={14} color={NEON_ORANGE} fill={NEON_ORANGE} />
                            <Text style={styles.podiumStatText}>{entry.tasksCompleted}</Text>
                          </View>
                        </View>
                      </View>
                      <LinearGradient
                        colors={gradientColors}
                        style={[
                          styles.podiumBase,
                          {
                            height: podiumHeight,
                            borderTopColor: glowColor,
                          },
                        ]}
                      >
                        <Text style={styles.podiumBaseRank}>#{actualRank}</Text>
                      </LinearGradient>
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>Rising Hustlers</Text>
            <TrendingUp size={18} color={premiumColors.neonCyan} />
          </View>
          {leaderboard.slice(3).map((entry, index) => {
            const isCurrentUser = entry.userId === currentUser?.id;
            
            if (!listItemAnims[entry.userId]) {
              listItemAnims[entry.userId] = new Animated.Value(1);
            }
            const scaleAnim = listItemAnims[entry.userId];

            const handlePressIn = () => {
              Animated.spring(scaleAnim, {
                toValue: 0.97,
                useNativeDriver: true,
              }).start();
            };

            const handlePressOut = () => {
              Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
              }).start();
            };

            return (
              <TouchableOpacity
                key={entry.userId}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => router.push(`/user/${entry.userId}`)}
                activeOpacity={0.9}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <GlassCard
                    variant="dark"
                    neonBorder={isCurrentUser}
                    glowColor={isCurrentUser ? 'neonCyan' : undefined}
                    style={[
                      styles.listItem,
                      isCurrentUser && styles.currentUserItem,
                    ]}
                  >
                    <View style={styles.listLeft}>
                      <View style={styles.listRankContainer}>
                        <Text style={[styles.listRank, { color: getRankColor(entry.rank) }]}>
                          #{entry.rank}
                        </Text>
                        {index < 3 && (
                          <View style={styles.trendingBadge}>
                            <TrendingUp size={10} color={premiumColors.neonGreen} />
                          </View>
                        )}
                      </View>
                      <View style={styles.listAvatarContainer}>
                        <Image source={{ uri: entry.profilePic }} style={styles.listAvatar} />
                        <View style={styles.listLevelBadge}>
                          <Text style={styles.listLevelText}>{entry.level}</Text>
                        </View>
                      </View>
                      <View style={styles.listInfo}>
                        <Text style={styles.listName} numberOfLines={1}>{entry.name}</Text>
                        <View style={styles.listBadges}>
                          {entry.tasksCompleted > 50 && (
                            <View style={styles.achievementBadge}>
                              <Award size={10} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                            </View>
                          )}
                          <Text style={styles.listLevel}>{entry.tasksCompleted} quests</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.listRight}>
                      <View style={styles.listStat}>
                        <Zap size={16} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                        <Text style={styles.listXP}>{entry.xp}</Text>
                      </View>
                      <View style={styles.vsYouContainer}>
                        {currentUser && entry.xp < currentUser.xp && (
                          <Text style={styles.vsYouText}>-{currentUser.xp - entry.xp} XP</Text>
                        )}
                        {currentUser && entry.xp > currentUser.xp && (
                          <Text style={[styles.vsYouText, { color: NEON_ORANGE }]}>+{entry.xp - currentUser.xp} XP</Text>
                        )}
                      </View>
                    </View>
                  </GlassCard>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  subHeader: {
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  subHeaderTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subHeaderSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: premiumColors.glassWhite,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  filterButtonActive: {
    backgroundColor: premiumColors.neonCyan + '30',
    borderColor: premiumColors.neonCyan,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: premiumColors.neonCyan,
    fontWeight: '700' as const,
  },
  yourRankCard: {
    marginTop: 16,
    width: width - 32,
    padding: 16,
  },
  yourRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yourRankLeft: {
    gap: 4,
  },
  yourRankLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  yourRankNumber: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: premiumColors.neonCyan,
    letterSpacing: -1,
  },
  yourRankRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  yourRankStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yourRankStatText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  topTenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber,
  },
  topTenText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  podiumContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumTop: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  particleContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: -20,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  podiumAvatarContainer: {
    position: 'relative',
    borderWidth: 3,
    borderRadius: 40,
    padding: 3,
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  podiumRankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
  },
  podiumRankText: {
    fontSize: 12,
    fontWeight: '900' as const,
    color: premiumColors.deepBlack,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    maxWidth: 100,
    textAlign: 'center' as const,
  },
  podiumStats: {
    flexDirection: 'row',
    gap: 8,
  },
  podiumStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  podiumStatText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 3,
  },
  podiumBaseRank: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.text,
    opacity: 0.3,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  listItem: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentUserItem: {
    backgroundColor: premiumColors.neonCyan + '10',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  listRankContainer: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
  },
  listRank: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  trendingBadge: {
    position: 'absolute',
    top: -4,
    right: 0,
    backgroundColor: premiumColors.neonGreen + '30',
    borderRadius: 8,
    padding: 2,
  },
  listAvatarContainer: {
    position: 'relative',
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  listLevelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: premiumColors.neonViolet,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.deepBlack,
  },
  listLevelText: {
    fontSize: 10,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  listInfo: {
    flex: 1,
    gap: 4,
  },
  listName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  listBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  achievementBadge: {
    backgroundColor: premiumColors.neonAmber + '20',
    borderRadius: 8,
    padding: 2,
  },
  listLevel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  listRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  listStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listXP: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  vsYouContainer: {
    minHeight: 16,
  },
  vsYouText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
});
