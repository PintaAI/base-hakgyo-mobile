import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function VocabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Vocabulary',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Vocabulary Set',
          headerShown: false,
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1.0],
          sheetExpandsWhenScrolledToEdge: false,
          // Make Android window transparent so inner View rounded corners are visible
          ...(Platform.OS === 'android' && {
            contentStyle: { backgroundColor: 'transparent' },
          }),
        }}
      />
    </Stack>
  );
}