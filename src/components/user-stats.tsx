import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { gamificationApi, StreakHistoryRecord } from 'hakgyo-expo-sdk';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const STREAK_STORAGE_KEY = '@user_stats_prev_streak';
const STREAK_HISTORY_CACHE_KEY = '@user_stats_streak_history';

// Week-based color palette for streak progression
const WEEK_COLORS = [
  '#EF4444', // Week 1: Red
  '#F97316', // Week 2: Orange
  '#EAB308', // Week 3: Yellow
  '#22C55E', // Week 4: Green
  '#06B6D4', // Week 5: Cyan
  '#3B82F6', // Week 6: Blue
  '#8B5CF6', // Week 7: Purple
  '#EC4899', // Week 8: Pink
];

// Get color for a specific week (cycles through palette)
const getWeekColor = (weekNumber: number): string => {
  return WEEK_COLORS[(weekNumber - 1) % WEEK_COLORS.length];
};

// Calculate week number from streak start (assuming streak started at day 1)
const getWeekNumberFromStreakDay = (streakDay: number): number => {
  return Math.ceil(streakDay / 7);
};

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
  
  // Use state to track previous streak from AsyncStorage
  const [prevStreak, setPrevStreak] = useState<number | null>(null);
  const isInitializedRef = useRef(false);
  
  // Streak history state for week-based coloring
  const [streakHistory, setStreakHistory] = useState<StreakHistoryRecord[]>([]);

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

  // Load previous streak from AsyncStorage on mount
  useEffect(() => {
    const loadPrevStreak = async () => {
      try {
        const storedStreak = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
        if (storedStreak !== null) {
          setPrevStreak(parseInt(storedStreak, 10));
        } else {
          // First time: initialize with current streak (no animation on first load)
          setPrevStreak(streak);
          await AsyncStorage.setItem(STREAK_STORAGE_KEY, streak.toString());
        }
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to load previous streak:', error);
        setPrevStreak(streak);
        isInitializedRef.current = true;
      }
    };
    loadPrevStreak();
  }, []);

  // Load streak history from API for week-based coloring
  useEffect(() => {
    const loadStreakHistory = async () => {
      try {
        // Try to get cached history first
        const cachedHistory = await AsyncStorage.getItem(STREAK_HISTORY_CACHE_KEY);
        if (cachedHistory) {
          setStreakHistory(JSON.parse(cachedHistory));
        }

        // Fetch fresh history from API
        const response = await gamificationApi.getStreakHistory({ limit: 30, includeCurrent: true });
        if (response.success && response.data) {
          setStreakHistory(response.data);
          // Cache the history
          await AsyncStorage.setItem(STREAK_HISTORY_CACHE_KEY, JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Failed to load streak history:', error);
        // Keep cached data if available, otherwise use empty array
      }
    };
    loadStreakHistory();
  }, [streak]); // Refresh when streak changes

  // Trigger animation when streak increases and save to AsyncStorage
  useEffect(() => {
    // Skip if not initialized yet or prevStreak is null
    if (!isInitializedRef.current || prevStreak === null) return;

    if (streak > prevStreak && prevStreak > 0) {
      triggerStreakAnimation();
    }

    // Update AsyncStorage and state with current streak
    const saveStreak = async () => {
      try {
        await AsyncStorage.setItem(STREAK_STORAGE_KEY, streak.toString());
        setPrevStreak(streak);
      } catch (error) {
        console.error('Failed to save streak:', error);
      }
    };
    saveStreak();
  }, [streak, prevStreak]);

  // Animated style for today's fire
  const todayFireStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: todayFireScale.value },
      { rotate: `${todayFireRotate.value}rad` },
    ],
  }));

  // Calculate which days of the week should show the flame with week-based colors
  const streakDaysWithColors = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Map current day to our 0-6 index (Mon=0, Tue=1, ..., Sun=6)
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1;
    
    // Initialize days with no color (neutral)
    const days: { hasFlame: boolean; color: string | null; weekNumber: number | null }[] =
      Array(7).fill(null).map(() => ({ hasFlame: false, color: null, weekNumber: null }));

    // If no streak history, use simple streak count (fallback to original behavior)
    if (streakHistory.length === 0) {
      for (let i = 0; i < streak && i < 7; i++) {
        const dayIndex = (todayIndex - i + 7) % 7;
        const streakDay = streak - i; // Current streak day number
        const weekNumber = getWeekNumberFromStreakDay(streakDay);
        days[dayIndex] = {
          hasFlame: true,
          color: getWeekColor(weekNumber),
          weekNumber,
        };
      }
      return days;
    }

    // Production: Use streak history from API for accurate week-based coloring
    // Build a map of dates to streak history records
    const historyMap = new Map<string, StreakHistoryRecord>();
    streakHistory.forEach(record => {
      const date = new Date(record.streakDate).toDateString();
      historyMap.set(date, record);
    });

    // Calculate the date for each day in the current week
    for (let i = 0; i < 7; i++) {
      const dayOffset = todayIndex - i;
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toDateString();
      
      // Check if this date has a streak record
      const record = historyMap.get(dateStr);
      if (record) {
        const weekNumber = getWeekNumberFromStreakDay(record.streakLength);
        days[i] = {
          hasFlame: true,
          color: getWeekColor(weekNumber),
          weekNumber,
        };
      }
    }

    // If we don't have full history, fill in based on current streak count
    // (for days within streak but not in history)
    for (let i = 0; i < streak && i < 7; i++) {
      const dayIndex = (todayIndex - i + 7) % 7;
      if (!days[dayIndex].hasFlame) {
        const streakDay = streak - i;
        const weekNumber = getWeekNumberFromStreakDay(streakDay);
        days[dayIndex] = {
          hasFlame: true,
          color: getWeekColor(weekNumber),
          weekNumber,
        };
      }
    }

    return days;
  }, [streak, streakHistory]);

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
          {dayLabels.map((label, index) => {
            const dayData = streakDaysWithColors[index];
            // Use a light muted background, week color only for the fire icon
            const backgroundColor = dayData.hasFlame ? theme.infoMuted : theme.muted;
            const fireColor = dayData.color || theme.destructive;
            
            return (
              <View key={index} style={{ alignItems: 'center', gap: 3 }}>
                <Text style={{ fontSize: 9, color: theme.mutedForeground }}>{label}</Text>
                <View
                  style={{
                    height: 22,
                    width: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 11,
                    backgroundColor,
                  }}
                >
                  {dayData.hasFlame && (
                    <Animated.View
                      style={index === todayDayIndex ? todayFireStyle : undefined}
                    >
                      <FontAwesome name="fire" size={12} color={fireColor} />
                    </Animated.View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

    </View>
  );
}