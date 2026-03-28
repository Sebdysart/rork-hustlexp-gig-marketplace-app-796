import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Search, SlidersHorizontal, Shield, Star, Zap, MapPin } from 'lucide-react-native';
import { getTierForLevel } from '@/constants/ascensionTiers';
import { getAllCategoryBadges } from '@/constants/categoryBadges';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { User, TaskCategory } from '@/types';

export default function HustlerDiscoveryScreen() {
  const { users } = useApp();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    minTrustScore: 90,
    minTier: 0,
    activeToday: false,
    legendaryOnly: false,
    fastResponse: false,
  });

  const workers = users.filter(u => u.role === 'worker' || u.role === 'both');
  
  const filteredWorkers = workers.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesGamertag = user.gamertag?.toLowerCase().includes(query);
      const matchesName = user.name.toLowerCase().includes(query);
      if (!matchesGamertag && !matchesName) return false;
    }

    if (filters.minTrustScore && (user.trustScore?.overall || 0) < filters.minTrustScore) {
      return false;
    }

    const tier = getTierForLevel(user.level);
    const tierLevels: Record<string, number> = { 'side_hustler': 0, 'the_operator': 1, 'rainmaker': 2, 'the_architect': 3, 'prestige': 4 };
    const tierLevel = tierLevels[tier.id] ?? 0;
    if (tierLevel < filters.minTier) {
      return false;
    }

    if (filters.activeToday && !user.isOnline) {
      return false;
    }

    if (filters.legendaryOnly) {
      const badges = getAllCategoryBadges(user.genreTasksCompleted || {});
      const hasLegendary = badges.some(b => b !== null && b?.currentTier && b.currentTier.tier === 'legendary');
      if (!hasLegendary) return false;
    }

    if (filters.fastResponse && (user.responseTime || 999) > 15) {
      return false;
    }

    if (selectedCategory !== 'all') {
      const categoryTasks = user.genreTasksCompleted?.[selectedCategory] || 0;
      if (categoryTasks === 0) return false;
    }

    return true;
  });

  const sortedWorkers = filteredWorkers.sort((a, b) => {
    const aTrust = a.trustScore?.overall || 0;
    const bTrust = b.trustScore?.overall || 0;
    return bTrust - aTrust;
  });

  const categories: { id: TaskCategory | 'all'; name: string; icon: string }[] = [
    { id: 'all', name: 'All', icon: '🎯' },
    { id: 'cleaning', name: 'Cleaning', icon: '✨' },
    { id: 'delivery', name: 'Delivery', icon: '📦' },
    { id: 'moving', name: 'Moving', icon: '🚚' },
    { id: 'handyman', name: 'Handyman', icon: '🔧' },
    { id: 'tech', name: 'Tech', icon: '💻' },
    { id: 'errands', name: 'Errands', icon: '🏃' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Find Hustlers',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#0F172A',
          headerTitleStyle: { fontWeight: '800' as const },
        }}
      />

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by gamertag or name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} color={showFilters ? '#FFFFFF' : '#64748B'} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>SMART FILTERS</Text>
          <View style={styles.filtersGrid}>
            <TouchableOpacity
              style={[styles.filterChip, filters.minTrustScore >= 90 && styles.filterChipActive]}
              onPress={() => setFilters(f => ({ ...f, minTrustScore: f.minTrustScore >= 90 ? 0 : 90 }))}
            >
              <Shield size={16} color={filters.minTrustScore >= 90 ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.filterChipText, filters.minTrustScore >= 90 && styles.filterChipTextActive]}>
                Trust 90+
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filters.minTier >= 3 && styles.filterChipActive]}
              onPress={() => setFilters(f => ({ ...f, minTier: f.minTier >= 3 ? 0 : 3 }))}
            >
              <Star size={16} color={filters.minTier >= 3 ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.filterChipText, filters.minTier >= 3 && styles.filterChipTextActive]}>
                Tier 3+
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filters.activeToday && styles.filterChipActive]}
              onPress={() => setFilters(f => ({ ...f, activeToday: !f.activeToday }))}
            >
              <Zap size={16} color={filters.activeToday ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.filterChipText, filters.activeToday && styles.filterChipTextActive]}>
                Active Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filters.legendaryOnly && styles.filterChipActive]}
              onPress={() => setFilters(f => ({ ...f, legendaryOnly: !f.legendaryOnly }))}
            >
              <Text style={[styles.filterChipText, filters.legendaryOnly && styles.filterChipTextActive]}>
                👑 Legendary
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsCount}>
          {sortedWorkers.length} hustler{sortedWorkers.length !== 1 ? 's' : ''} found
        </Text>

        {sortedWorkers.map((user) => (
          <HustlerCard key={user.id} user={user} onPress={() => router.push(`/user/${user.id}`)} />
        ))}

        {sortedWorkers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateText}>No hustlers match your filters</Text>
            <Text style={styles.emptyStateHint}>Try adjusting your search criteria</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

