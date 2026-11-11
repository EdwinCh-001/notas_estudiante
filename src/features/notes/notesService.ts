import { getSupabaseClient } from '@/lib/supabase/client';

import type {
  CategoryDraft,
  DashboardSummary,
  Note,
  NoteCategory,
  NoteDraft,
  NoteQuery,
} from './types';

function mapNote(row: DatabaseNote): Note {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    content: row.content,
    color: row.color,
    isFavorite: row.is_favorite,
    isPinned: row.is_pinned,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row: DatabaseCategory): NoteCategory {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    createdAt: row.created_at,
  };
}

type DatabaseNote =
  import('@/lib/supabase/database.types').Database['public']['Tables']['notes']['Row'];
type DatabaseCategory =
  import('@/lib/supabase/database.types').Database['public']['Tables']['categories']['Row'];

export async function listCategories(
  userId: string,
): Promise<NoteCategory[]> {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data.map(mapCategory);
}

export async function createCategory(
  userId: string,
  draft: CategoryDraft,
): Promise<NoteCategory> {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .insert({
      user_id: userId,
      name: draft.name.trim(),
      color: draft.color,
      icon: draft.icon,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapCategory(data);
}

export async function listNotes(
  userId: string,
  query: NoteQuery = {},
): Promise<Note[]> {
  const client = getSupabaseClient();
  let request = client
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (query.filter === 'favorites') request = request.eq('is_favorite', true);
  if (query.filter === 'pinned') request = request.eq('is_pinned', true);
  if (query.filter === 'archived') request = request.eq('is_archived', true);
  if (query.filter === 'recent') {
    request = request
      .eq('is_archived', false)
      .gte(
        'updated_at',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      );
  }
  if (query.filter !== 'archived' && query.filter !== 'recent') {
    request = request.eq('is_archived', false);
  }
  if (query.categoryId) request = request.eq('category_id', query.categoryId);
  if (query.search?.trim()) {
    const term = query.search.trim().replace(/[%_\\"]/g, '\\$&');
    request = request.or(
      `title.ilike."%${term}%",content.ilike."%${term}%"`,
    );
  }
  if (query.limit) {
    const offset = query.offset ?? 0;
    request = request.range(offset, offset + query.limit - 1);
  }

  const { data, error } = await request;
  if (error) throw error;
  return data.map(mapNote);
}

export async function getNote(
  userId: string,
  noteId: string,
): Promise<Note> {
  const { data, error } = await getSupabaseClient()
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return mapNote(data);
}

export async function createNote(
  userId: string,
  draft: NoteDraft,
): Promise<Note> {
  const { data, error } = await getSupabaseClient()
    .from('notes')
    .insert({
      user_id: userId,
      category_id: draft.categoryId,
      title: draft.title.trim(),
      content: draft.content.trim(),
      color: draft.color,
      is_favorite: draft.isFavorite,
      is_pinned: draft.isPinned,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapNote(data);
}

export async function updateNote(
  userId: string,
  noteId: string,
  draft: NoteDraft,
): Promise<Note> {
  const { data, error } = await getSupabaseClient()
    .from('notes')
    .update({
      category_id: draft.categoryId,
      title: draft.title.trim(),
      content: draft.content.trim(),
      color: draft.color,
      is_favorite: draft.isFavorite,
      is_pinned: draft.isPinned,
    })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return mapNote(data);
}

export async function updateNoteFlags(
  userId: string,
  noteId: string,
  changes: Partial<
    Pick<Note, 'isFavorite' | 'isPinned' | 'isArchived'>
  >,
): Promise<Note> {
  const { data, error } = await getSupabaseClient()
    .from('notes')
    .update({
      ...(changes.isFavorite !== undefined
        ? { is_favorite: changes.isFavorite }
        : {}),
      ...(changes.isPinned !== undefined
        ? { is_pinned: changes.isPinned }
        : {}),
      ...(changes.isArchived !== undefined
        ? { is_archived: changes.isArchived }
        : {}),
    })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return mapNote(data);
}

export async function deleteNote(
  userId: string,
  noteId: string,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummary> {
  const client = getSupabaseClient();
  const [
    { count: totalNotes, error: totalError },
    { count: favoriteNotes, error: favoriteError },
    categories,
    { data: recentRows, error: recentError },
    { data: latest, error: latestError },
  ] = await Promise.all([
    client
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    client
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .eq('is_archived', false),
    listCategories(userId),
    client
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })
      .limit(5),
    client
      .from('notes')
      .select('updated_at')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (totalError) throw totalError;
  if (favoriteError) throw favoriteError;
  if (recentError) throw recentError;
  if (latestError) throw latestError;

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const { count, error } = await client
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('category_id', category.id)
        .eq('is_archived', false);
      if (error) throw error;
      return { ...category, noteCount: count ?? 0 };
    }),
  );

  return {
    totalNotes: totalNotes ?? 0,
    favoriteNotes: favoriteNotes ?? 0,
    totalCategories: categories.length,
    latestUpdate: latest?.updated_at ?? null,
    recentNotes: recentRows.map(mapNote),
    categories: categoriesWithCounts,
  };
}
