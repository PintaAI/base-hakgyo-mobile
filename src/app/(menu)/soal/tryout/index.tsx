import { TryoutCard } from '@/components';
import { router } from 'expo-router';
import { Tryout, tryoutApi, useAuth } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

export default function TryoutScreen() {
  const { user } = useAuth();
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTryouts();
  }, [user?.id]);

  const fetchTryouts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await tryoutApi.list({ limit: 50 });
      setTryouts(response?.data ?? []);
    } catch (err) {
      setError('Failed to load tryouts');
      console.error('Error fetching tryouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (id: number) => {
    // Type assertion needed until expo-router regenerates types for new route
    router.push({ pathname: '/(menu)/soal/tryout/[tryoutId]' as never, params: { tryoutId: String(id) } });
  };

  return (
    <View className="flex-1">
      <View className="px-4 pt-4 pb-2 items-center">
        <Text className="text-2xl font-bold text-foreground">Tryout</Text>
      </View>
      <ScrollView
        className="flex-1 p-3"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ gap: 5 }}
      >
        {loading ? (
          <ActivityIndicator size="large" className="mt-8" />
        ) : !user?.id ? (
          <View className="p-5 bg-card items-center border border-border rounded-lg mt-4">
            <Text className="text-sm text-muted-foreground mb-3">Please sign in to access tryouts</Text>
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
              onPress={fetchTryouts}
            >
              <Text className="text-primary-foreground text-center">Retry</Text>
            </Pressable>
          </View>
        ) : tryouts.length === 0 ? (
          <Text className="text-muted-foreground">No tryouts available</Text>
        ) : (
          tryouts.map((tryout) => (
            <TryoutCard key={tryout.id} tryout={tryout} onPress={handlePress} />
          ))
        )}
      </ScrollView>
    </View>
  );
}