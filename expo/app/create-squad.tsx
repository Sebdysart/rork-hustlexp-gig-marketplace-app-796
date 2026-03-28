import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Shield, Target, Tag } from 'lucide-react-native';
import { useSquads } from '@/contexts/SquadContext';
import { TRADES } from '@/constants/tradesmen';
import { COLORS } from '@/constants/colors';

const EMBLEM_ICONS = ['🛡️', '⚔️', '🏆', '👑', '💎', '⚡', '🔥', '🌟', '🎯', '🚀'];
const EMBLEM_COLORS = ['#FFD700', '#C0C0C0', '#B87333', '#4A90E2', '#9C27B0', '#FF6B6B', '#4CAF50'];
const EMBLEM_PATTERNS = ['solid', 'gradient', 'metallic', 'neon'];

export default function CreateSquadScreen() {
  const router = useRouter();
  const { createSquad } = useSquads();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState('5');
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🛡️');
  const [selectedColor, setSelectedColor] = useState('#FFD700');
  const [selectedPattern, setSelectedPattern] = useState('solid');

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a squad name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a squad description');
      return;
    }

    const maxMembersNum = parseInt(maxMembers);
    if (isNaN(maxMembersNum) || maxMembersNum < 2 || maxMembersNum > 10) {
      Alert.alert('Error', 'Max members must be between 2 and 10');
      return;
    }

    try {
      createSquad(
        name.trim(),
        description.trim(),
        maxMembersNum,
        selectedTrades.length > 0 ? selectedTrades : undefined,
        isPublic,
        tags.split(',').map((t) => t.trim()).filter(Boolean)
      );

      Alert.alert('Success', 'Squad created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create squad');
    }
  };

  const toggleTrade = (tradeId: string) => {
    setSelectedTrades((prev) =>
      prev.includes(tradeId) ? prev.filter((t) => t !== tradeId) : [...prev, tradeId]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Squad Details</Text>
          </View>

          <Text style={styles.label}>Squad Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter squad name"
            placeholderTextColor="#666"
            maxLength={30}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your squad's purpose and goals"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            maxLength={200}
          />

          <Text style={styles.label}>Max Members *</Text>
          <TextInput
            style={styles.input}
            value={maxMembers}
            onChangeText={setMaxMembers}
            placeholder="5"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Required Trades (Optional)</Text>
          </View>
          <Text style={styles.helperText}>Select trades required for squad members</Text>

          <View style={styles.tradesGrid}>
            {TRADES.map((trade) => (
              <TouchableOpacity
                key={trade.id}
                style={[
                  styles.tradeChip,
                  selectedTrades.includes(trade.id) && styles.tradeChipSelected,
                ]}
                onPress={() => toggleTrade(trade.id)}
              >
                <Text style={styles.tradeIcon}>{trade.icon}</Text>
                <Text
                  style={[
                    styles.tradeText,
                    selectedTrades.includes(trade.id) && styles.tradeTextSelected,
                  ]}
                >
                  {trade.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Squad Emblem</Text>
          </View>

          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {EMBLEM_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconButton, selectedIcon === icon && styles.iconButtonSelected]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorGrid}>
            {EMBLEM_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <Text style={styles.label}>Pattern</Text>
          <View style={styles.patternGrid}>
            {EMBLEM_PATTERNS.map((pattern) => (
              <TouchableOpacity
                key={pattern}
                style={[
                  styles.patternButton,
                  selectedPattern === pattern && styles.patternButtonSelected,
                ]}
                onPress={() => setSelectedPattern(pattern)}
              >
                <Text
                  style={[
                    styles.patternText,
                    selectedPattern === pattern && styles.patternTextSelected,
                  ]}
                >
                  {pattern}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.emblemPreview}>
            <View style={[styles.emblemIcon, { backgroundColor: selectedColor }]}>
              <Text style={styles.emblemIconText}>{selectedIcon}</Text>
            </View>
            <Text style={styles.emblemPreviewText}>Emblem Preview</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Additional Settings</Text>
          </View>

          <Text style={styles.label}>Tags (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="e.g., construction, residential, commercial"
            placeholderTextColor="#666"
          />

          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setIsPublic(!isPublic)}
          >
            <View style={styles.visibilityToggleLeft}>
              <Text style={styles.visibilityToggleTitle}>Public Squad</Text>
              <Text style={styles.visibilityToggleSubtitle}>
                {isPublic ? 'Anyone can find and request to join' : 'Invite-only squad'}
              </Text>
            </View>
            <View style={[styles.toggle, isPublic && styles.toggleActive]}>
              <View style={[styles.toggleThumb, isPublic && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create Squad</Text>
        </TouchableOpacity>
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 8,
    marginTop: 12,
  },
  helperText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tradeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
  },
  tradeChipSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  tradeIcon: {
    fontSize: 16,
  },
  tradeText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500' as const,
  },
  tradeTextSelected: {
    color: COLORS.primary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  iconText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#FFF',
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  patternButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
  },
  patternButtonSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  patternText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500' as const,
    textTransform: 'capitalize',
  },
  patternTextSelected: {
    color: COLORS.primary,
  },
  emblemPreview: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
  },
  emblemIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emblemIconText: {
    fontSize: 40,
  },
  emblemPreviewText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500' as const,
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginTop: 12,
  },
  visibilityToggleLeft: {
    flex: 1,
  },
  visibilityToggleTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  visibilityToggleSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
  },
});
