import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, PasswordInput } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { passwordSchema } from '@/features/auth/schemas';
import { AppScreen, ScreenHeading } from '@/features/notes/components';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const save = async () => {
    setMessage('');
    setIsSuccess(false);
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      setMessage(validation.error.issues[0]?.message ?? 'Revisa la contraseña.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }
    setIsSaving(true);
    try {
      await updatePassword(password);
      setIsSuccess(true);
      setMessage('Tu contraseña se actualizó correctamente.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.',
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
          title="Cambiar contraseña"
          subtitle="Elige una contraseña segura para tu cuenta."
        />
        <View className="gap-4">
          <PasswordInput
            autoComplete="new-password"
            label="Nueva contraseña"
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres"
            value={password}
          />
          <PasswordInput
            autoComplete="new-password"
            label="Confirmar contraseña"
            onChangeText={setConfirmPassword}
            placeholder="Escríbela de nuevo"
            value={confirmPassword}
          />
        </View>
        {message ? (
          <AuthMessage message={message} variant={isSuccess ? 'success' : 'error'} />
        ) : null}
        <Button
          fullWidth
          label={isSuccess ? 'Volver al perfil' : 'Actualizar contraseña'}
          loading={isSaving}
          onPress={() => {
            if (isSuccess) router.back();
            else void save();
          }}
        />
      </View>
    </AppScreen>
  );
}
