import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Text } from '@/components/text';
import { View as ViewComponent } from '@/components/view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ColorScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const colorEntries = Object.entries(theme);

  return (
    <ViewComponent style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text type="title" style={styles.title}>
          Colors
        </Text>
        <Text style={styles.subtitle}>
          Current mode: {colorScheme ?? 'unknown'}
        </Text>

        {colorEntries.map(([name, value]) => (
          <ViewComponent key={name} style={styles.colorRow}>
            <ViewComponent style={[styles.colorBox, { backgroundColor: value }]} />
            <ViewComponent style={styles.colorInfo}>
              <Text type="smallBold">{name}</Text>
              <Text type="small" style={styles.colorValue}>
                {value}
              </Text>
            </ViewComponent>
          </ViewComponent>
        ))}
      </ScrollView>
    </ViewComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    paddingTop: Spacing.six,
  },
  title: {
    marginBottom: Spacing.two,
  },
  subtitle: {
    marginBottom: Spacing.four,
    opacity: 0.7,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
    padding: Spacing.two,
    borderRadius: 8,
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorInfo: {
    flex: 1,
  },
  colorValue: {
    opacity: 0.7,
    marginTop: Spacing.half,
  },
});