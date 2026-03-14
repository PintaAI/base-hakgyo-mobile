import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { router } from 'expo-router';
import { useAuth } from 'hakgyo-expo-sdk';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Background } from '@/components';

export default function HomeScreen() {
  const { user, session, signOut } = useAuth();

  const isAuthenticated = !!user && !!session;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleViewColors = () => {
    router.navigate('/color');
  };

  const handleGoToMenu = () => {
    router.navigate('/(menu)');
  };

  return (
    <View className="flex-1 bg-background">
      <Background />
      <View className="flex-1 p-4 justify-center items-center">
        <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
          <FontAwesome name="graduation-cap" size={40} color="#ffffff" />
        </View>
        <Text className="text-3xl font-bold text-foreground">
          Welcome!
        </Text>
        {isAuthenticated ? (
          <>
            <Text className="text-xl font-semibold text-foreground mt-2">
              {user?.name || 'User'}
            </Text>
            <Text className="text-base text-muted-foreground mt-1 opacity-70">
              {user?.email}
            </Text>

            <Pressable
              onPress={handleSignOut}
              className="mt-6 py-3 px-6 rounded-lg bg-secondary active:opacity-80 flex-row items-center gap-2"
            >
              <FontAwesome name="sign-out" size={16} color="#ffffff" />
              <Text className="text-center text-secondary-foreground font-medium">
                Sign Out
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-base text-muted-foreground mt-2">
              Please sign in to continue
            </Text>

            <Pressable
              onPress={handleSignIn}
              className="mt-6 py-3 px-6 w-full rounded-lg bg-primary active:opacity-80 flex-row items-center justify-center gap-2"
            >
              <FontAwesome name="sign-in" size={16} color="#ffffff" />
              <Text className="text-center text-primary-foreground font-medium">
                Sign In
              </Text>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={handleGoToMenu}
          className="mt-4 py-3 px-6 w-full bg-accent-foreground rounded-lg border border-accent active:opacity-80 flex-row items-center justify-center gap-2"
        >
          <FontAwesome name="bars" size={16} color="#4b5563" />
          <Text className="text-center text-accent font-medium">
            Go to Menu
          </Text>
        </Pressable>
        <Pressable
          onPress={handleViewColors}
          className="mt-4 py-3 px-6 w-full rounded-lg border bg-accent-foreground border-primary active:opacity-80 flex-row items-center justify-center gap-2"
        >
          <FontAwesome name="paint-brush" size={16} color="#374151" />
          <Text className="text-center text-primary font-medium">
            View Colors
          </Text>
        </Pressable>

      </View>
    </View>
  );
}