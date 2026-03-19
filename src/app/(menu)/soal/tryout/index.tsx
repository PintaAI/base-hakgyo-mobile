import { Background, MenuHeader } from '@/components';
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
    <View className="flex-1 ">
      <Background />
      <ScrollView
        className="flex-1 pt-5"
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
            <Pressable
              key={tryout.id}
              className="p-4 bg-card border border-border rounded-lg"
              onPress={() => handlePress(tryout.id)}
            >
              <Text className="text-foreground font-semibold">{tryout.nama}</Text>
              {tryout.description && (
                <Text className="text-muted-foreground text-sm mt-1">{tryout.description}</Text>
              )}
              <Text className="text-primary text-sm mt-2">
                Duration: {tryout.duration} mins
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}