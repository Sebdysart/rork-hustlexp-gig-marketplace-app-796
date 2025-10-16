import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface PowerUpAnimationProps {
  icon: string;
  name: string;
  onComplete: () => void;
}

export default function PowerUpAnimation({ icon, name, onComplete }: PowerUpAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const coinsAnim = useRef<Animated.Value[]>([]);

  for (let i = 0; i < 20; i++) {
    if (!coinsAnim.current[i]) {
      coinsAnim.current[i] = new Animated.Value(0);
    }
  }

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
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
        ]),
        { iterations: 2 }
      ),
    ]).start();

    const coinAnimations = coinsAnim.current.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 50,
        useNativeDriver: true,
      });
    });

    Animated.parallel(coinAnimations).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, glowAnim, onComplete]);

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.glowCircle,
            {
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </Animated.View>

        <Animated.Text
          style={[
            styles.name,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          {name}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          Power-Up Activated!
        </Animated.Text>
      </View>

      {coinsAnim.current.map((anim, index) => {
        const angle = (index / 20) * Math.PI * 2;
        const distance = 150;
        
        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * distance],
        });

        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * distance - 100],
        });

        const coinOpacity = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 0],
        });

        return (
          <Animated.Text
            key={index}
            style={[
              styles.coin,
              {
                transform: [
                  { translateX },
                  { translateY },
                ],
                opacity: coinOpacity,
              },
            ]}
          >
            💰
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8B5CF6',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#A78BFA',
    textAlign: 'center',
  },
  coin: {
    position: 'absolute',
    fontSize: 24,
  },
});
