import * as Linking from 'expo-linking';

import { getSupabaseClient } from '@/lib/supabase/client';

import { toAuthOperationError } from './authErrors';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpDetails extends SignInCredentials {
  firstName: string;
  lastName: string;
  username: string;
}

export async function signInWithEmail(
  credentials: SignInCredentials,
): Promise<void> {
  try {
    const { error } = await getSupabaseClient().auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function signUpWithEmail(
  details: SignUpDetails,
  redirectTo?: string,
): Promise<{ emailConfirmationRequired: boolean }> {
  try {
    const { data, error } = await getSupabaseClient().auth.signUp({
      email: details.email.trim(),
      password: details.password,
      options: {
        ...(redirectTo
          ? { emailRedirectTo: redirectTo }
          : { emailRedirectTo: Linking.createURL('/') }),
        data: {
          first_name: details.firstName.trim(),
          last_name: details.lastName.trim(),
          username: details.username.trim().toLowerCase(),
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Supabase no devolvió el usuario recién registrado.');
    }

    return { emailConfirmationRequired: data.session === null };
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  redirectTo?: string,
): Promise<void> {
  try {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: redirectTo ?? Linking.createURL('/reset-password') },
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function updatePassword(password: string): Promise<void> {
  try {
    const { error } = await getSupabaseClient().auth.updateUser({ password });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await getSupabaseClient().auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toAuthOperationError(error);
  }
}
