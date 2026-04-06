import { router } from 'expo-router';
import { useAuth } from 'hakgyo-expo-sdk';
import React, { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { AuthCard } from '@/components/auth-card';

export default function AuthScreen() {
  const { user, session } = useAuth();
  const isAuthenticated = !!user && !!session;
  
  const sheetStyle = Platform.OS === 'android'
    ? { borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' as const }
    : undefined;
  
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
      <View className="flex-1 bg-background" style={sheetStyle}>
        {/* Custom grabber for Android */}
        {Platform.OS === 'android' && (
          <View className="items-center pt-3 pb-1" collapsable={false}>
            <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </View>
        )}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
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
      </View>
    </KeyboardAvoidingView>
  );
}
