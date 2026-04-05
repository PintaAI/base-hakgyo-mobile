import { Background, MenuHeader } from '@/components';
import { KoleksiSoalCard, KoleksiSoalCardSkeleton } from '@/components/koleksi-soal-card';
import { useKelas } from '@/contexts/kelas-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import 'expo-symbols';
import { KoleksiSoal, soalApi, useAuth } from 'hakgyo-expo-sdk';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

export default function soalScreen() {
  const { user } = useAuth();
  const { selectedKelas } = useKelas();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'unspecified' ? 'light' : colorScheme];
  const [collections, setCollections] = useState<KoleksiSoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCollections = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await soalApi.listCollections({
        limit: 50,
        kelasId: selectedKelas?.id ? String(selectedKelas.id) : undefined
      });
      setCollections(response?.data ?? []);
    } catch (err) {
      setError('Failed to load question collections');
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedKelas?.id]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  }, [fetchCollections]);

  const handlePress = (id: number) => {
    // Type assertion needed until expo-router regenerates types for new route
    router.push({ pathname: '/(menu)/soal/[practiceId]' as never, params: { practiceId: String(id) } });
  };

  return (
    <View className="flex-1">
      <Background />
      <MenuHeader
        title="Bank Soal"
        subtitle={selectedKelas ? `Dari kelas ${selectedKelas.title}` : 'Seluruh koleksi soal yang tersedia untuk latihan'}
        leftIconName="doc.text"
        rightIconName="timer"
        onRightIconPress={() => router.push('/(menu)/soal/tryout' as never)}
      />
      <ScrollView
        className="flex-1 px-2 pt-5"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ flexGrow: 1, gap: 5 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {loading ? (
          <View className="gap-2">
            <KoleksiSoalCardSkeleton />
            <KoleksiSoalCardSkeleton />
            <KoleksiSoalCardSkeleton />
          </View>
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