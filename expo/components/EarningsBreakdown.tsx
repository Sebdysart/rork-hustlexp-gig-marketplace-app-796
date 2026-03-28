import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, Zap, Trophy, Flame, Sparkles } from 'lucide-react-native';
import GlassCard from './GlassCard';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';

interface Bonus {
  label: string;
  amount: number;
  icon: 'zap' | 'trophy' | 'flame' | 'sparkles';
  multiplier?: string;
  color: string;
}

interface EarningsBreakdownProps {
  basePay: number;
  bonuses: Bonus[];
  platformFee: number;
  xpReward?: number;
  gritReward?: number;
}

export default function EarningsBreakdown({
  basePay,
  bonuses,
  platformFee,
  xpReward = 0,
  gritReward = 0,
}: EarningsBreakdownProps) {
  const counterAnims = useRef<Record<string, Animated.Value>>({
    base: new Animated.Value(0),
    ...bonuses.reduce((acc, _, idx) => {
      acc[`bonus${idx}`] = new Animated.Value(0);
      return acc;
    }, {} as Record<string, Animated.Value>),
    total: new Animated.Value(0),
    net: new Animated.Value(0),
  }).current;

  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Object.entries(counterAnims).forEach(([key, anim]) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        delay: key === 'net' ? 400 : 200,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  const totalPotential = basePay + totalBonuses;
  const netEarnings = totalPotential - platformFee;

  const getIconComponent = (icon: string, color: string, size: number = 16) => {
    switch (icon) {
      case 'zap':
        return <Zap size={size} color={color} />;
      case 'trophy':
        return <Trophy size={size} color={color} />;
      case 'flame':
        return <Flame size={size} color={color} />;
      case 'sparkles':
        return <Sparkles size={size} color={color} />;
      default:
        return <Zap size={size} color={color} />;
    }
  };

  const formatMoney = (amount: number) => {
    return amount.toFixed(2);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <GlassCard
        variant="dark"
        neonBorder
        glowColor="neonAmber"
        style={styles.container}
      >
        <LinearGradient
          colors={[premiumColors.neonAmber + '20', 'transparent']}
          style={styles.gradient}
        />

        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <DollarSign size={24} color={premiumColors.neonAmber} />
          </View>
          <Text style={styles.title}>💰 TOTAL POTENTIAL EARNINGS</Text>
        </View>

        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base Pay:</Text>
            <Text style={styles.breakdownValue}>
              ${formatMoney(basePay)}
            </Text>
          </View>

          {bonuses.map((bonus, index) => (
            <View key={index} style={styles.breakdownRow}>
              <View style={styles.bonusLabelContainer}>
                {getIconComponent(bonus.icon, bonus.color, 14)}
                <Text style={styles.breakdownLabel}>{bonus.label}:</Text>
                {bonus.multiplier && (
                  <View style={[styles.multiplierBadge, { borderColor: bonus.color }]}>
                    <Text style={[styles.multiplierText, { color: bonus.color }]}>
                      {bonus.multiplier}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.breakdownValue, styles.bonusValue]}>
                +${formatMoney(bonus.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total Potential:</Text>
            <Text style={styles.totalValue}>
              ${formatMoney(totalPotential)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Platform Fee ({(platformFee / totalPotential * 100).toFixed(0)}%):</Text>
            <Text style={[styles.breakdownValue, styles.feeValue]}>
              -${formatMoney(platformFee)}
            </Text>
          </View>

          <View style={styles.dividerBold} />

          <View style={[styles.breakdownRow, styles.netRow]}>
            <Text style={styles.netLabel}>YOU EARN:</Text>
            <Text style={styles.netValue}>
              ${formatMoney(netEarnings)}
            </Text>
          </View>
        </View>

        {(xpReward > 0 || gritReward > 0) && (
          <View style={styles.rewards}>
            {xpReward > 0 && (
              <View style={styles.rewardItem}>
                <Sparkles size={16} color={premiumColors.neonCyan} />
                <Text style={styles.rewardText}>+{xpReward} XP</Text>
              </View>
            )}
            {gritReward > 0 && (
              <View style={styles.rewardItem}>
                <Zap size={16} color={premiumColors.neonAmber} />
                <Text style={styles.rewardText}>+{gritReward} GritCoins</Text>
              </View>
            )}
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    overflow: 'visible',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonAmber + '20',
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  breakdown: {
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  bonusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  multiplierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: premiumColors.richBlack,
  },
  multiplierText: {
    fontSize: 10,
    fontWeight: '800' as const,
  },
  breakdownValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  bonusValue: {
    color: premiumColors.neonGreen,
  },
  feeValue: {
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: premiumColors.glassWhite,
    marginVertical: 4,
  },
  dividerBold: {
    height: 2,
    backgroundColor: premiumColors.neonAmber,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  totalValue: {
    fontSize: 20,
    color: premiumColors.neonAmber,
    fontWeight: '800' as const,
  },
  netRow: {
    backgroundColor: premiumColors.neonAmber + '15',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  netLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  netValue: {
    fontSize: 24,
    color: premiumColors.neonAmber,
    fontWeight: '900' as const,
    textShadowColor: premiumColors.neonAmber,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  rewards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  rewardItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: premiumColors.glassWhite,
    paddingVertical: 10,
    borderRadius: 10,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
