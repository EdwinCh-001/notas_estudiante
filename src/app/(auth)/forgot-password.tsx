import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { ArrowLeft, Check, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { Button, Card, Input } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { AuthPage } from '@/features/auth/components/AuthPage';
import { toAuthOperationError } from '@/features/auth/authErrors';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();
  const { requestPasswordReset } = useAuth();
  const [sentTo, setSentTo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async () => {
    setErrorMessage('');
    try {
      await requestPasswordReset(getValues('email').trim());
      setSentTo(getValues('email').trim());
    } catch (error) {
      setErrorMessage(toAuthOperationError(error).message);
    }
  });

  return (
    <AuthPage
      description="Recupera el acceso a tu espacio de estudio en unos pasos."
      eyebrow="Recupera el acceso"
      title={sentTo ? 'Revisa tu email' : '¿Olvidaste tu contraseña?'}
    >
      {sentTo ? (
        <Card className="items-center gap-4" padding="lg">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
            <Check color={colors.accent} size={26} strokeWidth={2.5} />
          </View>
          <Text className="text-center text-body text-foreground-secondary">
            Si existe una cuenta asociada a{' '}
            <Text className="font-semibold text-foreground">{sentTo}</Text>,
            recibirás instrucciones para restablecer tu contraseña.
          </Text>
          <Button
            label="Enviar otro enlace"
            onPress={() => {
              setSentTo('');
              setErrorMessage('');
            }}
            variant="ghost"
          />
        </Card>
      ) : (
        <View className="gap-5">
          <Text className="text-body text-foreground-secondary">
            Escribe el email asociado a tu cuenta. Si la dirección está
            registrada, te enviaremos los pasos para recuperar el acceso. Por
            seguridad, no confirmaremos si existe una cuenta con ese email.
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email?.message}
                keyboardType="email-address"
                label="Email"
                leftIcon={<Mail color={colors.mutedForeground} size={18} />}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="tu@email.com"
                returnKeyType="send"
                value={field.value}
                onSubmitEditing={() => void onSubmit()}
              />
            )}
          />

          <Button
            disabled={!isValid}
            fullWidth
            label="Enviar enlace"
            loading={isSubmitting}
            onPress={() => void onSubmit()}
            size="lg"
          />
          {errorMessage ? <AuthMessage message={errorMessage} /> : null}
        </View>
      )}

      <Link href="./login" asChild>
        <Pressable className="min-h-12 flex-row items-center justify-center gap-2">
          <ArrowLeft color={colors.primary} size={16} />
          <Text className="text-label font-semibold text-primary">
            Volver a Iniciar Sesión
          </Text>
        </Pressable>
      </Link>
    </AuthPage>
  );
}
