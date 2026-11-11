import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="gap-4" padding="md">
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-accent-soft">
          {icon}
        </View>
        <View className="flex-1 gap-1 pt-0.5">
          <Text className="text-body font-semibold text-foreground">{title}</Text>
          <Text className="text-caption leading-5 text-muted-foreground">
            {description}
          </Text>
        </View>
      </View>
      {action}
    </Card>
  );
}
