import { MenuHeader } from '@/components';
import { ScrollView, Text, View } from 'react-native';

export default function NotificationScreen() {
  return (
    <View className="flex-1">
      <MenuHeader title="Notifications" />
      <ScrollView className="flex-1 p-4">
        <Text className="text-muted-foreground">
          this is notif modal texts
        </Text>
      </ScrollView>
    </View>
  );
}