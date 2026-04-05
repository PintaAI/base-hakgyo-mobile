import { Colors } from '@/constants/theme';
import { BookOpen } from 'lucide-react-native';
import React from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { Skeleton } from './ui/skeleton';

export function DailyVocabSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

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
          <BookOpen size={18} color={theme.primary} />
          <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }}>
            Kosa Kata Harian
          </Text>
        </View>
        <Skeleton width={50} height={20} borderRadius={999} />
      </View>

      {/* Card Carousel Skeleton */}
      <View style={{ paddingVertical: 12, paddingHorizontal: 12 }}>
        <View
          style={{
            width: 350,
            height: 100,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <Skeleton width={350} height={100} borderRadius={12} />
        </View>
      </View>

      {/* Input Skeleton */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Hint Button Skeleton */}
          <Skeleton width={35} height={35} borderRadius={8} />
          
          {/* Text Input Skeleton */}
          <Skeleton width={260} height={42} borderRadius={8} style={{ flex: 1 }} />
          
          {/* Send Button Skeleton */}
          <Skeleton width={35} height={35} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

export function DailySoalSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

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
          <BookOpen size={18} color={theme.primary} />
          <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }}>
            Soal Harian
          </Text>
        </View>
        <Skeleton width={50} height={20} borderRadius={999} />
      </View>

      {/* Preview Content */}
      <View style={{ padding: 16 }}>
        {/* Question Preview Skeleton */}
        <View
          style={{
            backgroundColor: theme.muted,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Skeleton width={60} height={12} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
          <Skeleton width="80%" height={14} borderRadius={4} />
        </View>

        {/* Start Button Skeleton */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: theme.primary,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Skeleton width={100} height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}