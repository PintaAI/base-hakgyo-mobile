/**
 * Debug utility to check authentication state in SecureStore
 * Use this to diagnose session issues
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_PREFIX = 'hakgyo_auth';

export async function debugAuthState() {
  console.log('=== AUTH DEBUG START ===');
  console.log('Platform:', Platform.OS);
  
  try {
    // Check all possible auth-related keys
    const keys = [
      `${STORAGE_PREFIX}_cookie`,
      `${STORAGE_PREFIX}_session_data`,
      `better-auth_cookie`,
      `better-auth_session_data`,
    ];
    
    for (const key of keys) {
      try {
        // Use async version for reliability
        const value = await SecureStore.getItemAsync(key);
        console.log(`Key "${key}":`, value ? `${value.substring(0, 100)}...` : 'null');
      } catch (e) {
        console.log(`Key "${key}": Error -`, e);
      }
    }
    
    // Also try sync version
    console.log('\n--- Sync access attempt ---');
    try {
      const syncValue = SecureStore.getItem(`${STORAGE_PREFIX}_cookie`);
      console.log(`Sync "${STORAGE_PREFIX}_cookie":`, syncValue ? `${syncValue.substring(0, 100)}...` : 'null');
    } catch (e) {
      console.log('Sync access error:', e);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  console.log('=== AUTH DEBUG END ===');
}

/**
 * Get the raw cookie value from SecureStore
 */
export async function getRawCookie(): Promise<string | null> {
  try {
    const cookie = await SecureStore.getItemAsync(`${STORAGE_PREFIX}_cookie`);
    return cookie;
  } catch (e) {
    console.error('Error getting cookie:', e);
    return null;
  }
}

/**
 * Parse the stored cookie JSON and return as cookie string
 */
export async function getParsedCookie(): Promise<string> {
  try {
    const cookieJson = await getRawCookie();
    if (!cookieJson) return '';
    
    const parsed = JSON.parse(cookieJson);
    return Object.entries(parsed)
      .filter(([key, value]: [string, any]) => {
        if (value.expires && new Date(value.expires) < new Date()) return false;
        return true;
      })
      .map(([key, value]: [string, any]) => `${key}=${value.value}`)
      .join('; ');
  } catch (e) {
    console.error('Error parsing cookie:', e);
    return '';
  }
}