import { Platform, TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/lib/utils';

export type InputVariant = 'default' | 'filled' | 'underline';
export type InputSize = 'sm' | 'md' | 'lg';

export type InputProps = TextInputProps & {
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  containerClassName?: string;
  inputClassName?: string;
};

export function Input({
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  error = false,
  errorMessage,
  containerClassName,
  inputClassName,
  editable = true,
  placeholderTextColor,
  ...props
}: InputProps) {
  const baseInputStyles = cn(
    'flex-1 text-foreground rounded-lg',
    // Base text styling
    'text-base leading-5',
    // Placeholder color for native
    Platform.select({
      native: 'placeholder:text-muted-foreground/50',
      web: 'placeholder:text-muted-foreground',
    }),
    // Disabled state
    !editable && 'opacity-50',
    // Web-specific styles
    Platform.select({
      web: cn(
        'outline-none transition-[color,box-shadow]',
        'focus-visible:border-border-focus focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        error && 'border-destructive ring-destructive/20 dark:ring-destructive/40 ring-[3px]',
        'disabled:pointer-events-none disabled:cursor-not-allowed'
      ),
    })
  );

  const variantStyles = {
    default: cn(
      'border border-border bg-background',
      'shadow-sm shadow-black/5',
      // Focus state for native
      Platform.select({
        native: 'focus:border-border-focus',
        web: '',
      })
    ),
    filled: cn(
      'bg-muted border-transparent',
      Platform.select({
        native: 'focus:bg-input-focus',
        web: '',
      })
    ),
    underline: cn(
      'border-b border-border rounded-none bg-transparent',
      Platform.select({
        native: 'focus:border-border-focus',
        web: '',
      })
    ),
  };

  const sizeStyles = {
    sm: 'py-1.5 px-2.5 text-sm',
    md: 'py-2.5 px-3.5 text-base',
    lg: 'py-3.5 px-4 text-lg',
  };

  const inputContainerStyles = cn(
    'flex-row items-center w-full',
    variant === 'default' && 'rounded-lg',
    variant === 'filled' && 'rounded-lg',
    // Error border for container
    error && (variant === 'default' ? 'border-destructive' : '')
  );

  const leftIconStyles = 'pl-3 justify-center items-center';
  const rightIconStyles = 'pr-3 justify-center items-center';

  return (
    <View className={cn('w-full', containerClassName)}>
      <View className={inputContainerStyles}>
        {leftIcon && <View className={leftIconStyles}>{leftIcon}</View>}
        <TextInput
          className={cn(
            baseInputStyles,
            variantStyles[variant],
            sizeStyles[size],
            leftIcon && 'pl-1',
            rightIcon && 'pr-1',
            error && 'border-destructive',
            inputClassName
          )}
          placeholderTextColor={placeholderTextColor ?? '#6b7280'}
          editable={editable}
          {...props}
        />
        {rightIcon && <View className={rightIconStyles}>{rightIcon}</View>}
      </View>
      {error && errorMessage && (
        <View className="mt-1">
          <TextInput
            className="text-destructive text-xs"
            value={errorMessage}
            editable={false}
            pointerEvents="none"
          />
        </View>
      )}
    </View>
  );
}