interface HustlerCardProps {
  user: User;
  onPress: () => void;
}

function HustlerCard({ user, onPress }: HustlerCardProps) {
  const tier = getTierForLevel(user.level);
  const displayName = user.gamertag || user.name;
  const categoryBadges = getAllCategoryBadges(user.genreTasksCompleted || {});
  const topBadge = categoryBadges.find(b => b !== null && b?.currentTier && b.currentTier.tier === 'legendary') || categoryBadges[0];
  const trustScore = user.trustScore?.overall || 0;
  const responseTime = user.responseTime || 0;
  const completionRate = user.tasksCompleted > 0 
    ? ((user.tasksCompleted / (user.tasksCompleted + (user.strikes?.length || 0))) * 100).toFixed(1)
    : '100';

  return (
    <TouchableOpacity style={styles.hustlerCard} onPress={onPress}>
      <LinearGradient
        colors={[tier.theme.gradientStart + '20', tier.theme.gradientEnd + '20']}
        style={styles.hustlerCardGradient}
      >
        <View style={styles.hustlerHeader}>
          <View style={styles.hustlerInfo}>
            <Text style={styles.hustlerName}>{displayName}</Text>
            <View style={styles.tierBadgeSmall}>
              <Text style={styles.tierTextSmall}>{tier.name}</Text>
            </View>
          </View>
          {user.isOnline && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>

        {topBadge && topBadge.currentTier && (
          <View style={styles.specialtyBanner}>
            <Text style={styles.specialtyIcon}>{topBadge.currentTier.icon}</Text>
            <View style={styles.specialtyInfo}>
              <Text style={styles.specialtyCategory}>{topBadge.category.toUpperCase()}</Text>
              <Text style={styles.specialtyTier}>{topBadge.currentTier.name}</Text>
            </View>
            <Text style={styles.specialtyCount}>({topBadge.completedTasks} tasks)</Text>
          </View>
        )}

        <View style={styles.hustlerStats}>
          <View style={styles.statPill}>
            <Shield size={14} color="#10B981" />
            <Text style={styles.statText}>Trust: {trustScore}/100</Text>
          </View>
          {responseTime > 0 && (
            <View style={styles.statPill}>
              <Zap size={14} color="#F59E0B" />
              <Text style={styles.statText}>~{responseTime}min</Text>
            </View>
          )}
        </View>

        {user.bio && (
          <Text style={styles.hustlerBio} numberOfLines={2}>{user.bio}</Text>
        )}

        <View style={styles.hustlerFooter}>
          <Text style={styles.footerStat}>
            {user.tasksCompleted} tasks • {completionRate}% completion
          </Text>
          <TouchableOpacity style={styles.viewProfileButton}>
            <Text style={styles.viewProfileText}>View Profile</Text>
            <MapPin size={14} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: '#7C3AED',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filtersTitle: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#64748B',
    marginBottom: 12,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#7C3AED',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  categoriesScroll: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#7C3AED',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#64748B',
    marginBottom: 16,
  },
  hustlerCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hustlerCardGradient: {
    padding: 16,
  },
  hustlerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hustlerInfo: {
    flex: 1,
  },
  hustlerName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#0F172A',
    marginBottom: 6,
  },
  tierBadgeSmall: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierTextSmall: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#7C3AED',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  specialtyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  specialtyIcon: {
    fontSize: 28,
  },
  specialtyInfo: {
    flex: 1,
  },
  specialtyCategory: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#64748B',
    marginBottom: 2,
  },
  specialtyTier: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  specialtyCount: {
    fontSize: 12,
    color: '#64748B',
  },
  hustlerStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#0F172A',
  },
  hustlerBio: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  hustlerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStat: {
    fontSize: 12,
    color: '#64748B',
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#7C3AED',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#64748B',
  },
});
