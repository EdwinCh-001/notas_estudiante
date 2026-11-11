import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Archive,
  Bookmark,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';
import { getNote, listCategories, updateNoteFlags, deleteNote } from '@/features/notes/notesService';
import type { Note, NoteCategory } from '@/features/notes/types';
import {
  AppScreen,
  LoadingSkeleton,
  ScreenHeading,
} from '@/features/notes/components';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { colors } = useAppTheme();
  const [note, setNote] = useState<Note | null>(null);
  const [category, setCategory] = useState<NoteCategory | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [nextNote, categories] = await Promise.all([
        getNote(userId, id),
        listCategories(userId),
      ]);
      setNote(nextNote);
      setCategory(categories.find((item) => item.id === nextNote.categoryId));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo abrir la nota.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const toggle = async (
    key: 'isFavorite' | 'isPinned' | 'isArchived',
  ) => {
    if (!note || !userId) return;
    const previous = note;
    const next = { ...note, [key]: !note[key] };
    setNote(next);
    try {
      const updated = await updateNoteFlags(userId, note.id, {
        [key]: next[key],
      });
      setNote(updated);
    } catch (error) {
      setNote(previous);
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo actualizar la nota.',
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar nota',
      'Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void removeNote(),
        },
      ],
    );
  };

  const removeNote = async () => {
    if (!note || !userId) return;
    setIsDeleting(true);
    try {
      await deleteNote(userId, note.id);
      router.replace('/notes');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo eliminar la nota.',
      );
      setIsDeleting(false);
    }
  };

  return (
    <AppScreen>
      {isLoading ? (
        <LoadingSkeleton rows={2} />
      ) : note ? (
        <View className="gap-5">
          <ScreenHeading
            back
            title="Nota"
            action={
              <Pressable
                accessibilityLabel="Editar nota"
                className="h-12 w-12 items-center justify-center rounded-full border border-border bg-card"
                onPress={() => router.push(`/notes/${note.id}/edit`)}
              >
                <Pencil color={colors.foreground} size={18} />
              </Pressable>
            }
          />
          {errorMessage ? <AuthMessage message={errorMessage} /> : null}
          <View
            className="h-1 w-full rounded-full"
            style={{ backgroundColor: note.color }}
          />
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              {category ? (
                <View className="flex-row items-center gap-1.5 rounded-badge bg-card-muted px-3 py-1.5">
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <Text className="text-overline font-medium text-foreground-secondary">
                    {category.name}
                  </Text>
                </View>
              ) : null}
              {note.isPinned ? (
                <Text className="text-overline font-medium text-primary">
                  FIJADA
                </Text>
              ) : null}
            </View>
            <Text className="text-title font-bold leading-9 text-foreground">
              {note.title}
            </Text>
            <Text className="text-overline text-muted-foreground">
              Actualizada{' '}
              {new Date(note.updatedAt).toLocaleString('es', {
                day: 'numeric',
                month: 'long',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Card className="min-h-40" padding="md">
            <Text className="text-body leading-7 text-foreground">
              {note.content || 'Esta nota todavía no tiene contenido.'}
            </Text>
          </Card>

          <View className="flex-row gap-2">
            <ActionButton
              active={note.isFavorite}
              icon={<Star color={note.isFavorite ? colors.warning : colors.mutedForeground} size={17} fill={note.isFavorite ? colors.warning : 'transparent'} />}
              label={note.isFavorite ? 'Favorita' : 'Favorito'}
              onPress={() => void toggle('isFavorite')}
            />
            <ActionButton
              active={note.isPinned}
              icon={<Bookmark color={note.isPinned ? colors.primary : colors.mutedForeground} size={17} />}
              label={note.isPinned ? 'Fijada' : 'Fijar'}
              onPress={() => void toggle('isPinned')}
            />
            <ActionButton
              active={note.isArchived}
              icon={<Archive color={colors.mutedForeground} size={17} />}
              label={note.isArchived ? 'Desarchivar' : 'Archivar'}
              onPress={() => void toggle('isArchived')}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-overline text-muted-foreground">
              Creada{' '}
              {new Date(note.createdAt).toLocaleDateString('es', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            <Pressable
              accessibilityLabel="Eliminar nota"
              className="h-12 w-12 items-center justify-center rounded-full"
              disabled={isDeleting}
              onPress={confirmDelete}
            >
              <Trash2 color={colors.danger} size={18} />
            </Pressable>
          </View>
          {isDeleting ? <Text className="text-caption text-muted-foreground">Eliminando…</Text> : null}
        </View>
      ) : (
        <View className="gap-4">
          <ScreenHeading back title="Nota no disponible" />
          <AuthMessage
            message={errorMessage || 'No se encontró esta nota en tu espacio.'}
          />
          <Button label="Volver a notas" onPress={() => router.replace('/notes')} />
        </View>
      )}
    </AppScreen>
  );
}

function ActionButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={`min-h-12 flex-1 flex-row items-center justify-center gap-1 rounded-input border px-1 ${
        active ? 'border-primary/30 bg-accent-soft' : 'border-border bg-card'
      }`}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {icon}
      <Text
        className={`text-overline font-medium ${
          active ? 'text-primary' : 'text-foreground-secondary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
