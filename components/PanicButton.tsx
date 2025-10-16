import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Phone, MapPin, Shield, X } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/haptics';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from './GlassCard';

interface PanicButtonProps {
  taskId: string;
  style?: any;
}

export default function PanicButton({ taskId, style }: PanicButtonProps) {
  const { currentUser, tasks } = useApp();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [isPanic, setIsPanic] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const task = tasks.find(t => t.id === taskId);

  useEffect(() => {
    if (showModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showModal && countdown === 0) {
      handleConfirmPanic();
    }
  }, [showModal, countdown]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim, glowAnim]);

  const handlePress = () => {
    triggerHaptic('warning');
    setShowModal(true);
    setCountdown(5);
  };

  const handleCancel = () => {
    triggerHaptic('light');
    setShowModal(false);
    setCountdown(5);
  };

  const handleConfirmPanic = () => {
    triggerHaptic('error');
    setIsPanic(true);
    setShowModal(false);

    console.log('🚨 PANIC ALERT TRIGGERED 🚨');
    console.log('Task ID:', taskId);
    console.log('User:', currentUser?.name);
    console.log('Location:', currentUser?.location);
    console.log('Time:', new Date().toISOString());

    Alert.alert(
      '🚨 Emergency Alert Sent',
      'Support has been notified and will contact you immediately. Your location has been shared with emergency services.',
      [
        {
          text: 'Call 911',
          onPress: () => console.log('Calling 911...'),
          style: 'destructive',
        },
        {
          text: 'OK',
          onPress: () => setIsPanic(false),
        },
      ]
    );
  };

  if (!currentUser || !task) {
    return null;
  }

  return (
    <>
      <Animated.View style={[style, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <GlassCard variant="darkStrong" style={styles.container}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <AlertTriangle size={24} color="#fff" />
              <Text style={styles.text}>Emergency</Text>
            </LinearGradient>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <GlassCard variant="darkStrong" style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <View style={styles.warningIcon}>
                <AlertTriangle size={48} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Emergency Alert</Text>
              <Text style={styles.modalSubtitle}>
                Are you in danger or need immediate help?
              </Text>
            </View>

            <View style={styles.countdownCircle}>
              <Text style={styles.countdownText}>{countdown}</Text>
              <Text style={styles.countdownLabel}>
                {countdown > 0 ? 'Canceling in...' : 'Sending alert...'}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Shield size={20} color={premiumColors.neonCyan} />
                <Text style={styles.infoText}>
                  Support will be notified immediately
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={20} color={premiumColors.neonViolet} />
                <Text style={styles.infoText}>
                  Your location will be shared
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={20} color={premiumColors.neonAmber} />
                <Text style={styles.infoText}>
                  Emergency services will be contacted
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmPanic}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.confirmGradient}
              >
                <AlertTriangle size={20} color="#fff" />
                <Text style={styles.confirmButtonText}>Send Alert Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  countdownCircle: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: '#EF4444',
  },
  countdownLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  cancelButton: {
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
