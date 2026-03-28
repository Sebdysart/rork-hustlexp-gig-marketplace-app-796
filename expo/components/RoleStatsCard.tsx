import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { TrendingUp, Briefcase, Clock, Zap } from 'lucide-react-native';
import { RoleStats, UserMode } from '@/types';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import Colors from '@/constants/colors';

interface RoleStatsCardProps {
  roleStats: RoleStats | null;
  isLoading?: boolean;
}

export default function RoleStatsCard({ roleStats, isLoading }: RoleStatsCardProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <BlurView intensity={40} tint="dark" style={styles.blur}>
          <LinearGradient
            colors={[premiumColors.deepBlack, premiumColors.richBlack]}
            style={styles.gradient}
          >
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading role stats...</Text>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    );
  }

  if (!roleStats) {
    return null;
  }

  const getModeLabel = (mode: UserMode): string => {
    switch (mode) {
      case 'everyday':
        return 'Everyday Hustler';
      case 'tradesmen':
        return 'Tradesman Pro';
      case 'business':
        return 'Business Poster';
    }
  };

  const formatDuration = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ${Math.round(hours % 24)}h`;
  };

  const totalHours = roleStats.modeStats
    ? roleStats.modeStats.everyday + roleStats.modeStats.tradesmen + roleStats.modeStats.business
    : 0;

  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={[premiumColors.deepBlack, premiumColors.richBlack]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, roleStats.isDualRole && styles.iconContainerDualRole]}>
                <Zap
                  size={20}
                  color={roleStats.isDualRole ? premiumColors.neonAmber : premiumColors.neonCyan}
                  strokeWidth={2.5}
                />
              </View>
              <View>
                <Text style={styles.title}>Role Analytics</Text>
                {roleStats.isDualRole && (
                  <View style={styles.dualRoleBadge}>
                    <Text style={styles.dualRoleText}>DUAL ROLE +10%</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <TrendingUp size={16} color={premiumColors.neonCyan} strokeWidth={2.5} />
              <Text style={styles.statValue}>${roleStats.totalEarnings.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>

            <View style={styles.statItem}>
              <Briefcase size={16} color={premiumColors.neonMagenta} strokeWidth={2.5} />
              <Text style={styles.statValue}>${roleStats.totalSpent.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Spent</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{roleStats.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{roleStats.tasksPosted}</Text>
              <Text style={styles.statLabel}>Posted</Text>
            </View>
          </View>

          {roleStats.modeStats && (
            <View style={styles.modeStatsContainer}>
              <View style={styles.modeHeader}>
                <Clock size={16} color={premiumColors.glassWhiteStrong} strokeWidth={2.5} />
                <Text style={styles.modeTitle}>Mode Analytics</Text>
              </View>

              <View style={styles.modesList}>
                {(['everyday', 'tradesmen', 'business'] as UserMode[]).map((mode) => {
                  const hours = roleStats.modeStats![mode];
                  const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
                  const isPreferred = roleStats.modeStats!.preferredMode === mode;

                  if (hours === 0 && !isPreferred) return null;

                  return (
                    <View key={mode} style={styles.modeItem}>
                      <View style={styles.modeTop}>
                        <Text style={styles.modeLabel}>
                          {getModeLabel(mode)}
                          {isPreferred && ' ⭐'}
                        </Text>
                        <Text style={styles.modeDuration}>{formatDuration(hours)}</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <LinearGradient
                          colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: `${percentage}%` }]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {roleStats.modeStats.totalSwitches} mode switches • Preferred: {getModeLabel(roleStats.modeStats.preferredMode)}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  blur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  gradient: {
    padding: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
  },
  iconContainerDualRole: {
    backgroundColor: premiumColors.neonAmber + '20',
    borderColor: premiumColors.neonAmber,
    ...neonGlow.subtle,
    shadowColor: premiumColors.neonAmber,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  dualRoleBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.neonAmber + '20',
    borderWidth: 1,
    borderColor: premiumColors.neonAmber,
  },
  dualRoleText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: premiumColors.neonAmber,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: premiumColors.glassDark,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: spacing.sm,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.xs,
  },
  modeStatsContainer: {
    backgroundColor: premiumColors.glassDark,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  modesList: {
    gap: spacing.md,
  },
  modeItem: {
    gap: spacing.xs,
  },
  modeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  modeDuration: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  progressBar: {
    height: 6,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    textAlign: 'center',
  },
});
