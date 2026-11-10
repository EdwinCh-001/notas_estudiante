import { Eye, EyeOff } from 'lucide-react-native';
import {
  forwardRef,
  useState,
} from 'react';
import { Pressable, type TextInputInstance } from 'react-native';

import { useAppTheme } from '@/hooks';

import { Input, type InputProps } from './Input';

export type PasswordInputProps = Omit<
  InputProps,
  'rightIcon' | 'secureTextEntry'
>;

export const PasswordInput = forwardRef<TextInputInstance, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const { colors } = useAppTheme();
    const [isVisible, setIsVisible] = useState(false);

    return (
      <Input
        ref={ref}
        {...props}
        secureTextEntry={!isVisible}
        rightIcon={
          <Pressable
            accessibilityLabel={
              isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setIsVisible((visible) => !visible)}
          >
            {isVisible ? (
              <EyeOff
                color={colors.mutedForeground}
                size={20}
                strokeWidth={2}
              />
            ) : (
              <Eye
                color={colors.mutedForeground}
                size={20}
                strokeWidth={2}
              />
            )}
          </Pressable>
        }
      />
    );
  },
);
