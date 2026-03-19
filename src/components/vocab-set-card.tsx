import { Pressable, Text, View } from 'react-native';
import { VocabularySet } from 'hakgyo-expo-sdk';

interface VocabSetCardProps {
  set: VocabularySet;
  onPress: (id: number) => void;
}

export function VocabSetCard({ set, onPress }: VocabSetCardProps) {
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
      className="p-4 bg-muted rounded-lg border shadow border-border active:opacity-70"
      onPress={() => onPress(set.id)}
    >
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 items-center justify-center rounded-lg border border-border bg-background">
          <Text className="text-xl">{getIconDisplay(set.icon)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
            {set.title}
          </Text>
          {set.user ? (
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
          <View className="h-2 bg-secondary rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
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