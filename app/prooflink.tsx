import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Upload, CheckCircle, X, Tag, Share2, Image as ImageIcon } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { ProofLink, TaskCategory } from '@/types';

const CATEGORIES: { value: TaskCategory; label: string; emoji: string }[] = [
  { value: 'cleaning', label: 'Cleaning', emoji: '🧹' },
  { value: 'errands', label: 'Errands', emoji: '🏃' },
  { value: 'delivery', label: 'Delivery', emoji: '📦' },
  { value: 'moving', label: 'Moving', emoji: '🚚' },
  { value: 'handyman', label: 'Handyman', emoji: '🔧' },
  { value: 'tech', label: 'Tech', emoji: '💻' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

export default function ProofLinkScreen() {
  const { currentUser } = useApp();
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('cleaning');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');

  const mockProofLinks: ProofLink[] = useMemo(() => {
    if (!currentUser) return [];
    
    return [
      {
        id: 'proof-1',
        userId: currentUser.id,
        category: 'cleaning',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
        tags: ['before-after', 'deep-clean', 'kitchen'],
        verified: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Complete kitchen deep clean with before/after photos',
      },
      {
        id: 'proof-2',
        userId: currentUser.id,
        category: 'delivery',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
        tags: ['package', 'on-time', 'signature'],
        verified: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Package delivery with signature confirmation',
      },
      {
        id: 'proof-3',
        userId: currentUser.id,
        category: 'handyman',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
        tags: ['repair', 'quality', 'tools-provided'],
        verified: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Furniture assembly and repair work',
      },
    ];
  }, [currentUser]);

  const filteredProofs = useMemo(() => {
    if (filterCategory === 'all') return mockProofLinks;
    return mockProofLinks.filter(p => p.category === filterCategory);
  }, [mockProofLinks, filterCategory]);

  if (!currentUser) {
    return null;
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      triggerHaptic('light');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
    triggerHaptic('light');
  };

  const handleShare = (proof: ProofLink) => {
    triggerHaptic('medium');
    Alert.alert(
      'Share ProofLink',
      'Choose how you want to share this proof',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share Image',
          onPress: () => {
            Alert.alert('Shared! 📤', 'ProofLink image shared successfully');
          },
        },
        {
          text: 'Generate Card',
          onPress: () => {
            Alert.alert('Card Generated! 🎨', 'Branded share card created and saved to your device');
          },
        },
      ]
    );
  };

  const handleUpload = () => {
    triggerHaptic('success');
    Alert.alert(
      'ProofLink Added! ✅',
      'Your proof has been uploaded and is pending verification.',
      [{ text: 'OK', onPress: () => setShowUploadModal(false) }]
    );
    setDescription('');
    setTags([]);
  };

  const verifiedCount = mockProofLinks.filter(p => p.verified).length;
  const totalCount = mockProofLinks.length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'ProofLink Portfolio',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Portfolio</Text>
              <Text style={styles.headerSubtitle}>
                {verifiedCount} of {totalCount} verified
              </Text>
            </View>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => {
                triggerHaptic('medium');
                setShowUploadModal(true);
              }}
            >
              <Upload size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCount}</Text>
                <Text style={styles.statLabel}>Total Proofs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{verifiedCount}</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round((verifiedCount / totalCount) * 100)}%</Text>
                <Text style={styles.statLabel}>Quality</Text>
              </View>
            </LinearGradient>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                filterCategory === 'all' && styles.categoryChipActive,
              ]}
              onPress={() => {
                setFilterCategory('all');
                triggerHaptic('light');
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  filterCategory === 'all' && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  filterCategory === cat.value && styles.categoryChipActive,
                ]}
                onPress={() => {
                  setFilterCategory(cat.value);
                  triggerHaptic('light');
                }}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    filterCategory === cat.value && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredProofs.length === 0 ? (
            <View style={styles.emptyState}>
              <ImageIcon size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No ProofLinks Yet</Text>
              <Text style={styles.emptyText}>
                Upload photos and videos of your completed work to build your portfolio
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowUploadModal(true)}
              >
                <Upload size={20} color={Colors.text} />
                <Text style={styles.emptyButtonText}>Upload First Proof</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredProofs.map((proof) => (
                <TouchableOpacity
                  key={proof.id}
                  style={styles.proofCard}
                  onPress={() => triggerHaptic('light')}
                >
                  <Image source={{ uri: proof.url }} style={styles.proofImage} />
                  {proof.verified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={16} color={Colors.success} />
                    </View>
                  )}
                  <View style={styles.proofOverlay}>
                    <View style={styles.proofHeader}>
                      <View style={styles.proofCategory}>
                        <Text style={styles.proofCategoryText}>
                          {CATEGORIES.find(c => c.value === proof.category)?.emoji}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => handleShare(proof)}
                      >
                        <Share2 size={16} color={Colors.text} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.proofDescription} numberOfLines={2}>
                      {proof.description}
                    </Text>
                    <View style={styles.proofTags}>
                      {proof.tags.slice(0, 2).map((tag) => (
                        <View key={tag} style={styles.proofTag}>
                          <Text style={styles.proofTagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 ProofLink Tips</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Upload before/after photos for better verification</Text>
              <Text style={styles.infoItem}>• Add relevant tags to showcase your skills</Text>
              <Text style={styles.infoItem}>• Verified proofs boost your TrustScore</Text>
              <Text style={styles.infoItem}>• Share your portfolio to attract more clients</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload ProofLink</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.uploadArea}>
              <Camera size={48} color={Colors.textSecondary} />
              <Text style={styles.uploadText}>Tap to take photo or select from gallery</Text>
            </TouchableOpacity>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryModalScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryModalChip,
                      selectedCategory === cat.value && styles.categoryModalChipActive,
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat.value);
                      triggerHaptic('light');
                    }}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryModalChipText,
                        selectedCategory === cat.value && styles.categoryModalChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the work you completed..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <Tag size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.tagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Add tags (e.g., before-after)"
                  placeholderTextColor={Colors.textSecondary}
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              {tags.length > 0 && (
                <View style={styles.tagsList}>
                  {tags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>#{tag}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                        <X size={14} color={Colors.text} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.uploadSubmitButton} onPress={handleUpload}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.uploadSubmitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Upload size={20} color={Colors.text} />
                <Text style={styles.uploadSubmitText}>Upload ProofLink</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.text,
    opacity: 0.2,
    marginHorizontal: 12,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  categoryChipTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  proofCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 4,
  },
  proofOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  proofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  proofCategory: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
  },
  proofCategoryText: {
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
  },
  proofDescription: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 8,
  },
  proofTags: {
    flexDirection: 'row',
    gap: 4,
  },
  proofTag: {
    backgroundColor: Colors.accent + '40',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proofTagText: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
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
    maxHeight: '90%',
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
  uploadArea: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
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
  categoryModalScroll: {
    flexGrow: 0,
  },
  categoryModalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
  },
  categoryModalChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryModalChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  categoryModalChipTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  tagInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addTagButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  uploadSubmitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadSubmitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  uploadSubmitText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
});
