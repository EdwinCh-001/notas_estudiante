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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      <Stack.Screen name="home" options={{ animation: 'none' }} />
      <Stack.Screen name="notes/new" />
      <Stack.Screen name="notes/[id]" />
      <Stack.Screen name="notes/[id]/edit" />
      <Stack.Screen name="categories/new" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
