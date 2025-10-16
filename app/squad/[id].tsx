import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Crown,
  Star,
  TrendingUp,
  DollarSign,
  Award,
  UserPlus,
  LogOut,
  Settings,
  MapPin,
} from 'lucide-react-native';
import { useSquads } from '@/contexts/SquadContext';
import { useApp } from '@/contexts/AppContext';
import { COLORS } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';

export default function SquadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSquadById, leaveSquad, removeMember, promoteToCoLeader } = useSquads();
  const { currentUser, users } = useApp();
  const [selectedTab, setSelectedTab] = useState<'members' | 'stats' | 'badges'>('members');

  const squad = getSquadById(id);

  if (!squad) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Squad not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isLeader = squad.leaderId === currentUser?.id;
  const isMember = squad.members.some((m) => m.userId === currentUser?.id);
  const currentMember = squad.members.find((m) => m.userId === currentUser?.id);
  const isCoLeader = currentMember?.role === 'co_leader';

  const handleLeave = () => {
    Alert.alert(
      'Leave Squad',
      isLeader
        ? 'As the leader, leaving will transfer leadership or disband the squad. Continue?'
        : 'Are you sure you want to leave this squad?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            try {
              leaveSquad(squad.id);
              Alert.alert('Success', 'You have left the squad', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to leave squad');
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    Alert.alert('Remove Member', `Remove ${userName} from the squad?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          try {
            removeMember(squad.id, userId);
            Alert.alert('Success', 'Member removed from squad');
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove member');
          }
        },
      },
    ]);
  };

  const handlePromote = (userId: string, userName: string) => {
    Alert.alert('Promote Member', `Promote ${userName} to Co-Leader?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Promote',
        onPress: () => {
          try {
            promoteToCoLeader(squad.id, userId);
            Alert.alert('Success', `${userName} is now a Co-Leader`);
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to promote member');
          }
        },
      },
    ]);
  };

  const renderMemberCard = (member: typeof squad.members[0]) => {
    const user = users.find((u) => u.id === member.userId);
    if (!user) return null;

    const isCurrentUser = user.id === currentUser?.id;
    const canManage = (isLeader || isCoLeader) && !isCurrentUser && member.role !== 'leader';

    return (
      <GlassCard key={member.userId} style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <Image source={{ uri: user.profilePic }} style={styles.memberAvatar} />
          <View style={styles.memberInfo}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>{user.name}</Text>
              {member.role === 'leader' && <Crown size={16} color="#FFD700" />}
              {member.role === 'co_leader' && <Star size={16} color="#C0C0C0" />}
            </View>
            <Text style={styles.memberTrade}>{member.trade || 'General Hustler'}</Text>
            <Text style={styles.memberJoined}>
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.memberStats}>
          <View style={styles.memberStat}>
            <Text style={styles.memberStatValue}>{member.contribution.tasksCompleted}</Text>
            <Text style={styles.memberStatLabel}>Tasks</Text>
          </View>
          <View style={styles.memberStat}>
            <Text style={styles.memberStatValue}>{member.contribution.xpEarned}</Text>
            <Text style={styles.memberStatLabel}>XP</Text>
          </View>
          <View style={styles.memberStat}>
            <Text style={styles.memberStatValue}>${member.contribution.earningsGenerated}</Text>
            <Text style={styles.memberStatLabel}>Earned</Text>
          </View>
        </View>

        {canManage && (
          <View style={styles.memberActions}>
            {member.role === 'member' && isLeader && (
              <TouchableOpacity
                style={styles.promoteButton}
                onPress={() => handlePromote(member.userId, user.name)}
              >
                <Text style={styles.promoteButtonText}>Promote</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMember(member.userId, user.name)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </GlassCard>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.emblem, { backgroundColor: squad.emblem.color }]}>
            <Text style={styles.emblemIcon}>{squad.emblem.icon}</Text>
          </View>
          <Text style={styles.squadName}>{squad.name}</Text>
          <Text style={styles.squadDescription}>{squad.description}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{squad.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <Users size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>
              {squad.members.length}/{squad.maxMembers}
            </Text>
            <Text style={styles.statLabel}>Members</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <TrendingUp size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{squad.stats.totalXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <DollarSign size={24} color={COLORS.accent} />
            <Text style={styles.statValue}>${squad.stats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Award size={24} color={COLORS.legendary} />
            <Text style={styles.statValue}>{squad.stats.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </GlassCard>
        </View>

        {squad.currentProject && (
          <GlassCard style={styles.currentProject}>
            <View style={styles.projectHeader}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.projectTitle}>Current Project</Text>
            </View>
            <Text style={styles.projectName}>{squad.currentProject.title}</Text>
            <Text style={styles.projectLocation}>{squad.currentProject.location.address}</Text>
            <Text style={styles.projectTime}>
              Started {new Date(squad.currentProject.startedAt).toLocaleString()}
            </Text>
          </GlassCard>
        )}

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'members' && styles.tabActive]}
            onPress={() => setSelectedTab('members')}
          >
            <Text style={[styles.tabText, selectedTab === 'members' && styles.tabTextActive]}>
              Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'stats' && styles.tabActive]}
            onPress={() => setSelectedTab('stats')}
          >
            <Text style={[styles.tabText, selectedTab === 'stats' && styles.tabTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'badges' && styles.tabActive]}
            onPress={() => setSelectedTab('badges')}
          >
            <Text style={[styles.tabText, selectedTab === 'badges' && styles.tabTextActive]}>
              Badges
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'members' && (
          <View style={styles.tabContent}>
            {squad.members.map((member) => renderMemberCard(member))}
          </View>
        )}

        {selectedTab === 'stats' && (
          <View style={styles.tabContent}>
            <GlassCard style={styles.detailCard}>
              <Text style={styles.detailTitle}>Squad Performance</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Projects Completed</Text>
                <Text style={styles.detailValue}>{squad.stats.projectsCompleted}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Average Rating</Text>
                <Text style={styles.detailValue}>{squad.stats.averageRating.toFixed(1)} ⭐</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Tasks</Text>
                <Text style={styles.detailValue}>{squad.stats.tasksCompleted}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Earnings</Text>
                <Text style={styles.detailValue}>${squad.stats.totalEarnings}</Text>
              </View>
            </GlassCard>
          </View>
        )}

        {selectedTab === 'badges' && (
          <View style={styles.tabContent}>
            {squad.badges.length > 0 ? (
              squad.badges.map((badge) => (
                <GlassCard key={badge.id} style={styles.badgeCard}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                  <Text style={styles.badgeLevel}>Level {badge.level}</Text>
                </GlassCard>
              ))
            ) : (
              <Text style={styles.emptyText}>No badges earned yet</Text>
            )}
          </View>
        )}

        {isMember && (
          <View style={styles.actions}>
            {(isLeader || isCoLeader) && (
              <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                <UserPlus size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Invite Members</Text>
              </TouchableOpacity>
            )}

            {isLeader && (
              <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                <Settings size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Squad Settings</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
              <LogOut size={20} color="#FF00A8" />
              <Text style={styles.leaveButtonText}>Leave Squad</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emblem: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emblemIcon: {
    fontSize: 50,
  },
  squadName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  squadDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: COLORS.primary + '30',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  currentProject: {
    padding: 16,
    marginBottom: 24,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  projectTime: {
    fontSize: 12,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  tabActive: {
    backgroundColor: COLORS.primary + '30',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#888',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabContent: {
    gap: 12,
  },
  memberCard: {
    padding: 16,
  },
  memberHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  memberTrade: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 2,
  },
  memberJoined: {
    fontSize: 12,
    color: '#666',
  },
  memberStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  memberStat: {
    flex: 1,
    alignItems: 'center',
  },
  memberStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  memberStatLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  promoteButton: {
    flex: 1,
    backgroundColor: COLORS.primary + '30',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  promoteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#FF00A8' + '20',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF00A8',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FF00A8',
  },
  detailCard: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  badgeCard: {
    padding: 16,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeLevel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 40,
  },
  actions: {
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF00A8' + '20',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF00A8',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FF00A8',
  },
});
