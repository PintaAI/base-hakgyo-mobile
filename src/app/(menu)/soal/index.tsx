import { Background, MenuHeader } from '@/components';
import { KoleksiSoalCard } from '@/components/koleksi-soal-card';
import { router } from 'expo-router';
import { KoleksiSoal, soalApi, useAuth } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import 'expo-symbols';

export default function soalScreen() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<KoleksiSoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, [user?.id]);

  const fetchCollections = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await soalApi.listCollections({ limit: 50 });
      setCollections(response?.data ?? []);
    } catch (err) {
      setError('Failed to load question collections');
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (id: number) => {
    // Type assertion needed until expo-router regenerates types for new route
    router.push({ pathname: '/(menu)/soal/[practiceId]' as never, params: { practiceId: String(id) } });
  };

  return (
    <View className="flex-1">
      <Background />
      <MenuHeader
        title="Bank Soal"
        subtitle="Seluruh koleksi soal yang tersedia untuk latihan"
        rightIconName="timer"
        onRightIconPress={() => router.push('/(menu)/soal/tryout' as never)}
      />
        <ScrollView
          className="flex-1 px-2 pt-5"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ gap: 5 }}
        >
        {loading ? (
          <ActivityIndicator size="large" className="mt-8" />
        ) : !user?.id ? (
          <View className="p-5 bg-card items-center border border-border rounded-lg mt-4">
            <Text className="text-sm text-muted-foreground mb-3">Please sign in to access question banks</Text>
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
              onPress={fetchCollections}
            >
              <Text className="text-primary-foreground text-center">Retry</Text>
            </Pressable>
          </View>
        ) : collections.length === 0 ? (
          <Text className="text-muted-foreground">No question collections available</Text>
        ) : (
          collections.map((collection) => (
            <KoleksiSoalCard key={collection.id} collection={collection} onPress={handlePress} />
          ))
        )}
        </ScrollView>
    
    </View>
  );
}