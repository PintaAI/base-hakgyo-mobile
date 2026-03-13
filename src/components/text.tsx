import { Platform, Text as RNText, StyleSheet, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextPropsType = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
  marginTop?: number;
};

export function Text({ style, type = 'default', themeColor, marginTop, ...rest }: TextPropsType) {
  const theme = useTheme();

  const spacingStyle = marginTop ? { marginTop } : {};

  return (
    <RNText
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        spacingStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: 700,
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: Fonts.sans,
      },
      default: {},
    }),
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 600,
    letterSpacing: -0.2,
    ...Platform.select({
      ios: {
        fontFamily: Fonts.sans,
      },
      default: {},
    }),
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    textDecorationLine: 'underline',
  },
  linkPrimary: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 600,
    textDecorationLine: 'underline',
  },
  code: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    fontFamily: Platform.select({
      ios: Fonts.mono,
      default: 'monospace',
    }),
  },
});