import { Background } from '@/components';
import { DailyVocab } from '@/components/daily-vocab';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function MenuScreen() {
  return (
    <View className="flex-1">
      <Background />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <View className="justify-center items-center">
          <Text className="text-3xl font-bold text-foreground">Menu</Text>
          <Text className="mt-2 text-muted-foreground">Welcome to the menu screen</Text>
        </View>
        <View className="mt-6">
          <DailyVocab take={5} />
        </View>
      </ScrollView>
    </View>
  );
}