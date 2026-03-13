import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  marginTop?: number;
  onPress: () => void;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  marginTop,
  onPress,
}: ButtonProps) {
  const theme = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundElement;
    switch (variant) {
      case 'primary':
        return theme.text;
      case 'secondary':
        return theme.backgroundElement;
      case 'outline':
      case 'ghost':
        return 'transparent';
    }
  };

  const getTextColorKey = (): ThemeColor => {
    if (disabled) return 'textSecondary';
    switch (variant) {
      case 'primary':
        return 'background';
      case 'secondary':
        return 'text';
      case 'outline':
      case 'ghost':
        return 'text';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: Spacing.one, paddingHorizontal: Spacing.two };
      case 'md':
        return { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three };
      case 'lg':
        return { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four };
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? theme.textSecondary : theme.text;
    }
    return 'transparent';
  };

  const spacingStyle = marginTop ? { marginTop } : {};

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        getPadding(),
        pressed && !disabled && styles.pressed,
        spacingStyle,
        style,
      ]}
    >
      {loading ? (
        <Text themeColor={getTextColorKey()}>Loading...</Text>
      ) : (
        <Text themeColor={getTextColorKey()} style={{ fontWeight: '600' }}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});