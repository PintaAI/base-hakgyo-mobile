import { Colors } from '@/constants/theme';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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
  const prevStreakRef = useRef(streak);

  // Animation values for weekly calendar fire
  const todayFireScale = useSharedValue(1);
  const todayFireRotate = useSharedValue(0);

  // Trigger animation function for weekly calendar only
  const triggerStreakAnimation = () => {
    // Reset to initial state first
    todayFireScale.value = 1;
    todayFireRotate.value = 0;
    
    // Scale up animation
    todayFireScale.value = withSequence(
      withTiming(2.0, { duration: 200 }), // Scale up
      // Shake animation (scale stays roughly the same during shake)
      withTiming(1.9, { duration: 80 }),
      withTiming(2.0, { duration: 80 }),
      withTiming(1.9, { duration: 80 }),
      withTiming(2.0, { duration: 80 }),
      withTiming(1.9, { duration: 80 }),
      withTiming(2.0, { duration: 80 }),
      // Scale down to normal
      withTiming(1, { duration: 150 })
    );
    
    // Shake rotation animation (starts after scale up)
    todayFireRotate.value = withSequence(
      withTiming(0, { duration: 200 }), // Wait for scale up
      // Shake left and right
      withTiming(-0.25, { duration: 80 }),
      withTiming(0.25, { duration: 80 }),
      withTiming(-0.2, { duration: 80 }),
      withTiming(0.2, { duration: 80 }),
      withTiming(-0.15, { duration: 80 }),
      withTiming(0.15, { duration: 80 }),
      withSpring(0, { damping: 12, stiffness: 200 }) // Settle to center
    );
  };

  // Trigger animation when streak increases (weekly calendar only)
  useEffect(() => {
    if (streak > prevStreakRef.current && prevStreakRef.current > 0) {
      triggerStreakAnimation();
    }
    prevStreakRef.current = streak;
  }, [streak]);

  // Animated style for today's fire
  const todayFireStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: todayFireScale.value },
      { rotate: `${todayFireRotate.value}rad` },
    ],
  }));

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

  // Get today's index for special animation
  const todayDayIndex = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    return currentDay === 0 ? 6 : currentDay - 1;
  }, []);

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
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.foreground }}>
                  {streak}
                </Text>
                <Text style={{ fontSize: 14, color: theme.foreground, fontWeight: 'bold' }}>
                  Day streak
                </Text>
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
                  <Animated.View
                    style={index === todayDayIndex ? todayFireStyle : undefined}
                  >
                    <FontAwesome name="fire" size={12} color={theme.destructive} />
                  </Animated.View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Dev button to trigger animation - floating */}
      {__DEV__ && (
        <Pressable
          onPress={triggerStreakAnimation}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: theme.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            zIndex: 10,
          }}
        >
          <Text style={{ color: theme.primaryForeground, fontSize: 10, fontWeight: 'bold' }}>
            🧪
          </Text>
        </Pressable>
      )}
    </View>
  );
}