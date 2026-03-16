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

  // Calculate progress percentage
  const itemCount = set.itemCount ?? 0;
  const learnedCount = set.learnedCount ?? 0;
  const progressPercentage = itemCount > 0 ? Math.round((learnedCount / itemCount) * 100) : 0;

  return (
    <Pressable
      className="p-4 mb-3 bg-muted rounded-lg border border-border active:opacity-70"
      onPress={() => onPress(set.id)}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">{getIconDisplay(set.icon)}</Text>
            <Text className="text-lg font-semibold text-foreground flex-1" numberOfLines={1}>
              {set.title}
            </Text>
          </View>
          {set.description ? (
            <Text className="mt-1 text-muted-foreground text-sm" numberOfLines={2}>
              {set.description}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row items-center mt-3 gap-4">
        <View className="flex-row items-center gap-1">
          <Text className="text-muted-foreground text-xs">Words:</Text>
          <Text className="text-foreground text-xs font-medium">{itemCount}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-muted-foreground text-xs">Learned:</Text>
          <Text className="text-primary text-xs font-medium">{learnedCount}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      {itemCount > 0 ? (
        <View className="mt-2">
          <View className="h-2 bg-secondary rounded-full overflow-hidden">
            <View 
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="text-xs text-muted-foreground mt-1">
            {progressPercentage}% complete
          </Text>
        </View>
      ) : null}

      {/* Author Info */}
      {set.user ? (
        <Text className="text-xs text-muted-foreground mt-2">
          by {set.user.name}
        </Text>
      ) : null}
    </Pressable>
  );
}