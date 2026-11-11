import { getSupabaseClient } from '@/lib/supabase/client';

import type { ProfileDraft, StudentProfile } from './types';

export async function getStudentProfile(userId: string): Promise<StudentProfile> {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    username: data.username,
    email: data.email,
    provider: data.provider,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateStudentProfile(
  userId: string,
  draft: ProfileDraft,
): Promise<StudentProfile> {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .update({
      first_name: draft.firstName.trim() || null,
      last_name: draft.lastName.trim() || null,
      username: draft.username.trim().toLowerCase(),
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    username: data.username,
    email: data.email,
    provider: data.provider,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
