import type { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

import { BrandMark } from '@/components/common';
import { AuthLayout } from '@/components/layouts';
import { useAuth } from '@/features/auth/useAuth';

import { AuthMessage } from './AuthMessage';

interface AuthPageProps extends PropsWithChildren {
  title: string;
  description: string;
  eyebrow?: string;
}

export function AuthPage({
  children,
  title,
  description,
  eyebrow = 'Tu espacio académico',
}: AuthPageProps) {
  const { configurationError, initializationError } = useAuth();
  const providerError =
    initializationError?.message ?? configurationError ?? null;

  return (
    <AuthLayout>
      <View className="gap-7">
        <BrandMark />

        <View className="gap-2">
          <Text className="text-overline font-semibold uppercase text-primary">
            {eyebrow}
          </Text>
          <Text className="text-title font-semibold text-foreground">
            {title}
          </Text>
          <Text className="text-body text-muted-foreground">
            {description}
          </Text>
        </View>

        {providerError ? <AuthMessage message={providerError} /> : null}

        {children}
      </View>
    </AuthLayout>
  );
}
