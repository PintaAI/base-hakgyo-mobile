import { Background, MenuHeader, UserStats } from '@/components';
import { useAuth } from 'hakgyo-expo-sdk';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';

export default function MenuScreen() {
  const { user } = useAuth();

  return (
    <View className="flex-1 ">
      <Background />
      <MenuHeader
        title="Hakgyo"
        subtitle={user?.name ? `안녕하세요, ${user.name}!` : '안녕하세요!'}
        leftIconImage={require('@/assets/images/favicon.png')}
      />
        <ScrollView
          className="flex-1 px-2 pt-5"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ gap: 5 }}
        >
          {user && (
            <UserStats
              streak={user.currentStreak ?? 0}
              bestStreak={user.longestStreak}
              level={user.level ?? 1}
              xp={user.xp ?? 0}
            />
          )}
          
        </ScrollView>
    
    </View>
  );
}