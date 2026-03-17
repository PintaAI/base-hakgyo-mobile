import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MenuHeaderProps {
  title: string;
  subtitle?: string;
}

export function MenuHeader({ title, subtitle }: MenuHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="px-4 bg-background/60 pb-3" style={{ paddingTop: insets.top - 12 }}>
      <Text className="text-2xl font-bold text-foreground">{title}</Text>
      {subtitle && (
        <Text className="text-muted-foreground">{subtitle}</Text>
      )}
    </View>
  );
}