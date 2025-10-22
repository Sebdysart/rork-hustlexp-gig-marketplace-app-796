import React, { useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface ParallaxHeaderProps {
  headerContent: React.ReactNode;
  children: React.ReactNode;
  headerHeight: number;
  parallaxRatio?: number;
  style?: ViewStyle;
}

export default function ParallaxHeader({
  headerContent,
  children,
  headerHeight,
  parallaxRatio = 0.5,
  style,
}: ParallaxHeaderProps) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight * parallaxRatio],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.ScrollView
      style={style}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
    >
      <Animated.View
        style={{
          height: headerHeight,
          transform: [{ translateY: headerTranslate }],
          opacity: headerOpacity,
        }}
      >
        {headerContent}
      </Animated.View>
      {children}
    </Animated.ScrollView>
  );
}
