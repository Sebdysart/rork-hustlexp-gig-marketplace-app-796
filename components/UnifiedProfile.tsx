import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Zap, Edit2, Shield, CheckCircle, Award, ShoppingBag, Share2, Settings, Wallet, Sparkles, DollarSign, TrendingUp, Download, X, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import XPBar from '@/components/XPBar';
import LevelBadge from '@/components/LevelBadge';
import { shareAchievement } from '@/utils/socialShare';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import GritCoin from '@/components/GritCoin';
import XPAura from '@/components/XPAura';
import InteractiveBadgeShowcase from '@/components/InteractiveBadgeShowcase';
import UnifiedModeSwitcher from '@/components/UnifiedModeSwitcher';
import TrophyShowcase from '@/components/TrophyShowcase';
import { User } from '@/types';
import { getAllUnlockedBadges } from '@/constants/badgeProgression';
import { getTierForLevel } from '@/constants/hustlerJourney';
import { getAllUnlockedTrophies } from '@/constants/trophies';

interface UnifiedProfileProps {
  user: User;
  isOwnProfile: boolean;
  onUpdateUser?: (user: User) => Promise<void>;
  onRateUser?: (rating: number, comment: string) => Promise<void>;
  onReportUser?: (reason: string, description: string) => Promise<void>;
  myAcceptedTasks?: any[];
}

