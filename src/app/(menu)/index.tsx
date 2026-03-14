import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyVocab } from '@/components/daily-vocab';
export default function MenuScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"   
    >
      <View className="flex-1 p-4">
        <View className="flex-1 justify-center items-center">
          <Text className="text-3xl font-bold text-foreground">Menu</Text>
          <Text className="mt-2 text-muted-foreground">Welcome to the menu screen</Text>
        </View>
        <View className="mt-6">
          <DailyVocab take={5} />
        </View>
      </View>
    </ScrollView>
  );
}