import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Star,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { TradeCategory, TRADES, PortfolioItem } from '@/constants/tradesmen';
import GlassCard from '@/components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Portfolio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [filterTrade, setFilterTrade] = useState<TradeCategory | 'all'>('all');

  const mockPortfolio: PortfolioItem[] = [
    {
      id: '1',
      title: 'Commercial Office Rewiring',
      description: 'Complete electrical rewiring of 5,000 sq ft office space including new panel installation and LED lighting upgrade.',
      trade: 'electrician',
      beforeImages: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
      ],
      afterImages: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
      ],
      completedAt: '2024-01-15',
      clientReview: {
        rating: 5,
        comment: 'Exceptional work! Professional, on-time, and exceeded expectations.',
        clientName: 'Sarah M.',
      },
      tags: ['commercial', 'rewiring', 'LED', 'panel'],
    },
    {
      id: '2',
      title: 'Kitchen Plumbing Renovation',
      description: 'Full kitchen plumbing overhaul including new fixtures, garbage disposal, and under-sink filtration system.',
      trade: 'plumber',
      beforeImages: [
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
      ],
      afterImages: [
        'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
      ],
      completedAt: '2024-02-20',
      clientReview: {
        rating: 5,
        comment: 'Amazing transformation! Very clean work and great attention to detail.',
        clientName: 'John D.',
      },
      tags: ['kitchen', 'fixtures', 'renovation'],
    },
    {
      id: '3',
      title: 'HVAC System Installation',
      description: 'New central air conditioning system installation for 2,500 sq ft home with smart thermostat integration.',
      trade: 'hvac',
      beforeImages: [
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
      ],
      afterImages: [
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
      ],
      completedAt: '2024-03-10',
      clientReview: {
        rating: 5,
        comment: 'System works perfectly! House is so much more comfortable now.',
        clientName: 'Mike R.',
      },
      tags: ['HVAC', 'installation', 'smart home'],
    },
  ];

  const filteredPortfolio = filterTrade === 'all'
    ? mockPortfolio
    : mockPortfolio.filter(item => item.trade === filterTrade);

  const tradeFilters = [
    { id: 'all' as const, name: 'All', icon: '🎯' },
    ...TRADES.map(trade => ({ id: trade.id, name: trade.name, icon: trade.icon })),
  ];

  const handleNextImage = () => {
    if (selectedItem) {
      const totalImages = selectedItem.beforeImages.length + selectedItem.afterImages.length;
      setImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const handlePrevImage = () => {
    if (selectedItem) {
      const totalImages = selectedItem.beforeImages.length + selectedItem.afterImages.length;
      setImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const getCurrentImage = () => {
    if (!selectedItem) return '';
    const allImages = [...selectedItem.beforeImages, ...selectedItem.afterImages];
    return allImages[imageIndex];
  };

  const isBeforeImage = () => {
    if (!selectedItem) return false;
    return imageIndex < selectedItem.beforeImages.length;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Portfolio',
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
              <Text style={styles.title}>My Portfolio</Text>
              <Text style={styles.subtitle}>
                Showcase your best work to attract more clients
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {}}
            >
              <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.addGradient}
              >
                <Plus size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {tradeFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  filterTrade === filter.id && styles.filterChipActive,
                ]}
                onPress={() => setFilterTrade(filter.id)}
              >
                <Text style={styles.filterIcon}>{filter.icon}</Text>
                <Text
                  style={[
                    styles.filterText,
                    filterTrade === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.portfolioGrid}>
            {filteredPortfolio.map((item) => {
              const trade = TRADES.find(t => t.id === item.trade);
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.portfolioCard}
                  onPress={() => {
                    setSelectedItem(item);
                    setImageIndex(0);
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.afterImages[0] }}
                      style={styles.portfolioImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.imageGradient}
                    />
                    <View style={styles.tradeBadge}>
                      <Text style={styles.tradeIcon}>{trade?.icon}</Text>
                    </View>
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>

                    {item.clientReview && (
                      <View style={styles.reviewSection}>
                        <View style={styles.rating}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              color="#FFD700"
                              fill={i < item.clientReview!.rating ? '#FFD700' : 'transparent'}
                            />
                          ))}
                        </View>
                        <Text style={styles.clientName}>{item.clientReview.clientName}</Text>
                      </View>
                    )}

                    <View style={styles.dateRow}>
                      <Calendar size={12} color="#999" />
                      <Text style={styles.dateText}>
                        {new Date(item.completedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredPortfolio.length === 0 && (
            <View style={styles.emptyState}>
              <Camera size={48} color="#666" />
              <Text style={styles.emptyTitle}>No Projects Yet</Text>
              <Text style={styles.emptyText}>
                Start adding your completed projects to showcase your skills
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedItem(null)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {selectedItem && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageViewer}>
                  <Image
                    source={{ uri: getCurrentImage() }}
                    style={styles.fullImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.imageLabel}>
                    <Text style={styles.imageLabelText}>
                      {isBeforeImage() ? 'BEFORE' : 'AFTER'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.navButton, styles.navButtonLeft]}
                    onPress={handlePrevImage}
                  >
                    <ChevronLeft size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, styles.navButtonRight]}
                    onPress={handleNextImage}
                  >
                    <ChevronRight size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.imageCounter}>
                    <Text style={styles.counterText}>
                      {imageIndex + 1} / {selectedItem.beforeImages.length + selectedItem.afterImages.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDetails}>
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <Text style={styles.modalDescription}>{selectedItem.description}</Text>

                  <View style={styles.tagsContainer}>
                    {selectedItem.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {selectedItem.clientReview && (
                    <GlassCard style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewLabel}>Client Review</Text>
                        <View style={styles.reviewRating}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              color="#FFD700"
                              fill={i < selectedItem.clientReview!.rating ? '#FFD700' : 'transparent'}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewComment}>
                        &ldquo;{selectedItem.clientReview.comment}&rdquo;
                      </Text>
                      <Text style={styles.reviewClient}>
                        - {selectedItem.clientReview.clientName}
                      </Text>
                    </GlassCard>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  portfolioGrid: {
    gap: 16,
  },
  portfolioCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  tradeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeIcon: {
    fontSize: 20,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  itemDescription: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  reviewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  clientName: {
    fontSize: 12,
    color: '#999',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalContent: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageViewer: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  imageLabel: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  imageLabelText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalDetails: {
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalDescription: {
    fontSize: 15,
    color: '#CCC',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#4A90E2',
  },
  reviewCard: {
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#CCC',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewClient: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#999',
  },
});
