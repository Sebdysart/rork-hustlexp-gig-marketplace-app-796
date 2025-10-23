import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Plus, TrendingUp, Zap, Crown, X, Search } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';
import { Squad } from '@/types';

export default function SquadsScreen() {
  const { currentUser, users } = useApp();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [squadName, setSquadName] = useState<string>('');
  const [squadDescription, setSquadDescription] = useState<string>('');

  const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18] = useTranslatedTexts([
    'Squads',
    'Team up and earn together',
    'members',
    'Total Earnings',
    'Total XP',
    'View Squad',
    'Create Your Squad',
    'Search squads...',
    'Discover Squads',
    'Member',
    'Request to Join',
    '💡 Squad Benefits',
    'Create Squad',
    'Squad Name *',
    'Enter squad name...',
    'Description',
    'Describe your squad...',
    'Missing Name'
  ]);

  const mockSquads = useMemo((): Squad[] => {
    if (!currentUser) return [];

    return [
      {
        id: 'squad-1',
        name: 'Weekend Warriors',
        description: 'Crushing tasks every weekend!',
        leaderId: users[0]?.id || '',
        members: users.slice(0, 4).map(u => ({
          userId: u.id,
          role: 'member' as const,
          joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          contribution: {
            tasksCompleted: 10,
            xpEarned: 2000,
            earningsGenerated: 500,
          },
        })),
        status: 'active' as const,
        maxMembers: 8,
        emblem: {
          icon: 'users',
          color: '#6366F1',
          pattern: 'solid',
        },
        stats: {
          totalEarnings: 2450,
          totalXP: 8900,
          tasksCompleted: 45,
          averageRating: 4.8,
          projectsCompleted: 12,
        },
        badges: [],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        avatar: 'https://i.pravatar.cc/150?img=1',
        isPublic: true,
        tags: ['weekend', 'active'],
      },
      {
        id: 'squad-2',
        name: 'Hustle Squad',
        description: 'Daily grinders making moves',
        leaderId: users[1]?.id || '',
        members: users.slice(1, 6).map(u => ({
          userId: u.id,
          role: 'member' as const,
          joinedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          contribution: {
            tasksCompleted: 15,
            xpEarned: 2500,
            earningsGenerated: 650,
          },
        })),
        status: 'active' as const,
        maxMembers: 10,
        emblem: {
          icon: 'zap',
          color: '#F59E0B',
          pattern: 'gradient',
        },
        stats: {
          totalEarnings: 3200,
          totalXP: 12500,
          tasksCompleted: 68,
          averageRating: 4.9,
          projectsCompleted: 18,
        },
        badges: [],
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        avatar: 'https://i.pravatar.cc/150?img=2',
        isPublic: true,
        tags: ['hustle', 'daily'],
      },
      {
        id: 'squad-3',
        name: 'Night Owls',
        description: 'Late night task masters',
        leaderId: users[2]?.id || '',
        members: users.slice(2, 5).map(u => ({
          userId: u.id,
          role: 'member' as const,
          joinedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          contribution: {
            tasksCompleted: 8,
            xpEarned: 1600,
            earningsGenerated: 400,
          },
        })),
        status: 'active' as const,
        maxMembers: 6,
        emblem: {
          icon: 'moon',
          color: '#8B5CF6',
          pattern: 'dots',
        },
        stats: {
          totalEarnings: 1800,
          totalXP: 6400,
          tasksCompleted: 32,
          averageRating: 4.7,
          projectsCompleted: 8,
        },
        badges: [],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        avatar: 'https://i.pravatar.cc/150?img=3',
        isPublic: true,
        tags: ['night', 'flexible'],
      },
    ];
  }, [currentUser, users]);

  const mySquad = useMemo(() => {
    if (!currentUser) return null;
    return mockSquads.find(s => s.members.some(m => m.userId === currentUser.id));
  }, [mockSquads, currentUser]);

  if (!currentUser) {
    return null;
  }

  const handleCreateSquad = () => {
    if (!squadName.trim()) {
      Alert.alert('Missing Name', 'Please enter a squad name');
      return;
    }

    triggerHaptic('success');
    Alert.alert(
      'Squad Created! 🎉',
      `${squadName} is ready to hustle!`,
      [{ text: 'OK', onPress: () => setShowCreateModal(false) }]
    );
    setSquadName('');
    setSquadDescription('');
  };

  const handleJoinSquad = (squad: Squad) => {
    triggerHaptic('success');
    Alert.alert(
      'Request Sent! 📨',
      `Your request to join ${squad.name} has been sent to the squad leader.`
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t1,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Users size={32} color={Colors.accent} />
            <Text style={styles.headerTitle}>{t1}</Text>
            <Text style={styles.headerSubtitle}>
              {t2}
            </Text>
          </View>

          {mySquad ? (
            <View style={styles.mySquadCard}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mySquadGradient}
              >
                <View style={styles.mySquadHeader}>
                  <Image source={{ uri: mySquad.avatar }} style={styles.mySquadAvatar} />
                  <View style={styles.mySquadInfo}>
                    <Text style={styles.mySquadName}>{mySquad.name}</Text>
                    <Text style={styles.mySquadMembers}>
                      {mySquad.members.length} {t3}
                    </Text>
                  </View>
                  <Crown size={24} color={Colors.accent} />
                </View>
                <View style={styles.mySquadStats}>
                  <View style={styles.mySquadStat}>
                    <Text style={styles.mySquadStatValue}>${mySquad.stats.totalEarnings}</Text>
                    <Text style={styles.mySquadStatLabel}>{t4}</Text>
                  </View>
                  <View style={styles.mySquadStat}>
                    <Text style={styles.mySquadStatValue}>{mySquad.stats.totalXP}</Text>
                    <Text style={styles.mySquadStatLabel}>{t5}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewSquadButton}
                  onPress={() => {
                    triggerHaptic('medium');
                    console.log('View squad:', mySquad.id);
                  }}
                >
                  <Text style={styles.viewSquadButtonText}>{t6}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.createSquadCard}
              onPress={() => {
                triggerHaptic('medium');
                setShowCreateModal(true);
              }}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.createSquadGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Plus size={32} color={Colors.text} />
                <Text style={styles.createSquadText}>{t7}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t8}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <Text style={styles.sectionTitle}>{t9}</Text>

          {mockSquads.map((squad) => {
            const members = users.filter(u => squad.members.some(m => m.userId === u.id));
            const isMember = squad.members.some(m => m.userId === currentUser.id);

            return (
              <TouchableOpacity
                key={squad.id}
                style={styles.squadCard}
                onPress={() => {
                  triggerHaptic('light');
                  console.log('View squad:', squad.id);
                }}
              >
                <Image source={{ uri: squad.avatar }} style={styles.squadAvatar} />
                <View style={styles.squadContent}>
                  <View style={styles.squadHeader}>
                    <Text style={styles.squadName}>{squad.name}</Text>
                    {isMember && (
                      <View style={styles.memberBadge}>
                        <Text style={styles.memberBadgeText}>{t10}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.squadDescription} numberOfLines={2}>
                    {squad.description}
                  </Text>
                  <View style={styles.squadStats}>
                    <View style={styles.squadStat}>
                      <Users size={14} color={Colors.textSecondary} />
                      <Text style={styles.squadStatText}>
                        {squad.members.length} {t3}
                      </Text>
                    </View>
                    <View style={styles.squadStat}>
                      <TrendingUp size={14} color={Colors.accent} />
                      <Text style={styles.squadStatText}>
                        ${squad.stats.totalEarnings}
                      </Text>
                    </View>
                    <View style={styles.squadStat}>
                      <Zap size={14} color={Colors.accent} />
                      <Text style={styles.squadStatText}>
                        {squad.stats.totalXP} XP
                      </Text>
                    </View>
                  </View>
                  <View style={styles.squadMembers}>
                    {members.slice(0, 3).map((member, index) => (
                      <Image
                        key={member.id}
                        source={{ uri: member.profilePic }}
                        style={[styles.memberAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
                      />
                    ))}
                    {members.length > 3 && (
                      <View style={[styles.memberAvatar, styles.memberAvatarMore, { marginLeft: -8 }]}>
                        <Text style={styles.memberAvatarMoreText}>
                          +{members.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                  {!isMember && (
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleJoinSquad(squad);
                      }}
                    >
                      <Text style={styles.joinButtonText}>{t11}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t12}</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Earn bonus XP on squad quests</Text>
              <Text style={styles.infoItem}>• Share tips and strategies</Text>
              <Text style={styles.infoItem}>• Compete on squad leaderboards</Text>
              <Text style={styles.infoItem}>• Unlock exclusive squad rewards</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t13}</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>{t14}</Text>
              <TextInput
                style={styles.input}
                value={squadName}
                onChangeText={setSquadName}
                placeholder={t15}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>{t16}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={squadDescription}
                onChangeText={setSquadDescription}
                placeholder={t17}
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateSquad}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.createGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Plus size={20} color={Colors.text} />
                <Text style={styles.createButtonText}>{t13}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  mySquadCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  mySquadGradient: {
    padding: 20,
  },
  mySquadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  mySquadAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  mySquadInfo: {
    flex: 1,
  },
  mySquadName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  mySquadMembers: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
  },
  mySquadStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  mySquadStat: {
    flex: 1,
  },
  mySquadStatValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  mySquadStatLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.8,
  },
  viewSquadButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewSquadButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  createSquadCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  createSquadGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  createSquadText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  squadCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  squadAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  squadContent: {
    flex: 1,
  },
  squadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  squadName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  memberBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  squadDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  squadStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  squadStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  squadStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  squadMembers: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  memberAvatarMore: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarMoreText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
});
