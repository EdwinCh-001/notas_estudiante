import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { ArrowRight, AtSign, Mail, UserRound } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Pressable,
  Text,
  View,
  type TextInputInstance,
} from 'react-native';

import { Button, Input, PasswordInput } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { AuthPage } from '@/features/auth/components/AuthPage';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { toAuthOperationError } from '@/features/auth/authErrors';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const { signUp } = useAuth();
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const lastNameRef = useRef<TextInputInstance>(null);
  const usernameRef = useRef<TextInputInstance>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmPasswordRef = useRef<TextInputInstance>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit(async (values) => {
    setNotice('');
    setErrorMessage('');
    try {
      const result = await signUp({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        password: values.password,
      });

      if (result.emailConfirmationRequired) {
        setNotice(
          'Tu cuenta se creó. Revisa tu correo y confirma la dirección para iniciar sesión.',
        );
      }
    } catch (error) {
      setErrorMessage(toAuthOperationError(error).message);
    }
  });

  return (
    <AuthPage
      description="Crea tu espacio para organizar ideas, tareas y apuntes."
      eyebrow="Comienza aquí"
      title="Crear cuenta"
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <Input
              autoCapitalize="words"
              error={errors.firstName?.message}
              label="Nombre"
              leftIcon={<UserRound color={colors.mutedForeground} size={18} />}
              onSubmitEditing={() => lastNameRef.current?.focus()}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Tu nombre"
              ref={field.ref}
              returnKeyType="next"
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <Input
              autoCapitalize="words"
              error={errors.lastName?.message}
              label="Apellido"
              leftIcon={<UserRound color={colors.mutedForeground} size={18} />}
              onSubmitEditing={() => usernameRef.current?.focus()}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Tu apellido"
              ref={(input) => {
                field.ref(input);
                lastNameRef.current = input;
              }}
              returnKeyType="next"
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="username"
          render={({ field }) => (
            <Input
              autoCapitalize="none"
              autoComplete="username-new"
              autoCorrect={false}
              error={errors.username?.message}
              keyboardType="default"
              label="Nombre de usuario"
              leftIcon={<AtSign color={colors.mutedForeground} size={18} />}
              onSubmitEditing={() => emailRef.current?.focus()}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="tu_usuario"
              ref={(input) => {
                field.ref(input);
                usernameRef.current = input;
              }}
              returnKeyType="next"
              value={field.value}
            />
          )}
        />

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
              onSubmitEditing={() => passwordRef.current?.focus()}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="tu@email.com"
              ref={(input) => {
                field.ref(input);
                emailRef.current = input;
              }}
              returnKeyType="next"
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <PasswordInput
              autoComplete="new-password"
              error={errors.password?.message}
              label="Contraseña"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Crea una contraseña"
              ref={(input) => {
                field.ref(input);
                passwordRef.current = input;
              }}
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
              label="Confirmar contraseña"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Escríbela de nuevo"
              ref={(input) => {
                field.ref(input);
                confirmPasswordRef.current = input;
              }}
              returnKeyType="done"
              value={field.value}
            />
          )}
        />

        <Button
          disabled={!isValid}
          fullWidth
          label="Crear Cuenta"
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
        {notice ? (
          <AuthMessage message={notice} variant="success" />
        ) : null}

        <View className="flex-row flex-wrap items-center justify-center gap-1">
          <Text className="text-label text-muted-foreground">
            ¿Ya tienes cuenta?
          </Text>
          <Link href="./login" asChild>
            <Pressable className="min-h-11 justify-center px-1">
              <Text className="text-label font-semibold text-primary">
                Iniciar Sesión
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthPage>
  );
}
