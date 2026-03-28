import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOffers } from '@/contexts/OfferContext';
import { OfferDraft } from '@/types';
import { Plus, Eye, Pause, Play, Trash2, Edit } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export default function OffersScreen() {
  const router = useRouter();
  const { offersByStatus, isLoading, limits, deleteOffer, publishOffer, pauseOffer } = useOffers();
  const [selectedTab, setSelectedTab] = useState<'published' | 'draft' | 'paused'>('published');

  const currentOffers = offersByStatus[selectedTab];

  const handleDelete = (offerId: string, title: string) => {
    Alert.alert(
      'Delete Offer',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOffer(offerId);
              Alert.alert('Deleted', 'Offer has been deleted.');
            } catch (error) {
              console.error('[Offers] Delete failed:', error);
              Alert.alert('Error', 'Failed to delete offer.');
            }
          },
        },
      ]
    );
  };

  const handlePublish = async (offerId: string, title: string) => {
    try {
      await publishOffer(offerId);
      Alert.alert('Published', `"${title}" is now live!`);
    } catch (error: any) {
      console.error('[Offers] Publish failed:', error);
      Alert.alert('Error', error.message || 'Failed to publish offer.');
    }
  };

  const handlePause = async (offerId: string, title: string) => {
    try {
      await pauseOffer(offerId);
      Alert.alert('Paused', `"${title}" has been paused.`);
    } catch (error) {
      console.error('[Offers] Pause failed:', error);
      Alert.alert('Error', 'Failed to pause offer.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'My Offers',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Offers',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Offers</Text>
        <Text style={styles.headerSubtitle}>
          {offersByStatus.published.length} / {limits.maxActiveOffers} active
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'published' && styles.tabActive]}
          onPress={() => setSelectedTab('published')}
        >
          <Text style={[styles.tabText, selectedTab === 'published' && styles.tabTextActive]}>
            Published ({offersByStatus.published.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'draft' && styles.tabActive]}
          onPress={() => setSelectedTab('draft')}
        >
          <Text style={[styles.tabText, selectedTab === 'draft' && styles.tabTextActive]}>
            Drafts ({offersByStatus.draft.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'paused' && styles.tabActive]}
          onPress={() => setSelectedTab('paused')}
        >
          <Text style={[styles.tabText, selectedTab === 'paused' && styles.tabTextActive]}>
            Paused ({offersByStatus.paused.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {currentOffers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No offers yet</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'published'
                ? 'Create your first offer to start receiving matches.'
                : selectedTab === 'draft'
                ? 'Draft offers are saved here until you publish them.'
                : 'Paused offers are hidden from search but not deleted.'}
            </Text>
            {selectedTab === 'published' && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/offers/new' as any)}
              >
                <Plus size={20} color="#000" />
                <Text style={styles.createButtonText}>Create Offer</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {currentOffers.map(offer => (
              <OfferCard
                key={offer.offerId}
                offer={offer}
                onPublish={() => handlePublish(offer.offerId, offer.title)}
                onPause={() => handlePause(offer.offerId, offer.title)}
                onDelete={() => handleDelete(offer.offerId, offer.title)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {offersByStatus.published.length < limits.maxActiveOffers && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => router.push('/offers/new' as any)}
          >
            <Plus size={24} color="#000" />
            <Text style={styles.fabText}>New Offer</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

interface OfferCardProps {
  offer: OfferDraft;
  onPublish?: () => void;
  onPause?: () => void;
  onDelete?: () => void;
}

function OfferCard({ offer, onPublish, onPause, onDelete }: OfferCardProps) {
  const priceRange = offer.tiers.length > 0
    ? `$${Math.min(...offer.tiers.map(t => t.priceUsd))} - $${Math.max(...offer.tiers.map(t => t.priceUsd))}`
    : 'N/A';

  return (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.offerTitleRow}>
          <Text style={styles.offerTitle} numberOfLines={1}>
            {offer.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              offer.status === 'published' && styles.statusBadgePublished,
              offer.status === 'draft' && styles.statusBadgeDraft,
              offer.status === 'paused' && styles.statusBadgePaused,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                offer.status === 'published' && styles.statusBadgeTextPublished,
                offer.status === 'draft' && styles.statusBadgeTextDraft,
                offer.status === 'paused' && styles.statusBadgeTextPaused,
              ]}
            >
              {offer.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.offerCategory}>{offer.category}</Text>
      </View>

      <Text style={styles.offerDescription} numberOfLines={2}>
        {offer.description}
      </Text>

      <View style={styles.offerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pricing</Text>
          <Text style={styles.statValue}>{priceRange}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Radius</Text>
          <Text style={styles.statValue}>{offer.radiusMiles}mi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Views</Text>
          <Text style={styles.statValue}>{offer.viewCount || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Matches</Text>
          <Text style={styles.statValue}>{offer.matchCount || 0}</Text>
        </View>
      </View>

      <View style={styles.offerActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Eye size={18} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        {offer.status === 'draft' && onPublish && (
          <TouchableOpacity style={styles.actionButton} onPress={onPublish}>
            <Play size={18} color={COLORS.secondary} />
            <Text style={[styles.actionText, styles.actionTextPublish]}>Publish</Text>
          </TouchableOpacity>
        )}

        {offer.status === 'published' && onPause && (
          <TouchableOpacity style={styles.actionButton} onPress={onPause}>
            <Pause size={18} color={COLORS.warning} />
            <Text style={[styles.actionText, styles.actionTextPause]}>Pause</Text>
          </TouchableOpacity>
        )}

        {offer.status === 'paused' && onPublish && (
          <TouchableOpacity style={styles.actionButton} onPress={onPublish}>
            <Play size={18} color={COLORS.secondary} />
            <Text style={[styles.actionText, styles.actionTextPublish]}>Resume</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton}>
          <Edit size={18} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        {onDelete && (
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Trash2 size={18} color={COLORS.error} />
            <Text style={[styles.actionText, styles.actionTextDelete]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.secondary,
    fontWeight: '700' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  offerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  offerHeader: {
    marginBottom: 12,
  },
  offerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 12,
  },
  offerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgePublished: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  statusBadgeDraft: {
    backgroundColor: COLORS.warning + '20',
    borderColor: COLORS.warning,
  },
  statusBadgePaused: {
    backgroundColor: COLORS.textSecondary + '20',
    borderColor: COLORS.textSecondary,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  statusBadgeTextPublished: {
    color: COLORS.success,
  },
  statusBadgeTextDraft: {
    color: COLORS.warning,
  },
  statusBadgeTextPaused: {
    color: COLORS.textSecondary,
  },
  offerCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  offerDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  offerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  offerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  actionTextPublish: {
    color: COLORS.secondary,
  },
  actionTextPause: {
    color: COLORS.warning,
  },
  actionTextDelete: {
    color: COLORS.error,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
});
