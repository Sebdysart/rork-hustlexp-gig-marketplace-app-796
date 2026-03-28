import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, X, TrendingUp, Target } from 'lucide-react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { calculateTrustScore } from '@/utils/trustScore';
import { triggerHaptic } from '@/utils/haptics';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'How does the reputation system work?',
    answer: 'Your reputation score is based on ratings from other users after completing tasks. Maintain a high score by being reliable, professional, and completing tasks on time.',
  },
  {
    question: 'What happens if I receive a strike?',
    answer: 'Strikes are issued for violations of community guidelines. After 3 strikes, your account will be suspended. You can appeal strikes through our support system.',
  },
  {
    question: 'How do I get verified?',
    answer: 'Verification badges are earned by completing identity checks, email verification, phone verification, and background checks. Verified users gain more trust and access to premium features.',
  },
  {
    question: 'What should I do if I encounter a problem?',
    answer: 'Use the Report User feature below to report any issues. Our team reviews all reports within 24-48 hours and takes appropriate action.',
  },
  {
    question: 'How is my data protected?',
    answer: 'We use industry-standard encryption and security measures to protect your personal information. Your data is never shared with third parties without your consent.',
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes, you can request account deletion at any time. Contact support and your account will be permanently deleted within 30 days.',
  },
];

interface CoachingTip {
  id: string;
  action: string;
  impact: string;
  scoreGain: number;
  priority: 'high' | 'medium' | 'low';
}

