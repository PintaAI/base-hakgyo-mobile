import { Background, MenuHeader } from '@/components';
import { Book, Gamepad2 } from 'lucide-react-native';
import { VocabSetCard, VocabSetCardSkeleton } from '@/components/vocab-set-card';
import { useKelas } from '@/contexts/kelas-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { useAuth, vocabularyApi, VocabularySet } from 'hakgyo-expo-sdk';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VocabScreen() {
  const { user } = useAuth();
  const { selectedKelas } = useKelas();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'unspecified' ? 'light' : colorScheme];
  const [vocabSets, setVocabSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Unified form state for create/edit
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingSet, setEditingSet] = useState<VocabularySet | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchVocabSets = useCallback(async () => {
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
  }, [user?.id, selectedKelas?.id]);

  useEffect(() => {
    fetchVocabSets();
  }, [fetchVocabSets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVocabSets();
    setRefreshing(false);
  }, [fetchVocabSets]);

  const handlePress = (id: number) => {
    router.push({ pathname: '/(menu)/vocab/[id]' as const, params: { id: String(id) } });
  };

  const handleDelete = async (id: number) => {
    try {
      await vocabularyApi.deleteSet(id);
      setVocabSets((prev) => prev.filter((set) => set.id !== id));
      // Also close form if deleting the set being edited
      if (editingSet?.id === id) {
        closeForm();
      }
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

  // Open form for creating new set
  const openCreateForm = () => {
    setFormMode('create');
    setEditingSet(null);
    setFormTitle('');
    setFormDescription('');
    setFormVisible(true);
  };

  // Open form for editing existing set
  const openEditForm = (set: VocabularySet) => {
    setFormMode('edit');
    setEditingSet(set);
    setFormTitle(set.title);
    setFormDescription(set.description || '');
    setFormVisible(true);
  };

  // Close form and reset state
  const closeForm = () => {
    setFormVisible(false);
    setFormMode('create');
    setEditingSet(null);
    setFormTitle('');
    setFormDescription('');
  };

  // Handle form submission (create or update)
  const handleFormSubmit = async () => {
    if (!formTitle.trim()) return;
    
    // For create mode, require user
    if (formMode === 'create' && !user?.id) return;

    try {
      setFormSubmitting(true);

      if (formMode === 'create') {
        // Create new set
        const response = await vocabularyApi.createSet({
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          isPublic: false,
          isDraft: false,
          userId: user!.id,
        });

        if (response.data) {
          setVocabSets([response.data, ...vocabSets]);
          closeForm();
        }
      } else if (formMode === 'edit' && editingSet) {
        // Update existing set
        const response = await vocabularyApi.updateSet(editingSet.id, {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
        });

        if (response.data) {
          setVocabSets((prev) =>
            prev.map((set) => (set.id === editingSet.id ? response.data! : set))
          );
          closeForm();
        }
      }
    } catch (err) {
      Alert.alert('Error', formMode === 'create' ? 'Failed to create vocabulary set' : 'Failed to update vocabulary set');
    } finally {
      setFormSubmitting(false);
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
          leftIcon={Book}
          rightIcon={Gamepad2}
          onRightIconPress={() => router.push('/game')}
        />

        {/* Unified Vocab Set Form (Create/Edit) */}
        {user?.id && (
          <View className="px-2 pt-2" collapsable={false}>
            {formVisible ? (
              <View 
                className={`p-4 bg-card rounded-lg border ${formMode === 'edit' ? 'border-primary/50' : 'border-border'}`} 
                collapsable={false}
              >
                <Text className="text-sm font-medium text-foreground mb-3">
                  {formMode === 'create' ? 'Create New Vocabulary Set' : 'Edit Vocabulary Set'}
                </Text>
                <TextInput
                  className="p-3 bg-background rounded-lg border border-border text-foreground mb-2"
                  placeholder="Title"
                  placeholderTextColor="#9CA3AF"
                  value={formTitle}
                  onChangeText={setFormTitle}
                  returnKeyType="next"
                />
                <TextInput
                  className="p-3 bg-background rounded-lg border border-border text-foreground mb-3"
                  placeholder="Description (optional)"
                  placeholderTextColor="#9CA3AF"
                  value={formDescription}
                  onChangeText={setFormDescription}
                  returnKeyType="done"
                />
                <View className="flex-row gap-2" collapsable={false}>
                  <Pressable
                    className="flex-1 p-3 bg-muted rounded-lg"
                    onPress={closeForm}
                  >
                    <Text className="text-center text-muted-foreground">Cancel</Text>
                  </Pressable>
                  <Pressable
                    className={`flex-1 p-3 rounded-lg ${formSubmitting || !formTitle.trim() ? 'bg-primary/50' : 'bg-primary'}`}
                    onPress={handleFormSubmit}
                    disabled={formSubmitting || !formTitle.trim()}
                  >
                    <Text className="text-center text-primary-foreground">
                      {formSubmitting 
                        ? (formMode === 'create' ? 'Creating...' : 'Saving...') 
                        : (formMode === 'create' ? 'Create' : 'Save')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                className="p-3 bg-primary/10 rounded-lg border border-dashed border-primary/30"
                onPress={openCreateForm}
              >
                <Text className="text-center text-primary font-medium">+ Tambah Koleksi Kosa-kata</Text>
              </Pressable>
            )}
          </View>
        )}

        <ScrollView
          className="flex-1 px-2 mt-2"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ flexGrow: 1, gap: 5, paddingBottom: insets.bottom + 105 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          {loading ? (
            <View className="gap-2">
              <VocabSetCardSkeleton />
              <VocabSetCardSkeleton />
              <VocabSetCardSkeleton />
            </View>
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
                onEdit={openEditForm}
                onDelete={handleLongPress}
                isUserOwned={set.userId === user?.id}
              />
            ))
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}