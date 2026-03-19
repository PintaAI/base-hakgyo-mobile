import { Stack } from 'expo-router';
import React from 'react';

export default function TryoutLayout() {
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
          title: 'Tryouts',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[tryoutId]"
        options={{
          title: 'Tryout Details',
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}