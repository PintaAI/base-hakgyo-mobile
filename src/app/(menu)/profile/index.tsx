import { useSession } from 'hakgyo-expo-sdk';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Background } from '@/components/themed-background';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfileScreen() {
  const { user } = useSession();

  // Format XP with commas
  const formatXP = (xp: number) => {
    return xp.toLocaleString();
  };

  return (
    <View className="flex-1 bg-background">
      <Background />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="p-4">
          <View className="items-center py-8">
            <Avatar size="xl" className="mb-4" alt={user?.name || 'User avatar'}>
              <AvatarImage source={{ uri: user?.image }} />
              <AvatarFallback name={user?.name} className="bg-primary" />
            </Avatar>
            <Text className="text-2xl font-bold text-foreground">
              {user?.name || 'User Profile'}
            </Text>
            <Text className="mt-1 text-muted-foreground">{user?.email || 'No email'}</Text>
            {user?.role && (
              <View className="mt-2 px-3 py-1 bg-primary/10 rounded-full">
                <Text className="text-xs font-medium text-primary">{user.role}</Text>
              </View>
            )}
          </View>

          {/* Stats Section */}
          {user && (
            <View className="flex-row justify-around py-4 border-y border-border">
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">{user.level}</Text>
                <Text className="text-sm text-muted-foreground">Level</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">{formatXP(user.xp)}</Text>
                <Text className="text-sm text-muted-foreground">XP</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">{user.currentStreak}</Text>
                <Text className="text-sm text-muted-foreground">Day Streak</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}