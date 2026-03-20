import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

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
}

export function MenuHeader({
  title,
  subtitle,
  leftIconName,
  leftIconImage,
  rightIconName,
  onRightIconPress,
  insetEnabled = true,
  centerAlign = false
}: MenuHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const containerClass = centerAlign
    ? "px-5 bg-background dark:bg-muted pb-3 flex-row items-start justify-center"
    : "px-5 bg-background dark:bg-muted pb-3 flex-row items-start justify-between";

  return (
    <View className={containerClass} style={{ paddingTop: insetEnabled ? insets.top : 15 }}>
      {(leftIconName || leftIconImage) && (
        <View className="p-2 -ml-2">
          {leftIconImage ? (
            <Image
              source={leftIconImage}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : (
            <SymbolView
              name={leftIconName!}
              size={24}
              tintColor={theme.foreground}
            />
          )}
        </View>
      )}
      <View className={centerAlign ? "items-center" : "flex-1"}>
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-muted-foreground">{subtitle}</Text>
        )}
      </View>
      {rightIconName && (
        <Pressable
          onPress={onRightIconPress}
          className="p-2 -mr-2"
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