import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { View } from '@/components/view';
import { router } from 'expo-router';
import { useAuth } from 'hakgyo-expo-sdk';
import React from 'react';

export default function HomeScreen() {
  const { user, session, signOut } = useAuth();

  const isAuthenticated = !!user && !!session;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleViewColors = () => {
    router.push('/color');
  };

  return (
    <View flex={1} >
      <View flex={1} padding={16} justifyContent='center'>
        <Text type="title">Welcome!</Text>
        {isAuthenticated ? (
          <>
            <Text type="subtitle" marginTop={8}>
              {user?.name || 'User'}
            </Text>
            <Text marginTop={4} style={{ opacity: 0.7 }}>
              {user?.email}
            </Text>

            <Button
              title="Sign Out"
              variant="secondary"
              onPress={handleSignOut}
              marginTop={24}
            />
          </>
        ) : (
          <>
            <Text marginTop={8}>Please sign in to continue</Text>

            <Button
              title="Sign In"
              variant="primary"
              onPress={handleSignIn}
              marginTop={24}
            />

            <Button
              title="View Colors"
              variant="outline"
              onPress={handleViewColors}
              marginTop={24}
            />
          </>
        )}
      </View>
    </View>
  );
}