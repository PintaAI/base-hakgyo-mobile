import { View as RNView, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ViewPropsType = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
  marginTop?: number;
  padding?: number;
  paddingTop?: number;
  flex?: number;
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
};

export function View({ style, lightColor, darkColor, type, marginTop, padding, paddingTop, flex, alignItems, justifyContent, ...otherProps }: ViewPropsType) {
  const theme = useTheme();

  const spacingStyle: Record<string, number | string> = {};
  if (marginTop) spacingStyle.marginTop = marginTop;
  if (padding) spacingStyle.padding = padding;
  if (paddingTop) spacingStyle.paddingTop = paddingTop;
  if (flex) spacingStyle.flex = flex;
  if (alignItems) spacingStyle.alignItems = alignItems;
  if (justifyContent) spacingStyle.justifyContent = justifyContent;

  return <RNView style={[{ backgroundColor: theme[type ?? 'background'] }, spacingStyle, style]} {...otherProps} />;
}