import React, { useRef } from 'react';
import { Animated, FlatList, FlatListProps, ViewStyle } from 'react-native';
import { createStaggerAnimation, createFadeAnimation, timingPresets } from '@/utils/tierS/advancedAnimations';

interface PhysicsListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  staggerDelay?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export default function PhysicsList<T>({
  data,
  renderItem,
  staggerDelay = 50,
  animated = true,
  style,
  ...flatListProps
}: PhysicsListProps<T>) {
  const animatedValues = useRef<Animated.Value[]>([]).current;

  const getAnimatedValue = (index: number) => {
    if (!animatedValues[index]) {
      animatedValues[index] = new Animated.Value(0);
      
      if (animated) {
        const animations = animatedValues.map((value) =>
          createFadeAnimation(value, 1, timingPresets.normal.duration)
        );
        createStaggerAnimation(animations, staggerDelay).start();
      } else {
        animatedValues[index].setValue(1);
      }
    }
    return animatedValues[index];
  };

  const renderAnimatedItem = ({ item, index }: { item: T; index: number }) => {
    const animatedValue = getAnimatedValue(index);

    const opacity = animatedValue;
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    });

    return (
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }],
        }}
      >
        {renderItem(item, index)}
      </Animated.View>
    );
  };

  return (
    <FlatList
      {...flatListProps}
      data={data}
      renderItem={renderAnimatedItem}
      style={style}
    />
  );
}
