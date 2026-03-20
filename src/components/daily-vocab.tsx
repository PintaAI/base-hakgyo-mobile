import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { useRouter } from 'expo-router';
import { useAuth, vocabularyApi, VocabularyItem } from 'hakgyo-expo-sdk';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface DailyVocabProps {
  take?: number;
}

export function DailyVocab({ take = 5 }: DailyVocabProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    const fetchDailyVocab = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await vocabularyApi.getDaily({
          userId: user.id,
          take,
        });
        setVocabulary(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load daily vocabulary');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyVocab();
  }, [user?.id, take]);

  const toggleExpand = (id: number) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  if (loading) {
    return (
      <View className="p-4 bg-card rounded-lg">
        <ActivityIndicator size="small" className="text-primary" />
        <Text className="mt-2 text-sm text-muted-foreground">Loading daily vocabulary...</Text>
      </View>
    );
  }

  if (!user?.id) {
    return (
      <View className="p-5 bg-card items-center border border-border rounded-lg">
        <Text className="text-sm text-muted-foreground mb-3">Please sign in to access daily vocabulary</Text>
        <Pressable
          onPress={() => router.push('/auth')}
          className="bg-primary px-4 py-3 rounded-lg"
        >
          <Text className="text-primary-foreground font-medium text-center">Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-4 bg-card rounded-lg">
        <Text className="text-sm text-destructive">{error}</Text>
      </View>
    );
  }

  if (vocabulary.length === 0) {
    return (
      <View className="p-4 bg-card rounded-lg">
        <Text className="text-sm text-muted-foreground">No daily vocabulary available</Text>
      </View>
    );
  }

  return (
    <View className=" rounded-lg">
      {vocabulary.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => toggleExpand(item.id)}
          className="p-3 mb-2 bg-card border border-border shadow-sm rounded-lg"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-lg font-medium text-foreground">{item.korean}</Text>
              <Text className="text-sm text-muted-foreground">{item.indonesian}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-primary/10 px-2 py-1 rounded mr-2">
                <Text className="text-xs text-primary font-medium">{item.type}</Text>
              </View>
              <FontAwesome
                name={expandedItem === item.id ? "chevron-up" : "chevron-down"}
                size={14}
                color="#6b7280"
              />
            </View>
          </View>
          
          {expandedItem === item.id && item.exampleSentences.length > 0 && (
            <View className="mt-3 pt-3 border-t border-border">
              <Text className="text-xs text-muted-foreground mb-1">Examples:</Text>
              {item.exampleSentences.map((sentence, index) => (
                <Text key={index} className="text-sm text-foreground italic">
                  • {sentence}
                </Text>
              ))}
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}