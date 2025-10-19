import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, TrendingUp, DollarSign, Download, Calendar, Clock, CheckCircle, X, TrendingDown, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import Svg, { Path, Circle } from 'react-native-svg';
import { predictWeeklyEarnings, predictMonthlyEarnings } from '@/utils/aiPredictiveEarnings';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 80;

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((value - min) / range) * CHART_HEIGHT;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points}`;

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.chart}>
      <Path
        d={pathData}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * CHART_WIDTH;
        const y = CHART_HEIGHT - ((value - min) / range) * CHART_HEIGHT;
        return (
          <Circle
            key={index}
            cx={x}
            cy={y}
            r={3}
            fill={color}
          />
        );
      })}
    </Svg>
  );
}

export default function WalletScreen() {
  const { currentUser, myAcceptedTasks } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [predictions, setPredictions] = useState<{
    weekly: { amount: number; confidence: number; trend: 'up' | 'down' | 'stable' };
    monthly: { amount: number; confidence: number; trend: 'up' | 'down' | 'stable' };
  } | null>(null);

  const walletData = useMemo(() => {
    if (!currentUser) return null;

    const completedTasks = myAcceptedTasks.filter(t => t.status === 'completed');
    const pendingTasks = myAcceptedTasks.filter(t => t.status === 'in_progress');

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const thisWeekTasks = completedTasks.filter(t => 
      t.completedAt && new Date(t.completedAt).getTime() > weekAgo
    );
    const thisMonthTasks = completedTasks.filter(t => 
      t.completedAt && new Date(t.completedAt).getTime() > monthAgo
    );

    const thisWeek = thisWeekTasks.reduce((sum, t) => sum + (t.payAmount * 0.875), 0);
    const thisMonth = thisMonthTasks.reduce((sum, t) => sum + (t.payAmount * 0.875), 0);
    const pending = pendingTasks.reduce((sum, t) => sum + (t.payAmount * 0.875), 0);

    const weeklyHistory: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayEarnings = completedTasks
        .filter(t => {
          if (!t.completedAt) return false;
          const time = new Date(t.completedAt).getTime();
          return time >= dayStart && time < dayEnd;
        })
        .reduce((sum, t) => sum + (t.payAmount * 0.875), 0);
      weeklyHistory.push(dayEarnings);
    }

    return {
      available: currentUser.earnings,
      pending,
      thisWeek,
      thisMonth,
      allTime: currentUser.earnings,
      weeklyHistory,
    };
  }, [currentUser, myAcceptedTasks]);

  useEffect(() => {
    if (currentUser && myAcceptedTasks.length > 0 && walletData && walletData.thisWeek !== undefined && walletData.thisMonth !== undefined) {
      const getPredictions = async () => {
        try {
          const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
          if (backendUrl) {
            try {
              const response = await fetch(
                `${backendUrl}/api/users/${currentUser.id}/earnings-history?days=30`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (response.ok) {
                const earningsData = await response.json();
                console.log('✅ Fetched earnings history from backend:', earningsData);
              }
            } catch (apiError) {
              console.log('📡 Backend not available, using local predictions');
            }
          }

          const weeklyPred = predictWeeklyEarnings(currentUser, myAcceptedTasks);
          const monthlyPred = predictMonthlyEarnings(currentUser, myAcceptedTasks);
          
          const weeklyTrend: 'up' | 'down' | 'stable' = weeklyPred.projected > walletData.thisWeek * 4 ? 'up' : 'stable';
          const monthlyTrend: 'up' | 'down' | 'stable' = monthlyPred.projected > walletData.thisMonth * 4 ? 'up' : 'stable';
          
          setPredictions({
            weekly: { 
              amount: weeklyPred.projected, 
              confidence: weeklyPred.confidence / 100, 
              trend: weeklyTrend 
            },
            monthly: { 
              amount: monthlyPred.projected, 
              confidence: monthlyPred.confidence / 100, 
              trend: monthlyTrend 
            },
          });
        } catch (error) {
          console.error('Failed to get predictions:', error);
        }
      };
      getPredictions();
    }
  }, [currentUser, myAcceptedTasks, walletData]);

  if (!currentUser || !walletData) {
    return null;
  }

  const handleInstantPayout = () => {
    triggerHaptic('medium');
    setShowPayoutModal(true);
  };

  const handleConfirmPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (amount > walletData.available) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough available balance');
      return;
    }

    triggerHaptic('success');
    Alert.alert(
      'Payout Initiated! 💸',
      `$${amount.toFixed(2)} will be transferred to your account within 30 minutes.`,
      [{ text: 'OK', onPress: () => setShowPayoutModal(false) }]
    );
    setPayoutAmount('');
  };

  const getPeriodData = () => {
    switch (selectedPeriod) {
      case 'week':
        return walletData.thisWeek;
      case 'month':
        return walletData.thisMonth;
      case 'all':
        return walletData.allTime;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceGradient}
            >
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <TouchableOpacity onPress={() => triggerHaptic('light')}>
                  <DollarSign size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.balanceAmount}>${walletData.available.toFixed(2)}</Text>
              <View style={styles.balanceFooter}>
                <View style={styles.pendingContainer}>
                  <Clock size={16} color={Colors.text} />
                  <View>
                    <Text style={styles.pendingLabel}>Pending</Text>
                    <Text style={styles.pendingAmount}>${walletData.pending.toFixed(2)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.instantPayoutButton}
                  onPress={handleInstantPayout}
                  disabled={walletData.available <= 0}
                >
                  <Zap size={16} color={Colors.text} />
                  <Text style={styles.instantPayoutText}>Instant Payout</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.periodSelector}>
            {(['week', 'month', 'all'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => {
                  setSelectedPeriod(period);
                  triggerHaptic('light');
                }}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === period && styles.periodTextActive,
                  ]}
                >
                  {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <TrendingUp size={20} color={Colors.accent} />
              <Text style={styles.statsTitle}>Earnings Overview</Text>
            </View>
            <Text style={styles.statsAmount}>${getPeriodData().toFixed(2)}</Text>
            <View style={styles.chartContainer}>
              <Sparkline data={walletData.weeklyHistory} color={Colors.accent} />
            </View>
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabel}>7 days ago</Text>
              <Text style={styles.chartLabel}>Today</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Calendar size={24} color={Colors.accent} />
              <Text style={styles.statValue}>${walletData.thisWeek.toFixed(2)}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={24} color={Colors.accent} />
              <Text style={styles.statValue}>${walletData.thisMonth.toFixed(2)}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Zap size={20} color={Colors.accent} />
              <Text style={styles.infoTitle}>Instant Payout</Text>
            </View>
            <Text style={styles.infoText}>
              Get your earnings in 30 minutes or less. No waiting, no hassle.
            </Text>
            <View style={styles.infoFeatures}>
              <View style={styles.infoFeature}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.infoFeatureText}>30-minute transfer</Text>
              </View>
              <View style={styles.infoFeature}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.infoFeatureText}>No minimum amount</Text>
              </View>
              <View style={styles.infoFeature}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.infoFeatureText}>Secure & encrypted</Text>
              </View>
            </View>
          </View>

          {predictions && (
            <GlassCard variant="dark" style={styles.predictionsCard}>
              <View style={styles.predictionsHeader}>
                <Sparkles size={20} color={premiumColors.neonCyan} />
                <Text style={styles.predictionsTitle}>AI Earnings Predictions</Text>
              </View>

              <View style={styles.predictionRow}>
                <View style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>Next Week</Text>
                  <Text style={styles.predictionAmount}>${predictions.weekly.amount.toFixed(2)}</Text>
                  <View style={styles.predictionMeta}>
                    {predictions.weekly.trend === 'up' ? (
                      <TrendingUp size={14} color={premiumColors.neonGreen} />
                    ) : predictions.weekly.trend === 'down' ? (
                      <TrendingDown size={14} color={premiumColors.neonAmber} />
                    ) : null}
                    <Text style={styles.predictionConfidence}>
                      {(predictions.weekly.confidence * 100).toFixed(0)}% confident
                    </Text>
                  </View>
                </View>

                <View style={styles.predictionDivider} />

                <View style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>Next Month</Text>
                  <Text style={styles.predictionAmount}>${predictions.monthly.amount.toFixed(2)}</Text>
                  <View style={styles.predictionMeta}>
                    {predictions.monthly.trend === 'up' ? (
                      <TrendingUp size={14} color={premiumColors.neonGreen} />
                    ) : predictions.monthly.trend === 'down' ? (
                      <TrendingDown size={14} color={premiumColors.neonAmber} />
                    ) : null}
                    <Text style={styles.predictionConfidence}>
                      {(predictions.monthly.confidence * 100).toFixed(0)}% confident
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.predictionDisclaimer}>
                Predictions based on your task history, completion rate, and market trends
              </Text>
            </GlassCard>
          )}

          <View style={styles.commissionInfo}>
            <Text style={styles.commissionText}>
              💡 HustleXP takes a 12.5% commission on completed tasks
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={showPayoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Instant Payout</Text>
              <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Available: ${walletData.available.toFixed(2)}
            </Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                placeholder="Enter amount"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmPayout}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.confirmGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Download size={20} color={Colors.text} />
                <Text style={styles.confirmButtonText}>Confirm Payout</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.modalNote}>
              Funds will arrive in your account within 30 minutes
            </Text>
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
  balanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: -1,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
  },
  pendingAmount: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  instantPayoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  instantPayoutText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  periodTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  statsAmount: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  chartContainer: {
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoFeatures: {
    gap: 12,
  },
  infoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoFeatureText: {
    fontSize: 14,
    color: Colors.text,
  },
  commissionInfo: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  commissionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  modalNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  predictionsCard: {
    padding: 20,
    marginBottom: 16,
  },
  predictionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  predictionsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  predictionItem: {
    flex: 1,
    alignItems: 'center',
  },
  predictionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  predictionAmount: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  predictionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  predictionConfidence: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  predictionDivider: {
    width: 1,
    backgroundColor: premiumColors.glassWhite,
    marginHorizontal: 16,
  },
  predictionDisclaimer: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
});
