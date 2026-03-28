import React, { useRef, useEffect } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle, StyleSheet } from 'react-native';

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  duration?: number;
}

export default function FlipCard({
  frontContent,
  backContent,
  isFlipped,
  onPress,
  style,
  duration = 600,
}: FlipCardProps) {
  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 180 : 0,
      tension: 10,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, flipAnimation]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: frontOpacity,
              transform: [{ rotateY: frontInterpolate }],
            },
          ]}
        >
          {frontContent}
        </Animated.View>
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ rotateY: backInterpolate }],
            },
          ]}
        >
          {backContent}
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative' as const,
  },
  card: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
  },
  cardBack: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
});
