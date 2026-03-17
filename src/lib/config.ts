/**
 * API Configuration
 * Dynamically sets the base URL based on the environment:
 * - Development (simulator/emulator): http://localhost:3000
 * - Development (real device): Auto-detects development machine IP from Expo
 * - Production: https://hakgyo.vercel.app
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect if we're in development mode
// In Expo, __DEV__ is true during development builds and false in production
const isDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;

// Get local host IP for real device testing
// Set EXPO_PUBLIC_LOCAL_HOST_IP in .env to your machine's IP address (fallback)
// e.g., EXPO_PUBLIC_LOCAL_HOST_IP=192.168.1.100
const LOCAL_HOST_IP = process.env.EXPO_PUBLIC_LOCAL_HOST_IP;

/**
 * Get the development machine's IP address from Expo
 * This works automatically when running on Expo Go or dev client
 */
const getDevServerIp = (): string | null => {
  // Get the debugger host from Expo Constants
  // This contains the development machine's IP address when running on a real device
  const debuggerHost = Constants.expoConfig?.hostUri;
  
  if (debuggerHost) {
    // Remove the port number if present (e.g., "192.168.1.100:8081" -> "192.168.1.100")
    const hostWithoutPort = debuggerHost.split(':')[0];
    return hostWithoutPort;
  }
  
  return null;
};

// Base URL configuration
const getBaseUrl = (): string => {
  if (!isDevelopment) {
    return 'https://hakgyo.vercel.app';
  }
  
  // Try to get the development machine's IP from Expo
  const devServerIp = getDevServerIp();
  
  // Priority: Expo detected IP > Env variable IP > localhost
  const hostIp = devServerIp || LOCAL_HOST_IP;
  
  if (hostIp) {
    return `http://${hostIp}:3000`;
  }
  
  // Fallback to localhost (works for simulators/emulators)
  return 'http://localhost:3000';
};

export const BASE_URL = getBaseUrl();

// Log the base URL being used (helpful for debugging on real devices)
const devServerIp = getDevServerIp();
console.log(`[Config] BASE_URL: ${BASE_URL}`);
console.log(`[Config] Platform: ${Platform.OS}, isDev: ${isDevelopment}`);
console.log(`[Config] DevServer IP: ${devServerIp || 'not detected'}, Env IP: ${LOCAL_HOST_IP || 'not set'}`);

// API version (can be extended for versioning)
export const API_VERSION = 'v1';

// Full API URL
export const API_URL = `${BASE_URL}/api/${API_VERSION}`;

// Export environment flag for use in components
export const IS_DEV = isDevelopment;