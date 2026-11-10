import { useState } from 'react';
import { Text, View } from 'react-native';

import { BrandMark } from '@/components/common';
import { AppLayout } from '@/components/layouts';
import { Button, Card, SectionTitle } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { toAuthOperationError } from '@/features/auth/authErrors';
import { useAuth } from '@/features/auth/useAuth';

/**
 * Temporary destination that proves the navigation shell works. It does not
 * contain notes or authentication logic; the real notes experience will live
 * under this protected route group.
 */
export default function ProtectedHomeScreen() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignOut = async () => {
    setErrorMessage('');
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setErrorMessage(toAuthOperationError(error).message);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AppLayout>
      <View className="flex-1 justify-center gap-8">
        <BrandMark />

        <SectionTitle
          eyebrow="Próximamente"
          subtitle="Tus notas, tareas y apuntes académicos vivirán aquí. Estamos preparando el espacio perfecto para organizar tu semestre."
          title="Tu espacio está listo"
        />

        <Card className="gap-4">
          <View className="gap-1">
            <Text className="text-label font-semibold text-foreground">
              Todo en un solo lugar
            </Text>
            <Text className="text-body text-muted-foreground">
              Apuntes por materia, tareas pendientes y fechas de examen, sin
              ruido.
            </Text>
          </View>
          <View className="h-px bg-border" />
          <Text className="text-caption text-muted-foreground">
            Vuelve pronto para comenzar.
          </Text>
        </Card>

        {errorMessage ? <AuthMessage message={errorMessage} /> : null}

        <Button
          fullWidth
          label="Cerrar sesión"
          loading={isSigningOut}
          onPress={handleSignOut}
          variant="outline"
        />
      </View>
    </AppLayout>
  );
}
