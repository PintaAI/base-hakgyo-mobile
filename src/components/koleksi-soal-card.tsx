import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { KoleksiSoal } from 'hakgyo-expo-sdk';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface KoleksiSoalCardProps {
  collection: KoleksiSoal;
  onPress: (id: number) => void;
}

export function KoleksiSoalCard({ collection, onPress }: KoleksiSoalCardProps) {
  const theme = useTheme();
  const questionCount = collection._count?.soals ?? 0;

  return (
    <Pressable
      className="p-4 bg-card rounded-lg border border-border shadow-sm active:opacity-70"
      onPress={() => onPress(collection.id)}
    >
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 items-center justify-center rounded-lg border border-border bg-background">
          <FontAwesome name="file" size={20} color={theme.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
            {collection.nama}
          </Text>
          {collection.user ? (
            <Text className="text-xs text-muted-foreground">
              by {collection.user.name}
            </Text>
          ) : null}
        </View>
      </View>
      {collection.deskripsi ? (
        <Text className="mt-2 text-muted-foreground text-sm" numberOfLines={3}>
          {collection.deskripsi}
        </Text>
      ) : null}

      {/* Question count */}
      <View className="mt-3">
        <Text className="text-xs text-muted-foreground">
          {questionCount} questions
        </Text>
      </View>
    </Pressable>
  );
}