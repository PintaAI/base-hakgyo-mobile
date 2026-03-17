import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { AuthProvider, initSDK } from 'hakgyo-expo-sdk';
import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import "../global.css";
import { BASE_URL } from '@/lib/config';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
   
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
              title: 'Sign In',
              presentation: 'formSheet',
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.5, 1.0],
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
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
