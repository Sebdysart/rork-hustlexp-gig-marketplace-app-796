import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { premiumColors } from '@/constants/designTokens';
import { CheckCircle2, X, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface TutorialStep {
  id: string;
  elementId?: string;
  position?: { x: number; y: number; width: number; height: number };
  message: string;
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
  action?: () => void | Promise<void>;
  autoAdvance?: boolean;
  xpReward?: number;
}

export interface Tutorial {
  id: string;
  title: string;
  steps: TutorialStep[];
  onComplete?: (xpEarned: number) => void;
  onSkip?: () => void;
}

interface AITutorialSystemProps {
  tutorial: Tutorial | null;
  onDismiss: () => void;
  onHighlightElement: (config: any) => void;
  onDismissHighlight: () => void;
}

export default function AITutorialSystem({ 
  tutorial, 
  onDismiss, 
  onHighlightElement,
  onDismissHighlight 
}: AITutorialSystemProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const showCurrentStep = useCallback(() => {
    if (!tutorial) return;
    
    const step = tutorial.steps[currentStepIndex];
    if (!step) return;

    if (step.position) {
      onHighlightElement({
        elementId: step.elementId || `step-${currentStepIndex}`,
        position: step.position,
        message: step.message,
        arrowDirection: step.arrowDirection,
        onTap: () => handleNext(),
        allowDismiss: false,
      });
    }
  }, [tutorial, currentStepIndex, onHighlightElement]);

  useEffect(() => {
    if (tutorial) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      
      showCurrentStep();
    }
  }, [tutorial, scaleAnim, showCurrentStep]);

  useEffect(() => {
    if (tutorial) {
      showCurrentStep();
      
      Animated.timing(progressAnim, {
        toValue: (currentStepIndex / tutorial.steps.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentStepIndex, tutorial, progressAnim, showCurrentStep]);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const totalXP = tutorial?.steps.reduce((sum, step) => sum + (step.xpReward || 0), 0) || 50;
    
    setTimeout(() => {
      tutorial?.onComplete?.(totalXP);
      onDismissHighlight();
      onDismiss();
    }, 2000);
  }, [tutorial, onDismissHighlight, onDismiss]);

  const handleNext = useCallback(async () => {
    if (!tutorial) return;

    const currentStep = tutorial.steps[currentStepIndex];
    
    if (currentStep.action) {
      await currentStep.action();
    }

    if (currentStepIndex < tutorial.steps.length - 1) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      onDismissHighlight();
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 100);
    } else {
      handleComplete();
    }
  }, [currentStepIndex, tutorial, onDismissHighlight, handleComplete]);



  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    tutorial?.onSkip?.();
    onDismissHighlight();
    onDismiss();
  };

  if (!tutorial) return null;

  const currentStep = tutorial.steps[currentStepIndex];

  return (
    <>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{tutorial.title}</Text>
            <Text style={styles.stepCounter}>
              Step {currentStepIndex + 1} of {tutorial.steps.length}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <X size={24} color={premiumColors.neonCyan} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
        </View>

        {!currentStep.position && (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{currentStep.message}</Text>
          </View>
        )}

        {isCompleted ? (
          <View style={styles.completedContainer}>
            <CheckCircle2 size={48} color={premiumColors.neonGreen} />
            <Text style={styles.completedTitle}>Tutorial Complete!</Text>
            <Text style={styles.completedXP}>
              +{tutorial.steps.reduce((sum, step) => sum + (step.xpReward || 0), 0) || 50} XP
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentStepIndex < tutorial.steps.length - 1 ? 'Next' : 'Finish'}
            </Text>
            <ArrowRight size={20} color="#000" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    padding: 24,
    zIndex: 10002,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: premiumColors.neonCyan,
    marginBottom: 4,
  },
  stepCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  skipButton: {
    padding: 4,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: premiumColors.neonCyan,
    borderRadius: 3,
  },
  messageContainer: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: premiumColors.neonCyan,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: premiumColors.neonGreen,
    marginTop: 16,
    marginBottom: 8,
  },
  completedXP: {
    fontSize: 20,
    fontWeight: '700',
    color: premiumColors.neonCyan,
  },
});
