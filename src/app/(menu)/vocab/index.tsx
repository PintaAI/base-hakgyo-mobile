import { Background, MenuHeader } from '@/components';
import { VocabSetCard } from '@/components/vocab-set-card';
import { useKelas } from '@/contexts/kelas-context';
import { router } from 'expo-router';
import { useAuth, vocabularyApi, VocabularySet } from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function VocabScreen() {
  const { user } = useAuth();
  const { selectedKelas } = useKelas();
  const [vocabSets, setVocabSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchVocabSets();
  }, [user?.id, selectedKelas?.id]);

  const fetchVocabSets = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await vocabularyApi.listSets({
        limit: 50,
        kelasId: selectedKelas?.id ? String(selectedKelas.id) : undefined
      });
      setVocabSets(response?.data ?? []);
    } catch (err) {
      setError('Failed to load vocabulary sets');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (id: number) => {
    router.push({ pathname: '/(menu)/vocab/[id]' as const, params: { id: String(id) } });
  };

  const handleDelete = async (id: number) => {
    try {
      await vocabularyApi.deleteSet(id);
      setVocabSets((prev) => prev.filter((set) => set.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete vocabulary set');
    }
  };

  const handleLongPress = (id: number) => {
    Alert.alert(
      'Delete Vocabulary Set',
      'Are you sure you want to delete this vocabulary set? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(id),
        },
      ]
    );
  };

  const handleAddSet = async () => {
    if (!newTitle.trim() || !user?.id) return;

    try {
      setAdding(true);
      const body = {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        isPublic: false,
        isDraft: false,
        userId: user.id,
      };
      console.log('Creating vocab set with body:', JSON.stringify(body, null, 2));
      const response = await vocabularyApi.createSet(body);

      if (response.data) {
        setVocabSets([response.data, ...vocabSets]);
        setNewTitle('');
        setNewDescription('');
        setIsAdding(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create vocabulary set');
    } finally {
      setAdding(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1">
        <Background />
        <MenuHeader
          title="Kosa Kata"
          subtitle={selectedKelas ? `Dari kelas ${selectedKelas.title}` : 'Kumpulan kosa kata'}
          leftIconName="book.closed"
          rightIconName="gamecontroller"
          onRightIconPress={() => router.push('/game')}
        />

        {/* Add Vocab Set Form */}
        {user?.id && (
          <View className="px-2 pt-2" collapsable={false}>
            {isAdding ? (
              <View className="p-4 bg-card rounded-lg border border-border" collapsable={false}>
                <Text className="text-sm font-medium text-foreground mb-3">Create New Vocabulary Set</Text>
                <TextInput
                  className="p-3 bg-background rounded-lg border border-border text-foreground mb-2"
                  placeholder="Title"
                  placeholderTextColor="#9CA3AF"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  returnKeyType="next"
                />
                <TextInput
                  className="p-3 bg-background rounded-lg border border-border text-foreground mb-3"
                  placeholder="Description (optional)"
                  placeholderTextColor="#9CA3AF"
                  value={newDescription}
                  onChangeText={setNewDescription}
                  returnKeyType="done"
                />
                <View className="flex-row gap-2" collapsable={false}>
                  <Pressable
                    className="flex-1 p-3 bg-muted rounded-lg"
                    onPress={() => {
                      setIsAdding(false);
                      setNewTitle('');
                      setNewDescription('');
                    }}
                  >
                    <Text className="text-center text-muted-foreground">Cancel</Text>
                  </Pressable>
                  <Pressable
                    className={`flex-1 p-3 rounded-lg ${adding || !newTitle.trim() ? 'bg-primary/50' : 'bg-primary'}`}
                    onPress={handleAddSet}
                    disabled={adding || !newTitle.trim()}
                  >
                    <Text className="text-center text-primary-foreground">
                      {adding ? 'Creating...' : 'Create'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                className="p-3 bg-primary/10 rounded-lg border border-dashed border-primary/30"
                onPress={() => setIsAdding(true)}
              >
                <Text className="text-center text-primary font-medium">+ Tambah Koleksi Kosa-kata</Text>
              </Pressable>
            )}
          </View>
        )}

        <ScrollView
          className="flex-1 px-2 mt-2"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ gap: 5, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <ActivityIndicator size="large" className="mt-8" />
          ) : !user?.id ? (
            <View className="p-5 bg-card items-center border border-border rounded-lg mt-4">
              <Text className="text-sm text-muted-foreground mb-3">Please sign in to access vocabulary sets</Text>
              <Pressable
                onPress={() => router.push('/auth')}
                className="bg-primary px-4 py-3 rounded-lg"
              >
                <Text className="text-primary-foreground font-medium text-center">Sign In</Text>
              </Pressable>
            </View>
          ) : error ? (
            <View className="gap-2">
              <Text className="text-destructive">{error}</Text>
              <Pressable
                className="p-2 bg-primary rounded-lg"
                onPress={fetchVocabSets}
              >
                <Text className="text-primary-foreground text-center">Retry</Text>
              </Pressable>
            </View>
          ) : vocabSets.length === 0 ? (
            <Text className="text-muted-foreground">No vocabulary sets available</Text>
          ) : (
            vocabSets.map((set) => (
              <VocabSetCard
                key={set.id}
                set={set}
                onPress={handlePress}
                onLongPress={handleLongPress}
                isUserOwned={set.userId === user?.id}
              />
            ))
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}