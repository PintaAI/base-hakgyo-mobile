import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { kelasApi, Kelas } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function KelasDetailScreen() {
  const { kelasid } = useLocalSearchParams<{ kelasid: string }>();
  const kelasId = Number(kelasid);
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 8, color: theme.mutedForeground }}>Loading class...</Text>
      </View>
    );
  }

  if (error || !kelas) {
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: theme.background }}>
        <Text style={{ color: theme.destructive }}>{error || 'Class not found'}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: kelas?.title || 'Class Details',
        }}
      />
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentInsetAdjustmentBehavior="automatic">
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 24, color: theme.foreground }}>
          {kelas.title}
        </Text>
        
        <Text style={{ color: theme.mutedForeground }}>
          ID: {kelas.id}
        </Text>
        
        <Text style={{ color: theme.foreground }}>
          {kelas.description || 'No description'}
        </Text>
        
        <Text style={{ color: theme.mutedForeground }}>
          Type: {kelas.type}
        </Text>
        
        <Text style={{ color: theme.mutedForeground }}>
          Level: {kelas.level}
        </Text>
        
        <Text style={{ color: theme.mutedForeground }}>
          Paid: {kelas.isPaidClass ? 'Yes' : 'No'}
        </Text>
        
        {kelas.price && (
          <Text style={{ color: theme.mutedForeground }}>
            Price: {kelas.price}
          </Text>
        )}
        
        <Text style={{ color: theme.mutedForeground }}>
          Enrolled: {kelas.isEnrolled ? 'Yes' : 'No'}
        </Text>
        
        <Text style={{ color: theme.mutedForeground }}>
          Author ID: {kelas.authorId}
        </Text>
        
        {kelas.author && (
          <Text style={{ color: theme.mutedForeground }}>
            Author: {kelas.author.name || kelas.author.email}
          </Text>
        )}
        
        {kelas.thumbnail && (
          <Text style={{ color: theme.mutedForeground }}>
            Thumbnail: {kelas.thumbnail}
          </Text>
        )}
        
        {kelas._count && (
          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: '600', color: theme.foreground }}>Counts:</Text>
            <Text style={{ color: theme.mutedForeground }}>  Materials: {kelas._count.materis}</Text>
            <Text style={{ color: theme.mutedForeground }}>  Members: {kelas._count.members}</Text>
            <Text style={{ color: theme.mutedForeground }}>  Completions: {kelas._count.completions}</Text>
          </View>
        )}
        
        {kelas.materis && kelas.materis.length > 0 && (
          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: '600', color: theme.foreground }}>Materials:</Text>
            {kelas.materis.map((materi) => (
              <Text key={materi.id} style={{ color: theme.mutedForeground }}>
                {'  '}- {materi.title} (Order: {materi.order}, Demo: {materi.isDemo ? 'Yes' : 'No'})
              </Text>
            ))}
          </View>
        )}
        
        {kelas.members && kelas.members.length > 0 && (
          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: '600', color: theme.foreground }}>Members:</Text>
            {kelas.members.slice(0, 10).map((member) => (
              <Text key={member.id} style={{ color: theme.mutedForeground }}>
                {'  '}- {member.name || 'Unknown'}
              </Text>
            ))}
            {kelas.members.length > 10 && (
              <Text style={{ color: theme.mutedForeground }}>
                {'  '}... and {kelas.members.length - 10} more
              </Text>
            )}
          </View>
        )}
        
        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
          Created: {new Date(kelas.createdAt).toLocaleDateString()}
        </Text>
        
        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
          Updated: {new Date(kelas.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
    </>
  );
}