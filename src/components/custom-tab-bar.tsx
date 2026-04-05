import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TabBarButton } from './tab-bar-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { Home, Book, FileText, User } from 'lucide-react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const icons: Record<string, (props: { color: string }) => React.ReactNode> = {
  index: ({ color }) => <Home size={22} color={color} />,
  vocab: ({ color }) => <Book size={22} color={color} />,
  soal: ({ color }) => <FileText size={22} color={color} />,
  'profile/index': ({ color }) => <User size={22} color={color} />,
};

interface TabLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const tabLayouts = useRef<Record<number, TabLayout>>({});
  const [layoutsReady, setLayoutsReady] = useState(false);

  const indicatorX = useSharedValue(0);
  const indicatorY = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorHeight = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragStartX = useSharedValue(0);

  const visibleRoutes = state.routes.filter(
    (route: any) => !['_sitemap', '+not-found'].includes(route.name)
  );

  // Store layouts in a shared value for worklet access
  const tabLayoutsShared = useSharedValue<TabLayout[]>([]);

  const navigateToTab = useCallback(
    (tabIndex: number) => {
      const route = visibleRoutes[tabIndex];
      if (route && state.index !== tabIndex) {
        navigation.navigate(route.name, route.params);
      }
    },
    [visibleRoutes, state.index, navigation]
  );

  const snapToNearestTab = useCallback(
    (currentX: number, currentWidth: number) => {
      'worklet';
      const centerX = currentX + currentWidth / 2;
      let nearestIndex = 0;
      let minDistance = Infinity;

      const layouts = tabLayoutsShared.value;
      for (let i = 0; i < layouts.length; i++) {
        const tabCenter = layouts[i].x + layouts[i].width / 2;
        const distance = Math.abs(centerX - tabCenter);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      const targetLayout = layouts[nearestIndex];
      if (targetLayout) {
        indicatorX.value = withSpring(targetLayout.x, SPRING_CONFIG);
        indicatorWidth.value = withSpring(targetLayout.width, SPRING_CONFIG);
        runOnJS(navigateToTab)(nearestIndex);
      }
    },
    [tabLayoutsShared, indicatorX, indicatorWidth, navigateToTab]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      dragStartX.value = indicatorX.value;
    })
    .onUpdate((event) => {
      indicatorX.value = dragStartX.value + event.translationX;
    })
    .onEnd(() => {
      isDragging.value = false;
      snapToNearestTab(indicatorX.value, indicatorWidth.value);
    })
    .minDistance(5)
    .activeOffsetX([-10, 10]);

  const animateIndicator = useCallback(
    (index: number) => {
      const layout = tabLayouts.current[index];
      if (layout) {
        indicatorX.value = withTiming(layout.x, TIMING_CONFIG);
        indicatorY.value = withTiming(layout.y, TIMING_CONFIG);
        indicatorWidth.value = withTiming(layout.width, TIMING_CONFIG);
        indicatorHeight.value = withTiming(layout.height, TIMING_CONFIG);
      }
    },
    [indicatorX, indicatorY, indicatorWidth, indicatorHeight]
  );

  useEffect(() => {
    if (layoutsReady && !isDragging.value) {
      animateIndicator(state.index);
    }
  }, [state.index, layoutsReady, animateIndicator, isDragging]);

  const handleTabLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      tabLayouts.current[index] = { x, y, width, height };

      // Check if all tabs have been measured
      if (Object.keys(tabLayouts.current).length === visibleRoutes.length) {
        setLayoutsReady(true);

        // Update shared layouts for worklet access
        const layoutsArray: TabLayout[] = [];
        for (let i = 0; i < visibleRoutes.length; i++) {
          layoutsArray.push(tabLayouts.current[i]);
        }
        tabLayoutsShared.value = layoutsArray;

        // Set initial position without animation
        const activeLayout = tabLayouts.current[state.index];
        if (activeLayout) {
          indicatorX.value = activeLayout.x;
          indicatorY.value = activeLayout.y;
          indicatorWidth.value = activeLayout.width;
          indicatorHeight.value = activeLayout.height;
        }
      }
    },
    [visibleRoutes.length, state.index, indicatorX, indicatorY, indicatorWidth, indicatorHeight, tabLayoutsShared]
  );

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: indicatorX.value,
    top: indicatorY.value,
    width: indicatorWidth.value,
    height: indicatorHeight.value,
  }));

  return (
    <View style={[styles.tabbar, { backgroundColor: colors.background }]}>
      {/* Draggable sliding indicator */}
      {layoutsReady && (
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.indicator,
              { backgroundColor: colors.backgroundElement },
              animatedIndicatorStyle,
            ]}
          />
        </GestureDetector>
      )}

      {/* Tab buttons */}
      {visibleRoutes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            onLayout={(e) => handleTabLayout(index, e)}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? colors.primary : colors.mutedForeground}
            label={label}
            icon={icons[route.name] || (() => null)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderCurve: 'continuous',
    boxShadow: '0 10px 10px rgba(0, 0, 0, 0.1)',
  },
  indicator: {
    position: 'absolute',
    borderRadius: 16,
    borderCurve: 'continuous',
  },
});
