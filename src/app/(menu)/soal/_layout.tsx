import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function soalLayout() {
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
          title: 'Question Banks',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[practiceId]"
        options={{
          title: 'Practice',
          headerShown: false,
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1.0],
          sheetExpandsWhenScrolledToEdge: false,
          ...(Platform.OS === 'android' && {
            contentStyle: { backgroundColor: 'transparent' },
          }),
        }}
      />
      <Stack.Screen
        name="tryout"
        options={{
          headerShown: false,
          
        }}
      />
    </Stack>
  );
}