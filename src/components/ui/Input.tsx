import {
  forwardRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

import { useAppTheme } from '@/hooks';
import { cn } from '@/lib';

export interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export const Input = forwardRef<TextInputInstance, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    containerClassName,
    inputClassName,
    onBlur,
    onFocus,
    editable = true,
    ...textInputProps
  },
  ref,
) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text className="text-label font-medium text-foreground-secondary">
          {label}
        </Text>
      ) : null}

      <View
        className={cn(
          'min-h-12 flex-row items-center gap-2.5 rounded-input border bg-input px-4',
          hasError
            ? 'border-danger'
            : isFocused
              ? 'border-primary'
              : 'border-input-border',
          !editable && 'opacity-60',
        )}
      >
        {leftIcon}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.mutedForeground}
          selectionColor={colors.primary}
          {...textInputProps}
          editable={editable}
          className={cn(
            'flex-1 py-3 text-body text-foreground',
            inputClassName,
          )}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />
        {rightIcon}
      </View>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-caption text-danger"
        >
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-caption text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );
});
