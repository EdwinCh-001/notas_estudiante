import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { getSupabaseClient } from '@/lib/supabase/client';

import { AuthOperationError, toAuthOperationError } from './authErrors';

export type GoogleOAuthResult =
  | { type: 'success'; callbackUrl: string }
  | { type: 'redirecting' }
  | { type: 'cancelled' };

let inFlightOAuthExchange: {
  code: string;
  promise: Promise<Session>;
} | null = null;
let completedOAuthExchange: {
  code: string;
  session: Session;
  expiresAt: number;
} | null = null;

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpDetails extends SignInCredentials {
  firstName: string;
  lastName: string;
  username: string;
}

export async function signInWithGoogle(): Promise<GoogleOAuthResult> {
  try {
    const isWeb = Platform.OS === 'web';
    const redirectTo = isWeb
      ? new URL('/auth/callback', window.location.origin).toString()
      : Linking.createURL('auth/callback');
    console.log('[Google OAuth] redirectTo:', redirectTo);
    const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw error;
    }

    if (!data.url) {
      throw new AuthOperationError(
        'Supabase no devolvió la dirección para iniciar sesión con Google.',
      );
    }

    if (isWeb) {
      window.location.assign(data.url);
      return { type: 'redirecting' };
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
    );

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { type: 'cancelled' };
    }

    if (result.type !== 'success' || !result.url) {
      throw new AuthOperationError(
        'Google no devolvió un enlace de autenticación válido.',
      );
    }

    return { type: 'success', callbackUrl: result.url };
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function exchangeOAuthCodeForSession(
  code: string,
): Promise<Session> {
  const normalizedCode = code.trim();
  if (!normalizedCode) {
    throw new AuthOperationError(
      'El callback de Google no contiene un código de autenticación.',
    );
  }

  if (
    completedOAuthExchange?.code === normalizedCode &&
    completedOAuthExchange.expiresAt > Date.now()
  ) {
    return completedOAuthExchange.session;
  }

  if (inFlightOAuthExchange?.code === normalizedCode) {
    return inFlightOAuthExchange.promise;
  }

  const promise = getSupabaseClient()
    .auth.exchangeCodeForSession(normalizedCode)
    .then(({ data, error }) => {
      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new AuthOperationError(
          'Supabase no devolvió una sesión para el callback de Google.',
        );
      }

      completedOAuthExchange = {
        code: normalizedCode,
        session: data.session,
        expiresAt: Date.now() + 30_000,
      };
      return data.session;
    })
    .catch((error: unknown) => {
      throw toAuthOperationError(error);
    })
    .finally(() => {
      if (inFlightOAuthExchange?.promise === promise) {
        inFlightOAuthExchange = null;
      }
    });

  inFlightOAuthExchange = { code: normalizedCode, promise };
  return promise;
}

export function parseOAuthCallbackUrl(url: string): {
  code?: string;
  error?: string;
  errorDescription?: string;
} {
  try {
    const parsedUrl = new URL(url);
    const searchParams = new URLSearchParams(parsedUrl.search);
    const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));
    const read = (key: string) =>
      searchParams.get(key) ?? hashParams.get(key) ?? undefined;

    return {
      code: read('code'),
      error: read('error'),
      errorDescription: read('error_description'),
    };
  } catch {
    throw new AuthOperationError(
      'Google devolvió un callback que no es una URL válida.',
    );
  }
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
