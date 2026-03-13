import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { useAuth } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AuthCard } from '@/components/auth-card';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function AuthScreen() {
  const { user, session } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthenticated = !!user && !!session;

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = (user: any) => {
    Alert.alert('Success', 'You have been signed in successfully!');
    router.replace('/');
  };

  const handleAuthError = (error: Error) => {
    Alert.alert('Sign In Error', error.message);
  };

  if (!isInitialized) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <AuthCard
          title="Welcome to Hakgyo"
          subtitle="Sign in to access your learning materials"
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
  },
});
