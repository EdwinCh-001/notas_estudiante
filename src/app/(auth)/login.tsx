import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, Pressable, Text, View } from 'react-native';

import { Button, Card, Input, PasswordInput } from '@/components/ui';
import { AuthPage } from '@/features/auth/components/AuthPage';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { toAuthOperationError } from '@/features/auth/authErrors';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage('');
    try {
      await signIn(values);
    } catch (error) {
      setErrorMessage(toAuthOperationError(error).message);
    }
  });

  return (
    <AuthPage
      description="Retoma tus ideas y sigue avanzando con tu semestre."
      title="Qué bueno verte."
    >
      <View className="gap-5">
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
              returnKeyType="next"
              value={field.value}
            />
          )}
        />

        <View className="gap-1">
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                autoComplete="current-password"
                error={errors.password?.message}
                label="Contraseña"
                leftIcon={<LockKeyhole color={colors.mutedForeground} size={18} />}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Tu contraseña"
                returnKeyType="done"
                value={field.value}
                onSubmitEditing={() => void onSubmit()}
              />
            )}
          />
          <Link href="./forgot-password" asChild>
            <Pressable className="min-h-11 self-end justify-center">
              <Text className="text-label font-semibold text-primary">
                Olvidé mi contraseña
              </Text>
            </Pressable>
          </Link>
        </View>

        <Button
          disabled={!isValid}
          fullWidth
          label="Iniciar Sesión"
          loading={isSubmitting}
          onPress={() => void onSubmit()}
          rightIcon={
            <ArrowRight
              color={colors.primaryForeground}
              size={18}
              strokeWidth={2.2}
            />
          }
          size="lg"
        />

        {errorMessage ? <AuthMessage message={errorMessage} /> : null}

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-caption text-muted-foreground">o continúa con</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <Button
          fullWidth
          label="Continuar con Google"
          leftIcon={
            <Image
              accessibilityLabel="Google"
              resizeMode="contain"
              source={require('../../../assets/google-g-logo.png')}
              style={{ width: 20, height: 20 }}
            />
          }
          onPress={() => undefined}
          variant="outline"
        />

        <Card className="flex-row items-center justify-center gap-1" padding="sm">
          <Text className="text-label text-muted-foreground">
            ¿Aún no tienes cuenta?
          </Text>
          <Link href="./register" asChild>
            <Pressable className="min-h-11 justify-center px-1">
              <Text className="text-label font-semibold text-primary">
                Crear Cuenta
              </Text>
            </Pressable>
          </Link>
        </Card>
      </View>
    </AuthPage>
  );
}
