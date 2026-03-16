import { useSession } from 'hakgyo-expo-sdk';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useSession();

  // Get user initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format XP with commas
  const formatXP = (xp: number) => {
    return xp.toLocaleString();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="p-4">
        <View className="items-center py-8">
          <Avatar className="size-24 mb-4" alt={user?.name || 'User avatar'}>
            <AvatarImage source={{ uri: user?.image }} />
            <AvatarFallback>
              <Text className="text-3xl font-bold text-primary-foreground">
                {getInitials(user?.name)}
              </Text>
            </AvatarFallback>
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

        <View className="mt-4 gap-4">
          <View className="p-4 bg-muted rounded-lg">
            <Text className="text-lg font-semibold text-foreground">Account Settings</Text>
            <Text className="mt-1 text-muted-foreground">Manage your account preferences</Text>
          </View>

          <View className="p-4 bg-muted rounded-lg">
            <Text className="text-lg font-semibold text-foreground">Learning Progress</Text>
            <Text className="mt-1 text-muted-foreground">View your learning statistics</Text>
          </View>

          <View className="p-4 bg-muted rounded-lg">
            <Text className="text-lg font-semibold text-foreground">Notifications</Text>
            <Text className="mt-1 text-muted-foreground">Configure push notifications</Text>
          </View>

          <View className="p-4 bg-muted rounded-lg">
            <Text className="text-lg font-semibold text-foreground">Help & Support</Text>
            <Text className="mt-1 text-muted-foreground">Get help or report issues</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}