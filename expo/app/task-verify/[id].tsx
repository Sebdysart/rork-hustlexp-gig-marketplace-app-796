import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, FileText, X, Upload, CheckCircle, Loader } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/contexts/AppContext';
import { useTaskLifecycle } from '@/contexts/TaskLifecycleContext';
import NeonButton from '@/components/NeonButton';
import GlassCard from '@/components/GlassCard';
import HustleAIAssistant from '@/components/HustleAIAssistant';
import { premiumColors, spacing, typography, borderRadius } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';
import { TaskProof } from '@/types';

export default function TaskVerifyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks } = useApp();
  const { submitVerification } = useTaskLifecycle();

  const [proofItems, setProofItems] = useState<TaskProof[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAI, setShowAI] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>('');

  const task = tasks.find(t => t.id === id);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photos to submit proof.');
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    triggerHaptic('light');
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newProof: TaskProof = {
        id: `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'photo',
        url: result.assets[0].uri,
        timestamp: new Date().toISOString(),
      };
      setProofItems([...proofItems, newProof]);
      setAiMessage('Photo captured! Add more proof or submit when ready.');
      setShowAI(true);
    }
  };

  const handlePickImage = async () => {
    triggerHaptic('light');
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newProofs: TaskProof[] = result.assets.map(asset => ({
        id: `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'photo',
        url: asset.uri,
        timestamp: new Date().toISOString(),
      }));
      setProofItems([...proofItems, ...newProofs]);
      setAiMessage(`${newProofs.length} photo(s) added! Looking good!`);
      setShowAI(true);
    }
  };

  const handleRemoveProof = (index: number) => {
    triggerHaptic('light');
    setProofItems(proofItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (proofItems.length === 0) {
      Alert.alert('Proof Required', 'Please add at least one photo or document as proof of completion.');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      setAiMessage('Submitting proof for AI verification...');
      setShowAI(true);

      const proofsWithNotes = proofItems.map(proof => ({
        ...proof,
        notes: notes || undefined,
      }));

      await submitVerification(id || '', proofsWithNotes);

      setTimeout(() => {
        setAiMessage('Proof submitted! AI is verifying now...');
        setTimeout(() => {
          router.push(`/task-verification-result/${id}` as any);
        }, 2000);
      }, 1500);

    } catch (error) {
      console.error('[TaskVerify] Error submitting proof:', error);
      Alert.alert('Error', 'Failed to submit proof. Please try again.');
      triggerHaptic('error');
      setIsSubmitting(false);
    }
  };

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Submit Proof' }} />
        <Text style={styles.errorText}>Task not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Submit Proof',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Upload size={48} color={premiumColors.neonCyan} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Submit Proof of Completion</Text>
          <Text style={styles.subtitle}>
            Add photos or documents showing your completed work
          </Text>
        </View>

        <GlassCard variant="darkStrong" style={styles.taskCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>
        </GlassCard>

        <HustleAIAssistant
          message={aiMessage}
          visible={showAI}
          variant="info"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proof Items</Text>
          
          {proofItems.length === 0 && (
            <View style={styles.emptyState}>
              <Camera size={48} color={premiumColors.neonCyan} opacity={0.5} />
              <Text style={styles.emptyText}>No proof added yet</Text>
              <Text style={styles.emptySubtext}>
                Take photos or upload documents to prove task completion
              </Text>
            </View>
          )}

          {proofItems.length > 0 && (
            <View style={styles.proofGrid}>
              {proofItems.map((proof, index) => (
                <View key={proof.id} style={styles.proofItem}>
                  <Image source={{ uri: proof.url }} style={styles.proofImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveProof(index)}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.proofType}>
                    {proof.type === 'photo' && <ImageIcon size={14} color="#FFFFFF" />}
                    {proof.type === 'video' && <FileText size={14} color="#FFFFFF" />}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleTakePhoto}
              disabled={isSubmitting}
            >
              <GlassCard 
                variant="dark" 
                neonBorder 
                glowColor="neonCyan" 
                style={styles.uploadButtonInner}
              >
                <Camera size={32} color={premiumColors.neonCyan} />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
              disabled={isSubmitting}
            >
              <GlassCard 
                variant="dark" 
                neonBorder 
                glowColor="neonViolet" 
                style={styles.uploadButtonInner}
              >
                <ImageIcon size={32} color={premiumColors.neonViolet} />
                <Text style={styles.uploadButtonText}>Upload Photos</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any details about the completed work..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.infoBox}>
          <CheckCircle size={20} color={premiumColors.neonGreen} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>AI Verification</Text>
            <Text style={styles.infoText}>
              Your proof will be verified by AI within seconds. High-quality photos ensure faster approval.
            </Text>
          </View>
        </View>

        <NeonButton
          title={isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          onPress={handleSubmit}
          disabled={isSubmitting || proofItems.length === 0}
          variant="cyan"
          icon={isSubmitting ? <Loader size={20} color={premiumColors.deepBlack} /> : <Upload size={20} color={premiumColors.deepBlack} />}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  taskCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  taskTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  taskDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.7,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '20',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  proofGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  proofItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  proofImage: {
    width: '100%',
    height: '100%',
    backgroundColor: premiumColors.richBlack,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofType: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadButton: {
    flex: 1,
  },
  uploadButtonInner: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    overflow: 'visible',
  },
  uploadButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: premiumColors.neonGreen + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '30',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: premiumColors.neonGreen,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
});
