import { cn } from '@/lib/utils';
import * as AvatarPrimitive from '@rn-primitives/avatar';
import { createContext, useContext, ReactNode } from 'react';
import { Text } from 'react-native';

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const AvatarSizeContext = createContext<AvatarSize>('md');

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-24',
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: 'text-sm',
  md: 'text-md',
  lg: 'text-lg',
  xl: 'text-5xl',
};

function Avatar({
  className,
  size = 'md',
  children,
  ...props
}: AvatarPrimitive.RootProps &
  React.RefAttributes<AvatarPrimitive.RootRef> & { size?: AvatarSize }) {
  return (
    <AvatarSizeContext.Provider value={size}>
      <AvatarPrimitive.Root
        className={cn(sizeClasses[size], 'relative shrink-0 overflow-hidden rounded-full', className)}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
    </AvatarSizeContext.Provider>
  );
}

function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.ImageProps & React.RefAttributes<AvatarPrimitive.ImageRef>) {
  return <AvatarPrimitive.Image className={cn('aspect-square size-full', className)} {...props} />;
}

function AvatarFallback({
  className,
  name,
  ...props
}: AvatarPrimitive.FallbackProps &
  React.RefAttributes<AvatarPrimitive.FallbackRef> & { name?: string }) {
  const size = useContext(AvatarSizeContext);
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'bg-muted flex size-full flex-row items-center justify-center rounded-full',
        className
      )}
      {...props}
    >
      <Text className={cn('font-semibold text-primary-foreground', textSizeClasses[size])}>
        {getInitials(name)}
      </Text>
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarFallback, AvatarImage };
export type { AvatarSize };