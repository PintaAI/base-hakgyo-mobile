import { LayoutChangeEvent, Pressable, StyleSheet, Text } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface TabBarButtonProps {
  isFocused: boolean;
  label: string;
  routeName: string;
  color: string;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  icon: (props: { color: string }) => React.ReactNode;
}

export function TabBarButton({
  isFocused,
  label,
  color,
  onPress,
  onLongPress,
  onLayout,
  icon,
}: TabBarButtonProps) {
  const scale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(isFocused ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.15]);

    return {
      transform: [{ scale: scaleValue }],
    };
  });

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} onLayout={onLayout} style={styles.container}>
      <Animated.View style={[animatedIconStyle]}>{icon({ color })}</Animated.View>

      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={[{ color, fontSize: 11, textAlign: 'center' }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
});
