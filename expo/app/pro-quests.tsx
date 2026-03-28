import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Target,
  Zap,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Lock,
  Flame,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { PRO_QUESTS, ProQuest } from '@/constants/tradesmen';
import GlassCard from '@/components/GlassCard';
import CircularProgress from '@/components/CircularProgress';

export default function ProQuests() {
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard' | 'legendary'>('all');

  const mockUserQuests: (ProQuest & { progress: number; unlocked: boolean })[] = PRO_QUESTS.map(quest => ({
    ...quest,
    progress: Math.floor(Math.random() * 100),
    unlocked: Math.random() > 0.3,
  }));

  const filteredQuests = selectedDifficulty === 'all'
    ? mockUserQuests
    : mockUserQuests.filter(q => q.difficulty === selectedDifficulty);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FFD700';
      case 'hard': return '#FF6B6B';
      case 'legendary': return '#9C27B0';
      default: return '#999';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Target size={16} color="#4CAF50" />;
      case 'medium': return <Zap size={16} color="#FFD700" />;
      case 'hard': return <Flame size={16} color="#FF6B6B" />;
      case 'legendary': return <Award size={16} color="#9C27B0" />;
      default: return <Target size={16} color="#999" />;
    }
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'complete_jobs': return <CheckCircle size={16} color="#4A90E2" />;
      case 'earn_rating': return <Award size={16} color="#FFD700" />;
      case 'form_squad': return <Users size={16} color="#9C27B0" />;
      case 'earn_xp': return <TrendingUp size={16} color="#4CAF50" />;
      default: return <Target size={16} color="#999" />;
    }
  };

  const difficulties = [
    { id: 'all' as const, label: 'All', color: '#4A90E2' },
    { id: 'easy' as const, label: 'Easy', color: '#4CAF50' },
    { id: 'medium' as const, label: 'Medium', color: '#FFD700' },
    { id: 'hard' as const, label: 'Hard', color: '#FF6B6B' },
    { id: 'legendary' as const, label: 'Legendary', color: '#9C27B0' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Pro Quests',
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Pro Quests</Text>
            <Text style={styles.subtitle}>
              Complete specialized challenges to unlock exclusive rewards and badges
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff.id}
                style={[
                  styles.filterChip,
                  selectedDifficulty === diff.id && styles.filterChipActive,
                  selectedDifficulty === diff.id && { borderColor: diff.color },
                ]}
                onPress={() => setSelectedDifficulty(diff.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedDifficulty === diff.id && styles.filterTextActive,
                    selectedDifficulty === diff.id && { color: diff.color },
                  ]}
                >
                  {diff.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.questsContainer}>
            {filteredQuests.map((quest) => {
              const progress = quest.requirements.reduce((sum, req) => 
                sum + (req.current / req.target), 0
              ) / quest.requirements.length;
              const isCompleted = progress >= 1;
              const difficultyColor = getDifficultyColor(quest.difficulty);

              return (
                <GlassCard key={quest.id} style={styles.questCard}>
                  {!quest.unlocked && (
                    <View style={styles.lockedOverlay}>
                      <Lock size={32} color="#666" />
                      <Text style={styles.lockedText}>Locked</Text>
                    </View>
                  )}

                  <View style={styles.questHeader}>
                    <View style={styles.questTitleRow}>
                      <View style={styles.questIcon}>
                        {getDifficultyIcon(quest.difficulty)}
                      </View>
                      <View style={styles.questTitleContainer}>
                        <Text style={styles.questTitle}>{quest.title}</Text>
                        <View style={styles.difficultyBadge}>
                          <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                            {quest.difficulty.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <CircularProgress
                      size={60}
                      strokeWidth={6}
                      progress={progress}
                      color={difficultyColor}
                      value={`${Math.round(progress * 100)}%`}
                    />
                  </View>

                  <Text style={styles.questDescription}>{quest.description}</Text>

                  <View style={styles.requirementsSection}>
                    <Text style={styles.requirementsTitle}>Requirements:</Text>
                    {quest.requirements.map((req, index) => {
                      const reqProgress = (req.current / req.target) * 100;
                      const reqCompleted = req.current >= req.target;

                      return (
                        <View key={index} style={styles.requirement}>
                          <View style={styles.requirementHeader}>
                            <View style={styles.requirementIcon}>
                              {getRequirementIcon(req.type)}
                            </View>
                            <Text style={styles.requirementText}>
                              {req.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                            {reqCompleted && (
                              <CheckCircle size={16} color="#4CAF50" />
                            )}
                          </View>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${reqProgress}%`,
                                  backgroundColor: reqCompleted ? '#4CAF50' : difficultyColor,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {req.current} / {req.target}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.rewardsSection}>
                    <Text style={styles.rewardsTitle}>Rewards:</Text>
                    <View style={styles.rewardsList}>
                      {quest.rewards.xp && (
                        <View style={styles.rewardChip}>
                          <TrendingUp size={14} color="#4CAF50" />
                          <Text style={styles.rewardText}>{quest.rewards.xp} XP</Text>
                        </View>
                      )}
                      {quest.rewards.hustleCoins && (
                        <View style={styles.rewardChip}>
                          <Zap size={14} color="#FFD700" />
                          <Text style={styles.rewardText}>{quest.rewards.hustleCoins} Coins</Text>
                        </View>
                      )}
                      {quest.rewards.badge && (
                        <View style={styles.rewardChip}>
                          <Award size={14} color="#9C27B0" />
                          <Text style={styles.rewardText}>Badge</Text>
                        </View>
                      )}
                    </View>
                    {quest.rewards.unlocks && quest.rewards.unlocks.length > 0 && (
                      <View style={styles.unlocksSection}>
                        <Text style={styles.unlocksLabel}>Unlocks:</Text>
                        {quest.rewards.unlocks.map((unlock, index) => (
                          <Text key={index} style={styles.unlockText}>
                            • {unlock}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  {isCompleted && quest.unlocked && (
                    <TouchableOpacity style={styles.claimButton}>
                      <LinearGradient
                        colors={[difficultyColor, difficultyColor + 'CC']}
                        style={styles.claimGradient}
                      >
                        <Award size={20} color="#FFFFFF" />
                        <Text style={styles.claimText}>Claim Rewards</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              );
            })}
          </View>

          {filteredQuests.length === 0 && (
            <View style={styles.emptyState}>
              <Target size={48} color="#666" />
              <Text style={styles.emptyTitle}>No Quests Available</Text>
              <Text style={styles.emptyText}>
                Check back later for new challenges
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  filterScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#999',
  },
  filterTextActive: {
    color: '#4A90E2',
  },
  questsContainer: {
    gap: 16,
  },
  questCard: {
    padding: 20,
    position: 'relative',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    zIndex: 10,
    gap: 8,
  },
  lockedText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#666',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginRight: 12,
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTitleContainer: {
    flex: 1,
    gap: 6,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  questDescription: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    marginBottom: 16,
  },
  requirementsSection: {
    marginBottom: 16,
    gap: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  requirement: {
    gap: 8,
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
  rewardsSection: {
    gap: 12,
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  unlocksSection: {
    gap: 6,
  },
  unlocksLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#999',
  },
  unlockText: {
    fontSize: 12,
    color: '#CCC',
    lineHeight: 18,
  },
  claimButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  claimText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
