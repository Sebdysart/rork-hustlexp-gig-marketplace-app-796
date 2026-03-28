import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Zap, DollarSign, Award, Lock, CheckCircle2, Trophy, Target, Sparkles, Gift, Users, Swords, Calendar, Star, TrendingUp } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { HUSTLER_JOURNEY, getTierForLevel, getProgressToNextTier, canPrestige } from '@/constants/hustlerJourney';
import { getPrestigeDisplayName } from '@/utils/prestige';
import { COLORS, premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { RANK_TIERS, getRankForLevel } from '@/constants/ranks';
import FeatureUnlockAnimation from '@/components/FeatureUnlockAnimation';
import { useNotifications } from '@/contexts/NotificationContext';

export default function RoadmapScreen() {
  const router = useRouter();
  const { currentUser, markFeatureAsViewed } = useApp();
  const { getUserNotifications } = useNotifications();
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [currentUnlock, setCurrentUnlock] = useState<{
    featureName: string;
    featureIcon: any;
    featureColor: string;
    level: number;
    featureId: string;
  } | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const unlockedFeatures = currentUser.unlockedFeatures || [];
    const unviewedFeature = unlockedFeatures.find(f => !f.viewed);

    if (unviewedFeature) {
      const feature = gamificationFeatures.find(f => f.id === unviewedFeature.featureId);
      if (feature) {
        setCurrentUnlock({
          featureName: feature.title,
          featureIcon: feature.icon,
          featureColor: feature.color,
          level: unviewedFeature.level,
          featureId: feature.id,
        });
        setShowUnlockAnimation(true);
      }
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const currentTier = getTierForLevel(currentUser.level);
  const progress = getProgressToNextTier(currentUser.level);
  const canUserPrestige = canPrestige(currentUser.level);
  const prestigeLevel = currentUser.prestige?.level || 0;

  const gamificationFeatures = [
    {
      id: 'badge-library',
      title: 'Badge Library',
      description: 'Collect and display your earned badges',
      icon: Award,
      color: '#10B981',
      route: '/badge-library',
      unlockLevel: 1,
    },
    {
      id: 'daily-quests',
      title: 'Daily Quests',
      description: 'Complete daily challenges for extra XP',
      icon: Sparkles,
      color: '#F97316',
      route: '/daily-quests',
      unlockLevel: 1,
    },
    {
      id: 'shop',
      title: 'Power-Up Shop',
      description: 'Purchase boosts and special items',
      icon: Gift,
      color: '#EF4444',
      route: '/shop',
      unlockLevel: 10,
    },
    {
      id: 'progressive-badges',
      title: 'Progressive Badges',
      description: 'Level up your badges through tiers',
      icon: TrendingUp,
      color: '#EC4899',
      route: '/progressive-badges',
      unlockLevel: 10,
    },
    {
      id: 'seasons',
      title: 'Seasons',
      description: 'Compete in limited-time seasons with exclusive rewards',
      icon: Calendar,
      color: '#3B82F6',
      route: '/seasons',
      unlockLevel: 10,
    },
    {
      id: 'squads',
      title: 'Squads',
      description: 'Join forces with other hustlers',
      icon: Users,
      color: '#06B6D4',
      route: '/squads',
      unlockLevel: 25,
    },
    {
      id: 'squad-quests',
      title: 'Squad Quests',
      description: 'Complete team challenges for bonus rewards',
      icon: Swords,
      color: '#A855F7',
      route: '/squad-quests',
      unlockLevel: 25,
    },
    {
      id: 'trophy-room',
      title: 'Trophy Room',
      description: 'Showcase your achievements and rare trophies',
      icon: Trophy,
      color: '#F59E0B',
      route: '/trophy-room',
      unlockLevel: 25,
    },
    {
      id: 'skill-tree',
      title: 'Skill Tree',
      description: 'Unlock powerful abilities and perks',
      icon: Target,
      color: '#8B5CF6',
      route: '/skill-tree',
      unlockLevel: 50,
    },
    {
      id: 'adventure-map',
      title: 'Adventure Map',
      description: 'Explore zones and unlock new territories',
      icon: Target,
      color: '#14B8A6',
      route: '/adventure-map',
      unlockLevel: 50,
    },
  ];

  const isFeatureUnlocked = (featureId: string, unlockLevel: number) => {
    return currentUser.level >= unlockLevel;
  };

  const handleFeaturePress = (feature: typeof gamificationFeatures[0]) => {
    if (isFeatureUnlocked(feature.id, feature.unlockLevel)) {
      router.push(feature.route as any);
    } else {
      Alert.alert(
        '🔒 Feature Locked',
        `Reach Level ${feature.unlockLevel} to unlock ${feature.title}!\n\nKeep completing tasks to level up and unlock more features.`,
        [{ text: 'Got it!' }]
      );
    }
  };

  const handleUnlockComplete = async () => {
    if (currentUnlock) {
      await markFeatureAsViewed(currentUnlock.featureId);
      setShowUnlockAnimation(false);
      setCurrentUnlock(null);
    }
  };

  const getUnviewedFeatureCount = () => {
    const unlockedFeatures = currentUser.unlockedFeatures || [];
    return unlockedFeatures.filter(f => !f.viewed).length;
  };

  const hasNewFeatureNotifications = () => {
    const notifications = getUserNotifications(currentUser.id);
    return notifications.some(n => n.type === 'feature_unlocked' && !n.read);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[premiumColors.deepBlack, premiumColors.richBlack, premiumColors.charcoal] as [string, string, ...string[]]}
          style={styles.header}
        >
          <Text style={styles.tagline}>Your Hustler Journey</Text>
          <Text style={styles.subtitle}>Level Up IRL</Text>
          
          <View style={styles.currentTierCard}>
            <LinearGradient
              colors={currentTier.themeColors.gradient as [string, string, ...string[]]}
              style={styles.tierGradient}
            >
              <View style={styles.tierHeader}>
                <Text style={styles.tierTitle}>{currentTier.title}</Text>
                {prestigeLevel > 0 && (
                  <Text style={styles.prestigeBadge}>{getPrestigeDisplayName(prestigeLevel)}</Text>
                )}
              </View>
              <Text style={styles.tierLevel}>Level {currentUser.level}</Text>
              <Text style={styles.tierVibe}>{currentTier.vibe}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}% to next tier
                </Text>
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Tier Progression</Text>
          
          {HUSTLER_JOURNEY.map((tier, index) => {
            const isUnlocked = currentUser.level >= tier.minLevel;
            const isCurrent = tier.id === currentTier.id;
            const isCompleted = currentUser.level > tier.maxLevel;

            return (
              <View key={tier.id} style={styles.tierItem}>
                <View style={styles.tierLine}>
                  {index < HUSTLER_JOURNEY.length - 1 && (
                    <View style={[
                      styles.connectionLine,
                      isCompleted && styles.connectionLineCompleted
                    ]} />
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.tierCard,
                    isCurrent && styles.tierCardCurrent,
                    !isUnlocked && styles.tierCardLocked,
                  ]}
                  disabled={!isUnlocked}
                >
                  <LinearGradient
                    colors={(isUnlocked ? tier.themeColors.gradient : ['#1F1F1F', '#0A0A0A']) as [string, string, ...string[]]}
                    style={styles.tierCardGradient}
                  >
                    <View style={styles.tierCardHeader}>
                      <View style={styles.tierInfo}>
                        <View style={styles.tierTitleRow}>
                          <Text style={[styles.tierCardTitle, !isUnlocked && styles.lockedText]}>
                            {tier.title}
                          </Text>
                          {isCompleted && <CheckCircle2 size={20} color="#10B981" />}
                          {!isUnlocked && <Lock size={20} color="#6B7280" />}
                        </View>
                        <Text style={[styles.tierRange, !isUnlocked && styles.lockedText]}>
                          Levels {tier.minLevel}-{tier.maxLevel}
                        </Text>
                        <Text style={[styles.tierCardVibe, !isUnlocked && styles.lockedText]}>
                          {tier.vibe}
                        </Text>
                      </View>
                      <Text style={styles.tierNumber}>Tier {tier.tier}</Text>
                    </View>

                    {isUnlocked && (
                      <>
                        <View style={styles.rewardsSection}>
                          <Text style={styles.rewardsTitle}>Rewards</Text>
                          <View style={styles.rewardsList}>
                            {tier.rewards.grit && (
                              <View style={styles.rewardItem}>
                                <Zap size={16} color="#FFD700" />
                                <Text style={styles.rewardText}>{tier.rewards.grit}⚡ Grit</Text>
                              </View>
                            )}
                            {tier.rewards.taskCredits && (
                              <View style={styles.rewardItem}>
                                <DollarSign size={16} color="#10B981" />
                                <Text style={styles.rewardText}>${tier.rewards.taskCredits} Credits</Text>
                              </View>
                            )}
                            {tier.rewards.boostTokens && (
                              <View style={styles.rewardItem}>
                                <Award size={16} color="#A855F7" />
                                <Text style={styles.rewardText}>{tier.rewards.boostTokens} Boosts</Text>
                              </View>
                            )}
                            {tier.rewards.payoutBoost && (
                              <View style={styles.rewardItem}>
                                <DollarSign size={16} color="#10B981" />
                                <Text style={styles.rewardText}>+{tier.rewards.payoutBoost}% Payout</Text>
                              </View>
                            )}
                            {tier.rewards.badge && (
                              <View style={styles.rewardItem}>
                                <Award size={16} color="#F59E0B" />
                                <Text style={styles.rewardText}>{tier.rewards.badge} Badge</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.unlocksSection}>
                          <Text style={styles.unlocksTitle}>Unlocks</Text>
                          {tier.unlocks.map((unlock, i) => (
                            <Text key={i} style={styles.unlockItem}>• {unlock}</Text>
                          ))}
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}

          {canUserPrestige && (
            <View style={styles.prestigeCard}>
              <LinearGradient
                colors={['#A855F7', '#7C3AED', '#6D28D9']}
                style={styles.prestigeGradient}
              >
                <Crown size={48} color="#FFD700" />
                <Text style={styles.prestigeTitle}>Prestige Mode Unlocked!</Text>
                <Text style={styles.prestigeSubtitle}>
                  Reset to Level 1 with permanent bonuses
                </Text>
                <TouchableOpacity style={styles.prestigeButton}>
                  <Text style={styles.prestigeButtonText}>Enter Prestige →</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          <Text style={[styles.sectionTitle, styles.gamificationTitle]}>Gamification Features</Text>
          <Text style={styles.sectionSubtitle}>
            Explore additional ways to level up and earn rewards
          </Text>

          <View style={styles.featuresGrid}>
            {gamificationFeatures.map((feature) => {
              const isUnlocked = isFeatureUnlocked(feature.id, feature.unlockLevel);
              const unlockedFeatures = currentUser.unlockedFeatures || [];
              const featureData = unlockedFeatures.find(f => f.featureId === feature.id);
              const isNewlyUnlocked = featureData && !featureData.viewed;

              return (
                <TouchableOpacity
                  key={feature.id}
                  style={styles.featureCard}
                  onPress={() => handleFeaturePress(feature)}
                >
                  <GlassCard style={[
                    styles.featureCardInner,
                    !isUnlocked && styles.featureCardLocked,
                    isNewlyUnlocked && styles.featureCardNew,
                  ]}>
                    {!isUnlocked && (
                      <View style={styles.lockBadge}>
                        <Lock size={16} color="#FFD700" />
                        <Text style={styles.lockBadgeText}>Lvl {feature.unlockLevel}</Text>
                      </View>
                    )}
                    {isNewlyUnlocked && (
                      <View style={styles.newBadge}>
                        <Sparkles size={14} color="#FFD700" />
                        <Text style={styles.newBadgeText}>NEW!</Text>
                      </View>
                    )}
                    <View style={[
                      styles.featureIcon,
                      { backgroundColor: feature.color + '20' },
                      !isUnlocked && styles.featureIconLocked
                    ]}>
                      <feature.icon size={32} color={isUnlocked ? feature.color : '#6B7280'} />
                    </View>
                    <Text style={[
                      styles.featureTitle,
                      !isUnlocked && styles.featureTitleLocked
                    ]}>
                      {feature.title}
                    </Text>
                    <Text style={[
                      styles.featureDescription,
                      !isUnlocked && styles.featureDescriptionLocked
                    ]}>
                      {feature.description}
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {showUnlockAnimation && currentUnlock && (
        <Modal
          visible={showUnlockAnimation}
          transparent
          animationType="fade"
          onRequestClose={handleUnlockComplete}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleUnlockComplete}
          >
            <FeatureUnlockAnimation
              featureName={currentUnlock.featureName}
              featureIcon={currentUnlock.featureIcon}
              featureColor={currentUnlock.featureColor}
              level={currentUnlock.level}
              onComplete={handleUnlockComplete}
            />
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  tagline: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  currentTierCard: {
    borderRadius: 20,
    overflow: 'hidden' as const,
  },
  tierGradient: {
    padding: 24,
  },
  tierHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  prestigeBadge: {
    fontSize: 20,
  },
  tierLevel: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  tierVibe: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden' as const,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center' as const,
  },
  contentContainer: {
    padding: 24,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: premiumColors.glassWhiteStrong,
    marginBottom: 24,
    opacity: 0.8,
  },
  gamificationTitle: {
    marginTop: 32,
  },
  tierItem: {
    flexDirection: 'row' as const,
    marginBottom: 16,
  },
  tierLine: {
    width: 40,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },
  connectionLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#2A2A2A',
    position: 'absolute' as const,
    top: 0,
  },
  connectionLineCompleted: {
    backgroundColor: '#10B981',
  },
  tierCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  tierCardCurrent: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  tierCardLocked: {
    opacity: 0.5,
  },
  tierCardGradient: {
    padding: 20,
  },
  tierCardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 4,
  },
  tierCardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tierRange: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  tierCardVibe: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    fontStyle: 'italic' as const,
  },
  tierNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  lockedText: {
    color: '#6B7280',
  },
  rewardsSection: {
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rewardsList: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  unlocksSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  unlocksTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  unlockItem: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  prestigeCard: {
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden' as const,
  },
  prestigeGradient: {
    padding: 32,
    alignItems: 'center' as const,
  },
  prestigeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  prestigeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  prestigeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  prestigeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000000',
  },
  featuresGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 16,
  },
  featureCard: {
    width: '47%',
  },
  featureCardInner: {
    padding: 16,
    alignItems: 'center' as const,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center' as const,
    lineHeight: 18,
    opacity: 0.7,
  },
  featureCardLocked: {
    opacity: 0.6,
  },
  featureIconLocked: {
    backgroundColor: '#1F1F1F',
  },
  featureTitleLocked: {
    color: '#6B7280',
  },
  featureDescriptionLocked: {
    color: '#4B5563',
  },
  lockBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  lockBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  featureCardNew: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  newBadge: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
  },
});
