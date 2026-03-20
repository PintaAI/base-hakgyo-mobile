import { useLocalSearchParams } from 'expo-router';
import { KoleksiSoal, Soal, soalApi } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { MenuHeader } from '@/components/menu-header';
import { QuizViewer } from '@/components/quiz-viewer';

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

  // Truncate description to single line
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <MenuHeader
        title={collection.nama}
        subtitle={collection.deskripsi ? truncateText(collection.deskripsi) : `${questions.length} questions`}
        insetEnabled={false}
        centerAlign={true}
      />

      {/* Quiz Viewer */}
      <View className="flex-1 bg-background p-0  border-border overflow-visible">
        <QuizViewer questions={questions} />
      </View>
    </View>
  );
}