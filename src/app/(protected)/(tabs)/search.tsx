import { useFocusEffect, useRouter } from 'expo-router';
import { Clock3, Search, StickyNote, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';
import { listCategories, listNotes } from '@/features/notes/notesService';
import type { Note, NoteCategory, NoteFilter } from '@/features/notes/types';
import {
  AppScreen,
  EmptyState,
  NoteRow,
  NotesFeed,
  ScreenHeading,
} from '@/features/notes/components';

const PAGE_SIZE = 30;
const searchFilters: { key: NoteFilter; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'recent', label: 'Recientes' },
  { key: 'favorites', label: 'Favoritas' },
  { key: 'archived', label: 'Archivadas' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { colors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<NoteFilter>('all');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const hasActiveQuery = Boolean(search.trim() || filter !== 'all' || categoryId);

  useEffect(() => {
    if (!userId || !hasActiveQuery) return;
    let active = true;
    const timer = setTimeout(() => {
      setIsLoading(true);
      setHasMore(false);
      setErrorMessage('');
      void listNotes(userId, {
        filter,
        categoryId,
        search,
        limit: PAGE_SIZE,
      })
        .then((result) => {
          if (active) {
            setNotes(result);
            setHasMore(result.length === PAGE_SIZE);
          }
        })
        .catch((error: unknown) => {
          if (active) {
            setErrorMessage(
              error instanceof Error ? error.message : 'No se pudo completar la búsqueda.',
            );
          }
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 220);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [categoryId, filter, hasActiveQuery, search, userId]);

  const loadMore = async () => {
    if (!userId || !hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const next = await listNotes(userId, {
        filter,
        categoryId,
        search,
        limit: PAGE_SIZE,
        offset: notes.length,
      });
      setNotes((current) => [...current, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar más resultados.',
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const clearSearch = () => {
    setSearch('');
    if (filter === 'all' && !categoryId) setIsLoading(false);
  };

  const header = (
    <View className="mb-5 gap-5">
      <ScreenHeading
        title="Buscar"
        subtitle="Encuentra una idea en todo tu espacio."
      />
      <View className="min-h-14 flex-row items-center gap-3 rounded-card border border-primary/40 bg-card px-4">
        <Search color={colors.primary} size={20} />
        <TextInput
          autoCorrect={false}
          className="flex-1 py-3 text-body text-foreground"
          onChangeText={(value) => {
            setSearch(value);
            if (!value.trim() && filter === 'all' && !categoryId) {
              setIsLoading(false);
            }
          }}
          placeholder="Buscar notas..."
          placeholderTextColor={colors.mutedForeground}
          returnKeyType="search"
          value={search}
        />
        {search ? (
          <Pressable
            accessibilityLabel="Limpiar búsqueda"
            hitSlop={8}
            onPress={clearSearch}
          >
            <X color={colors.mutedForeground} size={18} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {searchFilters.map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              className={`min-h-10 justify-center rounded-badge border px-4 ${
                active ? 'border-primary bg-primary' : 'border-border bg-card'
              }`}
              key={item.key}
              onPress={() => {
                setFilter(item.key);
                if (item.key === 'all' && !search.trim() && !categoryId) {
                  setIsLoading(false);
                }
              }}
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
              !categoryId ? 'bg-accent-soft' : ''
            }`}
            onPress={() => {
              setCategoryId(undefined);
              if (!search.trim() && filter === 'all') setIsLoading(false);
            }}
          >
            <Text className="text-overline font-semibold text-foreground-secondary">
              Todas
            </Text>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              className={`min-h-9 flex-row items-center gap-1.5 rounded-badge px-3 ${
                categoryId === category.id ? 'bg-accent-soft' : ''
              }`}
              key={category.id}
              onPress={() => setCategoryId(category.id)}
            >
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <Text className="text-overline text-foreground-secondary">
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
    <EmptyState
      description="Revisa tu conexión e inténtalo de nuevo."
      icon={<Search color={colors.primary} size={21} />}
      title="No se pudo completar la búsqueda"
    />
  ) : hasActiveQuery ? (
    <EmptyState
      description="Prueba con otras palabras o filtros."
      icon={<Search color={colors.primary} size={21} />}
      title="No encontramos resultados"
    />
  ) : (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Clock3 color={colors.mutedForeground} size={17} />
        <Text className="text-caption text-muted-foreground">
          Escribe para buscar en títulos y contenido.
        </Text>
      </View>
      <EmptyState
        description="Las coincidencias aparecerán aquí al instante."
        icon={<StickyNote color={colors.primary} size={21} />}
        title="Tu búsqueda empieza aquí"
      />
    </View>
  );

  return (
    <AppScreen scroll={false}>
      <NotesFeed
        empty={empty}
        hasMore={hasMore}
        header={header}
        loading={hasActiveQuery && isLoading}
        loadingMore={isLoadingMore}
        notes={hasActiveQuery ? notes : []}
        onLoadMore={() => void loadMore()}
        renderNote={({ item }) => (
          <NoteRow
            category={categories.find((category) => category.id === item.categoryId)}
            note={item}
            onPress={() => router.push(`/notes/${item.id}`)}
          />
        )}
      />
    </AppScreen>
  );
}
