import { useFocusEffect, useRouter } from 'expo-router';
import { Bookmark, Star } from 'lucide-react-native';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button, Card, Input } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';

import { createNote, getNote, listCategories, updateNote } from '../notesService';
import type { NoteCategory, NoteDraft } from '../types';
import { AppScreen, LoadingSkeleton, ScreenHeading } from '.';

export const NOTE_COLORS = [
  '#6366F1',
  '#0EA5E9',
  '#14B8A6',
  '#22C55E',
  '#F59E0B',
  '#F97316',
  '#EC4899',
  '#8B5CF6',
  '#94A3B8',
] as const;

export function NoteEditor({ noteId }: { noteId?: string }) {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { colors } = useAppTheme();
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [color, setColor] = useState<string>(NOTE_COLORS[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(noteId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!userId || !noteId) return;
    let active = true;
    void getNote(userId, noteId)
      .then((note) => {
        if (!active) return;
        setTitle(note.title);
        setContent(note.content);
        setCategoryId(note.categoryId);
        setColor(note.color);
        setIsFavorite(note.isFavorite);
        setIsPinned(note.isPinned);
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : 'No se pudo abrir la nota.',
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [noteId, userId]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let active = true;
      void listCategories(userId)
        .then((result) => {
          if (active) setCategories(result);
        })
        .catch((error: unknown) => {
          if (active) {
            setErrorMessage(
              error instanceof Error ? error.message : 'No se cargaron las categorías.',
            );
          }
        });
      return () => {
        active = false;
      };
    }, [userId]),
  );

  const save = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Añade un título para guardar esta nota.');
      return;
    }
    if (!userId) return;
    setErrorMessage('');
    setIsSaving(true);
    const draft: NoteDraft = {
      title: trimmedTitle,
      content,
      categoryId,
      color,
      isFavorite,
      isPinned,
    };
    try {
      const saved = noteId
        ? await updateNote(userId, noteId, draft)
        : await createNote(userId, draft);
      router.replace(`/notes/${saved.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo guardar la nota.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppScreen>
        <LoadingSkeleton rows={2} />
      </AppScreen>
    );
  }

  return (
    <AppScreen keyboardAware>
      <View className="gap-5">
        <ScreenHeading
          back
          title={noteId ? 'Editar nota' : 'Nueva nota'}
          subtitle="Captura la idea. El orden lo afinamos después."
        />
        {errorMessage ? <AuthMessage message={errorMessage} /> : null}
        <View className="gap-4">
          <Input
            autoCapitalize="sentences"
            autoFocus={!noteId}
            label="Título"
            maxLength={120}
            onChangeText={setTitle}
            placeholder="Una idea que quieres guardar"
            returnKeyType="next"
            value={title}
          />
          <View className="gap-1.5">
            <Text className="text-label font-medium text-foreground-secondary">
              Contenido
            </Text>
            <TextInput
              className="min-h-48 rounded-card border border-input-border bg-input px-4 py-4 text-body leading-6 text-foreground"
              multiline
              onChangeText={setContent}
              placeholder="Escribe sin preocuparte por el formato..."
              placeholderTextColor={colors.mutedForeground}
              textAlignVertical="top"
              value={content}
            />
            <Text className="text-overline text-muted-foreground">
              {content.length} caracteres
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-label font-semibold text-foreground">
              Categoría
            </Text>
            <Pressable onPress={() => router.push('/categories/new')}>
              <Text className="text-caption font-semibold text-primary">
                + Crear
              </Text>
            </Pressable>
          </View>
          {categories.length ? (
            <View className="flex-row flex-wrap gap-2">
              <CategoryChip
                label="Sin categoría"
                selected={!categoryId}
                onPress={() => setCategoryId(null)}
              />
              {categories.map((category) => (
                <CategoryChip
                  color={category.color}
                  key={category.id}
                  label={category.name}
                  onPress={() => setCategoryId(category.id)}
                  selected={categoryId === category.id}
                />
              ))}
            </View>
          ) : (
            <Text className="text-caption text-muted-foreground">
              Puedes guardar la nota sin categoría o crear una.
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-label font-semibold text-foreground">
            Color de la nota
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {NOTE_COLORS.map((item) => (
              <Pressable
                accessibilityLabel={`Elegir color ${item}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: color === item }}
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  color === item ? 'border-2 border-foreground' : ''
                }`}
                key={item}
                onPress={() => setColor(item)}
                style={{ backgroundColor: item }}
              >
                {color === item ? (
                  <View className="h-2 w-2 rounded-full bg-white" />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>

        <Card className="gap-1" padding="sm">
          <FlagSwitch
            icon={<Star color={colors.warning} size={17} />}
            label="Favorita"
            value={isFavorite}
            onValueChange={setIsFavorite}
          />
          <View className="h-px bg-border" />
          <FlagSwitch
            icon={<Bookmark color={colors.primary} size={17} />}
            label="Fijar arriba"
            value={isPinned}
            onValueChange={setIsPinned}
          />
        </Card>

        <Button
          fullWidth
          label={noteId ? 'Guardar cambios' : 'Guardar nota'}
          loading={isSaving}
          onPress={() => void save()}
        />
      </View>
    </AppScreen>
  );
}

function CategoryChip({
  label,
  selected,
  color,
  onPress,
}: {
  label: string;
  selected: boolean;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={`min-h-10 flex-row items-center gap-2 rounded-badge border px-3 ${
        selected ? 'border-primary bg-accent-soft' : 'border-border bg-card'
      }`}
      onPress={onPress}
    >
      {color ? (
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      <Text
        className={`text-caption font-medium ${
          selected ? 'text-primary' : 'text-foreground-secondary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FlagSwitch({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: ReactNode;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View className="min-h-12 flex-row items-center gap-3">
      {icon}
      <Text className="flex-1 text-label text-foreground">{label}</Text>
      <Switch
        onValueChange={onValueChange}
        thumbColor={value ? colors.primaryForeground : colors.card}
        trackColor={{ false: colors.borderStrong, true: colors.primary }}
        value={value}
      />
    </View>
  );
}
