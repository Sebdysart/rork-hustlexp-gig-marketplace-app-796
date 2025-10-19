import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Scale, MessageCircle, FileText, Camera, Send, CheckCircle2, Clock, AlertCircle, Sparkles, Lightbulb } from 'lucide-react-native';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { DISPUTE_CATEGORIES, getDisputeStatusColor, getDisputeStatusLabel, type DisputeCategory } from '@/constants/disputes';
import { analyzeDispute, type DisputeAnalysis } from '@/utils/aiDisputeAssistant';
import type { Dispute } from '@/constants/disputes';

export default function DisputesScreen() {
  const { currentUser, tasks } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<DisputeCategory | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [showAISuggestion, setShowAISuggestion] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  if (!currentUser) return null;

  const userTasks = tasks.filter(
    t => t.posterId === currentUser.id || t.workerId === currentUser.id
  );

  const handleGetAISuggestion = async () => {
    if (!selectedCategory || !description.trim()) {
      Alert.alert('Need Information', 'Please select a category and provide a description first.');
      return;
    }

    setIsGeneratingAI(true);
    triggerHaptic('medium');

    try {
      const mockDispute: Dispute = {
        id: 'temp',
        taskId: selectedTaskId,
        reporterId: currentUser.id,
        reportedUserId: '',
        category: selectedCategory,
        title: '',
        description,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        evidence: [],
      };
      
      const analysis = await analyzeDispute(mockDispute);
      const topSuggestion = analysis.suggestions[0];
      
      setAiSuggestion(topSuggestion.reasoning);
      setShowAISuggestion(true);
      triggerHaptic('success');

      Alert.alert(
        '💡 AI Resolution Suggestion',
        `${topSuggestion.reasoning}\n\nRecommended Action: ${topSuggestion.recommendedAction}\n\nFairness Score: ${topSuggestion.fairnessScore}%\n\nConfidence: ${topSuggestion.confidence}%`,
        [{ text: 'Got it', style: 'default' }]
      );
    } catch (error) {
      console.error('AI suggestion error:', error);
      Alert.alert('AI Error', 'Could not generate suggestion. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmitDispute = () => {
    if (!selectedCategory || !title.trim() || !description.trim() || !selectedTaskId) {
      triggerHaptic('error');
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    triggerHaptic('success');
    Alert.alert(
      'Dispute Submitted',
      'Your dispute has been submitted. Our mediation team will review it within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedCategory(null);
            setTitle('');
            setDescription('');
            setSelectedTaskId('');
          },
        },
      ]
    );
  };

  const mockDisputes = [
    {
      id: '1',
      taskId: 'task-1',
      taskTitle: 'House Cleaning',
      category: 'quality' as DisputeCategory,
      title: 'Task not completed as agreed',
      status: 'under_review' as const,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      taskId: 'task-2',
      taskTitle: 'Furniture Assembly',
      category: 'payment' as DisputeCategory,
      title: 'Payment not received',
      status: 'resolved' as const,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Dispute Resolution',
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.charcoal]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="darkStrong" neonBorder glowColor="neonViolet" style={styles.headerCard}>
            <LinearGradient
              colors={[premiumColors.neonViolet + '20', premiumColors.neonCyan + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerIcon}>
                <Scale size={32} color={premiumColors.neonViolet} />
              </View>
              <Text style={styles.headerTitle}>Dispute Resolution</Text>
              <Text style={styles.headerSubtitle}>
                Fair and transparent mediation for all disputes
              </Text>
            </LinearGradient>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <FileText size={20} color={premiumColors.neonAmber} />
              <Text style={styles.sectionTitle}>File a Dispute</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.aiSuggestionButton}
            onPress={handleGetAISuggestion}
            disabled={isGeneratingAI}
          >
            <LinearGradient
              colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aiSuggestionGradient}
            >
              {isGeneratingAI ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <Sparkles size={18} color={Colors.text} />
              )}
              <Text style={styles.aiSuggestionButtonText}>
                {isGeneratingAI ? 'AI Analyzing...' : 'Get AI Resolution Suggestion'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {showAISuggestion && aiSuggestion && (
            <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.aiResultCard}>
              <View style={styles.aiResultHeader}>
                <Lightbulb size={18} color={premiumColors.neonCyan} />
                <Text style={styles.aiResultTitle}>AI Suggestion</Text>
              </View>
              <Text style={styles.aiResultText}>{aiSuggestion}</Text>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => setShowAISuggestion(false)}
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </GlassCard>
          )}

          <GlassCard variant="dark" style={styles.formCard}>
            <Text style={styles.formLabel}>Select Task</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskScroll}>
              {userTasks.slice(0, 5).map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskChip,
                    selectedTaskId === task.id && styles.taskChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedTaskId(task.id);
                    triggerHaptic('light');
                  }}
                >
                  <Text
                    style={[
                      styles.taskChipText,
                      selectedTaskId === task.id && styles.taskChipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.formLabel}>Category</Text>
            <View style={styles.categoriesGrid}>
              {DISPUTE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    triggerHaptic('light');
                  }}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Brief summary of the issue"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Provide detailed information about the dispute..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.evidenceSection}>
              <Text style={styles.formLabel}>Evidence (Optional)</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => {
                  triggerHaptic('medium');
                  Alert.alert('Upload Evidence', 'Photo/video upload will be available soon.');
                }}
              >
                <Camera size={20} color={premiumColors.neonCyan} />
                <Text style={styles.uploadButtonText}>Add Photos or Videos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitDispute}
            >
              <LinearGradient
                colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                <Send size={18} color={Colors.text} />
                <Text style={styles.submitButtonText}>Submit Dispute</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MessageCircle size={20} color={premiumColors.neonCyan} />
              <Text style={styles.sectionTitle}>My Disputes</Text>
            </View>
          </View>

          {mockDisputes.length === 0 ? (
            <GlassCard variant="dark" style={styles.emptyCard}>
              <CheckCircle2 size={48} color={premiumColors.neonGreen} />
              <Text style={styles.emptyTitle}>No Active Disputes</Text>
              <Text style={styles.emptyDescription}>
                You don&apos;t have any disputes at the moment. We hope it stays that way!
              </Text>
            </GlassCard>
          ) : (
            mockDisputes.map((dispute) => {
              const category = DISPUTE_CATEGORIES.find(c => c.id === dispute.category);
              const statusColor = getDisputeStatusColor(dispute.status);
              const statusLabel = getDisputeStatusLabel(dispute.status);

              return (
                <TouchableOpacity
                  key={dispute.id}
                  onPress={() => {
                    triggerHaptic('medium');
                    Alert.alert('Dispute Details', 'Full dispute details will be available soon.');
                  }}
                >
                  <GlassCard variant="dark" style={styles.disputeCard}>
                    <View style={styles.disputeHeader}>
                      <View style={styles.disputeHeaderLeft}>
                        <View style={[styles.categoryIconSmall, { backgroundColor: category?.color + '30' }]}>
                          <Text style={styles.categoryIconSmallText}>{category?.icon}</Text>
                        </View>
                        <View style={styles.disputeHeaderInfo}>
                          <Text style={styles.disputeTitle}>{dispute.title}</Text>
                          <Text style={styles.disputeTaskTitle}>{dispute.taskTitle}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.disputeFooter}>
                      <View style={styles.disputeDate}>
                        <Clock size={14} color={Colors.textSecondary} />
                        <Text style={styles.disputeDateText}>
                          Filed {new Date(dispute.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      {dispute.status === 'resolved' && dispute.resolvedAt && (
                        <View style={styles.resolvedBadge}>
                          <CheckCircle2 size={14} color={premiumColors.neonGreen} />
                          <Text style={styles.resolvedText}>
                            Resolved {new Date(dispute.resolvedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}

          <GlassCard variant="dark" style={styles.infoCard}>
            <Text style={styles.infoTitle}>⚖️ How Dispute Resolution Works</Text>
            <View style={styles.infoList}>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>1</Text>
                </View>
                <View style={styles.infoStepContent}>
                  <Text style={styles.infoStepTitle}>File a Dispute</Text>
                  <Text style={styles.infoStepDescription}>
                    Submit your dispute with detailed information and evidence
                  </Text>
                </View>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>2</Text>
                </View>
                <View style={styles.infoStepContent}>
                  <Text style={styles.infoStepTitle}>Mediation Review</Text>
                  <Text style={styles.infoStepDescription}>
                    Our team reviews both sides and evidence within 24-48 hours
                  </Text>
                </View>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>3</Text>
                </View>
                <View style={styles.infoStepContent}>
                  <Text style={styles.infoStepTitle}>Fair Resolution</Text>
                  <Text style={styles.infoStepDescription}>
                    A fair decision is made and both parties are notified
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <GlassCard variant="dark" style={styles.tipsCard}>
            <AlertCircle size={20} color={premiumColors.neonAmber} />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Tips for Successful Resolution</Text>
              <Text style={styles.tipsText}>
                • Provide clear, detailed descriptions{'\n'}
                • Upload photos or screenshots as evidence{'\n'}
                • Stay professional and factual{'\n'}
                • Respond promptly to mediator questions
              </Text>
            </View>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  formCard: {
    padding: 20,
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    marginTop: 16,
  },
  taskScroll: {
    marginBottom: 8,
  },
  taskChip: {
    backgroundColor: premiumColors.richBlack,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taskChipSelected: {
    backgroundColor: premiumColors.neonCyan + '20',
    borderColor: premiumColors.neonCyan,
  },
  taskChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  taskChipTextSelected: {
    color: premiumColors.neonCyan,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: premiumColors.richBlack,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryCardSelected: {
    borderColor: premiumColors.neonViolet,
    backgroundColor: premiumColors.neonViolet + '20',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  input: {
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  evidenceSection: {
    marginTop: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: premiumColors.richBlack,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  disputeCard: {
    padding: 16,
    marginBottom: 12,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  disputeHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  categoryIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconSmallText: {
    fontSize: 20,
  },
  disputeHeaderInfo: {
    flex: 1,
  },
  disputeTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  disputeTaskTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  disputeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  disputeDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disputeDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resolvedText: {
    fontSize: 12,
    color: premiumColors.neonGreen,
    fontWeight: '600' as const,
  },
  infoCard: {
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  infoList: {
    gap: 16,
  },
  infoStep: {
    flexDirection: 'row',
    gap: 12,
  },
  infoStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: premiumColors.neonViolet + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoStepNumberText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: premiumColors.neonViolet,
  },
  infoStepContent: {
    flex: 1,
  },
  infoStepTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  infoStepDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tipsCard: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  aiSuggestionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  aiSuggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  aiSuggestionButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  aiResultCard: {
    padding: 16,
    marginBottom: 16,
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiResultTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  aiResultText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: premiumColors.neonCyan + '20',
  },
  dismissButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
});
