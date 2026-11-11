import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { AppScreen, ScreenHeading } from '@/features/notes/components';
import { getStudentProfile, updateStudentProfile } from '@/features/profile/profileService';
import type { StudentProfile } from '@/features/profile/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const current = await getStudentProfile(userId);
      setProfile(current);
      setFirstName(current.firstName ?? '');
      setLastName(current.lastName ?? '');
      setUsername(current.username);
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

  const save = async () => {
    setErrorMessage('');
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,20}$/.test(normalizedUsername)) {
      setErrorMessage(
        'El username debe tener entre 3 y 20 caracteres: letras, números, puntos, guiones o guiones bajos.',
      );
      return;
    }
    if (!userId) return;

    setIsSaving(true);
    try {
      const updated = await updateStudentProfile(userId, {
        firstName,
        lastName,
        username: normalizedUsername,
      });
      setProfile(updated);
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo guardar el perfil.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppScreen keyboardAware>
      <View className="gap-5">
        <ScreenHeading
          back
          title="Editar perfil"
          subtitle="Actualiza la información que te identifica."
        />
        {errorMessage ? <AuthMessage message={errorMessage} /> : null}
        <View className="gap-4">
          <Input
            autoCapitalize="words"
            editable={!isLoading}
            label="Nombre"
            onChangeText={setFirstName}
            placeholder="Tu nombre"
            value={firstName}
          />
          <Input
            autoCapitalize="words"
            editable={!isLoading}
            label="Apellido"
            onChangeText={setLastName}
            placeholder="Tu apellido"
            value={lastName}
          />
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            label="Nombre de usuario"
            onChangeText={setUsername}
            placeholder="usuario_123"
            value={username}
          />
          <View className="gap-1">
            <Text className="text-label font-medium text-foreground-secondary">
              Email
            </Text>
            <Text className="text-caption text-muted-foreground">
              {profile?.email ?? 'El email no se puede cambiar desde aquí.'}
            </Text>
          </View>
        </View>
        <Button
          fullWidth
          label="Guardar cambios"
          loading={isSaving}
          onPress={() => void save()}
        />
      </View>
    </AppScreen>
  );
}
