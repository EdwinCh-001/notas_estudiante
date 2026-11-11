import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { AuthLoadingState } from '@/features/auth/components/AuthLoadingState';
import {
  exchangeOAuthCodeForSession,
  parseOAuthCallbackUrl,
} from '@/features/auth/authService';
import { toAuthOperationError } from '@/features/auth/authErrors';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function GoogleAuthCallbackScreen() {
  const router = useRouter();
  const {
    callbackUrl: callbackUrlParam,
    code: codeParam,
    error: errorParam,
    error_description: errorDescriptionParam,
  } = useLocalSearchParams<{
    callbackUrl?: string | string[];
    code?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();
  const callbackUrl = firstParam(callbackUrlParam);
  const code = firstParam(codeParam);
  const callbackError =
    firstParam(errorDescriptionParam) ?? firstParam(errorParam);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const completeAuthentication = async () => {
      try {
        const callback = callbackUrl
          ? parseOAuthCallbackUrl(callbackUrl)
          : { code, error: firstParam(errorParam), errorDescription: callbackError };

        if (callback.error || callback.errorDescription) {
          throw new Error('Google no pudo completar la autenticación. Inténtalo de nuevo.');
        }

        if (!callback.code) {
          throw new Error('El callback de Google no contiene un código de autenticación.');
        }

        await exchangeOAuthCodeForSession(callback.code);

        if (active) {
          router.replace('/(protected)/home');
        }
      } catch (error) {
        if (active) {
          setErrorMessage(toAuthOperationError(error).message);
        }
      }
    };

    void completeAuthentication();

    return () => {
      active = false;
    };
  }, [callbackError, callbackUrl, code, errorParam, router]);

  if (!errorMessage) {
    return <AuthLoadingState />;
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <View className="gap-5">
        <Text className="text-title font-semibold text-foreground">
          No pudimos iniciar sesión
        </Text>
        <AuthMessage message={errorMessage} />
        <Link href="/(auth)/login" asChild>
          <Pressable className="min-h-12 items-center justify-center rounded-button border border-border bg-card">
            <Text className="text-label font-semibold text-foreground">
              Volver al inicio de sesión
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
