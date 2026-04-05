import { ActiveTryoutBanner, Background, DailySoal, DailyVocab, MenuHeader, UserStats } from '@/components';
import { useKelas } from '@/contexts/kelas-context';
import { useActiveTryouts } from '@/hooks/use-active-tryouts';
import { useDailyLogin } from '@/hooks/use-daily-login';
import { router } from 'expo-router';
import { useAuth } from 'hakgyo-expo-sdk';
import { Bell, Grid2X2, Book } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';

export default function MenuScreen() {
  const { user, refreshSession } = useAuth();
  const { isLoading, result } = useDailyLogin();
  const { joinedKelas, selectedKelas, setSelectedKelas, isLoading: kelasLoading, refreshJoinedKelas } = useKelas();
  const { activeTryouts, loading: tryoutsLoading, refetch: refetchTryouts } = useActiveTryouts();
  const hasRefreshedRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
    { id: 'all', label: 'Semua Kelas', icon: Grid2X2 },
    ...joinedKelas.map(kelas => ({
      id: String(kelas.id),
      label: kelas.title,
      thumbnail: kelas.thumbnail,
      icon: kelas.thumbnail ? undefined : Book,
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

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshSession(),
        refreshJoinedKelas(),
        refetchTryouts(),
      ]);
      // Increment refresh key to trigger DailyVocab and DailySoal refresh
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshSession, refreshJoinedKelas, refetchTryouts]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View className="flex-1 ">
        <Background />
        <MenuHeader
          title={selectedKelas?.title ?? 'Hakgyo'}
          subtitle={user?.name ? `안녕하세요, ${user.name}!` : '안녕하세요!'}
          leftIconImage={selectedKelas?.thumbnail ? { uri: selectedKelas.thumbnail } : require('@/assets/images/favicon.png')}
          rightIcon={Bell}
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
          contentContainerStyle={{ gap: 10, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366f1"
              colors={['#6366f1']}
            />
          }
        >
          {user && (
            <UserStats
              streak={user.currentStreak ?? 0}
              bestStreak={user.longestStreak}
              level={user.level ?? 1}
              xp={user.xp ?? 0}
            />
          )}
          <ActiveTryoutBanner tryouts={activeTryouts} />
          <DailyVocab key={`vocab-${refreshKey}`} />
          <DailySoal key={`soal-${refreshKey}`} />

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}