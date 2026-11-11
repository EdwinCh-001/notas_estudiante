import {
  ChevronRight,
  KeyRound,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { Card } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { getStudentProfile } from '@/features/profile/profileService';
import type { StudentProfile } from '@/features/profile/types';
import { useAppTheme } from '@/hooks';
import {
  AppScreen,
  LoadingSkeleton,
  ScreenHeading,
} from '@/features/notes/components';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const userId = session?.user.id;
  const { colors } = useAppTheme();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const nextProfile = await getStudentProfile(userId);
      setProfile(nextProfile);
      setAvatarFailed(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo cargar el perfil.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const fullName = [profile?.firstName, profile?.lastName]
    .filter((name): name is string => Boolean(name?.trim()))
    .join(' ');
  const name = fullName || profile?.username || 'Mi perfil';

  const handleSignOut = async () => {
    setErrorMessage('');
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo cerrar la sesión.',
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AppScreen>
      <View className="gap-5">
        <ScreenHeading
          title="Perfil"
          subtitle="Tu cuenta y tus preferencias."
        />
        {errorMessage ? <AuthMessage message={errorMessage} /> : null}
        {isLoading ? (
          <LoadingSkeleton rows={2} />
        ) : profile ? (
          <>
            <Card className="overflow-hidden p-0" padding="none" variant="elevated">
              <View className="h-16 bg-accent-soft" />
              <View className="items-center gap-3 px-5 pb-5" style={{ marginTop: -38 }}>
                <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-accent-soft">
                  {profile.avatarUrl && !avatarFailed ? (
                    <Image
                      accessibilityLabel={`Foto de ${name}`}
                      className="h-full w-full"
                      onError={() => setAvatarFailed(true)}
                      source={{ uri: profile.avatarUrl }}
                    />
                  ) : (
                    <Text className="text-title font-bold text-primary">
                      {name.slice(0, 1).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View className="items-center gap-1">
                  <Text className="text-heading font-bold text-foreground">
                    {name}
                  </Text>
                  <Text className="text-caption text-muted-foreground">
                    @{profile.username}
                  </Text>
                </View>
                <View className="rounded-badge border border-border bg-card px-3 py-1">
                  <Text className="text-overline font-medium text-foreground-secondary">
                    {providerName(profile.provider)}
                  </Text>
                </View>
                <View className="h-px w-full bg-border" />
                <View className="w-full gap-3">
                  <ProfileDetail label="Email" value={profile.email} />
                  <ProfileDetail
                    label="Cuenta desde"
                    value={new Date(profile.createdAt).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  />
                </View>
              </View>
            </Card>

            <View className="gap-2">
              <Text className="px-1 text-overline font-semibold uppercase tracking-widest text-muted-foreground">
                CUENTA
              </Text>
              <Card padding="none">
                <ProfileAction
                  icon={<UserRound color={colors.foregroundSecondary} size={18} />}
                  label="Editar perfil"
                  onPress={() => router.push('/profile/edit')}
                />
                <View className="mx-4 h-px bg-border" />
                <ProfileAction
                  icon={<KeyRound color={colors.foregroundSecondary} size={18} />}
                  label="Cambiar contraseña"
                  onPress={() => router.push('/change-password')}
                />
                <View className="mx-4 h-px bg-border" />
                <ProfileAction
                  icon={<Settings color={colors.foregroundSecondary} size={18} />}
                  label="Configuración"
                  onPress={() => router.push('/settings')}
                />
              </Card>
            </View>

            <Card className="flex-row items-center gap-3" padding="sm">
              <ShieldCheck color={colors.success} size={19} />
              <Text className="flex-1 text-caption text-muted-foreground">
                Tus datos personales están asociados a tu cuenta.
              </Text>
            </Card>
            <Pressable
              accessibilityRole="button"
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-button border border-danger/30 bg-danger-soft"
              disabled={isSigningOut}
              onPress={() => void handleSignOut()}
            >
              <LogOut color={colors.danger} size={17} />
              <Text className="text-label font-semibold text-danger">
                {isSigningOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </Text>
            </Pressable>
          </>
        ) : (
          <Card className="gap-3">
            <Text className="text-body font-semibold text-foreground">
              No encontramos tu perfil
            </Text>
            <Text className="text-caption text-muted-foreground">
              Vuelve a cargar los datos de tu cuenta.
            </Text>
            <Pressable onPress={() => void load()}>
              <Text className="text-label font-semibold text-primary">
                Reintentar
              </Text>
            </Pressable>
          </Card>
        )}
      </View>
    </AppScreen>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text className="text-caption text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-caption font-medium text-foreground">
        {value}
      </Text>
    </View>
  );
}

function ProfileAction({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      className="min-h-14 flex-row items-center gap-3 px-4"
      onPress={onPress}
    >
      {icon}
      <Text className="flex-1 text-label font-medium text-foreground">
        {label}
      </Text>
      <ChevronRight color={colors.mutedForeground} size={17} />
    </Pressable>
  );
}

function providerName(provider: string): string {
  if (provider === 'google') return 'Google';
  if (provider === 'email') return 'Email y contraseña';
  return provider;
}
