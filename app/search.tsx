import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, X, DollarSign, Zap, MapPin, Calendar, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography, borderRadius, premiumColors } from '@/constants/designTokens';

type SearchFilter = {
  minPay?: number;
  maxPay?: number;
  minXP?: number;
  category?: string;
  distance?: number;
  status?: 'open' | 'in_progress' | 'completed';
};

export default function SearchScreen() {
  const { tasks, users } = useApp();
  const { colors: theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'tasks' | 'users'>('tasks');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<SearchFilter>({});

  const filteredTasks = useMemo(() => {
    let results = tasks;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.category.toLowerCase().includes(query)
      );
    }

    if (filters.minPay !== undefined) {
      results = results.filter((task) => task.payAmount >= filters.minPay!);
    }

    if (filters.maxPay !== undefined) {
      results = results.filter((task) => task.payAmount <= filters.maxPay!);
    }

    if (filters.minXP !== undefined) {
      results = results.filter((task) => task.xpReward >= filters.minXP!);
    }

    if (filters.category) {
      results = results.filter((task) => task.category === filters.category);
    }

    if (filters.status) {
      results = results.filter((task) => task.status === filters.status);
    }

    return results;
  }, [tasks, searchQuery, filters]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return Array.from(cats);
  }, [tasks]);

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Search</Text>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
            <Search size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={`Search ${searchType}...`}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: hasActiveFilters ? theme.primary : theme.card }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={20} color={hasActiveFilters ? '#FFFFFF' : theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            searchType === 'tasks' && [styles.activeTab, { borderBottomColor: theme.primary }],
          ]}
          onPress={() => setSearchType('tasks')}
        >
          <Text
            style={[
              styles.tabText,
              { color: searchType === 'tasks' ? theme.primary : theme.textSecondary },
            ]}
          >
            Quests ({filteredTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            searchType === 'users' && [styles.activeTab, { borderBottomColor: theme.primary }],
          ]}
          onPress={() => setSearchType('users')}
        >
          <Text
            style={[
              styles.tabText,
              { color: searchType === 'users' ? theme.primary : theme.textSecondary },
            ]}
          >
            Hustlers ({filteredUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && searchType === 'tasks' && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Filters</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.clearButton, { color: theme.primary }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Min Pay</Text>
              <View style={[styles.filterInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <DollarSign size={16} color={theme.textSecondary} />
                <TextInput
                  style={[styles.filterInputText, { color: theme.text }]}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={filters.minPay?.toString() || ''}
                  onChangeText={(text) => setFilters({ ...filters, minPay: text ? parseFloat(text) : undefined })}
                />
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Max Pay</Text>
              <View style={[styles.filterInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <DollarSign size={16} color={theme.textSecondary} />
                <TextInput
                  style={[styles.filterInputText, { color: theme.text }]}
                  placeholder="1000"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={filters.maxPay?.toString() || ''}
                  onChangeText={(text) => setFilters({ ...filters, maxPay: text ? parseFloat(text) : undefined })}
                />
              </View>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Min XP</Text>
            <View style={[styles.filterInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Zap size={16} color={theme.textSecondary} />
              <TextInput
                style={[styles.filterInputText, { color: theme.text }]}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={filters.minXP?.toString() || ''}
                onChangeText={(text) => setFilters({ ...filters, minXP: text ? parseFloat(text) : undefined })}
              />
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { backgroundColor: !filters.category ? theme.primary : theme.background, borderColor: theme.border },
                ]}
                onPress={() => setFilters({ ...filters, category: undefined })}
              >
                <Text style={[styles.categoryChipText, { color: !filters.category ? '#FFFFFF' : theme.text }]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: filters.category === cat ? theme.primary : theme.background, borderColor: theme.border },
                  ]}
                  onPress={() => setFilters({ ...filters, category: cat })}
                >
                  <Text style={[styles.categoryChipText, { color: filters.category === cat ? '#FFFFFF' : theme.text }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Status</Text>
            <View style={styles.statusRow}>
              {(['open', 'in_progress', 'completed'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusChip,
                    { backgroundColor: filters.status === status ? theme.primary : theme.background, borderColor: theme.border },
                  ]}
                  onPress={() => setFilters({ ...filters, status: filters.status === status ? undefined : status })}
                >
                  <Text style={[styles.statusChipText, { color: filters.status === status ? '#FFFFFF' : theme.text }]}>
                    {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        {searchType === 'tasks' ? (
          filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCardItem key={task.id} task={task} onPress={() => router.push(`/task/${task.id}`)} theme={theme} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.card }]}>
                <Search size={48} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No quests found</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery ? 'Try adjusting your filters or search terms' : 'Start searching for quests'}
              </Text>
            </View>
          )
        ) : (
          filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(`/user/${user.id}`)}
              >
                <LinearGradient
                  colors={['rgba(0, 255, 255, 0.1)', 'rgba(255, 0, 168, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.userGradient}
                />
                <View style={styles.userInfo}>
                  <View style={[styles.userAvatar, { borderColor: theme.primary }]}>
                    <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                    <Text style={[styles.userBio, { color: theme.textSecondary }]} numberOfLines={1}>
                      {user.bio}
                    </Text>
                    <View style={styles.userStats}>
                      <View style={styles.userStat}>
                        <Zap size={14} color={theme.primary} />
                        <Text style={[styles.userStatText, { color: theme.textSecondary }]}>
                          Lvl {user.level}
                        </Text>
                      </View>
                      <View style={styles.userStat}>
                        <Text style={[styles.userStatText, { color: theme.textSecondary }]}>
                          ⭐ {user.reputationScore.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.card }]}>
                <Search size={48} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No hustlers found</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery ? 'Try a different search term' : 'Start searching for hustlers'}
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface TaskCardItemProps {
  task: any;
  onPress: () => void;
  theme: any;
}

function TaskCardItem({ task, onPress, theme }: TaskCardItemProps) {
  const daysUntilDue = Math.ceil(
    (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.taskCard, { backgroundColor: theme.card }]}
    >
      <LinearGradient
        colors={[
          premiumColors.glassWhite,
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.taskGradient}
      />

      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View style={[styles.taskIconContainer, { backgroundColor: premiumColors.glassWhite }]}>
            <Sparkles size={20} color={premiumColors.neonCyan} />
          </View>
          <View style={styles.taskHeaderInfo}>
            <Text style={[styles.taskTitle, { color: theme.text }]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={[styles.taskDescription, { color: theme.textSecondary }]} numberOfLines={2}>
              {task.description}
            </Text>
          </View>
        </View>

        <View style={styles.taskMeta}>
          <View style={styles.taskMetaRow}>
            <View style={styles.taskMetaItem}>
              <MapPin size={14} color={theme.textSecondary} />
              <Text style={[styles.taskMetaText, { color: theme.textSecondary }]}>
                {typeof task.location === 'object' && task.location?.address ? task.location.address : (typeof task.location === 'string' ? task.location : 'Remote')}
              </Text>
            </View>
            <View style={styles.taskMetaItem}>
              <Calendar size={14} color={theme.textSecondary} />
              <Text style={[styles.taskMetaText, { color: theme.textSecondary }]}>
                {daysUntilDue > 0 ? `In ${daysUntilDue} days` : 'Today'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.taskFooter}>
          <View style={[styles.taskPriceTag, { backgroundColor: premiumColors.neonGreen + '20' }]}>
            <DollarSign size={16} color={premiumColors.neonGreen} />
            <Text style={[styles.taskPrice, { color: premiumColors.neonGreen }]}>
              ${task.payAmount}
            </Text>
          </View>
          <View style={[styles.taskXPTag, { backgroundColor: premiumColors.neonAmber + '20' }]}>
            <Zap size={16} color={premiumColors.neonAmber} />
            <Text style={[styles.taskXP, { color: premiumColors.neonAmber }]}>
              {task.xpReward} XP
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  filterButton: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    position: 'relative' as const,
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  filterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  filterInputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  results: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.lg,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    textAlign: 'center' as const,
    maxWidth: 280,
  },
  taskCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  taskGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  taskContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  taskDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.sm * 1.4,
  },
  taskMeta: {
    gap: spacing.sm,
  },
  taskMetaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  taskFooter: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  taskPriceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  taskPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  taskXPTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  taskXP: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  userCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  userGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  userInfo: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#00FFFF',
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  userBio: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  userStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userStatText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
