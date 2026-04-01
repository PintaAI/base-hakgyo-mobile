import { ActiveTryout } from '@/hooks/use-active-tryouts';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Clock, ChevronRight, FileText } from 'lucide-react-native';

interface ActiveTryoutBannerProps {
  tryouts: ActiveTryout[];
}

export function ActiveTryoutBanner({ tryouts }: ActiveTryoutBannerProps) {
  if (tryouts.length === 0) {
    return null;
  }

  const firstTryout = tryouts[0];
  const additionalCount = tryouts.length - 1;

  const handlePress = () => {
    router.push('/(menu)/soal/tryout' as never);
  };

  return (
    <Pressable
      className="bg-primary/10 border border-primary/30 rounded-lg p-4 mx-2 active:opacity-80"
      onPress={handlePress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="bg-primary/20 rounded-full p-2">
            <FileText size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-primary">
              {additionalCount > 0 ? 'Tryout Aktif Tersedia!' : 'Tryout Aktif Tersedia!'}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
              {firstTryout.nama}
              {additionalCount > 0 && ` +${additionalCount} lainnya`}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-2">
          {firstTryout.timeRemaining && (
            <View className="bg-primary/20 px-2 py-1 rounded flex-row items-center gap-1">
              <Clock size={12} className="text-primary" />
              <Text className="text-xs font-medium text-primary">
                {firstTryout.timeRemaining}
              </Text>
            </View>
          )}
          <ChevronRight size={20} className="text-primary" />
        </View>
      </View>
      
      {tryouts.length > 1 && (
        <View className="mt-2 pt-2 border-t border-primary/20">
          <Text className="text-xs text-muted-foreground">
            Kamu punya {tryouts.length} tryout aktif yang menunggu
          </Text>
        </View>
      )}
    </Pressable>
  );
}