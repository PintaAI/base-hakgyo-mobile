import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VocabScreen() {
  const insets = useSafeAreaInsets();
  const vocabSets = [
    { id: '1', name: 'Basic Words', count: 50 },
    { id: '2', name: 'Advanced Vocabulary', count: 30 },
    { id: '3', name: 'Business English', count: 25 },
  ];

  const handlePress = (id: string) => {
    router.push({ pathname: '/(menu)/vocab/[id]' as const, params: { id } });
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="p-4">
        <Text className="text-2xl font-bold text-foreground">Vocabulary Sets</Text>
        <Text className="mt-2 text-muted-foreground">Select a vocabulary set to study</Text>
        
        <View className="mt-4">
          {vocabSets.map((set) => (
            <Pressable
              key={set.id}
              className="p-4 mb-3 bg-muted rounded-lg"
              onPress={() => handlePress(set.id)}
            >
              <Text className="text-lg font-semibold text-foreground">{set.name}</Text>
              <Text className="mt-1 text-muted-foreground">{set.count} words</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}