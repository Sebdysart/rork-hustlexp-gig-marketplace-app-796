import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity } from 'lucide-react-native';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';

/**
 * Quick access button to Verification Center
 * 
 * Usage:
 * 1. Import: import QuickVerificationButton from '@/components/QuickVerificationButton';
 * 2. Add anywhere: <QuickVerificationButton />
 * 3. Tap to run system verification
 * 
 * Recommended locations:
 * - Settings screen
 * - Profile screen
 * - Developer menu
 * - Debug screen
 */

interface QuickVerificationButtonProps {
  variant?: 'primary' | 'secondary' | 'icon-only';
  label?: string;
}

export default function QuickVerificationButton({ 
  variant = 'primary',
  label = 'System Check'
}: QuickVerificationButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/verification-center');
  };

  if (variant === 'icon-only') {
    return (
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Activity size={24} color={premiumColors.neonCyan} />
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Activity size={18} color={premiumColors.neonCyan} />
        <Text style={styles.secondaryText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.primaryButton}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Activity size={20} color="#FFF" />
      <Text style={styles.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: premiumColors.neonCyan,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: premiumColors.deepBlack,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
});
