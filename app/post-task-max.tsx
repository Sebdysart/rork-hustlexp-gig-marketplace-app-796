import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Animated, ActivityIndicator, Platform 
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Mic, MicOff, Sparkles, MapPin, DollarSign, Zap, 
  Check, Clock, TrendingUp 
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { TaskCategory, PayType } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import Confetti from '@/components/Confetti';
import { premiumColors } from '@/constants/designTokens';
import GlassCard from '@/components/GlassCard';
import NeonButton from '@/components/NeonButton';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostTaskMaxScreen() {
  const { currentUser, createTask, users } = useApp();
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiParsedData, setAiParsedData] = useState<any>(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matchedHustlers, setMatchedHustlers] = useState<any[]>([]);
  const [selectedHustler, setSelectedHustler] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [posting, setPosting] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const matchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

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
    }
  }, [isListening, waveformAnim, pulseAnim]);

  const startListening = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
      }
      
      setIsListening(true);
      triggerHaptic('medium');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    setIsProcessing(true);
    triggerHaptic('success');

    try {
      if (Platform.OS !== 'web' && recording) {
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockTranscription = "Need someone to deep clean my 2 bedroom apartment tomorrow, budget is around $150";
      setTranscription(mockTranscription);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const parsed = {
        title: "Deep Clean 2BR Apartment",
        description: "Professional deep cleaning needed for a 2-bedroom apartment. All rooms, bathroom, and kitchen need thorough cleaning.",
        category: 'cleaning' as TaskCategory,
        payAmount: 150,
        payType: 'fixed' as PayType,
        estimatedDuration: '3-4 hours',
        urgency: 'tomorrow',
        confidence: 'high',
      };
      
      setAiParsedData(parsed);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await findMatches(parsed);
      
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
      setRecording(null);
    }
  };

  const findMatches = async (taskData: any) => {
    triggerHaptic('light');
    
    const eligibleHustlers = users.filter(u => 
      (u.role === 'worker' || u.role === 'both') && 
      u.skills && u.skills.includes(taskData.category) &&
      u.id !== currentUser?.id
    ).slice(0, 3);

    const matches = eligibleHustlers.map((hustler, index) => ({
      ...hustler,
      matchScore: 95 - (index * 5),
      distance: 0.5 + (index * 0.3),
      availability: index === 0 ? 'Now' : index === 1 ? 'In 2 hours' : 'Tomorrow',
      trustScore: hustler.trustScore,
      completedTasks: Math.floor(Math.random() * 50) + 10,
    }));

    setMatchedHustlers(matches);
    setShowMatches(true);

    Animated.spring(matchAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleInstantHire = async () => {
    if (!aiParsedData || !selectedHustler) return;

    setPosting(true);
    triggerHaptic('success');

    const xpReward = aiParsedData.payAmount * 2;

    await createTask({
      title: aiParsedData.title,
      description: aiParsedData.description,
      category: aiParsedData.category,
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      location: currentUser?.location || { lat: 0, lng: 0, address: 'Your location' },
      payType: aiParsedData.payType,
      payAmount: aiParsedData.payAmount,
      extras: [],
      xpReward,
    } as any);

    setShowConfetti(true);
    
    setTimeout(() => {
      setPosting(false);
      router.back();
    }, 2500);
  };

  const renderWaveform = () => {
    return (
      <View style={styles.waveformContainer}>
        {[...Array(5)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.waveformBar,
              {
                height: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 60 + Math.random() * 40],
                }),
                opacity: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Create Quest',
          headerStyle: { backgroundColor: premiumColors.deepBlack },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <LinearGradient 
        colors={[premiumColors.deepBlack, premiumColors.richBlack]} 
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Sparkles size={40} color={premiumColors.neonCyan} />
            <Text style={styles.headerTitle}>Voice-Powered Task Creation</Text>
            <Text style={styles.headerSubtitle}>Speak naturally, AI does the rest</Text>
          </View>

          {/* Voice Input Section */}
          <GlassCard variant="dark" style={styles.voiceCard}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isListening && styles.micButtonActive,
                ]}
                onPress={isListening ? stopListening : startListening}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={isListening 
                    ? [premiumColors.neonMagenta, premiumColors.neonViolet] 
                    : [premiumColors.neonCyan, premiumColors.neonViolet]
                  }
                  style={styles.micGradient}
                >
                  {isListening ? (
                    <MicOff size={48} color="#FFFFFF" />
                  ) : (
                    <Mic size={48} color="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.voiceInstruction}>
              {isListening 
                ? 'Listening... Tap when done' 
                : isProcessing 
                ? 'Processing...' 
                : 'Tap to describe your task'}
            </Text>

            {isListening && renderWaveform()}

            {transcription && !isListening && (
              <View style={styles.transcriptionBox}>
                <Text style={styles.transcriptionLabel}>You said:</Text>
                <Text style={styles.transcriptionText}>&ldquo;{transcription}&rdquo;</Text>
              </View>
            )}
          </GlassCard>

          {/* AI Parsed Data */}
          {aiParsedData && !isProcessing && (
            <Animated.View style={{ opacity: 1 }}>
              <GlassCard variant="darkStrong" neonBorder glowColor="neonCyan" style={styles.parsedCard}>
                <View style={styles.parsedHeader}>
                  <Sparkles size={20} color={premiumColors.neonCyan} />
                  <Text style={styles.parsedTitle}>AI Generated Task</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {aiParsedData.confidence.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.parsedDetails}>
                  <View style={styles.detailRow}>
                    <Check size={18} color={premiumColors.neonGreen} />
                    <Text style={styles.detailLabel}>Title:</Text>
                    <Text style={styles.detailValue}>{aiParsedData.title}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <DollarSign size={18} color={premiumColors.neonGreen} />
                    <Text style={styles.detailLabel}>Pay:</Text>
                    <Text style={styles.detailValue}>${aiParsedData.payAmount}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Clock size={18} color={premiumColors.neonAmber} />
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{aiParsedData.estimatedDuration}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Zap size={18} color={premiumColors.gritGold} />
                    <Text style={styles.detailLabel}>XP Reward:</Text>
                    <Text style={styles.detailValue}>{aiParsedData.payAmount * 2} XP</Text>
                  </View>
                </View>

                <Text style={styles.parsedDescription}>
                  {aiParsedData.description}
                </Text>
              </GlassCard>
            </Animated.View>
          )}

          {/* AI Matching Results */}
          {showMatches && matchedHustlers.length > 0 && (
            <Animated.View style={{ opacity: matchAnim, transform: [{ scale: matchAnim }] }}>
              <View style={styles.matchesSection}>
                <View style={styles.matchesHeader}>
                  <TrendingUp size={24} color={premiumColors.neonGreen} />
                  <Text style={styles.matchesTitle}>Perfect Matches Found!</Text>
                </View>
                <Text style={styles.matchesSubtitle}>
                  First to accept gets it. Race starts in 3...2...1...
                </Text>

                {matchedHustlers.map((hustler, index) => (
                  <TouchableOpacity
                    key={hustler.id}
                    style={[
                      styles.hustlerCard,
                      selectedHustler === hustler.id && styles.hustlerCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedHustler(hustler.id);
                      triggerHaptic('light');
                    }}
                  >
                    <LinearGradient
                      colors={
                        selectedHustler === hustler.id
                          ? [premiumColors.neonCyan + '40', premiumColors.neonViolet + '20']
                          : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                      }
                      style={styles.hustlerGradient}
                    >
                      {index === 0 && (
                        <View style={styles.topMatchBadge}>
                          <Sparkles size={12} color={premiumColors.gritGold} />
                          <Text style={styles.topMatchText}>TOP MATCH</Text>
                        </View>
                      )}

                      <View style={styles.hustlerTop}>
                        <View style={styles.hustlerAvatar}>
                          <Text style={styles.hustlerAvatarText}>
                            {hustler.name.charAt(0)}
                          </Text>
                        </View>

                        <View style={styles.hustlerInfo}>
                          <Text style={styles.hustlerName}>{hustler.name}</Text>
                          <View style={styles.hustlerStats}>
                            <View style={styles.statBadge}>
                              <Text style={styles.statText}>
                                ⭐ {hustler.trustScore}/100
                              </Text>
                            </View>
                            <View style={styles.statBadge}>
                              <Text style={styles.statText}>
                                ✓ {hustler.completedTasks} tasks
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.matchScoreBadge}>
                          <Text style={styles.matchScoreText}>
                            {hustler.matchScore}%
                          </Text>
                          <Text style={styles.matchScoreLabel}>MATCH</Text>
                        </View>
                      </View>

                      <View style={styles.hustlerBottom}>
                        <View style={styles.hustlerMeta}>
                          <MapPin size={14} color={premiumColors.neonCyan} />
                          <Text style={styles.hustlerMetaText}>
                            {hustler.distance.toFixed(1)} mi away
                          </Text>
                        </View>

                        <View style={styles.hustlerMeta}>
                          <Clock size={14} color={premiumColors.neonGreen} />
                          <Text style={styles.hustlerMetaText}>
                            {hustler.availability}
                          </Text>
                        </View>
                      </View>

                      {selectedHustler === hustler.id && (
                        <View style={styles.selectedOverlay}>
                          <Check size={32} color={premiumColors.neonGreen} />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Instant Hire Button */}
          {showMatches && selectedHustler && (
            <NeonButton
              title={posting ? "Creating Quest..." : "Instant Hire 🚀"}
              onPress={handleInstantHire}
              variant="green"
              icon={<Zap size={20} color={premiumColors.deepBlack} />}
              fullWidth
              disabled={posting}
              style={styles.hireButton}
            />
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={premiumColors.neonCyan} />
              <Text style={styles.processingText}>AI is working its magic...</Text>
              <View style={styles.processingSteps}>
                <Text style={styles.processingStep}>✓ Transcribing speech</Text>
                <Text style={styles.processingStep}>⚡ Parsing task details</Text>
                <Text style={styles.processingStep}>🎯 Finding perfect matches</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {showConfetti && <Confetti />}
    </SafeAreaView>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  voiceCard: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 20,
  },
  micButtonActive: {
    shadowColor: premiumColors.neonMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  micGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceInstruction: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 100,
  },
  waveformBar: {
    width: 4,
    backgroundColor: premiumColors.neonCyan,
    borderRadius: 2,
  },
  transcriptionBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    width: '100%',
  },
  transcriptionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonCyan,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  parsedCard: {
    padding: 20,
    marginBottom: 24,
  },
  parsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  parsedTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: premiumColors.neonGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: premiumColors.deepBlack,
  },
  parsedDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    flex: 1,
  },
  parsedDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  matchesSection: {
    marginBottom: 24,
  },
  matchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  matchesTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  matchesSubtitle: {
    fontSize: 14,
    color: premiumColors.neonAmber,
    marginBottom: 20,
    fontWeight: '600' as const,
  },
  hustlerCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hustlerCardSelected: {
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  hustlerGradient: {
    padding: 16,
    position: 'relative',
  },
  topMatchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: premiumColors.gritGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  topMatchText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: premiumColors.deepBlack,
  },
  hustlerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hustlerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: premiumColors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hustlerAvatarText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: premiumColors.deepBlack,
  },
  hustlerInfo: {
    flex: 1,
  },
  hustlerName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  hustlerStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  matchScoreBadge: {
    alignItems: 'center',
    backgroundColor: premiumColors.neonGreen + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen,
  },
  matchScoreText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: premiumColors.neonGreen,
  },
  matchScoreLabel: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: premiumColors.neonGreen,
  },
  hustlerBottom: {
    flexDirection: 'row',
    gap: 16,
  },
  hustlerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hustlerMetaText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: premiumColors.neonCyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hireButton: {
    marginBottom: 24,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 24,
  },
  processingSteps: {
    gap: 8,
  },
  processingStep: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },
});
