import { Background, MenuHeader } from '@/components';
import { VocabSetCard } from '@/components/vocab-set-card';
import { router } from 'expo-router';
import { useAuth, vocabularyApi, VocabularySet } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

export default function VocabScreen() {
  const { user } = useAuth();
  const [vocabSets, setVocabSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVocabSets();
  }, [user?.id]);

  const fetchVocabSets = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await vocabularyApi.listSets({ limit: 50 });
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
    <View className="flex-1 ">
      <Background />
      <MenuHeader title="Vocabulary" subtitle="Select a vocabulary set to study" />
        <ScrollView
          className="flex-1 px-2 pt-5"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ gap: 5 }}
        >
        {loading ? (
          <ActivityIndicator size="large" className="mt-8" />
        ) : !user?.id ? (
          <View className="p-5 bg-card items-center border border-border rounded-lg mt-4">
            <Text className="text-sm text-muted-foreground mb-3">Please sign in to access vocabulary sets</Text>
            <Pressable
              onPress={() => router.push('/auth')}
              className="bg-primary px-4 py-3 rounded-lg"
            >
              <Text className="text-primary-foreground font-medium text-center">Sign In</Text>
            </Pressable>
          </View>
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