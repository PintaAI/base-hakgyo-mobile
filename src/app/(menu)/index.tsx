import { Background, MenuHeader } from '@/components';
import { DailyVocab } from '@/components/daily-vocab';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function MenuScreen() {
  return (
    <View className="flex-1 ">
      <Background />
      <MenuHeader title="Home" subtitle="Welcome back!" />
        <ScrollView
          className="flex-1 pt-5"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ gap: 5 }}
        >
          <DailyVocab take={5} />
        </ScrollView>
    
    </View>
  );
}