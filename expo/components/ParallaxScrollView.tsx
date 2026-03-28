import { Animated, ViewStyle, ScrollViewProps, Platform } from 'react-native';
import { useRef, ReactNode } from 'react';

interface ParallaxScrollViewProps extends ScrollViewProps {
  children: ReactNode;
  parallaxHeaderHeight?: number;
  parallaxContent?: (scrollY: Animated.Value) => ReactNode;
  style?: ViewStyle;
}

export function ParallaxScrollView({
  children,
  parallaxHeaderHeight = 200,
  parallaxContent,
  style,
  ...scrollViewProps
}: ParallaxScrollViewProps) {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <>
      {parallaxContent && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: parallaxHeaderHeight,
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, parallaxHeaderHeight],
                  outputRange: [0, parallaxHeaderHeight / 2],
                  extrapolate: 'clamp',
                }),
              },
            ],
            opacity: scrollY.interpolate({
              inputRange: [0, parallaxHeaderHeight / 2, parallaxHeaderHeight],
              outputRange: [1, 0.5, 0],
              extrapolate: 'clamp',
            }),
          }}
        >
          {parallaxContent(scrollY)}
        </Animated.View>
      )}
      <Animated.ScrollView
        {...scrollViewProps}
        style={style}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== 'web' }
        )}
        scrollEventThrottle={16}
      >
        {children}
      </Animated.ScrollView>
    </>
  );
}
