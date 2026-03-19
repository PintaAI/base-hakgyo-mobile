import { useLocalSearchParams } from 'expo-router';
import { KoleksiSoal, Soal, soalApi } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

export default function PracticeDetailScreen() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();
  const collectionId = Number(practiceId);
  const [collection, setCollection] = useState<KoleksiSoal | null>(null);
  const [questions, setQuestions] = useState<Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (collectionId) {
      fetchData();
    }
  }, [collectionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the collection details
      const collectionResponse = await soalApi.getCollection(collectionId);
      setCollection(collectionResponse.data || null);

      // Fetch questions in the collection
      const questionsResponse = await soalApi.listQuestions({
        koleksiSoalId: String(collectionId),
        limit: 100,
      });
      setQuestions(questionsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load question collection');
      console.error('Error fetching soal:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-2 text-muted-foreground">Loading question collection...</Text>
      </View>
    );
  }

  if (error || !collection) {
    return (
      <View className="flex-1 p-6">
        <Text className="text-destructive">{error || 'Question collection not found'}</Text>
        <Pressable
          className="mt-4 p-3 bg-primary rounded-lg"
          onPress={fetchData}
        >
          <Text className="text-primary-foreground text-center">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const rawData = {
    collection,
    questions,
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-6 pb-4" collapsable={false}>
        <Text className="text-foreground text-2xl font-bold">{collection.nama}</Text>
        {collection.deskripsi && (
          <Text className="mt-1 text-muted-foreground">{collection.deskripsi}</Text>
        )}
        <Text className="text-sm text-primary mt-2">
          {questions.length} questions
        </Text>
      </View>

      {/* Raw JSON Data */}
      <ScrollView
        className="flex-1 px-4 border-t border-border"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="bg-card p-4 rounded-lg border border-border mt-4">
          <Text className="text-sm font-semibold text-foreground mb-2">Raw JSON Data:</Text>
          <Text className="text-xs text-muted-foreground font-mono">
            {JSON.stringify(rawData, null, 2)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}