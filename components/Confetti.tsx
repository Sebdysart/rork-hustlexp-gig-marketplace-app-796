import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Colors from '@/constants/colors';
import { useSettings } from '@/contexts/SettingsContext';

interface ConfettiProps {
  count?: number;
  duration?: number;
  colors?: string[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Confetti({ 
  count = 50, 
  duration = 3000,
  colors = [Colors.primary, Colors.secondary, Colors.accent, Colors.success, '#EC4899', '#8B5CF6']
}: ConfettiProps) {
  const { settings } = useSettings();
  const confettiPieces = useRef<{
    x: Animated.Value;
    y: Animated.Value;
    rotate: Animated.Value;
    scale: Animated.Value;
    color: string;
    size: number;
    delay: number;
    endX: number;
  }[]>([])

  if (confettiPieces.current.length === 0) {
    confettiPieces.current = Array.from({ length: count }, () => {
      const startX = Math.random() * SCREEN_WIDTH;
      return {
        x: new Animated.Value(startX),
        y: new Animated.Value(-20),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(1),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 500,
        endX: startX + (Math.random() - 0.5) * 200,
      };
    });
  }

  useEffect(() => {
    if (settings.reducedMotion) {
      return;
    }

    const animations = confettiPieces.current.map((piece) => {
      const endY = SCREEN_HEIGHT + 50;
      const endX = piece.endX;

      return Animated.parallel([
        Animated.timing(piece.y, {
          toValue: endY,
          duration: duration + Math.random() * 1000,
          delay: piece.delay,
          useNativeDriver: true,
        }),
        Animated.timing(piece.x, {
          toValue: endX,
          duration: duration + Math.random() * 1000,
          delay: piece.delay,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(piece.rotate, {
            toValue: 1,
            duration: 1000 + Math.random() * 500,
            useNativeDriver: true,
          })
        ),
        Animated.sequence([
          Animated.timing(piece.scale, {
            toValue: 1.2,
            duration: 200,
            delay: piece.delay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.scale, {
            toValue: 0,
            duration: duration - 200,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  }, [settings.reducedMotion]);

  if (settings.reducedMotion) {
    return null;
  }

  return (
    <View 
      style={styles.container} 
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no"
    >
      {confettiPieces.current.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: piece.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
});