export default function UnifiedProfile({
  user,
  isOwnProfile,
  onUpdateUser,
  onRateUser,
  onReportUser,
  myAcceptedTasks = [],
}: UnifiedProfileProps) {
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editedBio, setEditedBio] = useState<string>('');
  const [editedName, setEditedName] = useState<string>('');
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [ratingModalVisible, setRatingModalVisible] = useState<boolean>(false);
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [badgeManagerVisible, setBadgeManagerVisible] = useState<boolean>(false);
  const [selectedShowcaseBadges, setSelectedShowcaseBadges] = useState<string[]>(user.showcasedBadges || []);

  const handleEditProfile = () => {
    setEditedName(user.name);
    setEditedBio(user.bio);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (onUpdateUser) {
      await onUpdateUser({
        ...user,
        name: editedName,
        bio: editedBio,
      });
    }

    setEditModalVisible(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const activeMode = user.activeMode || 'everyday';
  const isTradesman = activeMode === 'tradesmen';
  const isPoster = activeMode === 'business';

  const handleShareLevel = async () => {
    triggerHaptic('medium');
    await shareAchievement({
      type: 'level_up',
      data: { level: user.level },
    });
  };

  const handleShareQuests = async () => {
    triggerHaptic('medium');
    await shareAchievement({
      type: 'quest_completed',
      data: { questsCompleted: user.tasksCompleted },
    });
  };

  const handleShareStreak = async () => {
    triggerHaptic('medium');
    await shareAchievement({
      type: 'streak',
      data: { streakDays: user.streaks.current },
    });
  };

  const averageRating = user.ratings && user.ratings.length > 0
    ? user.ratings.reduce((sum, r) => sum + r.score, 0) / user.ratings.length
    : user.reputationScore;

  const completedTasks = myAcceptedTasks.filter(t => t.status === 'completed');
  const pendingTasks = myAcceptedTasks.filter(t => t.status === 'in_progress');
  const pendingEarnings = pendingTasks.reduce((sum, t) => sum + (t.payAmount * 0.875), 0);
  const gritBalance = user.wallet?.grit || 0;

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const thisWeekTasks = completedTasks.filter(t => 
    t.completedAt && new Date(t.completedAt).getTime() > weekAgo
  );
  const thisMonthTasks = completedTasks.filter(t => 
    t.completedAt && new Date(t.completedAt).getTime() > monthAgo
  );

  const thisWeek = thisWeekTasks.reduce((sum, t) => sum + (t.payAmount * 0.875), 0);
  const thisMonth = thisMonthTasks.reduce((sum, t) => sum + (t.payAmount * 0.875), 0);

  const handleInstantPayout = () => {
    triggerHaptic('medium');
    setShowPayoutModal(true);
  };

  const handleConfirmPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (amount > user.earnings) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough available balance');
      return;
    }

    triggerHaptic('success');
    Alert.alert(
      'Payout Initiated! 💸',
      `$${amount.toFixed(2)} will be transferred to your account within 30 minutes.`,
      [{ text: 'OK', onPress: () => setShowPayoutModal(false) }]
    );
    setPayoutAmount('');
  };

  const getPeriodData = () => {
    switch (selectedPeriod) {
      case 'week':
        return thisWeek;
      case 'month':
        return thisMonth;
      case 'all':
        return user.earnings;
    }
  };

  const handleSubmitRating = async () => {
    if (onRateUser) {
      await onRateUser(rating, ratingComment);
      setRatingModalVisible(false);
      setRating(5);
      setRatingComment('');
      Alert.alert('Success', 'Rating submitted successfully!');
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim() || !reportDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (onReportUser) {
      await onReportUser(reportReason, reportDescription);
      setReportModalVisible(false);
      setReportReason('');
      setReportDescription('');
      Alert.alert('Report Submitted', 'Thank you for your report. Our team will review it within 24-48 hours.');
    }
  };

  const handleToggleBadge = (badgeId: string) => {
    setSelectedShowcaseBadges(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      } else if (prev.length < 6) {
        return [...prev, badgeId];
      } else {
        Alert.alert('Maximum Reached', 'You can only showcase up to 6 badges');
        return prev;
      }
    });
    triggerHaptic('light');
  };

  const handleSaveBadgeShowcase = async () => {
    if (onUpdateUser) {
      await onUpdateUser({
        ...user,
        showcasedBadges: selectedShowcaseBadges,
      });
      setBadgeManagerVisible(false);
      triggerHaptic('success');
      Alert.alert('Success', 'Badge showcase updated!');
    }
  };

  const currentTier = getTierForLevel(user.level);
  const unlockedBadges = getAllUnlockedBadges(user);
  
  const allBadgesFormatted = unlockedBadges.map(({ badge, tier }) => ({
    id: `${badge.id}-${tier.tier}`,
    name: tier.name,
    description: badge.description,
    icon: tier.icon,
    rarity: tier.rarity,
    tier: tier.tier,
    category: badge.category,
  }));

  const showcasedBadges = selectedShowcaseBadges.length > 0
    ? allBadgesFormatted.filter(b => selectedShowcaseBadges.includes(b.id))
    : allBadgesFormatted.sort((a, b) => b.tier - a.tier).slice(0, 6);

  const topBadges = showcasedBadges.slice(0, 6);

  const getBackgroundGradient = (): [string, string, ...string[]] => {
    if (user.level >= 100) return [premiumColors.neonAmber + '40', premiumColors.neonMagenta + '40', premiumColors.neonViolet + '40'];
    if (user.level >= 75) return [premiumColors.neonViolet + '40', premiumColors.neonMagenta + '40', premiumColors.neonCyan + '40'];
    if (user.level >= 50) return [premiumColors.neonCyan + '40', premiumColors.neonBlue + '40', premiumColors.neonViolet + '40'];
    if (user.level >= 25) return [premiumColors.neonBlue + '40', premiumColors.neonCyan + '40', premiumColors.neonGreen + '40'];
    return [Colors.primary, Colors.secondary, Colors.accent];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={getBackgroundGradient()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              {isOwnProfile && (
                <View style={styles.quickActionsRow}>
                  <TouchableOpacity style={styles.quickActionButton} onPress={handleEditProfile}>
                    <Edit2 size={18} color={Colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/trust-center')}>
                    <Shield size={18} color={Colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/verification')}>
                    <Award size={18} color={Colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/shop')}>
                    <ShoppingBag size={18} color={Colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/settings')}>
                    <Settings size={18} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.heroHeader}>
                <View style={styles.profilePicContainer}>
                  <XPAura level={user.level} size={100} />
                  <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
                  {user.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={20} color={Colors.accent} fill={Colors.accent} />
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.heroName}>{user.name}</Text>
              <View style={styles.roleContainer}>
                <Text style={styles.heroRole}>
                  {user.role === 'poster' ? 'Quest Giver' : user.role === 'worker' ? 'Adventurer' : 'Legendary Hero'}
                </Text>
                <View style={styles.levelBadgeContainer}>
                  <LevelBadge level={user.level} size="small" />
                  <Text style={styles.tierBadge}>{currentTier.title}</Text>
                </View>
              </View>

              <View style={styles.heroBio}>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>

              <View style={styles.xpContainer}>
                <XPBar currentXP={user.xp} level={user.level} />
              </View>
            </LinearGradient>
          </View>

          {isOwnProfile && (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.walletSection}
              >
                <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.walletCard}>
                  <LinearGradient
                    colors={[premiumColors.neonCyan + '15', premiumColors.neonViolet + '15']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.walletGradient}
                  >
                    <View style={styles.walletHeader}>
                      <View style={styles.walletHeaderLeft}>
                        <Wallet size={20} color={premiumColors.neonCyan} />
                        <Text style={styles.walletLabel}>Available Balance</Text>
                      </View>
                      <Sparkles size={18} color={premiumColors.neonAmber} />
                    </View>
                    <Text style={styles.walletAmount}>${user.earnings.toFixed(2)}</Text>
                    <View style={styles.walletFooter}>
                      <View style={styles.walletStat}>
                        <Text style={styles.walletStatLabel}>Pending</Text>
                        <Text style={styles.walletStatValue}>${pendingEarnings.toFixed(2)}</Text>
                      </View>
                      <View style={styles.walletStat}>
                        <View style={styles.gritHeader}>
                          <GritCoin size={16} animated={true} glowIntensity="low" />
                          <Text style={styles.walletStatLabel}>Grit</Text>
                        </View>
                        <Text style={styles.walletStatValue}>{gritBalance.toLocaleString()}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.instantPayoutBtn}
                      onPress={handleInstantPayout}
                      disabled={user.earnings <= 0}
                    >
                      <Zap size={16} color="#fff" />
                      <Text style={styles.instantPayoutBtnText}>Instant Payout</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </GlassCard>
              </TouchableOpacity>

              <View style={styles.earningsSection}>
                <Text style={styles.sectionTitle}>Earnings Overview</Text>
                <View style={styles.periodSelector}>
                  {(['week', 'month', 'all'] as const).map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.periodButton,
                        selectedPeriod === period && styles.periodButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedPeriod(period);
                        triggerHaptic('light');
                      }}
                    >
                      <Text
                        style={[
                          styles.periodText,
                          selectedPeriod === period && styles.periodTextActive,
                        ]}
                      >
                        {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <GlassCard variant="dark" style={styles.earningsCard}>
                  <View style={styles.earningsHeader}>
                    <TrendingUp size={20} color={premiumColors.neonCyan} />
                    <Text style={styles.earningsTitle}>Total Earned</Text>
                  </View>
                  <Text style={styles.earningsAmount}>${getPeriodData().toFixed(2)}</Text>
                </GlassCard>
              </View>
            </>
          )}

          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => setRatingModalVisible(true)}
              >
                <Star size={20} color={Colors.text} />
                <Text style={styles.buttonText}>Rate User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => setReportModalVisible(true)}
              >
                <AlertTriangle size={20} color={Colors.text} />
                <Text style={styles.buttonText}>Report</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statBox} onPress={isOwnProfile ? handleShareLevel : undefined}>
              <Zap size={24} color={Colors.accent} />
              <Text style={styles.statValue}>{user.xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
              {isOwnProfile && <Share2 size={14} color={Colors.textSecondary} style={styles.shareIcon} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} onPress={isOwnProfile ? handleShareQuests : undefined}>
              <Trophy size={24} color={Colors.accent} />
              <Text style={styles.statValue}>{user.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Quests</Text>
              {isOwnProfile && <Share2 size={14} color={Colors.textSecondary} style={styles.shareIcon} />}
            </TouchableOpacity>
            <View style={styles.statBox}>
              <Star size={24} color={Colors.accent} />
              <Text style={styles.statValue}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating ({user.ratings?.length || 0})</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>🏆 Trophy Case</Text>
              <View style={styles.badgeHeaderActions}>
                {isOwnProfile && (
                  <TouchableOpacity onPress={() => setBadgeManagerVisible(true)}>
                    <View style={styles.manageBadgesButton}>
                      <Edit2 size={14} color={Colors.accent} />
                      <Text style={styles.manageBadgesText}>Manage</Text>
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => router.push(isOwnProfile ? '/progressive-badges' : '/badge-library')}>
                  <View style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <Trophy size={16} color={Colors.accent} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            {topBadges.length > 0 ? (
              <InteractiveBadgeShowcase badges={topBadges} />
            ) : (
              <View style={styles.emptyBadgeState}>
                <Trophy size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyBadgeText}>No badges to showcase yet</Text>
                <Text style={styles.emptyBadgeSubtext}>Complete quests to earn badges!</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>🏆 Trophy Room</Text>
              <TouchableOpacity onPress={() => router.push('/trophy-room')}>
                <View style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Trophy size={16} color={Colors.accent} />
                </View>
              </TouchableOpacity>
            </View>
            <TrophyShowcase trophies={getAllUnlockedTrophies(user)} maxDisplay={6} />
          </View>

          {isOwnProfile && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Switch Mode</Text>
              <UnifiedModeSwitcher />
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Streak Stats</Text>
              {isOwnProfile && (
                <TouchableOpacity onPress={handleShareStreak}>
                  <Share2 size={20} color={Colors.accent} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.streakCard}>
              <View style={styles.streakRow}>
                <Text style={styles.streakLabel}>Current Streak</Text>
                <Text style={styles.streakValue}>{user.streaks.current} days 🔥</Text>
              </View>
              <View style={styles.streakRow}>
                <Text style={styles.streakLabel}>Longest Streak</Text>
                <Text style={styles.streakValue}>{user.streaks.longest} days</Text>
              </View>
            </View>
          </View>

          {user.verificationBadges && user.verificationBadges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verifications</Text>
              <View style={styles.verificationGrid}>
                {user.verificationBadges.map((badge) => (
                  <View key={badge.id} style={styles.verificationItem}>
                    <CheckCircle size={16} color={Colors.accent} />
                    <Text style={styles.verificationText}>
                      {badge.type.charAt(0).toUpperCase() + badge.type.slice(1)} Verified
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {user.strikes && user.strikes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>⚠️ Warnings: {user.strikes.length}/3</Text>
                <Text style={styles.warningText}>
                  {user.strikes.length >= 3
                    ? 'Account suspended. Contact support.'
                    : `${3 - user.strikes.length} warning(s) remaining before suspension.`}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {isOwnProfile && (
        <>
          <Modal
            visible={editModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>

                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showPayoutModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPayoutModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Instant Payout</Text>
                  <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                    <X size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>
                  Available: ${user.earnings.toFixed(2)}
                </Text>
                <View style={styles.inputContainer}>
                  <DollarSign size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.payoutInput}
                    value={payoutAmount}
                    onChangeText={setPayoutAmount}
                    placeholder="Enter amount"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmPayout}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.accent]}
                    style={styles.confirmGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Download size={20} color={Colors.text} />
                    <Text style={styles.confirmButtonText}>Confirm Payout</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.modalNote}>
                  Funds will arrive in your account within 30 minutes
                </Text>
              </View>
            </View>
          </Modal>
        </>
      )}

      {!isOwnProfile && (
        <>
          <Modal
            visible={ratingModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setRatingModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Rate {user.name}</Text>
                  <TouchableOpacity onPress={() => setRatingModalVisible(false)}>
                    <X size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Rating (1-5 stars)</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Star
                        size={40}
                        color={star <= rating ? Colors.accent : Colors.textSecondary}
                        fill={star <= rating ? Colors.accent : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Comment (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={ratingComment}
                  onChangeText={setRatingComment}
                  placeholder="Share your experience..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setRatingModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleSubmitRating}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={reportModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setReportModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Report {user.name}</Text>
                  <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                    <X size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Reason</Text>
                <TextInput
                  style={styles.input}
                  value={reportReason}
                  onChangeText={setReportReason}
                  placeholder="e.g., Harassment, Fraud, No-show"
                  placeholderTextColor={Colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={reportDescription}
                  onChangeText={setReportDescription}
                  placeholder="Provide details about the incident"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setReportModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleSubmitReport}
                  >
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={badgeManagerVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setBadgeManagerVisible(false)}
          >
            <View style={styles.badgeManagerContainer}>
              <LinearGradient
                colors={[Colors.background, Colors.surface]}
                style={styles.badgeManagerGradient}
              >
                <View style={styles.badgeManagerHeader}>
                  <View>
                    <Text style={styles.badgeManagerTitle}>Badge Showcase</Text>
                    <Text style={styles.badgeManagerSubtitle}>
                      Select up to 6 badges ({selectedShowcaseBadges.length}/6)
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setBadgeManagerVisible(false)}>
                    <X size={28} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.badgeManagerScroll} contentContainerStyle={styles.badgeManagerContent}>
                  {allBadgesFormatted.length === 0 ? (
                    <View style={styles.noBadgesContainer}>
                      <Trophy size={64} color={Colors.textSecondary} />
                      <Text style={styles.noBadgesText}>No badges earned yet</Text>
                      <Text style={styles.noBadgesSubtext}>Complete quests to unlock badges!</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeGrid}>
                      {allBadgesFormatted.map((badge) => {
                        const isSelected = selectedShowcaseBadges.includes(badge.id);
                        return (
                          <TouchableOpacity
                            key={badge.id}
                            style={[
                              styles.badgeSelectCard,
                              isSelected && styles.badgeSelectCardActive,
                            ]}
                            onPress={() => handleToggleBadge(badge.id)}
                          >
                            {isSelected && (
                              <View style={styles.badgeCheckmark}>
                                <CheckCircle size={20} color={Colors.accent} fill={Colors.accent} />
                              </View>
                            )}
                            <Text style={styles.badgeSelectIcon}>{badge.icon}</Text>
                            <Text style={styles.badgeSelectName} numberOfLines={1}>{badge.name}</Text>
                            <View style={[
                              styles.badgeSelectRarity,
                              { backgroundColor: getRarityColor(badge.rarity) },
                            ]}>
                              <Text style={styles.badgeSelectRarityText}>
                                {badge.rarity.toUpperCase()}
                              </Text>
                            </View>
                            {badge.tier > 1 && (
                              <View style={styles.badgeTierIndicator}>
                                <Text style={styles.badgeTierText}>Tier {badge.tier}</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </ScrollView>

                <View style={styles.badgeManagerFooter}>
                  <TouchableOpacity
                    style={styles.badgeManagerCancelBtn}
                    onPress={() => {
                      setSelectedShowcaseBadges(user.showcasedBadges || []);
                      setBadgeManagerVisible(false);
                    }}
                  >
                    <Text style={styles.badgeManagerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.badgeManagerSaveBtn}
                    onPress={handleSaveBadgeShowcase}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.accent]}
                      style={styles.badgeManagerSaveGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <CheckCircle size={20} color={Colors.text} />
                      <Text style={styles.badgeManagerSaveText}>Save Showcase</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return '#FFD700';
    case 'epic':
      return '#9333EA';
    case 'rare':
      return '#3B82F6';
    case 'common':
    default:
      return '#6B7280';
  }
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
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  quickActionButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.accent,
  },
  heroName: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  heroRole: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  levelBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBio: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  bioText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.95,
  },
  xpContainer: {
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  shareIcon: {
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },

  profilePicContainer: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 2,
  },
  verificationGrid: {
    gap: 12,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  verificationText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#EF4444',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.card,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  walletSection: {
    marginBottom: 20,
  },
  walletCard: {
    overflow: 'visible',
  },
  walletGradient: {
    padding: 24,
    borderRadius: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600' as const,
    opacity: 0.9,
  },
  walletAmount: {
    fontSize: 52,
    fontWeight: '900' as const,
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: -2,
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletStat: {
    gap: 4,
  },
  walletStatLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
  },
  walletStatValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  gritHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instantPayoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: premiumColors.neonViolet,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  instantPayoutBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  earningsSection: {
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: premiumColors.neonCyan + '30',
  },
  periodText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  periodTextActive: {
    color: premiumColors.neonCyan,
    fontWeight: '700' as const,
  },
  earningsCard: {
    padding: 24,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  earningsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  payoutInput: {
    flex: 1,
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  modalNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  rateButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  badgeHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manageBadgesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  manageBadgesText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  emptyBadgeState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyBadgeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyBadgeSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  badgeManagerContainer: {
    flex: 1,
  },
  badgeManagerGradient: {
    flex: 1,
  },
  badgeManagerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  badgeManagerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  badgeManagerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badgeManagerScroll: {
    flex: 1,
  },
  badgeManagerContent: {
    padding: 20,
  },
  noBadgesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  noBadgesText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 20,
  },
  noBadgesSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeSelectCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  badgeSelectCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '15',
  },
  badgeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  badgeSelectIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  badgeSelectName: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  badgeSelectRarity: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSelectRarityText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#fff',
  },
  badgeTierIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTierText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  badgeManagerFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  badgeManagerCancelBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeManagerCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  badgeManagerSaveBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeManagerSaveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  badgeManagerSaveText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
