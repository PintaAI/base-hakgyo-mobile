/**
 * Hook to trigger daily login gamification event
 * Automatically triggers on mount and uses server-side streak validation
 * Persists last login date to avoid unnecessary API calls
 */

import { gamificationApi } from 'hakgyo-expo-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const DAILY_LOGIN_STORAGE_KEY = '@hakgyo/daily_login_last_date';

interface DailyLoginResult {
  success: boolean;
  xpEarned?: number;
  streak?: number;
  levelsGained?: number;
  streakMilestoneReached?: boolean;
  error?: string;
}

interface DailyLoginState {
  isLoading: boolean;
  result: DailyLoginResult | null;
}

/**
 * Get today's date string in YYYY-MM-DD format using the user's timezone
 */
function getTodayDateString(timezone: string): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
  } catch {
    // Fallback to ISO date string
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Check if we already processed a daily login today
 */
async function hasLoggedInToday(timezone: string): Promise<boolean> {
  try {
    const lastLoginDate = await AsyncStorage.getItem(DAILY_LOGIN_STORAGE_KEY);
    const today = getTodayDateString(timezone);
    return lastLoginDate === today;
  } catch {
    return false;
  }
}

/**
 * Save today's date as the last login date
 */
async function saveLoginDate(timezone: string): Promise<void> {
  try {
    const today = getTodayDateString(timezone);
    await AsyncStorage.setItem(DAILY_LOGIN_STORAGE_KEY, today);
  } catch (error) {
    console.error('Failed to save daily login date:', error);
  }
}

export function useDailyLogin() {
  const [state, setState] = useState<DailyLoginState>({
    isLoading: true,
    result: null,
  });

  const hasAttemptedRef = useRef(false);

  // Get user's timezone
  const getUserTimeZone = useCallback(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Asia/Jakarta'; // Default fallback
    }
  }, []);

  // Trigger daily login event
  const triggerDailyLogin = useCallback(async () => {
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    const userTimeZone = getUserTimeZone();

    // TODO: Re-enable this check after testing UI feedback
    // Check if we already logged in today
    // const alreadyLoggedInToday = await hasLoggedInToday(userTimeZone);
    // if (alreadyLoggedInToday) {
    //   console.log('Daily login already processed today, skipping API call');
    //   setState({ isLoading: false, result: null });
    //   return;
    // }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const result = await gamificationApi.processEvent({
        event: 'DAILY_LOGIN',
        userTimeZone,
        gracePeriodHours: 4,
      });

      if (result.success && result.data) {
        const loginResult: DailyLoginResult = {
          success: true,
          xpEarned: result.data.totalXP,
          streak: result.data.currentStreak,
          levelsGained: result.data.levelsGained,
          streakMilestoneReached: result.data.streakMilestoneReached,
        };

        // Save today's date as last login
        await saveLoginDate(userTimeZone);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          result: loginResult,
        }));

        console.log('Daily login triggered!', {
          xpEarned: result.data.totalXP,
          streak: result.data.currentStreak,
          levelsGained: result.data.levelsGained,
          streakMilestoneReached: result.data.streakMilestoneReached,
          lastActiveDate: result.data.streakInfo?.lastActiveDate,
        });
      } else {
        const errorResult: DailyLoginResult = {
          success: false,
          error: result.error || 'Failed to process daily login',
        };

        setState((prev) => ({
          ...prev,
          isLoading: false,
          result: errorResult,
        }));

        console.error('Daily login failed:', result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        result: { success: false, error: errorMessage },
      }));

      console.error('Error triggering daily login:', error);
    }
  }, [getUserTimeZone]);

  // Auto-trigger on mount
  useEffect(() => {
    triggerDailyLogin();
  }, [triggerDailyLogin]);

  return {
    ...state,
    triggerDailyLogin,
  };
}