import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export const unstable_screenOptions = {
  href: null,
};

export default function VocabDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Sample vocabulary data (in real app, this would come from a database/API)
  const vocabWords = [
    { id: '1', word: 'Hello', meaning: '안녕하세요' },
    { id: '2', word: 'World', meaning: '세계' },
    { id: '3', word: 'Study', meaning: '공부' },
    { id: '4', word: 'Language', meaning: '언어' },
    { id: '5', word: 'Book', meaning: '책' },
  ];

  return (
    <View className="flex-1 p-6 mt-3">
      <View className="mb-4">
        <Text className=" text-foreground text-2xl font-bold">Vocabulary Set #{id}</Text>
        <Text className="mt-1 text-muted-foreground opacity-70">{vocabWords.length} words</Text>
      </View>

      <View className="flex-1">
        {vocabWords.map((item) => (
          <Pressable
            key={item.id}
            className="p-4 mb-3"
          >
            <Text className="text-lg text-primary font-semibold">{item.word}</Text>
            <Text className="mt-1 text-foreground opacity-60">{item.meaning}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}