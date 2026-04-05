import { Colors } from '@/constants/theme';
import { useAuth, vocabularyApi, VocabularyItem } from 'hakgyo-expo-sdk';
import { AlertCircle, BookOpen, HelpCircle, Send } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Keyboard, Pressable, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { DailyVocabSkeleton } from './skeletons';

interface VocabCardProps {
  item: VocabularyItem;
  theme: typeof Colors.light | typeof Colors.dark;
  isFlipped: boolean;
  isWrong: boolean;
  shakeAnimation: Animated.Value;
  onFlip: () => void;
}

function VocabCard({ item, theme, isFlipped, isWrong, shakeAnimation, onFlip }: VocabCardProps) {
  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, flipAnimation]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [
      { rotateY: frontInterpolate },
      { translateX: shakeAnimation.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-10, 0, 10],
      })},
    ],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <Pressable onPress={onFlip} style={{ width: 350, height: 100 }}>
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Front Side - Korean Word */}
        <Animated.View
          style={[
            frontAnimatedStyle,
            {
              position: 'absolute',
              inset: 0,
              backgroundColor: isWrong ? theme.destructive : theme.primary,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [guess, setGuess] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

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

  // Reset guess and hint when card changes
  useEffect(() => {
    setGuess('');
    setIsWrong(false);
    setHintIndex(0);
  }, [currentIndex]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: VocabularyItem; index: number | null }> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const shakeCard = () => {
    setIsWrong(true);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => setIsWrong(false), 500);
    });
  };

  const flipCard = () => {
    const currentItemId = vocabItems[currentIndex]?.id;
    if (currentItemId !== undefined) {
      setFlippedCards(prev => new Set(prev).add(currentItemId));
    }
  };

  const handleGuess = () => {
    const currentItem = vocabItems[currentIndex];
    if (!currentItem) return;
    
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = currentItem.indonesian.trim().toLowerCase();
    
    if (normalizedGuess === normalizedAnswer) {
      Keyboard.dismiss();
      flipCard();
    } else {
      shakeCard();
    }
  };

  const handleHint = () => {
    const currentItem = vocabItems[currentIndex];
    if (!currentItem) return;
    
    const answer = currentItem.indonesian.trim();
    if (hintIndex < answer.length) {
      // Reveal next letter
      const newHintIndex = hintIndex + 1;
      setHintIndex(newHintIndex);
      // Update guess with revealed letters
      const revealedPart = answer.substring(0, newHintIndex);
      setGuess(revealedPart);
    }
  };

  const handleFlip = () => {
    const currentItemId = vocabItems[currentIndex]?.id;
    if (currentItemId === undefined) return;
    
    if (flippedCards.has(currentItemId)) {
      // Unflip
      setFlippedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentItemId);
        return newSet;
      });
    } else {
      flipCard();
    }
  };

  if (isLoading) {
    return <DailyVocabSkeleton />;
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
          <AlertCircle size={20} color={theme.destructive} />
          <Text style={{ color: theme.destructive, fontSize: 14 }}>{error}</Text>
        </View>
      </View>
    );
  }

  if (vocabItems.length === 0) {
    return null;
  }

  const currentItem = vocabItems[currentIndex];
  const isCurrentCardFlipped = currentItem ? flippedCards.has(currentItem.id) : false;

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
          ref={flatListRef}
          data={vocabItems}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          snapToInterval={364}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <VocabCard
              item={item}
              theme={theme}
              isFlipped={flippedCards.has(item.id)}
              isWrong={index === currentIndex && isWrong}
              shakeAnimation={index === currentIndex ? shakeAnimation : new Animated.Value(0)}
              onFlip={handleFlip}
            />
          )}
        />
      </View>

      {/* Guess Input - Outside FlatList */}
      {currentItem && !isCurrentCardFlipped && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Hint Button */}
            <TouchableOpacity
              onPress={handleHint}
              disabled={hintIndex >= (currentItem?.indonesian.trim().length || 0)}
              style={{
                backgroundColor: hintIndex >= (currentItem?.indonesian.trim().length || 0)
                  ? theme.muted + '40'
                  : theme.primary,
                borderRadius: 8,
                padding: 6,
              }}
            >
              <HelpCircle
                size={15}
                color={hintIndex >= (currentItem?.indonesian.trim().length || 0)
                  ? theme.mutedForeground
                  : theme.background
                }
              />
            </TouchableOpacity>
            
            {/* Text Input */}
            <TextInput
              style={{
                flex: 1,
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: isWrong ? theme.destructive : theme.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                color: theme.foreground,
              }}
              placeholder="Tebak artinya..."
              placeholderTextColor={theme.mutedForeground}
              value={guess}
              onChangeText={setGuess}
              onSubmitEditing={handleGuess}
              returnKeyType="done"
            />
            
            {/* Send Button */}
            <TouchableOpacity
              onPress={handleGuess}
              style={{
                backgroundColor: theme.primary,
                borderRadius: 8,
                padding: 6,
              }}
            >
              <Send size={15} color={theme.background} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}