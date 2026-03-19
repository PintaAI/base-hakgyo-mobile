import { router } from 'expo-router';
import { useAuth } from 'hakgyo-expo-sdk';
import React, { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AuthCard } from '@/components/auth-card';

export default function AuthScreen() {
  const { user, session } = useAuth();
  const isAuthenticated = !!user && !!session;
  
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center p-2">
          <AuthCard
            title="Welcome to Hakgyo"
            subtitle="Sign in to access your learning materials"
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
