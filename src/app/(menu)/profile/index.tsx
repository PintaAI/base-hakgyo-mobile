import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="p-4">
        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-muted items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground">User Profile</Text>
          <Text className="mt-1 text-muted-foreground">user@example.com</Text>
        </View>

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