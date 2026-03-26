import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Kelas, kelasApi } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { HtmlRenderer } from '@/components/html-renderer';

const KELAS_LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#22c55e',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#ef4444',
};

const KELAS_TYPE_ICONS: Record<string, string> = {
  GRAMMAR: 'book',
  VOCABULARY: 'language',
  LISTENING: 'headphones',
  READING: 'glasses',
  SPEAKING: 'microphone',
  WRITING: 'pencil',
};

export default function KelasDetailScreen() {
  const { kelasid } = useLocalSearchParams<{ kelasid: string }>();
  const router = useRouter();
  const kelasId = Number(kelasid);
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kelasId) {
      fetchKelas();
    }
  }, [kelasId]);

  const fetchKelas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await kelasApi.get(kelasId);
      setKelas(response.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class');
      console.error('Error fetching kelas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-3 text-muted-foreground">Loading class...</Text>
      </View>
    );
  }

  if (error || !kelas) {
    return (
      <View className="flex-1 p-6 items-center justify-center">
        <View className="bg-card rounded-2xl border border-border p-6 items-center max-w-xs">
          <View className="w-14 h-14 rounded-full bg-error-muted items-center justify-center">
            <FontAwesome name="exclamation-circle" size={24} color="#ef4444" />
          </View>
          <Text className="mt-4 text-foreground text-lg font-semibold text-center">Unable to Load</Text>
          <Text className="mt-2 text-muted-foreground text-sm text-center">{error || 'Class not found'}</Text>
          <Pressable onPress={fetchKelas} className="mt-5 bg-primary px-6 py-3 rounded-xl">
            <Text className="text-primary-foreground font-semibold">Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const levelColor = KELAS_LEVEL_COLORS[kelas.level] || '#6b7280';
  const typeIcon = KELAS_TYPE_ICONS[kelas.type] || 'book';

  return (
    <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
        {/* Header Card - Combined with Stats, Author, and Members */}
        <View className="p-4">
          <View className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Thumbnail with Stats Overlay */}
            <View className="relative">
              {kelas.thumbnail ? (
                <Image source={{ uri: kelas.thumbnail }} className="w-full h-40" resizeMode="cover" />
              ) : (
                <View className="w-full h-32 bg-muted items-center justify-center">
                  <FontAwesome name={typeIcon as any} size={40} color="#6b7280" />
                </View>
              )}
              {/* Type Badge - Top Right Overlay */}
              <View className="absolute top-2 right-2 flex-row items-center gap-1 bg-black/60 rounded-full px-2 py-1">
                <FontAwesome name={typeIcon as any} size={9} color="#fff" />
                <Text className="text-[10px] text-white font-medium">{kelas.type}</Text>
              </View>
              {/* Stats - Bottom Right Overlay */}
              {kelas._count && (
                <View className="absolute bottom-2 right-2 flex-row items-center gap-2 bg-black/60 rounded-full px-2 py-1">
                  <View className="flex-row items-center gap-0.5">
                    <FontAwesome name="book" size={9} color="#fff" />
                    <Text className="text-[10px] text-white font-medium">{kelas._count.materis}</Text>
                  </View>
                  <View className="flex-row items-center gap-0.5">
                    <FontAwesome name="users" size={9} color="#fff" />
                    <Text className="text-[10px] text-white font-medium">{kelas._count.members}</Text>
                  </View>
                  <View className="flex-row items-center gap-0.5">
                    <FontAwesome name="trophy" size={9} color="#fff" />
                    <Text className="text-[10px] text-white font-medium">{kelas._count.completions}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Title & Badges */}
            <View className="p-4 pb-0">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-foreground text-xl font-bold" numberOfLines={2}>
                    {kelas.title}
                  </Text>
                  {kelas.author && (
                    <Text className="text-xs text-muted-foreground mt-1">by {kelas.author.name || 'Unknown'}</Text>
                  )}
                </View>
                {kelas.isPaidClass && (
                  <View className="bg-info-muted px-2 py-1 rounded ml-2">
                    <Text className="text-xs font-semibold text-info">Premium</Text>
                  </View>
                )}
              </View>

              {/* Badges Row */}
              <View className="flex-row items-center gap-2 mt-3 flex-wrap">
                <View className="flex-row items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: levelColor + '1a' }}>
                  <FontAwesome name="signal" size={10} color={levelColor} />
                  <Text className="text-xs font-semibold" style={{ color: levelColor }}>{kelas.level}</Text>
                </View>
                {kelas.isEnrolled && (
                  <View className="flex-row items-center gap-1 bg-success-muted px-2 py-1 rounded">
                    <FontAwesome name="check-circle" size={10} color="#16a34a" />
                    <Text className="text-xs font-semibold text-success">Enrolled</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              {kelas.htmlDescription && (
                <HtmlRenderer html={kelas.htmlDescription} />
              )}

              {/* Price */}
              {kelas.isPaidClass && kelas.price && (
                <View className="flex-row items-center gap-2 mt-3">
                  <FontAwesome name="tag" size={14} color="#374151" />
                  <Text className="text-foreground text-lg font-bold">{kelas.price}</Text>
                </View>
              )}
            </View>

            {/* Members Preview - Minimal */}
            {kelas.members && kelas.members.length > 0 && (
              <View className="px-4 pb-4">
                <View className="flex-row items-center">
                  {kelas.members.slice(0, 6).map((member, index) => (
                    <View
                      key={member.id}
                      className="w-7 h-7 rounded-full bg-primary/20 items-center justify-center border-2 border-card"
                      style={{ marginLeft: index > 0 ? -6 : 0 }}
                    >
                      <Text className="text-[10px] font-semibold text-primary">
                        {(member.name || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  ))}
                  {kelas.members.length > 6 && (
                    <View
                      className="w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-card"
                      style={{ marginLeft: -6 }}
                    >
                      <Text className="text-[10px] font-semibold text-primary-foreground">+{kelas.members.length - 6}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[10px] text-muted-foreground mt-2">
                  {kelas.members.slice(0, 2).map(m => m.name || 'Unknown').join(', ')}
                  {kelas.members.length > 2 && ` & ${kelas.members.length - 2} more`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Materials */}
        {kelas.materis && kelas.materis.length > 0 && (
          <View className="px-4 py-2">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Materials ({kelas.materis.length})
            </Text>
            <View className="bg-card rounded-xl border border-border overflow-hidden">
              {kelas.materis.map((materi, index) => (
                <Pressable
                  key={materi.id}
                  onPress={() => router.push(`/kelas/${kelasId}/${materi.id}`)}
                  className={`flex-row items-center gap-3 p-3 active:bg-muted/50 ${index < kelas.materis!.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <View className={`w-8 h-8 rounded-lg items-center justify-center ${materi.isDemo ? 'bg-info-muted' : 'bg-muted'}`}>
                    <FontAwesome name={materi.isDemo ? 'play' : 'lock'} size={12} color={materi.isDemo ? '#2563eb' : '#6b7280'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground text-sm font-medium" numberOfLines={1}>{materi.title}</Text>
                    <Text className="text-xs text-muted-foreground">Order: {materi.order}</Text>
                  </View>
                  {materi.isDemo && (
                    <View className="bg-info-muted px-2 py-0.5 rounded">
                      <Text className="text-xs font-semibold text-info">FREE</Text>
                    </View>
                  )}
                  <FontAwesome name="chevron-right" size={12} color="#6b7280" />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
  );
}