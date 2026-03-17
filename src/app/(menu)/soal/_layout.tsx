import { Stack } from 'expo-router';
import React from 'react';

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
    </Stack>
  );
}