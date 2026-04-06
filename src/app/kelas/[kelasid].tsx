import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Kelas, kelasApi } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HtmlRenderer } from '@/components/html-renderer';
import { Background } from '@/components/themed-background';
import { useKelas } from '@/contexts/kelas-context';
import { useTheme } from '@/hooks/use-theme';

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
  const { setSelectedKelas } = useKelas();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const kelasId = Number(kelasid);
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMateri, setShowMateri] = useState(false);

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
      console.log('API Response:', JSON.stringify(response, null, 2));
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
      <View className="flex-1 items-center justify-center" style={{ paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-3 text-muted-foreground">Loading class...</Text>
      </View>
    );
  }

  if (error || !kelas) {
    return (
      <View className="flex-1 p-6 items-center justify-center" style={{ paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>
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

  // Navigate to soal/vocab with kelas selection
  const handleNavigateToSoal = () => {
    setSelectedKelas(kelas);
    router.push('/(menu)/soal');
  };

  const handleNavigateToVocab = () => {
    setSelectedKelas(kelas);
    router.push('/(menu)/vocab');
  };

  const toggleShowMateri = () => {
    setShowMateri(prev => !prev);
  };

  return (
    <View className="flex-1" style={{ paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>
      <Background />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}
      >
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
              {/* Members Preview - Bottom Left Overlay */}
              {kelas.members && kelas.members.length > 0 && (
                <View className="absolute bottom-2 left-2">
                  <View className="flex-row items-center">
                    {kelas.members.slice(0, 3).map((member, index) => (
                      <View
                        key={member.id}
                        className="w-5 h-5 rounded-full bg-white/90 items-center justify-center border border-white"
                        style={{ marginLeft: index > 0 ? -6 : 0 }}
                      >
                        <Text className="text-[7px] font-semibold text-primary">
                          {(member.name || 'U')[0].toUpperCase()}
                        </Text>
                      </View>
                    ))}
                    {kelas.members.length > 2 && (
                      <View
                        className="w-5 h-5 rounded-full bg-primary items-center justify-center border border-white"
                        style={{ marginLeft: -6 }}
                      >
                        <Text className="text-[7px] font-semibold text-primary-foreground">+{kelas.members.length - 2}</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[8px] text-white font-medium mt-1 bg-black/50 px-1 rounded">
                    {kelas.members.slice(0, 2).map(m => m.name || 'Unknown').join(', ')}
                    {kelas.members.length > 2 && ` +${kelas.members.length - 2}`}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats & Progress Bar - Below Thumbnail */}
            {kelas._count && (
              <View className="px-4 pt-3 bg-card">
                {/* Stats Row */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <FontAwesome name="book" size={12} color="#6b7280" />
                      <Text className="text-xs text-muted-foreground">{kelas._count.materis} materials</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <FontAwesome name="users" size={12} color="#6b7280" />
                      <Text className="text-xs text-muted-foreground">{kelas._count.members} members</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <FontAwesome name="trophy" size={12} color="#f59e0b" />
                    <Text className="text-xs font-semibold text-foreground">{kelas._count.completions} completed</Text>
                  </View>
                </View>
                {/* Progress Bar */}
                <View className="flex-row items-center gap-2">
                  <View className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <View
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${kelas._count.materis > 0
                          ? Math.min((kelas._count.completions / kelas._count.materis) * 100, 100)
                          : 0}%`
                      }}
                    />
                  </View>
                  <Text className="text-xs font-semibold text-primary">
                    {kelas._count.materis > 0
                      ? Math.round((kelas._count.completions / kelas._count.materis) * 100)
                      : 0}%
                  </Text>
                </View>
              </View>
            )}

            {/* Title & Badges - Merged */}
            <View className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text className="text-foreground text-lg font-bold shrink-0" numberOfLines={1}>
                      {kelas.title}
                    </Text>
                    {/* Level Badge */}
                    <View className="flex-row items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: levelColor + '1a' }}>
                      <FontAwesome name="signal" size={8} color={levelColor} />
                      <Text className="text-[10px] font-semibold" style={{ color: levelColor }}>{kelas.level}</Text>
                    </View>
                    {/* Enrolled Badge */}
                    {kelas.isEnrolled && (
                      <View className="flex-row items-center gap-1 bg-success-muted px-2 py-0.5 rounded">
                        <FontAwesome name="check-circle" size={8} color="#16a34a" />
                        <Text className="text-[10px] font-semibold text-success">Enrolled</Text>
                      </View>
                    )}
                  </View>
                  {kelas.author && (
                    <Text className="text-xs text-muted-foreground">by {kelas.author.name || 'Unknown'}</Text>
                  )}
                </View>
                {kelas.isPaidClass && (
                  <View className="bg-info-muted px-2 py-1 rounded">
                    <Text className="text-xs font-semibold text-info">Premium</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              {kelas.description && (
                <View className="mt-3">
                  <Text className="text-sm text-foreground leading-relaxed">
                    {kelas.description}
                  </Text>
                </View>
              )}

              {/* Price */}
              {kelas.isPaidClass && kelas.price && (
                <View className="flex-row items-center gap-2 mt-3">
                  <FontAwesome name="tag" size={14} color="#374151" />
                  <Text className="text-foreground text-lg font-bold">{kelas.price}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Soal, Vocab & Materi Toggle Buttons */}
        <View className="px-4 py-2">
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleNavigateToSoal}
              className="flex-1 flex-row items-center justify-center gap-1 bg-primary rounded-xl py-3 active:opacity-80"
            >
              <FontAwesome name="pencil-square" size={14} color={theme.primaryForeground} />
              <Text className="text-primary-foreground text-sm font-semibold">Soal</Text>
            </Pressable>
            <Pressable
              onPress={handleNavigateToVocab}
              className="flex-1 flex-row items-center justify-center gap-1 bg-primary rounded-xl py-3 active:opacity-80"
            >
              <FontAwesome name="book" size={14} color={theme.primaryForeground} />
              <Text className="text-primary-foreground text-sm font-semibold">Kosa-kata</Text>
            </Pressable>
            {kelas.materis && kelas.materis.length > 0 && (
              <Pressable
                onPress={toggleShowMateri}
                className={`flex-1 flex-row items-center justify-center gap-1 rounded-xl py-3 active:opacity-80 ${showMateri ? 'bg-secondary' : 'bg-primary'}`}
              >
                <FontAwesome name={showMateri ? 'chevron-up' : 'list'} size={14} color={showMateri ? theme.secondaryForeground : theme.primaryForeground} />
                <Text className={`text-sm font-semibold ${showMateri ? 'text-secondary-foreground' : 'text-primary-foreground'}`}>
                  {showMateri ? 'Tutup' : 'Materi'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Materials */}
        {showMateri && kelas.materis && kelas.materis.length > 0 && (
          <View className="px-4 py-2">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Materials ({kelas.materis.length})
            </Text>
            <View className="bg-card rounded-xl border border-border overflow-hidden">
              {kelas.materis.map((materi, index) => (
                <Pressable
                  key={materi.id}
                  onPress={() => {
                    if (materi.isAccessible || materi.isDemo) {
                      router.push(`/kelas/${kelasId}/${materi.id}`);
                    }
                  }}
                  className={`flex-row items-center gap-3 p-3 ${materi.isAccessible || materi.isDemo ? 'active:bg-muted/50' : 'opacity-60'} ${index < kelas.materis!.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <View className={`w-8 h-8 rounded-lg items-center justify-center ${materi.isCompleted ? 'bg-success-muted' : materi.isAccessible ? 'bg-info-muted' : 'bg-muted'}`}>
                    <FontAwesome
                      name={materi.isCompleted ? 'check-circle' : materi.isAccessible ? 'play' : 'lock'}
                      size={12}
                      color={materi.isCompleted ? '#16a34a' : materi.isAccessible ? '#2563eb' : '#6b7280'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground text-sm font-medium" numberOfLines={1}>{materi.title}</Text>
                    {materi.description && (
                      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                        {materi.description}
                      </Text>
                    )}
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

        {/* Description */}
        {kelas.htmlDescription && (
          <View className="px-4 py-2 bg-background">
            <HtmlRenderer html={kelas.htmlDescription} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}