import { KoleksiSoal } from 'hakgyo-expo-sdk';
import { Pressable, Text, View } from 'react-native';

interface KoleksiSoalCardProps {
  collection: KoleksiSoal;
  onPress: (id: number) => void;
}

export function KoleksiSoalCard({ collection, onPress }: KoleksiSoalCardProps) {
  const questionCount = collection._count?.soals ?? 0;

  return (
    <Pressable
      className="p-4 bg-muted rounded-lg border shadow border-border active:opacity-70"
      onPress={() => onPress(collection.id)}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">📝</Text>
            <Text className="text-lg font-semibold text-foreground flex-1" numberOfLines={1}>
              {collection.nama}
            </Text>
          </View>
          {collection.deskripsi ? (
            <Text className="mt-1 text-muted-foreground text-sm" numberOfLines={2}>
              {collection.deskripsi}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-center mt-3 gap-4">
        <View className="flex-row items-center gap-1">
          <Text className="text-muted-foreground text-xs">{questionCount} questions</Text>
        </View>
        {collection.user && (
          <Text className="text-xs text-muted-foreground">
            by {collection.user.name}
          </Text>
        )}
      </View>
    </Pressable>
  );
}