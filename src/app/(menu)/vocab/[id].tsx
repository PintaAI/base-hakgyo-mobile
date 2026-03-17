import { useLocalSearchParams } from 'expo-router';
import { vocabularyApi, VocabularyItem, VocabularySet } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

export default function VocabDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setId = Number(id);
  const [vocabSet, setVocabSet] = useState<VocabularySet | null>(null);
  const [vocabItems, setVocabItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    if (setId) {
      fetchVocabSet();
    }
  }, [setId]);

  const fetchVocabSet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the vocabulary set
      const setResponse = await vocabularyApi.getSet(setId);
      setVocabSet(setResponse.data || null);

      // Fetch items in the set
      const itemsResponse = await vocabularyApi.listItems({
        collectionId: String(setId),
        limit: 100,
      });
      setVocabItems(itemsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary set');
      console.error('Error fetching vocab set:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (itemId: number) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-2 text-muted-foreground">Loading vocabulary set...</Text>
      </View>
    );
  }

  if (error || !vocabSet) {
    return (
      <View className="flex-1 p-6">
        <Text className="text-destructive">{error || 'Vocabulary set not found'}</Text>
        <Pressable
          className="mt-4 p-3 bg-primary rounded-lg"
          onPress={fetchVocabSet}
        >
          <Text className="text-primary-foreground text-center">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-6 pb-4" collapsable={false}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-foreground text-2xl font-bold">{vocabSet.title}</Text>
            {vocabSet.description && (
              <Text className="mt-1 text-muted-foreground">{vocabSet.description}</Text>
            )}
          </View>
          <Text className="text-sm text-muted-foreground ml-2">
            {vocabItems.length} words
          </Text>
        </View>
        {vocabSet.learnedCount !== undefined && vocabSet.itemCount !== undefined && (
          <Text className="text-sm text-primary mt-3">
            {vocabSet.learnedCount}/{vocabSet.itemCount} learned
          </Text>
        )}
      </View>

      {/* Vocabulary Items */}
      <ScrollView
        className="flex-1 px-4 border-t border-border pt-2"
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
      >
        {vocabItems.length === 0 ? (
          <Text className="text-muted-foreground text-center mt-8">
            No vocabulary items in this set
          </Text>
        ) : (
          vocabItems.map((item) => {
            const isExpanded = expandedItem === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => toggleExpand(item.id)}
                className="p-4 bg-accent-foreground/50 rounded-lg border border-border"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {item.korean}
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      {item.indonesian}
                    </Text>
                  </View>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                  <View className="mt-3 pt-3 border-t border-border">
                    {item.type && (
                      <Text className="text-xs text-muted-foreground">
                        Type: {item.type}
                      </Text>
                    )}
                    {item.pos && (
                      <Text className="text-xs text-muted-foreground">
                        Part of Speech: {item.pos}
                      </Text>
                    )}
                    {item.exampleSentences && item.exampleSentences.length > 0 && (
                      <View className="mt-2">
                        <Text className="text-xs text-muted-foreground">Examples:</Text>
                        {item.exampleSentences.map((sentence, idx) => (
                          <Text key={idx} className="text-sm text-foreground mt-1">
                            • {sentence}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}