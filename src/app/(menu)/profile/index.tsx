import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { router } from 'expo-router';
import { useAuth } from 'hakgyo-expo-sdk';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JoinedKelasList } from '@/components/joined-kelas-list';
import { Background } from '@/components/themed-background';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useKelas } from '@/contexts/kelas-context';
import { usePushNotifications } from '@/hooks/use-notifications';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const { user, signOut, refreshSession } = useAuth();
  const { joinedKelas, isLoading, error, refreshJoinedKelas } = useKelas();
  const { unregister } = usePushNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    try {
      // Unregister push notifications before signing out
      await unregister();
      await signOut();
      router.push('/auth');
    } catch (error) {
      // Handle sign out error silently
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshSession(),
        refreshJoinedKelas(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshSession, refreshJoinedKelas]);

  const theme = useTheme();

  // Calculate which days of the week should show the flame based on streak
  const streakDays = useMemo(() => {
    if (!user?.currentStreak) return [false, false, false, false, false, false, false];
    
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const days = [false, false, false, false, false, false, false]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

    // Map current day to our 0-6 index (Mon=0, Tue=1, ..., Sun=6)
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1;

    // Mark days with flame based on streak count
    for (let i = 0; i < user.currentStreak && i < 7; i++) {
      const dayIndex = (todayIndex - i + 7) % 7;
      days[dayIndex] = true;
    }

    return days;
  }, [user?.currentStreak]);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Calculate XP progress to next level
  const xpProgress = useMemo(() => {
    if (!user) return { progress: 0, xpToNextLevel: 0, xpForCurrentLevel: 0, xpForNextLevel: 0 };
    
    const level = user.level || 1;
    const xp = user.xp || 0;
    const xpForCurrentLevel = (level - 1) * (level - 1) * 100;
    const xpForNextLevel = level * level * 100;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progress = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
    const xpToNextLevel = xpNeededForNextLevel - xpInCurrentLevel;

    return {
      progress,
      xpToNextLevel,
      xpForCurrentLevel,
      xpForNextLevel,
    };
  }, [user]);

  // Format XP with commas
  const formatXP = (xp: number) => {
    return xp.toLocaleString();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Background />
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90 }}
      >
        <View style={{ padding: 16, gap: 12 }}>
          {/* Profile Header Card with Stats */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: 'hidden',
            }}
          >
            <View style={{ padding: 16, gap: 16 }}>
              {/* Language flags */}
              <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 4 }}>
                <Text style={{ fontSize: 16 }}>🇮🇩</Text>
                <Text style={{ fontSize: 16 }}>🇰🇷</Text>
              </View>

              {/* Profile info */}
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Avatar size="xl" alt={user?.name || 'User avatar'}>
                  <AvatarImage source={{ uri: user?.image }} />
                  <AvatarFallback name={user?.name} style={{ backgroundColor: theme.primary }} />
                </Avatar>
                <Text style={{ fontWeight: 'bold', fontSize: 24, color: theme.foreground }}>
                  {user?.name || 'User Profile'}
                </Text>
                <Text style={{ fontSize: 14, color: theme.mutedForeground }}>
                  {user?.email || 'No email'}
                </Text>
                {user?.role && (
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      backgroundColor: theme.primary + '1A',
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>
                      {user.role}
                    </Text>
                  </View>
                )}
              </View>

              {/* Level info with XP progress */}
              {user && (
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        height: 36,
                        width: 36,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 18,
                        backgroundColor: theme.muted,
                      }}
                    >
                      <FontAwesome name="trophy" size={18} color={theme.primary} />
                    </View>
                    <View>
                      <Text style={{ fontWeight: 'bold', fontSize: 20, color: theme.foreground }}>
                        Level {user.level}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.mutedForeground }}>
                        {formatXP(user.xp)} XP
                      </Text>
                    </View>
                  </View>

                  {/* XP Progress bar */}
                  <View style={{ width: '100%', gap: 6 }}>
                    <View
                      style={{
                        height: 8,
                        backgroundColor: theme.muted,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${xpProgress.progress}%`,
                          backgroundColor: theme.primary,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, color: theme.mutedForeground }}>
                        {xpProgress.xpToNextLevel} XP to next level
                      </Text>
                      <Text style={{ fontSize: 10, color: theme.mutedForeground }}>
                        Lv {user.level + 1} · {xpProgress.xpForNextLevel} XP
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Streak section */}
              {user && (
                <View style={{ width: '100%' }}>
                  {/* Streak header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <FontAwesome name="fire" size={16} color={theme.destructive} />
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.foreground }}>
                      {user.currentStreak}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.mutedForeground }}>Login streak</Text>
                  </View>

                  {/* Streak days */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {dayLabels.map((label, index) => (
                      <View key={index} style={{ alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 10, color: theme.mutedForeground }}>{label}</Text>
                        <View
                          style={{
                            height: 24,
                            width: 24,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 12,
                            backgroundColor: streakDays[index] ? theme.primary : theme.muted,
                          }}
                        >
                          {streakDays[index] && (
                            <FontAwesome name="fire" size={14} color={theme.primaryForeground} />
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Joined Kelas List */}
          <JoinedKelasList
            joinedKelas={joinedKelas}
            isLoading={isLoading}
            error={error}
          />

          {/* Login/Logout Button */}
          <Pressable
            onPress={user ? handleSignOut : () => router.push('/auth')}
            style={{
              backgroundColor: user ? theme.destructive : theme.primary,
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 8,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <FontAwesome name={user ? 'sign-out' : 'sign-in'} size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
              {user ? 'Logout' : 'Login'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}