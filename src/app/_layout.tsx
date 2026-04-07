import { KelasProvider } from '@/contexts/kelas-context';
import { useEASUpdate } from '@/hooks/use-eas-update';
import { usePushNotifications } from '@/hooks/use-notifications';
import { BASE_URL } from '@/lib/config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { AuthProvider, initSDK } from 'hakgyo-expo-sdk';
import React from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

// Initialize SDK
initSDK({
  baseURL: BASE_URL,
  auth: {
    storagePrefix: 'hakgyo_auth',
    sessionRefreshThreshold: 5,
    autoRefresh: true,
    deepLinkScheme: 'basehakgyomobile://',
  },
  api: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  logging: {
    enabled: true,
    level: 'error',
  },
  platform: {
    deviceId: `base-hakgyo-${Platform.OS}`,
    platformType: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
  },
});

// Configure Google Sign-In right after SDK initialization
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
});

// Component to handle notification registration
function NotificationHandler() {
  // This hook handles:
  // - Requesting notification permissions
  // - Getting Expo push token
  // - Registering token with Hakgyo backend
  // - Setting up notification listeners
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Initialize EAS Update check
  useEASUpdate();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <AuthProvider>
          <KelasProvider>
            <NotificationHandler />
            <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
                title: 'Sign In',
                presentation: 'formSheet',
                sheetGrabberVisible: true,
                sheetAllowedDetents: [0.5, 1.0],
                sheetExpandsWhenScrolledToEdge: false,
                ...(Platform.OS === 'android' && {
                  contentStyle: { backgroundColor: 'transparent' },
                }),
              }}
            />
            <Stack.Screen
              name="color"
              options={{
                headerShown: false,
                title: 'Colors',
                presentation: 'card',
                animation: 'ios_from_right',
              }}
            />
            <Stack.Screen
              name="notification"
              options={{
                headerShown: false,
                title: 'Notifications',
                presentation: 'card',
                animation: 'ios_from_right',
              }}
            />
            <Stack.Screen
              name="game"
              options={{
                headerShown: false,
                title: 'Game',
              animation: 'default',
              }}
            />
          </Stack>
          </KelasProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
