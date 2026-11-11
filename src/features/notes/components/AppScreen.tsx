import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { FlowLinesBackground } from '@/components/common';
import { ScreenContainer } from '@/components/ui';

interface AppScreenProps extends PropsWithChildren {
  scroll?: boolean;
  keyboardAware?: boolean;
}

export function AppScreen({
  children,
  scroll = true,
  keyboardAware = false,
}: AppScreenProps) {
  return (
    <View className="flex-1 bg-background">
      <FlowLinesBackground />
      <ScreenContainer
        background="transparent"
        keyboardAware={keyboardAware}
        scroll={scroll}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 28 }}
      >
        {children}
      </ScreenContainer>
    </View>
  );
}
