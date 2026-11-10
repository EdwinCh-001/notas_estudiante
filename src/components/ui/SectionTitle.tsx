import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/lib';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export function SectionTitle({
  title,
  subtitle,
  eyebrow,
  action,
  className,
  titleClassName,
}: SectionTitleProps) {
  return (
    <View className={cn('flex-row items-start gap-4', className)}>
      <View className="flex-1 gap-1.5">
        {eyebrow ? (
          <Text className="text-overline font-semibold uppercase text-primary">
            {eyebrow}
          </Text>
        ) : null}
        <Text
          accessibilityRole="header"
          className={cn(
            'text-heading font-semibold text-foreground',
            titleClassName,
          )}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-body text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
