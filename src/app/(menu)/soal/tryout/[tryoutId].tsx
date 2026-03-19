import { useLocalSearchParams } from 'expo-router';
import { Tryout, tryoutApi } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

export default function TryoutDetailScreen() {
  const { tryoutId } = useLocalSearchParams<{ tryoutId: string }>();
  const id = Number(tryoutId);
  const [tryout, setTryout] = useState<Tryout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTryout();
    }
  }, [id]);

  const fetchTryout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the tryout details
      const response = await tryoutApi.get(id);
      setTryout(response.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tryout');
      console.error('Error fetching tryout:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-2 text-muted-foreground">Loading tryout...</Text>
      </View>
    );
  }

  if (error || !tryout) {
    return (
      <View className="flex-1 p-6">
        <Text className="text-destructive">{error || 'Tryout not found'}</Text>
        <Pressable
          className="mt-4 p-3 bg-primary rounded-lg"
          onPress={fetchTryout}
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
        <Text className="text-foreground text-2xl font-bold">{tryout.nama}</Text>
        {tryout.description && (
          <Text className="mt-1 text-muted-foreground">{tryout.description}</Text>
        )}
        <Text className="text-sm text-primary mt-2">
          Duration: {tryout.duration} mins | Passing Score: {tryout.passingScore}
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
            {JSON.stringify(tryout, null, 2)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}