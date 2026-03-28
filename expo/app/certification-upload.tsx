import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Upload,
  Camera,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Award,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/contexts/AppContext';
import { TradeCategory, TRADES, CertificationDocument } from '@/constants/tradesmen';
import GlassCard from '@/components/GlassCard';

type CertificationType = 'license' | 'certification' | 'insurance' | 'bond';

export default function CertificationUpload() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useApp();
  const [selectedType, setSelectedType] = useState<CertificationType>('license');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mockCertifications: CertificationDocument[] = [
    {
      id: '1',
      type: 'license',
      name: 'Journeyman Electrician License',
      issuer: 'State Board of Electricians',
      number: 'JE-12345',
      issueDate: '2020-03-15',
      expiryDate: '2025-03-15',
      verified: true,
      verifiedAt: '2020-03-20',
      verifiedBy: 'HustleXP Verification Team',
    },
    {
      id: '2',
      type: 'certification',
      name: 'OSHA Safety Certification',
      issuer: 'OSHA',
      number: 'OSHA-67890',
      issueDate: '2021-06-10',
      verified: true,
      verifiedAt: '2021-06-15',
    },
    {
      id: '3',
      type: 'insurance',
      name: 'General Liability Insurance',
      issuer: 'SafeWork Insurance Co.',
      number: 'GLI-54321',
      issueDate: '2023-01-01',
      expiryDate: '2024-01-01',
      verified: false,
    },
  ];

  const certificationTypes = [
    { id: 'license' as const, label: 'License', icon: <Shield size={20} color="#4A90E2" /> },
    { id: 'certification' as const, label: 'Certification', icon: <Award size={20} color="#FFD700" /> },
    { id: 'insurance' as const, label: 'Insurance', icon: <FileText size={20} color="#4CAF50" /> },
    { id: 'bond' as const, label: 'Bond', icon: <CheckCircle size={20} color="#9C27B0" /> },
  ];

  const pickImage = async (useCamera: boolean) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Image upload is not available on web preview');
      return;
    }

    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera/library access to upload documents');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });

    if (!result.canceled && result.assets[0]) {
      setUploadedImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!uploadedImage) {
      Alert.alert('No Image', 'Please select an image to upload');
      return;
    }

    setIsUploading(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsUploading(false);
    Alert.alert(
      'Upload Successful',
      'Your certification has been submitted for verification. You will be notified once it is reviewed.',
      [
        {
          text: 'OK',
          onPress: () => {
            setUploadedImage(null);
            router.back();
          },
        },
      ]
    );
  };

  const getStatusIcon = (verified: boolean) => {
    if (verified) {
      return <CheckCircle size={20} color="#4CAF50" />;
    }
    return <Clock size={20} color="#FFD700" />;
  };

  const getStatusText = (verified: boolean) => {
    if (verified) {
      return { text: 'Verified', color: '#4CAF50' };
    }
    return { text: 'Pending', color: '#FFD700' };
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Upload Certification',
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Certifications</Text>
            <Text style={styles.sectionSubtitle}>
              Upload your licenses and certifications to unlock verified badge and higher-paying jobs
            </Text>

            <View style={styles.certificationsGrid}>
              {mockCertifications.map((cert) => {
                const status = getStatusText(cert.verified);
                return (
                  <GlassCard key={cert.id} style={styles.certCard}>
                    <View style={styles.certHeader}>
                      <View style={styles.certIcon}>
                        {certificationTypes.find(t => t.id === cert.type)?.icon}
                      </View>
                      <View style={styles.certStatus}>
                        {getStatusIcon(cert.verified)}
                        <Text style={[styles.statusText, { color: status.color }]}>
                          {status.text}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.certName}>{cert.name}</Text>
                    <Text style={styles.certIssuer}>{cert.issuer}</Text>

                    <View style={styles.certDetails}>
                      <View style={styles.certDetailRow}>
                        <Text style={styles.certDetailLabel}>Number:</Text>
                        <Text style={styles.certDetailValue}>{cert.number}</Text>
                      </View>
                      <View style={styles.certDetailRow}>
                        <Text style={styles.certDetailLabel}>Issued:</Text>
                        <Text style={styles.certDetailValue}>
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </Text>
                      </View>
                      {cert.expiryDate && (
                        <View style={styles.certDetailRow}>
                          <Text style={styles.certDetailLabel}>Expires:</Text>
                          <Text style={styles.certDetailValue}>
                            {new Date(cert.expiryDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </View>

                    {cert.verified && cert.verifiedAt && (
                      <View style={styles.verifiedBanner}>
                        <Shield size={14} color="#4CAF50" />
                        <Text style={styles.verifiedText}>
                          Verified on {new Date(cert.verifiedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </GlassCard>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload New Certification</Text>

            <View style={styles.typeSelector}>
              {certificationTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && styles.typeButtonSelected,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  {type.icon}
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type.id && styles.typeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {uploadedImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: uploadedImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setUploadedImage(null)}
                >
                  <XCircle size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickImage(true)}
                >
                  <LinearGradient
                    colors={['#4A90E2', '#357ABD']}
                    style={styles.uploadGradient}
                  >
                    <Camera size={24} color="#FFFFFF" />
                    <Text style={styles.uploadText}>Take Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickImage(false)}
                >
                  <LinearGradient
                    colors={['#9C27B0', '#7B1FA2']}
                    style={styles.uploadGradient}
                  >
                    <Upload size={24} color="#FFFFFF" />
                    <Text style={styles.uploadText}>Choose File</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.infoBox}>
              <FileText size={20} color="#4A90E2" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Document Requirements</Text>
                <Text style={styles.infoText}>
                  • Clear, readable image of your certification{'\n'}
                  • All text and numbers must be visible{'\n'}
                  • Valid and not expired{'\n'}
                  • Issued by recognized authority
                </Text>
              </View>
            </View>

            {uploadedImage && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpload}
                disabled={isUploading}
              >
                <LinearGradient
                  colors={isUploading ? ['#666', '#444'] : ['#4CAF50', '#45A049']}
                  style={styles.submitGradient}
                >
                  {isUploading ? (
                    <Clock size={24} color="#FFFFFF" />
                  ) : (
                    <CheckCircle size={24} color="#FFFFFF" />
                  )}
                  <Text style={styles.submitText}>
                    {isUploading ? 'Uploading...' : 'Submit for Verification'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  certificationsGrid: {
    gap: 12,
  },
  certCard: {
    padding: 16,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  certIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  certName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  certIssuer: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  certDetails: {
    gap: 6,
    marginBottom: 12,
  },
  certDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  certDetailLabel: {
    fontSize: 12,
    color: '#999',
  },
  certDetailValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#4CAF50',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeButtonSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderColor: '#4A90E2',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#999',
  },
  typeLabelSelected: {
    color: '#4A90E2',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4A90E2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
