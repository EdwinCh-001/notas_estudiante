import { NotebookPen } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { APP_NAME } from '@/constants';
import { useAppTheme } from '@/hooks';

export interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary">
        <NotebookPen
          color={colors.primaryForeground}
          size={18}
          strokeWidth={2.2}
        />
      </View>
      {!compact ? (
        <Text className="text-label font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </Text>
      ) : null}
    </View>
  );
}
