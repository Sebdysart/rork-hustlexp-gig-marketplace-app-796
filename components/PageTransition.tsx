import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { useEffect, useRef, type ReactNode } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type TransitionType = 'slide' | 'fade' | 'scale' | 'slideUp';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
}

export function PageTransition({ children, type = 'fade', duration = 300 }: PageTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(type === 'slideUp' ? 100 : SCREEN_WIDTH)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    switch (type) {
      case 'slide':
        animations.push(
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          })
        );
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration * 0.8,
            useNativeDriver: true,
          })
        );
        break;

      case 'slideUp':
        animations.push(
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          })
        );
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration * 0.8,
            useNativeDriver: true,
          })
        );
        break;

      case 'scale':
        animations.push(
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        );
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration * 0.6,
            useNativeDriver: true,
          })
        );
        break;

      case 'fade':
      default:
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          })
        );
        break;
    }

    Animated.parallel(animations).start();
  }, [fadeAnim, slideAnim, scaleAnim, type, duration]);

  const getTransform = () => {
    switch (type) {
      case 'slide':
        return [{ translateX: slideAnim }];
      case 'slideUp':
        return [{ translateY: slideAnim }];
      case 'scale':
        return [{ scale: scaleAnim }];
      default:
        return [];
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: getTransform(),
        },
      ]}
    >
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
