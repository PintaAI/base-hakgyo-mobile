import React from 'react';
import { View, Text } from 'react-native';

export default function GameScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg font-semibold">Game Screen</Text>
      <Text className="text-muted-foreground mt-2">Path: /game</Text>
      <Text className="text-primary mt-4 text-center px-4">
        Segera datang: Game untuk belajar bahasa Korea
      </Text>
    </View>
  );
}