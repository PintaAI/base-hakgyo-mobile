import { Colors } from '@/constants/theme';
import { CustomTabBar } from '@/components/custom-tab-bar';
import { usePushNotifications } from '@/hooks/use-notifications';
import { Tabs } from 'expo-router';
import { useAuth } from 'hakgyo-expo-sdk';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Component to handle notification registration (only when authenticated)
function NotificationHandler() {
  const { user, session } = useAuth();
  const isAuthenticated = !!user && !!session;
  
  // Only register for push notifications when user is authenticated
  // This hook handles:
  // - Requesting notification permissions
  // - Getting Expo push token
  // - Registering token with Hakgyo backend
  // - Setting up notification listeners
  const { register, unregister } = usePushNotifications();
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[MenuLayout] User authenticated, registering for notifications');
      register();
    }
  }, [isAuthenticated, register]);
  
  return null;
}

export default function MenuLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <>
      <NotificationHandler />
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
    </>
  );
}