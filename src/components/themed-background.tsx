import { ImageBackground, type ImageStyle, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';

// Note: file is named "bakcground.png" (typo in asset filename)
const backgroundImage = require('@/assets/bakcground.png');

interface BackgroundProps {
  lightOpacity?: number;
  darkOpacity?: number;
  imageStyle?: ImageStyle;
}

/**
 * Absolute-fill repeating background image.
 * Drop this as the FIRST child inside any screen root View/SafeAreaView.
 * Light mode: image as-is with low opacity.
 * Dark mode: image color-inverted (tintColor white) with low opacity.
 */
export function Background({
  lightOpacity = 0.06,
  darkOpacity = 0.04,
  imageStyle,
}: BackgroundProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="repeat"
      style={StyleSheet.absoluteFillObject}
      imageStyle={[
        {
          opacity: isDark ? darkOpacity : lightOpacity,
          tintColor: isDark ? '#ffffff' : undefined,
        },
        imageStyle,
      ]}
    />
  );
}
