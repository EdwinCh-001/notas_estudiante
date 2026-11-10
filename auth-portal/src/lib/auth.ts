import type { EmailOtpType, Session } from '@supabase/supabase-js';

import { supabase } from './supabase';

export type AuthCallback = {
  session: Session | null;
  type: string | null;
};

const otpTypes: EmailOtpType[] = [
  'email',
  'email_change',
  'invite',
  'magiclink',
  'recovery',
  'signup',
];

const callbackRequests = new Map<string, Promise<AuthCallback | null>>();

export function getAuthErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    const message = error.message.toLowerCase();
    if (message.includes('expired') || message.includes('otp_expired')) {
      return 'Este enlace ha caducado. Solicita uno nuevo para continuar.';
    }
    if (
      message.includes('invalid') ||
      message.includes('token') ||
      message.includes('verifier')
    ) {
      return 'El enlace no es válido o ya fue utilizado. Solicita uno nuevo.';
    }
  }

  return 'No pudimos completar la solicitud. Comprueba tu conexión e inténtalo de nuevo.';
}

export function isExpiredAuthError(error: unknown): boolean {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('message' in error) ||
    typeof error.message !== 'string'
  ) {
    return false;
  }

  return /expired|otp_expired|flow_state_expired/i.test(error.message);
}

export function processAuthCallback(url: URL): Promise<AuthCallback | null> {
  const key = url.href;
  const existingRequest = callbackRequests.get(key);
  if (existingRequest) return existingRequest;

  const request = processAuthCallbackOnce(url);
  callbackRequests.set(key, request);
  void request.then(
    () => callbackRequests.delete(key),
    () => callbackRequests.delete(key),
  );
  return request;
}

async function processAuthCallbackOnce(
  url: URL,
): Promise<AuthCallback | null> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const query = new URLSearchParams(url.search);
  const hash = new URLSearchParams(url.hash.slice(1));
  const read = (key: string) => query.get(key) ?? hash.get(key);
  const authError = read('error_description') ?? read('error');

  if (authError) {
    throw new Error(authError);
  }

  const type = read('type');
  const tokenHash = read('token_hash') ?? read('token');

  if (tokenHash) {
    if (!type || !otpTypes.includes(type as EmailOtpType)) {
      throw new Error('El enlace no contiene un tipo de verificación válido.');
    }

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (error) {
      throw error;
    }

    return { session: data.session, type };
  }

  const code = read('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return { session: data.session, type };
  }

  const accessToken = read('access_token');
  const refreshToken = read('refresh_token');
  if (accessToken || refreshToken) {
    if (!accessToken || !refreshToken) {
      throw new Error('El enlace de autenticación está incompleto.');
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    return { session: data.session, type };
  }

  return null;
}

export function clearCallbackFromAddressBar(pathname: string): void {
  window.history.replaceState({}, document.title, pathname);
}

const recoveryMarkerKey = 'auth-portal.recovery-verified-at';
const recoveryMarkerLifetimeMs = 30 * 60 * 1000;

export function markRecoverySessionVerified(): void {
  window.sessionStorage.setItem(recoveryMarkerKey, String(Date.now()));
}

export function clearRecoverySessionMarker(): void {
  window.sessionStorage.removeItem(recoveryMarkerKey);
}

export async function hasValidRecoverySession(): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  const verifiedAt = Number(window.sessionStorage.getItem(recoveryMarkerKey));
  if (
    !Number.isFinite(verifiedAt) ||
    verifiedAt > Date.now() ||
    Date.now() - verifiedAt > recoveryMarkerLifetimeMs
  ) {
    clearRecoverySessionMarker();
    return false;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  if (!data.session) {
    clearRecoverySessionMarker();
    return false;
  }

  return true;
}
