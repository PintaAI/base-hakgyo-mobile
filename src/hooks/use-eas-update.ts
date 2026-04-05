import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert } from 'react-native';

/**
 * Hook to handle EAS Update checks and notifications
 * - Checks for updates on app launch (skipped in dev mode)
 * - Shows an alert when updates are available
 * - Allows users to restart and apply updates
 */
export function useEASUpdate() {
  useEffect(() => {
    if (__DEV__) return; // Skip in development

    const checkForUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          const result = await Updates.fetchUpdateAsync();
          if (result.isNew) {
            Alert.alert(
              'Update Available',
              'A new version is available. Restart to apply the update.',
              [
                { text: 'Later', style: 'cancel' },
                {
                  text: 'Restart',
                  onPress: () => Updates.reloadAsync(),
                },
              ]
            );
          }
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    };

    checkForUpdate();
  }, []);
}