import { Colors } from '@/constants/theme';
import { CustomTabBar } from '@/components/custom-tab-bar';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function MenuLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="vocab"
        options={{
          title: 'kosa-kata',
        }}
      />
      <Tabs.Screen
        name="soal"
        options={{
          title: 'Soal',
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}