import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  FlatList,
} from 'react-native';
import { Audio } from 'expo-av';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Mic,
  Send,
  Edit3,
  DollarSign,
  Clock,
  Shield,
  Check,
  X,
  Lightbulb,
  Zap,
  Star,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '@/contexts/AppContext';
import { premiumColors } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { parseTaskWithAI, improveTaskDescription, suggestPricing, AITaskSuggestion } from '@/utils/aiTaskParser';
import { triggerHaptic } from '@/utils/haptics';



type Step = 'prompt' | 'draft' | 'customize' | 'confirm';

export default function AITaskCreator() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { createTask, currentUser } = useApp();

  const [step, setStep] = useState<Step>('prompt');
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AITaskSuggestion | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPay, setCustomPay] = useState({ min: 0, max: 0 });
  const [enableAINegotiation, setEnableAINegotiation] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const [showTrendingCarousel, setShowTrendingCarousel] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);

  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.6)).current;
  const orbRotate = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const inputGlow = useRef(new Animated.Value(0)).current;
  const carouselSlide = useRef(new Animated.Value(0)).current;
  const backgroundGradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundGradientAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false,
        }),
        Animated.timing(backgroundGradientAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [backgroundGradientAnim]);

  const startOrbAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbScale, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(orbOpacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orbScale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(orbOpacity, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.timing(orbRotate, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [orbScale, orbOpacity, orbRotate, particleAnim]);

  useEffect(() => {
    startOrbAnimation();
  }, [startOrbAnimation]);

  useEffect(() => {
    if (aiSuggestion) {
      setCustomTitle(aiSuggestion.title);
      setCustomDescription(aiSuggestion.description);
      setCustomPay(aiSuggestion.estimatedPay);
    }
  }, [aiSuggestion]);

  useEffect(() => {
    if (userInput.length > 3) {
      const suggestions = [
        'furniture assembly',
        'grocery shopping',
        'dog walking',
        'house cleaning',
        'lawn mowing',
      ].filter(s => s.includes(userInput.toLowerCase()));
      setAutoCompleteSuggestions(suggestions.slice(0, 3));
    } else {
      setAutoCompleteSuggestions([]);
    }
  }, [userInput]);

  const trendingTasks = useMemo(() => [
    { id: '1', title: 'Furniture Assembly', avgPay: '$50', demand: 'High', icon: '🪑' },
    { id: '2', title: 'Grocery Delivery', avgPay: '$35', demand: 'High', icon: '🛒' },
    { id: '3', title: 'House Cleaning', avgPay: '$80', demand: 'Medium', icon: '🧹' },
    { id: '4', title: 'Dog Walking', avgPay: '$25', demand: 'Medium', icon: '🐕' },
    { id: '5', title: 'Lawn Mowing', avgPay: '$45', demand: 'High', icon: '🌱' },
  ], []);

  const userAnalytics = useMemo(() => {
    if (!currentUser) return null;
    return {
      lastPostAccepts: 3,
      lastPostEarned: 150,
      avgResponseTime: '2h',
    };
  }, [currentUser]);



  const handleSubmitPrompt = async () => {
    if (!userInput.trim()) return;

    triggerHaptic('medium');
    setIsProcessing(true);

    try {
      const suggestion = await parseTaskWithAI(userInput, category);
      setAiSuggestion(suggestion);
      setStep('draft');

      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error parsing task:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImproveDescription = async () => {
    if (!customDescription) return;

    setIsProcessing(true);
    try {
      const improved = await improveTaskDescription(customDescription);
      setCustomDescription(improved);
      triggerHaptic('success');
    } catch (error) {
      console.error('Error improving description:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestPricing = async () => {
    if (!customDescription || !aiSuggestion) return;

    setIsProcessing(true);
    try {
      const pricing = await suggestPricing(customDescription, aiSuggestion.category);
      setCustomPay(pricing);
      triggerHaptic('success');
    } catch (error) {
      console.error('Error suggesting pricing:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Please grant microphone permission to use voice input.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
        });
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      triggerHaptic('medium');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }

      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      setUserInput('Voice transcription coming soon...');
      triggerHaptic('success');
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handleConfirmTask = async () => {
    if (!aiSuggestion || !currentUser) return;

    triggerHaptic('success');

    await createTask({
      title: customTitle,
      description: customDescription,
      category: aiSuggestion.category as any,
      payAmount: (customPay.min + customPay.max) / 2,
      xpReward: Math.floor((customPay.min + customPay.max) / 2) * 2,
      location: currentUser.location,
      estimatedDuration: aiSuggestion.estimatedDuration,
      requiredSkills: aiSuggestion.suggestedSkills,
    });

    router.push('/poster-dashboard');
  };

  const renderPromptStep = () => (
    <View style={styles.promptContainer}>
      <View style={styles.orbWrapper}>
        <Animated.View
          style={[
            styles.particleContainer,
            {
              opacity: particleAnim,
              transform: [
                {
                  translateY: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50],
                  }),
                },
              ],
            },
          ]}
        >
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  left: `${(i * 60) % 360}deg` as any,
                  backgroundColor: i % 2 === 0 ? premiumColors.neonCyan : premiumColors.neonMagenta,
                },
              ]}
            />
          ))}
        </Animated.View>
        <Animated.View
          style={[
            styles.orbContainer,
            {
              transform: [
                { scale: orbScale },
                {
                  rotate: orbRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: orbOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={[premiumColors.neonCyan, premiumColors.neonViolet, premiumColors.neonMagenta]}
            style={styles.orb}
          >
            <View style={styles.orbInner}>
              <Sparkles size={48} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <LinearGradient
        colors={[premiumColors.neonCyan, premiumColors.neonViolet, premiumColors.neonMagenta]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.titleGradientWrapper}
      >
        <Text style={styles.promptTitle}>What do you need done today?</Text>
      </LinearGradient>
      <Text style={styles.promptSubtitle}>
        {currentUser?.name ? `Evening, ${currentUser.name.split(' ')[0]}!` : 'Evening!'} {userAnalytics ? `Your last post: ${userAnalytics.lastPostAccepts} accepts, ${userAnalytics.lastPostEarned} earned.` : 'Tell me your quest and I\'ll forge it into reality ✨'}
      </Text>

      <View style={styles.xpPreviewContainer}>
        <Zap size={16} color={premiumColors.neonAmber} />
        <Text style={styles.xpPreviewText}>Estimated: 100 XP</Text>
        <Star size={16} color={premiumColors.neonAmber} />
        <Text style={styles.xpPreviewText}>Level Up Potential!</Text>
      </View>

      <Animated.View
        style={[
          styles.inputContainer,
          {
            shadowColor: premiumColors.neonCyan,
            shadowOpacity: inputGlow,
            shadowRadius: 20,
          },
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., I need help moving furniture to my new apartment..."
            placeholderTextColor={Colors.textSecondary}
            value={userInput}
            onChangeText={(text) => {
              setUserInput(text);
              Animated.timing(inputGlow, {
                toValue: text.length > 0 ? 0.3 : 0,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }}
            multiline
            maxLength={500}
            autoFocus
          />
          {userInput.length === 0 && (
            <View style={styles.exampleBubbles}>
              <TouchableOpacity
                style={styles.exampleBubble}
                onPress={() => setUserInput('Quick grocery run')}
                accessible={true}
                accessibilityLabel="Example task: Grocery run"
                accessibilityRole="button"
              >
                <Text style={styles.exampleBubbleText}>🛒 Grocery Run</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exampleBubble}
                onPress={() => setUserInput('Help moving furniture')}
                accessible={true}
                accessibilityLabel="Example task: Moving help"
                accessibilityRole="button"
              >
                <Text style={styles.exampleBubbleText}>📦 Moving Help</Text>
              </TouchableOpacity>
            </View>
          )}
          {autoCompleteSuggestions.length > 0 && userInput.length > 3 && (
            <View style={styles.autoCompleteContainer}>
              {autoCompleteSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.autoCompleteItem}
                  onPress={() => setUserInput(suggestion)}
                  accessible={true}
                  accessibilityLabel={`Auto-complete suggestion: ${suggestion}`}
                  accessibilityRole="button"
                >
                  <Sparkles size={12} color={premiumColors.neonCyan} />
                  <Text style={styles.autoCompleteText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={styles.inputFooter}>
          <Text style={styles.charCount}>{userInput.length}/500</Text>
          <Text style={styles.aiDisclaimer}>AI-powered — your edits make it perfect!</Text>
        </View>
      </Animated.View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.micButton}
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              isRecording
                ? [premiumColors.neonMagenta, '#FF0000']
                : [premiumColors.neonMagenta, premiumColors.neonViolet]
            }
            style={styles.micButtonGradient}
          >
            <Mic size={24} color="#FFFFFF" />
            <Text style={styles.micButtonText}>
              {isRecording ? 'Stop Recording' : 'Tell me'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, !userInput.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmitPrompt}
          disabled={!userInput.trim() || isProcessing}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              userInput.trim()
                ? [premiumColors.neonCyan, premiumColors.neonGreen]
                : ['#333', '#444']
            }
            style={styles.sendButtonGradient}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Send size={24} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>Create with AI</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.inspireButton}
        onPress={() => {
          setShowTrendingCarousel(!showTrendingCarousel);
          triggerHaptic('light');
          if (!showTrendingCarousel) {
            Animated.spring(carouselSlide, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          } else {
            Animated.spring(carouselSlide, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        }}
        accessible={true}
        accessibilityLabel="Show trending tasks for inspiration"
        accessibilityRole="button"
      >
        <Lightbulb size={20} color={premiumColors.neonAmber} />
        <Text style={styles.inspireButtonText}>{showTrendingCarousel ? 'Hide Trends' : 'Inspire me'}</Text>
      </TouchableOpacity>

      {showTrendingCarousel && (
        <Animated.View
          style={[
            styles.trendingCarousel,
            {
              opacity: carouselSlide,
              transform: [
                {
                  translateY: carouselSlide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <FlatList
            data={trendingTasks}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.trendingList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.trendingCard}
                onPress={() => {
                  setUserInput(`I need help with ${item.title.toLowerCase()}`);
                  setShowTrendingCarousel(false);
                  triggerHaptic('medium');
                }}
                accessible={true}
                accessibilityLabel={`Trending task: ${item.title}, average pay ${item.avgPay}, ${item.demand} demand`}
                accessibilityRole="button"
              >
                <View style={styles.trendingCardHeader}>
                  <Text style={styles.trendingIcon}>{item.icon}</Text>
                  <View
                    style={[
                      styles.demandBadge,
                      { backgroundColor: item.demand === 'High' ? premiumColors.neonGreen + '30' : premiumColors.neonAmber + '30' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.demandText,
                        { color: item.demand === 'High' ? premiumColors.neonGreen : premiumColors.neonAmber },
                      ]}
                    >
                      {item.demand}
                    </Text>
                  </View>
                </View>
                <Text style={styles.trendingTitle}>{item.title}</Text>
                <Text style={styles.trendingPay}>{item.avgPay} avg</Text>
                <View style={styles.createNowButton}>
                  <Text style={styles.createNowText}>Create Now</Text>
                  <Zap size={14} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
                </View>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </View>
  );

  const renderDraftStep = () => {
    if (!aiSuggestion) return null;

    return (
      <ScrollView
        style={styles.draftContainer}
        contentContainerStyle={styles.draftContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.draftHeader}>
          <View style={styles.aiLabel}>
            <Sparkles size={16} color={premiumColors.neonCyan} />
            <Text style={styles.aiLabelText}>AI Generated</Text>
          </View>
          <View
            style={[
              styles.confidenceBadge,
              {
                backgroundColor:
                  aiSuggestion.confidence === 'high'
                    ? premiumColors.neonGreen + '20'
                    : aiSuggestion.confidence === 'medium'
                    ? premiumColors.neonAmber + '20'
                    : premiumColors.neonMagenta + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.confidenceText,
                {
                  color:
                    aiSuggestion.confidence === 'high'
                      ? premiumColors.neonGreen
                      : aiSuggestion.confidence === 'medium'
                      ? premiumColors.neonAmber
                      : premiumColors.neonMagenta,
                },
              ]}
            >
              {aiSuggestion.confidence} confidence
            </Text>
          </View>
        </View>

        <GlassCard style={styles.draftCard}>
          <Text style={styles.draftTitle}>{aiSuggestion.title}</Text>
          <Text style={styles.draftDescription}>{aiSuggestion.description}</Text>

          <View style={styles.draftMetrics}>
            <View style={styles.metricItem}>
              <DollarSign size={20} color={premiumColors.neonGreen} />
              <Text style={styles.metricLabel}>Estimated Pay</Text>
              <Text style={styles.metricValue}>
                ${aiSuggestion.estimatedPay.min} - ${aiSuggestion.estimatedPay.max}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Clock size={20} color={premiumColors.neonAmber} />
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={styles.metricValue}>{aiSuggestion.estimatedDuration}</Text>
            </View>
          </View>

          {aiSuggestion.safetyNotes && (
            <View style={styles.safetyNote}>
              <Shield size={20} color={premiumColors.neonCyan} />
              <Text style={styles.safetyText}>{aiSuggestion.safetyNotes}</Text>
            </View>
          )}

          <View style={styles.skillsContainer}>
            <Text style={styles.skillsLabel}>Required Skills:</Text>
            <View style={styles.skillsList}>
              {aiSuggestion.suggestedSkills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>

        <View style={styles.draftActions}>
          <TouchableOpacity
            style={styles.customizeButton}
            onPress={() => {
              setStep('customize');
              triggerHaptic('light');
            }}
          >
            <Edit3 size={20} color={premiumColors.neonCyan} />
            <Text style={styles.customizeButtonText}>Customize</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmTask}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[premiumColors.neonGreen, premiumColors.neonCyan]}
              style={styles.confirmButtonGradient}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>Post Task</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => {
            setStep('prompt');
            setAiSuggestion(null);
            triggerHaptic('light');
          }}
        >
          <X size={20} color={Colors.textSecondary} />
          <Text style={styles.rejectButtonText}>Start over</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderCustomizeStep = () => {
    if (!aiSuggestion) return null;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.customizeContainer}
      >
        <ScrollView
          style={styles.customizeScroll}
          contentContainerStyle={styles.customizeContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.customizeTitle}>Customize Your Task</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.formInput}
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholder="Task title"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.formLabelRow}>
              <Text style={styles.formLabel}>Description</Text>
              <TouchableOpacity
                style={styles.aiAssistButton}
                onPress={handleImproveDescription}
                disabled={isProcessing}
              >
                <Sparkles size={14} color={premiumColors.neonCyan} />
                <Text style={styles.aiAssistText}>Improve with AI</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              value={customDescription}
              onChangeText={setCustomDescription}
              placeholder="Detailed description"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={6}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.formLabelRow}>
              <Text style={styles.formLabel}>Pay Range</Text>
              <TouchableOpacity
                style={styles.aiAssistButton}
                onPress={handleSuggestPricing}
                disabled={isProcessing}
              >
                <Sparkles size={14} color={premiumColors.neonCyan} />
                <Text style={styles.aiAssistText}>AI Suggest</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.payInputRow}>
              <View style={styles.payInputContainer}>
                <Text style={styles.payInputLabel}>Min</Text>
                <TextInput
                  style={styles.payInput}
                  value={customPay.min.toString()}
                  onChangeText={(text) =>
                    setCustomPay({ ...customPay, min: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              <Text style={styles.payDivider}>-</Text>
              <View style={styles.payInputContainer}>
                <Text style={styles.payInputLabel}>Max</Text>
                <TextInput
                  style={styles.payInput}
                  value={customPay.max.toString()}
                  onChangeText={(text) =>
                    setCustomPay({ ...customPay, max: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.negotiationToggle}
            onPress={() => {
              setEnableAINegotiation(!enableAINegotiation);
              triggerHaptic('light');
            }}
          >
            <View style={styles.negotiationToggleLeft}>
              <Sparkles size={20} color={premiumColors.neonViolet} />
              <View>
                <Text style={styles.negotiationToggleTitle}>AI Negotiation</Text>
                <Text style={styles.negotiationToggleSubtitle}>
                  Let AI handle price offers automatically
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                enableAINegotiation && styles.toggleSwitchActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  enableAINegotiation && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              setStep('draft');
              triggerHaptic('success');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[premiumColors.neonCyan, premiumColors.neonViolet]}
              style={styles.saveButtonGradient}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: step === 'prompt' ? 'Create Task' : step === 'draft' ? 'Review Task' : 'Customize',
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (step === 'prompt') {
                  router.back();
                } else if (step === 'draft') {
                  setStep('prompt');
                  setAiSuggestion(null);
                } else {
                  setStep('draft');
                }
                triggerHaptic('light');
              }}
            >
              <Text style={styles.headerBackText}>
                {step === 'prompt' ? 'Cancel' : 'Back'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.gradient}>
        <View style={styles.particleBackground}>
          {[...Array(15)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.backgroundParticle,
                {
                  left: `${(i * 23) % 100}%`,
                  top: `${(i * 17) % 100}%`,
                  opacity: particleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.1, 0.3, 0.1],
                  }),
                },
              ]}
            />
          ))}
        </View>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          {step === 'prompt' && renderPromptStep()}
          {step === 'draft' && renderDraftStep()}
          {step === 'customize' && renderCustomizeStep()}
        </SafeAreaView>
      </View>
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
    backgroundColor: premiumColors.deepBlack,
  },
  particleBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  backgroundParticle: {
    position: 'absolute' as const,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: premiumColors.neonCyan,
  },
  safeArea: {
    flex: 1,
  },
  headerBackText: {
    fontSize: 16,
    color: premiumColors.neonCyan,
    fontWeight: '600' as const,
  },
  promptContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  orbWrapper: {
    position: 'relative' as const,
    marginBottom: 40,
  },
  particleContainer: {
    position: 'absolute' as const,
    width: 200,
    height: 200,
    left: -40,
    top: -40,
  },
  particle: {
    position: 'absolute' as const,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  orbContainer: {
    marginBottom: 0,
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  orbInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  titleGradientWrapper: {
    borderRadius: 12,
    padding: 2,
    marginBottom: 12,
  },
  promptTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    lineHeight: 38,
    textShadowColor: premiumColors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  promptSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 20,
    fontStyle: 'italic' as const,
  },
  xpPreviewContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: premiumColors.neonAmber + '20',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  xpPreviewText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  textInput: {
    padding: 20,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top' as const,
  },
  exampleBubbles: {
    position: 'absolute' as const,
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  exampleBubble: {
    backgroundColor: premiumColors.neonViolet + '30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: premiumColors.neonViolet + '50',
  },
  exampleBubbleText: {
    fontSize: 13,
    color: premiumColors.neonViolet,
    fontWeight: '600' as const,
  },
  inputFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  aiDisclaimer: {
    fontSize: 10,
    color: premiumColors.neonCyan,
    fontStyle: 'italic' as const,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  micButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  micButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 16,
    gap: 8,
  },
  micButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  sendButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 18,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  inspireButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: premiumColors.neonAmber + '20',
    borderRadius: 12,
  },
  inspireButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.neonAmber,
  },
  autoCompleteContainer: {
    position: 'absolute' as const,
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: premiumColors.richBlack,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
    padding: 8,
    gap: 4,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  autoCompleteItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  autoCompleteText: {
    fontSize: 14,
    color: premiumColors.neonCyan,
    fontWeight: '600' as const,
  },
  trendingCarousel: {
    marginTop: 20,
    width: '100%',
  },
  trendingList: {
    gap: 12,
    paddingRight: 24,
  },
  trendingCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trendingCardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  trendingIcon: {
    fontSize: 32,
  },
  demandBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  demandText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  trendingPay: {
    fontSize: 12,
    color: premiumColors.neonGreen,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  createNowButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    backgroundColor: premiumColors.neonCyan + '20',
    paddingVertical: 6,
    borderRadius: 8,
  },
  createNowText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  draftContainer: {
    flex: 1,
  },
  draftContent: {
    padding: 20,
  },
  draftHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  aiLabel: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: premiumColors.neonCyan + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  aiLabelText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  confidenceBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  draftCard: {
    padding: 20,
    marginBottom: 20,
  },
  draftTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 30,
  },
  draftDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  draftMetrics: {
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 20,
  },
  metricItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  safetyNote: {
    flexDirection: 'row' as const,
    gap: 12,
    backgroundColor: premiumColors.neonCyan + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: premiumColors.neonCyan,
    lineHeight: 20,
  },
  skillsContainer: {
    gap: 12,
  },
  skillsLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  skillsList: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  skillBadge: {
    backgroundColor: premiumColors.neonViolet + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonViolet,
  },
  draftActions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 16,
  },
  customizeButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
  },
  customizeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  rejectButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 16,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  customizeContainer: {
    flex: 1,
  },
  customizeScroll: {
    flex: 1,
  },
  customizeContent: {
    padding: 20,
  },
  customizeTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  formLabelRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  aiAssistButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: 6,
  },
  aiAssistText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTextArea: {
    minHeight: 120,
    textAlignVertical: 'top' as const,
  },
  payInputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  payInputContainer: {
    flex: 1,
  },
  payInputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  payInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  payDivider: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginTop: 20,
  },
  negotiationToggle: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  negotiationToggleLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  negotiationToggleTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  negotiationToggleSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 2,
    justifyContent: 'center' as const,
  },
  toggleSwitchActive: {
    backgroundColor: premiumColors.neonGreen,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end' as const,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 18,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
});
