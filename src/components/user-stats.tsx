import { Colors } from '@/constants/theme';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { useMemo } from 'react';
import { Text, useColorScheme, View } from 'react-native';

interface UserStatsProps {
  streak: number;
  bestStreak?: number;
  level: number;
  xp: number;
}

export function UserStats({ streak, bestStreak, level, xp }: UserStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  // Calculate which days of the week should show the flame based on streak
  const streakDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const days = [false, false, false, false, false, false, false]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

    // Map current day to our 0-6 index (Mon=0, Tue=1, ..., Sun=6)
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1;

    // Mark days with flame based on streak count
    for (let i = 0; i < streak && i < 7; i++) {
      const dayIndex = (todayIndex - i + 7) % 7;
      days[dayIndex] = true;
    }

    return days;
  }, [streak]);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Calculate XP progress to next level
  const xpProgress = useMemo(() => {
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
  }, [xp, level]);

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
      }}
      className="shadow-sm"
    >
      <View style={{ padding: 12, gap: 12 }}>
        {/* Language flags */}
        <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 4 }}>
          <Text style={{ fontSize: 16 }}>🇮🇩</Text>
          <Text style={{ fontSize: 16 }}>🇰🇷</Text>
        </View>

        {/* Top row: Level + Streak */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Level info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                height: 32,
                width: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                backgroundColor: theme.muted,
              }}
            >
              <FontAwesome name="trophy" size={16} color={theme.primary} />
            </View>
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.foreground }}>
                Level {level}
              </Text>
              <Text style={{ fontSize: 11, color: theme.mutedForeground }}>{xp} XP</Text>
            </View>
          </View>

          {/* Streak info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                height: 32,
                width: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                backgroundColor: theme.muted,
              }}
            >
              <FontAwesome name="fire" size={16} color={theme.primary} />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.foreground }}>{streak}</Text>
                <Text style={{ fontSize: 14, color: theme.foreground, fontWeight: 'bold' }}>Day streak</Text>
              </View>
              {bestStreak !== undefined && (
                <Text style={{ fontSize: 11, color: theme.mutedForeground }}>Best: {bestStreak}</Text>
              )}
            </View>
          </View>
        </View>

        {/* XP Progress bar */}
        <View style={{ width: '100%', gap: 4 }}>
          <View
            style={{
              height: 6,
              backgroundColor: theme.muted,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${xpProgress.progress}%`,
                backgroundColor: theme.primary,
                borderRadius: 3,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: theme.mutedForeground }}>
              {xpProgress.xpToNextLevel} XP to next level
            </Text>
            <Text style={{ fontSize: 10, color: theme.mutedForeground }}>
              Lv {level + 1} · {xpProgress.xpForNextLevel} XP
            </Text>
          </View>
        </View>

        {/* Streak days */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 }}>
          {dayLabels.map((label, index) => (
            <View key={index} style={{ alignItems: 'center', gap: 3 }}>
              <Text style={{ fontSize: 9, color: theme.mutedForeground }}>{label}</Text>
              <View
                style={{
                  height: 22,
                  width: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 11,
                  backgroundColor: streakDays[index] ? theme.infoMuted : theme.muted,
                }}
              >
                {streakDays[index] && (
                  <FontAwesome name="fire" size={12} color={theme.destructive} />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}