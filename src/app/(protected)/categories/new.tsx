import { useRouter } from 'expo-router';
import { BookOpen, BriefcaseBusiness, FlaskConical, Folder, Lightbulb } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';
import { AppScreen, ScreenHeading } from '@/features/notes/components';
import { createCategory } from '@/features/notes/notesService';

const colorsPalette = [
  '#6366F1',
  '#0EA5E9',
  '#14B8A6',
  '#22C55E',
  '#F59E0B',
  '#F97316',
  '#EC4899',
  '#8B5CF6',
  '#94A3B8',
];

const icons = [
  { value: 'folder', label: 'Carpeta', Icon: Folder },
  { value: 'book', label: 'Lectura', Icon: BookOpen },
  { value: 'work', label: 'Trabajo', Icon: BriefcaseBusiness },
  { value: 'science', label: 'Ciencia', Icon: FlaskConical },
  { value: 'ideas', label: 'Ideas', Icon: Lightbulb },
] as const;

export default function NewCategoryScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { colors } = useAppTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorsPalette[0]);
  const [icon, setIcon] = useState('folder');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const save = async () => {
    if (!name.trim()) {
      setErrorMessage('Escribe un nombre para la categoría.');
      return;
    }
    if (!session?.user.id) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      await createCategory(session.user.id, { name, color, icon });
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo crear la categoría.',
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
          title="Nueva categoría"
          subtitle="Un nombre claro hace que tus notas se encuentren rápido."
        />
        {errorMessage ? <AuthMessage message={errorMessage} /> : null}
        <Input
          autoCapitalize="sentences"
          autoFocus
          label="Nombre"
          maxLength={40}
          onChangeText={setName}
          placeholder="Por ejemplo, Lecturas"
          value={name}
        />
        <View className="gap-2">
          <Text className="text-label font-semibold text-foreground">
            Color
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {colorsPalette.map((item) => (
              <Pressable
                accessibilityLabel={`Elegir color ${item}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: item === color }}
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  item === color ? 'border-2 border-foreground' : ''
                }`}
                key={item}
                onPress={() => setColor(item)}
                style={{ backgroundColor: item }}
              >
                {item === color ? (
                  <View className="h-2 w-2 rounded-full bg-white" />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
        <View className="gap-2">
          <Text className="text-label font-semibold text-foreground">
            Icono
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {icons.map(({ value, label, Icon }) => {
              const selected = icon === value;
              return (
                <Pressable
                  accessibilityLabel={label}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  className={`h-12 w-12 items-center justify-center rounded-input border ${
                    selected ? 'border-primary bg-accent-soft' : 'border-border bg-card'
                  }`}
                  key={value}
                  onPress={() => setIcon(value)}
                >
                  <Icon
                    color={selected ? colors.primary : colors.mutedForeground}
                    size={19}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
        <Button
          fullWidth
          label="Crear categoría"
          loading={isSaving}
          onPress={() => void save()}
        />
      </View>
    </AppScreen>
  );
}
