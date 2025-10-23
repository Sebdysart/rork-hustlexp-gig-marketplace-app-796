import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, MapPin, Clock, Zap, TrendingUp, Award, AlertCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { SQUAD_QUESTS, getSquadQuestDifficulty, calculateSquadQuestRewards } from '@/constants/squadQuests';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';

export default function SquadQuestsScreen() {
  const { currentUser } = useApp();

  const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18] = useTranslatedTexts([
    'Squad Quests',
    'Team up with your squad for bigger rewards and bonus XP!',
    'Available',
    'XP Bonus',
    'Higher Pay',
    'Available Squad Quests',
    'Squad Members',
    'spot',
    'spots',
    'left',
    'per member',
    'bonus XP',
    'Starts',
    'at',
    'Join Squad Quest',
    '💡 Squad Quest Benefits',
    'Higher Pay:',
    'Earn more per hour than solo quests'
  ]);

  if (!currentUser) return null;

  const handleJoinQuest = (questId: string) => {
    triggerHaptic('success');
    Alert.alert(
      'Join Squad Quest',
      'Would you like to join this squad quest? You can invite your squad members or join solo and team up with others!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Solo',
          onPress: () => {
            Alert.alert('Joined! 🎉', 'Looking for squad members...');
          },
        },
        {
          text: 'Invite Squad',
          onPress: () => {
            Alert.alert('Invites Sent! 📨', 'Your squad has been notified!');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t1,
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.headerCard}>
            <LinearGradient
              colors={[premiumColors.neonViolet + '20', premiumColors.neonCyan + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerIcon}>
                <Users size={32} color={premiumColors.neonViolet} />
              </View>
              <Text style={styles.headerTitle}>{t1}</Text>
              <Text style={styles.headerSubtitle}>
                {t2}
              </Text>
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{SQUAD_QUESTS.length}</Text>
                  <Text style={styles.headerStatLabel}>{t3}</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>2x</Text>
                  <Text style={styles.headerStatLabel}>{t4}</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>$$$</Text>
                  <Text style={styles.headerStatLabel}>{t5}</Text>
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Zap size={20} color={premiumColors.neonAmber} />
              <Text style={styles.sectionTitle}>{t6}</Text>
            </View>
          </View>

          {SQUAD_QUESTS.map((quest) => {
            const difficulty = getSquadQuestDifficulty(quest.difficulty);
            const rewards = calculateSquadQuestRewards(quest);
            const spotsLeft = quest.totalSlots - quest.filledSlots;
            const progressPercent = (quest.filledSlots / quest.totalSlots) * 100;

            return (
              <TouchableOpacity
                key={quest.id}
                activeOpacity={0.9}
                onPress={() => {
                  triggerHaptic('medium');
                  handleJoinQuest(quest.id);
                }}
              >
                <GlassCard variant="dark" style={styles.questCard}>
                  <View style={styles.questHeader}>
                    <View style={styles.questIconContainer}>
                      <Text style={styles.questIcon}>{quest.icon}</Text>
                    </View>
                    <View style={styles.questHeaderInfo}>
                      <Text style={styles.questTitle}>{quest.title}</Text>
                      <View style={styles.questMeta}>
                        <View
                          style={[
                            styles.difficultyBadge,
                            { backgroundColor: difficulty.color + '20' },
                          ]}
                        >
                          <Text style={[styles.difficultyText, { color: difficulty.color }]}>
                            {difficulty.label}
                          </Text>
                        </View>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{quest.category}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.questDescription} numberOfLines={2}>
                    {quest.description}
                  </Text>

                  <View style={styles.questDetails}>
                    <View style={styles.questDetail}>
                      <MapPin size={14} color={Colors.textSecondary} />
                      <Text style={styles.questDetailText} numberOfLines={1}>
                        {quest.location.address.split(',')[0]}
                      </Text>
                    </View>
                    <View style={styles.questDetail}>
                      <Clock size={14} color={Colors.textSecondary} />
                      <Text style={styles.questDetailText}>{quest.duration}</Text>
                    </View>
                  </View>

                  <View style={styles.squadProgress}>
                    <View style={styles.squadProgressHeader}>
                      <View style={styles.squadProgressLeft}>
                        <Users size={16} color={premiumColors.neonViolet} />
                        <Text style={styles.squadProgressText}>
                          {quest.filledSlots}/{quest.totalSlots} {t7}
                        </Text>
                      </View>
                      <Text style={styles.spotsLeftText}>
                        {spotsLeft} {spotsLeft === 1 ? t8 : t9} {t10}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                      />
                    </View>
                  </View>

                  <View style={styles.rewardsSection}>
                    <View style={styles.rewardItem}>
                      <TrendingUp size={16} color={premiumColors.neonGreen} />
                      <View>
                        <Text style={styles.rewardValue}>${rewards.payPerMember}</Text>
                        <Text style={styles.rewardLabel}>{t11}</Text>
                      </View>
                    </View>
                    <View style={styles.rewardDivider} />
                    <View style={styles.rewardItem}>
                      <Zap size={16} color={premiumColors.neonCyan} />
                      <View>
                        <Text style={styles.rewardValue}>
                          {Math.round(rewards.xpPerMember)} XP
                        </Text>
                        <Text style={styles.rewardLabel}>{t11}</Text>
                      </View>
                    </View>
                    <View style={styles.rewardDivider} />
                    <View style={styles.rewardItem}>
                      <Award size={16} color={premiumColors.neonAmber} />
                      <View>
                        <Text style={styles.rewardValue}>+{quest.bonusXP}</Text>
                        <Text style={styles.rewardLabel}>{t12}</Text>
                      </View>
                    </View>
                  </View>

                  {quest.startTime && (
                    <View style={styles.startTimeContainer}>
                      <AlertCircle size={14} color={premiumColors.neonAmber} />
                      <Text style={styles.startTimeText}>
                        {t13} {new Date(quest.startTime).toLocaleDateString()} {t14}{' '}
                        {new Date(quest.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleJoinQuest(quest.id);
                    }}
                  >
                    <LinearGradient
                      colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.joinButtonGradient}
                    >
                      <Users size={18} color={Colors.text} />
                      <Text style={styles.joinButtonText}>{t15}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </GlassCard>
              </TouchableOpacity>
            );
          })}

          <GlassCard variant="dark" style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t16}</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>{t17}</Text> {t18}
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Bonus XP:</Text> Get extra XP when completing as a squad
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Team Work:</Text> Share the workload and finish faster
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Social:</Text> Meet new hustlers and build your network
              </Text>
            </View>
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
  headerCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 24,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  questCard: {
    marginBottom: 16,
    padding: 16,
  },
  questHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  questIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questIcon: {
    fontSize: 28,
  },
  questHeaderInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  questMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  categoryBadge: {
    backgroundColor: premiumColors.glassWhite + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  questDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  questDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  questDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  questDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  squadProgress: {
    marginBottom: 16,
  },
  squadProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  squadProgressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  squadProgressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  spotsLeftText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonAmber,
  },
  progressBar: {
    height: 8,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rewardsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  rewardLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  rewardDivider: {
    width: 1,
    height: '100%',
    backgroundColor: premiumColors.glassWhite + '20',
  },
  startTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: premiumColors.neonAmber + '15',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  startTimeText: {
    fontSize: 12,
    color: premiumColors.neonAmber,
    fontWeight: '600' as const,
    flex: 1,
  },
  joinButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  infoCard: {
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
