import { VocabularySet } from 'hakgyo-expo-sdk';
import { Pressable, Text, View } from 'react-native';

interface VocabSetCardProps {
  set: VocabularySet;
  onPress: (id: number) => void;
  onLongPress?: (id: number) => void;
  isUserOwned?: boolean;
}

export function VocabSetCard({ set, onPress, onLongPress, isUserOwned = false }: VocabSetCardProps) {
  // Map icon names to display (could be expanded with actual icon components)
  const getIconDisplay = (iconName: string | null | undefined): string => {
    const iconMap: Record<string, string> = {
      FaBookOpen: '📖',
      FaBook: '📕',
      FaCar: '🚗',
    };
    return iconName && iconMap[iconName] ? iconMap[iconName] : '📚';
  };
  
  const itemCount = set.itemCount ?? 0;
  const learnedCount = set.learnedCount ?? 0;
  const progressPercentage = itemCount > 0 ? Math.round((learnedCount / itemCount) * 100) : 0;

  return (
    <Pressable
      className="p-4 bg-card rounded-lg border shadow border-border active:opacity-70"
      onPress={() => onPress(set.id)}
      onLongPress={isUserOwned && onLongPress ? () => onLongPress(set.id) : undefined}
    >
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 items-center justify-center rounded-lg border border-border bg-background">
          <Text className="text-xl">{getIconDisplay(set.icon)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
            {set.title}
          </Text>
          {isUserOwned ? (
            <View className="self-start px-2 py-0.5 bg-primary/20 rounded mt-1">
              <Text className="text-xs text-primary font-medium">Koleksi Ku</Text>
            </View>
          ) : set.user ? (
            <Text className="text-xs text-muted-foreground">
              by {set.user.name}
            </Text>
          ) : null}
        </View>
      </View>
      {set.description ? (
        <Text className="mt-2 text-muted-foreground text-sm" numberOfLines={3}>
          {set.description}
        </Text>
      ) : null}

      {/* Progress Bar or Empty State */}
      {itemCount > 0 ? (
        <View className="mt-3">
          <View className="h-2 bg-muted rounded-full overflow-hidden">
            <View
              className="h-full bg-success/50 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="text-xs text-muted-foreground mt-1">
            {progressPercentage}% complete • {learnedCount} / {itemCount}
          </Text>
        </View>
      ) : (
        <Text className="text-xs text-muted-foreground mt-3 italic">
          No items yet
        </Text>
      )}
    </Pressable>
  );
}