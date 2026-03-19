import { Colors } from '@/constants/theme';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MenuHeaderProps {
  title: string;
  subtitle?: string;
  rightIconName?: SFSymbol;
  onRightIconPress?: () => void;
}

export function MenuHeader({
  title,
  subtitle,
  rightIconName,
  onRightIconPress
}: MenuHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="px-4 bg-background/60 pb-3 flex-row items-start justify-between" style={{ paddingTop: insets.top  }}>
      <View className="flex-1">
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
            tintColor={Colors.light.foreground}
          />
        </Pressable>
      )}
    </View>
  );
}