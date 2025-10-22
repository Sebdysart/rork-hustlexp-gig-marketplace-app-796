import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  color: string;
}

interface ConfettiExplosionProps {
  active: boolean;
  count?: number;
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
}

export default function ConfettiExplosion({
  active,
  count = 50,
  duration = 2500,
  colors = ['#FF00A8', '#00FFFF', '#FFB800', '#00FF88', '#9B5EFF'],
  onComplete,
}: ConfettiExplosionProps) {
  const confettiPieces = useRef<ConfettiPiece[]>([]).current;

  useEffect(() => {
    if (confettiPieces.length === 0) {
      for (let i = 0; i < count; i++) {
        confettiPieces.push({
          x: new Animated.Value(SCREEN_WIDTH / 2),
          y: new Animated.Value(SCREEN_HEIGHT / 2),
          rotate: new Animated.Value(0),
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
  }, [confettiPieces, count, colors]);

  useEffect(() => {
    if (active && confettiPieces.length > 0) {
      const animations = confettiPieces.map((piece) => {
        const targetX = (Math.random() - 0.5) * SCREEN_WIDTH * 2;
        const targetY = SCREEN_HEIGHT + 100;
        const rotations = Math.random() * 10 + 5;

        return Animated.parallel([
          Animated.timing(piece.x, {
            toValue: SCREEN_WIDTH / 2 + targetX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(piece.y, {
            toValue: targetY,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotate, {
            toValue: rotations * 360,
            duration,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start(() => {
        confettiPieces.forEach((piece) => {
          piece.x.setValue(SCREEN_WIDTH / 2);
          piece.y.setValue(SCREEN_HEIGHT / 2);
          piece.rotate.setValue(0);
        });
        
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [active, confettiPieces, duration, onComplete]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
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
    position: 'absolute' as const,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
