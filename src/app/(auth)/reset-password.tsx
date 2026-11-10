import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, LockKeyhole } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { Button, PasswordInput } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { AuthPage } from '@/features/auth/components/AuthPage';
import { AuthLoadingState } from '@/features/auth/components/AuthLoadingState';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { toAuthOperationError } from '@/features/auth/authErrors';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { isLoading, session, updatePassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit(async ({ password: newPassword }) => {
    setErrorMessage('');
    try {
      await updatePassword(newPassword);
      router.replace('/(protected)/home');
    } catch (error) {
      setErrorMessage(toAuthOperationError(error).message);
    }
  });

  if (isLoading) {
    return <AuthLoadingState />;
  }

  if (!session) {
    return (
      <AuthPage
        description="Solicita un enlace nuevo y vuelve a intentarlo."
        eyebrow="Enlace no disponible"
        title="No pudimos verificar el enlace"
      >
        <AuthMessage message="El enlace pudo haber vencido o ya fue utilizado. Por seguridad, solicita uno nuevo." />
        <Link href="./forgot-password" asChild>
          <Pressable className="min-h-12 flex-row items-center justify-center gap-2">
            <ArrowLeft color={colors.primary} size={16} />
            <Text className="text-label font-semibold text-primary">
              Solicitar otro enlace
            </Text>
          </Pressable>
        </Link>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      description="Elige una contraseña segura para proteger tus apuntes."
      eyebrow="Recupera el acceso"
      title="Crea una nueva contraseña"
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <PasswordInput
              autoComplete="new-password"
              error={errors.password?.message}
              label="Nueva contraseña"
              leftIcon={
                <LockKeyhole color={colors.mutedForeground} size={18} />
              }
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Escribe una nueva contraseña"
              returnKeyType="next"
              value={field.value}
            />
          )}
        />
        <PasswordStrength password={password} />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <PasswordInput
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              label="Confirma tu contraseña"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Escríbela de nuevo"
              returnKeyType="done"
              value={field.value}
              onSubmitEditing={() => void onSubmit()}
            />
          )}
        />

        <Button
          fullWidth
          label="Guardar contraseña"
          loading={isSubmitting}
          onPress={() => void onSubmit()}
          size="lg"
        />
        {errorMessage ? <AuthMessage message={errorMessage} /> : null}
      </View>
    </AuthPage>
  );
}
