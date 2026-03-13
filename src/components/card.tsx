import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './text';
import { View } from './view';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export type CardProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
  children?: React.ReactNode;
};

export function Card({
  title,
  subtitle,
  description,
  variant = 'default',
  style,
  onPress,
  children,
}: CardProps) {
  const theme = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: theme.backgroundSelected,
        };
      default:
        return {};
    }
  };

  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement },
        getVariantStyles(),
        style,
      ]}
    >
      {title && (
        <Text type="subtitle" style={styles.title}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {description && (
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {description}
        </Text>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.half,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});