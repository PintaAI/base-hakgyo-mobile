import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Materi, materiApi } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

import { HtmlRenderer } from '@/components/html-renderer';

export default function MateriDetailScreen() {
  const { kelasid, materiid } = useLocalSearchParams<{
    kelasid: string;
    materiid: string;
  }>();
  const router = useRouter();
  const kelasId = Number(kelasid);
  const materiId = Number(materiid);

  const [materi, setMateri] = useState<Materi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (materiId) {
      fetchMateri();
    }
  }, [materiId]);

  const fetchMateri = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materiApi.get(materiId);
      setMateri(response.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load material');
      console.error('Error fetching materi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!materi) return;

    try {
      setCompleting(true);
      const response = await materiApi.complete(materiId);

      if (response.success && response.data) {
        const xpEarned = (response.data as any).gamification?.totalXP;
        Alert.alert(
          'Completed!',
          `You have completed "${materi.title}"${
            xpEarned ? `\n\n+${xpEarned} XP earned!` : ''
          }`,
          [
            { text: 'OK', onPress: () => router.back() },
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to mark as complete'
      );
    } finally {
      setCompleting(false);
    }
  };

  const handleStartAssessment = () => {
    if (!materi?.koleksiSoalId) return;
    router.push(`/(menu)/soal/${materi.koleksiSoalId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-3 text-muted-foreground">Loading material...</Text>
      </View>
    );
  }

  if (error || !materi) {
    return (
      <View className="flex-1 p-6 items-center justify-center">
        <View className="bg-card rounded-2xl border border-border p-6 items-center max-w-xs">
          <View className="w-14 h-14 rounded-full bg-error-muted items-center justify-center">
            <FontAwesome name="exclamation-circle" size={24} color="#ef4444" />
          </View>
          <Text className="mt-4 text-foreground text-lg font-semibold text-center">
            Unable to Load
          </Text>
          <Text className="mt-2 text-muted-foreground text-sm text-center">
            {error || 'Material not found'}
          </Text>
          <Pressable
            onPress={fetchMateri}
            className="mt-5 bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-primary-foreground font-semibold">
              Try Again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
      <View className="p-4">
        {/* Header Card */}
        <View className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Order Badge */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-primary/20 items-center justify-center">
                <FontAwesome name="book" size={14} color="#2563eb" />
              </View>
              <Text className="text-muted-foreground text-sm font-medium">
                Material #{materi.order}
              </Text>
            </View>
            {materi.isDemo && (
              <View className="bg-info-muted px-2 py-1 rounded">
                <Text className="text-xs font-semibold text-info">FREE</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <View className="p-4 pb-0">
            <Text className="text-foreground text-xl font-bold">
              {materi.title}
            </Text>
            {materi.description && (
              <Text className="text-muted-foreground text-sm mt-1">
                {materi.description}
              </Text>
            )}
          </View>

          {/* Content */}
          {materi.htmlDescription && (
            <View className="p-4">
              <View className="border-t border-border pt-4">
                <HtmlRenderer html={materi.htmlDescription} />
              </View>
            </View>
          )}

          {/* Assessment Info */}
          {materi.koleksiSoalId && (
            <View className="p-4 border-t border-border">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-lg bg-warning-muted items-center justify-center">
                  <FontAwesome name="clipboard-list" size={18} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">
                    Assessment Available
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {materi.passingScore
                      ? `Passing score: ${materi.passingScore}%`
                      : 'Complete the quiz to finish this material'}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={handleStartAssessment}
                className="bg-warning rounded-xl py-3 items-center"
              >
                <Text className="text-warning-foreground font-semibold">
                  Start Assessment
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Complete Button */}
        {!materi.koleksiSoalId && (
          <Pressable
            onPress={handleComplete}
            disabled={completing}
            className={`mt-4 rounded-xl py-4 items-center ${
              completing ? 'bg-muted' : 'bg-primary'
            }`}
          >
            {completing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <FontAwesome name="check-circle" size={18} color="#fff" />
                <Text className="text-primary-foreground font-semibold">
                  Mark as Complete
                </Text>
              </View>
            )}
          </Pressable>
        )}

        {/* Navigation Hint */}
        <View className="mt-4 p-4 bg-muted/50 rounded-xl">
          <View className="flex-row items-center gap-2">
            <FontAwesome name="info-circle" size={14} color="#6b7280" />
            <Text className="text-muted-foreground text-xs">
              {materi.koleksiSoalId
                ? 'Complete the assessment to mark this material as done.'
                : 'Mark this material as complete to track your progress.'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}