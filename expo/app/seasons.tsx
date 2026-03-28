import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Clock, Award, Zap, Lock, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { CURRENT_SEASON, getSeasonProgress, getDaysRemaining, SEASON_TIERS } from '@/constants/seasons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SeasonsScreen() {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  const { currentTier, nextTier, progress } = getSeasonProgress(currentUser.xp);
  const daysRemaining = getDaysRemaining(CURRENT_SEASON.endDate);

  const completedChallenges = CURRENT_SEASON.challenges.filter(
    c => c.progress >= c.requirement
  ).length;
  const totalChallenges = CURRENT_SEASON.challenges.length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Season Pass',
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <LinearGradient
        colors={[
          premiumColors.deepBlack,
          CURRENT_SEASON.themeColors.primary + '15',
          premiumColors.deepBlack,
        ]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.seasonHeader}>
            <LinearGradient
              colors={[
                CURRENT_SEASON.themeColors.primary + '20',
                CURRENT_SEASON.themeColors.secondary + '20',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.seasonHeaderGradient}
            >
              <View style={styles.seasonTitleRow}>
                <View style={styles.seasonTitleLeft}>
                  <Text style={styles.seasonName}>{CURRENT_SEASON.name}</Text>
                  <Text style={styles.seasonTheme}>{CURRENT_SEASON.theme}</Text>
                </View>
                <View style={styles.timerBadge}>
                  <Clock size={16} color={premiumColors.neonAmber} />
                  <Text style={styles.timerText}>{daysRemaining}d left</Text>
                </View>
              </View>

              <View style={styles.tierProgressContainer}>
                <View style={styles.tierInfo}>
                  <View style={styles.tierBadge}>
                    <Trophy size={20} color={currentTier.color} />
                    <Text style={[styles.tierName, { color: currentTier.color }]}>
                      {currentTier.name}
                    </Text>
                  </View>
                  {nextTier && (
                    <Text style={styles.nextTierText}>
                      {nextTier.minXP - currentUser.xp} XP to {nextTier.name}
                    </Text>
                  )}
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBg}>
                    <LinearGradient
                      colors={[currentTier.color, nextTier?.color || currentTier.color]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{completedChallenges}/{totalChallenges}</Text>
                  <Text style={styles.statLabel}>Challenges</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{currentUser.xp.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Season XP</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{CURRENT_SEASON.limitedBadges.length}</Text>
                  <Text style={styles.statLabel}>Limited Badges</Text>
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Zap size={20} color={premiumColors.neonAmber} />
              <Text style={styles.sectionTitle}>Season Challenges</Text>
            </View>
          </View>

          {CURRENT_SEASON.challenges.map((challenge, index) => {
            const isCompleted = challenge.progress >= challenge.requirement;
            const progressPercent = (challenge.progress / challenge.requirement) * 100;

            return (
              <TouchableOpacity
                key={challenge.id}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('light');
                }}
              >
                <GlassCard
                  variant="dark"
                  style={[
                    styles.challengeCard,
                    isCompleted && styles.challengeCardCompleted,
                  ]}
                >
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIconContainer}>
                      <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                      {isCompleted && (
                        <View style={styles.completedBadge}>
                          <CheckCircle2 size={16} color={premiumColors.neonGreen} />
                        </View>
                      )}
                    </View>
                    <View style={styles.challengeInfo}>
                      <View style={styles.challengeTitleRow}>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        <View
                          style={[
                            styles.challengeTypeBadge,
                            challenge.type === 'daily' && styles.dailyBadge,
                            challenge.type === 'weekly' && styles.weeklyBadge,
                            challenge.type === 'seasonal' && styles.seasonalBadge,
                          ]}
                        >
                          <Text style={styles.challengeTypeText}>
                            {challenge.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.challengeDescription}>
                        {challenge.description}
                      </Text>
                      <View style={styles.challengeProgress}>
                        <View style={styles.progressBarSmall}>
                          <LinearGradient
                            colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.progressBarSmallFill,
                              { width: `${Math.min(progressPercent, 100)}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.challengeProgressText}>
                          {challenge.progress}/{challenge.requirement}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.challengeRewards}>
                    <View style={styles.rewardItem}>
                      <Zap size={14} color={premiumColors.neonCyan} />
                      <Text style={styles.rewardText}>{challenge.xpReward} XP</Text>
                    </View>
                    <View style={styles.rewardItem}>
                      <Text style={styles.coinIcon}>💰</Text>
                      <Text style={styles.rewardText}>{challenge.coinReward}</Text>
                    </View>
                    {challenge.badgeReward && (
                      <View style={styles.rewardItem}>
                        <Award size={14} color={premiumColors.neonAmber} />
                        <Text style={styles.rewardText}>Badge</Text>
                      </View>
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Award size={20} color={premiumColors.neonAmber} />
              <Text style={styles.sectionTitle}>Limited Badges</Text>
            </View>
          </View>

          <GlassCard variant="dark" style={styles.badgesCard}>
            <Text style={styles.badgesDescription}>
              Exclusive badges only available during {CURRENT_SEASON.name}. Collect them all before the season ends!
            </Text>
            <View style={styles.badgesGrid}>
              {CURRENT_SEASON.limitedBadges.map((badge, index) => {
                const isUnlocked = false;
                return (
                  <View key={badge} style={styles.badgeItem}>
                    <View
                      style={[
                        styles.badgeIconContainer,
                        !isUnlocked && styles.badgeIconLocked,
                      ]}
                    >
                      {isUnlocked ? (
                        <Text style={styles.badgeEmoji}>🏆</Text>
                      ) : (
                        <Lock size={24} color={Colors.textSecondary} />
                      )}
                    </View>
                    <Text style={styles.badgeName}>
                      {badge.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Trophy size={20} color={premiumColors.neonViolet} />
              <Text style={styles.sectionTitle}>Season Tiers</Text>
            </View>
          </View>

          <GlassCard variant="dark" style={styles.tiersCard}>
            {SEASON_TIERS.map((tier, index) => {
              const isUnlocked = currentUser.xp >= tier.minXP;
              const isCurrent = tier.tier === currentTier.tier;

              return (
                <View
                  key={tier.tier}
                  style={[
                    styles.tierItem,
                    isCurrent && styles.tierItemCurrent,
                    index < SEASON_TIERS.length - 1 && styles.tierItemBorder,
                  ]}
                >
                  <View style={styles.tierLeft}>
                    <View
                      style={[
                        styles.tierIconContainer,
                        { backgroundColor: tier.color + '20' },
                        isCurrent && { borderColor: tier.color, borderWidth: 2 },
                      ]}
                    >
                      {isUnlocked ? (
                        <Trophy size={20} color={tier.color} />
                      ) : (
                        <Lock size={20} color={Colors.textSecondary} />
                      )}
                    </View>
                    <View>
                      <Text style={[styles.tierItemName, { color: tier.color }]}>
                        {tier.name}
                      </Text>
                      <Text style={styles.tierItemXP}>
                        {tier.minXP.toLocaleString()} XP
                      </Text>
                    </View>
                  </View>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  seasonHeader: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  seasonHeaderGradient: {
    padding: 24,
    borderRadius: 16,
  },
  seasonTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  seasonTitleLeft: {
    flex: 1,
  },
  seasonName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  seasonTheme: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  tierProgressContainer: {
    marginBottom: 20,
  },
  tierInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  nextTierText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    minWidth: 45,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: premiumColors.glassWhite,
    opacity: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  challengeCard: {
    marginBottom: 12,
    padding: 16,
  },
  challengeCardCompleted: {
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '40',
  },
  challengeHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  challengeIconContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 28,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: premiumColors.deepBlack,
    borderRadius: 12,
    padding: 2,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  challengeTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  dailyBadge: {
    backgroundColor: premiumColors.neonCyan + '20',
  },
  weeklyBadge: {
    backgroundColor: premiumColors.neonViolet + '20',
  },
  seasonalBadge: {
    backgroundColor: premiumColors.neonAmber + '20',
  },
  challengeTypeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  challengeDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarSmall: {
    flex: 1,
    height: 6,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarSmallFill: {
    height: '100%',
    borderRadius: 3,
  },
  challengeProgressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  challengeRewards: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite + '20',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  coinIcon: {
    fontSize: 14,
  },
  badgesCard: {
    padding: 20,
    marginBottom: 12,
  },
  badgesDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeItem: {
    width: (SCREEN_WIDTH - 32 - 40 - 32) / 3,
    alignItems: 'center',
    gap: 8,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonAmber + '40',
  },
  badgeIconLocked: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  tiersCard: {
    padding: 16,
  },
  tierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  tierItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite + '10',
  },
  tierItemCurrent: {
    backgroundColor: premiumColors.neonCyan + '10',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierItemName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  tierItemXP: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  currentBadge: {
    backgroundColor: premiumColors.neonCyan,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: premiumColors.deepBlack,
    letterSpacing: 0.5,
  },
});
