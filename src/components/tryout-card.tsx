import { Tryout } from 'hakgyo-expo-sdk';
import { Pressable, Text, View } from 'react-native';

interface TryoutCardProps {
  tryout: Tryout;
  onPress: (id: number) => void;
}

export function TryoutCard({ tryout, onPress }: TryoutCardProps) {
  const participantCount = tryout._count?.participants ?? 0;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isExpired = new Date(tryout.endTime) < new Date();
  const isUpcoming = new Date(tryout.startTime) > new Date();

  return (
    <Pressable
      className="p-4 bg-card rounded-lg border border-border active:opacity-70"
      onPress={() => onPress(tryout.id)}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
            {tryout.nama}
          </Text>
          {tryout.description && (
            <Text className="mt-1 text-muted-foreground text-sm" numberOfLines={2}>
              {tryout.description}
            </Text>
          )}
        </View>
        {isExpired && (
          <View className="bg-muted px-2 py-1 rounded">
            <Text className="text-xs text-muted-foreground">Ended</Text>
          </View>
        )}
        {isUpcoming && !isExpired && (
          <View className="bg-primary/10 px-2 py-1 rounded">
            <Text className="text-xs text-primary">Upcoming</Text>
          </View>
        )}
        {!isExpired && !isUpcoming && tryout.isActive && (
          <View className="bg-green-500/10 px-2 py-1 rounded">
            <Text className="text-xs text-green-600">Active</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center mt-3 gap-4 flex-wrap">
        <View className="flex-row items-center gap-1">
          <Text className="text-muted-foreground text-xs">⏱️ {tryout.duration} mins</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-muted-foreground text-xs">👥 {participantCount} participants</Text>
        </View>
        {tryout.passingScore && (
          <View className="flex-row items-center gap-1">
            <Text className="text-muted-foreground text-xs">✓ {tryout.passingScore}% to pass</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-muted-foreground">
            {formatDate(tryout.startTime)} - {formatDate(tryout.endTime)}
          </Text>
        </View>
        {tryout.kelas && (
          <Text className="text-xs text-muted-foreground">{tryout.kelas.title}</Text>
        )}
      </View>
    </Pressable>
  );
}