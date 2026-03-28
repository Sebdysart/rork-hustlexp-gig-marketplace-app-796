import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';
import { premiumColors } from '@/constants/designTokens';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export interface HighlightConfig {
  elementId: string;
  position?: { x: number; y: number; width: number; height: number };
  message?: string;
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
  onTap?: () => void;
  allowDismiss?: boolean;
}

export default function AIHighlightOverlay() {
  const { highlightConfig, dismissHighlight } = useUltimateAICoach();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (highlightConfig) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(arrowAnim, {
              toValue: -12,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(arrowAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [highlightConfig, fadeAnim, pulseAnim, arrowAnim]);

  if (!highlightConfig) return null;

  const position = highlightConfig.position || {
    x: width / 2 - 100,
    y: height / 2 - 50,
    width: 200,
    height: 100,
  };

  const message = highlightConfig.message || 'Tap here to continue!';
  const arrowDirection = highlightConfig.arrowDirection || 'up';

  const getArrowIcon = () => {
    switch (arrowDirection) {
      case 'down': return <ChevronDown size={32} color={premiumColors.neonCyan} />;
      case 'left': return <ChevronLeft size={32} color={premiumColors.neonCyan} />;
      case 'right': return <ChevronRight size={32} color={premiumColors.neonCyan} />;
      default: return <ChevronUp size={32} color={premiumColors.neonCyan} />;
    }
  };

  const getTooltipPosition = () => {
    const padding = 20;
    switch (arrowDirection) {
      case 'down':
        return { top: position.y - 80, left: 0, right: 0 };
      case 'up':
        return { top: position.y + position.height + padding, left: 0, right: 0 };
      case 'left':
        return { top: position.y + position.height / 2 - 30, left: position.x + position.width + padding };
      case 'right':
        return { top: position.y + position.height / 2 - 30, right: width - position.x + padding };
      default:
        return { top: position.y + position.height + padding, left: 0, right: 0 };
    }
  };

  const getArrowTransform = () => {
    switch (arrowDirection) {
      case 'down': return [{ translateY: arrowAnim }];
      case 'up': return [{ translateY: Animated.multiply(arrowAnim, -1) }];
      case 'left': return [{ translateX: arrowAnim }];
      case 'right': return [{ translateX: Animated.multiply(arrowAnim, -1) }];
      default: return [{ translateY: Animated.multiply(arrowAnim, -1) }];
    }
  };

  const handleTap = () => {
    if (highlightConfig.onTap) {
      highlightConfig.onTap();
    }
  };

  const handleDismiss = () => {
    if (highlightConfig.allowDismiss !== false) {
      dismissHighlight?.();
    }
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="box-none">
      <TouchableOpacity 
        style={styles.dimBackground}
        activeOpacity={1}
        onPress={handleDismiss}
      />
      
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleTap}
        style={[
          styles.spotlightContainer,
          {
            left: position.x,
            top: position.y,
            width: position.width,
            height: position.height,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.spotlight,
            { transform: [{ scale: pulseAnim }] }
          ]}
        />
      </TouchableOpacity>

      <Animated.View 
        style={[
          styles.tooltipContainer,
          getTooltipPosition(),
          { transform: getArrowTransform() }
        ]}
        pointerEvents="none"
      >
        <View style={styles.tooltip}>
          {getArrowIcon()}
          <Text style={styles.instruction}>{message}</Text>
        </View>
      </Animated.View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
  },
  spotlightContainer: {
    position: 'absolute',
    zIndex: 10000,
  },
  spotlight: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: premiumColors.neonCyan,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
  },
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
    alignItems: 'center',
    maxWidth: width - 80,
    shadowColor: premiumColors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '700',
    color: premiumColors.neonCyan,
    textAlign: 'center',
    marginTop: 8,
  },
});
