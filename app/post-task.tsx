import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Animated, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, MapPin, DollarSign, Plus, X, Wand2, Lightbulb } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { TaskCategory, PayType } from '@/types';
import { TASK_TEMPLATES } from '@/constants/taskTemplates';
import { triggerHaptic } from '@/utils/haptics';
import Confetti from '@/components/Confetti';
import { generateTaskSuggestion, enhanceTaskDescription, suggestTaskExtras, estimateTaskPay, generateTaskTitle } from '@/utils/aiTaskSuggestions';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';

const CATEGORIES: { value: TaskCategory; label: string; emoji: string }[] = [
  { value: 'cleaning', label: 'Cleaning', emoji: '🧹' },
  { value: 'errands', label: 'Errands', emoji: '🏃' },
  { value: 'delivery', label: 'Delivery', emoji: '📦' },
  { value: 'moving', label: 'Moving', emoji: '🚚' },
  { value: 'handyman', label: 'Handyman', emoji: '🔧' },
  { value: 'tech', label: 'Tech', emoji: '💻' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

export default function PostTaskScreen() {
  const { currentUser, createTask } = useApp();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<TaskCategory>('cleaning');
  const [payType, setPayType] = useState<PayType>('fixed');
  const [payAmount, setPayAmount] = useState<string>('');
  const [date] = useState<string>('');
  const [time] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [extras, setExtras] = useState<string[]>([]);
  const [extraInput, setExtraInput] = useState<string>('');

  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [showAISuggestion, setShowAISuggestion] = useState<boolean>(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const template = TASK_TEMPLATES.find(t => t.category === category);
    if (template && !title) {
      setTitle(template.title);
      setDescription(template.description);
      setPayAmount(template.suggestedPay.toString());
      triggerHaptic('light');
    }
  }, [category, title, setTitle, setDescription, setPayAmount]);



  const handleCategorySelect = (cat: TaskCategory) => {
    setCategory(cat);
    triggerHaptic('medium');
  };

  const handleAddExtra = () => {
    if (extraInput.trim()) {
      setExtras([...extras, extraInput.trim()]);
      setExtraInput('');
      triggerHaptic('light');
    }
  };

  const handleRemoveExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
    triggerHaptic('light');
  };

  const handleLocationSelect = () => {
    if (currentUser) {
      setLocation(currentUser.location.address);
      triggerHaptic('success');
    }
  };

  const handleAIGenerate = async () => {
    if (!description.trim()) {
      Alert.alert('Need Input', 'Please enter a brief description first so AI can help generate your task.');
      return;
    }

    setIsGeneratingAI(true);
    triggerHaptic('medium');

    try {
      const suggestion = await generateTaskSuggestion(description);
      
      setTitle(suggestion.title);
      setDescription(suggestion.description);
      setCategory(suggestion.category);
      setPayAmount(suggestion.suggestedPay.toString());
      
      if (suggestion.tips.length > 0) {
        setAiSuggestion(suggestion.tips.join('\n• '));
        setShowAISuggestion(true);
      }

      triggerHaptic('success');
      Alert.alert(
        '✨ AI Generated!',
        `Confidence: ${suggestion.confidence.toUpperCase()}\nEstimated Duration: ${suggestion.estimatedDuration}\n\nTips:\n• ${suggestion.tips.join('\n• ')}`,
        [{ text: 'Got it!', style: 'default' }]
      );
    } catch (error) {
      console.error('AI generation error:', error);
      Alert.alert('AI Error', 'Could not generate suggestion. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!description.trim() || !title.trim()) {
      Alert.alert('Need Input', 'Please enter a title and description first.');
      return;
    }

    setIsGeneratingAI(true);
    triggerHaptic('medium');

    try {
      const enhanced = await enhanceTaskDescription(title, description, category);
      setDescription(enhanced);
      triggerHaptic('success');
    } catch (error) {
      console.error('Enhancement error:', error);
      Alert.alert('AI Error', 'Could not enhance description. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSuggestExtras = async () => {
    if (!description.trim()) {
      Alert.alert('Need Input', 'Please enter a description first.');
      return;
    }

    setIsGeneratingAI(true);
    triggerHaptic('medium');

    try {
      const suggested = await suggestTaskExtras(category, description);
      setExtras([...extras, ...suggested]);
      triggerHaptic('success');
    } catch (error) {
      console.error('Extras suggestion error:', error);
      Alert.alert('AI Error', 'Could not suggest extras. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleEstimatePay = async () => {
    if (!description.trim()) {
      Alert.alert('Need Input', 'Please enter a description first.');
      return;
    }

    setIsGeneratingAI(true);
    triggerHaptic('medium');

    try {
      const estimate = await estimateTaskPay(category, description);
      setPayAmount(estimate.recommended.toString());
      triggerHaptic('success');
      Alert.alert(
        '💰 Pay Estimate',
        `Recommended: ${estimate.recommended}\nRange: ${estimate.min} - ${estimate.max}\n\nBased on market rates for ${category} tasks.`,
        [{ text: 'Use Recommended', style: 'default' }]
      );
    } catch (error) {
      console.error('Pay estimation error:', error);
      Alert.alert('AI Error', 'Could not estimate pay. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!description.trim()) {
      Alert.alert('Need Input', 'Please enter a description first.');
      return;
    }

    setIsGeneratingAI(true);
    triggerHaptic('medium');

    try {
      const generatedTitle = await generateTaskTitle(description, category);
      setTitle(generatedTitle);
      triggerHaptic('success');
    } catch (error) {
      console.error('Title generation error:', error);
      Alert.alert('AI Error', 'Could not generate title. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !payAmount || !location) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('success');

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const dateTime = date && time ? `${date}T${time}:00.000Z` : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const xpReward = parseInt(payAmount) * 2;

    await createTask({
      title,
      description,
      category,
      dateTime,
      location: currentUser?.location || { lat: 0, lng: 0, address: location },
      payType,
      payAmount: parseInt(payAmount),
      extras,
      xpReward,
    });

    setShowConfetti(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      router.back();
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Post Quest',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Sparkles size={32} color={Colors.accent} />
            <Text style={styles.headerTitle}>Create Your Quest</Text>
            <Text style={styles.headerSubtitle}>Find the perfect hero for your task</Text>
          </View>

          <TouchableOpacity
            style={styles.aiGenerateButton}
            onPress={handleAIGenerate}
            disabled={isGeneratingAI}
          >
            <LinearGradient
              colors={[premiumColors.neonViolet, premiumColors.neonCyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aiGenerateGradient}
            >
              {isGeneratingAI ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <Wand2 size={20} color={Colors.text} />
              )}
              <Text style={styles.aiGenerateText}>
                {isGeneratingAI ? 'AI Generating...' : '✨ AI Generate Full Task'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {showAISuggestion && aiSuggestion && (
            <GlassCard variant="dark" style={styles.aiSuggestionCard}>
              <View style={styles.aiSuggestionHeader}>
                <Lightbulb size={18} color={premiumColors.neonAmber} />
                <Text style={styles.aiSuggestionTitle}>AI Tips</Text>
              </View>
              <Text style={styles.aiSuggestionText}>• {aiSuggestion}</Text>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => setShowAISuggestion(false)}
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </GlassCard>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategorySelect(cat.value)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat.value && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Quest Title *</Text>
              <TouchableOpacity
                style={styles.aiAssistButton}
                onPress={handleGenerateTitle}
                disabled={isGeneratingAI}
              >
                <Wand2 size={14} color={premiumColors.neonViolet} />
                <Text style={styles.aiAssistButtonText}>AI Generate</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Epic Clean Quest"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description *</Text>
              <TouchableOpacity
                style={styles.aiAssistButton}
                onPress={handleEnhanceDescription}
                disabled={isGeneratingAI}
              >
                <Sparkles size={14} color={premiumColors.neonCyan} />
                <Text style={styles.aiAssistButtonText}>AI Enhance</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your quest in detail..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Location *</Text>
            <TouchableOpacity style={styles.locationButton} onPress={handleLocationSelect}>
              <MapPin size={20} color={Colors.accent} />
              <Text style={styles.locationButtonText}>
                {location || 'Use My Location'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Pay Type *</Text>
              <View style={styles.payTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.payTypeButton,
                    payType === 'fixed' && styles.payTypeButtonActive,
                  ]}
                  onPress={() => {
                    setPayType('fixed');
                    triggerHaptic('light');
                  }}
                >
                  <Text
                    style={[
                      styles.payTypeText,
                      payType === 'fixed' && styles.payTypeTextActive,
                    ]}
                  >
                    Fixed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.payTypeButton,
                    payType === 'hourly' && styles.payTypeButtonActive,
                  ]}
                  onPress={() => {
                    setPayType('hourly');
                    triggerHaptic('light');
                  }}
                >
                  <Text
                    style={[
                      styles.payTypeText,
                      payType === 'hourly' && styles.payTypeTextActive,
                    ]}
                  >
                    Hourly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Amount ($) *</Text>
                <TouchableOpacity
                  style={styles.aiAssistButton}
                  onPress={handleEstimatePay}
                  disabled={isGeneratingAI}
                >
                  <DollarSign size={14} color={premiumColors.neonAmber} />
                  <Text style={styles.aiAssistButtonText}>AI Estimate</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.payInputContainer}>
                <DollarSign size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.payInput}
                  value={payAmount}
                  onChangeText={setPayAmount}
                  placeholder="50"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Extras (Optional)</Text>
              <TouchableOpacity
                style={styles.aiAssistButton}
                onPress={handleSuggestExtras}
                disabled={isGeneratingAI}
              >
                <Lightbulb size={14} color={premiumColors.neonGreen} />
                <Text style={styles.aiAssistButtonText}>AI Suggest</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.extraInputContainer}>
              <TextInput
                style={styles.extraInput}
                value={extraInput}
                onChangeText={setExtraInput}
                placeholder="e.g., Tools provided"
                placeholderTextColor={Colors.textSecondary}
              />
              <TouchableOpacity style={styles.addExtraButton} onPress={handleAddExtra}>
                <Plus size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            {extras.length > 0 && (
              <View style={styles.extrasList}>
                {extras.map((extra, index) => (
                  <View key={index} style={styles.extraChip}>
                    <Text style={styles.extraChipText}>{extra}</Text>
                    <TouchableOpacity onPress={() => handleRemoveExtra(index)}>
                      <X size={16} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Posting Quest...' : 'Post Quest'}
                </Text>
                <Text style={styles.submitButtonSubtext}>
                  +{payAmount ? parseInt(payAmount) * 2 : 0} XP Reward
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
      {showConfetti && <Confetti />}
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.accent,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  categoryLabelActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  locationButtonText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  payTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  payTypeButton: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  payTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.accent,
  },
  payTypeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  payTypeTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  payInputContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  payInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  extraInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  extraInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  addExtraButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extrasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  extraChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  extraChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    padding: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  submitButtonSubtext: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
    opacity: 0.8,
  },
  aiGenerateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  aiGenerateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  aiGenerateText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiAssistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: premiumColors.richBlack,
    borderWidth: 1,
    borderColor: premiumColors.glassWhiteStrong,
  },
  aiAssistButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  aiSuggestionCard: {
    marginBottom: 20,
    padding: 16,
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiSuggestionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  aiSuggestionText: {
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
    backgroundColor: premiumColors.neonViolet + '20',
  },
  dismissButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonViolet,
  },
});
