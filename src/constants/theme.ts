/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Base colors
    text: '#000000',
    background: '#ffffff',
    foreground: '#000000',
    // Card colors
    card: '#ffffff',
    cardForeground: '#000000',
    // Background variants
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    // Border colors
    border: '#e5e7eb',
    borderFocus: '#4b5563',
    // Input colors
    input: '#f9fafb',
    inputFocus: '#ffffff',
    // Muted colors
    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
    // Text colors
    textSecondary: '#60646C',
    // Status colors
    destructive: '#ef4444',
    ring: '#4b5563',
    success: '#16a34a',
    successForeground: '#15803d',
    successMuted: '#dcfce7',
    error: '#dc2626',
    errorForeground: '#b91c1c',
    errorMuted: '#fee2e2',
    info: '#2563eb',
    infoForeground: '#1d4ed8',
    infoMuted: '#dbeafe',
    // Primary colors (neutral)
    primary: '#374151',
    primaryForeground: '#ffffff',
    // Secondary colors (neutral)
    secondary: '#6b7280',
    secondaryForeground: '#ffffff',
    // Accent colors (neutral)
    accent: '#4b5563',
    accentForeground: '#ffffff',
  },
  dark: {
    // Base colors
    text: '#ffffff',
    background: '#000000',
    foreground: '#fafafa',
    // Card colors
    card: '#141414',
    cardForeground: '#fafafa',
    // Background variants
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    // Border colors
    border: '#1a1a1a',
    borderFocus: '#9ca3af',
    // Input colors
    input: '#0d0d0d',
    inputFocus: '#000000',
    // Muted colors
    muted: '#0f0f0f',
    mutedForeground: '#737373',
    // Text colors
    textSecondary: '#B0B4BA',
    // Status colors
    destructive: '#ef4444',
    ring: '#9ca3af',
    success: '#4ade80',
    successForeground: '#86efac',
    successMuted: '#14532d',
    error: '#f87171',
    errorForeground: '#fca5a5',
    errorMuted: '#450a0a',
    info: '#60a5fa',
    infoForeground: '#93c5fd',
    infoMuted: '#1e3a5f',
    // Primary colors (neutral)
    primary: '#d1d5db',
    primaryForeground: '#000000',
    // Secondary colors (neutral)
    secondary: '#9ca3af',
    secondaryForeground: '#000000',
    // Accent colors (neutral)
    accent: '#6b7280',
    accentForeground: '#ffffff',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
