import { Colors } from '@/constants/theme';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { Link, router } from 'expo-router';
import { Kelas } from 'hakgyo-expo-sdk';
import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, useColorScheme, View } from 'react-native';

interface JoinedKelasListProps {
  joinedKelas: Kelas[];
  isLoading?: boolean;
  error?: string | null;
}

const KELAS_LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#22c55e',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#ef4444',
};

export function JoinedKelasList({ joinedKelas, isLoading, error }: JoinedKelasListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  if (isLoading) {
    return (
      <View style={{ backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 24, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={{ marginTop: 8, color: theme.mutedForeground }}>Loading classes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
        <Text style={{ color: theme.destructive }}>{error}</Text>
      </View>
    );
  }

  if (joinedKelas.length === 0) {
    return (
      <View style={{ backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 24, alignItems: 'center' }}>
        <FontAwesome name="graduation-cap" size={32} color={theme.mutedForeground} />
        <Text style={{ marginTop: 12, color: theme.mutedForeground, textAlign: 'center' }}>No classes joined yet</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome name="graduation-cap" size={18} color={theme.primary} />
          <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }}>My Classes</Text>
        </View>
        <View style={{ backgroundColor: theme.primary + '1A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>{joinedKelas.length}</Text>
        </View>
      </View>

      <View style={{ padding: 12, gap: 8 }}>
        {joinedKelas.map((kelas) => {
          const levelColor = KELAS_LEVEL_COLORS[kelas.level] || theme.mutedForeground;

          const handlePress = () => {
            console.log('Kelas pressed:', kelas.id, kelas.title);
            router.push({ pathname: '/kelas/[kelasid]' as const, params: { kelasid: String(kelas.id) } });
          };

          return (
            <Pressable
              key={kelas.id}
              onPress={handlePress}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, backgroundColor: theme.background }}
            >
              {kelas.thumbnail ? (
                <Image source={{ uri: kelas.thumbnail }} style={{ width: 44, height: 44, borderRadius: 8 }} resizeMode="cover" />
              ) : (
                <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesome name="book" size={20} color={theme.foreground} />
                </View>
              )}

              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }} numberOfLines={1}>
                  {kelas.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ backgroundColor: levelColor + '1A', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: levelColor }}>{kelas.level}</Text>
                  </View>
                  {kelas._count?.members !== undefined && (
                    <Text style={{ fontSize: 10, color: theme.mutedForeground }}>{kelas._count.members} members</Text>
                  )}
                </View>
              </View>

              <FontAwesome name="chevron-right" size={16} color={theme.mutedForeground} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}