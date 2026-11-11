import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks';

interface ScreenHeadingProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
}

export function ScreenHeading({
  title,
  subtitle,
  back = false,
  action,
}: ScreenHeadingProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <View className="mb-6 flex-row items-center gap-3">
      {back ? (
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-full border border-border bg-card"
          onPress={() => router.back()}
        >
          <ChevronLeft color={colors.foreground} size={21} />
        </Pressable>
      ) : null}
      <View className="flex-1 gap-1">
        <Text className="text-title font-bold tracking-tight text-foreground">
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-caption text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
