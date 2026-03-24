import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Animated, useColorScheme } from 'react-native';
import { vocabularyApi, VocabularyItem } from 'hakgyo-expo-sdk';
import { useAuth } from 'hakgyo-expo-sdk';
import { useEffect, useState, useCallback, useRef } from 'react';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { Colors } from '@/constants/theme';

function VocabCard({ item, theme }: { item: VocabularyItem; theme: typeof Colors.light | typeof Colors.dark }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <Pressable onPress={handleFlip} style={{ width: 350, height: 100 }}>
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Front Side - Korean Word */}
        <Animated.View
          style={[
            frontAnimatedStyle,
            {
              position: 'absolute',
              inset: 0,
              backgroundColor: theme.primary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 12,
              backfaceVisibility: 'hidden',
            },
          ]}
        >
          {/* Korean Flag */}
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <Text style={{ fontSize: 20 }}>🇰🇷</Text>
          </View>

          {/* Korean Word */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: theme.background, textAlign: 'center' }}>
              {item.korean}
            </Text>
          </View>
        </Animated.View>

        {/* Back Side - Translation */}
        <Animated.View
          style={[
            backAnimatedStyle,
            {
              position: 'absolute',
              inset: 0,
              backgroundColor: theme.secondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.primary,
              padding: 12,
              backfaceVisibility: 'hidden',
            },
          ]}
        >
          {/* Indonesian Flag */}
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <Text style={{ fontSize: 20 }}>🇮🇩</Text>
          </View>

          {/* Translation */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.primaryForeground, textAlign: 'center' }}>
              {item.indonesian}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

export function DailyVocab() {
  const { user } = useAuth();
  const [vocabItems, setVocabItems] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const fetchDailyVocab = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await vocabularyApi.getDaily({
        userId: user.id,
        take: 5,
      });
      
      if (response.data) {
        setVocabItems(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch daily vocabulary:', err);
      setError('Gagal memuat kosa kata harian');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDailyVocab();
  }, [fetchDailyVocab]);

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
          Memuat kosa kata...
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

  if (vocabItems.length === 0) {
    return null;
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
          <FontAwesome name="book" size={18} color={theme.primary} />
          <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }}>
            Kosa Kata Harian
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
            {vocabItems.length} kata
          </Text>
        </View>
      </View>

      {/* Horizontal FlatList */}
      <View style={{ paddingVertical: 12 }}>
        <FlatList
          data={vocabItems}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          snapToInterval={367}
          snapToAlignment="start"
          decelerationRate="fast"
          renderItem={({ item }) => <VocabCard item={item} theme={theme} />}
        />
      </View>
    </View>
  );
}