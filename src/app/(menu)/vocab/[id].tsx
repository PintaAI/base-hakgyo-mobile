import { useLocalSearchParams } from 'expo-router';
import { useAuth, vocabularyApi, VocabularyItem, VocabularySet} from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function VocabDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const setId = Number(id);
  const [vocabSet, setVocabSet] = useState<VocabularySet | null>(null);
  const [vocabItems, setVocabItems] = useState<VocabularyItem[]>([]);
  const [learnedStatus, setLearnedStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newKorean, setNewKorean] = useState('');
  const [newIndonesian, setNewIndonesian] = useState('');
  const [adding, setAdding] = useState(false);
  const [togglingLearned, setTogglingLearned] = useState<number | null>(null);

  useEffect(() => {
    if (setId) {
      fetchVocabSet();
    }
  }, [setId]);

  const fetchVocabSet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the vocabulary set (includes items with isLearned for authenticated users)
      const setResponse = await vocabularyApi.getSet(setId);
      setVocabSet(setResponse.data || null);

      // Items are now included in the set response with isLearned field
      const items = setResponse.data?.items || [];
      setVocabItems(items);
      
      // Initialize learned status from items (isLearned is now provided by API)
      const statusMap: Record<number, boolean> = {};
      items.forEach((item: VocabularyItem) => {
        statusMap[item.id] = item.isLearned ?? false;
      });
      setLearnedStatus(statusMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary set');
      console.error('Error fetching vocab set:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (itemId: number) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const isOwner = user && vocabSet?.userId === user.id;

  const handleAddItem = async () => {
    if (!newKorean.trim() || !newIndonesian.trim() || !user?.id) return;

    try {
      setAdding(true);
      const response = await vocabularyApi.addItem(setId, {
        korean: newKorean.trim(),
        indonesian: newIndonesian.trim(),
        type: 'WORD',
        creatorId: user.id,
      });

      if (response.data) {
        setVocabItems([...vocabItems, response.data]);
        setNewKorean('');
        setNewIndonesian('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Error adding vocab item:', err);
      setError(err instanceof Error ? err.message : 'Failed to add vocabulary item');
    } finally {
      setAdding(false);
    }
  };

  const toggleLearned = async (itemId: number) => {
    const currentStatus = learnedStatus[itemId] || false;
    const newStatus = !currentStatus;

    // Optimistic UI update - immediately update the UI
    setLearnedStatus(prev => ({
      ...prev,
      [itemId]: newStatus,
    }));
    
    // Update vocabSet learned count optimistically
    if (vocabSet) {
      const newLearnedCount = newStatus
        ? (vocabSet.learnedCount || 0) + 1
        : Math.max(0, (vocabSet.learnedCount || 0) - 1);
      setVocabSet({ ...vocabSet, learnedCount: newLearnedCount });
    }

    try {
      setTogglingLearned(itemId);
      const response = await vocabularyApi.setLearnedStatus(itemId, newStatus);
      
      // Sync with server response
      if (response.data && response.data.isLearned !== undefined) {
        setLearnedStatus(prev => ({
          ...prev,
          [itemId]: response.data!.isLearned,
        }));
        
        // Update vocabSet learned count based on actual server response
        if (vocabSet && response.data!.isLearned !== newStatus) {
          const actualLearnedCount = response.data!.isLearned
            ? (vocabSet.learnedCount || 0) + 1
            : Math.max(0, (vocabSet.learnedCount || 0) - 1);
          setVocabSet({ ...vocabSet, learnedCount: actualLearnedCount });
        }
      }
    } catch (err) {
      // Revert optimistic update on error
      setLearnedStatus(prev => ({
        ...prev,
        [itemId]: currentStatus,
      }));
      
      // Revert vocabSet learned count
      if (vocabSet) {
        const revertedLearnedCount = currentStatus
          ? (vocabSet.learnedCount || 0) + 1
          : Math.max(0, (vocabSet.learnedCount || 0) - 1);
        setVocabSet({ ...vocabSet, learnedCount: revertedLearnedCount });
      }
      
      console.error('Error toggling learned status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update learned status');
    } finally {
      setTogglingLearned(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-2 text-muted-foreground">Loading vocabulary set...</Text>
      </View>
    );
  }

  if (error || !vocabSet) {
    return (
      <View className="flex-1 p-6">
        <Text className="text-destructive">{error || 'Vocabulary set not found'}</Text>
        <Pressable
          className="mt-4 p-3 bg-primary rounded-lg"
          onPress={fetchVocabSet}
        >
          <Text className="text-primary-foreground text-center">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1" collapsable={false}>
        {/* Header */}
        <View className="p-6 pb-4" collapsable={false}>
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-foreground text-2xl font-bold">{vocabSet.title}</Text>
            </View>
            <Text className="text-sm text-muted-foreground ml-2">
              {vocabSet.itemCount ?? vocabItems.length} words
            </Text>
          </View>
          {(vocabSet.learnedCount === 0 || !vocabSet.learnedCount) ? (
            <Text className="text-sm text-muted-foreground mt-2">
              Ceklis kosa kata yang sudah hafal
            </Text>
          ) : (
            vocabSet.description && (
              <Text className="text-sm text-muted-foreground mt-2">
                {vocabSet.description}
              </Text>
            )
          )}
          {vocabSet.learnedCount !== undefined && vocabSet.itemCount !== undefined && vocabSet.itemCount > 0 && (
            <View className="mt-2">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-muted-foreground">
                  {vocabSet.learnedCount}/{vocabSet.itemCount} learned
                </Text>
                <Text className="text-xs text-primary font-medium">
                  {Math.round((vocabSet.learnedCount / vocabSet.itemCount) * 100)}%
                </Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(vocabSet.learnedCount / vocabSet.itemCount) * 100}%` }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Add Vocab Item Form (Owner Only) */}
        {isOwner && (
          <View collapsable={false}>
            {isAdding ? (
              <View className="p-4 bg-card border-border" collapsable={false}>
                <Text className="text-sm  font-medium text-foreground mb-3">Add New Vocabulary</Text>
                <TextInput
                  className="p-3 bg-background rounded-lg border border-border text-foreground mb-2"
                  placeholder="Korean word"
                  placeholderTextColor="#9CA3AF"
                  value={newKorean}
                  onChangeText={setNewKorean}
                  returnKeyType="next"
                />
                <TextInput
                  className="p-3 bg-background rounded-lg border border-border text-foreground mb-3"
                  placeholder="Indonesian translation"
                  placeholderTextColor="#9CA3AF"
                  value={newIndonesian}
                  onChangeText={setNewIndonesian}
                  returnKeyType="done"
                />
                <View className="flex-row gap-2" collapsable={false}>
                  <Pressable
                    className="flex-1 p-3 bg-muted rounded-lg"
                    onPress={() => {
                      setIsAdding(false);
                      setNewKorean('');
                      setNewIndonesian('');
                    }}
                  >
                    <Text className="text-center text-muted-foreground">Cancel</Text>
                  </Pressable>
                  <Pressable
                    className={`flex-1 p-3 rounded-lg ${adding || !newKorean.trim() || !newIndonesian.trim() ? 'bg-primary/50' : 'bg-primary'}`}
                    onPress={handleAddItem}
                    disabled={adding || !newKorean.trim() || !newIndonesian.trim()}
                  >
                    <Text className="text-center text-primary-foreground">
                      {adding ? 'Adding...' : 'Add'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                className="p-3 m-4 bg-primary/10 rounded-lg border border-dashed border-primary/30"
                onPress={() => setIsAdding(true)}
              >
                <Text className="text-center text-primary font-medium">+ Add Vocabulary Item</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Vocabulary Items */}
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24, gap: 12, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {vocabItems.length === 0 ? (
            <Text className="text-muted-foreground text-center mt-8">
              No vocabulary items in this set
            </Text>
          ) : (
            vocabItems.map((item) => {
              const isExpanded = expandedItem === item.id;
              const isLearned = learnedStatus[item.id] || false;
              const isToggling = togglingLearned === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleExpand(item.id)}
                  className={`p-4 rounded-lg border shadow ${isLearned ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-card border-border'}`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-foreground">
                        {item.korean}
                      </Text>
                      <Text className="text-sm text-muted-foreground mt-1">
                        {item.indonesian}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleLearned(item.id);
                      }}
                      disabled={isToggling}
                      className={`w-8 h-8 rounded-full items-center justify-center ${isLearned ? 'bg-green-200 dark:bg-green-800/50' : 'bg-muted border border-border'}`}
                    >
                      <Text className={`text-base font-bold ${isLearned ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {isToggling ? '...' : isLearned ? '✓' : ''}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <View className="mt-3 pt-3 border-t border-border">
                      {item.type && (
                        <Text className="text-xs text-muted-foreground">
                          Type: {item.type}
                        </Text>
                      )}
                      {item.pos && (
                        <Text className="text-xs text-muted-foreground">
                          Part of Speech: {item.pos}
                        </Text>
                      )}
                      {item.exampleSentences && item.exampleSentences.length > 0 && (
                        <View className="mt-2">
                          <Text className="text-xs text-muted-foreground">Examples:</Text>
                          {item.exampleSentences.map((sentence, idx) => (
                            <Text key={idx} className="text-sm text-foreground mt-1">
                              • {sentence}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}