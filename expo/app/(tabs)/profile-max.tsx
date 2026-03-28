import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Shield, Sparkles, TrendingUp, Eye, Target, ChevronRight, Zap, Crown, Brain, Lock, Award } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTierForLevel, getNextTier } from '@/constants/ascensionTiers';
import { getAllCategoryBadges } from '@/constants/categoryBadges';
import { getUnlockedAchievements } from '@/constants/achievements';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import Colors from '@/constants/colors';

export default function MaxPotentialProfileScreen() {
  const { currentUser, updateUser } = useApp();
  const [showOptimizer, setShowOptimizer] = useState<boolean>(true);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
  }, []);

  if (!currentUser) return null;

  const tier = getTierForLevel(currentUser.level);
  const nextTier = getNextTier(currentUser.level);
  const categoryBadges = getAllCategoryBadges(currentUser.genreTasksCompleted || {});
  const achievements = getUnlockedAchievements(currentUser);
  const legendaryCount = categoryBadges.filter(b => b?.currentTier?.tier === 'legendary').length;
  const totalXPToNextLevel = (currentUser.level + 1) * 100;
  const currentLevelXP = currentUser.level * 100;
  const progressInLevel = currentUser.xp - currentLevelXP;
  const progressPercent = (progressInLevel / (totalXPToNextLevel - currentLevelXP)) * 100;

  const aiSuggestions = [
    {
      id: '1',
      type: 'bio',
      title: 'Add "Same-Day Service" to bio',
      impact: '+34% more matches',
      action: () => {
        updateUser({ ...currentUser, bio: currentUser.bio + ' • Same-Day Service ⚡' });
        triggerHaptic('success');
      },
    },
    {
      id: '2',
      type: 'badge',
      title: 'Showcase your Legendary badge',
      impact: '+2x profile views',
      action: () => {
        triggerHaptic('success');
      },
    },
    {
      id: '3',
      type: 'photo',
      title: 'Upload a profile photo',
      impact: '+3x more inquiries',
      action: () => {
        triggerHaptic('success');
      },
    },
  ];

  const badgeStrategy = {
    title: 'Focus Strategy: Hit Legendary Faster',
    categories: [
      { name: 'Cleaning', current: 847, target: 1000, priority: 'high' },
      { name: 'Moving', current: 612, target: 1000, priority: 'medium' },
      { name: 'Delivery', current: 287, target: 500, priority: 'low' },
    ],
    message: 'Focusing here could boost earnings 40% by unlocking Legendary multipliers',
  };

  const performanceStats = [
    { label: 'Trust Score', value: currentUser.trustScore?.overall || 85, change: '+11', trend: 'up' },
    { label: 'Avg Earnings', value: `$${currentUser.earnings > 0 ? Math.floor(currentUser.earnings / Math.max(currentUser.tasksCompleted, 1)) : 45}`, change: '+51%', trend: 'up' },
    { label: 'Response Time', value: `${currentUser.responseTime || 8}min`, change: '-10min', trend: 'up' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal, tier.theme.gradientStart + '30']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Profile</Text>
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={() => {
                triggerHaptic('medium');
                router.push(`/user/${currentUser.id}`);
              }}
            >
              <Eye size={20} color={premiumColors.neonCyan} />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.identityCard, { transform: [{ scale: pulseAnim }] }]}>
            <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.identityCardInner}>
              <LinearGradient
                colors={[tier.theme.gradientStart + '40', tier.theme.gradientEnd + '40']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.identityGradient}
              >
                <View style={styles.gamertagHeader}>
                  <View style={styles.gamertagLeft}>
                    <Text style={styles.gamertag}>{currentUser.gamertag || 'SHADOW_PHOENIX_92'}</Text>
                    <View style={[styles.tierBadge, { backgroundColor: tier.theme.gradientStart + '30' }]}>
                      <Text style={[styles.tierBadgeText, { color: tier.theme.gradientStart }]}>
                        {tier.name.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {legendaryCount > 0 && (
                    <View style={styles.legendaryIndicator}>
                      <Crown size={20} color={premiumColors.neonAmber} />
                      <Text style={styles.legendaryCount}>{legendaryCount}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress to {nextTier?.name || 'Max Level'}</Text>
                    <Text style={styles.progressPercent}>{progressPercent.toFixed(0)}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <LinearGradient
                      colors={[tier.theme.gradientStart, tier.theme.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                    />
                  </View>
                </View>

                <View style={styles.quickStats}>
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatValue}>Level {currentUser.level}</Text>
                    <Text style={styles.quickStatLabel}>{currentUser.xp} XP</Text>
                  </View>
                  <View style={styles.quickStatDivider} />
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatValue}>{currentUser.tasksCompleted}</Text>
                    <Text style={styles.quickStatLabel}>Tasks</Text>
                  </View>
                  <View style={styles.quickStatDivider} />
                  <View style={styles.quickStat}>
                    <View style={styles.quickStatRow}>
                      <Shield size={16} color={premiumColors.neonGreen} />
                      <Text style={styles.quickStatValue}>{currentUser.trustScore?.overall || 98}</Text>
                    </View>
                    <Text style={styles.quickStatLabel}>Trust</Text>
                  </View>
                </View>
              </LinearGradient>
            </GlassCard>
          </Animated.View>

          {showOptimizer && (
            <View style={styles.aiOptimizerSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Brain size={24} color={premiumColors.neonViolet} />
                  <Text style={styles.sectionTitle}>AI Profile Optimizer</Text>
                </View>
                <TouchableOpacity onPress={() => setShowOptimizer(false)}>
                  <Text style={styles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
              </View>

              {aiSuggestions.map((suggestion) => (
                <TouchableOpacity 
                  key={suggestion.id}
                  style={styles.suggestionCard}
                  onPress={suggestion.action}
                  activeOpacity={0.8}
                >
                  <GlassCard variant="dark" style={styles.suggestionCardInner}>
                    <View style={styles.suggestionContent}>
                      <View style={styles.suggestionLeft}>
                        <Sparkles size={20} color={premiumColors.neonCyan} />
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                          <Text style={styles.suggestionImpact}>{suggestion.impact}</Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color={Colors.textSecondary} />
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.badgesSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Award size={24} color={premiumColors.neonAmber} />
                <Text style={styles.sectionTitle}>Category Mastery</Text>
              </View>
              <Text style={styles.sectionCount}>{categoryBadges.length}/12</Text>
            </View>

            <View style={styles.badgesGrid}>
              {categoryBadges.slice(0, 6).map((badge, index) => {
                if (!badge || !badge.currentTier) return null;
                const tier = badge.currentTier;
                return (
                  <TouchableOpacity
                    key={`${badge.category}-${index}`}
                    style={styles.badgeCard}
                    onPress={() => {
                      triggerHaptic('light');
                      setSelectedBadge(badge.category);
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[tier.color + '30', tier.color + '10']}
                      style={styles.badgeGradient}
                    >
                      <Animated.Text 
                        style={[
                          styles.badgeIcon,
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
                        {tier.icon}
                      </Animated.Text>
                      <Text style={styles.badgeCategory}>{badge.category.toUpperCase()}</Text>
                      <Text style={styles.badgeTierName}>{tier.name}</Text>
                      <Text style={styles.badgeCount}>({badge.completedTasks})</Text>
                      {tier.tier === 'legendary' && (
                        <View style={styles.legendaryBadge}>
                          <Crown size={12} color={premiumColors.neonAmber} />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            <GlassCard variant="dark" style={styles.strategyCard}>
              <View style={styles.strategyHeader}>
                <Target size={20} color={premiumColors.neonViolet} />
                <Text style={styles.strategyTitle}>{badgeStrategy.title}</Text>
              </View>
              {badgeStrategy.categories.map((cat, index) => (
                <View key={index} style={styles.strategyItem}>
                  <Text style={styles.strategyCategory}>{cat.name}</Text>
                  <View style={styles.strategyProgress}>
                    <View style={styles.strategyBar}>
                      <View 
                        style={[
                          styles.strategyBarFill,
                          { 
                            width: `${(cat.current / cat.target) * 100}%`,
                            backgroundColor: cat.priority === 'high' ? premiumColors.neonGreen : cat.priority === 'medium' ? premiumColors.neonCyan : Colors.textSecondary,
                          },
                        ]} 
                      />
                    </View>
                    <Text style={styles.strategyCount}>{cat.current}/{cat.target}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.strategyMessage}>{badgeStrategy.message}</Text>
            </GlassCard>
          </View>

          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Sparkles size={24} color={premiumColors.neonGreen} />
                <Text style={styles.sectionTitle}>Achievements</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/trophy-room')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.achievementsGrid}>
              {achievements.slice(0, 3).map((achievement) => (
                <GlassCard key={achievement.id} variant="dark" style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementRarity}>{achievement.rarityPercent}% of hustlers</Text>
                  <View style={[styles.achievementBadge, { backgroundColor: achievement.rarity === 'legendary' ? premiumColors.neonAmber + '30' : premiumColors.neonCyan + '30' }]}>
                    <Text style={[styles.achievementBadgeText, { color: achievement.rarity === 'legendary' ? premiumColors.neonAmber : premiumColors.neonCyan }]}>
                      +{achievement.xpBonus} XP
                    </Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          </View>

          <View style={styles.performanceSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <TrendingUp size={24} color={premiumColors.neonCyan} />
                <Text style={styles.sectionTitle}>Performance Stats</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              {performanceStats.map((stat, index) => (
                <GlassCard key={index} variant="dark" style={styles.statCard}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <View style={[styles.statChange, { backgroundColor: premiumColors.neonGreen + '20' }]}>
                    <TrendingUp size={14} color={premiumColors.neonGreen} />
                    <Text style={[styles.statChangeText, { color: premiumColors.neonGreen }]}>{stat.change}</Text>
                  </View>
                  <Text style={styles.statComparison}>TOP 5% of your tier</Text>
                </GlassCard>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.publicProfileButton}
            onPress={() => {
              triggerHaptic('medium');
              router.push(`/user/${currentUser.id}`);
            }}
          >
            <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.publicProfileCard}>
              <View style={styles.publicProfileContent}>
                <Eye size={24} color={premiumColors.neonCyan} />
                <View style={styles.publicProfileText}>
                  <Text style={styles.publicProfileTitle}>Public Profile Preview</Text>
                  <Text style={styles.publicProfileSubtitle}>See how posters view you</Text>
                </View>
                <ChevronRight size={24} color={premiumColors.neonCyan} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        </ScrollView>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  identityCard: {
    marginBottom: 24,
  },
  identityCardInner: {
    overflow: 'visible',
  },
  identityGradient: {
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  gamertagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gamertagLeft: {
    flex: 1,
    gap: 12,
  },
  gamertag: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  legendaryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  legendaryCount: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  quickStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  aiOptimizerSection: {
    marginBottom: 24,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  suggestionCard: {
    marginBottom: 8,
  },
  suggestionCardInner: {
    padding: 16,
  },
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    gap: 4,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  suggestionImpact: {
    fontSize: 13,
    color: premiumColors.neonCyan,
    fontWeight: '600' as const,
  },
  badgesSection: {
    marginBottom: 24,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  badgeCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeGradient: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeCategory: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  badgeTierName: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  badgeCount: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  legendaryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: premiumColors.neonAmber + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  strategyCard: {
    padding: 16,
    gap: 16,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  strategyItem: {
    gap: 8,
  },
  strategyCategory: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  strategyProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  strategyBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strategyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  strategyCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    width: 70,
    textAlign: 'right',
  },
  strategyMessage: {
    fontSize: 13,
    color: premiumColors.neonViolet,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  achievementsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  achievementIcon: {
    fontSize: 40,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  achievementRarity: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  achievementBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  achievementBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  performanceSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  statComparison: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  publicProfileButton: {
    marginBottom: 24,
  },
  publicProfileCard: {
    overflow: 'visible',
  },
  publicProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  publicProfileText: {
    flex: 1,
    gap: 4,
  },
  publicProfileTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  publicProfileSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
