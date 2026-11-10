import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { FlowLinesBackground } from '@/components/common';
import { ScreenContainer } from '@/components/ui';

export interface AppLayoutProps extends PropsWithChildren {
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Shared shell for authenticated surfaces. Kept ready for the future notes,
 * tasks and profile routes inside the `(protected)` group.
 */
export function AppLayout({
  children,
  scroll = true,
  contentContainerStyle,
}: AppLayoutProps) {
  return (
    <View className="flex-1 bg-background">
      <FlowLinesBackground />
      <ScreenContainer
        background="transparent"
        scroll={scroll}
        contentContainerStyle={[
          { paddingBottom: 32, paddingTop: 16 },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScreenContainer>
    </View>
  );
}
