import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, MapPin, Clock } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from './GlassCard';

export default function AvailabilityToggle() {
  const { currentUser, updateAvailabilityStatus } = useApp();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentUser) {
      setIsAvailable(currentUser.availabilityStatus === 'available_now');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isAvailable) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isAvailable, pulseAnim, glowAnim]);

  const handleToggle = async () => {
    if (!currentUser) return;

    const newStatus = isAvailable ? 'online' : 'available_now';
    setIsAvailable(!isAvailable);
    triggerHaptic(isAvailable ? 'light' : 'success');

    await updateAvailabilityStatus(newStatus);
    console.log('Availability toggled:', newStatus);
  };

  if (!currentUser || (currentUser.role !== 'worker' && currentUser.role !== 'both')) {
    return null;
  }

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.9}>
        <GlassCard
          variant={isAvailable ? 'darkStrong' : 'dark'}
          neonBorder={isAvailable}
          glowColor="neonAmber"
          style={styles.container}
        >
          <LinearGradient
            colors={
              isAvailable
                ? [premiumColors.neonAmber + '20', premiumColors.neonCyan + '15']
                : [premiumColors.glassWhite, premiumColors.glassWhite]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Zap
                  size={28}
                  color={isAvailable ? premiumColors.neonAmber : Colors.textSecondary}
                  fill={isAvailable ? premiumColors.neonAmber : 'transparent'}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, isAvailable && styles.titleActive]}>
                  {isAvailable ? 'Available Now' : 'Go Available'}
                </Text>
                <Text style={styles.subtitle}>
                  {isAvailable
                    ? "You're visible to nearby posters"
                    : 'Get instant gig offers'}
                </Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  isAvailable && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    isAvailable && styles.toggleKnobActive,
                  ]}
                />
              </View>
            </View>

            {isAvailable && (
              <View style={styles.activeInfo}>
                <View style={styles.infoRow}>
                  <MapPin size={16} color={premiumColors.neonCyan} />
                  <Text style={styles.infoText}>
                    Broadcasting your location
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color={premiumColors.neonViolet} />
                  <Text style={styles.infoText}>
                    Instant match priority
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'visible',
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: premiumColors.glassWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  titleActive: {
    color: premiumColors.neonAmber,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: premiumColors.glassWhite,
    padding: 3,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: premiumColors.neonAmber + '40',
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.textSecondary,
  },
  toggleKnobActive: {
    backgroundColor: premiumColors.neonAmber,
    alignSelf: 'flex-end',
  },
  activeInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
});
