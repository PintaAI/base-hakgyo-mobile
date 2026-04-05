import { useTheme } from '@/hooks/use-theme';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Modal, Pressable, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DailyLoginState {
  isLoading: boolean;
  xpEarned?: number;
  streak?: number;
  levelsGained?: number;
  streakMilestoneReached?: boolean;
}

interface SubmenuItem {
  id: string;
  label: string;
  icon?: SFSymbol;
  thumbnail?: string;
}

interface MenuHeaderProps {
  title: string;
  subtitle?: string;
  leftIconName?: SFSymbol;
  leftIconImage?: ImageSourcePropType;
  rightIconName?: SFSymbol;
  onRightIconPress?: () => void;
  /** Whether to apply safe area inset padding. Defaults to true. */
  insetEnabled?: boolean;
  /** Whether to center align the title and subtitle. Defaults to false. */
  centerAlign?: boolean;
  /** Daily login state for visual feedback */
  dailyLoginState?: DailyLoginState;
  /** Whether to show submenu dropdown. Defaults to false. */
  submenu?: boolean;
  /** Array of submenu items to display in dropdown */
  submenuItems?: SubmenuItem[];
  /** Callback when a submenu item is selected */
  onSubmenuChange?: (item: SubmenuItem) => void;
  /** Currently selected submenu item id */
  selectedSubmenuId?: string;
}

