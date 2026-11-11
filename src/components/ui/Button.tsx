import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from 'react-native';

import { useAppTheme } from '@/hooks';
import { cn } from '@/lib';
import { layout } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'border-primary bg-primary',
  secondary: 'border-border bg-secondary',
  outline: 'border-border-strong bg-card',
  ghost: 'border-transparent bg-transparent',
};

const labelStyles: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4',
  md: 'min-h-12 px-5',
  lg: 'min-h-14 px-6',
};

const labelSizeStyles: Record<ButtonSize, string> = {
  sm: 'text-label',
  md: 'text-body',
  lg: 'text-subtitle',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  textClassName,
  disabled,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
  onPressIn,
  onPressOut,
  ...pressableProps
}: ButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === 'primary' ? colors.primaryForeground : colors.foreground;

  return (
    <Pressable
      {...pressableProps}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{
        ...accessibilityState,
        busy: loading,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-button border',
        sizeStyles[size],
        variantStyles[variant],
        fullWidth ? 'w-full self-stretch' : 'self-start',
        className,
      )}
      style={({ pressed }) => ({
        opacity: isDisabled
          ? 0.5
          : pressed
            ? layout.pressedOpacity
            : 1,
        transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
      })}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        leftIcon
      )}
      <Text
        className={cn(
          'font-semibold',
          labelSizeStyles[size],
          labelStyles[variant],
          textClassName,
        )}
      >
        {label}
      </Text>
      {!loading && rightIcon}
    </Pressable>
  );
}
