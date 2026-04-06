import { Colors } from '@/constants/theme';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { router } from 'expo-router';
import { Kelas } from 'hakgyo-expo-sdk';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, useColorScheme, View } from 'react-native';

interface JoinedKelasListProps {
  joinedKelas: Kelas[];
  isLoading?: boolean;
  error?: string | null;
  onUnenroll?: (kelasId: number) => Promise<{ success: boolean; error?: string }>;
}

const KELAS_LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#22c55e',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#ef4444',
};

export function JoinedKelasList({ joinedKelas, isLoading, error, onUnenroll }: JoinedKelasListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [unenrollingId, setUnenrollingId] = useState<number | null>(null);

  const handleUnenroll = (kelas: Kelas) => {
    Alert.alert(
      'Keluar dari Kelas',
      `Apakah Anda akan keluar dari kelas "${kelas.title}"?\n\nAnda akan kehilangan vocab, soal, dan materi yang terkait dengan kelas ini.`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            if (!onUnenroll) return;
            
            setUnenrollingId(kelas.id);
            try {
              const result = await onUnenroll(kelas.id);
              if (!result.success) {
                Alert.alert('Gagal', result.error || 'Gagal keluar dari kelas');
              }
            } catch (err) {
              Alert.alert('Gagal', 'Terjadi kesalahan saat keluar dari kelas');
            } finally {
              setUnenrollingId(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="bg-card rounded-xl border border-border p-6 items-center">
        <ActivityIndicator size="small" color={theme.primary} />
        <Text className="mt-2 text-muted-foreground">Loading classes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-card rounded-xl border border-border p-4">
        <Text className="text-destructive">{error}</Text>
      </View>
    );
  }

  if (joinedKelas.length === 0) {
    return (
      <View className="bg-card rounded-xl border border-border p-6 items-center">
        <FontAwesome name="graduation-cap" size={32} color={theme.mutedForeground} />
        <Text className="mt-3 text-muted-foreground text-center">No classes joined yet</Text>
      </View>
    );
  }

  return (
    <View className="bg-card rounded-xl border border-border overflow-hidden">
      <View className="px-4 py-3 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <FontAwesome name="graduation-cap" size={18} color={theme.primary} />
          <Text className="font-semibold text-base text-foreground">Kelas ku</Text>
        </View>
        <View className="bg-primary/10 px-2 py-1 rounded-full">
          <Text className="text-xs font-semibold text-primary">{joinedKelas.length}</Text>
        </View>
      </View>

      <View className="p-3 gap-2">
        {joinedKelas.map((kelas) => {
          const levelColor = KELAS_LEVEL_COLORS[kelas.level] || theme.mutedForeground;
          const isUnenrolling = unenrollingId === kelas.id;

          const handlePress = () => {
            console.log('Kelas pressed:', kelas.id, kelas.title);
            router.push({ pathname: '/kelas/[kelasid]' as const, params: { kelasid: String(kelas.id) } });
          };

          return (
            <View
              key={kelas.id}
              className="flex-row items-center gap-3 p-1 shadow-sm pr-2 rounded-lg bg-card border border-border"
            >
              <Pressable onPress={handlePress} className="flex-1 flex-row items-center gap-3 py-2 pl-3 active:opacity-80">
                {kelas.thumbnail ? (
                  <Image source={{ uri: kelas.thumbnail }} className="w-11 h-11 rounded-lg" resizeMode="cover" />
                ) : (
                  <View className="w-11 h-11 rounded-lg bg-muted items-center justify-center">
                    <FontAwesome name="book" size={20} color={theme.foreground} />
                  </View>
                )}

                <View className="flex-1 gap-1">
                  <Text className="font-semibold text-base text-foreground" numberOfLines={1}>
                    {kelas.title}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: levelColor + '1A' }}
                    >
                      <Text className="text-[10px] font-medium" style={{ color: levelColor }}>
                        {kelas.level}
                      </Text>
                    </View>
                    {kelas._count?.members !== undefined && (
                      <Text className="text-[10px] text-muted-foreground">{kelas._count.members} members</Text>
                    )}
                  </View>
                </View>

                <FontAwesome name="chevron-right" size={16} color={theme.mutedForeground} />
              </Pressable>

              <Pressable
                onPress={() => handleUnenroll(kelas)}
                disabled={isUnenrolling}
                className="p-2 mr-1 rounded-lg active:opacity-70"
                style={{ backgroundColor: theme.destructive + '1A' }}
              >
                {isUnenrolling ? (
                  <ActivityIndicator size="small" color={theme.destructive} />
                ) : (
                  <FontAwesome name="trash" size={16} color={theme.destructive} />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}