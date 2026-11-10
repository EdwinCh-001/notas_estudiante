import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FlowLinesBackground } from '@/components/common';
import { ScreenContainer } from '@/components/ui';

export interface AuthLayoutProps extends PropsWithChildren {
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Shared shell for pre-authentication surfaces (welcome, sign in, sign up).
 * It owns the ambient background so every auth screen feels consistent.
 */
export function AuthLayout({
  children,
  scroll = true,
  contentContainerStyle,
}: AuthLayoutProps) {
  return (
    <View className="flex-1 bg-background">
      <FlowLinesBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        enabled={scroll}
        keyboardVerticalOffset={0}
      >
        <ScreenContainer
          background="transparent"
          keyboardAware
          scroll={scroll}
          contentContainerStyle={[
            { justifyContent: 'center', paddingVertical: 24 },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScreenContainer>
      </KeyboardAvoidingView>
    </View>
  );
}
