import { View, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef, ReactElement } from 'react';

interface StaggeredListProps {
  children: ReactElement[];
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggeredList({ children, staggerDelay = 100, initialDelay = 0 }: StaggeredListProps) {
  const animations = useRef(
    children.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animationSequence = children.map((_, index) =>
      Animated.timing(animations[index], {
        toValue: 1,
        duration: 400,
        delay: initialDelay + index * staggerDelay,
        useNativeDriver: true,
      })
    );

    Animated.stagger(staggerDelay, animationSequence).start();
  }, [children.length, staggerDelay, initialDelay, animations]);

  return (
    <View style={styles.container}>
      {children.map((child, index) => (
        <Animated.View
          key={index}
          style={[
            styles.item,
            {
              opacity: animations[index],
              transform: [
                {
                  translateY: animations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {child}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    width: '100%',
  },
});
