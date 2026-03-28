import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Squad, SquadInvite, SquadMember } from '@/types';
import { useApp } from './AppContext';

const SQUADS_STORAGE_KEY = '@hustlexp_squads';
const INVITES_STORAGE_KEY = '@hustlexp_squad_invites';

export const [SquadContext, useSquads] = createContextHook(() => {
  const { currentUser } = useApp();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [invites, setInvites] = useState<SquadInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSquads();
    loadInvites();
  }, []);

  const loadSquads = async () => {
    try {
      const stored = await AsyncStorage.getItem(SQUADS_STORAGE_KEY);
      if (stored) {
        setSquads(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load squads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      const stored = await AsyncStorage.getItem(INVITES_STORAGE_KEY);
      if (stored) {
        setInvites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load invites:', error);
    }
  };

  const saveSquads = async (newSquads: Squad[]) => {
    try {
      await AsyncStorage.setItem(SQUADS_STORAGE_KEY, JSON.stringify(newSquads));
      setSquads(newSquads);
    } catch (error) {
      console.error('Failed to save squads:', error);
    }
  };

  const saveInvites = async (newInvites: SquadInvite[]) => {
    try {
      await AsyncStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(newInvites));
      setInvites(newInvites);
    } catch (error) {
      console.error('Failed to save invites:', error);
    }
  };

  const createSquad = useCallback((
    name: string,
    description: string,
    maxMembers: number,
    requiredTrades?: string[],
    isPublic: boolean = true,
    tags: string[] = []
  ): Squad => {
    if (!currentUser) throw new Error('Must be logged in to create squad');

    const newSquad: Squad = {
      id: `squad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      leaderId: currentUser.id,
      members: [
        {
          userId: currentUser.id,
          role: 'leader',
          trade: currentUser.tradesmanProfile?.primaryTrade,
          joinedAt: new Date().toISOString(),
          contribution: {
            tasksCompleted: 0,
            xpEarned: 0,
            earningsGenerated: 0,
          },
        },
      ],
      status: 'recruiting',
      maxMembers,
      requiredTrades,
      emblem: {
        icon: '🛡️',
        color: '#FFD700',
        pattern: 'solid',
      },
      stats: {
        totalEarnings: 0,
        totalXP: 0,
        tasksCompleted: 0,
        averageRating: 0,
        projectsCompleted: 0,
      },
      badges: [],
      createdAt: new Date().toISOString(),
      isPublic,
      tags,
    };

    saveSquads([...squads, newSquad]);
    console.log('Squad created:', newSquad.name);
    return newSquad;
  }, [currentUser, squads]);

  const inviteToSquad = useCallback((squadId: string, inviteeId: string, message?: string) => {
    if (!currentUser) throw new Error('Must be logged in');

    const squad = squads.find((s) => s.id === squadId);
    if (!squad) throw new Error('Squad not found');

    const isLeaderOrCoLeader = squad.members.some(
      (m) => m.userId === currentUser.id && (m.role === 'leader' || m.role === 'co_leader')
    );
    if (!isLeaderOrCoLeader) throw new Error('Only leaders can invite members');

    if (squad.members.length >= squad.maxMembers) {
      throw new Error('Squad is full');
    }

    const existingInvite = invites.find(
      (inv) => inv.squadId === squadId && inv.inviteeId === inviteeId && inv.status === 'pending'
    );
    if (existingInvite) throw new Error('Invite already sent');

    const newInvite: SquadInvite = {
      id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      squadId,
      inviterId: currentUser.id,
      inviteeId,
      status: 'pending',
      message,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    saveInvites([...invites, newInvite]);
    console.log('Squad invite sent to user:', inviteeId);
  }, [currentUser, squads, invites]);

  const respondToInvite = useCallback((inviteId: string, accept: boolean) => {
    if (!currentUser) throw new Error('Must be logged in');

    const invite = invites.find((inv) => inv.id === inviteId);
    if (!invite) throw new Error('Invite not found');
    if (invite.inviteeId !== currentUser.id) throw new Error('Not your invite');

    const updatedInvites = invites.map((inv) =>
      inv.id === inviteId ? { ...inv, status: accept ? 'accepted' as const : 'declined' as const } : inv
    );
    saveInvites(updatedInvites);

    if (accept) {
      const squad = squads.find((s) => s.id === invite.squadId);
      if (squad && squad.members.length < squad.maxMembers) {
        const newMember: SquadMember = {
          userId: currentUser.id,
          role: 'member',
          trade: currentUser.tradesmanProfile?.primaryTrade,
          joinedAt: new Date().toISOString(),
          contribution: {
            tasksCompleted: 0,
            xpEarned: 0,
            earningsGenerated: 0,
          },
        };

        const updatedSquads = squads.map((s) =>
          s.id === invite.squadId
            ? {
                ...s,
                members: [...s.members, newMember],
                status: s.members.length + 1 >= s.maxMembers ? 'active' as const : s.status,
              }
            : s
        );
        saveSquads(updatedSquads);
        console.log('Joined squad:', squad.name);
      }
    }
  }, [currentUser, invites, squads]);

  const leaveSquad = useCallback((squadId: string) => {
    if (!currentUser) throw new Error('Must be logged in');

    const squad = squads.find((s) => s.id === squadId);
    if (!squad) throw new Error('Squad not found');

    const member = squad.members.find((m) => m.userId === currentUser.id);
    if (!member) throw new Error('Not a member of this squad');

    if (member.role === 'leader') {
      if (squad.members.length === 1) {
        const updatedSquads = squads.filter((s) => s.id !== squadId);
        saveSquads(updatedSquads);
        console.log('Squad disbanded');
      } else {
        const newLeader = squad.members.find((m) => m.role === 'co_leader') || squad.members[1];
        const updatedSquads = squads.map((s) =>
          s.id === squadId
            ? {
                ...s,
                leaderId: newLeader.userId,
                members: s.members
                  .filter((m) => m.userId !== currentUser.id)
                  .map((m) => (m.userId === newLeader.userId ? { ...m, role: 'leader' as const } : m)),
              }
            : s
        );
        saveSquads(updatedSquads);
        console.log('Left squad and transferred leadership');
      }
    } else {
      const updatedSquads = squads.map((s) =>
        s.id === squadId
          ? {
              ...s,
              members: s.members.filter((m) => m.userId !== currentUser.id),
              status: 'recruiting' as const,
            }
          : s
      );
      saveSquads(updatedSquads);
      console.log('Left squad');
    }
  }, [currentUser, squads]);

  const removeMember = useCallback((squadId: string, userId: string) => {
    if (!currentUser) throw new Error('Must be logged in');

    const squad = squads.find((s) => s.id === squadId);
    if (!squad) throw new Error('Squad not found');

    const currentMember = squad.members.find((m) => m.userId === currentUser.id);
    if (!currentMember || (currentMember.role !== 'leader' && currentMember.role !== 'co_leader')) {
      throw new Error('Only leaders can remove members');
    }

    const targetMember = squad.members.find((m) => m.userId === userId);
    if (!targetMember) throw new Error('Member not found');
    if (targetMember.role === 'leader') throw new Error('Cannot remove leader');

    const updatedSquads = squads.map((s) =>
      s.id === squadId
        ? {
            ...s,
            members: s.members.filter((m) => m.userId !== userId),
            status: 'recruiting' as const,
          }
        : s
    );
    saveSquads(updatedSquads);
    console.log('Member removed from squad');
  }, [currentUser, squads]);

  const promoteToCoLeader = useCallback((squadId: string, userId: string) => {
    if (!currentUser) throw new Error('Must be logged in');

    const squad = squads.find((s) => s.id === squadId);
    if (!squad) throw new Error('Squad not found');
    if (squad.leaderId !== currentUser.id) throw new Error('Only leader can promote');

    const updatedSquads = squads.map((s) =>
      s.id === squadId
        ? {
            ...s,
            members: s.members.map((m) => (m.userId === userId ? { ...m, role: 'co_leader' as const } : m)),
          }
        : s
    );
    saveSquads(updatedSquads);
    console.log('Member promoted to co-leader');
  }, [currentUser, squads]);

  const updateSquadEmblem = useCallback((squadId: string, icon: string, color: string, pattern: string) => {
    if (!currentUser) throw new Error('Must be logged in');

    const squad = squads.find((s) => s.id === squadId);
    if (!squad) throw new Error('Squad not found');
    if (squad.leaderId !== currentUser.id) throw new Error('Only leader can update emblem');

    const updatedSquads = squads.map((s) =>
      s.id === squadId ? { ...s, emblem: { icon, color, pattern } } : s
    );
    saveSquads(updatedSquads);
    console.log('Squad emblem updated');
  }, [currentUser, squads]);

  const getUserSquads = useCallback((userId: string): Squad[] => {
    return squads.filter((squad) => squad.members.some((m) => m.userId === userId));
  }, [squads]);

  const getPendingInvites = useCallback((userId: string): SquadInvite[] => {
    return invites.filter((inv) => inv.inviteeId === userId && inv.status === 'pending');
  }, [invites]);

  const getSquadById = useCallback((squadId: string): Squad | undefined => {
    return squads.find((s) => s.id === squadId);
  }, [squads]);

  const getPublicSquads = useCallback((): Squad[] => {
    return squads.filter((s) => s.isPublic && s.status === 'recruiting');
  }, [squads]);

  const searchSquads = useCallback((query: string, trade?: string): Squad[] => {
    return squads.filter((squad) => {
      const matchesQuery =
        squad.name.toLowerCase().includes(query.toLowerCase()) ||
        squad.description.toLowerCase().includes(query.toLowerCase()) ||
        squad.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesTrade = trade
        ? squad.requiredTrades?.includes(trade) ||
          squad.members.some((m) => m.trade === trade)
        : true;

      return matchesQuery && matchesTrade && squad.isPublic;
    });
  }, [squads]);

  return useMemo(
    () => ({
      squads,
      invites,
      loading,
      createSquad,
      inviteToSquad,
      respondToInvite,
      leaveSquad,
      removeMember,
      promoteToCoLeader,
      updateSquadEmblem,
      getUserSquads,
      getPendingInvites,
      getSquadById,
      getPublicSquads,
      searchSquads,
    }),
    [
      squads,
      invites,
      loading,
      createSquad,
      inviteToSquad,
      respondToInvite,
      leaveSquad,
      removeMember,
      promoteToCoLeader,
      updateSquadEmblem,
      getUserSquads,
      getPendingInvites,
      getSquadById,
      getPublicSquads,
      searchSquads,
    ]
  );
});
