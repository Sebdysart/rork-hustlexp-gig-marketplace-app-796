import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Wrench,
  CheckCircle,
  Edit2,
  Trash2,
  Search,
  Package,
} from 'lucide-react-native';

import { TradeCategory, TRADES } from '@/constants/tradesmen';
import GlassCard from '@/components/GlassCard';

interface Tool {
  id: string;
  name: string;
  category: TradeCategory;
  owned: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  notes?: string;
}

export default function ToolInventory() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TradeCategory | 'all'>('all');
  const [, setShowAddModal] = useState(false);
  const [, setEditingTool] = useState<Tool | null>(null);

  const [tools, setTools] = useState<Tool[]>([
    {
      id: '1',
      name: 'Multimeter',
      category: 'electrician',
      owned: true,
      condition: 'excellent',
      notes: 'Fluke 87V - Professional grade',
    },
    {
      id: '2',
      name: 'Wire Strippers',
      category: 'electrician',
      owned: true,
      condition: 'good',
    },
    {
      id: '3',
      name: 'Voltage Tester',
      category: 'electrician',
      owned: true,
      condition: 'excellent',
    },
    {
      id: '4',
      name: 'Pipe Wrench',
      category: 'plumber',
      owned: true,
      condition: 'good',
      notes: '24-inch heavy duty',
    },
    {
      id: '5',
      name: 'Torch Kit',
      category: 'plumber',
      owned: false,
      condition: 'excellent',
    },
    {
      id: '6',
      name: 'Drain Snake',
      category: 'plumber',
      owned: true,
      condition: 'fair',
      notes: 'Needs cleaning',
    },
  ]);

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || tool.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const ownedTools = filteredTools.filter(t => t.owned);
  const neededTools = filteredTools.filter(t => !t.owned);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#4A90E2';
      case 'fair': return '#FFD700';
      case 'needs_repair': return '#FF6B6B';
      default: return '#999';
    }
  };

  const getConditionLabel = (condition: string) => {
    return condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleToggleOwned = (toolId: string) => {
    setTools(prev => prev.map(tool =>
      tool.id === toolId ? { ...tool, owned: !tool.owned } : tool
    ));
  };

  const handleDeleteTool = (toolId: string) => {
    Alert.alert(
      'Delete Tool',
      'Are you sure you want to remove this tool from your inventory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTools(prev => prev.filter(t => t.id !== toolId)),
        },
      ]
    );
  };

  const categories = [
    { id: 'all' as const, name: 'All Tools', icon: '🎯' },
    ...TRADES.map(trade => ({ id: trade.id, name: trade.name, icon: trade.icon })),
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Tool Inventory',
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
            <View>
              <Text style={styles.title}>Tool Inventory</Text>
              <Text style={styles.subtitle}>
                Track your equipment for better job matching
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.addGradient}
              >
                <Plus size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tools..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterChip,
                  filterCategory === cat.id && styles.filterChipActive,
                ]}
                onPress={() => setFilterCategory(cat.id)}
              >
                <Text style={styles.filterIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.filterText,
                    filterCategory === cat.id && styles.filterTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Wrench size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{ownedTools.length}</Text>
              <Text style={styles.statLabel}>Owned</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Package size={24} color="#FFD700" />
              <Text style={styles.statValue}>{neededTools.length}</Text>
              <Text style={styles.statLabel}>Needed</Text>
            </GlassCard>
          </View>

          {ownedTools.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Tools ({ownedTools.length})</Text>
              <View style={styles.toolsList}>
                {ownedTools.map((tool) => {
                  const trade = TRADES.find(t => t.id === tool.category);
                  const conditionColor = getConditionColor(tool.condition);

                  return (
                    <GlassCard key={tool.id} style={styles.toolCard}>
                      <View style={styles.toolHeader}>
                        <View style={styles.toolIcon}>
                          <Text style={styles.toolIconText}>{trade?.icon}</Text>
                        </View>
                        <View style={styles.toolInfo}>
                          <Text style={styles.toolName}>{tool.name}</Text>
                          <Text style={styles.toolCategory}>{trade?.name}</Text>
                        </View>
                        <View style={styles.toolActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setEditingTool(tool)}
                          >
                            <Edit2 size={16} color="#4A90E2" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeleteTool(tool.id)}
                          >
                            <Trash2 size={16} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.conditionRow}>
                        <View
                          style={[
                            styles.conditionBadge,
                            { backgroundColor: conditionColor + '20' },
                          ]}
                        >
                          <View
                            style={[
                              styles.conditionDot,
                              { backgroundColor: conditionColor },
                            ]}
                          />
                          <Text style={[styles.conditionText, { color: conditionColor }]}>
                            {getConditionLabel(tool.condition)}
                          </Text>
                        </View>
                      </View>

                      {tool.notes && (
                        <Text style={styles.toolNotes}>{tool.notes}</Text>
                      )}

                      <TouchableOpacity
                        style={styles.ownedButton}
                        onPress={() => handleToggleOwned(tool.id)}
                      >
                        <CheckCircle size={16} color="#4CAF50" />
                        <Text style={styles.ownedText}>Owned</Text>
                      </TouchableOpacity>
                    </GlassCard>
                  );
                })}
              </View>
            </View>
          )}

          {neededTools.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Needed Tools ({neededTools.length})</Text>
              <View style={styles.toolsList}>
                {neededTools.map((tool) => {
                  const trade = TRADES.find(t => t.id === tool.category);

                  return (
                    <GlassCard key={tool.id} style={styles.toolCard}>
                      <View style={styles.toolHeader}>
                        <View style={[styles.toolIcon, styles.toolIconNeeded]}>
                          <Text style={styles.toolIconText}>{trade?.icon}</Text>
                        </View>
                        <View style={styles.toolInfo}>
                          <Text style={styles.toolName}>{tool.name}</Text>
                          <Text style={styles.toolCategory}>{trade?.name}</Text>
                        </View>
                        <View style={styles.toolActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeleteTool(tool.id)}
                          >
                            <Trash2 size={16} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.markOwnedButton}
                        onPress={() => handleToggleOwned(tool.id)}
                      >
                        <LinearGradient
                          colors={['#4CAF50', '#45A049']}
                          style={styles.markOwnedGradient}
                        >
                          <CheckCircle size={16} color="#FFFFFF" />
                          <Text style={styles.markOwnedText}>Mark as Owned</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </GlassCard>
                  );
                })}
              </View>
            </View>
          )}

          {filteredTools.length === 0 && (
            <View style={styles.emptyState}>
              <Wrench size={48} color="#666" />
              <Text style={styles.emptyTitle}>No Tools Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add your first tool to get started'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderColor: '#4A90E2',
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#999',
  },
  filterTextActive: {
    color: '#4A90E2',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  toolsList: {
    gap: 12,
  },
  toolCard: {
    padding: 16,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolIconNeeded: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.5,
  },
  toolIconText: {
    fontSize: 24,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  toolCategory: {
    fontSize: 13,
    color: '#999',
  },
  toolActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionRow: {
    marginBottom: 12,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  toolNotes: {
    fontSize: 13,
    color: '#CCC',
    lineHeight: 18,
    marginBottom: 12,
  },
  ownedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingVertical: 10,
    borderRadius: 8,
  },
  ownedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4CAF50',
  },
  markOwnedButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  markOwnedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  markOwnedText: {
    fontSize: 14,
    fontWeight: '600' as const,
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
    maxWidth: 250,
  },
});
