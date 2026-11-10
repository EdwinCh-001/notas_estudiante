import {
  useRef,
  type ComponentRef,
  type PropsWithChildren,
} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  type Edge,
} from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { useAppTheme, useResponsive } from '@/hooks';
import { layout } from '@/theme/tokens';

const StyledSafeAreaView = withUniwind(SafeAreaView);

export interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  keyboardAware?: boolean;
  edges?: Edge[];
  background?: 'default' | 'transparent';
  className?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function ScreenContainer({
  children,
  scroll = true,
  keyboardAware = false,
  edges = ['top', 'bottom'],
  background = 'default',
  className,
  style,
  contentContainerStyle,
}: ScreenContainerProps) {
  const { colors } = useAppTheme();
  const { screenPadding } = useResponsive();
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView> | null>(null);

  return (
    <StyledSafeAreaView
      edges={edges}
      className={className}
      style={[
        styles.root,
        {
          backgroundColor:
            background === 'transparent'
              ? 'transparent'
              : colors.background,
        },
        style,
      ]}
    >
      {scroll ? (
        <ScrollView
          className="flex-1"
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            {
              maxWidth: layout.maxContentWidth,
              paddingHorizontal: screenPadding,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            keyboardAware
              ? Platform.OS === 'ios'
                ? 'interactive'
                : 'on-drag'
              : 'none'
          }
          onFocusCapture={
            keyboardAware
              ? (event) => {
                  const focusedInput = event.target;

                  if (focusedInput == null) {
                    return;
                  }

                  requestAnimationFrame(() => {
                    scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
                      focusedInput,
                      24,
                      true,
                    );
                  });
                }
              : undefined
          }
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          className="flex-1"
          style={[
            styles.content,
            {
              maxWidth: layout.maxContentWidth,
              paddingHorizontal: screenPadding,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </StyledSafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    alignSelf: 'center',
    flexGrow: 1,
    paddingBottom: 32,
    width: '100%',
  },
  content: {
    alignSelf: 'center',
    flex: 1,
    width: '100%',
  },
});
