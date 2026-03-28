import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { COLORS } from '@/constants/designTokens';

interface VoiceAIControlProps {
  isOpen: boolean;
  onVoiceInput: (transcript: string) => void;
  onSpeakResponse: (text: string) => void;
  isListening: boolean;
  isSpeaking: boolean;
  settings: {
    voiceEnabled: boolean;
    hapticFeedback: boolean;
  };
}

const STT_ENDPOINT = 'https://toolkit.rork.com/stt/transcribe/';

export function VoiceAIControl({
  isOpen,
  onVoiceInput,
  onSpeakResponse,
  isListening: parentIsListening,
  isSpeaking: parentIsSpeaking,
  settings,
}: VoiceAIControlProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      checkPermissions();
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording]);

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      setPermissionStatus('granted');
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
    } catch (err) {
      console.error('[VoiceAI] Permission check error:', err);
      setPermissionStatus('denied');
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.setValue(1);
    glowAnim.setValue(0);
  };

  const startRecordingWeb = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('[VoiceAI] Web recording error:', err);
      setError('Microphone access denied');
    }
  };

  const stopRecordingWeb = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startRecordingNative = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('[VoiceAI] Native recording error:', err);
      setError('Recording failed');
    }
  };

  const stopRecordingNative = async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (uri) {
        await transcribeAudioNative(uri);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      recordingRef.current = null;
      setIsRecording(false);
    } catch (err) {
      console.error('[VoiceAI] Stop recording error:', err);
      setError('Failed to process audio');
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(STT_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.text) {
        onVoiceInput(data.text);
        
        if (settings.hapticFeedback && Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (err) {
      console.error('[VoiceAI] Transcription error:', err);
      setError('Transcription failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeAudioNative = async (uri: string) => {
    setIsProcessing(true);

    try {
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as any);

      const response = await fetch(STT_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.text) {
        onVoiceInput(data.text);
        
        if (settings.hapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (err) {
      console.error('[VoiceAI] Native transcription error:', err);
      setError('Transcription failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePress = async () => {
    if (permissionStatus === 'denied') {
      setError('Microphone permission denied');
      return;
    }

    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isRecording) {
      if (Platform.OS === 'web') {
        stopRecordingWeb();
      } else {
        await stopRecordingNative();
      }
    } else {
      if (Platform.OS === 'web') {
        await startRecordingWeb();
      } else {
        await startRecordingNative();
      }
    }
  };

  const handleLongPress = async () => {
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    await handlePress();
  };

  if (!isOpen || !settings.voiceEnabled) {
    return null;
  }

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.controlContainer}>
        <TouchableOpacity
          style={styles.micButton}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.micButtonInner,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {isRecording && (
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    opacity: glowOpacity,
                  },
                ]}
              />
            )}

            {isRecording ? (
              <MicOff size={32} color="#fff" />
            ) : (
              <Mic size={32} color="#fff" />
            )}
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          {isProcessing ? (
            <Text style={styles.statusText}>Processing...</Text>
          ) : isRecording ? (
            <Text style={styles.statusText}>Listening...</Text>
          ) : (
            <Text style={styles.hintText}>Tap to speak, long-press for hands-free</Text>
          )}
        </View>
      </View>

      {parentIsSpeaking && (
        <View style={styles.speakingIndicator}>
          <Volume2 size={20} color={COLORS.secondary} />
          <Text style={styles.speakingText}>AI Speaking...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  controlContainer: {
    alignItems: 'center' as const,
    gap: 16,
  },
  micButton: {
    width: 80,
    height: 80,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  micButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glowRing: {
    position: 'absolute' as const,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    opacity: 0.3,
  },
  statusContainer: {
    alignItems: 'center' as const,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.secondary,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center' as const,
  },
  speakingIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${COLORS.secondary}15`,
    borderRadius: 20,
  },
  speakingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.secondary,
  },
});
