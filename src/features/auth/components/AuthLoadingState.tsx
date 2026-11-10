import { ActivityIndicator, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks';

export function AuthLoadingState() {
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background">
      <ActivityIndicator color={colors.primary} size="large" />
      <Text className="text-caption text-muted-foreground">
        Preparando tu espacio...
      </Text>
    </View>
  );
}
