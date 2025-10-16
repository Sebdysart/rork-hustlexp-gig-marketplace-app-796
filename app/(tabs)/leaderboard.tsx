import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Target, Map, Crown, Zap, DollarSign, Award, Lock, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import LeaderboardContent from '@/components/LeaderboardContent';
import QuestsContent from '@/components/QuestsContent';
import { useApp } from '@/contexts/AppContext';
import { HUSTLER_JOURNEY, getTierForLevel, getProgressToNextTier, canPrestige } from '@/constants/hustlerJourney';
import { getPrestigeDisplayName } from '@/utils/prestige';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';

const { width } = Dimensions.get('window');

type TabType = 'roadmap' | 'leaderboard' | 'quests';

export default function RoadmapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('roadmap');

  if (!currentUser) return null;

  const currentTier = getTierForLevel(currentUser.level);
  const progress = getProgressToNextTier(currentUser.level);
  const canUserPrestige = canPrestige(currentUser.level);
  const prestigeLevel = currentUser.prestige?.level || 0;

  const renderRoadmapContent = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.currentTierSection}>
        <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.currentTierCard}>
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
        </GlassCard>
      </View>

      <View style={styles.journeyContainer}>
        <Text style={styles.sectionTitle}>Your Journey</Text>
        
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
                onPress={() => triggerHaptic('light')}
              >
                <GlassCard variant="dark" neonBorder={isCurrent} glowColor={isCurrent ? 'neonAmber' : undefined}>
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
                </GlassCard>
              </TouchableOpacity>
            </View>
          );
        })}

        {canUserPrestige && (
          <TouchableOpacity
            style={styles.prestigeCard}
            onPress={() => {
              triggerHaptic('success');
              router.push('/progress');
            }}
          >
            <LinearGradient
              colors={['#A855F7', '#7C3AED', '#6D28D9']}
              style={styles.prestigeGradient}
            >
              <Crown size={48} color="#FFD700" />
              <Text style={styles.prestigeTitle}>Prestige Mode Unlocked!</Text>
              <Text style={styles.prestigeSubtitle}>
                Reset to Level 1 with permanent bonuses
              </Text>
              <View style={styles.prestigeButton}>
                <Text style={styles.prestigeButtonText}>Enter Prestige</Text>
                <ArrowRight size={20} color="#000000" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, '#0A0A0F', premiumColors.deepBlack]}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 40 }]}>
          <Text style={styles.headerTitle}>Roadmap</Text>
          <Text style={styles.headerSubtitle}>Track Your Journey</Text>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'roadmap' && styles.tabActive]}
              onPress={() => {
                setActiveTab('roadmap');
                triggerHaptic('light');
              }}
              activeOpacity={0.7}
            >
              {activeTab === 'roadmap' && (
                <LinearGradient
                  colors={[
                    premiumColors.neonViolet + '30',
                    premiumColors.neonPurple + '30',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Map
                color={activeTab === 'roadmap' ? premiumColors.neonViolet : Colors.textSecondary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'roadmap' && styles.tabTextActive,
                ]}
              >
                Roadmap
              </Text>
              {activeTab === 'roadmap' && (
                <View style={styles.tabIndicator}>
                  <LinearGradient
                    colors={[premiumColors.neonViolet, premiumColors.neonPurple]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
              onPress={() => {
                setActiveTab('leaderboard');
                triggerHaptic('light');
              }}
              activeOpacity={0.7}
            >
              {activeTab === 'leaderboard' && (
                <LinearGradient
                  colors={[
                    premiumColors.neonAmber + '30',
                    premiumColors.neonOrange + '30',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Trophy
                color={activeTab === 'leaderboard' ? premiumColors.neonAmber : Colors.textSecondary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'leaderboard' && styles.tabTextActive,
                ]}
              >
                Leaderboard
              </Text>
              {activeTab === 'leaderboard' && (
                <View style={styles.tabIndicator}>
                  <LinearGradient
                    colors={[premiumColors.neonAmber, premiumColors.neonOrange]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'quests' && styles.tabActive]}
              onPress={() => {
                setActiveTab('quests');
                triggerHaptic('light');
              }}
              activeOpacity={0.7}
            >
              {activeTab === 'quests' && (
                <LinearGradient
                  colors={[
                    premiumColors.neonCyan + '30',
                    premiumColors.neonPurple + '30',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Target
                color={activeTab === 'quests' ? premiumColors.neonCyan : Colors.textSecondary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'quests' && styles.tabTextActive,
                ]}
              >
                Quests
              </Text>
              {activeTab === 'quests' && (
                <View style={styles.tabIndicator}>
                  <LinearGradient
                    colors={[premiumColors.neonCyan, premiumColors.neonPurple]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'roadmap' && renderRoadmapContent()}
        {activeTab === 'leaderboard' && <LeaderboardContent />}
        {activeTab === 'quests' && <QuestsContent />}
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
    gap: 12,
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
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    width: width - 32,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: premiumColors.glassWhite,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  tabActive: {
    borderColor: premiumColors.neonCyan + '40',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  currentTierSection: {
    padding: 16,
  },
  currentTierCard: {
    overflow: 'visible',
  },
  tierGradient: {
    padding: 24,
    borderRadius: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    overflow: 'hidden',
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
  journeyContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 24,
  },
  tierItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tierLine: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
  },
  connectionLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#2A2A2A',
    position: 'absolute',
    top: 0,
  },
  connectionLineCompleted: {
    backgroundColor: '#10B981',
  },
  tierCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
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
    borderRadius: 16,
  },
  tierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  prestigeGradient: {
    padding: 32,
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});
