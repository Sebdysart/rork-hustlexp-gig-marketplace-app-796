import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AIHighlightOverlay() {
  const { highlightedElement } = useUltimateAICoach();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (highlightedElement) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Pulsing glow animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
        // Arrow bounce animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(arrowAnim, {
              toValue: -10,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(arrowAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [highlightedElement]);
  
  if (!highlightedElement) return null;
  
  // TODO: In future, use highlightedElement ID to position spotlight dynamically
  // For now, center it as a proof of concept
  const spotlightX = SCREEN_WIDTH / 2 - 100;
  const spotlightY = SCREEN_HEIGHT / 2 - 50;
  const spotlightWidth = 200;
  const spotlightHeight = 100;
  
  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          pointerEvents: highlightedElement ? 'auto' : 'none',
        }
      ]}
    >
      {/* Dim background - tappable to dismiss */}
      <TouchableOpacity 
        style={StyleSheet.absoluteFill}
        onPress={() => {
          // Dismiss on tap - handled by timeout in context
        }}
        activeOpacity={1}
      >
        <BlurView intensity={40} tint="dark" style={styles.dimBackground} />
      </TouchableOpacity>
      
      {/* Spotlight hole with glow */}
      <View style={styles.spotlightContainer}>
        {/* Outer glow rings */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              left: spotlightX - 20,
              top: spotlightY - 20,
              width: spotlightWidth + 40,
              height: spotlightHeight + 40,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowRing,
            {
              left: spotlightX - 10,
              top: spotlightY - 10,
              width: spotlightWidth + 20,
              height: spotlightHeight + 20,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 0.8],
              }),
            },
          ]}
        />
        
        {/* Clear spotlight area */}
        <View
          style={[
            styles.spotlight,
            {
              left: spotlightX,
              top: spotlightY,
              width: spotlightWidth,
              height: spotlightHeight,
            },
          ]}
        />
      </View>
      
      {/* Animated arrow + tooltip */}
      <Animated.View
        style={[
          styles.tooltipContainer,
          {
            left: spotlightX + spotlightWidth / 2 - 60,
            top: spotlightY + spotlightHeight + 20,
            transform: [{ translateY: arrowAnim }],
          },
        ]}
      >
        <BlurView intensity={60} tint="dark" style={styles.tooltip}>
          <Text style={styles.arrow}>👆</Text>
          <Text style={styles.instruction}>Tap here!</Text>
        </BlurView>
      </Animated.View>
      
      {/* Instruction text at bottom */}
      <View style={styles.bottomInstruction}>
        <BlurView intensity={60} tint="dark" style={styles.instructionBlur}>
          <Text style={styles.instructionText}>
            The AI Coach is guiding you
          </Text>
          <Text style={styles.instructionSubtext}>
            Tap anywhere to dismiss
          </Text>
        </BlurView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  dimBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  spotlightContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 1,
  },
  spotlight: {
    position: 'absolute',
    borderRadius: borderRadius.xxl,
    borderWidth: 3,
    borderColor: premiumColors.neonCyan,
    backgroundColor: 'transparent',
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 1,
  },
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  tooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '80',
  },
  arrow: {
    fontSize: 24,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  bottomInstruction: {
    position: 'absolute',
    bottom: spacing.xxl * 2,
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
  },
  instructionBlur: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.xs,
  },
  instructionSubtext: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
  },
});
