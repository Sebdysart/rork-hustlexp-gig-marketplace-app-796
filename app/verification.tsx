import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, CheckCircle, Mail, Phone, CreditCard, FileCheck } from 'lucide-react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function VerificationScreen() {
  const { currentUser, addVerificationBadge } = useApp();

  if (!currentUser) {
    return null;
  }

  const verificationBadges = currentUser.verificationBadges || [];
  const hasEmailVerification = verificationBadges.some(b => b.type === 'email');
  const hasPhoneVerification = verificationBadges.some(b => b.type === 'phone');
  const hasIdVerification = verificationBadges.some(b => b.type === 'id');
  const hasBackgroundCheck = verificationBadges.some(b => b.type === 'background');

  const handleVerifyEmail = async () => {
    if (hasEmailVerification) {
      Alert.alert('Already Verified', 'Your email is already verified.');
      return;
    }

    Alert.alert(
      'Email Verification',
      'A verification link has been sent to your email. Please check your inbox.',
      [
        {
          text: 'Simulate Verification',
          onPress: async () => {
            await addVerificationBadge(currentUser.id, 'email');
            Alert.alert('Success', 'Email verified successfully!');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleVerifyPhone = async () => {
    if (hasPhoneVerification) {
      Alert.alert('Already Verified', 'Your phone is already verified.');
      return;
    }

    Alert.alert(
      'Phone Verification',
      'Enter your phone number to receive a verification code.',
      [
        {
          text: 'Simulate Verification',
          onPress: async () => {
            await addVerificationBadge(currentUser.id, 'phone');
            Alert.alert('Success', 'Phone verified successfully!');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleVerifyId = async () => {
    if (hasIdVerification) {
      Alert.alert('Already Verified', 'Your ID is already verified.');
      return;
    }

    Alert.alert(
      'ID Verification',
      'Upload a photo of your government-issued ID for verification.',
      [
        {
          text: 'Simulate Verification',
          onPress: async () => {
            await addVerificationBadge(currentUser.id, 'id');
            Alert.alert('Success', 'ID verified successfully!');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleBackgroundCheck = async () => {
    if (hasBackgroundCheck) {
      Alert.alert('Already Verified', 'Your background check is complete.');
      return;
    }

    Alert.alert(
      'Background Check',
      'Complete a background check to increase trust. This may take 2-3 business days.',
      [
        {
          text: 'Simulate Verification',
          onPress: async () => {
            await addVerificationBadge(currentUser.id, 'background');
            Alert.alert('Success', 'Background check completed!');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Verification',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />

      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Shield size={48} color={Colors.accent} />
            <Text style={styles.headerTitle}>Get Verified</Text>
            <Text style={styles.headerSubtitle}>
              Increase your trust score and unlock premium features by completing verifications.
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Verification Progress</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(verificationBadges.length / 4) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {verificationBadges.length} of 4 verifications completed
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Verifications</Text>

            <TouchableOpacity
              style={[
                styles.verificationCard,
                hasEmailVerification && styles.verifiedCard,
              ]}
              onPress={handleVerifyEmail}
              disabled={hasEmailVerification}
            >
              <View style={styles.verificationIcon}>
                <Mail size={32} color={hasEmailVerification ? Colors.accent : Colors.textSecondary} />
              </View>
              <View style={styles.verificationContent}>
                <Text style={styles.verificationTitle}>Email Verification</Text>
                <Text style={styles.verificationDescription}>
                  Verify your email address to receive important notifications
                </Text>
              </View>
              {hasEmailVerification ? (
                <CheckCircle size={24} color={Colors.accent} fill={Colors.accent} />
              ) : (
                <Text style={styles.verifyButton}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verificationCard,
                hasPhoneVerification && styles.verifiedCard,
              ]}
              onPress={handleVerifyPhone}
              disabled={hasPhoneVerification}
            >
              <View style={styles.verificationIcon}>
                <Phone size={32} color={hasPhoneVerification ? Colors.accent : Colors.textSecondary} />
              </View>
              <View style={styles.verificationContent}>
                <Text style={styles.verificationTitle}>Phone Verification</Text>
                <Text style={styles.verificationDescription}>
                  Verify your phone number for two-factor authentication
                </Text>
              </View>
              {hasPhoneVerification ? (
                <CheckCircle size={24} color={Colors.accent} fill={Colors.accent} />
              ) : (
                <Text style={styles.verifyButton}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verificationCard,
                hasIdVerification && styles.verifiedCard,
              ]}
              onPress={handleVerifyId}
              disabled={hasIdVerification}
            >
              <View style={styles.verificationIcon}>
                <CreditCard size={32} color={hasIdVerification ? Colors.accent : Colors.textSecondary} />
              </View>
              <View style={styles.verificationContent}>
                <Text style={styles.verificationTitle}>ID Verification</Text>
                <Text style={styles.verificationDescription}>
                  Upload a government-issued ID to verify your identity
                </Text>
              </View>
              {hasIdVerification ? (
                <CheckCircle size={24} color={Colors.accent} fill={Colors.accent} />
              ) : (
                <Text style={styles.verifyButton}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verificationCard,
                hasBackgroundCheck && styles.verifiedCard,
              ]}
              onPress={handleBackgroundCheck}
              disabled={hasBackgroundCheck}
            >
              <View style={styles.verificationIcon}>
                <FileCheck size={32} color={hasBackgroundCheck ? Colors.accent : Colors.textSecondary} />
              </View>
              <View style={styles.verificationContent}>
                <Text style={styles.verificationTitle}>Background Check</Text>
                <Text style={styles.verificationDescription}>
                  Complete a background check for maximum trust
                </Text>
              </View>
              {hasBackgroundCheck ? (
                <CheckCircle size={24} color={Colors.accent} fill={Colors.accent} />
              ) : (
                <Text style={styles.verifyButton}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Benefits of Verification</Text>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={Colors.accent} />
              <Text style={styles.benefitText}>Higher trust score and reputation</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={Colors.accent} />
              <Text style={styles.benefitText}>Access to premium tasks</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={Colors.accent} />
              <Text style={styles.benefitText}>Priority in search results</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={Colors.accent} />
              <Text style={styles.benefitText}>Verified badge on profile</Text>
            </View>
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
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  verificationCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  verifiedCard: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  verificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  verificationDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  verifyButton: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  benefitsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text,
  },
});
