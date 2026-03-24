import React from 'react';
import { View, Text, Pressable, useColorScheme, ActivityIndicator, Image } from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { Kelas } from 'hakgyo-expo-sdk';
import { Colors } from '@/constants/theme';

interface JoinedKelasListProps {
  /** List of joined kelas */
  joinedKelas: Kelas[];
  /** Currently selected kelas */
  selectedKelas: Kelas | null;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Callback when a kelas is selected */
  onSelectKelas: (kelas: Kelas) => void;
  /** Optional: show compact version */
  compact?: boolean;
}

const KELAS_TYPE_ICONS: Record<string, string> = {
  REGULAR: 'book',
  EVENT: 'calendar',
  GROUP: 'users',
  PRIVATE: 'lock',
  FUN: 'gamepad',
};

const KELAS_LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#22c55e', // green
  INTERMEDIATE: '#f59e0b', // amber
  ADVANCED: '#ef4444', // red
};

export function JoinedKelasList({
  joinedKelas,
  selectedKelas,
  isLoading = false,
  error = null,
  onSelectKelas,
  compact = false,
}: JoinedKelasListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={{ marginTop: 8, color: theme.mutedForeground, fontSize: 14 }}>
          Loading classes...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome name="exclamation-circle" size={20} color={theme.destructive} />
          <Text style={{ color: theme.destructive, fontSize: 14 }}>{error}</Text>
        </View>
      </View>
    );
  }

  if (joinedKelas.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 24,
          alignItems: 'center',
        }}
      >
        <FontAwesome name="graduation-cap" size={32} color={theme.mutedForeground} />
        <Text style={{ marginTop: 12, color: theme.mutedForeground, fontSize: 14, textAlign: 'center' }}>
          You haven't joined any classes yet
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome name="graduation-cap" size={18} color={theme.primary} />
          <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }}>
            My Classes
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme.primary + '1A',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>
            {joinedKelas.length}
          </Text>
        </View>
      </View>

      {/* Class List */}
      <View style={{ padding: compact ? 8 : 12, gap: compact ? 4 : 8 }}>
        {joinedKelas.map((kelas) => {
          const isSelected = selectedKelas?.id === kelas.id;
          const iconName = KELAS_TYPE_ICONS[kelas.type] || 'book';
          const levelColor = KELAS_LEVEL_COLORS[kelas.level] || theme.mutedForeground;

          return (
            <Pressable
              key={kelas.id}
              onPress={() => onSelectKelas(kelas)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: compact ? 10 : 14,
                borderRadius: 10,
                backgroundColor: isSelected ? theme.primary + '1A' : 'transparent',
                borderWidth: isSelected ? 1 : 0,
                borderColor: isSelected ? theme.primary : 'transparent',
              }}
            >
              {/* Thumbnail */}
              {kelas.thumbnail ? (
                <Image
                  source={{ uri: kelas.thumbnail }}
                  style={{
                    width: compact ? 36 : 44,
                    height: compact ? 36 : 44,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: compact ? 36 : 44,
                    height: compact ? 36 : 44,
                    borderRadius: 8,
                    backgroundColor: isSelected ? theme.primary : theme.muted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome
                    name={iconName as any}
                    size={compact ? 16 : 20}
                    color={isSelected ? theme.primaryForeground : theme.foreground}
                  />
                </View>
              )}

              {/* Content */}
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: compact ? 14 : 16,
                    color: theme.foreground,
                  }}
                  numberOfLines={1}
                >
                  {kelas.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {/* Level Badge */}
                  <View
                    style={{
                      backgroundColor: levelColor + '1A',
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '500', color: levelColor }}>
                      {kelas.level}
                    </Text>
                  </View>
                  {/* Member Count */}
                  {kelas._count?.members !== undefined && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <FontAwesome name="users" size={10} color={theme.mutedForeground} />
                      <Text style={{ fontSize: 10, color: theme.mutedForeground }}>
                        {kelas._count.members}
                      </Text>
                    </View>
                  )}
                  {/* Material Count */}
                  {kelas._count?.materis !== undefined && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <FontAwesome name="book" size={10} color={theme.mutedForeground} />
                      <Text style={{ fontSize: 10, color: theme.mutedForeground }}>
                        {kelas._count.materis}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Selection Indicator */}
              {isSelected && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome name="check" size={12} color={theme.primaryForeground} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}