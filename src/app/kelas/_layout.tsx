import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';

export default function KelasLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: 'transparent' },
        headerLargeTitle: false,
        headerBlurEffect: 'none',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="[kelasid]"
        options={{
          title: 'Class Details',
        }}
      />
    </Stack>
  );
}