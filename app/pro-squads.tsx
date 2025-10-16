import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Plus, MapPin, Star, TrendingUp, X, Search } from 'lucide-react-native';
import { TRADES, TradeCategory } from '@/constants/tradesmen';

interface SquadMember {
  userId: string;
  name: string;
  trade: TradeCategory;
  role: 'leader' | 'member';
  avatar: string;
  rating: number;
}

interface Squad {
  id: string;
  name: string;
  members: SquadMember[];
  projectsCompleted: number;
  totalXP: number;
  rating: number;
  activeProject?: {
    taskId: string;
    title: string;
    location: string;
  };
}

export default function ProSquads() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [squadName, setSquadName] = useState('');

  const mockSquads: Squad[] = [
    {
      id: '1',
      name: 'Elite Builders',
      members: [
        { userId: '1', name: 'John D.', trade: 'electrician', role: 'leader', avatar: '⚡', rating: 4.9 },
        { userId: '2', name: 'Mike S.', trade: 'plumber', role: 'member', avatar: '🔧', rating: 4.7 },
        { userId: '3', name: 'Sarah K.', trade: 'carpenter', role: 'member', avatar: '🪚', rating: 4.8 },
      ],
      projectsCompleted: 24,
      totalXP: 12500,
      rating: 4.8,
      activeProject: {
        taskId: '1',
        title: 'Commercial Building Renovation',
        location: 'Downtown Plaza',
      },
    },
    {
      id: '2',
      name: 'Home Pros',
      members: [
        { userId: '4', name: 'Tom R.', trade: 'hvac', role: 'leader', avatar: '❄️', rating: 4.9 },
        { userId: '5', name: 'Lisa M.', trade: 'electrician', role: 'member', avatar: '⚡', rating: 4.6 },
      ],
      projectsCompleted: 18,
      totalXP: 9200,
      rating: 4.7,
    },
  ];

  const getSquadEmblemColors = (members: SquadMember[]): [string, string, ...string[]] => {
    const trades = members.map(m => TRADES.find(t => t.id === m.trade));
    const colors = trades.map(t => t?.color || '#666');
    if (colors.length < 2) {
      return ['#666', '#999'];
    }
    return colors as [string, string, ...string[]];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Pro Squads',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Squads</Text>
          <Text style={styles.subtitle}>Team up for bigger projects and shared XP</Text>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <LinearGradient
              colors={['#4A90E2', '#2196F3']}
              style={styles.createGradient}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.createText}>Create Squad</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {mockSquads.map((squad) => {
            const emblemColors = getSquadEmblemColors(squad.members);
            
            return (
              <TouchableOpacity
                key={squad.id}
                style={styles.squadCard}
                onPress={() => router.push(`/squad/${squad.id}` as any)}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#2a2a2a']}
                  style={styles.squadGradient}
                >
                  <View style={styles.squadHeader}>
                    <View style={styles.emblemContainer}>
                      <LinearGradient
                        colors={emblemColors.length > 0 ? emblemColors : ['#666', '#999']}
                        style={styles.emblem}
                      >
                        <Users size={24} color="#fff" />
                      </LinearGradient>
                    </View>

                    <View style={styles.squadInfo}>
                      <Text style={styles.squadName}>{squad.name}</Text>
                      <View style={styles.squadMeta}>
                        <View style={styles.metaItem}>
                          <Star size={12} color="#FFD700" />
                          <Text style={styles.metaText}>{squad.rating}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <TrendingUp size={12} color="#4CAF50" />
                          <Text style={styles.metaText}>{squad.projectsCompleted} projects</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.membersSection}>
                    <Text style={styles.membersLabel}>Members ({squad.members.length})</Text>
                    <View style={styles.membersList}>
                      {squad.members.map((member) => (
                        <View key={member.userId} style={styles.memberChip}>
                          <Text style={styles.memberAvatar}>{member.avatar}</Text>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberTrade}>
                              {TRADES.find(t => t.id === member.trade)?.name}
                            </Text>
                          </View>
                          {member.role === 'leader' && (
                            <View style={styles.leaderBadge}>
                              <Text style={styles.leaderText}>Leader</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>

                  {squad.activeProject && (
                    <View style={styles.activeProject}>
                      <View style={styles.activeHeader}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeLabel}>Active Project</Text>
                      </View>
                      <Text style={styles.projectTitle}>{squad.activeProject.title}</Text>
                      <View style={styles.projectLocation}>
                        <MapPin size={12} color="#999" />
                        <Text style={styles.locationText}>{squad.activeProject.location}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.squadStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{squad.totalXP.toLocaleString()}</Text>
                      <Text style={styles.statLabel}>Total XP</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{squad.projectsCompleted}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{squad.rating}</Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Squad</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Squad Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter squad name..."
                placeholderTextColor="#666"
                value={squadName}
                onChangeText={setSquadName}
              />

              <Text style={styles.inputLabel}>Invite Members</Text>
              <View style={styles.searchContainer}>
                <Search size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search tradesmen..."
                  placeholderTextColor="#666"
                />
              </View>

              <Text style={styles.helperText}>
                You can invite up to 5 members to your squad. Squad members share XP bonuses and can work on projects together.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createSquadButton}
              onPress={() => {
                setShowCreateModal(false);
                setSquadName('');
              }}
            >
              <LinearGradient
                colors={['#4A90E2', '#2196F3']}
                style={styles.createSquadGradient}
              >
                <Text style={styles.createSquadText}>Create Squad</Text>
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
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  createText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  squadCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  squadGradient: {
    padding: 20,
    gap: 16,
  },
  squadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emblemContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  emblem: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadInfo: {
    flex: 1,
    gap: 6,
  },
  squadName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  squadMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  membersSection: {
    gap: 12,
  },
  membersLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  membersList: {
    gap: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  memberAvatar: {
    fontSize: 24,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  memberTrade: {
    fontSize: 12,
    color: '#999',
  },
  leaderBadge: {
    backgroundColor: '#FFD70020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  leaderText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  activeProject: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#4CAF50',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  projectLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
  },
  squadStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#2a2a2a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalBody: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: -8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  createSquadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createSquadGradient: {
    padding: 16,
    alignItems: 'center',
  },
  createSquadText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
