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

import { Background } from '@/components/themed-background';
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
      console.log('Materi API Response:', JSON.stringify(response, null, 2));
      if (response.success && response.data) {
        setMateri(response.data);
      } else {
        setMateri(null);
        if (response.error) {
          setError(response.error);
        }
      }
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
      console.log('Complete Materi API Response:', JSON.stringify(response, null, 2));

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
    router.push(`/kelas/${kelasId}/${materiId}/assessment`);
  };

  if (loading) {
    return (
      <View className="flex-1">
        <Background />
        <View className="flex-1 items-center justify-center">
          <View className="bg-card rounded-2xl border border-border p-6 items-center">
            <ActivityIndicator size="large" className="text-primary" />
            <Text className="mt-3 text-muted-foreground text-sm">Loading material...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !materi) {
    return (
      <View className="flex-1">
        <Background />
        <View className="flex-1 p-6 items-center justify-center">
          <View className="bg-card rounded-2xl border border-border p-6 items-center max-w-xs">
            <View className="w-16 h-16 rounded-full bg-error-muted items-center justify-center">
              <FontAwesome name="exclamation-circle" size={32} color="#ef4444" />
            </View>
            <Text className="mt-4 text-foreground text-lg font-semibold text-center">
              Unable to Load
            </Text>
            <Text className="mt-2 text-muted-foreground text-sm text-center">
              {error || 'Material not found'}
            </Text>
            <Pressable
              onPress={fetchMateri}
              className="mt-5 bg-primary px-6 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-primary-foreground font-semibold">
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Background />
      <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
        <View className="p-4 pb-8">
          {/* Header Card - Matching kelasid design */}
          <View className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Title & Badges */}
            <View className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text className="text-foreground text-lg font-bold shrink-0" numberOfLines={1}>
                      {materi.title}
                    </Text>
                    {/* Assessment Badge */}
                    {materi.koleksiSoalId && (
                      <View className="flex-row items-center gap-1 bg-warning-muted px-2 py-0.5 rounded">
                        <FontAwesome name="clipboard-list" size={8} color="#d97706" />
                        <Text className="text-[10px] font-semibold text-warning-foreground">Assessment</Text>
                      </View>
                    )}
                  </View>
                  {/* Passing Score */}
                  {materi.koleksiSoalId && materi.passingScore && (
                    <Text className="text-xs text-muted-foreground mt-1">
                      Passing score: {materi.passingScore}%
                    </Text>
                  )}
                </View>
              </View>

              {/* Description */}
              {materi.description && (
                <View className="mt-3">
                  <Text className="text-sm text-foreground leading-relaxed">
                    {materi.description}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Content Section */}
          {materi.htmlDescription && (
            <View className="mt-4">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Content
              </Text>
              <View className="bg-card rounded-xl border border-border overflow-hidden">
                <View className="p-4">
                  <HtmlRenderer html={materi.htmlDescription} />
                </View>
              </View>
            </View>
          )}

          {/* Action Button */}
          <View className="mt-4">
            {materi.koleksiSoalId ? (
              <Pressable
                onPress={handleStartAssessment}
                className="flex-row items-center justify-center gap-2 bg-warning rounded-xl py-3 active:opacity-80"
              >
                <FontAwesome name="clipboard-list" size={14} color="#fff" />
                <Text className="text-white text-sm font-semibold">Start Assessment</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleComplete}
                disabled={completing}
                className="flex-row items-center justify-center gap-2 rounded-xl py-3 active:opacity-80 bg-success"
              >
                {completing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <FontAwesome name="check-circle" size={14} color="#fff" />
                    <Text className="text-white text-sm font-semibold">Mark as Complete</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}