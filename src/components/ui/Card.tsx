import {
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';

import { useAppTheme } from '@/hooks';
import { cn } from '@/lib';

export type CardVariant = 'default' | 'muted' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantStyles: Record<CardVariant, string> = {
  default: 'border-border bg-card',
  muted: 'border-border bg-card-muted',
  elevated: 'border-border bg-card',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  style,
  children,
  ...viewProps
}: CardProps) {
  const { colorScheme } = useAppTheme();
  const elevatedStyle =
    variant === 'elevated'
      ? {
          ...styles.elevated,
          shadowOpacity: colorScheme === 'dark' ? 0.28 : 0.06,
        }
      : undefined;

  return (
    <View
      {...viewProps}
      className={cn(
        'rounded-card border',
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      style={[elevatedStyle, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  elevated: {
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
  },
});
