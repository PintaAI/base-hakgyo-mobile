import { useTheme } from '@/hooks/use-theme';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
  type LucideIcon
} from 'lucide-react-native';
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
  icon?: LucideIcon;
  thumbnail?: string;
}

interface MenuHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: LucideIcon;
  leftIconImage?: ImageSourcePropType;
  rightIcon?: LucideIcon;
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
  leftIcon: LeftIcon,
  leftIconImage,
  rightIcon: RightIcon,
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
      {(LeftIcon || leftIconImage) && (
        <View className="-ml-2 rounded-lg bg-primary/10 overflow-hidden">
          {leftIconImage ? (
            <Image
              source={leftIconImage}
              style={{ width: 42, height: 42, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : LeftIcon ? (
            <View className="p-2">
              <LeftIcon
                size={28}
                color={theme.foreground}
              />
            </View>
          ) : null}
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
              isDropdownVisible ? (
                <ChevronUp size={14} color={theme.foreground} />
              ) : (
                <ChevronDown size={14} color={theme.foreground} />
              )
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
                      <View
                        className="items-center justify-center"
                        style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: `${theme.primary}10` }}
                      >
                        <item.icon
                          size={18}
                          color={item.id === selectedSubmenuId ? theme.primary : theme.foreground}
                        />
                      </View>
                    ) : null}
                    <Text
                      className={`text-base flex-1 ${item.id === selectedSubmenuId ? 'text-primary font-semibold' : 'text-foreground'}`}
                    >
                      {item.label}
                    </Text>
                    {item.id === selectedSubmenuId && (
                      <Check size={16} color={theme.primary} />
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
                <Flame size={14} color="#FF6B35" />
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
                  <Star size={12} color={theme.primaryForeground} fill={theme.primaryForeground} />
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
      {RightIcon && (
        <Pressable
          onPress={onRightIconPress}
          className="p-2 mr-0 -mt-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <RightIcon
            size={24}
            color={theme.foreground}
          />
        </Pressable>
      )}
    </View>
  );
}