import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useEffect, useRef } from 'react';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius: radius = borderRadius.md, style }: SkeletonLoaderProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[premiumColors.richBlack, premiumColors.charcoal, premiumColors.richBlack]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
    </Animated.View>
  );
}

export function TaskCardSkeleton() {
  return (
    <View style={styles.taskCardSkeleton}>
      <View style={styles.taskHeader}>
        <SkeletonLoader width={100} height={32} borderRadius={borderRadius.lg} />
        <SkeletonLoader width={80} height={32} borderRadius={borderRadius.lg} />
      </View>
      <SkeletonLoader width="90%" height={28} style={{ marginBottom: spacing.sm }} />
      <SkeletonLoader width="100%" height={20} style={{ marginBottom: spacing.xs }} />
      <SkeletonLoader width="80%" height={20} style={{ marginBottom: spacing.lg }} />
      <View style={styles.statsRow}>
        <SkeletonLoader width={80} height={24} />
        <SkeletonLoader width={80} height={24} />
        <SkeletonLoader width={80} height={24} />
      </View>
    </View>
  );
}

export function StatCardSkeleton() {
  return (
    <View style={styles.statCardSkeleton}>
      <SkeletonLoader width={40} height={40} borderRadius={borderRadius.full} style={{ marginBottom: spacing.sm }} />
      <SkeletonLoader width={50} height={24} style={{ marginBottom: spacing.xs }} />
      <SkeletonLoader width={60} height={16} />
    </View>
  );
}

export function QuestCardSkeleton() {
  return (
    <View style={styles.questCardSkeleton}>
      <View style={styles.questHeader}>
        <SkeletonLoader width={60} height={24} />
        <SkeletonLoader width={40} height={24} />
      </View>
      <SkeletonLoader width="85%" height={20} style={{ marginBottom: spacing.sm }} />
      <SkeletonLoader width="60%" height={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: premiumColors.richBlack,
    overflow: 'hidden',
  },
  taskCardSkeleton: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardSkeleton: {
    flex: 1,
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  questCardSkeleton: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
