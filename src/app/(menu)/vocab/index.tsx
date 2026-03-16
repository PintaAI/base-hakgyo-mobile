import { Background } from '@/components';
import { VocabSetCard } from '@/components/vocab-set-card';
import { router } from 'expo-router';
import { vocabularyApi, VocabularySet } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

export default function VocabScreen() {
  const [vocabSets, setVocabSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVocabSets();
  }, []);

  const fetchVocabSets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vocabularyApi.listSets({ limit: 50 });
      console.log('API Response:', JSON.stringify(response, null, 2));
      setVocabSets(response?.data ?? []);
    } catch (err) {
      setError('Failed to load vocabulary sets');
      console.error('Error fetching vocab sets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (id: number) => {
    router.push({ pathname: '/(menu)/vocab/[id]' as const, params: { id: String(id) } });
  };

  return (
    <View className="flex-1 bg-background">
      <Background />
      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-foreground">Vocabulary Sets</Text>
        <Text className="text-muted-foreground">Select a vocabulary set to study</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {loading ? (
          <ActivityIndicator size="large" className="mt-8" />
        ) : error ? (
          <View className="gap-2">
            <Text className="text-destructive">{error}</Text>
            <Pressable
              className="p-2 bg-primary rounded-lg"
              onPress={fetchVocabSets}
            >
              <Text className="text-primary-foreground text-center">Retry</Text>
            </Pressable>
          </View>
        ) : vocabSets.length === 0 ? (
          <Text className="text-muted-foreground">No vocabulary sets available</Text>
        ) : (
          vocabSets.map((set) => (
            <VocabSetCard key={set.id} set={set} onPress={handlePress} />
          ))
        )}
      </ScrollView>
    </View>
  );
}