export default function TrustCenterScreen() {
  const { currentUser, users, myAcceptedTasks } = useApp();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [reportedUserId, setReportedUserId] = useState<string>('');
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');

  const trustScore = useMemo(() => {
    if (!currentUser) return null;
    return calculateTrustScore(currentUser, myAcceptedTasks, []);
  }, [currentUser, myAcceptedTasks]);

  const coachingTips = useMemo((): CoachingTip[] => {
    if (!currentUser || !trustScore) return [];

    const tips: CoachingTip[] = [];

    if (trustScore.proofQuality < 80) {
      tips.push({
        id: 'proof-quality',
        action: 'Upload before/after photos on your last 3 tasks',
        impact: 'Boosts proof quality score',
        scoreGain: 4,
        priority: 'high',
      });
    }

    if (trustScore.responseSpeed < 75) {
      tips.push({
        id: 'response-speed',
        action: 'Respond to messages within 1 hour',
        impact: 'Improves response speed rating',
        scoreGain: 3,
        priority: 'high',
      });
    }

    if (trustScore.completion < 90) {
      tips.push({
        id: 'completion',
        action: 'Complete your next 2 tasks on time',
        impact: 'Increases completion rate',
        scoreGain: 5,
        priority: 'high',
      });
    }

    if (trustScore.rehireRate < 60) {
      tips.push({
        id: 'rehire',
        action: 'Exceed expectations on your next task',
        impact: 'Boosts rehire rate',
        scoreGain: 6,
        priority: 'medium',
      });
    }

    if (!currentUser.proofLinks || currentUser.proofLinks.length < 5) {
      tips.push({
        id: 'prooflinks',
        action: 'Build your ProofLink portfolio (add 3 more)',
        impact: 'Increases trust and visibility',
        scoreGain: 3,
        priority: 'medium',
      });
    }

    return tips.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [currentUser, trustScore]);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleOpenReportModal = () => {
    setReportModalVisible(true);
  };

  const handleSubmitReport = async () => {
    if (!currentUser) return;

    if (!reportedUserId.trim() || !reportReason.trim() || !reportDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const reportedUser = users.find(u => u.id === reportedUserId || u.name.toLowerCase() === reportedUserId.toLowerCase());

    if (!reportedUser) {
      Alert.alert('Error', 'User not found. Please check the user ID or name.');
      return;
    }

    console.log('Report submitted:', {
      reporterId: currentUser.id,
      reportedUserId: reportedUser.id,
      reason: reportReason,
      description: reportDescription,
      timestamp: new Date().toISOString(),
    });

    setReportModalVisible(false);
    setReportedUserId('');
    setReportReason('');
    setReportDescription('');

    Alert.alert(
      'Report Submitted',
      'Thank you for your report. Our team will review it within 24-48 hours and take appropriate action.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Trust Center',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />

      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Shield size={48} color={Colors.accent} />
            <Text style={styles.headerTitle}>Trust Center</Text>
            <Text style={styles.headerSubtitle}>
              Build trust, earn more opportunities
            </Text>
          </View>

          {trustScore && (
            <>
              <View style={styles.trustScoreCard}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.trustScoreGradient}
                >
                  <View style={styles.trustScoreHeader}>
                    <Text style={styles.trustScoreLabel}>Your TrustScore</Text>
                    <View style={styles.trustScoreTier}>
                      <Text style={styles.trustScoreTierText}>{trustScore.tier.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.trustScoreValue}>{trustScore.overall}</Text>
                  <View style={styles.trustScoreBar}>
                    <View style={[styles.trustScoreBarFill, { width: `${trustScore.overall}%` }]} />
                  </View>
                  <View style={styles.trustScoreBreakdown}>
                    <View style={styles.trustScoreItem}>
                      <Text style={styles.trustScoreItemLabel}>Completion</Text>
                      <Text style={styles.trustScoreItemValue}>{trustScore.completion}%</Text>
                    </View>
                    <View style={styles.trustScoreItem}>
                      <Text style={styles.trustScoreItemLabel}>Timeliness</Text>
                      <Text style={styles.trustScoreItemValue}>{trustScore.timeliness}%</Text>
                    </View>
                    <View style={styles.trustScoreItem}>
                      <Text style={styles.trustScoreItemLabel}>Proof Quality</Text>
                      <Text style={styles.trustScoreItemValue}>{trustScore.proofQuality}%</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {coachingTips.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Target size={20} color={Colors.accent} />
                    <Text style={styles.sectionTitle}>Coaching Tips</Text>
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    Complete these actions to boost your TrustScore
                  </Text>
                  {coachingTips.map((tip) => (
                    <TouchableOpacity
                      key={tip.id}
                      style={[
                        styles.coachingTipCard,
                        tip.priority === 'high' && styles.coachingTipCardHigh,
                      ]}
                      onPress={() => triggerHaptic('light')}
                    >
                      <View style={styles.coachingTipHeader}>
                        <View style={[
                          styles.priorityBadge,
                          tip.priority === 'high' && styles.priorityBadgeHigh,
                          tip.priority === 'medium' && styles.priorityBadgeMedium,
                        ]}>
                          <Text style={styles.priorityBadgeText}>
                            {tip.priority === 'high' ? '🔥' : '⭐'}
                          </Text>
                        </View>
                        <View style={styles.scoreGainBadge}>
                          <TrendingUp size={14} color={Colors.success} />
                          <Text style={styles.scoreGainText}>+{tip.scoreGain}</Text>
                        </View>
                      </View>
                      <Text style={styles.coachingTipAction}>{tip.action}</Text>
                      <Text style={styles.coachingTipImpact}>{tip.impact}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {FAQS.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqCard}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {expandedFAQ === index ? (
                    <ChevronUp size={20} color={Colors.accent} />
                  ) : (
                    <ChevronDown size={20} color={Colors.textSecondary} />
                  )}
                </View>
                {expandedFAQ === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Guidelines</Text>
            <View style={styles.guidelinesCard}>
              <View style={styles.guidelineItem}>
                <CheckCircle size={20} color={Colors.accent} />
                <Text style={styles.guidelineText}>Be respectful and professional</Text>
              </View>
              <View style={styles.guidelineItem}>
                <CheckCircle size={20} color={Colors.accent} />
                <Text style={styles.guidelineText}>Complete tasks as agreed</Text>
              </View>
              <View style={styles.guidelineItem}>
                <CheckCircle size={20} color={Colors.accent} />
                <Text style={styles.guidelineText}>Communicate clearly and promptly</Text>
              </View>
              <View style={styles.guidelineItem}>
                <CheckCircle size={20} color={Colors.accent} />
                <Text style={styles.guidelineText}>Report suspicious activity</Text>
              </View>
              <View style={styles.guidelineItem}>
                <AlertTriangle size={20} color="#EF4444" />
                <Text style={styles.guidelineText}>No harassment or discrimination</Text>
              </View>
              <View style={styles.guidelineItem}>
                <AlertTriangle size={20} color="#EF4444" />
                <Text style={styles.guidelineText}>No fraudulent or illegal activities</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Report a User</Text>
            <TouchableOpacity style={styles.reportButton} onPress={handleOpenReportModal}>
              <AlertTriangle size={20} color={Colors.text} />
              <Text style={styles.reportButtonText}>Submit a Report</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strike System</Text>
            <View style={styles.strikeCard}>
              <Text style={styles.strikeText}>
                <Text style={styles.strikeBold}>Strike 1:</Text> Warning issued
              </Text>
              <Text style={styles.strikeText}>
                <Text style={styles.strikeBold}>Strike 2:</Text> 7-day suspension
              </Text>
              <Text style={styles.strikeText}>
                <Text style={styles.strikeBold}>Strike 3:</Text> Permanent account suspension
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report a User</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>User ID or Name</Text>
            <TextInput
              style={styles.input}
              value={reportedUserId}
              onChangeText={setReportedUserId}
              placeholder="Enter user ID or name"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Reason</Text>
            <TextInput
              style={styles.input}
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="e.g., Harassment, Fraud, No-show"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reportDescription}
              onChangeText={setReportDescription}
              placeholder="Provide details about the incident"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReport}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 32,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  guidelinesCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guidelineText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  reportButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  strikeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  strikeText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  strikeBold: {
    fontWeight: 'bold' as const,
    color: Colors.accent,
  },
  trustScoreCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  trustScoreGradient: {
    padding: 24,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trustScoreLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600' as const,
    opacity: 0.9,
  },
  trustScoreTier: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trustScoreTierText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  trustScoreValue: {
    fontSize: 56,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -2,
  },
  trustScoreBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  trustScoreBarFill: {
    height: '100%',
    backgroundColor: Colors.text,
  },
  trustScoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trustScoreItem: {
    alignItems: 'center',
  },
  trustScoreItemLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  trustScoreItemValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  coachingTipCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  coachingTipCardHigh: {
    borderColor: Colors.accent + '40',
  },
  coachingTipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityBadgeHigh: {
    backgroundColor: Colors.accent + '20',
  },
  priorityBadgeMedium: {
    backgroundColor: Colors.primary + '40',
  },
  priorityBadgeText: {
    fontSize: 16,
  },
  scoreGainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  scoreGainText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  coachingTipAction: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  coachingTipImpact: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.card,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
