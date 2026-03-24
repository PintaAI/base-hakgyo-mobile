import { Background, MenuHeader, UserStats, DailyVocab } from '@/components';
import { useKelas } from '@/contexts/kelas-context';
import { useDailyLogin } from '@/hooks/use-daily-login';
import { useAuth, Kelas } from 'hakgyo-expo-sdk';
import { router } from 'expo-router';
import React, { useEffect, useRef, useMemo } from 'react';
import { ScrollView, View } from 'react-native';

export default function MenuScreen() {
  const { user, refreshSession } = useAuth();
  const { isLoading, result } = useDailyLogin();
  const { joinedKelas, selectedKelas, setSelectedKelas, isLoading: kelasLoading } = useKelas();
  const hasRefreshedRef = useRef(false);

  // Refresh user stats after daily login completes successfully
  useEffect(() => {
    if (!isLoading && result?.success && !hasRefreshedRef.current) {
      hasRefreshedRef.current = true;
      // Refresh session to get updated user stats (XP, level, streak)
      refreshSession();
    }
  }, [isLoading, result?.success, refreshSession]);

  // Convert joined kelas to submenu items with "All" option
  const kelasSubmenuItems = useMemo(() => [
    { id: 'all', label: 'Semua Kelas' },
    ...joinedKelas.map(kelas => ({
      id: String(kelas.id),
      label: kelas.title,
    })),
  ], [joinedKelas]);

  // Handle kelas selection from dropdown
  const handleKelasChange = (item: { id: string; label: string }) => {
    if (item.id === 'all') {
      setSelectedKelas(null);
    } else {
      const kelas = joinedKelas.find(k => String(k.id) === item.id);
      if (kelas) {
        setSelectedKelas(kelas);
      }
    }
  };

  // Get selected kelas id for the dropdown (use 'all' when no kelas selected)
  const selectedKelasId = selectedKelas ? String(selectedKelas.id) : 'all';

  return (
    <View className="flex-1 ">
      <Background />
      <MenuHeader
        title={selectedKelas?.title ?? 'Hakgyo'}
        subtitle={user?.name ? `안녕하세요, ${user.name}!` : '안녕하세요!'}
        leftIconImage={require('@/assets/images/favicon.png')}
        rightIconName="bell"
        onRightIconPress={() => router.push('/notification')}
        dailyLoginState={{
          isLoading,
          xpEarned: result?.xpEarned,
          streak: result?.streak,
          levelsGained: result?.levelsGained,
          streakMilestoneReached: result?.streakMilestoneReached,
        }}
        submenu={kelasSubmenuItems.length > 0}
        submenuItems={kelasSubmenuItems}
        selectedSubmenuId={selectedKelasId}
        onSubmenuChange={handleKelasChange}
      />
        <ScrollView
          className="flex-1 px-2 pt-5"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ gap: 10 }}
        >
          {user && (
            <UserStats
              streak={user.currentStreak ?? 0}
              bestStreak={user.longestStreak}
              level={user.level ?? 1}
              xp={user.xp ?? 0}
            />
          )}
          
          <DailyVocab />
        </ScrollView>
    </View>
  );
}