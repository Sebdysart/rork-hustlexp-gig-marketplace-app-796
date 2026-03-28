import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, TrendingUp, TrendingDown, MapPin, Clock, Trash2, Bell, BellOff } from 'lucide-react-native';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { WatchlistItem, PriceAlert } from '@/types';

const MOCK_WATCHLIST: WatchlistItem[] = [
  {
    id: 'watch-1',
    userId: 'user-1',
    taskId: 'task-1',
    addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    originalPay: 45,
    notifyOnPriceChange: true,
  },
  {
    id: 'watch-2',
    userId: 'user-1',
    taskId: 'task-2',
    addedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    originalPay: 60,
    notifyOnPriceChange: false,
  },
];

const MOCK_PRICE_ALERTS: PriceAlert[] = [
  {
    id: 'alert-1',
    userId: 'user-1',
    taskId: 'task-1',
    originalPay: 45,
    newPay: 55,
    changePercent: 22,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
  },
];

export default function WatchlistScreen() {
  const { currentUser, tasks } = useApp();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(MOCK_WATCHLIST);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(MOCK_PRICE_ALERTS);
  const insets = useSafeAreaInsets();

  if (!currentUser) return null;

  const handleRemoveFromWatchlist = (itemId: string) => {
    triggerHaptic('medium');
    Alert.alert(
      'Remove from Watchlist',
      'Are you sure you want to remove this task from your watchlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setWatchlist(watchlist.filter(item => item.id !== itemId));
            triggerHaptic('success');
          },
        },
      ]
    );
  };

  const handleToggleNotifications = (itemId: string) => {
    triggerHaptic('light');
    setWatchlist(
      watchlist.map(item =>
        item.id === itemId
          ? { ...item, notifyOnPriceChange: !item.notifyOnPriceChange }
          : item
      )
    );
  };

  const handleViewTask = (taskId: string) => {
    triggerHaptic('medium');
    router.push(`/task/${taskId}`);
  };

  const handleDismissAlert = (alertId: string) => {
    triggerHaptic('light');
    setPriceAlerts(priceAlerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const unreadAlerts = priceAlerts.filter(a => !a.read);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Watchlist',
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonAmber" style={styles.headerCard}>
            <LinearGradient
              colors={[premiumColors.neonAmber + '20', premiumColors.neonViolet + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerIcon}>
                <Bookmark size={32} color={premiumColors.neonAmber} />
              </View>
              <Text style={styles.headerTitle}>Your Watchlist</Text>
              <Text style={styles.headerSubtitle}>
                Save interesting tasks and get notified when prices change!
              </Text>
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{watchlist.length}</Text>
                  <Text style={styles.headerStatLabel}>Watching</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{unreadAlerts.length}</Text>
                  <Text style={styles.headerStatLabel}>Price Alerts</Text>
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

          {unreadAlerts.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <TrendingUp size={20} color={premiumColors.neonGreen} />
                  <Text style={styles.sectionTitle}>Price Alerts</Text>
                </View>
              </View>

              {unreadAlerts.map((alert) => {
                const task = tasks.find(t => t.id === alert.taskId);
                if (!task) return null;

                const isIncrease = alert.newPay > alert.originalPay;

                return (
                  <TouchableOpacity
                    key={alert.id}
                    activeOpacity={0.9}
                    onPress={() => handleViewTask(alert.taskId)}
                  >
                    <GlassCard
                      variant="dark"
                      style={[
                        styles.alertCard,
                        isIncrease && styles.alertCardIncrease,
                      ]}
                    >
                      <View style={styles.alertHeader}>
                        <View
                          style={[
                            styles.alertIconContainer,
                            { backgroundColor: isIncrease ? premiumColors.neonGreen + '20' : premiumColors.neonAmber + '20' },
                          ]}
                        >
                          {isIncrease ? (
                            <TrendingUp size={24} color={premiumColors.neonGreen} />
                          ) : (
                            <TrendingDown size={24} color={premiumColors.neonAmber} />
                          )}
                        </View>
                        <View style={styles.alertInfo}>
                          <Text style={styles.alertTitle}>
                            {isIncrease ? 'Price Increased!' : 'Price Changed'}
                          </Text>
                          <Text style={styles.alertTaskTitle} numberOfLines={1}>
                            {task.title}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.dismissButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDismissAlert(alert.id);
                          }}
                        >
                          <Text style={styles.dismissText}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.priceChangeContainer}>
                        <View style={styles.priceChange}>
                          <Text style={styles.priceLabel}>Was</Text>
                          <Text style={styles.priceOld}>${alert.originalPay}</Text>
                        </View>
                        <View style={styles.priceArrow}>
                          <Text style={styles.priceArrowText}>→</Text>
                        </View>
                        <View style={styles.priceChange}>
                          <Text style={styles.priceLabel}>Now</Text>
                          <Text
                            style={[
                              styles.priceNew,
                              { color: isIncrease ? premiumColors.neonGreen : premiumColors.neonAmber },
                            ]}
                          >
                            ${alert.newPay}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.percentBadge,
                            { backgroundColor: isIncrease ? premiumColors.neonGreen + '20' : premiumColors.neonAmber + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.percentText,
                              { color: isIncrease ? premiumColors.neonGreen : premiumColors.neonAmber },
                            ]}
                          >
                            {isIncrease ? '+' : ''}{alert.changePercent}%
                          </Text>
                        </View>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Bookmark size={20} color={premiumColors.neonCyan} />
              <Text style={styles.sectionTitle}>Saved Tasks</Text>
            </View>
          </View>

          {watchlist.length === 0 ? (
            <GlassCard variant="dark" style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔖</Text>
              <Text style={styles.emptyTitle}>No Saved Tasks</Text>
              <Text style={styles.emptyText}>
                Tap the bookmark icon on any task to add it to your watchlist
              </Text>
            </GlassCard>
          ) : (
            watchlist.map((item) => {
              const task = tasks.find(t => t.id === item.taskId);
              if (!task) return null;

              const hoursAgo = Math.floor(
                (Date.now() - new Date(item.addedAt).getTime()) / (1000 * 60 * 60)
              );

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  onPress={() => handleViewTask(item.taskId)}
                >
                  <GlassCard variant="dark" style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskHeaderLeft}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <View style={styles.taskMeta}>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{task.category}</Text>
                          </View>
                          <View style={styles.timeBadge}>
                            <Clock size={12} color={Colors.textSecondary} />
                            <Text style={styles.timeText}>
                              {hoursAgo < 1 ? 'Just now' : `${hoursAgo}h ago`}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.taskDescription} numberOfLines={2}>
                      {task.description}
                    </Text>

                    <View style={styles.taskDetails}>
                      <View style={styles.taskDetail}>
                        <MapPin size={14} color={Colors.textSecondary} />
                        <Text style={styles.taskDetailText} numberOfLines={1}>
                          {task.location.address.split(',')[0]}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.taskFooter}>
                      <View style={styles.payContainer}>
                        <Text style={styles.payAmount}>${task.payAmount}</Text>
                        <Text style={styles.payLabel}>
                          {task.payType === 'fixed' ? 'fixed' : '/hr'}
                        </Text>
                      </View>
                      <View style={styles.taskActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleNotifications(item.id);
                          }}
                        >
                          {item.notifyOnPriceChange ? (
                            <Bell size={18} color={premiumColors.neonAmber} />
                          ) : (
                            <BellOff size={18} color={Colors.textSecondary} />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWatchlist(item.id);
                          }}
                        >
                          <Trash2 size={18} color={Colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}

          <GlassCard variant="dark" style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Watchlist Tips</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Save for Later:</Text> Bookmark tasks you're interested in but not ready to accept
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Price Alerts:</Text> Get notified when task pay increases
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Quick Access:</Text> View all your saved tasks in one place
              </Text>
              <Text style={styles.infoItem}>
                • <Text style={styles.infoBold}>Smart Tracking:</Text> Tasks are automatically removed when completed or cancelled
              </Text>
            </View>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
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
  headerCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 40,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  alertCard: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '40',
  },
  alertCardIncrease: {
    borderColor: premiumColors.neonGreen + '40',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
    marginBottom: 4,
  },
  alertTaskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: premiumColors.richBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: premiumColors.richBlack,
    padding: 12,
    borderRadius: 12,
  },
  priceChange: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceOld: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  priceNew: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  priceArrow: {
    marginHorizontal: 8,
  },
  priceArrowText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  taskCard: {
    marginBottom: 12,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: premiumColors.neonCyan + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: premiumColors.glassWhite + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  taskDetails: {
    marginBottom: 16,
  },
  taskDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite + '10',
  },
  payContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  payAmount: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: premiumColors.neonGreen,
  },
  payLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.richBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
