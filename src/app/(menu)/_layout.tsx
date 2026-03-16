import { Colors } from '@/constants/theme';
import EvilIcons from '@react-native-vector-icons/evil-icons';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function MenuLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={20} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vocab"
        options={{
          title: 'Vocabulary',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="book" size={20} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <EvilIcons name="user" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}