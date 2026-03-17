import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ColorScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const colorEntries = Object.entries(theme);

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 pt-16">
        <Text className="text-2xl font-bold text-foreground mb-2">
          Colors
        </Text>
        <Text className="text-muted-foreground mb-6">
          Current mode: {colorScheme ?? 'unknown'}
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-4">
          <View className="flex-1  p-3 rounded-lg bg-primary">
            <Text className="text-primary-foreground font-semibold">Primary</Text>
          </View>
          <View className="flex-1 p-3 rounded-lg bg-secondary">
            <Text className="text-secondary-foreground font-semibold">Secondary</Text>
          </View>
          <View className="flex-1  p-3 rounded-lg bg-accent">
            <Text className="text-accent-foreground font-semibold">Accent</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2 mb-4">
          <View className="flex-1  p-3 rounded-lg bg-muted border border-border">
            <Text className="text-muted-foreground font-medium">Muted</Text>
          </View>
          <View className="flex-1 p-3 rounded-lg bg-destructive">
            <Text className="text-white font-semibold">Destructive</Text>
          </View>
        </View>

        <Text className="text-lg font-semibold text-foreground mb-3 mt-4">
          Gradient Test (CSS)
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-4">
          <View
            className="flex-1 p-4 rounded-lg"
            style={{ experimental_backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <Text className="text-white font-semibold">Linear Gradient</Text>
          </View>
          <View
            className="flex-1 p-4 rounded-lg"
            style={{ experimental_backgroundImage: 'linear-gradient(to right, #f093fb 0%, #f5576c 100%)' }}
          >
            <Text className="text-white font-semibold">Pink Gradient</Text>
          </View>
        </View>

        <View
          className="p-4 rounded-lg mb-4"
          style={{ experimental_backgroundImage: 'radial-gradient(circle at center, #84fab0 0%, #8fd3f4 100%)' }}
        >
          <Text className="text-gray-800 font-semibold text-center">Radial Gradient</Text>
        </View>

        <View
          className="p-4 rounded-lg mb-4"
          style={{
            experimental_backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
            backgroundColor: '#3b82f6'
          }}
        >
          <Text className="text-white font-semibold text-center">Overlay Gradient</Text>
        </View>

        <Text className="text-lg font-semibold text-foreground mb-3 mt-4">
          Theme Colors
        </Text>

        {colorEntries.map(([name, value]) => (
          <View key={name} className="flex-row items-center mb-2 p-2 rounded-lg bg-card border border-border">
            <View 
              className="w-14 h-14 rounded-lg mr-3 border border-border/50"
              style={{ backgroundColor: value }}
            />
            <View className="flex-1">
              <Text className="font-semibold text-foreground">{name}</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">{value}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}