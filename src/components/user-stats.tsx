import { useMemo } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { Colors } from '@/constants/theme';

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
    <View style={{ gap: 5 }}>
      {/* Level card with XP progress */}
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

          {/* Level info */}
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
                Level {level}
              </Text>
              <Text style={{ fontSize: 12, color: theme.mutedForeground }}>{xp} XP</Text>
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
                Lv {level + 1} · {xpProgress.xpForNextLevel} XP
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Streak card */}
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
        <View style={{ alignItems: 'center', gap: 4, padding: 12 }}>
          <View style={{ width: '100%' }}>
            {/* Streak header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <FontAwesome name="fire" size={16} color={theme.destructive} />
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.foreground }}>{streak}</Text>
                <Text style={{ fontSize: 12, color: theme.mutedForeground }}>Login streak</Text>
              </View>
              {bestStreak !== undefined && bestStreak > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 10, color: theme.mutedForeground }}>Best:</Text>
                  <Text style={{ fontWeight: '600', fontSize: 12, color: theme.primary }}>{bestStreak}</Text>
                </View>
              )}
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
        </View>
      </View>
    </View>
  );
}