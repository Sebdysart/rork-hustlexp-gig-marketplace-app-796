import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Award, Target, Unlock } from 'lucide-react-native';
import GlassCard from './GlassCard';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';

interface StatChange {
  label: string;
  currentValue: number | string;
  newValue: number | string;
  increase: number | string;
  icon?: 'trending' | 'award' | 'target';
  unit?: string;
}

interface UnlockItem {
  icon: string;
  text: string;
}

interface ImpactPreviewProps {
  stats: StatChange[];
  unlocks: UnlockItem[];
}

export default function ImpactPreview({ stats, unlocks }: ImpactPreviewProps) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const itemAnims = useRef(
    stats.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    itemAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const getIconComponent = (icon?: string) => {
    switch (icon) {
      case 'trending':
        return <TrendingUp size={16} color={premiumColors.neonCyan} />;
      case 'award':
        return <Award size={16} color={premiumColors.neonAmber} />;
      case 'target':
        return <Target size={16} color={premiumColors.neonPurple} />;
      default:
        return <TrendingUp size={16} color={premiumColors.neonCyan} />;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <GlassCard
        variant="darkStrong"
        neonBorder
        glowColor="neonCyan"
        style={styles.container}
      >
        <LinearGradient
          colors={[premiumColors.neonCyan + '20', 'transparent']}
          style={styles.gradient}
        />

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <TrendingUp size={24} color={premiumColors.neonCyan} />
          </View>
          <Text style={styles.title}>📊 IF YOU COMPLETE THIS QUEST...</Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Animated.View
              key={index}
              style={[
                styles.statRow,
                {
                  opacity: itemAnims[index],
                  transform: [
                    {
                      translateX: itemAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {stat.icon && (
                <View style={styles.statIcon}>{getIconComponent(stat.icon)}</View>
              )}
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>{stat.label}:</Text>
                <View style={styles.statValues}>
                  <Text style={styles.currentValue}>
                    {stat.currentValue}
                    {stat.unit}
                  </Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.newValue}>
                    {stat.newValue}
                    {stat.unit}
                  </Text>
                  <View style={styles.increaseBadge}>
                    <Text style={styles.increaseText}>
                      ⬆️ +{stat.increase}
                      {stat.unit}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {unlocks.length > 0 && (
          <View style={styles.unlocksSection}>
            <View style={styles.unlocksDivider} />
            <View style={styles.unlocksHeader}>
              <Unlock size={18} color={premiumColors.neonPurple} />
              <Text style={styles.unlocksTitle}>You&apos;ll Unlock:</Text>
            </View>
            <View style={styles.unlocksList}>
              {unlocks.map((unlock, index) => (
                <View key={index} style={styles.unlockItem}>
                  <Text style={styles.unlockIcon}>{unlock.icon}</Text>
                  <Text style={styles.unlockText}>{unlock.text}</Text>
                </View>
              ))}
            </View>
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
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.neonCyan + '20',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  statsContainer: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: 12,
    padding: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: premiumColors.richBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  currentValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  arrow: {
    fontSize: 14,
    color: premiumColors.neonCyan,
    fontWeight: '700' as const,
  },
  newValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  increaseBadge: {
    backgroundColor: premiumColors.neonGreen + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '40',
  },
  increaseText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: premiumColors.neonGreen,
  },
  unlocksSection: {
    marginTop: 20,
    gap: 12,
  },
  unlocksDivider: {
    height: 1,
    backgroundColor: premiumColors.neonPurple + '40',
    marginBottom: 8,
  },
  unlocksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unlocksTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  unlocksList: {
    gap: 8,
  },
  unlockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: premiumColors.neonPurple + '15',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: premiumColors.neonPurple + '40',
  },
  unlockIcon: {
    fontSize: 18,
  },
  unlockText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 18,
  },
});
