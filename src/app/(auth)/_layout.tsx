import { Redirect, Stack, useSegments } from 'expo-router';

import { AuthLoadingState } from '@/features/auth/components/AuthLoadingState';
import { useAuth } from '@/features/auth/useAuth';

export default function AuthGroupLayout() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const isPasswordResetRoute =
    segments.join('/') === '(auth)/reset-password';

  if (isLoading) {
    return <AuthLoadingState />;
  }

  if (session && !isPasswordResetRoute) {
    return <Redirect href="/(protected)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
