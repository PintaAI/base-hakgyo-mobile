import { useTheme } from '@/hooks/use-theme';
import * as LucideIcons from 'lucide-react-native';

export interface IconRendererProps {
  name?: string | null;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Renders a Lucide icon from API icon names (e.g., "FaBookOpen" -> BookOpen).
 * Automatically uses theme-appropriate color if not specified.
 */
export function IconRenderer({ name, size = 24, color, strokeWidth = 2 }: IconRendererProps) {
  const theme = useTheme();
  const iconColor = color ?? theme.foreground;

  // Strip "Fa" prefix and convert to PascalCase
  const iconName = name?.replace(/^Fa/, '').replace(/[-_\s]+(.)?/g, (_, c) => c?.toUpperCase() ?? '') || 'BookOpen';
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[iconName] ?? LucideIcons.BookOpen;

  return <Icon size={size} color={iconColor} strokeWidth={strokeWidth} />;
}

export default IconRenderer;