import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, DollarSign, Zap, Navigation } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { Task } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import { useTranslatedTexts } from '@/hooks/useTranslatedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyBlaMjVt7bjYp4UswpEjIs_Tp2IBWgJlkQ';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function AdventureMapScreen() {
  const { currentUser, availableTasks, users } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nearby' | 'high-pay'>('all');
  const insets = useSafeAreaInsets();

  const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12] = useTranslatedTexts([
    'Adventure Map',
    'Quest Map',
    'quests available near you',
    'All Quests',
    'Nearby',
    'High Pay',
    'Map view available on mobile',
    '📍 Blue marker = Your location',
    '🔴 Red markers = Available quests',
    'Available Quests',
    'by',
    'away'
  ]);

  const tasksWithDistance = useMemo(() => {
    if (!currentUser) return [];
    return availableTasks.map(task => {
      const distance = calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        task.location.lat,
        task.location.lng
      );
      return { ...task, distance };
    });
  }, [availableTasks, currentUser]);

  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];
    let filtered = [...tasksWithDistance];
    
    switch (selectedFilter) {
      case 'nearby':
        filtered = filtered.filter(t => t.distance < 10);
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'high-pay':
        filtered.sort((a, b) => b.payAmount - a.payAmount);
        break;
      default:
        filtered.sort((a, b) => a.distance - b.distance);
    }
    
    return filtered;
  }, [tasksWithDistance, selectedFilter, currentUser]);

  const mapImageUrl = useMemo(() => {
    if (!currentUser) return '';
    const markers = filteredTasks.slice(0, 10).map((task, index) => {
      const label = String.fromCharCode(65 + index);
      return `markers=color:red%7Clabel:${label}%7C${task.location.lat},${task.location.lng}`;
    }).join('&');

    const centerLat = currentUser.location.lat;
    const centerLng = currentUser.location.lng;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=12&size=${Math.floor(SCREEN_WIDTH - 32)}x400&maptype=roadmap&markers=color:blue%7Clabel:You%7C${centerLat},${centerLng}&${markers}&key=${GOOGLE_MAPS_API_KEY}`;
  }, [filteredTasks, currentUser]);

  const handleFilterPress = (filter: 'all' | 'nearby' | 'high-pay') => {
    triggerHaptic('light');
    setSelectedFilter(filter);
  };

  const handleTaskPress = (task: Task) => {
    triggerHaptic('medium');
    router.push(`/task/${task.id}`);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t1,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <Navigation size={32} color={Colors.accent} />
            <Text style={styles.headerTitle}>{t2}</Text>
            <Text style={styles.headerSubtitle}>
              {filteredTasks.length} {t3}
            </Text>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
              onPress={() => handleFilterPress('all')}
            >
              <Text style={[styles.filterButtonText, selectedFilter === 'all' && styles.filterButtonTextActive]}>
                {t4}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'nearby' && styles.filterButtonActive]}
              onPress={() => handleFilterPress('nearby')}
            >
              <Text style={[styles.filterButtonText, selectedFilter === 'nearby' && styles.filterButtonTextActive]}>
                {t5}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'high-pay' && styles.filterButtonActive]}
              onPress={() => handleFilterPress('high-pay')}
            >
              <Text style={[styles.filterButtonText, selectedFilter === 'high-pay' && styles.filterButtonTextActive]}>
                {t6}
              </Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'web' ? (
            <View style={styles.mapPlaceholder}>
              <MapPin size={48} color={Colors.textSecondary} />
              <Text style={styles.mapPlaceholderText}>
                {t7}
              </Text>
            </View>
          ) : (
            <View style={styles.mapContainer}>
              <View style={styles.mapImageContainer}>
                <Text style={styles.mapNote}>{t8}</Text>
                <Text style={styles.mapNote}>{t9}</Text>
              </View>
            </View>
          )}

          <View style={styles.questsList}>
            <Text style={styles.questsListTitle}>{t10}</Text>
            {filteredTasks.map((task, index) => {
              const poster = users.find(u => u.id === task.posterId);
              const label = String.fromCharCode(65 + index);
              
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.questCard}
                  onPress={() => handleTaskPress(task)}
                >
                  <LinearGradient
                    colors={[Colors.card, Colors.surface]}
                    style={styles.questGradient}
                  >
                    <View style={styles.questHeader}>
                      <View style={styles.questMarker}>
                        <Text style={styles.questMarkerText}>{label}</Text>
                      </View>
                      <View style={styles.questHeaderInfo}>
                        <Text style={styles.questTitle} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <Text style={styles.questPoster} numberOfLines={1}>
                          {t11} {poster?.name || 'Unknown'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.questDetails}>
                      <View style={styles.questDetailItem}>
                        <MapPin size={16} color={Colors.textSecondary} />
                        <Text style={styles.questDetailText}>
                          {task.distance < 1 
                            ? `${(task.distance * 1000).toFixed(0)}m ${t12}`
                            : `${task.distance.toFixed(1)}km ${t12}`
                          }
                        </Text>
                      </View>
                      <View style={styles.questDetailItem}>
                        <DollarSign size={16} color={Colors.accent} />
                        <Text style={styles.questDetailText}>
                          ${task.payAmount}
                        </Text>
                      </View>
                      <View style={styles.questDetailItem}>
                        <Zap size={16} color={Colors.accent} />
                        <Text style={styles.questDetailText}>
                          {task.xpReward} XP
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.questCategory}>
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.text,
  },
  mapContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  mapImageContainer: {
    padding: 16,
  },
  mapNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: Colors.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  questsList: {
    gap: 12,
  },
  questsListTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  questCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  questGradient: {
    padding: 16,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  questMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questMarkerText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  questHeaderInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  questPoster: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  questDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  questDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  questCategory: {
    fontSize: 11,
    color: Colors.accent,
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
});
