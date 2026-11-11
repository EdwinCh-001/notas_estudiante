import { Link, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Search, StickyNote } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';
import {
  listCategories,
  listNotes,
  updateNoteFlags,
} from '@/features/notes/notesService';
import type { Note, NoteCategory, NoteFilter } from '@/features/notes/types';
import {
  AppScreen,
  EmptyState,
  NoteRow,
  NotesFeed,
  ScreenHeading,
} from '@/features/notes/components';

const PAGE_SIZE = 30;
const filters: { key: NoteFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'favorites', label: 'Favoritas' },
  { key: 'pinned', label: 'Fijadas' },
  { key: 'archived', label: 'Archivadas' },
];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function NotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    filter?: string | string[];
    categoryId?: string | string[];
  }>();
  const requestedFilter = firstParam(params.filter);
  const requestedCategory = firstParam(params.categoryId) || undefined;
  const filter: NoteFilter = filters.some((item) => item.key === requestedFilter)
    ? (requestedFilter as NoteFilter)
    : 'all';
  const categoryId = requestedCategory;
  const { session } = useAuth();
  const userId = session?.user.id;
  const { colors } = useAppTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setErrorMessage('');
    setIsLoading(true);
    setHasMore(true);
    try {
      const [nextNotes, nextCategories] = await Promise.all([
        listNotes(userId, { filter, categoryId, limit: PAGE_SIZE }),
        listCategories(userId),
      ]);
      setNotes(nextNotes);
      setHasMore(nextNotes.length === PAGE_SIZE);
      setCategories(nextCategories);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar las notas.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, filter, userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const loadMore = async () => {
    if (!userId || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextNotes = await listNotes(userId, {
        filter,
        categoryId,
        limit: PAGE_SIZE,
        offset: notes.length,
      });
      setNotes((current) => [...current, ...nextNotes]);
      setHasMore(nextNotes.length === PAGE_SIZE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar más notas.',
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const updateFlag = async (
    note: Note,
    key: 'isFavorite' | 'isPinned' | 'isArchived',
  ) => {
    if (!userId) return;
    const previous = notes;
    const nextValue = !note[key];
    setNotes((current) =>
      current.map((item) =>
        item.id === note.id ? { ...item, [key]: nextValue } : item,
      ),
    );
    try {
      await updateNoteFlags(userId, note.id, { [key]: nextValue });
      const leavesCurrentFilter =
        (key === 'isArchived' &&
          ((filter !== 'archived' && nextValue) ||
            (filter === 'archived' && !nextValue))) ||
        (key === 'isFavorite' && filter === 'favorites' && !nextValue) ||
        (key === 'isPinned' && filter === 'pinned' && !nextValue);
      if (leavesCurrentFilter) {
        setNotes((current) => current.filter((item) => item.id !== note.id));
      }
    } catch (error) {
      setNotes(previous);
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo actualizar la nota.',
      );
    }
  };

  const selectedCategory = categories.find((category) => category.id === categoryId);
  const header = (
    <View className="mb-5 gap-5">
      <ScreenHeading
        title={selectedCategory?.name ?? 'Tus notas'}
        subtitle="Tus ideas, ordenadas por lo que editaste más recientemente."
        action={
          <Link href="/notes/new" asChild>
            <Pressable
              accessibilityLabel="Crear nota"
              className="h-12 w-12 items-center justify-center rounded-full bg-primary"
            >
              <Plus color={colors.primaryForeground} size={22} />
            </Pressable>
          </Link>
        }
      />
      <Pressable
        className="min-h-12 flex-row items-center gap-3 rounded-input border border-border bg-card px-4"
        onPress={() => router.push('/search')}
      >
        <Search color={colors.mutedForeground} size={18} />
        <Text className="flex-1 text-body text-muted-foreground">
          Buscar en tus notas
        </Text>
      </Pressable>
      <ScrollView
        contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filters.map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              className={`min-h-10 justify-center rounded-badge border px-4 ${
                active ? 'border-primary bg-primary' : 'border-border bg-card'
              }`}
              key={item.key}
              onPress={() =>
                router.setParams({ filter: item.key, categoryId: '' })
              }
            >
              <Text
                className={`text-caption font-semibold ${
                  active ? 'text-primary-foreground' : 'text-foreground-secondary'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {categories.length ? (
        <ScrollView
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Pressable
            className={`min-h-9 justify-center rounded-badge px-3 ${
              !categoryId ? 'bg-accent-soft' : 'bg-transparent'
            }`}
            onPress={() => router.setParams({ categoryId: '' })}
          >
            <Text className="text-overline font-semibold text-foreground-secondary">
              Todas las categorías
            </Text>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              className={`min-h-9 flex-row items-center gap-1.5 rounded-badge px-3 ${
                categoryId === category.id ? 'bg-accent-soft' : 'bg-transparent'
              }`}
              key={category.id}
              onPress={() => router.setParams({ categoryId: category.id })}
            >
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <Text className="text-overline font-medium text-foreground-secondary">
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {errorMessage ? <AuthMessage message={errorMessage} /> : null}
    </View>
  );

  const empty = errorMessage ? (
    <Card className="gap-3" padding="md">
      <Text className="text-label font-semibold text-foreground">
        No pudimos cargar tus notas
      </Text>
      <Text className="text-caption text-muted-foreground">
        Revisa tu conexión e inténtalo nuevamente.
      </Text>
      <Button label="Reintentar" onPress={() => void load()} size="sm" />
    </Card>
  ) : (
    <EmptyState
      description={
        filter === 'favorites'
          ? 'Marca una nota con la estrella y la tendrás siempre a mano.'
          : filter === 'pinned'
            ? 'Fija las notas importantes para encontrarlas primero.'
            : filter === 'archived'
              ? 'Las notas que archives aparecerán aquí.'
              : categoryId
                ? 'Aún no hay notas en esta categoría.'
                : 'Guarda ideas, apuntes o recordatorios en un espacio tranquilo.'
      }
      icon={<StickyNote color={colors.primary} size={22} />}
      title={
        filter === 'favorites'
          ? 'Sin favoritas todavía'
          : filter === 'pinned'
            ? 'Sin notas fijadas'
            : filter === 'archived'
              ? 'Sin notas archivadas'
              : 'Aún no hay notas'
      }
      action={
        filter === 'all' ? (
          <Button
            label="Crear una nota"
            leftIcon={<Plus color={colors.primaryForeground} size={17} />}
            onPress={() => router.push('/notes/new')}
          />
        ) : null
      }
    />
  );

  return (
    <AppScreen scroll={false}>
      <NotesFeed
        empty={empty}
        hasMore={hasMore}
        header={header}
        loading={isLoading}
        loadingMore={isLoadingMore}
        notes={notes}
        onLoadMore={() => void loadMore()}
        renderNote={({ item }) => (
          <NoteRow
            category={categories.find((category) => category.id === item.categoryId)}
            note={item}
            onArchive={() => void updateFlag(item, 'isArchived')}
            onPress={() => router.push(`/notes/${item.id}`)}
            onToggleFavorite={() => void updateFlag(item, 'isFavorite')}
            onTogglePinned={() => void updateFlag(item, 'isPinned')}
          />
        )}
      />
    </AppScreen>
  );
}
