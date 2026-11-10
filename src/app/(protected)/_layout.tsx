import { Redirect, Stack } from 'expo-router';

import { AuthLoadingState } from '@/features/auth/components/AuthLoadingState';
import { useAuth } from '@/features/auth/useAuth';

export default function ProtectedGroupLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingState />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
