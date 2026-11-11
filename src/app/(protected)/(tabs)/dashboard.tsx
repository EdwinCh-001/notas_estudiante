import { Link, useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Folder,
  FlaskConical,
  Lightbulb,
  Plus,
  Star,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { AuthMessage } from '@/features/auth/components/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { useAppTheme } from '@/hooks';
import { getStudentProfile } from '@/features/profile/profileService';
import type { StudentProfile } from '@/features/profile/types';
import { getDashboardSummary } from '@/features/notes/notesService';
import type { DashboardSummary, NoteCategory } from '@/features/notes/types';
import {
  AppScreen,
  EmptyState,
  LoadingSkeleton,
} from '@/features/notes/components';

const categoryIcons = {
  book: BookOpen,
  work: BriefcaseBusiness,
  science: FlaskConical,
  ideas: Lightbulb,
  folder: Folder,
} as const;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function displayName(profile: StudentProfile | null): string {
  if (!profile) return '';
  return [profile.firstName, profile.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' ') || profile.username;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { colors } = useAppTheme();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setErrorMessage('');
    setIsLoading(true);
    try {
      const [nextProfile, nextSummary] = await Promise.all([
        getStudentProfile(userId),
        getDashboardSummary(userId),
      ]);
      setProfile(nextProfile);
      setSummary(nextSummary);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo cargar el inicio.',
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

  const userName = displayName(profile);
  const summaryItems = [
    { label: 'Notas', value: summary?.totalNotes ?? '—' },
    { label: 'Favoritas', value: summary?.favoriteNotes ?? '—' },
    { label: 'Categorías', value: summary?.totalCategories ?? '—' },
    {
      label: 'Último cambio',
      value: summary?.latestUpdate
        ? new Date(summary.latestUpdate).toLocaleDateString('es', {
            day: 'numeric',
            month: 'short',
          })
        : '—',
    },
  ];

  return (
    <AppScreen>
      <View className="gap-7">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-overline font-semibold uppercase tracking-widest text-primary">
              STUDENT NOTES
            </Text>
            <Text className="text-title font-bold tracking-tight text-foreground">
              {greeting()}{userName ? `, ${userName.split(' ')[0]}` : ''}.
            </Text>
            <Text className="text-body text-muted-foreground">
              Mantén organizadas tus ideas y actividades académicas.
            </Text>
          </View>
          <Link href="/profile" asChild>
            <Pressable
              accessibilityLabel="Abrir perfil"
              className="h-12 w-12 items-center justify-center rounded-full border border-border bg-card"
            >
              <Text className="text-label font-bold text-primary">
                {userName.slice(0, 1).toUpperCase() || '•'}
              </Text>
            </Pressable>
          </Link>
        </View>
        {errorMessage ? (
          <View className="gap-2">
            <AuthMessage message={errorMessage} />
            <Button
              label="Volver a cargar"
              onPress={() => void load()}
              size="sm"
              variant="outline"
            />
          </View>
        ) : null}

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-heading font-semibold text-foreground">
              Tu espacio
            </Text>
            <Text className="text-caption text-muted-foreground">
              Resumen personal
            </Text>
          </View>
          {isLoading ? (
            <LoadingSkeleton rows={2} />
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {summaryItems.map((item, index) => (
                <Card
                  className="min-h-24 flex-1 basis-[45%] justify-between gap-3"
                  key={item.label}
                  padding="sm"
                >
                  <Text className="text-caption text-muted-foreground">
                    {item.label}
                  </Text>
                  <Text
                    className={`font-semibold text-foreground ${
                      index === 3 ? 'text-body' : 'text-heading'
                    }`}
                    numberOfLines={1}
                  >
                    {item.value}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        <View className="gap-3">
          <Text className="text-heading font-semibold text-foreground">
            Accesos rápidos
          </Text>
          <View className="flex-row gap-2">
            <Button
              className="min-h-12 flex-1 px-2"
              label="Nueva nota"
              leftIcon={<Plus color={colors.primaryForeground} size={17} />}
              onPress={() => router.push('/notes/new')}
              size="sm"
            />
            <Button
              className="min-h-12 flex-1 px-2"
              label="Categoría"
              leftIcon={<Folder color={colors.foreground} size={16} />}
              onPress={() => router.push('/categories/new')}
              size="sm"
              variant="outline"
            />
            <Button
              accessibilityLabel="Ver favoritas"
              className="h-12 w-12 px-0"
              label=""
              leftIcon={<Star color={colors.warning} size={18} />}
              onPress={() =>
                router.push({ pathname: '/notes', params: { filter: 'favorites' } })
              }
              size="sm"
              variant="outline"
            />
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-heading font-semibold text-foreground">
              Categorías
            </Text>
            <Link href="/categories/new" asChild>
              <Pressable className="min-h-10 flex-row items-center gap-1">
                <Text className="text-caption font-semibold text-primary">
                  Añadir
                </Text>
                <ArrowUpRight color={colors.primary} size={15} />
              </Pressable>
            </Link>
          </View>
          {isLoading ? (
            <LoadingSkeleton rows={1} />
          ) : errorMessage ? null : summary?.categories.length ? (
            <ScrollView
              contentContainerStyle={{ gap: 10, paddingRight: 20 }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {summary.categories.map((category) => (
                <CategoryTile
                  category={category}
                  key={category.id}
                  onPress={() =>
                    router.push({
                      pathname: '/notes',
                      params: { categoryId: category.id },
                    })
                  }
                />
              ))}
            </ScrollView>
          ) : (
            <EmptyState
              description="Crea categorías para agrupar tus apuntes por tema."
              icon={<Folder color={colors.primary} size={22} />}
              title="Empieza con una categoría"
              action={
                <Button
                  label="Crear categoría"
                  onPress={() => router.push('/categories/new')}
                  size="sm"
                  variant="outline"
                />
              }
            />
          )}
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-heading font-semibold text-foreground">
              Actividad reciente
            </Text>
            <Link href="/notes" asChild>
              <Pressable className="min-h-10 justify-center">
                <Text className="text-caption font-semibold text-primary">
                  Ver notas
                </Text>
              </Pressable>
            </Link>
          </View>
          {errorMessage ? null : isLoading ? (
            <LoadingSkeleton rows={2} />
          ) : summary?.recentNotes.length ? (
            <View className="gap-0">
              {summary.recentNotes.map((note, index) => (
                <Pressable
                  className="flex-row gap-3 py-2"
                  key={note.id}
                  onPress={() => router.push(`/notes/${note.id}`)}
                >
                  <View className="items-center">
                    <View
                      className="mt-1 h-3 w-3 rounded-full border-2"
                      style={{
                        borderColor: note.color,
                        backgroundColor: `${note.color}33`,
                      }}
                    />
                    {index < summary.recentNotes.length - 1 ? (
                      <View className="mt-1 w-px flex-1 bg-border" />
                    ) : null}
                  </View>
                  <View className="flex-1 gap-1 pb-3">
                    <Text
                      className="text-label font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {note.title}
                    </Text>
                    <Text className="text-overline text-muted-foreground">
                      Modificada{' '}
                      {new Date(note.updatedAt).toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  <ArrowUpRight color={colors.mutedForeground} size={16} />
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              description="Cuando edites una nota, aparecerá aquí."
              icon={<BookOpen color={colors.primary} size={22} />}
              title="Tu actividad aparecerá aquí"
              action={
                <Button
                  label="Crear primera nota"
                  onPress={() => router.push('/notes/new')}
                  size="sm"
                />
              }
            />
          )}
        </View>
      </View>
    </AppScreen>
  );
}

function CategoryTile({
  category,
  onPress,
}: {
  category: NoteCategory & { noteCount: number };
  onPress: () => void;
}) {
  const Icon =
    categoryIcons[category.icon as keyof typeof categoryIcons] ?? Folder;
  return (
    <Pressable
      className="w-36 gap-3 rounded-card border border-border bg-card p-4"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Icon color={category.color} size={18} />
      </View>
      <View className="gap-0.5">
        <Text className="text-label font-semibold text-foreground" numberOfLines={1}>
          {category.name}
        </Text>
        <Text className="text-overline text-muted-foreground">
          {category.noteCount} {category.noteCount === 1 ? 'nota' : 'notas'}
        </Text>
      </View>
    </Pressable>
  );
}