export function MenuHeader({
  title,
  subtitle,
  leftIconName,
  leftIconImage,
  rightIconName,
  onRightIconPress,
  insetEnabled = true,
  centerAlign = false,
  dailyLoginState,
  submenu = false,
  submenuItems = [],
  onSubmenuChange,
  selectedSubmenuId
}: MenuHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const hasShownSuccess = useRef(false);
  
  // State to temporarily show streak info, then revert to greeting
  const [showStreakInfo, setShowStreakInfo] = useState(false);
  
  // Submenu dropdown state
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
  // Get selected item label
  const selectedItem = submenuItems.find(item => item.id === selectedSubmenuId);
  const displayTitle = submenu && selectedItem ? selectedItem.label : title;
  
  // Handle submenu item press
  const handleSubmenuPress = (item: SubmenuItem) => {
    onSubmenuChange?.(item);
    setIsDropdownVisible(false);
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (submenu && submenuItems.length > 0) {
      setIsDropdownVisible(!isDropdownVisible);
    }
  };

  // Spinning animation for loading indicator
  useEffect(() => {
    if (dailyLoginState?.isLoading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [dailyLoginState?.isLoading, spinAnim]);

  // Show success animation when daily login completes with XP
  useEffect(() => {
    if (dailyLoginState && !dailyLoginState.isLoading && dailyLoginState.xpEarned !== undefined && !hasShownSuccess.current) {
      hasShownSuccess.current = true;
      
      // Fade out greeting, then show streak info
      Animated.sequence([
        // Fade out current subtitle
        Animated.timing(subtitleFadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Show streak info
        setShowStreakInfo(true);
        
        // Fade in streak info
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
      
      // Fade in and scale up XP badge animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Fade out XP badge after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start();
      }, 3000);
      
      // Revert to greeting message after 4 seconds with fade animation
      setTimeout(() => {
        Animated.sequence([
          // Fade out streak info
          Animated.timing(subtitleFadeAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowStreakInfo(false);
          // Fade in greeting
          Animated.timing(subtitleFadeAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        });
      }, 4000);
    }
  }, [dailyLoginState, fadeAnim, scaleAnim, subtitleFadeAnim]);

  const containerClass = centerAlign
    ? "px-5 pb-3 flex-row items-start justify-center"
    : "px-5 pb-3 flex-row items-start justify-between";

  // Gradient from background color (top 90%) to transparent (bottom 10%)
  const gradientBackground = {
    paddingTop: insetEnabled ? insets.top : 15,
    experimental_backgroundImage: `linear-gradient(to bottom, ${theme.background} 0%, ${theme.background} 60%, transparent 100%)`,
  };

  return (
    <View className={containerClass} style={gradientBackground}>
      {(leftIconName || leftIconImage) && (
        <View className="-ml-2 rounded-lg bg-primary/10 overflow-hidden">
          {leftIconImage ? (
            <Image
              source={leftIconImage}
              style={{ width: 36, height: 36, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <View className="p-2">
              <SymbolView
                name={leftIconName!}
                size={28}
                tintColor={theme.foreground}
              />
            </View>
          )}
        </View>
      )}
      <View className={centerAlign ? "items-center" : "flex-1 ml-2"}>
        <Pressable
          onPress={toggleDropdown}
          disabled={!submenu || submenuItems.length === 0}
          className={submenu && submenuItems.length > 0 ? "flex-row items-center gap-1" : undefined}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-bold text-foreground">{displayTitle}</Text>
            {/* Dropdown indicator arrow */}
            {submenu && submenuItems.length > 0 && (
              <SymbolView
                name={isDropdownVisible ? "chevron.up" : "chevron.down"}
                size={14}
                tintColor={theme.foreground}
              />
            )}
            {/* Daily login loading indicator with spin animation */}
            {dailyLoginState?.isLoading && (
              <Animated.View
                style={{
                  transform: [{
                    rotate: spinAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }}
              >
                <View className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent" />
              </Animated.View>
            )}
          </View>
        </Pressable>
        
        {/* Dropdown Menu */}
        {submenu && isDropdownVisible && submenuItems.length > 0 && (
          <Modal
            transparent
            visible={isDropdownVisible}
            onRequestClose={() => setIsDropdownVisible(false)}
            animationType="none"
          >
            <Pressable
              className="flex-1"
              onPress={() => setIsDropdownVisible(false)}
              style={{ backgroundColor: 'transparent' }}
            >
              <View
                className="absolute bg-background dark:bg-muted rounded-lg shadow-lg border border-border"
                style={{
                  width: Dimensions.get('window').width - 60,
                  top: insets.top + 25,
                  left: 52,
                }}
                onStartShouldSetResponder={() => true}
              >
                {submenuItems.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSubmenuPress(item)}
                    className={`flex-row items-center gap-2 px-4 py-3 ${index === 0 ? 'rounded-t-lg' : ''} ${index === submenuItems.length - 1 ? 'rounded-b-lg' : ''} ${item.id === selectedSubmenuId ? 'bg-primary/10' : ''}`}
                  >
                    {item.thumbnail ? (
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={{ width: 28, height: 28, borderRadius: 6 }}
                        resizeMode="cover"
                      />
                    ) : item.icon ? (
                      <SymbolView
                        name={item.icon}
                        size={18}
                        tintColor={item.id === selectedSubmenuId ? theme.primary : theme.foreground}
                      />
                    ) : null}
                    <Text
                      className={`text-base flex-1 ${item.id === selectedSubmenuId ? 'text-primary font-semibold' : 'text-foreground'}`}
                    >
                      {item.label}
                    </Text>
                    {item.id === selectedSubmenuId && (
                      <SymbolView
                        name="checkmark"
                        size={16}
                        tintColor={theme.primary}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>
        )}
        
        {/* Dynamic subtitle: show streak info + XP badge after daily login, or greeting message */}
        <Animated.View style={{ opacity: subtitleFadeAnim }}>
          {showStreakInfo && dailyLoginState && !dailyLoginState.isLoading && dailyLoginState.streak !== undefined ? (
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-1">
                <SymbolView
                  name="flame.fill"
                  size={14}
                  tintColor="#FF6B35"
                />
                <Text className="text-muted-foreground text-sm">
                  {dailyLoginState.streak} day streak
                </Text>
              </View>
              {/* XP Earned Badge - inline with subtitle */}
              {dailyLoginState.xpEarned !== undefined && (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  }}
                  className="bg-primary px-2 py-0.5 rounded-full flex-row items-center gap-1"
                >
                  <SymbolView
                    name="star.fill"
                    size={12}
                    tintColor={theme.primaryForeground}
                  />
                  <Text className="text-primary-foreground font-semibold text-xs">
                    +{dailyLoginState.xpEarned} XP
                  </Text>
                  {dailyLoginState.streakMilestoneReached && (
                    <Text className="text-primary-foreground font-bold text-xs">🔥</Text>
                  )}
                </Animated.View>
              )}
            </View>
          ) : subtitle ? (
            <Text className="text-muted-foreground">{subtitle}</Text>
          ) : null}
        </Animated.View>
      </View>
      {rightIconName && (
        <Pressable
          onPress={onRightIconPress}
          className="p-2 mr-0 -mt-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SymbolView
            name={rightIconName}
            size={24}
            tintColor={theme.foreground}
          />
        </Pressable>
      )}
    </View>
  );
}