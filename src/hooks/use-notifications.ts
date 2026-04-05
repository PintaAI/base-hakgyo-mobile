/**
 * Push Notification Hooks for Hakgyo App
 * Handles registration, receiving, and sending notifications
 * Integrates with Hakgyo backend via hakgyo-expo-sdk
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { notificationsApi } from 'hakgyo-expo-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Types
export interface NotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  permissionStatus: Notifications.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationData {
  type?: string;
  materiId?: string;
  tryoutId?: string;
  kelasId?: string;
  [key: string]: any;
}

export interface SendNotificationOptions {
  title: string;
  body: string;
  data?: NotificationData;
  sound?: 'default' | null;
}

/**
 * Get device ID for multi-device support
 */
async function getDeviceId(): Promise<string> {
  // Use model name and os version as device identifier
  const deviceInfo = [
    Device.modelName,
    Device.osName,
    Device.osVersion,
  ].filter(Boolean).join('-');
  
  return deviceInfo || 'unknown-device';
}

/**
 * Handle registration errors
 */
function handleRegistrationError(errorMessage: string): void {
  console.error('[Notifications] Registration error:', errorMessage);
  throw new Error(errorMessage);
}

/**
 * Create Android notification channels
 */
async function createNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync('materi-updates', {
      name: 'Materi Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#208AEF',
    });

    await Notifications.setNotificationChannelAsync('tryout-results', {
      name: 'Tryout Results',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });

    await Notifications.setNotificationChannelAsync('class-announcements', {
      name: 'Class Announcements',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
    });
  }
}

/**
 * Register for push notifications and get Expo push token
 */
async function registerForPushNotificationsAsync(): Promise<string> {
  // Create Android channels first
  await createNotificationChannels();

  // Check if running on physical device
  if (!Device.isDevice) {
    handleRegistrationError('Must use physical device for push notifications');
    return '';
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token for push notification!');
    return '';
  }

  // Get project ID for Expo push token
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) {
    handleRegistrationError('Project ID not found');
    return '';
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log('[Notifications] Push token:', pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`${e}`);
    return '';
  }
}

/**
 * Main hook for push notification management
 */
export function usePushNotifications() {
  const [state, setState] = useState<NotificationState>({
    expoPushToken: null,
    notification: null,
    permissionStatus: null,
    isLoading: true,
    error: null,
  });

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Register for push notifications
  const register = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get permission status
      const { status } = await Notifications.getPermissionsAsync();
      setState((prev) => ({ ...prev, permissionStatus: status }));

      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        setState((prev) => ({ ...prev, permissionStatus: newStatus }));

        if (newStatus !== 'granted') {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Permission not granted',
          }));
          return;
        }
      }

      // Get push token
      const token = await registerForPushNotificationsAsync();

      if (token) {
        // Register with Hakgyo backend
        const deviceId = await getDeviceId();
        const response = await notificationsApi.registerToken(token, deviceId);

        if (response.success) {
          console.log('[Notifications] Token registered with backend');
        } else {
          console.warn('[Notifications] Backend registration failed:', response.error);
        }

        setState((prev) => ({
          ...prev,
          expoPushToken: token,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to get push token',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  // Unregister from backend
  const unregister = useCallback(async () => {
    if (!state.expoPushToken) return;

    try {
      await notificationsApi.unregisterToken(state.expoPushToken);
      console.log('[Notifications] Token unregistered from backend');
    } catch (error) {
      console.error('[Notifications] Failed to unregister token:', error);
    }
  }, [state.expoPushToken]);

  // Setup listeners
  useEffect(() => {
    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Notifications] Received:', notification);
        setState((prev) => ({ ...prev, notification }));
      }
    );

    // Listen for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[Notifications] Response:', response);
        // Handle notification tap - can be extended for navigation
        const data = response.notification.request.content.data as NotificationData;
        handleNotificationTap(data);
      }
    );

    // Register on mount
    register();

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [register]);

  return {
    ...state,
    register,
    unregister,
  };
}

/**
 * Hook for handling notification tap events
 * Returns navigation data from notification
 */
export function useNotificationNavigation() {
  const [lastNotificationData, setLastNotificationData] = useState<NotificationData | null>(
    null
  );

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      setLastNotificationData(data);
    });

    return () => subscription.remove();
  }, []);

  const clearNotificationData = useCallback(() => {
    setLastNotificationData(null);
  }, []);

  return {
    lastNotificationData,
    clearNotificationData,
  };
}

/**
 * Handle notification tap based on data type
 */
function handleNotificationTap(data: NotificationData): void {
  if (!data?.type) {
    console.log('[Notifications] No type in notification data');
    return;
  }

  // This can be extended with navigation logic
  switch (data.type) {
    case 'NEW_MATERI':
      console.log('[Notifications] Navigate to materi:', data.materiId);
      break;
    case 'TRYOUT_RESULT':
      console.log('[Notifications] Navigate to tryout result:', data.tryoutId);
      break;
    case 'CLASS_ANNOUNCEMENT':
      console.log('[Notifications] Navigate to class:', data.kelasId);
      break;
    default:
      console.log('[Notifications] Unknown notification type:', data.type);
  }
}

/**
 * Send a push notification via Expo's push service
 * Note: This is for testing purposes. Production notifications should be sent from backend.
 */
export async function sendPushNotification(
  expoPushToken: string,
  options: SendNotificationOptions
): Promise<void> {
  const { title, body, data, sound = 'default' } = options;

  const message = {
    to: expoPushToken,
    sound,
    title,
    body,
    data: data || {},
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.status}`);
    }

    console.log('[Notifications] Notification sent successfully');
  } catch (error) {
    console.error('[Notifications] Failed to send notification:', error);
    throw error;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds: number,
  data?: NotificationData
): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });

    console.log('[Notifications] Scheduled notification:', identifier);
    return identifier;
  } catch (error) {
    console.error('[Notifications] Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('[Notifications] Cancelled notification:', identifier);
  } catch (error) {
    console.error('[Notifications] Failed to cancel notification:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Clear all notifications from badge and notification center
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Set badge count (iOS)
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Get badge count (iOS)
 */
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

// Export types
export type {
    NotificationData as NotificationDataType, NotificationState as NotificationStateType, SendNotificationOptions as SendNotificationOptionsType
};

