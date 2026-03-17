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
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vocab"
        options={{
          title: 'Vocabulary',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="book" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="soal"
        options={{
          title: 'Soal',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="question-circle" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <EvilIcons name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}